import { Tutor } from './tutor.entity';
import { SubjectApplicationDocument } from './subject-application-document.entity';
export declare class SubjectApplication {
    id: number;
    tutor: Tutor;
    subject_name: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string;
    documents: SubjectApplicationDocument[];
    created_at: Date;
    updated_at: Date;
}
