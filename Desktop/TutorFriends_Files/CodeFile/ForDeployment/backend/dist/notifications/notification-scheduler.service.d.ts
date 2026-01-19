import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Session } from '../database/entities/session.entity';
import { NotificationsService } from './notifications.service';
export declare class NotificationSchedulerService implements OnModuleInit {
    private readonly sessionRepository;
    private readonly notificationsService;
    private readonly schedules;
    constructor(sessionRepository: Repository<Session>, notificationsService: NotificationsService);
    onModuleInit(): Promise<void>;
    checkUpcomingSessions(): Promise<void>;
    private calculateNotificationTime;
    private shouldSendNotification;
    private generateNotificationMessage;
}
