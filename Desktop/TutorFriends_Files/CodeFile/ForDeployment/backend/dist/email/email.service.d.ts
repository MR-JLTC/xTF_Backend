export declare class EmailService {
    private transporter;
    private gmailUser;
    constructor();
    sendContactEmail(contactData: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<boolean>;
    sendTutorApplicationApprovalEmail(tutorData: {
        name: string;
        email: string;
    }): Promise<boolean>;
    sendSubjectApprovalEmail(tutorData: {
        name: string;
        email: string;
        subjectName: string;
    }): Promise<boolean>;
    sendTestEmail(to: string): Promise<boolean>;
    sendTutorApplicationRejectionEmail(tutorData: {
        name: string;
        email: string;
        adminNotes?: string;
    }): Promise<boolean>;
    sendSubjectRejectionEmail(tutorData: {
        name: string;
        email: string;
        subjectName: string;
        adminNotes?: string;
    }): Promise<boolean>;
}
