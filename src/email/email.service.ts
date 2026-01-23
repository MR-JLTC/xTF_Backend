import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private resendApiKey: string;
  private resendFromEmail: string;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || '';
    // Resend free tier usually requires domain verification. 
    // If you don't have a domain, you can use 'onboarding@resend.dev' to send to yourself,
    // but for production, you must verify your domain.
    this.resendFromEmail = process.env.EMAIL_FROM || 'TutorFriends <onboarding@resend.dev>';

    if (!this.resendApiKey) {
      console.error('❌ RESEND_API_KEY is not set. Emails will fail to send. Please get one at resend.com');
    }
  }

  async sendEmail(mailOptions: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      if (!this.resendApiKey) {
        throw new Error('Email service not configured. Missing RESEND_API_KEY on Render Dashboard.');
      }

      console.log(`--- Resend API Request ---`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendApiKey}`,
        },
        body: JSON.stringify({
          from: this.resendFromEmail,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error('❌ Resend API Error Response:', data);
        throw new Error(data.message || 'Failed to send email via Resend');
      }

      console.log('✅ Email sent successfully via Resend:', data.id);
      return true;
    } catch (error) {
      console.error('EmailService.sendEmail error:', error);
      throw error;
    }
  }

  async sendContactEmail(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.resendFromEmail,
        to: process.env.CONTACT_RECEIVER_EMAIL || this.resendFromEmail,
        replyTo: `${contactData.name} <${contactData.email}>`,
        subject: `Contact Form: ${contactData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">New Contact Form Submission</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #334155; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; color: #475569;">${contactData.message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                This message was sent from the TutorFriends contact form.
              </p>
            </div>
          </div>
        `,
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendTutorApplicationApprovalEmail(tutorData: {
    name: string;
    email: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.resendFromEmail,
        to: tutorData.email,
        subject: '🎉 Your Tutor Application Has Been Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background-color: #0ea5e9; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your tutor application has been approved</p>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Welcome to TutorFriends, ${tutorData.name}!</h2>
              <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                We're excited to inform you that your tutor application has been reviewed and approved! 
                You can now start offering tutoring services to students on our platform.
              </p>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #0ea5e9; margin-top: 0;">What's Next?</h3>
                <ul style="color: #475569; line-height: 1.6;">
                  <li>Log in to your tutor dashboard</li>
                  <li>Complete your profile setup</li>
                  <li>Set your availability schedule</li>
                  <li>Start receiving tutoring requests from students</li>
                </ul>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions, feel free to contact our support team.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>This email was sent from TutorFriends - Connecting Minds, Building Futures</p>
            </div>
          </div>
        `,
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending tutor application approval email:', error);
      return false;
    }
  }

  async sendSubjectApprovalEmail(tutorData: {
    name: string;
    email: string;
    subjectName: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.resendFromEmail,
        to: tutorData.email,
        subject: '✅ Your Subject Expertise Has Been Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background-color: #10b981; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Great News!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your subject expertise has been approved</p>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Subject Expertise Approved</h2>
              <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                Hello ${tutorData.name}, we're pleased to inform you that your subject expertise application has been reviewed and approved!
              </p>
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #10b981; margin-top: 0;">Approved Subject:</h3>
                <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; text-align: center; margin: 10px 0;">
                  <span style="color: #166534; font-weight: bold; font-size: 18px;">${tutorData.subjectName}</span>
                </div>
              </div>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #0ea5e9; margin-top: 0;">What This Means:</h3>
                <ul style="color: #475569; line-height: 1.6;">
                  <li>You can now offer tutoring sessions for <strong>${tutorData.subjectName}</strong></li>
                  <li>Students can book you for this subject</li>
                  <li>This subject will appear in your expertise list</li>
                </ul>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions, feel free to contact our support team.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>This email was sent from TutorFriends - Connecting Minds, Building Futures</p>
            </div>
          </div>
        `,
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending subject approval email:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      console.log('Attempting to send test email to:', to);
      console.log('Using From Email:', this.resendFromEmail);

      const mailOptions = {
        from: this.resendFromEmail,
        to: to,
        subject: 'TutorFriends Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0ea5e9;">Email Service Test</h2>
            <p>This is a test email from TutorFriends to verify that the Resend email service is working correctly.</p>
            <p>If you receive this email, the configuration is successful!</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0ea5e9;"><strong>✅ Resend Email Service is Working!</strong></p>
            </div>
          </div>
        `,
      };

      const success = await this.sendEmail(mailOptions);
      if (success) {
        console.log('Test email request accepted by Resend');
      }
      return success;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  async sendTutorApplicationRejectionEmail(tutorData: {
    name: string;
    email: string;
    adminNotes?: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.resendFromEmail,
        to: tutorData.email,
        subject: '❌ Your Tutor Application Status Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background-color: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">❌ Application Update</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your tutor application status has been updated</p>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Application Status Update</h2>
              <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                Hello ${tutorData.name}, we regret to inform you that your tutor application has not been approved at this time.
              </p>
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #ef4444; margin-top: 0;">Application Not Approved</h3>
                <p style="color: #475569; line-height: 1.6;">
                  After careful review, we have decided not to approve your tutor application.
                </p>
                ${tutorData.adminNotes && tutorData.adminNotes.trim().length > 0 ? `
                  <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border: 2px solid #ef4444;">
                    <h4 style="color: #991b1b; margin-top: 0; margin-bottom: 10px; font-size: 18px; font-weight: bold;">Rejection Reason:</h4>
                    <p style="color: #7f1d1d; line-height: 1.6; font-size: 15px; white-space: pre-wrap; margin: 0;">${tutorData.adminNotes.trim()}</p>
                  </div>
                ` : `
                  <p style="color: #475569; line-height: 1.6; margin-top: 15px;">
                    This decision was based on our current requirements and standards.
                  </p>
                `}
              </div>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #0ea5e9; margin-top: 0;">What's Next?</h3>
                <ul style="color: #475569; line-height: 1.6;">
                  <li>You can reapply in the future if you meet our requirements</li>
                  <li>Consider improving your qualifications and documentation</li>
                  <li>Contact our support team if you have questions about the decision</li>
                </ul>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions about this decision, feel free to contact our support team.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>This email was sent from TutorFriends - Connecting Minds, Building Futures</p>
            </div>
          </div>
        `,
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending tutor application rejection email:', error);
      return false;
    }
  }

  async sendSubjectRejectionEmail(tutorData: {
    name: string;
    email: string;
    subjectName: string;
    adminNotes?: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.resendFromEmail,
        to: tutorData.email,
        subject: '❌ Your Subject Expertise Application Status Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background-color: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">❌ Application Update</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your subject expertise application status has been updated</p>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Subject Expertise Application Update</h2>
              <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                Hello ${tutorData.name}, we regret to inform you that your subject expertise application has not been approved.
              </p>
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #ef4444; margin-top: 0;">Subject Not Approved:</h3>
                <div style="background-color: #fef7f7; padding: 15px; border-radius: 6px; text-align: center; margin: 10px 0;">
                  <span style="color: #991b1b; font-weight: bold; font-size: 18px;">${tutorData.subjectName}</span>
                </div>
                <p style="color: #475569; line-height: 1.6;">
                  After careful review, we have decided not to approve your expertise in this subject. 
                  This decision was based on our current requirements and standards.
                </p>
                ${tutorData.adminNotes ? `
                  <div style="background-color: #fef7f7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <h4 style="color: #991b1b; margin-top: 0;">Admin Notes:</h4>
                    <p style="color: #7f1d1d; line-height: 1.5;">${tutorData.adminNotes}</p>
                  </div>
                ` : ''}
              </div>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #0ea5e9; margin-top: 0;">What This Means:</h3>
                <ul style="color: #475569; line-height: 1.6;">
                  <li>You cannot offer tutoring sessions for <strong>${tutorData.subjectName}</strong> at this time</li>
                  <li>You can reapply for this subject expertise in the future</li>
                  <li>Consider providing additional documentation or qualifications</li>
                  <li>Contact our support team if you have questions about the decision</li>
                </ul>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions about this decision, feel free to contact our support team.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>This email was sent from TutorFriends - Connecting Minds, Building Futures</p>
            </div>
          </div>
        `,
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending subject rejection email:', error);
      return false;
    }
  }
}
