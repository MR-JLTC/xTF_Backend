import { EmailService } from './email.service';
export declare class ContactDto {
    name: string;
    email: string;
    subject: string;
    message: string;
}
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendContactEmail(contactData: ContactDto): Promise<{
        message: string;
    }>;
    sendTestEmail(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
}
