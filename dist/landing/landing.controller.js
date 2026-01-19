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
exports.LandingController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let LandingController = class LandingController {
    constructor(studentsRepo, tutorsRepo, universitiesRepo, coursesRepo, bookingRequestsRepo) {
        this.studentsRepo = studentsRepo;
        this.tutorsRepo = tutorsRepo;
        this.universitiesRepo = universitiesRepo;
        this.coursesRepo = coursesRepo;
        this.bookingRequestsRepo = bookingRequestsRepo;
    }
    async stats() {
        const [students, tutors, universities, courses, sessions] = await Promise.all([
            this.studentsRepo.count(),
            this.tutorsRepo.count(),
            this.universitiesRepo.count(),
            this.coursesRepo.count(),
            this.bookingRequestsRepo.count({ where: { status: 'completed' } }),
        ]);
        return { students, tutors, universities, courses, sessions };
    }
};
exports.LandingController = LandingController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingController.prototype, "stats", null);
exports.LandingController = LandingController = __decorate([
    (0, common_1.Controller)('landing'),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Tutor)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.University)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Course)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LandingController);
//# sourceMappingURL=landing.controller.js.map