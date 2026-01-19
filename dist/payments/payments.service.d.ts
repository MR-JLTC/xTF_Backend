import { Repository } from 'typeorm';
import { Payment, Payout } from '../database/entities';
import { BookingRequest, Tutor, User, Student, Notification, Subject } from '../database/entities';
import { UpdatePaymentDisputeDto } from './payment.dto';
export declare class PaymentsService {
    private paymentsRepository;
    private payoutsRepository;
    private bookingRepository;
    private tutorsRepository;
    private usersRepository;
    private studentsRepository;
    private notificationRepository;
    private subjectRepository;
    constructor(paymentsRepository: Repository<Payment>, payoutsRepository: Repository<Payout>, bookingRepository: Repository<BookingRequest>, tutorsRepository: Repository<Tutor>, usersRepository: Repository<User>, studentsRepository: Repository<Student>, notificationRepository: Repository<Notification>, subjectRepository: Repository<Subject>);
    findAll(): Promise<Payment[]>;
    findAllPayouts(): Promise<Payout[]>;
    getCompletedBookingsWaitingForPayment(): Promise<any[]>;
    processAdminPayment(bookingId: number, receipt?: any): Promise<{
        success: boolean;
        payment: Payment;
        payout: Payout;
    }>;
    updateDispute(id: number, dto: UpdatePaymentDisputeDto): Promise<Payment>;
    submitProof(bookingId: number, adminId: number, amount: number, file: any): Promise<{
        success: boolean;
        payment_id: any;
        booking_id: any;
    }>;
    verifyPayment(id: number, status: 'confirmed' | 'rejected', adminProofFile?: any, rejectionReason?: string): Promise<{
        success: boolean;
    }>;
    confirmByTutor(id: number, tutorUserId: number): Promise<{
        success: boolean;
    }>;
    requestPayment(bookingId: number, tutorId: number, amount: number, subject?: string): Promise<{
        success: boolean;
        payment_id: any;
        booking_id: any;
    }>;
}
