import { BookingRequest } from './booking-request.entity';
import { User } from './user.entity';
export declare class Reschedule {
    reschedule_id: number;
    booking: BookingRequest;
    proposer_user_id: number;
    proposer?: User;
    proposedDate: Date;
    proposedTime: string;
    proposedDuration?: number;
    originalDate?: Date;
    originalTime?: string;
    originalDuration?: number;
    reason?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    receiver_user_id?: number;
    created_at: Date;
    updated_at: Date;
}
