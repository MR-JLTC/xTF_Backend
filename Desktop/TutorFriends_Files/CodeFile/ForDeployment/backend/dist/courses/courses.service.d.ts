import { Repository } from 'typeorm';
import { Course, Subject } from '../database/entities';
import { University } from '../database/entities/university.entity';
export declare class CoursesService {
    private coursesRepository;
    private subjectsRepository;
    private universitiesRepository;
    constructor(coursesRepository: Repository<Course>, subjectsRepository: Repository<Subject>, universitiesRepository: Repository<University>);
    findAllWithDetails(): Promise<Course[]>;
    findSubjectsForCourse(courseId: number): Promise<Subject[]>;
    createCourse(courseName: string, universityId: number, acronym?: string): Promise<Course>;
    updateCourse(courseId: number, body: {
        course_name?: string;
        university_id?: number;
        acronym?: string;
    }): Promise<Course>;
    addSubjectToCourse(courseId: number, subjectName: string): Promise<Subject>;
    updateSubject(courseId: number, subjectId: number, body: {
        subject_name?: string;
    }): Promise<Subject>;
    deleteCourse(courseId: number): Promise<{
        success: true;
    }>;
    deleteSubject(courseId: number, subjectId: number): Promise<{
        success: true;
    }>;
}
