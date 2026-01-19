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
exports.Tutor = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const tutor_document_entity_1 = require("./tutor-document.entity");
const tutor_subject_entity_1 = require("./tutor-subject.entity");
const tutor_availability_entity_1 = require("./tutor-availability.entity");
const session_entity_1 = require("./session.entity");
const payment_entity_1 = require("./payment.entity");
const subject_application_entity_1 = require("./subject-application.entity");
const booking_request_entity_1 = require("./booking-request.entity");
const university_entity_1 = require("./university.entity");
const course_entity_1 = require("./course.entity");
let Tutor = class Tutor {
};
exports.Tutor = Tutor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Tutor.prototype, "tutor_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.tutor_profile),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Tutor.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Tutor.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tutor.prototype, "gcash_qr_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tutor.prototype, "gcash_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Tutor.prototype, "university_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Tutor.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Tutor.prototype, "year_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Tutor.prototype, "session_rate_per_hour", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => university_entity_1.University, (university) => university.tutors),
    (0, typeorm_1.JoinColumn)({ name: 'university_id' }),
    __metadata("design:type", university_entity_1.University)
], Tutor.prototype, "university", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, (course) => course.tutors),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], Tutor.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Tutor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['online', 'offline'],
        nullable: true,
    }),
    __metadata("design:type", String)
], Tutor.prototype, "activity_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Tutor.prototype, "admin_notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tutor_document_entity_1.TutorDocument, (doc) => doc.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tutor_subject_entity_1.TutorSubject, (tutorSubject) => tutorSubject.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "subjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tutor_availability_entity_1.TutorAvailability, (availability) => availability.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "availabilities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => session_entity_1.Session, (session) => session.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subject_application_entity_1.SubjectApplication, (application) => application.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "subjectApplications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_request_entity_1.BookingRequest, (request) => request.tutor),
    __metadata("design:type", Array)
], Tutor.prototype, "bookingRequests", void 0);
exports.Tutor = Tutor = __decorate([
    (0, typeorm_1.Entity)('tutors')
], Tutor);
//# sourceMappingURL=tutor.entity.js.map