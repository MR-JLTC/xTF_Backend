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
exports.PasswordResetController = exports.VerifyCodeAndResetPasswordDto = exports.RequestPasswordResetDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const password_reset_service_1 = require("./password-reset.service");
class RequestPasswordResetDto {
}
exports.RequestPasswordResetDto = RequestPasswordResetDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], RequestPasswordResetDto.prototype, "email", void 0);
class VerifyCodeAndResetPasswordDto {
}
exports.VerifyCodeAndResetPasswordDto = VerifyCodeAndResetPasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], VerifyCodeAndResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Verification code is required' }),
    (0, class_validator_1.IsString)({ message: 'Verification code must be a string' }),
    __metadata("design:type", String)
], VerifyCodeAndResetPasswordDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'New password is required' }),
    (0, class_validator_1.IsString)({ message: 'New password must be a string' }),
    (0, class_validator_1.MinLength)(7, { message: 'New password must be at least 7 characters long' }),
    __metadata("design:type", String)
], VerifyCodeAndResetPasswordDto.prototype, "newPassword", void 0);
let PasswordResetController = class PasswordResetController {
    constructor(passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    async checkUserType(email) {
        try {
            if (!email) {
                throw new common_1.HttpException({
                    message: 'Email is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const userType = await this.passwordResetService.getUserTypeByEmail(email);
            return { userType };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Failed to check user type',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async requestPasswordReset(requestPasswordResetDto) {
        try {
            console.log('=== CONTROLLER DEBUG ===');
            console.log('Received request body:', requestPasswordResetDto);
            console.log('Email from DTO:', requestPasswordResetDto.email);
            console.log('Email type:', typeof requestPasswordResetDto.email);
            console.log('Email length:', requestPasswordResetDto.email?.length);
            console.log('=== END CONTROLLER DEBUG ===');
            if (!requestPasswordResetDto.email) {
                throw new common_1.HttpException({
                    message: 'Email is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.passwordResetService.requestPasswordReset(requestPasswordResetDto.email, { requiredUserType: undefined, excludeUserType: 'admin' });
            return result;
        }
        catch (error) {
            console.log('Controller error:', error.message);
            throw new common_1.HttpException({
                message: error.message || 'Failed to process password reset request',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async requestAdminPasswordReset(requestPasswordResetDto) {
        try {
            if (!requestPasswordResetDto.email) {
                throw new common_1.HttpException({
                    message: 'Email is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.passwordResetService.requestPasswordReset(requestPasswordResetDto.email, {
                requiredUserType: 'admin',
            });
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Failed to process admin password reset request',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyCodeAndResetPassword(verifyCodeAndResetPasswordDto) {
        try {
            console.log('=== VERIFY CONTROLLER DEBUG ===');
            console.log('Received verify request body:', verifyCodeAndResetPasswordDto);
            console.log('Email from DTO:', verifyCodeAndResetPasswordDto.email);
            console.log('Code from DTO:', verifyCodeAndResetPasswordDto.code);
            console.log('=== END VERIFY CONTROLLER DEBUG ===');
            if (!verifyCodeAndResetPasswordDto.email) {
                throw new common_1.HttpException({
                    message: 'Email is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!verifyCodeAndResetPasswordDto.code) {
                throw new common_1.HttpException({
                    message: 'Verification code is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!verifyCodeAndResetPasswordDto.newPassword) {
                throw new common_1.HttpException({
                    message: 'New password is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.passwordResetService.verifyCodeAndResetPassword(verifyCodeAndResetPasswordDto.email, verifyCodeAndResetPasswordDto.code, verifyCodeAndResetPasswordDto.newPassword, { requiredUserType: undefined, excludeUserType: 'admin' });
            return result;
        }
        catch (error) {
            console.log('Verify controller error:', error.message);
            throw new common_1.HttpException({
                message: error.message || 'Failed to reset password',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyAdminCodeAndResetPassword(verifyCodeAndResetPasswordDto) {
        try {
            if (!verifyCodeAndResetPasswordDto.email) {
                throw new common_1.HttpException({
                    message: 'Email is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!verifyCodeAndResetPasswordDto.code) {
                throw new common_1.HttpException({
                    message: 'Verification code is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!verifyCodeAndResetPasswordDto.newPassword) {
                throw new common_1.HttpException({
                    message: 'New password is required',
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.passwordResetService.verifyCodeAndResetPassword(verifyCodeAndResetPasswordDto.email, verifyCodeAndResetPasswordDto.code, verifyCodeAndResetPasswordDto.newPassword, { requiredUserType: 'admin' });
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Failed to reset admin password',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.PasswordResetController = PasswordResetController;
__decorate([
    (0, common_1.Get)('check-user-type'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "checkUserType", null);
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('admin/request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "requestAdminPasswordReset", null);
__decorate([
    (0, common_1.Post)('verify-and-reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyCodeAndResetPasswordDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "verifyCodeAndResetPassword", null);
__decorate([
    (0, common_1.Post)('admin/verify-and-reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyCodeAndResetPasswordDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "verifyAdminCodeAndResetPassword", null);
exports.PasswordResetController = PasswordResetController = __decorate([
    (0, common_1.Controller)('auth/password-reset'),
    __metadata("design:paramtypes", [password_reset_service_1.PasswordResetService])
], PasswordResetController);
//# sourceMappingURL=password-reset.controller.js.map