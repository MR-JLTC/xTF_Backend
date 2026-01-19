import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { EmailVerificationRegistry } from '../database/entities/email-verification-registry.entity';
import { EmailService } from '../email/email.service';
export declare class EmailVerificationService {
    private userRepository;
    private emailVerificationRegistryRepository;
    private emailService;
    constructor(userRepository: Repository<User>, emailVerificationRegistryRepository: Repository<EmailVerificationRegistry>, emailService: EmailService);
    sendVerificationCode(email: string, user_type: 'tutor' | 'tutee' | 'admin'): Promise<{
        message: string;
    }>;
    getEmailVerificationStatus(email: string, user_type: 'tutor' | 'tutee' | 'admin'): Promise<{
        is_verified: number;
        user_id?: number;
        verification_expires?: Date;
    }>;
    verifyEmailCode(email: string, code: string, user_type: 'tutor' | 'tutee' | 'admin'): Promise<{
        message: string;
        user_id?: number;
    }>;
    private generateVerificationCode;
    private sendVerificationEmail;
}
