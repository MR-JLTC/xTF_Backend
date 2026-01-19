import { Repository } from 'typeorm';
import { User, Admin, Tutor, Course, University, Student, Notification, BookingRequest, Session, Subject } from '../database/entities';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from '../auth/auth.dto';
export declare class UsersService {
    private usersRepository;
    private adminRepository;
    private tutorRepository;
    private coursesRepository;
    private universitiesRepository;
    private studentRepository;
    private notificationRepository;
    private bookingRequestRepository;
    private sessionRepository;
    private subjectRepository;
    private notificationsService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, adminRepository: Repository<Admin>, tutorRepository: Repository<Tutor>, coursesRepository: Repository<Course>, universitiesRepository: Repository<University>, studentRepository: Repository<Student>, notificationRepository: Repository<Notification>, bookingRequestRepository: Repository<BookingRequest>, sessionRepository: Repository<Session>, subjectRepository: Repository<Subject>, notificationsService: NotificationsService);
    findAll(): Promise<User[]>;
    moveOverdueBookingsToSessions(): Promise<{
        moved: number;
    }>;
    handleMoveOverdueBookingsCron(): Promise<void>;
    findOneById(id: number): Promise<User | undefined>;
    findOneByEmail(email: string): Promise<User | undefined>;
    hasAdmin(): Promise<boolean>;
    createAdmin(registerDto: RegisterDto): Promise<User>;
    submitBookingFeedback(bookingId: number, studentUserId: number, rating: number, comment: string): Promise<{
        success: boolean;
    }>;
    confirmBookingCompletion(bookingId: number, studentUserId: number): Promise<{
        success: boolean;
    }>;
    isAdmin(userId: number): Promise<boolean>;
    getAdminProfile(userId: number): Promise<{
        user_id: number;
        name: string;
        email: string;
        profile_image_url: string;
        created_at: any;
        university_id: any;
        university_name: any;
        qr_code_url: any;
    }>;
    updateAdminQr(userId: number, qrUrl: string): Promise<{
        success: boolean;
        qr_code_url: string;
    }>;
    getAdminsWithQr(): Promise<Array<{
        user_id: number;
        name: string;
        qr_code_url: string;
    }>>;
    findTutorProfile(userId: number): Promise<Tutor | null>;
    updatePassword(userId: number, hashedPassword: string): Promise<void>;
    updateStatus(userId: number, status: 'active' | 'inactive'): Promise<User>;
    resetPassword(userId: number, newPassword: string): Promise<{
        success: true;
    }>;
    updateUser(userId: number, body: {
        name?: string;
        email?: string;
        status?: 'active' | 'inactive';
        year_level?: number;
        university_id?: number;
        profile_image_url?: string;
    }): Promise<User>;
    deleteUser(userId: number): Promise<{
        success: true;
    }>;
    createStudent(body: RegisterDto): Promise<User>;
    createTutor(body: RegisterDto): Promise<User>;
    getNotifications(userId: number): Promise<{
        success: boolean;
        data: {
            notification_id: any;
            user_id: any;
            booking_id: any;
            title: any;
            message: any;
            type: "payment" | "upcoming_session" | "booking_update" | "system";
            is_read: any;
            created_at: any;
            scheduled_for: string;
            metadata: {
                session_date: string;
                subject: any;
                tutor_name: any;
                student_name: any;
            };
        }[];
    }>;
    getUnreadNotificationCount(userId: number): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    hasUpcomingSessions(userId: number): Promise<{
        success: boolean;
        data: {
            hasUpcoming: boolean;
        };
    }>;
    getUpcomingSessionsList(userId: number): Promise<{
        success: boolean;
        data: {
            id: any;
            subject: any;
            date: any;
            time: any;
            duration: any;
            status: any;
            created_at: any;
            tutor_name: any;
            student_name: any;
        }[];
    }>;
    markNotificationAsRead(notificationId: number): Promise<{
        success: boolean;
    }>;
    markAllNotificationsAsRead(userId: number): Promise<{
        success: boolean;
    }>;
    markBookingFinished(bookingId: number): Promise<{
        success: boolean;
    }>;
}
