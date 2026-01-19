import { Course } from './course.entity';
import { Admin } from './admin.entity';
import { Student } from './student.entity';
import { Tutor } from './tutor.entity';
export declare class University {
    university_id: number;
    name: string;
    acronym: string;
    email_domain: string;
    logo_url: string;
    status: 'active' | 'inactive';
    admins: Admin[];
    students: Student[];
    tutors: Tutor[];
    courses: Course[];
}
