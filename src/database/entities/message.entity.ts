import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    message_id: string;

    @Column()
    conversation_id: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @Column()
    sender_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @Column('text')
    content: string;

    @Column({ default: false })
    is_read: boolean;

    @Column({ default: 'sent' }) // sent, delivered, seen
    status: string;

    @CreateDateColumn()
    created_at: Date;
}
