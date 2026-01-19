import { PaymentsService } from './payments.service';
import { UpdatePaymentDisputeDto } from './payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    requestPayment(body: {
        bookingId: number;
        tutorId: number;
        amount: number;
        subject?: string;
    }): Promise<{
        success: boolean;
        payment_id: any;
        booking_id: any;
    }>;
    findAll(): Promise<import("../database/entities").Payment[]>;
    findAllPayouts(): Promise<import("../database/entities").Payout[]>;
    updateDispute(id: string, dto: UpdatePaymentDisputeDto): Promise<import("../database/entities").Payment>;
    submitProof(body: {
        bookingId: string;
        adminId: string;
        amount: string;
    }, file: any): Promise<{
        success: boolean;
        payment_id: any;
        booking_id: any;
    }>;
    verifyPayment(id: string, body: {
        status: 'confirmed' | 'rejected';
        rejection_reason?: string;
    }, adminProof?: any): Promise<{
        success: boolean;
    }>;
    confirmByTutor(id: string, req: any): Promise<{
        success: boolean;
    }>;
    getCompletedBookingsWaitingForPayment(): Promise<any[]>;
    processAdminPayment(bookingId: string, receipt?: any): Promise<{
        success: boolean;
        payment: import("../database/entities").Payment;
        payout: import("../database/entities").Payout;
    }>;
}
