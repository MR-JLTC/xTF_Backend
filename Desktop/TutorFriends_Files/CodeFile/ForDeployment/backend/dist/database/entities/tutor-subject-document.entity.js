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
exports.TutorSubjectDocument = void 0;
const typeorm_1 = require("typeorm");
const tutor_subject_entity_1 = require("./tutor-subject.entity");
let TutorSubjectDocument = class TutorSubjectDocument {
};
exports.TutorSubjectDocument = TutorSubjectDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TutorSubjectDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tutor_subject_entity_1.TutorSubject, tutorSubject => tutorSubject.documents),
    (0, typeorm_1.JoinColumn)({ name: 'tutor_subject_id' }),
    __metadata("design:type", tutor_subject_entity_1.TutorSubject)
], TutorSubjectDocument.prototype, "tutorSubject", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TutorSubjectDocument.prototype, "file_url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TutorSubjectDocument.prototype, "file_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TutorSubjectDocument.prototype, "file_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], TutorSubjectDocument.prototype, "created_at", void 0);
exports.TutorSubjectDocument = TutorSubjectDocument = __decorate([
    (0, typeorm_1.Entity)('tutor_subject_documents')
], TutorSubjectDocument);
//# sourceMappingURL=tutor-subject-document.entity.js.map