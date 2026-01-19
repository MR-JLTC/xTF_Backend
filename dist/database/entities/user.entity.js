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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const admin_entity_1 = require("./admin.entity");
const student_entity_1 = require("./student.entity");
const tutor_entity_1 = require("./tutor.entity");
const booking_request_entity_1 = require("./booking-request.entity");
const password_reset_token_entity_1 = require("./password-reset-token.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['tutor', 'tutee', 'admin', 'student'],
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "user_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'pending_verification'],
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profile_image_url", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => admin_entity_1.Admin, (admin) => admin.user),
    __metadata("design:type", admin_entity_1.Admin)
], User.prototype, "admin_profile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => student_entity_1.Student, (student) => student.user),
    __metadata("design:type", student_entity_1.Student)
], User.prototype, "student_profile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tutor_entity_1.Tutor, (tutor) => tutor.user),
    __metadata("design:type", tutor_entity_1.Tutor)
], User.prototype, "tutor_profile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_request_entity_1.BookingRequest, (request) => request.student),
    __metadata("design:type", Array)
], User.prototype, "bookingRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => password_reset_token_entity_1.PasswordResetToken, (token) => token.user),
    __metadata("design:type", Array)
], User.prototype, "passwordResetTokens", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map