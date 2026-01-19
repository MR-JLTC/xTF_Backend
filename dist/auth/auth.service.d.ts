import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './auth.dto';
import { EmailVerificationService } from './email-verification.service';
import { TutorsService } from '../tutors/tutors.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailVerificationService;
    private tutorsService;
    constructor(usersService: UsersService, jwtService: JwtService, emailVerificationService: EmailVerificationService, tutorsService: TutorsService);
    validateUser(email: string, pass: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        user: any;
        accessToken: string;
    }>;
    loginTutorTutee(loginDto: LoginDto): Promise<{
        user: any;
        accessToken: string;
    }>;
    private determineUserType;
    register(registerDto: RegisterDto): Promise<{
        user: any;
        accessToken: string;
    }>;
    registerStudent(body: {
        name: string;
        email: string;
        password: string;
        university_id: number;
        course_id?: number;
        course_name?: string;
        year_level: number;
    }): Promise<{
        user: {
            role: string;
            user_id: number;
            name: string;
            email: string;
            password?: string;
            user_type: "tutor" | "tutee" | "admin" | "student";
            status: "active" | "inactive" | "pending_verification";
            created_at: Date;
            profile_image_url: string;
            admin_profile: import("../database/entities").Admin;
            student_profile: import("../database/entities").Student;
            tutor_profile: import("../database/entities").Tutor;
            bookingRequests: import("../database/entities").BookingRequest[];
            passwordResetTokens: import("../database/entities").PasswordResetToken[];
        };
        accessToken: string;
    }>;
}
