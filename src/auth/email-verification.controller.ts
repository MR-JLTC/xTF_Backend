import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { EmailVerificationService } from './email-verification.service';

export class SendVerificationCodeDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'User type is required' })
  @IsString({ message: 'User type must be a string' })
  user_type: 'tutor' | 'tutee' | 'admin';
}

export class VerifyEmailCodeDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Verification code is required' })
  @IsString({ message: 'Verification code must be a string' })
  code: string;

  @IsNotEmpty({ message: 'User type is required' })
  @IsString({ message: 'User type must be a string' })
  user_type: 'tutor' | 'tutee' | 'admin';
}

@Controller('auth/email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) { }

  @Post('send-code')
  async sendVerificationCode(@Body() sendVerificationCodeDto: SendVerificationCodeDto) {
    try {
      console.log('=== EMAIL VERIFICATION CONTROLLER DEBUG ===');
      console.log('Received request body:', sendVerificationCodeDto);
      console.log('Email from DTO:', sendVerificationCodeDto.email);
      console.log('Email type:', typeof sendVerificationCodeDto.email);
      console.log('Email length:', sendVerificationCodeDto.email?.length);
      console.log('=== END EMAIL VERIFICATION CONTROLLER DEBUG ===');

      const result = await this.emailVerificationService.sendVerificationCode(
        sendVerificationCodeDto.email,
        sendVerificationCodeDto.user_type
      );
      return result;
    } catch (error) {
      console.log('❌ Email verification controller error:', error);
      throw new HttpException(
        {
          message: error.message || 'Failed to send verification code',
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status')
  async getEmailVerificationStatus(@Query('email') email: string, @Query('user_type') user_type: 'tutor' | 'tutee' | 'admin') {
    try {
      console.log('=== EMAIL STATUS CHECK DEBUG ===');
      console.log('Checking status for email:', email);
      console.log('User type:', user_type);
      console.log('Email type:', typeof email);
      console.log('=== END EMAIL STATUS CHECK DEBUG ===');

      if (!email) {
        throw new HttpException(
          { message: 'Email parameter is required', statusCode: HttpStatus.BAD_REQUEST },
          HttpStatus.BAD_REQUEST
        );
      }
      if (!user_type) {
        throw new HttpException(
          { message: 'User type parameter is required', statusCode: HttpStatus.BAD_REQUEST },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.emailVerificationService.getEmailVerificationStatus(email, user_type);
      return result;
    } catch (error) {
      console.log('❌ Email status check error:', error);
      throw new HttpException(
        {
          message: error.message || 'Failed to check email verification status',
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('verify-code')
  async verifyEmailCode(@Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    try {
      console.log('=== VERIFY EMAIL CONTROLLER DEBUG ===');
      console.log('Received verify request body:', verifyEmailCodeDto);
      console.log('Email from DTO:', verifyEmailCodeDto.email);
      console.log('Code from DTO:', verifyEmailCodeDto.code);
      console.log('=== END VERIFY EMAIL CONTROLLER DEBUG ===');

      const result = await this.emailVerificationService.verifyEmailCode(
        verifyEmailCodeDto.email,
        verifyEmailCodeDto.code,
        verifyEmailCodeDto.user_type
      );
      return result;
    } catch (error) {
      console.log('❌ Verify email controller error:', error);
      throw new HttpException(
        {
          message: error.message || 'Failed to verify email code',
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test-email')
  async testEmail(@Body('email') email: string) {
    try {
      console.log('=== TEST EMAIL REQUEST ===');
      console.log('To:', email);

      const success = await this.emailVerificationService.sendTestEmail(email);
      if (!success) {
        throw new Error('Email service returned failure status');
      }
      return { message: 'Test email sent successfully' };
    } catch (error) {
      console.log('❌ Test email controller error:', error);
      throw new HttpException(
        {
          message: error.message || 'Failed to send test email',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('check-network')
  async checkNetwork() {
    const net = require('net');
    const ports = [587, 465, 25];
    const results = {};

    for (const port of ports) {
      results[port] = await new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 5000;
        let resolved = false;

        socket.setTimeout(timeout);
        socket.on('connect', () => {
          socket.destroy();
          if (!resolved) {
            resolved = true;
            resolve('CONNECTED');
          }
        });
        socket.on('timeout', () => {
          socket.destroy();
          if (!resolved) {
            resolved = true;
            resolve('TIMEOUT');
          }
        });
        socket.on('error', (err) => {
          socket.destroy();
          if (!resolved) {
            resolved = true;
            resolve(`ERROR: ${err.message}`);
          }
        });
        socket.connect(port, 'smtp.gmail.com');
      });
    }

    return {
      host: 'smtp.gmail.com',
      results,
      env: {
        hasUser: !!process.env.GMAIL_USER,
        hasPass: !!process.env.GMAIL_APP_PASSWORD,
        user: process.env.GMAIL_USER ? `${process.env.GMAIL_USER.substring(0, 3)}***` : 'MISSING',
        passLength: process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 0
      }
    };
  }
}
