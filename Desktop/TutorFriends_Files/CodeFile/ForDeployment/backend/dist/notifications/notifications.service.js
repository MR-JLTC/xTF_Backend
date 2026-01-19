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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../database/entities/notification.entity");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async getUpcomingSessionNotifications(userId, userType) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysFromNow = new Date(startOfDay);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const receiver = typeof userId === 'string' ? Number(userId) : userId;
        return await this.notificationRepository.find({
            where: {
                receiver_id: receiver,
                userType: userType,
                sessionDate: (0, typeorm_2.Between)(startOfDay, thirtyDaysFromNow),
            },
            order: {
                sessionDate: 'ASC',
            },
        });
    }
    async getNotifications(userId, role) {
        const relations = role === 'admin' ? [] : ['booking', 'booking.tutor', 'booking.tutor.user', 'booking.student'];
        return await this.notificationRepository.find({
            where: { receiver_id: userId, userType: role },
            relations,
            order: { timestamp: 'DESC' },
            take: 50
        });
    }
    async markNotificationAsRead(notificationId) {
        return await this.notificationRepository.update(notificationId, { read: true });
    }
    async markAllAsRead(userId) {
        const receiver = typeof userId === 'string' ? Number(userId) : userId;
        return await this.notificationRepository.update({ receiver_id: receiver }, { read: true });
    }
    async deleteNotification(notificationId) {
        return await this.notificationRepository.delete(notificationId);
    }
    async createNotification(data) {
        return await this.notificationRepository.save({
            userId: data.userId,
            userType: data.userType,
            session: { session_id: data.sessionId },
            message: data.message,
            timestamp: new Date(),
            read: false,
            sessionDate: data.sessionDate,
            subjectName: data.subjectName,
            receiver_id: data.receiverId ?? (data.userId ? Number(data.userId) : undefined),
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map