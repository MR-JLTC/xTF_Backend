import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
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
    login(loginDto: LoginDto): Promise<{
        user: any;
        accessToken: string;
    }>;
    getAdminAvailability(): Promise<{
        hasAdmin: boolean;
        canRegister: boolean;
    }>;
    loginTutorTutee(loginDto: LoginDto): Promise<{
        user: any;
        accessToken: string;
    }>;
}
