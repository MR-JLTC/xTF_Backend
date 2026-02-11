import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createConversation(user1Id: number, user2Id: number) {
        const user1 = await this.userRepository.findOne({ where: { user_id: user1Id } });
        const user2 = await this.userRepository.findOne({ where: { user_id: user2Id } });

        if (!user1 || !user2) {
            throw new NotFoundException('User not found');
        }

        // Role Enforcement: Tutor <-> Tutee only
        // user_type can be 'tutor', 'tutee', 'student', 'admin'. We map 'student' to 'tutee' for logic.
        const role1 = user1.user_type === 'student' ? 'tutee' : user1.user_type;
        const role2 = user2.user_type === 'student' ? 'tutee' : user2.user_type;

        if (role1 === role2 && role1 !== 'admin') { // Admins might bridge, but req says Strict Rules. Let's assume strict.
            // Actually strictly follow: Tutor <-> Tutee only.
            throw new ForbiddenException('Chats are only allowed between a Tutor and a Tutee.');
        }

        // Specifically block Tutor-Tutor and Tutee-Tutee
        if ((role1 === 'tutor' && role2 === 'tutor') || (role1 === 'tutee' && role2 === 'tutee')) {
            throw new ForbiddenException('Chats are only allowed between a Tutor and a Tutee.');
        }

        // Identify who is who
        let tutorId = role1 === 'tutor' ? user1Id : user2Id;
        let tuteeId = role1 === 'tutee' ? user1Id : user2Id;

        // Check existing
        let conversation = await this.conversationRepository.findOne({
            where: { tutor_id: tutorId, tutee_id: tuteeId },
            relations: ['tutor', 'tutee']
        });

        if (!conversation) {
            conversation = this.conversationRepository.create({
                tutor_id: tutorId,
                tutee_id: tuteeId,
                last_message_at: new Date()
            });
            await this.conversationRepository.save(conversation);
            // Re-fetch to populate relations
            conversation = await this.conversationRepository.findOne({
                where: { conversation_id: conversation.conversation_id },
                relations: ['tutor', 'tutee']
            });
        }

        return conversation;
    }

    async getConversationById(conversationId: string) {
        return this.conversationRepository.findOne({
            where: { conversation_id: conversationId },
            relations: ['tutor', 'tutee']
        });
    }

    async getConversations(userId: number) {
        // A user can be either the tutor or the tutee in a conversation
        return this.conversationRepository.find({
            where: [
                { tutor_id: userId },
                { tutee_id: userId }
            ],
            relations: ['tutor', 'tutee'],
            order: { last_message_at: 'DESC' }
        });
    }

    async getMessages(conversationId: string) {
        return this.messageRepository.find({
            where: { conversation_id: conversationId },
            relations: ['sender'],
            order: { created_at: 'ASC' }
        });
    }



    async sendMessage(senderId: number, conversationId: string, content: string, initialStatus: string = 'sent') {
        const conversation = await this.conversationRepository.findOne({ where: { conversation_id: conversationId } });
        if (!conversation) throw new NotFoundException('Conversation not found');

        // Verify sender is part of conversation
        if (conversation.tutor_id !== senderId && conversation.tutee_id !== senderId) {
            throw new ForbiddenException('You are not part of this conversation');
        }

        const message = this.messageRepository.create({
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            is_read: false,
            status: initialStatus
        });

        const savedMessage = await this.messageRepository.save(message);

        // Update conversation last message
        conversation.last_message_content = content;
        conversation.last_message_sender_id = senderId;
        conversation.last_message_at = new Date();
        await this.conversationRepository.save(conversation);

        // Return with sender for UI
        return this.messageRepository.findOne({
            where: { message_id: savedMessage.message_id },
            relations: ['sender']
        });
    }

    async markMessagesAsDelivered(userId: number) {
        // Find all messages sent TO this user that are currently 'sent'
        // We need to find conversations where this user is a participant
        // efficient way: find messages directly where conversation has this user as participant AND sender is NOT this user

        // Since we don't have a direct recursive relation easily accessbile in one query without join,
        // we can iterate through conversations or use a custom query.
        // But TypeORM 'Where' on relations is supported.

        // Actually, better logic: Find all messages where sender is NOT me, and I am part of the conversation.
        // A simpler approach for MVP:
        // When user connects, we get all their conversations.
        // For each conversation, find messages NOT sent by them, with status 'sent', and update to 'delivered'.

        const conversations = await this.getConversations(userId);
        const conversationIds = conversations.map(c => c.conversation_id);

        if (conversationIds.length === 0) return [];

        // Update messages in these conversations where sender != userId and status = 'sent'
        // We need to know which ones were updated to notify senders?
        // For simplicity/performance, we can just update all relevant ones.
        // But to notify senders, we might want to return the updated messages or just their IDs.

        // Let's do a bulk update for performance, but we lose the specific IDs to notify specific senders easily.
        // Alternative: Find then update.

        const messagesToUpdate = await this.messageRepository.createQueryBuilder('message')
            .where('message.conversation_id IN (:...ids)', { ids: conversationIds })
            .andWhere('message.sender_id != :userId', { userId })
            .andWhere('message.status = :status', { status: 'sent' })
            .getMany();

        if (messagesToUpdate.length > 0) {
            await this.messageRepository.update(
                messagesToUpdate.map(m => m.message_id),
                { status: 'delivered' }
            );
        }

        return messagesToUpdate;
    }

    async markMessagesAsSeen(conversationId: string, userId: number) {
        // Mark all messages in this conversation NOT sent by me as seen
        const messagesToUpdate = await this.messageRepository.createQueryBuilder('message')
            .where('message.conversation_id = :conversationId', { conversationId })
            .andWhere('message.sender_id != :userId', { userId })
            .andWhere('message.status != :status', { status: 'seen' }) // Update sent or delivered
            .getMany();

        if (messagesToUpdate.length > 0) {
            await this.messageRepository.update(
                messagesToUpdate.map(m => m.message_id),
                { status: 'seen', is_read: true }
            );
        }

        return messagesToUpdate;
    }

    async updateUserLastActive(userId: number) {
        await this.userRepository.update({ user_id: userId }, { last_active_at: new Date() });
    }
}
