import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { PasswordResetToken } from '../database/entities/password-reset-token.entity';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private emailService: EmailService,
  ) { }

  private normalizeUserType(userType?: string | null): 'admin' | 'tutor' | 'tutee' | undefined {
    if (!userType) return undefined;
    if (userType === 'student') return 'tutee';
    return userType as 'admin' | 'tutor' | 'tutee';
  }

  async getUserTypeByEmail(email: string): Promise<any> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email is required and must be a valid string');
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new BadRequestException('Email cannot be empty');
    }

    // Find all users with this email (case-insensitive)
    const users = await this.userRepository.find({
      where: { email: ILike(trimmedEmail) },
      select: ['user_id', 'user_type', 'name']
    });

    if (!users || users.length === 0) {
      return null;
    }

    // If multiple users found, return list
    if (users.length > 1) {
      return {
        multiple_accounts: true,
        accounts: users.map(u => ({
          user_type: this.normalizeUserType(u.user_type === 'student' ? 'tutee' : u.user_type), // Normalize for frontend
          name: u.name
        }))
      };
    }

    // Single user
    return {
      userType: this.normalizeUserType(users[0].user_type),
      multiple_accounts: false
    };
  }

  async requestPasswordReset(
    email: string,
    options?: {
      requiredUserType?: 'admin' | 'tutor' | 'tutee';
      excludeUserType?: 'admin' | 'tutor' | 'tutee';
      targetUserType?: 'admin' | 'tutor' | 'tutee';
    },
  ): Promise<{ message: string }> {
    // Debug: Log the email being searched
    console.log('=== PASSWORD RESET REQUEST DEBUG ===');
    console.log('Searching for email:', email);
    console.log('Options:', options);

    // Validate email parameter
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email is required and must be a valid string');
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new BadRequestException('Email cannot be empty');
    }

    // Find users with case-insensitive email
    let users = await this.userRepository.find({
      where: { email: ILike(trimmedEmail) },
      select: ['user_id', 'name', 'email', 'status', 'user_type']
    });

    if (users.length === 0) {
      throw new NotFoundException('User not found with this email address');
    }

    let user: User | undefined;

    // Filter by targetUserType if provided
    if (options?.targetUserType) {
      // Normalize 'tutee' to 'student' for DB check if needed, but here we check normalized type
      user = users.find(u => {
        const type = this.normalizeUserType(u.user_type);
        return type === options.targetUserType;
      });

      if (!user) {
        throw new NotFoundException(`No ${options.targetUserType} account found for this email.`);
      }
    } else {
      // Default behavior: verify single user or throw if ambiguous?
      // For legacy compatibility, if multiple users exist but no type specified, we can't proceed safely.
      if (users.length > 1) {
        throw new BadRequestException('Multiple accounts found. Please specify the account type.');
      }
      user = users[0];
    }

    const normalizedType = this.normalizeUserType((user as any).user_type);

    // Check if user type is excluded
    if (options?.excludeUserType && normalizedType === options.excludeUserType) {
      throw new BadRequestException(`Password reset for ${options.excludeUserType} accounts must be done through the ${options.excludeUserType} portal.`);
    }

    // Check if specific user type is required
    if (options?.requiredUserType && normalizedType !== options.requiredUserType) {
      throw new BadRequestException('Password reset is not available for this account type.');
    }

    console.log('✅ User found for password reset:', {
      user_id: user.user_id,
      user_type: normalizedType,
    });

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry date to 15 minutes from now
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    // Invalidate any existing tokens for this user
    await this.passwordResetTokenRepository.update(
      { user_id: user.user_id, is_used: false },
      { is_used: true }
    );

    // Create new password reset token
    const passwordResetToken = this.passwordResetTokenRepository.create({
      user_id: user.user_id,
      changepasscode: verificationCode,
      expiry_date: expiryDate,
      is_used: false,
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);

    // Send verification code via email
    console.log(`Attempting to send password reset email to: ${user.email}`);
    const displayName = user.name || 'User';
    const emailSent = await this.sendPasswordResetEmail(displayName, user.email, verificationCode);

    if (!emailSent) {
      throw new BadRequestException('Failed to send verification code. Please check your email configuration and try again.');
    }

    return {
      message: 'Verification code sent to your email address. Please check your inbox and spam folder.'
    };
  }

  async verifyCodeAndResetPassword(
    email: string,
    code: string,
    newPassword: string,
    options?: {
      requiredUserType?: 'admin' | 'tutor' | 'tutee';
      excludeUserType?: 'admin' | 'tutor' | 'tutee';
      targetUserType?: 'admin' | 'tutor' | 'tutee';
    },
  ): Promise<{ message: string }> {
    console.log('=== PASSWORD RESET VERIFICATION DEBUG ===');
    console.log('Verifying for email:', email);
    console.log('Target Type:', options?.targetUserType);

    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email is required and must be a valid string');
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new BadRequestException('Email cannot be empty');
    }

    // Find users by email (case insensitive)
    const users = await this.userRepository.find({
      where: { email: ILike(trimmedEmail) },
      select: ['user_id', 'name', 'email', 'status', 'user_type']
    });

    if (users.length === 0) {
      throw new NotFoundException('User not found with this email address');
    }

    let user: User | undefined;

    if (options?.targetUserType) {
      user = users.find(u => this.normalizeUserType(u.user_type) === options.targetUserType);
      if (!user) throw new NotFoundException(`No ${options.targetUserType} account found for this email.`);
    } else {
      if (users.length > 1) {
        // Optimization: If multiple users, Try to find which one has the valid code?
        // Or just throw error asking for specification?
        // Ideally frontend passes type. If not, we could iterate tokens.
        // Let's iterate to be friendly if type is missing but code matches one.
        for (const u of users) {
          const token = await this.passwordResetTokenRepository.findOne({
            where: { user_id: u.user_id, changepasscode: code, is_used: false }
          });
          if (token && new Date() <= token.expiry_date) {
            user = u;
            break;
          }
        }
        if (!user) throw new BadRequestException('Invalid or expired verification code (or ambiguous account).');
      } else {
        user = users[0];
      }
    }

    const normalizedType = this.normalizeUserType((user as any).user_type);

    if (options?.excludeUserType && normalizedType === options.excludeUserType) {
      throw new BadRequestException(`Password reset for ${options.excludeUserType} accounts must be done through the ${options.excludeUserType} portal.`);
    }

    if (options?.requiredUserType && normalizedType !== options.requiredUserType) {
      throw new BadRequestException('Password reset is not available for this account type.');
    }

    console.log('✅ User id identified:', user.user_id);

    const token = await this.passwordResetTokenRepository.findOne({
      where: {
        user_id: user.user_id,
        changepasscode: code,
        is_used: false,
      },
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (new Date() > token.expiry_date) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.userRepository.update(user.user_id, {
      password: hashedPassword,
    });

    // Mark token as used
    await this.passwordResetTokenRepository.update(token.id, {
      is_used: true,
    });

    return {
      message: 'Password has been successfully reset. You can now log in with your new password.'
    };
  }

  private async sendPasswordResetEmail(
    name: string,
    email: string,
    verificationCode: string
  ): Promise<boolean> {
    try {
      console.log('Sending password reset email via Gmail API...');

      const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
            <div style="background-color: #0ea5e9; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://tutorfriends.online/assets/images/tutorfriends-logo.png" alt="TutorFriends" style="height: 80px; margin-bottom: 15px; background-color: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 8px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your verification code is ready</p>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Hello ${name || 'User'}!</h2>
              <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                You requested to reset your password for your TutorLink account. 
                Use the verification code below to complete the password reset process.
              </p>
              <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9; text-align: center;">
                <h3 style="color: #0ea5e9; margin-top: 0; margin-bottom: 15px;">Your Verification Code</h3>
                <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; display: inline-block; border: 2px dashed #0ea5e9;">
                  <span style="color: #0c4a6e; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">${verificationCode}</span>
                </div>
              </div>
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0;">⚠️ Important Security Information</h3>
                <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>This code will expire in <strong>15 minutes</strong></li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>For security, this code can only be used once</li>
                </ul>
              </div>
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #334155; margin-top: 0;">Next Steps</h3>
                <ol style="color: #475569; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Go back to the password reset page</li>
                  <li>Enter the verification code: <strong>${verificationCode}</strong></li>
                  <li>Create your new password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                If you have any questions or didn't request this password reset, please contact our support team.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              <p>This email was sent from TutorLink - Connecting Minds, Building Futures</p>
            </div>
          </div>
        `;

      const sent = await this.emailService.sendEmail({
        to: email,
        subject: '🔐 Password Reset Verification Code',
        html: html,
      });

      if (sent) {
        console.log(`Password reset email sent successfully to ${email}`);
        return true;
      } else {
        console.error(`Failed to send password reset email to: ${email}`);
        return false;
      }

    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }
}
