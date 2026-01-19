import { PasswordResetService } from './password-reset.service';
export declare class TestPasswordResetDto {
    email: string;
}
export declare class TestPasswordResetController {
    private readonly passwordResetService;
    constructor(passwordResetService: PasswordResetService);
    debugPasswordReset(testPasswordResetDto: TestPasswordResetDto): Promise<{
        success: boolean;
        message: string;
        result: {
            message: string;
        };
    }>;
}
