import { Student } from './student.entity';
import { Tutor } from './tutor.entity';
import { Session } from './session.entity';
export declare class Rating {
    rating_id: number;
    student: Student;
    tutor: Tutor;
    session: Session;
    rating: number;
    comment: string;
    created_at: Date;
}
