import { EmailVerificationService } from './email-verification.service';
export declare class SendVerificationCodeDto {
    email: string;
    user_type: 'tutor' | 'tutee' | 'admin';
}
export declare class VerifyEmailCodeDto {
    email: string;
    code: string;
    user_type: 'tutor' | 'tutee' | 'admin';
}
export declare class EmailVerificationController {
    private readonly emailVerificationService;
    constructor(emailVerificationService: EmailVerificationService);
    sendVerificationCode(sendVerificationCodeDto: SendVerificationCodeDto): Promise<{
        message: string;
    }>;
    getEmailVerificationStatus(email: string, user_type: 'tutor' | 'tutee' | 'admin'): Promise<{
        is_verified: number;
        user_id?: number;
        verification_expires?: Date;
    }>;
    verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto): Promise<{
        message: string;
        user_id?: number;
    }>;
}
