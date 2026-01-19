import { Student } from './student.entity';
import { Tutor } from './tutor.entity';
import { Subject } from './subject.entity';
import { Rating } from './rating.entity';
export declare class Session {
    session_id: number;
    student: Student;
    tutor: Tutor;
    subject: Subject;
    start_time: Date;
    end_time: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: Date;
    ratings: Rating[];
}
