import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { PasswordResetToken } from '../database/entities/password-reset-token.entity';
export declare class ChangePasswordService {
    private userRepository;
    private passwordResetTokenRepository;
    constructor(userRepository: Repository<User>, passwordResetTokenRepository: Repository<PasswordResetToken>);
    requestChangePassword(userId: number, currentPassword: string): Promise<{
        message: string;
    }>;
    verifyCodeAndChangePassword(userId: number, code: string, newPassword: string): Promise<{
        message: string;
    }>;
    private sendChangePasswordEmail;
}
