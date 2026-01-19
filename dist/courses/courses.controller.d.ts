import { CoursesService } from './courses.service';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAllWithDetails(): Promise<import("../database/entities").Course[]>;
    findSubjectsForCourse(id: string): Promise<import("../database/entities").Subject[]>;
    createCourse(body: {
        course_name: string;
        university_id: number;
        acronym?: string;
    }): Promise<import("../database/entities").Course>;
    updateCourse(id: string, body: {
        course_name?: string;
        university_id?: number;
        acronym?: string;
    }): Promise<import("../database/entities").Course>;
    addSubjectToCourse(id: string, body: {
        subject_name: string;
    }): Promise<import("../database/entities").Subject>;
    updateSubject(courseId: string, subjectId: string, body: {
        subject_name?: string;
    }): Promise<import("../database/entities").Subject>;
    deleteCourse(id: string): Promise<{
        success: true;
    }>;
    deleteSubject(courseId: string, subjectId: string): Promise<{
        success: true;
    }>;
}
