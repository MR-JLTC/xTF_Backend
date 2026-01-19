"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../database/entities/session.entity");
const notifications_service_1 = require("./notifications.service");
const schedule_1 = require("@nestjs/schedule");
let NotificationSchedulerService = class NotificationSchedulerService {
    constructor(sessionRepository, notificationsService) {
        this.sessionRepository = sessionRepository;
        this.notificationsService = notificationsService;
        this.schedules = [
            { days: 3 },
            { days: 2 },
            { days: 1 },
            { hours: 12 },
            { hours: 6 },
            { hours: 1 },
            { minutes: 30 }
        ];
    }
    async onModuleInit() {
        await this.checkUpcomingSessions();
    }
    async checkUpcomingSessions() {
        const now = new Date();
        const sessions = await this.sessionRepository.find({
            where: {
                status: 'scheduled',
                start_time: (0, typeorm_2.MoreThanOrEqual)(now)
            },
            relations: ['tutor', 'student', 'subject']
        });
        for (const session of sessions) {
            const sessionStartTime = new Date(session.start_time);
            for (const schedule of this.schedules) {
                const notificationTime = this.calculateNotificationTime(sessionStartTime, schedule);
                if (this.shouldSendNotification(now, notificationTime)) {
                    await this.notificationsService.createNotification({
                        userId: session.tutor.user.user_id.toString(),
                        userType: 'tutor',
                        sessionId: session.session_id,
                        message: this.generateNotificationMessage(schedule, session.subject.subject_name),
                        sessionDate: session.start_time,
                        subjectName: session.subject.subject_name,
                        receiverId: session.tutor.user.user_id
                    });
                    await this.notificationsService.createNotification({
                        userId: session.student.user.user_id.toString(),
                        userType: 'tutee',
                        sessionId: session.session_id,
                        message: this.generateNotificationMessage(schedule, session.subject.subject_name),
                        sessionDate: session.start_time,
                        subjectName: session.subject.subject_name,
                        receiverId: session.student.user.user_id
                    });
                }
            }
        }
    }
    calculateNotificationTime(sessionTime, schedule) {
        const notificationTime = new Date(sessionTime);
        if (schedule.days) {
            notificationTime.setDate(notificationTime.getDate() - schedule.days);
        }
        if (schedule.hours) {
            notificationTime.setHours(notificationTime.getHours() - schedule.hours);
        }
        if (schedule.minutes) {
            notificationTime.setMinutes(notificationTime.getMinutes() - schedule.minutes);
        }
        return notificationTime;
    }
    shouldSendNotification(now, notificationTime) {
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        return notificationTime >= fiveMinutesAgo && notificationTime <= now;
    }
    generateNotificationMessage(schedule, subjectName) {
        if (schedule.days) {
            return `Upcoming ${subjectName} session in ${schedule.days} day${schedule.days > 1 ? 's' : ''}`;
        }
        if (schedule.hours) {
            return `Upcoming ${subjectName} session in ${schedule.hours} hour${schedule.hours > 1 ? 's' : ''}`;
        }
        if (schedule.minutes) {
            return `Upcoming ${subjectName} session in ${schedule.minutes} minutes`;
        }
        return `Upcoming ${subjectName} session`;
    }
};
exports.NotificationSchedulerService = NotificationSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationSchedulerService.prototype, "checkUpcomingSessions", null);
exports.NotificationSchedulerService = NotificationSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], NotificationSchedulerService);
//# sourceMappingURL=notification-scheduler.service.js.map