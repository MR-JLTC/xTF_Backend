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

            // **NEW: Mark pending messages as DELIVERED**
            const deliveredMessages = await this.chatService.markMessagesAsDelivered(Number(userId));
            if (deliveredMessages.length > 0) {
                console.log(`Socket - Marked ${deliveredMessages.length} messages as delivered for user ${userId}`);
                // Notify senders that their messages were delivered
                // We need to group by sender to emit efficiently, or just emit to each message's sender
                deliveredMessages.forEach(msg => {
                    this.server.to(`user_${msg.sender_id}`).emit('messageStatusUpdate', {
                        messageId: msg.message_id,
                        conversationId: msg.conversation_id,
                        status: 'delivered'
                    });
                });
            }

        } catch (e) {
            console.log('Socket - Invalid token, disconnecting', e.message);
            // Emit error to client before disconnecting so they know WHY
            client.emit('auth_error', { message: e.message || 'Unauthorized' });
            // Small delay to ensure packet is sent
            setTimeout(() => {
                client.disconnect();
            }, 500);
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = client.data.user?.sub;
        if (userId) {
            const lastActive = new Date();
            await this.chatService.updateUserLastActive(Number(userId));
            this.server.emit('user_status', { userId, status: 'offline', lastActive });
        }
        console.log(`Socket - Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinConversation')
    handleJoinRoom(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
        const roomId = String(data.conversationId);
        client.join(roomId);
        console.log(`User ${client.data.user?.sub} joined room ${roomId}`);
        return { event: 'joinedRoom', data: roomId };
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { conversationId: string; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId = Number(client.data.user.sub);
        const roomName = String(data.conversationId);
        console.log(`ChatGateway - Received sendMessage from ${senderId} for conv ${roomName}`);

        try {
            // Determine Partner ID to check online status
            const conversation = await this.chatService.getConversationById(data.conversationId);
            if (!conversation) throw new Error('Conversation not found');

            const partnerId = Number(conversation.tutor_id) === Number(senderId)
                ? Number(conversation.tutee_id)
                : Number(conversation.tutor_id);

            // Check if partner is online (in their personal room)
            // Note: This check relies on the partner being joined to 'user_{partnerId}' which we do in handleConnection
            const isPartnerOnline = this.server.sockets.adapter.rooms.get(`user_${partnerId}`)?.size > 0;
            const initialStatus = isPartnerOnline ? 'delivered' : 'sent';

            const message = await this.chatService.sendMessage(senderId, data.conversationId, data.content, initialStatus);
            console.log(`ChatGateway - Message saved: ${message.message_id} (${initialStatus}). Broadcasting...`);

            // Emit to the conversation room
            this.server.to(roomName).emit('newMessage', message);

            // Also explicitly notify the other participant's private user room
            if (conversation) {
                this.server.to(`user_${partnerId}`).emit('newMessage', message);
            }

            return message;
        } catch (error) {
            console.error('SendMessage error:', error);
            return { error: error.message };
        }
    }

    @SubscribeMessage('markSeen')
    async handleMarkSeen(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const userId = Number(client.data.user.sub);
        const conversationId = data.conversationId;
        console.log(`ChatGateway - Marking messages seen for conv ${conversationId} by user ${userId}`);

        const seenMessages = await this.chatService.markMessagesAsSeen(conversationId, userId);

        if (seenMessages.length > 0) {
            // Notify the SENDER of these messages that they have been seen
            // The sender of these messages is the OTHER person in the conversation
            // We can iterate or just emit to the conversation room (but filter out self?)
            // Or emit to the specific user room of the message sender.

            // Since all these messages likely belong to the partner, we can just find one message and get sender_id,
            // or just broadcast to the conversation room "messagesSeen" event.

            // Broadcasting to conversation room is easiest for real-time update on both ends
            this.server.to(conversationId).emit('messagesSeen', {
                conversationId,
                messageIds: seenMessages.map(m => m.message_id),
                seenBy: userId,
                seenAt: new Date()
            });

            // Also notify the specific partner room if they are not in the conversation room for some reason (e.g. browsing list)
            const partnerId = seenMessages[0].sender_id; // Sender of the message is the one who needs to know it's seen
            this.server.to(`user_${partnerId}`).emit('messagesSeen', {
                conversationId,
                messageIds: seenMessages.map(m => m.message_id),
                seenBy: userId,
                seenAt: new Date()
            });
        }
    }

    @SubscribeMessage('typing')
    handleTyping(@MessageBody() data: { conversationId: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
        const senderId = client.data.user.sub;
        client.to(data.conversationId).emit('typing', { userId: senderId, isTyping: data.isTyping });
    }
}
