import { Student } from './student.entity';
import { Tutor } from './tutor.entity';
import { BookingRequest } from './booking-request.entity';
import { Subject } from './subject.entity';
import { Payout } from './payout.entity';
export declare class Payment {
    payment_id: number;
    booking_request_id?: number;
    student_id: number;
    tutor_id: number;
    subject_id?: number;
    amount: number;
    status: 'pending' | 'paid' | 'disputed' | 'refunded' | 'confirmed';
    dispute_status: 'none' | 'open' | 'under_revision' | 'resolved' | 'rejected';
    payment_proof_url?: string;
    created_at: Date;
    student: Student;
    tutor: Tutor;
    bookingRequest?: BookingRequest;
    subject?: Subject;
    payouts: Payout[];
}
