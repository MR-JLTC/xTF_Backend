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
exports.SubjectApplicationDocument = void 0;
const typeorm_1 = require("typeorm");
const subject_application_entity_1 = require("./subject-application.entity");
let SubjectApplicationDocument = class SubjectApplicationDocument {
};
exports.SubjectApplicationDocument = SubjectApplicationDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubjectApplicationDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_application_entity_1.SubjectApplication, application => application.documents),
    (0, typeorm_1.JoinColumn)({ name: 'subject_application_id' }),
    __metadata("design:type", subject_application_entity_1.SubjectApplication)
], SubjectApplicationDocument.prototype, "subjectApplication", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubjectApplicationDocument.prototype, "file_url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubjectApplicationDocument.prototype, "file_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubjectApplicationDocument.prototype, "file_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SubjectApplicationDocument.prototype, "created_at", void 0);
exports.SubjectApplicationDocument = SubjectApplicationDocument = __decorate([
    (0, typeorm_1.Entity)('subject_application_documents')
], SubjectApplicationDocument);
//# sourceMappingURL=subject-application-document.entity.js.map