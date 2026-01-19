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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("./student.entity");
const tutor_entity_1 = require("./tutor.entity");
const booking_request_entity_1 = require("./booking-request.entity");
const subject_entity_1 = require("./subject.entity");
const payout_entity_1 = require("./payout.entity");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Payment.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "booking_request_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Payment.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Payment.prototype, "tutor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "subject_id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'paid', 'disputed', 'refunded', 'confirmed'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['none', 'open', 'under_revision', 'resolved', 'rejected'],
        default: 'none',
    }),
    __metadata("design:type", String)
], Payment.prototype, "dispute_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "payment_proof_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Payment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, (student) => student.payments),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], Payment.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tutor_entity_1.Tutor, (tutor) => tutor.payments),
    (0, typeorm_1.JoinColumn)({ name: 'tutor_id' }),
    __metadata("design:type", tutor_entity_1.Tutor)
], Payment.prototype, "tutor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_request_entity_1.BookingRequest, (booking) => booking.payments, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_request_id' }),
    __metadata("design:type", booking_request_entity_1.BookingRequest)
], Payment.prototype, "bookingRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], Payment.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payout_entity_1.Payout, (payout) => payout.payment),
    __metadata("design:type", Array)
], Payment.prototype, "payouts", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=payment.entity.js.map