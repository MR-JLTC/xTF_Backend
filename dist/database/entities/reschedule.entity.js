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
exports.Reschedule = void 0;
const typeorm_1 = require("typeorm");
const booking_request_entity_1 = require("./booking-request.entity");
const user_entity_1 = require("./user.entity");
let Reschedule = class Reschedule {
};
exports.Reschedule = Reschedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reschedule.prototype, "reschedule_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_request_entity_1.BookingRequest, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_request_entity_1.BookingRequest)
], Reschedule.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Reschedule.prototype, "proposer_user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'proposer_user_id' }),
    __metadata("design:type", user_entity_1.User)
], Reschedule.prototype, "proposer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Reschedule.prototype, "proposedDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reschedule.prototype, "proposedTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Reschedule.prototype, "proposedDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Reschedule.prototype, "originalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Reschedule.prototype, "originalTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Reschedule.prototype, "originalDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reschedule.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' }),
    __metadata("design:type", String)
], Reschedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Reschedule.prototype, "receiver_user_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Reschedule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Reschedule.prototype, "updated_at", void 0);
exports.Reschedule = Reschedule = __decorate([
    (0, typeorm_1.Entity)('reschedules')
], Reschedule);
//# sourceMappingURL=reschedule.entity.js.map