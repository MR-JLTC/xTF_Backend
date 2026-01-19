import { Repository } from 'typeorm';
import { Reschedule } from '../database/entities/reschedule.entity';
import { BookingRequest } from '../database/entities/booking-request.entity';
import { User } from '../database/entities/user.entity';
import { Notification } from '../database/entities/notification.entity';
import { CreateRescheduleDto } from './dto/create-reschedule.dto';
export declare class ReschedulesService {
    private rescheduleRepo;
    private bookingRepo;
    private userRepo;
    private notificationRepo;
    constructor(rescheduleRepo: Repository<Reschedule>, bookingRepo: Repository<BookingRequest>, userRepo: Repository<User>, notificationRepo: Repository<Notification>);
    propose(userId: number, dto: CreateRescheduleDto): Promise<{
        success: boolean;
        data: Reschedule;
    }>;
    listByBooking(bookingId: number): Promise<Reschedule[]>;
    findById(id: number): Promise<Reschedule>;
    accept(userId: number, rescheduleId: number): Promise<{
        success: boolean;
        data: Reschedule;
    }>;
    reject(userId: number, rescheduleId: number): Promise<{
        success: boolean;
    }>;
    cancel(userId: number, rescheduleId: number): Promise<{
        success: boolean;
    }>;
}
