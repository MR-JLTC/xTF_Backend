import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('traffic_logs')
export class TrafficLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip_address: string;

    @Column()
    activity: string;

    @Column({ nullable: true })
    user_email: string;

    @Column({ nullable: true })
    method: string;

    @Column({ nullable: true })
    url: string;

    @Column({ nullable: true })
    user_agent: string;

    @CreateDateColumn()
    timestamp: Date;
}
