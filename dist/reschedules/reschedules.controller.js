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
exports.ReschedulesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const reschedules_service_1 = require("./reschedules.service");
const create_reschedule_dto_1 = require("./dto/create-reschedule.dto");
let ReschedulesController = class ReschedulesController {
    constructor(reschedulesService) {
        this.reschedulesService = reschedulesService;
    }
    async propose(req, body) {
        const userId = req.user?.user_id;
        console.log('ReschedulesController.propose called by user:', userId, 'body:', body);
        const result = await this.reschedulesService.propose(userId, body);
        console.log('ReschedulesController.propose result:', result?.success ? 'ok' : 'fail');
        return result;
    }
    async listByBooking(bookingId) {
        return this.reschedulesService.listByBooking(+bookingId);
    }
    async getOne(id) {
        return this.reschedulesService.findById(+id);
    }
    async accept(req, id) {
        const userId = req.user?.user_id;
        return this.reschedulesService.accept(userId, +id);
    }
    async reject(req, id) {
        const userId = req.user?.user_id;
        return this.reschedulesService.reject(userId, +id);
    }
    async cancel(req, id) {
        const userId = req.user?.user_id;
        return this.reschedulesService.cancel(userId, +id);
    }
};
exports.ReschedulesController = ReschedulesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_reschedule_dto_1.CreateRescheduleDto]),
    __metadata("design:returntype", Promise)
], ReschedulesController.prototype, "propose", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReschedulesController.prototype, "listByBooking", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReschedulesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReschedulesController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReschedulesController.prototype, "reject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReschedulesController.prototype, "cancel", null);
exports.ReschedulesController = ReschedulesController = __decorate([
    (0, common_1.Controller)('reschedules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reschedules_service_1.ReschedulesService])
], ReschedulesController);
//# sourceMappingURL=reschedules.controller.js.map