import { University } from './university.entity';
import { Subject } from './subject.entity';
import { Student } from './student.entity';
import { Tutor } from './tutor.entity';
export declare class Course {
    course_id: number;
    course_name: string;
    acronym: string;
    university_id: number;
    university: University;
    subjects: Subject[];
    students: Student[];
    tutors: Tutor[];
}
