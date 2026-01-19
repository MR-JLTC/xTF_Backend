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
exports.AppModule = exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const universities_module_1 = require("./universities/universities.module");
const courses_module_1 = require("./courses/courses.module");
const tutors_module_1 = require("./tutors/tutors.module");
const payments_module_1 = require("./payments/payments.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const email_module_1 = require("./email/email.module");
const entities = require("./database/entities");
const landing_module_1 = require("./landing/landing.module");
const subjects_module_1 = require("./subjects/subjects.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reschedules_module_1 = require("./reschedules/reschedules.module");
let AppController = class AppController {
    getRoot() {
        return {
            message: 'TutorLink API is running!',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                courses: '/api/courses',
                universities: '/api/universities',
                tutors: '/api/tutors',
                payments: '/api/payments',
                dashboard: '/api/dashboard',
                email: '/api/email'
            }
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: Object.values(entities),
                synchronize: process.env.NODE_ENV !== 'production',
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            universities_module_1.UniversitiesModule,
            courses_module_1.CoursesModule,
            tutors_module_1.TutorsModule,
            payments_module_1.PaymentsModule,
            dashboard_module_1.DashboardModule,
            landing_module_1.LandingModule,
            subjects_module_1.SubjectsModule,
            email_module_1.EmailModule,
            notifications_module_1.NotificationsModule,
            reschedules_module_1.ReschedulesModule,
        ],
        controllers: [AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map