import { Tutor } from './tutor.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';
export declare class BookingRequest {
    id: number;
    tutor: Tutor;
    student: User;
    subject: string;
    date: Date;
    time: string;
    duration: number;
    status: 'pending' | 'accepted' | 'declined' | 'awaiting_payment' | 'payment_pending' | 'admin_payment_pending' | 'payment_rejected' | 'payment_approved' | 'awaiting_confirmation' | 'upcoming' | 'completed' | 'cancelled';
    payment_proof: string;
    session_proof_url?: string;
    tutor_marked_done_at?: Date;
    tutee_marked_done_at?: Date;
    student_notes: string;
    created_at: Date;
    updated_at: Date;
    tutee_rating?: number;
    tutee_comment?: string;
    tutee_feedback_at?: Date;
    payments?: Payment[];
}
