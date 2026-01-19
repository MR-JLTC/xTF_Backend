import { UsersService } from './users.service';
import { TutorsService } from '../tutors/tutors.service';
export declare class UsersController {
    private readonly usersService;
    private readonly tutorsService;
    constructor(usersService: UsersService, tutorsService: TutorsService);
    findAll(): Promise<{
        user_id: number;
        name: string;
        email: string;
        profile_image_url: string;
        university_id: number;
        course_id: number;
        university_name: string;
        university: import("../database/entities").University;
        course: import("../database/entities").Course;
        status: "active" | "inactive" | "pending_verification";
        created_at: Date;
        role: string;
        tutor_profile: {
            tutor_id: number;
            status: "pending" | "rejected" | "approved";
            activity_status: "online" | "offline";
        };
    }[]>;
    moveOverdueBookingsToSessions(): Promise<{
        moved: number;
    }>;
    testAuth(): Promise<{
        message: string;
        timestamp: string;
    }>;
    updateStatus(id: string, body: {
        status: 'active' | 'inactive';
    }): Promise<import("../database/entities").User>;
    resetPassword(id: string, body: {
        newPassword: string;
    }): Promise<{
        success: true;
    }>;
    updateUser(id: string, body: {
        name?: string;
        email?: string;
        status?: 'active' | 'inactive';
        year_level?: number;
        university_id?: number;
        profile_image_url?: string;
    }): Promise<import("../database/entities").User>;
    deleteUser(id: string): Promise<{
        success: true;
    }>;
    uploadProfileImage(id: string, file: any): Promise<{
        message: string;
        profile_image_url: string;
    }>;
    setPlaceholderProfileImage(id: string): Promise<{
        message: string;
        profile_image_url: any;
    }>;
    getMyBookings(req: any): Promise<import("../database/entities").BookingRequest[]>;
    getBookingsForUser(id: string): Promise<import("../database/entities").BookingRequest[]>;
    getNotifications(req: any): Promise<{
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
    getUnreadCount(req: any): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    getUpcomingSessions(req: any): Promise<{
        success: boolean;
        data: {
            hasUpcoming: boolean;
        };
    }>;
    getUpcomingSessionsList(req: any): Promise<{
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
    submitBookingFeedback(bookingId: string, req: any, body: {
        rating: number;
        comment?: string;
    }): Promise<{
        success: boolean;
    }>;
    confirmBookingCompletion(bookingId: string, req: any): Promise<{
        success: boolean;
    }>;
    markNotificationAsRead(id: string): Promise<{
        success: boolean;
    }>;
    markAllNotificationsAsRead(req: any): Promise<{
        success: boolean;
    }>;
    deleteNotification(id: string): Promise<{
        success: boolean;
    }>;
    getAdminsWithQr(): Promise<{
        success: boolean;
        data: {
            user_id: number;
            name: string;
            qr_code_url: string;
        }[];
    }>;
    getAdminProfile(id: string): Promise<{
        user_id: number;
        name: string;
        email: string;
        profile_image_url: string;
        created_at: any;
        university_id: any;
        university_name: any;
        qr_code_url: any;
    }>;
    uploadAdminQr(id: string, file: any): Promise<{
        success: boolean;
        qr_code_url: string;
    } | {
        success: boolean;
        message: string;
    }>;
}
