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
exports.UniversitiesController = void 0;
const common_1 = require("@nestjs/common");
const universities_service_1 = require("./universities.service");
const university_dto_1 = require("./university.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
let UniversitiesController = class UniversitiesController {
    constructor(universitiesService) {
        this.universitiesService = universitiesService;
    }
    create(createUniversityDto) {
        return this.universitiesService.create(createUniversityDto);
    }
    findAll() {
        return this.universitiesService.findAll();
    }
    update(id, updateUniversityDto) {
        return this.universitiesService.update(+id, updateUniversityDto);
    }
    async uploadLogo(id, file) {
        const relPath = `/user_profile_images/universities/${file.filename}`;
        const updated = await this.universitiesService.update(+id, { logo_url: relPath });
        return { success: true, logo_url: relPath, university: updated };
    }
    remove(id) {
        return this.universitiesService.remove(+id);
    }
};
exports.UniversitiesController = UniversitiesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [university_dto_1.CreateUniversityDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, university_dto_1.UpdateUniversityDto]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                const dir = path.resolve(process.cwd(), 'user_profile_images', 'universities');
                try {
                    fs.mkdirSync(dir, { recursive: true });
                }
                catch { }
                cb(null, dir);
            },
            filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname) || '.png';
                const name = `uni_${Date.now()}${ext}`;
                cb(null, name);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversitiesController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "remove", null);
exports.UniversitiesController = UniversitiesController = __decorate([
    (0, common_1.Controller)('universities'),
    __metadata("design:paramtypes", [universities_service_1.UniversitiesService])
], UniversitiesController);
//# sourceMappingURL=universities.controller.js.map