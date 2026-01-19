import { TutorSubject } from './tutor-subject.entity';
export declare class TutorSubjectDocument {
    id: number;
    tutorSubject: TutorSubject;
    file_url: string;
    file_name: string;
    file_type: string;
    created_at: Date;
}
