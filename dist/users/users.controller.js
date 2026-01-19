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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
const users_service_1 = require("./users.service");
const tutors_service_1 = require("../tutors/tutors.service");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UsersController = class UsersController {
    constructor(usersService, tutorsService) {
        this.usersService = usersService;
        this.tutorsService = tutorsService;
    }
    async findAll() {
        const users = await this.usersService.findAll();
        return users.map(u => ({
            user_id: u.user_id,
            name: u.name,
            email: u.email,
            profile_image_url: u.profile_image_url,
            university_id: u.student_profile?.university_id || u.tutor_profile?.university_id || null,
            course_id: u.student_profile?.course_id || u.tutor_profile?.course_id || null,
            university_name: u.student_profile?.university?.name || u.tutor_profile?.university?.name || 'N/A',
            university: u.student_profile?.university || u.tutor_profile?.university || null,
            course: u.student_profile?.course || u.tutor_profile?.course || null,
            status: u.status,
            created_at: u.created_at,
            role: u.admin_profile ? 'admin' : (u.tutor_profile ? 'tutor' : 'student'),
            tutor_profile: u.tutor_profile ? {
                tutor_id: u.tutor_profile.tutor_id,
                status: u.tutor_profile.status,
                activity_status: u.tutor_profile.activity_status ?? 'offline'
            } : null
        }));
    }
    async moveOverdueBookingsToSessions() {
        return this.usersService.moveOverdueBookingsToSessions();
    }
    async testAuth() {
        console.log('=== TEST AUTH ENDPOINT ===');
        return { message: 'Authentication successful', timestamp: new Date().toISOString() };
    }
    async updateStatus(id, body) {
        return this.usersService.updateStatus(+id, body.status);
    }
    async resetPassword(id, body) {
        return this.usersService.resetPassword(+id, body.newPassword);
    }
    async updateUser(id, body) {
        return this.usersService.updateUser(+id, body);
    }
    async deleteUser(id) {
        return this.usersService.deleteUser(+id);
    }
    async uploadProfileImage(id, file) {
        console.log('=== PROFILE IMAGE UPLOAD DEBUG ===');
        console.log('User ID:', id);
        console.log('File received:', file);
        console.log('File filename:', file?.filename);
        const userId = parseInt(id);
        const filename = file.filename;
        const filePath = path.join('user_profile_images', filename);
        console.log('Parsed user ID:', userId);
        console.log('Generated filename:', filename);
        console.log('File path:', filePath);
        try {
            const oldFiles = fs.readdirSync(path.join(process.cwd(), 'user_profile_images'));
            const oldFile = oldFiles.find(f => f.startsWith(`userProfile_${userId}`));
            if (oldFile && oldFile !== filename) {
                const oldFilePath = path.join(process.cwd(), 'user_profile_images', oldFile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                    console.log(`Deleted old profile image: ${oldFile}`);
                }
            }
        }
        catch (error) {
            console.error('Error deleting old profile image:', error);
        }
        const dbUrl = `user_profile_images/${filename}`;
        console.log('Updating database with URL:', dbUrl);
        await this.usersService.updateUser(userId, {
            profile_image_url: dbUrl
        });
        console.log('Database updated successfully');
        console.log('=== END PROFILE IMAGE UPLOAD DEBUG ===');
        return {
            message: 'Profile image uploaded successfully',
            profile_image_url: dbUrl
        };
    }
    async setPlaceholderProfileImage(id) {
        const userId = parseInt(id);
        return {
            message: 'Placeholder profile image set successfully',
            profile_image_url: null
        };
    }
    async getMyBookings(req) {
        const userId = req.user?.user_id;
        return this.tutorsService.getStudentBookingRequests(userId);
    }
    async getBookingsForUser(id) {
        return this.tutorsService.getStudentBookingRequests(+id);
    }
    async getNotifications(req) {
        const userId = req.user?.user_id;
        return this.usersService.getNotifications(userId);
    }
    async getUnreadCount(req) {
        const userId = req.user?.user_id;
        return this.usersService.getUnreadNotificationCount(userId);
    }
    async getUpcomingSessions(req) {
        const userId = req.user?.user_id;
        return this.usersService.hasUpcomingSessions(userId);
    }
    async getUpcomingSessionsList(req) {
        const userId = req.user?.user_id;
        return this.usersService.getUpcomingSessionsList(userId);
    }
    async submitBookingFeedback(bookingId, req, body) {
        const userId = req.user?.user_id;
        return this.usersService.submitBookingFeedback(+bookingId, userId, body.rating, body.comment || '');
    }
    async confirmBookingCompletion(bookingId, req) {
        const userId = req.user?.user_id;
        return this.usersService.confirmBookingCompletion(+bookingId, userId);
    }
    async markNotificationAsRead(id) {
        return this.usersService.markNotificationAsRead(+id);
    }
    async markAllNotificationsAsRead(req) {
        const userId = req.user?.user_id;
        return this.usersService.markAllNotificationsAsRead(userId);
    }
    async deleteNotification(id) {
        return { success: true };
    }
    async getAdminsWithQr() {
        return { success: true, data: await this.usersService.getAdminsWithQr() };
    }
    async getAdminProfile(id) {
        return this.usersService.getAdminProfile(+id);
    }
    async uploadAdminQr(id, file) {
        const userId = parseInt(id);
        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }
        const dbUrl = `/admin_qr/${file.filename}`;
        return this.usersService.updateAdminQr(userId, dbUrl);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('bookings/move-overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "moveOverdueBookingsToSessions", null);
__decorate([
    (0, common_1.Get)('test-auth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "testAuth", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/reset-password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)(':id/profile-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                console.log('=== MULTER DESTINATION DEBUG ===');
                console.log('Request params:', req.params);
                console.log('File info:', file);
                const dest = path.join(process.cwd(), 'user_profile_images');
                console.log('Destination path:', dest);
                try {
                    if (!fs.existsSync(dest)) {
                        fs.mkdirSync(dest, { recursive: true });
                        console.log('Created directory:', dest);
                    }
                    else {
                        console.log('Directory already exists:', dest);
                    }
                }
                catch (error) {
                    console.error('Error creating directory for profile images:', error);
                    return cb(error, null);
                }
                cb(null, dest);
                console.log('=== END MULTER DESTINATION DEBUG ===');
            },
            filename: (req, file, cb) => {
                console.log('=== MULTER FILENAME DEBUG ===');
                console.log('Request params:', req.params);
                console.log('File originalname:', file.originalname);
                const userId = req.params.id;
                const ext = path.extname(file.originalname) || '.jpg';
                const filename = `userProfile_${userId}${ext}`;
                console.log('Generated filename:', filename);
                console.log('=== END MULTER FILENAME DEBUG ===');
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Post)(':id/profile-image-placeholder'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setPlaceholderProfileImage", null);
__decorate([
    (0, common_1.Get)('me/bookings'),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyBookings", null);
__decorate([
    (0, common_1.Get)(':id/bookings'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBookingsForUser", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('notifications/upcoming-sessions'),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUpcomingSessions", null);
__decorate([
    (0, common_1.Get)('upcoming-sessions/list'),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUpcomingSessionsList", null);
__decorate([
    (0, common_1.Post)('bookings/:bookingId/feedback'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_2.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "submitBookingFeedback", null);
__decorate([
    (0, common_1.Post)('bookings/:bookingId/confirm-completion'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "confirmBookingCompletion", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Patch)('notifications/mark-all-read'),
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Delete)('notifications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('admins-with-qr'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAdminsWithQr", null);
__decorate([
    (0, common_1.Get)(':id/admin-profile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAdminProfile", null);
__decorate([
    (0, common_1.Post)(':id/admin-qr'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'admin_qr');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const userId = req.params.id;
                const ext = path.extname(file.originalname) || '.png';
                const filename = `adminQR_${userId}${ext}`;
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAdminQr", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService, tutors_service_1.TutorsService])
], UsersController);
//# sourceMappingURL=users.controller.js.map