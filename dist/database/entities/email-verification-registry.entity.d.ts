export declare class EmailVerificationRegistry {
    registry_id: number;
    email: string;
    user_type: 'tutor' | 'tutee' | 'admin';
    verification_code: string;
    verification_expires: Date;
    is_verified: boolean;
    created_at: Date;
}
