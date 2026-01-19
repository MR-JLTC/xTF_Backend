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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let SubjectsController = class SubjectsController {
    constructor(subjectRepo) {
        this.subjectRepo = subjectRepo;
    }
    async list(universityId, courseId) {
        const qb = this.subjectRepo.createQueryBuilder('subject')
            .leftJoin('subject.course', 'course')
            .orderBy('subject.subject_name', 'ASC');
        const params = {};
        if (courseId) {
            qb.andWhere('course.course_id = :courseId');
            params.courseId = Number(courseId);
        }
        if (universityId) {
            qb.andWhere('course.university_id = :universityId');
            params.universityId = Number(universityId);
        }
        if (Object.keys(params).length > 0) {
            qb.setParameters(params);
        }
        const subjects = await qb.getMany();
        return subjects.map(s => ({ subject_id: s.subject_id, subject_name: s.subject_name }));
    }
};
exports.SubjectsController = SubjectsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('university_id')),
    __param(1, (0, common_1.Query)('course_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "list", null);
exports.SubjectsController = SubjectsController = __decorate([
    (0, common_1.Controller)('subjects'),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubjectsController);
//# sourceMappingURL=subjects.controller.js.map