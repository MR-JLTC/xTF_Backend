"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tutors_service_1 = require("./tutors.service");
const tutors_controller_1 = require("./tutors.controller");
const entities_1 = require("../database/entities");
const email_service_1 = require("../email/email.service");
let TutorsModule = class TutorsModule {
};
exports.TutorsModule = TutorsModule;
exports.TutorsModule = TutorsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([entities_1.Tutor, entities_1.User, entities_1.TutorDocument, entities_1.TutorAvailability, entities_1.TutorSubject, entities_1.TutorSubjectDocument, entities_1.Subject, entities_1.Course, entities_1.University, entities_1.SubjectApplication, entities_1.SubjectApplicationDocument, entities_1.BookingRequest, entities_1.Notification, entities_1.Payment, entities_1.Student, entities_1.Payout])],
        controllers: [tutors_controller_1.TutorsController],
        providers: [tutors_service_1.TutorsService, email_service_1.EmailService],
        exports: [tutors_service_1.TutorsService],
    })
], TutorsModule);
//# sourceMappingURL=tutors.module.js.map