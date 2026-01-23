import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private gmailUser: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;

  constructor() {
    this.gmailUser = process.env.GMAIL_USER || 'jhonlloydtcruz4@gmail.com';
    this.clientId = process.env.GMAIL_CLIENT_ID || '';
    this.clientSecret = process.env.GMAIL_CLIENT_SECRET || '';
    this.refreshToken = process.env.GMAIL_REFRESH_TOKEN || '';

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      console.error('❌ Gmail API credentials missing (Client ID, Secret, or Refresh Token).');
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json() as any;
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to refresh access token');
      }
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  async sendEmail(mailOptions: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      console.log(`--- Gmail REST API Request ---`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);

      const accessToken = await this.getAccessToken();

      // Construct a simple MIME message
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

      // The Gmail API requires base64url encoding
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage,
          }),
        },
      );

      const data = await response.json() as any;

      if (!response.ok) {
        console.error('❌ Gmail API Error:', data);
        return false;
      }

      console.log('✅ Email sent successfully via Gmail REST API:', data.id);
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
              </p>
            </div>
          </div>
        `,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
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
        subject: '✅ Your Subject Expertise Has Been Approved!',
        html: `<h2>Subject Expertise Approved: ${tutorData.subjectName}</h2>`,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
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
        subject: '❌ Your Tutor Application Status Update',
        html: `<h2>Application Update for ${tutorData.name}</h2>`,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
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
        subject: '❌ Your Subject Expertise Application Status Update',
        html: `<h2>Subject Rejection: ${tutorData.subjectName}</h2>`,
      };
      return await this.sendEmail(mailOptions);
    } catch (error) {
      return false;
    }
  }
}
