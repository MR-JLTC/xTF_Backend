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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const payment_dto_1 = require("./payment.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async requestPayment(body) {
        return this.paymentsService.requestPayment(body.bookingId, body.tutorId, body.amount, body.subject);
    }
    findAll() {
        return this.paymentsService.findAll();
    }
    findAllPayouts() {
        return this.paymentsService.findAllPayouts();
    }
    updateDispute(id, dto) {
        return this.paymentsService.updateDispute(+id, dto);
    }
    async submitProof(body, file) {
        return this.paymentsService.submitProof(+body.bookingId, +body.adminId, Number(body.amount), file);
    }
    async verifyPayment(id, body, adminProof) {
        try {
            if (adminProof) {
                console.log(`PaymentsController.verifyPayment: Received adminProof filename=${adminProof.filename}, mimetype=${adminProof.mimetype}`);
            }
            else {
                console.log('PaymentsController.verifyPayment: No adminProof file received in request');
            }
            if (body.status === 'rejected' && body.rejection_reason) {
                console.log(`PaymentsController.verifyPayment: Rejection reason: ${body.rejection_reason}`);
            }
            const res = await this.paymentsService.verifyPayment(+id, body.status, adminProof, body.rejection_reason);
            console.log(`PaymentsController.verifyPayment: Service result:`, res);
            return res;
        }
        catch (err) {
            console.error('PaymentsController.verifyPayment: Error while verifying payment:', err);
            throw err;
        }
    }
    async confirmByTutor(id, req) {
        const userId = req.user?.user_id;
        return this.paymentsService.confirmByTutor(+id, userId);
    }
    async getCompletedBookingsWaitingForPayment() {
        return this.paymentsService.getCompletedBookingsWaitingForPayment();
    }
    async processAdminPayment(bookingId, receipt) {
        if (!receipt) {
            throw new common_1.BadRequestException('Payment receipt is required');
        }
        return this.paymentsService.processAdminPayment(+bookingId, receipt);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "requestPayment", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAllPayouts", null);
__decorate([
    (0, common_1.Patch)(':id/dispute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_dto_1.UpdatePaymentDisputeDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateDispute", null);
__decorate([
    (0, common_1.Post)('submit-proof'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname) || '.jpg';
                const filename = `paymentProof_${Date.now()}${ext}`;
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "submitProof", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('adminProof', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname) || '.jpg';
                const filename = `adminPaymentProof_${Date.now()}${ext}`;
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmByTutor", null);
__decorate([
    (0, common_1.Get)('waiting-for-payment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getCompletedBookingsWaitingForPayment", null);
__decorate([
    (0, common_1.Post)('process-admin-payment/:bookingId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'tutor_documents');
                if (!fs.existsSync(dest))
                    fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname) || '.jpg';
                const filename = `adminPaymentReceipt_${Date.now()}${ext}`;
                cb(null, filename);
            }
        })
    })),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processAdminPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map