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
exports.TestPasswordResetController = exports.TestPasswordResetDto = void 0;
const common_1 = require("@nestjs/common");
const password_reset_service_1 = require("./password-reset.service");
class TestPasswordResetDto {
}
exports.TestPasswordResetDto = TestPasswordResetDto;
let TestPasswordResetController = class TestPasswordResetController {
    constructor(passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    async debugPasswordReset(testPasswordResetDto) {
        try {
            console.log('=== DEBUG PASSWORD RESET ===');
            console.log('Email received:', testPasswordResetDto.email);
            const result = await this.passwordResetService.requestPasswordReset(testPasswordResetDto.email);
            console.log('Result:', result);
            console.log('=== END DEBUG ===');
            return {
                success: true,
                message: 'Debug completed - check server logs',
                result
            };
        }
        catch (error) {
            console.log('=== DEBUG ERROR ===');
            console.log('Error:', error.message);
            console.log('=== END DEBUG ERROR ===');
            throw new common_1.HttpException({
                message: error.message || 'Debug failed',
                statusCode: error.status || common_1.HttpStatus.BAD_REQUEST,
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.TestPasswordResetController = TestPasswordResetController;
__decorate([
    (0, common_1.Post)('debug'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], TestPasswordResetController.prototype, "debugPasswordReset", null);
exports.TestPasswordResetController = TestPasswordResetController = __decorate([
    (0, common_1.Controller)('auth/test-password-reset'),
    __metadata("design:paramtypes", [password_reset_service_1.PasswordResetService])
], TestPasswordResetController);
//# sourceMappingURL=test-password-reset.controller.js.map