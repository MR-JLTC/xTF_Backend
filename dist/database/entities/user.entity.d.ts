import { Admin } from './admin.entity';
import { Student } from './student.entity';
import { Tutor } from './tutor.entity';
import { BookingRequest } from './booking-request.entity';
import { PasswordResetToken } from './password-reset-token.entity';
export declare class User {
    user_id: number;
    name: string;
    email: string;
    password?: string;
    user_type: 'tutor' | 'tutee' | 'admin' | 'student';
    status: 'active' | 'inactive' | 'pending_verification';
    created_at: Date;
    profile_image_url: string;
    admin_profile: Admin;
    student_profile: Student;
    tutor_profile: Tutor;
    bookingRequests: BookingRequest[];
    passwordResetTokens: PasswordResetToken[];
}
