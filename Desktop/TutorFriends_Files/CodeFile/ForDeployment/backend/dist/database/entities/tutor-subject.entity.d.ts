import { Tutor } from './tutor.entity';
import { Subject } from './subject.entity';
import { TutorSubjectDocument } from './tutor-subject-document.entity';
export declare class TutorSubject {
    tutor_subject_id: number;
    tutor: Tutor;
    subject: Subject;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string;
    documents: TutorSubjectDocument[];
    created_at: Date;
    updated_at: Date;
}
