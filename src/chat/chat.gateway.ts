import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust production CORS later
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                console.log('Socket - No token provided, disconnecting');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.data.user = payload;

            const userId = payload.sub; // typically user_id
            const role = payload.role || payload.user_type;

            console.log(`Socket - User configured: ${userId} (${role})`);

            // Join a room specific to this user for targeted events (like incoming call/message)
            client.join(`user_${userId}`);

            // Update status (optional: can implement online status here)
            this.server.emit('user_status', { userId, status: 'online' });

        } catch (e) {
            console.log('Socket - Invalid token, disconnecting', e.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.user?.sub;
        if (userId) {
            this.server.emit('user_status', { userId, status: 'offline' });
        }
        console.log(`Socket - Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinConversation')
    handleJoinRoom(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
        client.join(data.conversationId);
        console.log(`User ${client.data.user?.sub} joined room ${data.conversationId}`);
        return { event: 'joinedRoom', data: data.conversationId };
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { conversationId: string; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId = Number(client.data.user.sub);
        try {
            const message = await this.chatService.sendMessage(senderId, data.conversationId, data.content);

            // Emit to room (receivers)
            this.server.to(data.conversationId).emit('newMessage', message);

            return message;
        } catch (error) {
            console.error('SendMessage error:', error);
            return { error: error.message };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(@MessageBody() data: { conversationId: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
        const senderId = client.data.user.sub;
        client.to(data.conversationId).emit('typing', { userId: senderId, isTyping: data.isTyping });
    }
}
