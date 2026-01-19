import { Payment } from './payment.entity';
import { Tutor } from './tutor.entity';
export declare class Payout {
    payout_id: number;
    payment_id: number;
    tutor_id: number;
    amount_released: number;
    status: 'pending' | 'released' | 'failed';
    release_proof_url?: string;
    rejection_reason?: string;
    admin_notes?: string;
    created_at: Date;
    payment: Payment;
    tutor: Tutor;
}
