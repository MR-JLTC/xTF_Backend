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
exports.EmailController = exports.ContactDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const email_service_1 = require("./email.service");
class ContactDto {
}
exports.ContactDto = ContactDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], ContactDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ContactDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], ContactDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], ContactDto.prototype, "message", void 0);
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendContactEmail(contactData) {
        try {
            if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
                throw new common_1.HttpException('All fields are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactData.email)) {
                throw new common_1.HttpException('Invalid email format', common_1.HttpStatus.BAD_REQUEST);
            }
            const success = await this.emailService.sendContactEmail(contactData);
            if (success) {
                return { message: 'Email sent successfully' };
            }
            else {
                throw new common_1.HttpException('Failed to send email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendTestEmail(body) {
        try {
            if (!body.email) {
                throw new common_1.HttpException('Email is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                throw new common_1.HttpException('Invalid email format', common_1.HttpStatus.BAD_REQUEST);
            }
            const success = await this.emailService.sendTestEmail(body.email);
            if (success) {
                return { message: 'Test email sent successfully' };
            }
            else {
                throw new common_1.HttpException('Failed to send test email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ContactDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendContactEmail", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendTestEmail", null);
exports.EmailController = EmailController = __decorate([
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map