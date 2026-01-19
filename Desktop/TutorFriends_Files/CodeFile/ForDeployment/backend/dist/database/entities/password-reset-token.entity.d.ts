import { User } from './user.entity';
export declare class PasswordResetToken {
    id: number;
    user_id: number;
    changepasscode: string;
    expiry_date: Date;
    is_used: boolean;
    created_at: Date;
    user: User;
}
