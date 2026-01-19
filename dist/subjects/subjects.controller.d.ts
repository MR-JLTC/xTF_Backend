import { Repository } from 'typeorm';
import { Subject } from '../database/entities';
export declare class SubjectsController {
    private readonly subjectRepo;
    constructor(subjectRepo: Repository<Subject>);
    list(universityId?: string, courseId?: string): Promise<{
        subject_id: number;
        subject_name: string;
    }[]>;
}
