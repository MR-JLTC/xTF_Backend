import { SubjectApplication } from './subject-application.entity';
export declare class SubjectApplicationDocument {
    id: number;
    subjectApplication: SubjectApplication;
    file_url: string;
    file_name: string;
    file_type: string;
    created_at: Date;
}
