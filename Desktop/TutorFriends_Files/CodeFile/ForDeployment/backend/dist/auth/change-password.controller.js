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
exports.ChangePasswordController = exports.VerifyCodeAndChangePasswordDto = exports.RequestChangePasswordDto = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const change_password_service_1 = require("./change-password.service");
class RequestChangePasswordDto {
}
exports.RequestChangePasswordDto = RequestChangePasswordDto;
class VerifyCodeAndChangePasswordDto {
}
exports.VerifyCodeAndChangePasswordDto = VerifyCodeAndChangePasswordDto;
let ChangePasswordController = class ChangePasswordController {
    constructor(changePasswordService) {
        this.changePasswordService = changePasswordService;
    }
    async requestChangePassword(req, requestChangePasswordDto) {
        try {
            const userId = req.user.user_id;
            const result = await this.changePasswordService.requestChangePassword(userId, requestChangePasswordDto.currentPassword);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Failed to process password change request',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyCodeAndChangePassword(req, verifyCodeAndChangePasswordDto) {
        try {
            const userId = req.user.user_id;
            const result = await this.changePasswordService.verifyCodeAndChangePassword(userId, verifyCodeAndChangePasswordDto.code, verifyCodeAndChangePasswordDto.newPassword);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                message: error.message || 'Failed to change password',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.ChangePasswordController = ChangePasswordController;
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RequestChangePasswordDto]),
    __metadata("design:returntype", Promise)
], ChangePasswordController.prototype, "requestChangePassword", null);
__decorate([
    (0, common_1.Post)('verify-and-change'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, VerifyCodeAndChangePasswordDto]),
    __metadata("design:returntype", Promise)
], ChangePasswordController.prototype, "verifyCodeAndChangePassword", null);
exports.ChangePasswordController = ChangePasswordController = __decorate([
    (0, common_1.Controller)('auth/change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [change_password_service_1.ChangePasswordService])
], ChangePasswordController);
//# sourceMappingURL=change-password.controller.js.map