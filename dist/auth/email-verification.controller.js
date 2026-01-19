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
exports.EmailVerificationController = exports.VerifyEmailCodeDto = exports.SendVerificationCodeDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const email_verification_service_1 = require("./email-verification.service");
class SendVerificationCodeDto {
}
exports.SendVerificationCodeDto = SendVerificationCodeDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], SendVerificationCodeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'User type is required' }),
    (0, class_validator_1.IsString)({ message: 'User type must be a string' }),
    __metadata("design:type", String)
], SendVerificationCodeDto.prototype, "user_type", void 0);
class VerifyEmailCodeDto {
}
exports.VerifyEmailCodeDto = VerifyEmailCodeDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], VerifyEmailCodeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Verification code is required' }),
    (0, class_validator_1.IsString)({ message: 'Verification code must be a string' }),
    __metadata("design:type", String)
], VerifyEmailCodeDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'User type is required' }),
    (0, class_validator_1.IsString)({ message: 'User type must be a string' }),
    __metadata("design:type", String)
], VerifyEmailCodeDto.prototype, "user_type", void 0);
let EmailVerificationController = class EmailVerificationController {
    constructor(emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }
    async sendVerificationCode(sendVerificationCodeDto) {
        try {
            console.log('=== EMAIL VERIFICATION CONTROLLER DEBUG ===');
            console.log('Received request body:', sendVerificationCodeDto);
            console.log('Email from DTO:', sendVerificationCodeDto.email);
            console.log('Email type:', typeof sendVerificationCodeDto.email);
            console.log('Email length:', sendVerificationCodeDto.email?.length);
            console.log('=== END EMAIL VERIFICATION CONTROLLER DEBUG ===');
            const result = await this.emailVerificationService.sendVerificationCode(sendVerificationCodeDto.email, sendVerificationCodeDto.user_type);
            return result;
        }
        catch (error) {
            console.log('❌ Email verification controller error:', error);
            throw new common_1.HttpException({
                message: error.message || 'Failed to send verification code',
                statusCode: error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getEmailVerificationStatus(email, user_type) {
        try {
            console.log('=== EMAIL STATUS CHECK DEBUG ===');
            console.log('Checking status for email:', email);
            console.log('User type:', user_type);
            console.log('Email type:', typeof email);
            console.log('=== END EMAIL STATUS CHECK DEBUG ===');
            if (!email) {
                throw new common_1.HttpException({ message: 'Email parameter is required', statusCode: common_1.HttpStatus.BAD_REQUEST }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!user_type) {
                throw new common_1.HttpException({ message: 'User type parameter is required', statusCode: common_1.HttpStatus.BAD_REQUEST }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.emailVerificationService.getEmailVerificationStatus(email, user_type);
            return result;
        }
        catch (error) {
            console.log('❌ Email status check error:', error);
            throw new common_1.HttpException({
                message: error.message || 'Failed to check email verification status',
                statusCode: error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyEmailCode(verifyEmailCodeDto) {
        try {
            console.log('=== VERIFY EMAIL CONTROLLER DEBUG ===');
            console.log('Received verify request body:', verifyEmailCodeDto);
            console.log('Email from DTO:', verifyEmailCodeDto.email);
            console.log('Code from DTO:', verifyEmailCodeDto.code);
            console.log('=== END VERIFY EMAIL CONTROLLER DEBUG ===');
            const result = await this.emailVerificationService.verifyEmailCode(verifyEmailCodeDto.email, verifyEmailCodeDto.code, verifyEmailCodeDto.user_type);
            return result;
        }
        catch (error) {
            console.log('❌ Verify email controller error:', error);
            throw new common_1.HttpException({
                message: error.message || 'Failed to verify email code',
                statusCode: error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EmailVerificationController = EmailVerificationController;
__decorate([
    (0, common_1.Post)('send-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendVerificationCodeDto]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "sendVerificationCode", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('user_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "getEmailVerificationStatus", null);
__decorate([
    (0, common_1.Post)('verify-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyEmailCodeDto]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "verifyEmailCode", null);
exports.EmailVerificationController = EmailVerificationController = __decorate([
    (0, common_1.Controller)('auth/email-verification'),
    __metadata("design:paramtypes", [email_verification_service_1.EmailVerificationService])
], EmailVerificationController);
//# sourceMappingURL=email-verification.controller.js.map