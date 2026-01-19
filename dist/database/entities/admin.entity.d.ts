import { User } from './user.entity';
import { University } from './university.entity';
export declare class Admin {
    admin_id: number;
    university_id: number;
    user: User;
    university: University;
    qr_code_url?: string;
}
