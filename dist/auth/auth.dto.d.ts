export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    university_id?: number;
    user_type?: 'tutor' | 'tutee' | 'admin';
    year_level?: number;
    course_id?: number;
    course_name?: string;
    bio?: string;
    gcash_number?: string;
    SessionRatePerHour?: number;
}
export declare class LoginDto {
    email: string;
    password: string;
}
