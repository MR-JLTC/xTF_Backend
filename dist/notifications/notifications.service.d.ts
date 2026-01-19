import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
interface CreateNotificationDto {
    userId: string;
    userType: 'tutor' | 'tutee';
    sessionId: number;
    message: string;
    sessionDate: Date;
    subjectName: string;
    receiverId?: number;
}
export declare class NotificationsService {
    private readonly notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    getUpcomingSessionNotifications(userId: string | number, userType: 'tutor' | 'tutee'): Promise<Notification[]>;
    getNotifications(userId: number, role: 'tutor' | 'tutee' | 'admin'): Promise<Notification[]>;
    markNotificationAsRead(notificationId: number): Promise<import("typeorm").UpdateResult>;
    markAllAsRead(userId: string | number): Promise<import("typeorm").UpdateResult>;
    deleteNotification(notificationId: number): Promise<import("typeorm").DeleteResult>;
    createNotification(data: CreateNotificationDto): Promise<{
        userId: string;
        userType: "tutor" | "tutee";
        session: {
            session_id: number;
        };
        message: string;
        timestamp: Date;
        read: false;
        sessionDate: Date;
        subjectName: string;
        receiver_id: number;
    } & Notification>;
}
export {};
