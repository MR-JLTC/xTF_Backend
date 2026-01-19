"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReschedulesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reschedule_entity_1 = require("../database/entities/reschedule.entity");
const reschedules_service_1 = require("./reschedules.service");
const reschedules_controller_1 = require("./reschedules.controller");
const booking_request_entity_1 = require("../database/entities/booking-request.entity");
const user_entity_1 = require("../database/entities/user.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
let ReschedulesModule = class ReschedulesModule {
};
exports.ReschedulesModule = ReschedulesModule;
exports.ReschedulesModule = ReschedulesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([reschedule_entity_1.Reschedule, booking_request_entity_1.BookingRequest, user_entity_1.User, notification_entity_1.Notification])],
        providers: [reschedules_service_1.ReschedulesService],
        controllers: [reschedules_controller_1.ReschedulesController],
        exports: [reschedules_service_1.ReschedulesService]
    })
], ReschedulesModule);
//# sourceMappingURL=reschedules.module.js.map