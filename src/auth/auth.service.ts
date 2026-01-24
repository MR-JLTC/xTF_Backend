import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.dto';
import { EmailVerificationService } from './email-verification.service';
import { TutorsService } from '../tutors/tutors.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
    private tutorsService: TutorsService,
  ) { }

  async validateUser(email: string, pass: string, targetUserType?: string): Promise<any> {
    console.log('\n=== VALIDATE USER DEBUG ===');
    console.log('Email:', email);
    console.log('Target User Type hint:', targetUserType);

    // Find all users with this email (can have multiple if user has different roles)
    const users = await this.usersService.findAllByEmail(email);
    console.log('Users found in database:', users.length);

    if (users.length === 0) {
      console.log('\n❌ No user found with this email');
      return null;
    }

    // Sort to prioritize targetUserType if hinted
    const sortedUsers = [...users].sort((a, b) => {
      if (targetUserType) {
        if (a.user_type === targetUserType) return -1;
        if (b.user_type === targetUserType) return 1;
      }
      return 0;
    });

    for (const user of sortedUsers) {
      console.log('\nChecking account:', {
        user_id: user.user_id,
        user_type: user.user_type,
        status: user.status
      });

      if (!pass || !user.password) continue;

      try {
        let passwordMatch = await bcrypt.compare(pass, user.password);

        if (!passwordMatch) {
          const doubleHashed = await bcrypt.hash(pass, 10);
          passwordMatch = await bcrypt.compare(doubleHashed, user.password);
          if (passwordMatch) {
            const singleHashed = await bcrypt.hash(pass, 10);
            await this.usersService.updatePassword(user.user_id, singleHashed);
          }
        }

        if (passwordMatch) {
          const { password, ...result } = user;
          console.log('\n✅ User validation successful for account type:', user.user_type);
          return result;
        }
      } catch (error) {
        console.error('\n❌ Error during password comparison:', error);
      }
    }

    console.log('\n❌ User validation failed (no matching password found for any associated account)');
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Block login if account is inactive
    if ((user as any).status === 'inactive') {
      throw new UnauthorizedException('Your account is inactive. Please contact an administrator.');
    }

    // Check if the user is an admin
    const isAdmin = await this.usersService.isAdmin(user.user_id);
    if (!isAdmin) {
      throw new UnauthorizedException('Access denied. Only admins can log in.');
    }

    const payload = { email: user.email, sub: user.user_id, name: user.name, role: 'admin' };
    return {
      user: { ...user, role: 'admin' },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async loginTutorTutee(loginDto: LoginDto) {
    console.log('=== TUTOR/TUTEE LOGIN DEBUG ===');
    console.log('Email:', loginDto.email);
    console.log('Password length:', loginDto.password?.length);

    const user = await this.validateUser(loginDto.email, loginDto.password);
    console.log('User found:', !!user);
    if (user) {
      console.log('User details:', {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        status: user.status
      });
    }

    if (!user) {
      console.log('❌ No user found or invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Block login if account is inactive
    if ((user as any).status === 'inactive') {
      console.log('❌ Account is inactive');
      throw new UnauthorizedException('Your account is inactive. Please contact an administrator.');
    }

    // Check if the user is an admin (block admin login here)
    const isAdmin = await this.usersService.isAdmin(user.user_id);
    console.log('Is admin:', isAdmin);
    if (isAdmin) {
      console.log('❌ Admin account blocked from tutor/tutee login');
      throw new UnauthorizedException('Admin accounts are not allowed here. Please use the Admin Portal.');
    }

    // Map student/tutee to the correct role for frontend
    let userType = user.user_type;
    if (userType === 'student' || userType === 'tutee') {
      userType = 'student'; // Normalize both to 'student' for frontend
    }
    console.log('Mapped user type:', userType);

    // If user is a tutor, set online status to 'online'
    if (userType === 'tutor') {
      try {
        await this.tutorsService.updateOnlineStatus(user.user_id, 'online');
        console.log('✅ Tutor online status set to online');
      } catch (err) {
        console.warn('Failed to update tutor online status:', err);
        // Don't block login if online status update fails
      }
    }

    const payload = { email: user.email, sub: user.user_id, name: user.name, role: userType };
    console.log('✅ Login successful, generating token');
    return {
      user: { ...user, role: userType },
      accessToken: this.jwtService.sign(payload),
    };
  }

  private async determineUserType(userId: number): Promise<'student' | 'tutor'> {
    // Check if user has tutor profile
    const tutorProfile = await this.usersService.findTutorProfile(userId);
    console.log(`Determining user type for user_id ${userId}:`, tutorProfile ? 'tutor' : 'student');
    if (tutorProfile) {
      return 'tutor';
    }
    // Default to student if not a tutor
    return 'student';
  }

  async register(registerDto: RegisterDto) {
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Register DTO:', registerDto);

    // Check if user with same email and user_type already exists
    const existingUserWithType = await this.usersService.findOneByEmailAndType(registerDto.email, registerDto.user_type);
    if (existingUserWithType) {
      throw new BadRequestException(`An account with this email is already registered as a ${registerDto.user_type}.`);
    }

    // Check if email has been verified for the given user type
    const emailVerificationStatus = await this.emailVerificationService.getEmailVerificationStatus(registerDto.email, registerDto.user_type);
    console.log('Email verification status:', emailVerificationStatus);

    if (!emailVerificationStatus.is_verified) {
      throw new BadRequestException('Email address not verified. Please complete email verification first.');
    }

    if (registerDto.user_type === 'admin') {
      const adminExists = await this.usersService.hasAdmin();
      if (adminExists) {
        throw new BadRequestException('An admin account already exists. Please log in instead.');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    let user;
    if (registerDto.user_type === 'admin') {
      user = await this.usersService.createAdmin({ ...registerDto, password: hashedPassword });
    } else if (registerDto.user_type === 'tutee') {
      user = await this.usersService.createStudent({ ...registerDto, password: hashedPassword });
    } else if (registerDto.user_type === 'tutor') {
      user = await this.usersService.createTutor({ ...registerDto, password: hashedPassword });
    } else {
      throw new BadRequestException('Invalid user type provided.');
    }

    console.log('User created:', user);
    console.log('User ID:', user.user_id);

    const payload = { email: user.email, sub: user.user_id, name: user.name, user_type: user.user_type };
    const accessToken = this.jwtService.sign(payload);

    console.log('JWT Payload:', payload);
    console.log('Access Token generated:', !!accessToken);
    console.log('=== END REGISTRATION DEBUG ===');

    return {
      user,
      accessToken,
    };
  }

  async registerStudent(body: { name: string; email: string; password: string; university_id: number; course_id?: number; course_name?: string; year_level: number }) {
    // This method is now effectively redundant if `register` handles all types.
    // For now, leaving it as is, but could be removed.
    // Check if user with same email and user_type already exists
    const existingStudent = await this.usersService.findOneByEmailAndType(body.email, 'student');
    const existingTutee = await this.usersService.findOneByEmailAndType(body.email, 'tutee');

    if (existingStudent || existingTutee) {
      throw new BadRequestException('A student account with this email already exists');
    }

    const user = await this.usersService.createStudent(body);

    const payload = { email: user.email, sub: user.user_id, name: user.name, role: 'student' };
    return {
      user: { ...user, role: 'student' },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
