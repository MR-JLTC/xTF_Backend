"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const password_reset_service_1 = require("./password-reset.service");
const password_reset_controller_1 = require("./password-reset.controller");
const change_password_service_1 = require("./change-password.service");
const change_password_controller_1 = require("./change-password.controller");
const test_password_reset_controller_1 = require("./test-password-reset.controller");
const email_verification_service_1 = require("./email-verification.service");
const email_verification_controller_1 = require("./email-verification.controller");
const users_module_1 = require("../users/users.module");
const tutors_module_1 = require("../tutors/tutors.module");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./jwt.strategy");
const user_entity_1 = require("../database/entities/user.entity");
const password_reset_token_entity_1 = require("../database/entities/password-reset-token.entity");
const email_verification_registry_entity_1 = require("../database/entities/email-verification-registry.entity");
const email_module_1 = require("../email/email.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, password_reset_token_entity_1.PasswordResetToken, email_verification_registry_entity_1.EmailVerificationRegistry]),
            users_module_1.UsersModule,
            tutors_module_1.TutorsModule,
            email_module_1.EmailModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'SECRET_KEY_REPLACE_IN_PROD',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        controllers: [auth_controller_1.AuthController, password_reset_controller_1.PasswordResetController, change_password_controller_1.ChangePasswordController, test_password_reset_controller_1.TestPasswordResetController, email_verification_controller_1.EmailVerificationController],
        providers: [auth_service_1.AuthService, password_reset_service_1.PasswordResetService, change_password_service_1.ChangePasswordService, email_verification_service_1.EmailVerificationService, jwt_strategy_1.JwtStrategy],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map