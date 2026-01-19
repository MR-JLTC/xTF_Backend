import { PasswordResetService } from './password-reset.service';
export declare class RequestPasswordResetDto {
    email: string;
}
export declare class VerifyCodeAndResetPasswordDto {
    email: string;
    code: string;
    newPassword: string;
}
export declare class PasswordResetController {
    private readonly passwordResetService;
    constructor(passwordResetService: PasswordResetService);
    checkUserType(email: string): Promise<{
        userType: "tutor" | "tutee" | "admin";
    }>;
    requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    requestAdminPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    verifyCodeAndResetPassword(verifyCodeAndResetPasswordDto: VerifyCodeAndResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyAdminCodeAndResetPassword(verifyCodeAndResetPasswordDto: VerifyCodeAndResetPasswordDto): Promise<{
        message: string;
    }>;
}
