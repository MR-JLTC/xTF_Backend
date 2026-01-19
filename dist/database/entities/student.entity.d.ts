import { User } from './user.entity';
import { Payment } from './payment.entity';
import { Rating } from './rating.entity';
import { Session } from './session.entity';
import { University } from './university.entity';
import { Course } from './course.entity';
export declare class Student {
    student_id: number;
    university_id: number;
    course_id: number;
    year_level: number;
    user: User;
    university: University;
    course: Course;
    payments: Payment[];
    ratings: Rating[];
    sessions: Session[];
}
