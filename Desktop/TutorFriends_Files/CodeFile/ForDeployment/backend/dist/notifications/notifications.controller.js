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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getUpcomingSessionNotifications(userId, userType) {
        try {
            const notifications = await this.notificationsService.getUpcomingSessionNotifications(userId, userType);
            return {
                success: true,
                data: notifications,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to fetch notifications',
                error: error.message,
            };
        }
    }
    async markNotificationAsRead(notificationId) {
        try {
            const id = parseInt(notificationId, 10);
            if (isNaN(id))
                throw new Error('Invalid notification ID');
            await this.notificationsService.markNotificationAsRead(id);
            return {
                success: true,
                message: 'Notification marked as read',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message,
            };
        }
    }
    async markAllNotificationsAsRead(userId) {
        try {
            await this.notificationsService.markAllAsRead(userId);
            return {
                success: true,
                message: 'All notifications marked as read',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to mark all notifications as read',
                error: error.message,
            };
        }
    }
    async deleteNotification(notificationId) {
        try {
            const id = parseInt(notificationId, 10);
            if (isNaN(id))
                throw new Error('Invalid notification ID');
            await this.notificationsService.deleteNotification(id);
            return {
                success: true,
                message: 'Notification deleted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to delete notification',
                error: error.message,
            };
        }
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('upcoming-sessions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('userType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUpcomingSessionNotifications", null);
__decorate([
    (0, common_1.Patch)(':notificationId/read'),
    __param(0, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Delete)(':notificationId'),
    __param(0, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map