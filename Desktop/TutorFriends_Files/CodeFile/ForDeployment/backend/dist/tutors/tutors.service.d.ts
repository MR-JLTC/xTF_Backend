import { Repository } from 'typeorm';
import { Tutor, User, TutorDocument, TutorAvailability, TutorSubject, TutorSubjectDocument, Subject, Course, University, SubjectApplication, SubjectApplicationDocument, BookingRequest, Notification, Payment, Student, Payout } from '../database/entities';
import { EmailService } from '../email/email.service';
export declare class TutorsService {
    private tutorsRepository;
    private usersRepository;
    private coursesRepository;
    private universitiesRepository;
    private documentsRepository;
    private availabilityRepository;
    private tutorSubjectRepository;
    private tutorSubjectDocumentRepository;
    private subjectRepository;
    private subjectApplicationRepository;
    private subjectApplicationDocumentRepository;
    private bookingRequestRepository;
    private notificationRepository;
    private paymentRepository;
    private payoutRepository;
    private studentRepository;
    private emailService;
    constructor(tutorsRepository: Repository<Tutor>, usersRepository: Repository<User>, coursesRepository: Repository<Course>, universitiesRepository: Repository<University>, documentsRepository: Repository<TutorDocument>, availabilityRepository: Repository<TutorAvailability>, tutorSubjectRepository: Repository<TutorSubject>, tutorSubjectDocumentRepository: Repository<TutorSubjectDocument>, subjectRepository: Repository<Subject>, subjectApplicationRepository: Repository<SubjectApplication>, subjectApplicationDocumentRepository: Repository<SubjectApplicationDocument>, bookingRequestRepository: Repository<BookingRequest>, notificationRepository: Repository<Notification>, paymentRepository: Repository<Payment>, payoutRepository: Repository<Payout>, studentRepository: Repository<Student>, emailService: EmailService);
    findPendingApplications(): Promise<Tutor[]>;
    updateStatus(id: number, status: 'approved' | 'rejected', adminNotes?: string): Promise<Tutor>;
    getTutorByEmail(email: string): Promise<{
        tutor_id: number;
        user_id: number;
        user_type: string;
    }>;
    updateExistingUserToTutor(userId: number, data: {
        full_name?: string;
        university_id?: number;
        course_id?: number;
        course_name?: string;
        bio?: string;
        year_level?: number;
        gcash_number?: string;
    }): Promise<{
        success: true;
        tutor_id: number;
    }>;
    updateTutor(tutorId: number, data: {
        full_name?: string;
        university_id?: number;
        course_id?: number;
        course_name?: string;
        bio?: string;
        year_level?: number;
        gcash_number?: string;
        session_rate_per_hour?: number;
    }): Promise<{
        success: true;
    }>;
    applyTutor(data: {
        email: string;
        password: string;
        university_id: number;
        course_id?: number;
        course_name?: string;
        name?: string;
        bio?: string;
        year_level?: string;
        gcash_number?: string;
    }): Promise<{
        success: true;
        user_id: number;
        tutor_id: number;
    }>;
    getDocuments(tutorId: number): Promise<{
        id: number;
        document_id: number;
        file_url: string;
        file_name: string;
        file_type: string;
    }[]>;
    saveDocuments(tutorId: number, files: any[]): Promise<{
        success: boolean;
    }>;
    saveProfileImage(tutorId: number, file: any): Promise<{
        success: boolean;
        profile_image_url: string;
    }>;
    saveGcashQR(tutorId: number, file: any): Promise<{
        success: boolean;
        gcash_qr_url: string;
    }>;
    saveAvailability(tutorIdOrUserId: number, slots: {
        day_of_week: string;
        start_time: string;
        end_time: string;
    }[]): Promise<{
        success: boolean;
    }>;
    saveSubjects(tutorId: number, subjectNames: string[], providedCourseId?: number): Promise<{
        success: boolean;
        subjects_saved: number;
        tutor_subject_ids: number[];
    }>;
    createBookingRequest(tutorId: number, studentUserId: number, data: {
        subject: string;
        date: string;
        time: string;
        duration: number;
        student_notes?: string;
    }): Promise<{
        success: boolean;
        bookingId: any;
    }>;
    getStudentBookingRequests(studentUserId: number): Promise<BookingRequest[]>;
    getTutorStatus(idParam: number): Promise<{
        is_verified: boolean;
        status: string;
        admin_notes: any;
    }>;
    getTutorId(userId: number): Promise<number>;
    updateOnlineStatus(userId: number, status: 'online' | 'offline'): Promise<void>;
    getTutorProfile(userId: number): Promise<{
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
    updateTutorProfile(userId: number, data: {
        bio?: string;
        gcash_number?: string;
    }): Promise<{
        success: boolean;
    }>;
    getTutorAvailability(userId: number): Promise<TutorAvailability[]>;
    getSubjectApplications(userId: number): Promise<{
        id: number;
        subject_name: string;
        status: "pending" | "rejected" | "approved";
        admin_notes: string;
        created_at: Date;
        updated_at: Date;
        documents: TutorSubjectDocument[];
    }[]>;
    getTutorSubjectApplications(tutorId: number): Promise<{
        id: number;
        subject_name: string;
        status: "pending" | "rejected" | "approved";
        admin_notes: string;
        created_at: Date;
        updated_at: Date;
        documents: TutorSubjectDocument[];
    }[]>;
    getAllPendingTutorSubjects(): Promise<TutorSubject[]>;
    updateTutorSubjectStatus(tutorSubjectId: number, status: 'approved' | 'rejected', adminNotes?: string): Promise<TutorSubject>;
    submitSubjectApplication(tutorId: number, subjectName: string, files: any[], isReapplication?: boolean): Promise<{
        success: boolean;
        message: string;
        tutorSubjectId?: undefined;
    } | {
        success: boolean;
        tutorSubjectId: any;
        message?: undefined;
    }>;
    getBookingRequests(userId: number): Promise<BookingRequest[]>;
    updateBookingRequestStatus(bookingId: number, status: 'accepted' | 'declined'): Promise<{
        success: boolean;
    }>;
    updatePaymentStatus(bookingId: number, status: 'approved' | 'rejected'): Promise<{
        success: boolean;
    }>;
    markBookingAsCompleted(bookingId: number, status: BookingRequest['status'], file: any): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    uploadPaymentProof(bookingId: number, file: any): Promise<{
        success: boolean;
        payment_proof: string;
    }>;
    getTutorSessions(userId: number): Promise<any[]>;
    getTutorPayments(userId: number): Promise<{
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
    getTutorPayouts(userId: number): Promise<{
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
    getTutorEarningsStats(userId: number): Promise<{
        total_earnings: number;
        pending_earnings: number;
        completed_sessions: number;
        average_rating: number;
        total_hours: number;
    }>;
    private deleteOldProfileImages;
    private deleteOldGcashQRFiles;
}
