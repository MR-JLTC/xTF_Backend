import { ChangePasswordService } from './change-password.service';
export declare class RequestChangePasswordDto {
    currentPassword: string;
}
export declare class VerifyCodeAndChangePasswordDto {
    code: string;
    newPassword: string;
}
export declare class ChangePasswordController {
    private readonly changePasswordService;
    constructor(changePasswordService: ChangePasswordService);
    requestChangePassword(req: any, requestChangePasswordDto: RequestChangePasswordDto): Promise<{
        message: string;
    }>;
    verifyCodeAndChangePassword(req: any, verifyCodeAndChangePasswordDto: VerifyCodeAndChangePasswordDto): Promise<{
        message: string;
    }>;
}
