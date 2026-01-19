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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const university_entity_1 = require("../database/entities/university.entity");
let CoursesService = class CoursesService {
    constructor(coursesRepository, subjectsRepository, universitiesRepository) {
        this.coursesRepository = coursesRepository;
        this.subjectsRepository = subjectsRepository;
        this.universitiesRepository = universitiesRepository;
    }
    findAllWithDetails() {
        return this.coursesRepository.find({ relations: ['university'] });
    }
    findSubjectsForCourse(courseId) {
        return this.subjectsRepository.find({
            where: { course: { course_id: courseId } },
        });
    }
    async createCourse(courseName, universityId, acronym) {
        const university = await this.universitiesRepository.findOne({ where: { university_id: universityId } });
        if (!university)
            throw new common_1.BadRequestException('University not found');
        const existingCourse = await this.coursesRepository.findOne({
            where: {
                course_name: courseName,
                university: { university_id: universityId }
            },
            relations: ['university']
        });
        if (existingCourse) {
            throw new common_1.BadRequestException(`Course "${courseName}" already exists for this university.`);
        }
        const courseWithMatchingAcronym = await this.coursesRepository
            .createQueryBuilder('course')
            .where('LOWER(course.acronym) = LOWER(:courseName)', { courseName })
            .andWhere('course.university_id = :universityId', { universityId })
            .getOne();
        if (courseWithMatchingAcronym) {
            throw new common_1.BadRequestException(`Course name "${courseName}" conflicts with an existing course acronym "${courseWithMatchingAcronym.acronym}" for this university.`);
        }
        const course = this.coursesRepository.create({ course_name: courseName, acronym: acronym || null, university });
        try {
            return await this.coursesRepository.save(course);
        }
        catch (error) {
            if (error.code === '23505' || error.message?.includes('UNIQUE constraint')) {
                throw new common_1.BadRequestException(`Course "${courseName}" already exists for this university.`);
            }
            throw error;
        }
    }
    async updateCourse(courseId, body) {
        const course = await this.coursesRepository.findOne({ where: { course_id: courseId }, relations: ['university'] });
        if (!course)
            throw new common_1.BadRequestException('Course not found');
        const newCourseName = body.course_name || course.course_name;
        const newUniversityId = body.university_id || course.university.university_id;
        if (body.course_name || body.university_id) {
            const existingCourse = await this.coursesRepository.findOne({
                where: {
                    course_name: newCourseName,
                    university: { university_id: newUniversityId }
                },
                relations: ['university']
            });
            if (existingCourse && existingCourse.course_id !== courseId) {
                throw new common_1.BadRequestException(`Course "${newCourseName}" already exists for this university.`);
            }
        }
        if (body.course_name) {
            const courseWithMatchingAcronym = await this.coursesRepository
                .createQueryBuilder('course')
                .where('LOWER(course.acronym) = LOWER(:courseName)', { courseName: newCourseName })
                .andWhere('course.university_id = :universityId', { universityId: newUniversityId })
                .andWhere('course.course_id != :courseId', { courseId })
                .getOne();
            if (courseWithMatchingAcronym) {
                throw new common_1.BadRequestException(`Course name "${newCourseName}" conflicts with an existing course acronym "${courseWithMatchingAcronym.acronym}" for this university.`);
            }
        }
        if (body.course_name)
            course.course_name = body.course_name;
        if (body.acronym !== undefined)
            course.acronym = body.acronym || null;
        if (body.university_id) {
            const uni = await this.universitiesRepository.findOne({ where: { university_id: body.university_id } });
            if (!uni)
                throw new common_1.BadRequestException('University not found');
            course.university = uni;
        }
        try {
            return await this.coursesRepository.save(course);
        }
        catch (error) {
            if (error.code === '23505' || error.message?.includes('UNIQUE constraint')) {
                throw new common_1.BadRequestException(`Course "${newCourseName}" already exists for this university.`);
            }
            throw error;
        }
    }
    async addSubjectToCourse(courseId, subjectName) {
        const course = await this.coursesRepository.findOne({ where: { course_id: courseId } });
        if (!course)
            throw new Error('Course not found');
        const subject = this.subjectsRepository.create({ subject_name: subjectName, course });
        return this.subjectsRepository.save(subject);
    }
    async updateSubject(courseId, subjectId, body) {
        const subject = await this.subjectsRepository.findOne({ where: { subject_id: subjectId }, relations: ['course'] });
        if (!subject || subject.course.course_id !== courseId)
            throw new Error('Subject not found for course');
        if (body.subject_name !== undefined)
            subject.subject_name = body.subject_name;
        return this.subjectsRepository.save(subject);
    }
    async deleteCourse(courseId) {
        await this.coursesRepository.delete({ course_id: courseId });
        return { success: true };
    }
    async deleteSubject(courseId, subjectId) {
        const subject = await this.subjectsRepository.findOne({ where: { subject_id: subjectId }, relations: ['course'] });
        if (!subject || subject.course.course_id !== courseId)
            throw new Error('Subject not found for course');
        await this.subjectsRepository.delete({ subject_id: subjectId });
        return { success: true };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Course)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Subject)),
    __param(2, (0, typeorm_1.InjectRepository)(university_entity_1.University)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CoursesService);
//# sourceMappingURL=courses.service.js.map