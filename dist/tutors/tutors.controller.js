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
exports.TutorsController = void 0;
const common_1 = require("@nestjs/common");
const tutors_service_1 = require("./tutors.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const platform_express_2 = require("@nestjs/platform-express");
let TutorsController = class TutorsController {
    constructor(tutorsService) {
        this.tutorsService = tutorsService;
    }
    findPendingApplications() {
        return this.tutorsService.findPendingApplications();
    }
    getAllPendingTutorSubjects() {
        return this.tutorsService.getAllPendingTutorSubjects();
    }
    updateStatus(id, body) {
        console.log(`[TutorController] Received PATCH request for tutor ${id} - Status: ${body.status}`);
        console.log(`[TutorController] Admin notes in request body:`, body.adminNotes ? `"${body.adminNotes.substring(0, 50)}${body.adminNotes.length > 50 ? '...' : ''}"` : 'none');
        console.log(`[TutorController] Passing adminNotes to service - will be saved to tutors.admin_notes column`);
        return this.tutorsService.updateStatus(+id, body.status, body.adminNotes);
    }
    updateTutorSubjectStatus(tutorSubjectId, body) {
        return this.tutorsService.updateTutorSubjectStatus(+tutorSubjectId, body.status, body.adminNotes);
    }
    async applyTutor(body) {
        return this.tutorsService.applyTutor(body);
    }
    async getDocuments(tutorId) {
        return this.tutorsService.getDocuments(+tutorId);
    }
    async uploadDocuments(tutorId, files) {
        return this.tutorsService.saveDocuments(+tutorId, files);
    }
    async uploadProfileImage(tutorId, file) {
        return this.tutorsService.saveProfileImage(+tutorId, file);
    }
    async saveAvailability(tutorId, body) {
        return this.tutorsService.saveAvailability(+tutorId, body.slots);
    }
    async saveSubjects(tutorId, body) {
        return this.tutorsService.saveSubjects(+tutorId, body.subjects, body.course_id);
    }
    async getTutorIdByUserId(userId) {
        const tutorId = await this.tutorsService.getTutorId(+userId);
        return { tutor_id: tutorId };
    }
    async updateOnlineStatus(userId, body) {
        await this.tutorsService.updateOnlineStatus(+userId, body.status);
        return { success: true, message: `Online status updated to ${body.status}` };
    }
    async getTutorByEmail(email) {
        return this.tutorsService.getTutorByEmail(email);
    }
    async updateTutor(tutorId, body) {
        return this.tutorsService.updateTutor(+tutorId, { ...body, year_level: body.year_level ? Number(body.year_level) : undefined });
    }
    async updateExistingUserToTutor(userId, body) {
        return this.tutorsService.updateExistingUserToTutor(+userId, { ...body, year_level: body.year_level ? Number(body.year_level) : undefined });
    }
    async getTutorStatusByUserId(userId) {
        return this.tutorsService.getTutorStatus(+userId);
    }
    async getTutorStatus(tutorId) {
        return this.tutorsService.getTutorStatus(+tutorId);
    }
    async getTutorProfile(tutorId) {
        return this.tutorsService.getTutorProfile(+tutorId);
    }
    async updateTutorProfile(tutorId, body) {
        return this.tutorsService.updateTutorProfile(+tutorId, body);
    }
    async getTutorStatusByUserIdAlias(userId) {
        return this.tutorsService.getTutorStatus(+userId);
    }
    async getTutorAvailability(tutorId) {
        return this.tutorsService.getTutorAvailability(+tutorId);
    }
    async getSubjectApplications(tutorId) {
        return this.tutorsService.getTutorSubjectApplications(+tutorId);
    }
    async submitSubjectApplication(tutorId, body, files) {
        const subjectName = body?.subject_name || body?.subjectName || '';
        const isReapplication = body?.is_reapplication === 'true' || body?.is_reapplication === true;
        console.log('Received subject application:', { tutorId, subjectName, filesCount: files?.length || 0, isReapplication, bodyKeys: Object.keys(body || {}) });
        if (!subjectName || !subjectName.trim()) {
            throw new Error('Subject name is required');
        }
        if ((!files || files.length === 0) && !isReapplication) {
            throw new Error('At least one file is required for subject application');
        }
        return this.tutorsService.submitSubjectApplication(+tutorId, subjectName, files || [], isReapplication);
    }
    async getBookingRequests(tutorId) {
        return this.tutorsService.getBookingRequests(+tutorId);
    }
    async createBookingRequest(tutorId, body, req) {
        const userId = req.user?.user_id;
        return this.tutorsService.createBookingRequest(+tutorId, userId, body);
    }
    async acceptBookingRequest(bookingId) {
        return this.tutorsService.updateBookingRequestStatus(+bookingId, 'accepted');
    }
    async declineBookingRequest(bookingId) {
        return this.tutorsService.updateBookingRequestStatus(+bookingId, 'declined');
    }
    async approvePayment(bookingId) {
        return this.tutorsService.updatePaymentStatus(+bookingId, 'approved');
    }
    async rejectPayment(bookingId) {
        return this.tutorsService.updatePaymentStatus(+bookingId, 'rejected');
    }
    async uploadPaymentProof(bookingId, file) {
        return this.tutorsService.uploadPaymentProof(+bookingId, file);
    }
    async completeBooking(bookingId, file, body) {
        const status = (body.status || 'awaiting_confirmation');
        return this.tutorsService.markBookingAsCompleted(+bookingId, status, file);
    }
    async getTutorSessions(tutorId) {
        return this.tutorsService.getTutorSessions(+tutorId);
    }
    async getTutorPayments(tutorId) {
        return this.tutorsService.getTutorPayments(+tutorId);
    }
    async getTutorPayouts(tutorId) {
        return this.tutorsService.getTutorPayouts(+tutorId);
    }
    async getTutorEarningsStats(tutorId) {
        return this.tutorsService.getTutorEarningsStats(+tutorId);
    }
    async uploadGcashQR(tutorId, file) {
        return this.tutorsService.saveGcashQR(+tutorId, file);
    }
    async setProfileImagePlaceholder(tutorId) {
        return this.tutorsService.saveProfileImage(+tutorId, null);
    }
    async setGcashQRPlaceholder(tutorId) {
        return this.tutorsService.saveGcashQR(+tutorId, null);
    }
};
exports.TutorsController = TutorsController;
__decorate([
    (0, common_1.Get)('applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TutorsController.prototype, "findPendingApplications", null);
__decorate([
    (0, common_1.Get)('pending-subjects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TutorsController.prototype, "getAllPendingTutorSubjects", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TutorsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('tutor-subjects/:tutorSubjectId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorSubjectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TutorsController.prototype, "updateTutorSubjectStatus", null);
__decorate([
    (0, common_1.Post)('apply'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "applyTutor", null);
__decorate([
    (0, common_1.Get)(':tutorId/documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)(':tutorId/documents'),
    (0, common_2.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const tutorId = req.params.tutorId;
                const originalExt = path.extname(file.originalname) || '';
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (typeof req.__tutorDocsSeqStart !== 'number') {
                    const files = fs.existsSync(dest) ? fs.readdirSync(dest) : [];
                    const existing = files.filter((f) => f.endsWith(`_${tutorId}${path.extname(f)}`) || f.includes(`_${tutorId}.`)).length;
                    req.__tutorDocsSeqStart = existing;
                    req.__tutorDocsSeqCounter = 0;
                }
                req.__tutorDocsSeqCounter = (req.__tutorDocsSeqCounter || 0) + 1;
                const seq = req.__tutorDocsSeqStart + req.__tutorDocsSeqCounter;
                const base = `tutorDocs${seq}_${tutorId}`;
                cb(null, `${base}${originalExt}`);
            }
        })
    })),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_2.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "uploadDocuments", null);
__decorate([
    (0, common_1.Post)(':tutorId/profile-image'),
    (0, common_2.UseInterceptors)((0, platform_express_2.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                console.log('Multer Destination Called for Profile Image.');
                const dest = path.join(process.cwd(), 'tutor_documents');
                try {
                    if (!fs.existsSync(dest)) {
                        fs.mkdirSync(dest, { recursive: true });
                    }
                }
                catch (error) {
                    console.error('Error creating directory for profile images:', error);
                    return cb(error, null);
                }
                console.log('Profile Image Upload Destination:', dest);
                req.uploadDestination = dest;
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                console.log('Multer Filename Called for Profile Image.', 'Original Name:', file.originalname);
                const tutorId = req.params.tutorId;
                const ext = path.extname(file.originalname) || '';
                const tempFilename = `temp_profile_${tutorId}_${Date.now()}${ext}`;
                console.log('Generated temporary Profile Image Filename:', tempFilename);
                cb(null, tempFilename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_2.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Post)(':tutorId/availability'),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "saveAvailability", null);
__decorate([
    (0, common_1.Post)(':tutorId/subjects'),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "saveSubjects", null);
__decorate([
    (0, common_1.Get)('by-user/:userId/tutor-id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorIdByUserId", null);
__decorate([
    (0, common_1.Patch)('by-user/:userId/online-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "updateOnlineStatus", null);
__decorate([
    (0, common_1.Get)('by-email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorByEmail", null);
__decorate([
    (0, common_1.Put)(':tutorId'),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "updateTutor", null);
__decorate([
    (0, common_1.Put)('update-existing-user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "updateExistingUserToTutor", null);
__decorate([
    (0, common_1.Get)('status/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorStatusByUserId", null);
__decorate([
    (0, common_1.Get)(':tutorId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorStatus", null);
__decorate([
    (0, common_1.Get)(':tutorId/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorProfile", null);
__decorate([
    (0, common_1.Put)(':tutorId/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "updateTutorProfile", null);
__decorate([
    (0, common_1.Get)('by-user/:userId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorStatusByUserIdAlias", null);
__decorate([
    (0, common_1.Get)(':tutorId/availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorAvailability", null);
__decorate([
    (0, common_1.Get)(':tutorId/subject-applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getSubjectApplications", null);
__decorate([
    (0, common_1.Post)(':tutorId/subject-application'),
    (0, common_2.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const tutorId = req.params.tutorId;
                const originalExt = path.extname(file.originalname) || '';
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 8);
                cb(null, `subjectApp_${tutorId}_${timestamp}_${random}${originalExt}`);
            }
        })
    })),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_2.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "submitSubjectApplication", null);
__decorate([
    (0, common_1.Get)(':tutorId/booking-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getBookingRequests", null);
__decorate([
    (0, common_1.Post)(':tutorId/booking-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "createBookingRequest", null);
__decorate([
    (0, common_1.Post)('booking-requests/:bookingId/accept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "acceptBookingRequest", null);
__decorate([
    (0, common_1.Post)('booking-requests/:bookingId/decline'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "declineBookingRequest", null);
__decorate([
    (0, common_1.Post)('booking-requests/:bookingId/payment-approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Post)('booking-requests/:bookingId/payment-reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "rejectPayment", null);
__decorate([
    (0, common_1.Post)('booking-requests/:bookingId/payment-proof'),
    (0, common_2.UseInterceptors)((0, platform_express_2.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const bookingId = req.params.bookingId;
                const ext = path.extname(file.originalname) || '';
                const safeExt = ext || '.jpg';
                const filename = `paymentProof_${bookingId}_${Date.now()}${safeExt}`;
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_2.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "uploadPaymentProof", null);
__decorate([
    (0, common_1.Post)('booking-requests/:bookingId/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.UseInterceptors)((0, platform_express_2.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const bookingId = req.params.bookingId;
                const ext = path.extname(file.originalname) || '';
                const filename = `sessionProof_${bookingId}_${Date.now()}${ext}`;
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_2.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "completeBooking", null);
__decorate([
    (0, common_1.Get)(':tutorId/sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorSessions", null);
__decorate([
    (0, common_1.Get)(':tutorId/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorPayments", null);
__decorate([
    (0, common_1.Get)(':tutorId/payouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorPayouts", null);
__decorate([
    (0, common_1.Get)(':tutorId/earnings-stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "getTutorEarningsStats", null);
__decorate([
    (0, common_1.Post)(':tutorId/gcash-qr'),
    (0, common_2.UseInterceptors)((0, platform_express_2.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                console.log('Multer Destination Called for GCash QR.');
                const dest = path.join(process.cwd(), 'tutor_documents');
                try {
                    if (!fs.existsSync(dest)) {
                        fs.mkdirSync(dest, { recursive: true });
                    }
                }
                catch (error) {
                    console.error('Error creating directory for GCash QR images:', error);
                    return cb(error, null);
                }
                console.log('GCash QR Upload Destination:', dest);
                req.uploadDestination = dest;
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                console.log('Multer Filename Called for GCash QR.', 'Original Name:', file.originalname);
                const tutorId = req.params.tutorId;
                const ext = path.extname(file.originalname) || '';
                const tempFilename = `temp_gcash_${tutorId}_${Date.now()}${ext}`;
                console.log('Generated temporary GCash QR Filename:', tempFilename);
                cb(null, tempFilename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('tutorId')),
    __param(1, (0, common_2.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "uploadGcashQR", null);
__decorate([
    (0, common_1.Post)(':tutorId/profile-image-placeholder'),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "setProfileImagePlaceholder", null);
__decorate([
    (0, common_1.Post)(':tutorId/gcash-qr-placeholder'),
    __param(0, (0, common_1.Param)('tutorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorsController.prototype, "setGcashQRPlaceholder", null);
exports.TutorsController = TutorsController = __decorate([
    (0, common_1.Controller)('tutors'),
    __metadata("design:paramtypes", [tutors_service_1.TutorsService])
], TutorsController);
//# sourceMappingURL=tutors.controller.js.map