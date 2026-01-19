import { Session } from './session.entity';
import { BookingRequest } from './booking-request.entity';
export declare class Notification {
    notification_id: number;
    userId: string;
    receiver_id?: number;
    userType: 'tutor' | 'tutee' | 'admin';
    session: Session;
    booking: BookingRequest;
    message: string;
    timestamp: Date;
    read: boolean;
    sessionDate: Date;
    subjectName: string;
}
