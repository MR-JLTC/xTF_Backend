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
        origin: [
            'http://localhost:3001',
            'http://192.168.41.24:3001',
            'https://tutorfriends.online',
            'https://www.tutorfriends.online',
            'https://tutorfriends.onrender.com',
            'https://xtf-backend-1.onrender.com'
        ],
        credentials: true,
        methods: ['GET', 'POST'],
    },
    transports: ['websocket'], // Force WebSocket to avoid polling issues on Render
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        const BUILD_ID = '2026-02-06-1805';
        console.log(`\n=== Socket - [Build ${BUILD_ID}] Connection Attempt: ${client.id} ===`);
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            console.log('Socket - Handshake Auth Token Present:', !!token);

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

            // Join a room specific to this user for targeted events
            client.join(`user_${userId}`);

            // NEW: Automatically join rooms for all existing conversations for this user
            const conversations = await this.chatService.getConversations(Number(userId));
            conversations.forEach(conv => {
                client.join(conv.conversation_id);
                console.log(`Socket - User ${userId} auto-joined room ${conv.conversation_id}`);
            });

            // Update status
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
        console.log(`ChatGateway - Received sendMessage from ${senderId} for conv ${data.conversationId}`);
        console.log(`ChatGateway - Client ${client.id} rooms:`, Array.from(client.rooms));

        try {
            const message = await this.chatService.sendMessage(senderId, data.conversationId, data.content);
            console.log(`ChatGateway - Message saved: ${message.message_id}. Broadcasting to room ${data.conversationId}`);

            // Emit to the conversation room
            this.server.to(data.conversationId).emit('newMessage', message);

            // Also explicitly notify the other participant's private user room
            const conversation = await this.chatService.getConversationById(data.conversationId);
            if (conversation) {
                const partnerId = Number(conversation.tutor_id) === Number(senderId)
                    ? Number(conversation.tutee_id)
                    : Number(conversation.tutor_id);

                console.log(`ChatGateway - Detected partnerId: ${partnerId} (Sender: ${senderId})`);
                this.server.to(`user_${partnerId}`).emit('newMessage', message);
                console.log(`ChatGateway - Explicitly notified partner room: user_${partnerId}`);
            }

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
