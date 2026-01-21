import { TutorsService } from './tutors.service';
import { BookingRequest } from '../database/entities';
export declare class TutorsController {
    private readonly tutorsService;
    constructor(tutorsService: TutorsService);
    findPendingApplications(): Promise<import("../database/entities").Tutor[]>;
    getAllPendingTutorSubjects(): Promise<import("../database/entities").TutorSubject[]>;
    updateStatus(id: string, body: {
        status: 'approved' | 'rejected';
        adminNotes?: string;
    }): Promise<import("../database/entities").Tutor>;
    updateTutorSubjectStatus(tutorSubjectId: string, body: {
        status: 'approved' | 'rejected';
        adminNotes?: string;
    }): Promise<import("../database/entities").TutorSubject>;
    applyTutor(body: {
        email: string;
        password: string;
        university_id: number;
        course_id?: number;
        course_name?: string;
        name?: string;
        bio?: string;
    }): Promise<{
        success: true;
        user_id: number;
        tutor_id: number;
    }>;
    getDocuments(tutorId: string): Promise<{
        id: number;
        document_id: number;
        file_url: string;
        file_name: string;
        file_type: string;
    }[]>;
    uploadDocuments(tutorId: string, files: any[]): Promise<{
        success: boolean;
    }>;
    uploadProfileImage(tutorId: string, file: any): Promise<{
        success: boolean;
        profile_image_url: string;
    }>;
    saveAvailability(tutorId: string, body: {
        slots: {
            day_of_week: string;
            start_time: string;
            end_time: string;
        }[];
    }): Promise<{
        success: boolean;
    }>;
    saveSubjects(tutorId: string, body: {
        subjects: string[];
        course_id?: number;
    }): Promise<{
        success: boolean;
        subjects_saved: number;
        tutor_subject_ids: number[];
    }>;
    getTutorIdByUserId(userId: string): Promise<{
        tutor_id: number;
    }>;
    updateOnlineStatus(userId: string, body: {
        status: 'online' | 'offline';
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getTutorByEmail(email: string): Promise<{
        tutor_id: number;
        user_id: number;
        user_type: string;
    }>;
    updateTutor(tutorId: string, body: {
        full_name?: string;
        university_id?: number;
        course_id?: number;
        course_name?: string;
        bio?: string;
        year_level?: string;
        gcash_number?: string;
        session_rate_per_hour?: number;
    }): Promise<{
        success: true;
    }>;
    updateExistingUserToTutor(userId: string, body: {
        full_name?: string;
        university_id?: number;
        course_id?: number;
        course_name?: string;
        bio?: string;
        year_level?: string;
        gcash_number?: string;
    }): Promise<{
        success: true;
        tutor_id: number;
    }>;
    getTutorStatusByUserId(userId: string): Promise<{
        is_verified: boolean;
        status: string;
        admin_notes: any;
    }>;
    getTutorStatus(tutorId: string): Promise<{
        is_verified: boolean;
        status: string;
        admin_notes: any;
    }>;
    getTutorProfile(tutorId: string): Promise<{
        bio: string;
        profile_photo: string;
        gcash_number: string;
        gcash_qr: string;
        session_rate_per_hour: number;
        course_id: number;
        subjects: string[];
        rating: number;
        total_reviews: number;
    }>;
    updateTutorProfile(tutorId: string, body: {
        bio?: string;
        gcash_number?: string;
    }): Promise<{
        success: boolean;
    }>;
    getTutorStatusByUserIdAlias(userId: string): Promise<{
        is_verified: boolean;
        status: string;
        admin_notes: any;
    }>;
    getTutorAvailability(tutorId: string): Promise<import("../database/entities").TutorAvailability[]>;
    getSubjectApplications(tutorId: string): Promise<{
        id: number;
        subject_name: string;
        status: "pending" | "rejected" | "approved";
        admin_notes: string;
        created_at: Date;
        updated_at: Date;
        documents: import("../database/entities").TutorSubjectDocument[];
    }[]>;
    submitSubjectApplication(tutorId: string, body: any, files?: any[]): Promise<{
        success: boolean;
        message: string;
        tutorSubjectId?: undefined;
    } | {
        success: boolean;
        tutorSubjectId: any;
        message?: undefined;
    }>;
    getBookingRequests(tutorId: string): Promise<BookingRequest[]>;
    createBookingRequest(tutorId: string, body: {
        subject: string;
        date: string;
        time: string;
        duration: number;
        student_notes?: string;
    }, req: any): Promise<{
        success: boolean;
        bookingId: any;
    }>;
    acceptBookingRequest(bookingId: string): Promise<{
        success: boolean;
    }>;
    declineBookingRequest(bookingId: string): Promise<{
        success: boolean;
    }>;
    approvePayment(bookingId: string): Promise<{
        success: boolean;
    }>;
    rejectPayment(bookingId: string): Promise<{
        success: boolean;
    }>;
    uploadPaymentProof(bookingId: string, file: any): Promise<{
        success: boolean;
        payment_proof: string;
    }>;
    completeBooking(bookingId: string, file: any, body: {
        status?: string;
    }): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    getTutorSessions(tutorId: string): Promise<any[]>;
    getTutorPayments(tutorId: string): Promise<{
        id: any;
        payment_id: any;
        booking_request_id: any;
        subject_id: any;
        subject_name: any;
        amount: number;
        status: any;
        created_at: any;
        student_name: any;
        student_id: any;
        tutor_id: any;
        dispute_status: any;
    }[]>;
    getTutorPayouts(tutorId: string): Promise<{
        payout_id: any;
        payment_id: any;
        tutor_id: any;
        amount_released: number;
        status: any;
        release_proof_url: any;
        rejection_reason: any;
        admin_notes: any;
        created_at: any;
    }[]>;
    getTutorEarningsStats(tutorId: string): Promise<{
        total_earnings: number;
        pending_earnings: number;
        completed_sessions: number;
        average_rating: number;
        total_hours: number;
    }>;
    uploadGcashQR(tutorId: string, file: any): Promise<{
        success: boolean;
        gcash_qr_url: string;
    }>;
    setProfileImagePlaceholder(tutorId: string): Promise<{
        success: boolean;
        profile_image_url: string;
    }>;
    setGcashQRPlaceholder(tutorId: string): Promise<{
        success: boolean;
        gcash_qr_url: string;
    }>;
}
