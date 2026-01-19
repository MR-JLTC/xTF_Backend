import { ReschedulesService } from './reschedules.service';
import { CreateRescheduleDto } from './dto/create-reschedule.dto';
export declare class ReschedulesController {
    private readonly reschedulesService;
    constructor(reschedulesService: ReschedulesService);
    propose(req: any, body: CreateRescheduleDto): Promise<{
        success: boolean;
        data: import("../database/entities/reschedule.entity").Reschedule;
    }>;
    listByBooking(bookingId: string): Promise<import("../database/entities/reschedule.entity").Reschedule[]>;
    getOne(id: string): Promise<import("../database/entities/reschedule.entity").Reschedule>;
    accept(req: any, id: string): Promise<{
        success: boolean;
        data: import("../database/entities/reschedule.entity").Reschedule;
    }>;
    reject(req: any, id: string): Promise<{
        success: boolean;
    }>;
    cancel(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
