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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationRegistry = void 0;
const typeorm_1 = require("typeorm");
let EmailVerificationRegistry = class EmailVerificationRegistry {
};
exports.EmailVerificationRegistry = EmailVerificationRegistry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailVerificationRegistry.prototype, "registry_id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EmailVerificationRegistry.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['tutor', 'tutee', 'admin'],
    }),
    __metadata("design:type", String)
], EmailVerificationRegistry.prototype, "user_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EmailVerificationRegistry.prototype, "verification_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmailVerificationRegistry.prototype, "verification_expires", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], EmailVerificationRegistry.prototype, "is_verified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmailVerificationRegistry.prototype, "created_at", void 0);
exports.EmailVerificationRegistry = EmailVerificationRegistry = __decorate([
    (0, typeorm_1.Entity)('email_verification_registry')
], EmailVerificationRegistry);
//# sourceMappingURL=email-verification-registry.entity.js.map