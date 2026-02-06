import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['tutor_id', 'tutee_id'], { unique: true }) // Ensure only one conversation per pair
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    conversation_id: string;

    @Column()
    tutor_id: number;

    @Column()
    tutee_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'tutor_id' })
    tutor: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'tutee_id' })
    tutee: User;

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];

    @Column({ nullable: true })
    last_message_content: string;

    @Column({ nullable: true })
    last_message_sender_id: number;

    @Column({ nullable: true })
    last_message_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
