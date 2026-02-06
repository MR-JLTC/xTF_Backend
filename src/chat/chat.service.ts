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

    async sendMessage(senderId: number, conversationId: string, content: string) {
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
            is_read: false
        });

        const savedMessage = await this.messageRepository.save(message);

        // Update conversation last message
        conversation.last_message_content = content;
        conversation.last_message_at = new Date();
        await this.conversationRepository.save(conversation);

        // Return with sender for UI
        return this.messageRepository.findOne({
            where: { message_id: savedMessage.message_id },
            relations: ['sender']
        });
    }
}
