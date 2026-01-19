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
exports.Session = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("./student.entity");
const tutor_entity_1 = require("./tutor.entity");
const subject_entity_1 = require("./subject.entity");
const rating_entity_1 = require("./rating.entity");
let Session = class Session {
};
exports.Session = Session;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Session.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, (student) => student.sessions),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], Session.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tutor_entity_1.Tutor, (tutor) => tutor.sessions),
    (0, typeorm_1.JoinColumn)({ name: 'tutor_id' }),
    __metadata("design:type", tutor_entity_1.Tutor)
], Session.prototype, "tutor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], Session.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Session.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Session.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    }),
    __metadata("design:type", String)
], Session.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Session.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rating_entity_1.Rating, (rating) => rating.session),
    __metadata("design:type", Array)
], Session.prototype, "ratings", void 0);
exports.Session = Session = __decorate([
    (0, typeorm_1.Entity)('session_history')
], Session);
//# sourceMappingURL=session.entity.js.map