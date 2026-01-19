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
exports.BookingRequest = void 0;
const typeorm_1 = require("typeorm");
const tutor_entity_1 = require("./tutor.entity");
const user_entity_1 = require("./user.entity");
const payment_entity_1 = require("./payment.entity");
let BookingRequest = class BookingRequest {
};
exports.BookingRequest = BookingRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BookingRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tutor_entity_1.Tutor, tutor => tutor.bookingRequests),
    (0, typeorm_1.JoinColumn)({ name: 'tutor_id' }),
    __metadata("design:type", tutor_entity_1.Tutor)
], BookingRequest.prototype, "tutor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.bookingRequests),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", user_entity_1.User)
], BookingRequest.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BookingRequest.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BookingRequest.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 1 }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'pending',
            'accepted',
            'declined',
            'awaiting_payment',
            'payment_pending',
            'admin_payment_pending',
            'payment_rejected',
            'payment_approved',
            'awaiting_confirmation',
            'upcoming',
            'completed',
            'cancelled'
        ],
        default: 'pending',
    }),
    __metadata("design:type", String)
], BookingRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "payment_proof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "session_proof_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "tutor_marked_done_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "tutee_marked_done_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "student_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 2, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "tutee_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "tutee_comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "tutee_feedback_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.bookingRequest),
    __metadata("design:type", Array)
], BookingRequest.prototype, "payments", void 0);
exports.BookingRequest = BookingRequest = __decorate([
    (0, typeorm_1.Entity)('booking_requests')
], BookingRequest);
//# sourceMappingURL=booking-request.entity.js.map