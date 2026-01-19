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
exports.UniversitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let UniversitiesService = class UniversitiesService {
    constructor(universitiesRepository) {
        this.universitiesRepository = universitiesRepository;
    }
    create(createUniversityDto) {
        const university = this.universitiesRepository.create(createUniversityDto);
        return this.universitiesRepository.save(university);
    }
    findAll() {
        return this.universitiesRepository.find();
    }
    async update(id, updateUniversityDto) {
        const university = await this.universitiesRepository.preload({
            university_id: id,
            ...updateUniversityDto,
        });
        if (!university) {
            throw new common_1.NotFoundException(`University with ID ${id} not found`);
        }
        return this.universitiesRepository.save(university);
    }
    async remove(id) {
        const uni = await this.universitiesRepository.findOne({ where: { university_id: id } });
        if (!uni) {
            throw new common_1.NotFoundException(`University with ID ${id} not found`);
        }
        try {
            await this.universitiesRepository.delete({ university_id: id });
        }
        catch (error) {
            throw new common_1.BadRequestException('Unable to delete this university because it has related courses or subjects. Please remove them first or set the university status to Inactive.');
        }
        return { success: true };
    }
};
exports.UniversitiesService = UniversitiesService;
exports.UniversitiesService = UniversitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.University)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UniversitiesService);
//# sourceMappingURL=universities.service.js.map