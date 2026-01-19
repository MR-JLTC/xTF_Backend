import { Course } from './course.entity';
import { TutorSubject } from './tutor-subject.entity';
export declare class Subject {
    subject_id: number;
    subject_name: string;
    course: Course;
    tutors: TutorSubject[];
}
