import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class EmailService {
  private gmailUser: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private oauth2Client: OAuth2Client;

  constructor() {
    this.gmailUser = process.env.GMAIL_USER || 'jactechnologies7@gmail.com';
    this.clientId = process.env.GMAIL_CLIENT_ID || '';
    this.clientSecret = process.env.GMAIL_CLIENT_SECRET || '';
    this.refreshToken = process.env.GMAIL_REFRESH_TOKEN || '';

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      console.error('❌ Gmail API credentials missing (Client ID, Secret, or Refresh Token).');
    }

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      'https://developers.google.com/oauthplayground', // Common redirect URI used for generating tokens
    );

    this.oauth2Client.setCredentials({
      refresh_token: this.refreshToken,
    });
  }

  async sendEmail(mailOptions: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      console.log(`--- Gmail Googleapis Request ---`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const utf8Subject = `=?utf-8?B?${Buffer.from(mailOptions.subject).toString('base64')}?=`;
      const messageParts = [
        `From: "TutorFriends" <${this.gmailUser}>`,
        `To: ${mailOptions.to}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: base64',
        '',
        Buffer.from(mailOptions.html).toString('base64'),
      ];
      const message = messageParts.join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log('✅ Email sent successfully via Googleapis:', response.data.id);
      return true;
    } catch (error) {
      console.error('EmailService.sendEmail error:', error);
      return false;
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
        to: this.gmailUser,
        subject: `Contact Form: ${contactData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px 0;">
              <img src="https://tutorfriends.online/assets/images/tutorfriends-logo.png" alt="TutorFriends" style="height: 80px;">
            </div>
            <h2 style="color: #0ea5e9; text-align: center;">New Contact Form Submission</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #334155; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; color: #475569;">${contactData.message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                This message was sent from the TutorFriends contact form.
              </p>
            </div>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending contact email:', error);
      return false;
    }
  }

  async sendTutorApplicationApprovalEmail(tutorData: {
    name: string;
    email: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        to: tutorData.email,
        subject: '🎉 Welcome to TutorFriends! Your Application is Approved',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #0ea5e9; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://tutorfriends.online/assets/images/tutorfriends-logo.png" alt="TutorFriends" style="height: 80px; margin-bottom: 15px; background-color: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 8px;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Congratulations!</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 18px;">You are now a TutorFriends Tutor</p>
            </div>
            <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${tutorData.name},</h2>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin-bottom: 24px;">
                We are thrilled to inform you that your application to join <strong>TutorFriends</strong> has been <strong>approved</strong>! You can now access your dashboard, set up your profile, and start accepting booking requests from students.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://tutorfriends.online/tutor-dashboard/profile" style="background-color: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">View Profile</a>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
                Welcome to the community!
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} TutorFriends. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Failed to send tutor application approval email:', error);
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
        to: tutorData.email,
        subject: '✅ Subject Expertise Approved',
        html: `
           <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #10b981; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://tutorfriends.online/assets/images/tutorfriends-logo.png" alt="TutorFriends" style="height: 80px; margin-bottom: 15px; background-color: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 8px;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Subject Approved</h1>
              <p style="color: #ecfdf5; margin: 8px 0 0 0; font-size: 16px;">Expand your teaching portfolio</p>
            </div>
            <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${tutorData.name},</h2>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin-bottom: 24px;">
                Great news! Your application to teach <strong>${tutorData.subjectName}</strong> has been approved. This subject is now listed on your profile, and students can start booking sessions for it.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                 <a href="https://tutorfriends.online/tutor-dashboard/application" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">View Application</a>
              </div>
            </div>
             <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} TutorFriends. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Failed to send subject approval email:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      console.log('Attempting to send test email to:', to);
      const mailOptions = {
        to: to,
        subject: 'TutorFriends Gmail API Test',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #0ea5e9;">✅ Gmail API is Working!</h2>
            <p>This email was sent via the <strong>Gmail REST API (HTTPS)</strong>, bypassing all SMTP port blocks.</p>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
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
        to: tutorData.email,
        subject: 'Update on Your Tutor Application',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #ef4444; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://tutorfriends.online/assets/images/tutorfriends-logo.png" alt="TutorFriends" style="height: 80px; margin-bottom: 15px; background-color: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 8px;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Application Update</h1>
            </div>
            <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${tutorData.name},</h2>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin-bottom: 24px;">
                Thank you for your interest in joining TutorFriends. After carefully reviewing your application, we regret to inform you that we cannot approve your moderator/tutor account at this time.
              </p>
              
              ${tutorData.adminNotes ? `
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Reason for Rejection:</h3>
                <p style="color: #7f1d1d; margin: 0; line-height: 1.6; font-size: 15px;">${tutorData.adminNotes}</p>
              </div>
              ` : ''}

              <p style="color: #475569; line-height: 1.8; font-size: 16px;">
                You are welcome to update your profile information and documents to address the feedback above, and then re-apply.
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} TutorFriends. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Failed to send tutor rejection email:', error);
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
        to: tutorData.email,
        subject: 'Update on Your Subject Application',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #ef4444; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://tutorfriends.online/assets/images/tutorfriends-logo.png" alt="TutorFriends" style="height: 50px; margin-bottom: 15px; background-color: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 8px;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Subject Not Approved</h1>
            </div>
            <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${tutorData.name},</h2>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin-bottom: 24px;">
                We have reviewed your request to teach <strong>${tutorData.subjectName}</strong>. Unfortunately, we are unable to approve this subject at this time.
              </p>
              
              ${tutorData.adminNotes ? `
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Reason for Rejection:</h3>
                <p style="color: #7f1d1d; margin: 0; line-height: 1.6; font-size: 15px;">${tutorData.adminNotes}</p>
              </div>
              ` : ''}

              <p style="color: #475569; line-height: 1.8; font-size: 16px;">
                Please address the issues mentioned above and try applying for this subject again, or ensure your documents meet our requirements.
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} TutorFriends. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Failed to send subject rejection email:', error);
      return false;
    }
  }
}
