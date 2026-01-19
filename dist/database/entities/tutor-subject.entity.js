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
exports.TutorSubject = void 0;
const typeorm_1 = require("typeorm");
const tutor_entity_1 = require("./tutor.entity");
const subject_entity_1 = require("./subject.entity");
const tutor_subject_document_entity_1 = require("./tutor-subject-document.entity");
let TutorSubject = class TutorSubject {
};
exports.TutorSubject = TutorSubject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TutorSubject.prototype, "tutor_subject_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tutor_entity_1.Tutor, (tutor) => tutor.subjects),
    (0, typeorm_1.JoinColumn)({ name: 'tutor_id' }),
    __metadata("design:type", tutor_entity_1.Tutor)
], TutorSubject.prototype, "tutor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject, (subject) => subject.tutors),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], TutorSubject.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], TutorSubject.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TutorSubject.prototype, "admin_notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tutor_subject_document_entity_1.TutorSubjectDocument, doc => doc.tutorSubject),
    __metadata("design:type", Array)
], TutorSubject.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], TutorSubject.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], TutorSubject.prototype, "updated_at", void 0);
exports.TutorSubject = TutorSubject = __decorate([
    (0, typeorm_1.Entity)('tutor_subjects')
], TutorSubject);
//# sourceMappingURL=tutor-subject.entity.js.map