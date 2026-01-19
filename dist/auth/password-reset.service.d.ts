import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { PasswordResetToken } from '../database/entities/password-reset-token.entity';
import { EmailService } from '../email/email.service';
export declare class PasswordResetService {
    private userRepository;
    private passwordResetTokenRepository;
    private emailService;
    constructor(userRepository: Repository<User>, passwordResetTokenRepository: Repository<PasswordResetToken>, emailService: EmailService);
    private normalizeUserType;
    getUserTypeByEmail(email: string): Promise<'admin' | 'tutor' | 'tutee' | null>;
    requestPasswordReset(email: string, options?: {
        requiredUserType?: 'admin' | 'tutor' | 'tutee';
        excludeUserType?: 'admin' | 'tutor' | 'tutee';
    }): Promise<{
        message: string;
    }>;
    verifyCodeAndResetPassword(email: string, code: string, newPassword: string, options?: {
        requiredUserType?: 'admin' | 'tutor' | 'tutee';
        excludeUserType?: 'admin' | 'tutor' | 'tutee';
    }): Promise<{
        message: string;
    }>;
    private sendPasswordResetEmail;
}
