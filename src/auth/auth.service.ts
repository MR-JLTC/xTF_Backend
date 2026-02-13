import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.dto';
import { EmailVerificationService } from './email-verification.service';
import { TutorsService } from '../tutors/tutors.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
    private tutorsService: TutorsService,
    private emailService: EmailService,
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
        // 1. Exact match
        if (a.user_type === targetUserType) return -1;
        if (b.user_type === targetUserType) return 1;

        // 2. Alias match (student <-> tutee)
        const isStudentOrTutee = (type: string) => type === 'student' || type === 'tutee';
        if (isStudentOrTutee(targetUserType)) {
          if (isStudentOrTutee(a.user_type) && !isStudentOrTutee(b.user_type)) return -1;
          if (!isStudentOrTutee(a.user_type) && isStudentOrTutee(b.user_type)) return 1;
        }
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
    console.log('Target User Type:', loginDto.user_type);

    // 1. If user_type is specified, try to validate that specific account
    if (loginDto.user_type) {
      const user = await this.validateUser(loginDto.email, loginDto.password, loginDto.user_type);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials for this account type');
      }
      return this.generateLoginResponse(user);
    }

    // 2. If no user_type specified, check for multiple potential accounts
    console.log(`[DEBUG] Finding users for email: ${loginDto.email}`);
    const allUsers = await this.usersService.findAllByEmail(loginDto.email);
    console.log(`[DEBUG] Found ${allUsers.length} users in DB for email ${loginDto.email}`);

    const validUsers = [];

    for (const user of allUsers) {
      console.log(`[DEBUG] Checking User ID: ${user.user_id}, Type: ${user.user_type}, Has Password: ${!!user.password}`);

      // Skip admin accounts for this endpoint
      if (user.user_type === 'admin') {
        console.log(`[DEBUG] Skipping admin user ${user.user_id}`);
        continue;
      }

      // Check password
      if (!user.password) {
        console.log(`[DEBUG] User ${user.user_id} skipped (no password)`);
        continue;
      }

      let passwordMatch = await bcrypt.compare(loginDto.password, user.password);
      console.log(`[DEBUG] Password match for user ${user.user_id}: ${passwordMatch}`);

      if (!passwordMatch) {
        // Try double hash fallback if needed (legacy support)
        const doubleHashed = await bcrypt.hash(loginDto.password, 10);
        passwordMatch = await bcrypt.compare(doubleHashed, user.password);
        console.log(`[DEBUG] Double-hash match for user ${user.user_id}: ${passwordMatch}`);
      }

      if (passwordMatch) {
        console.log(`[DEBUG] User ${user.user_id} credentials VALID`);
        validUsers.push(user);
      }
    }

    if (validUsers.length === 0) {
      console.log(`[DEBUG] No valid users found. Throwing UnauthorizedException.`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // A. Multiple accounts found -> Return list for user selection
    if (validUsers.length > 1) {
      return {
        multiple_accounts: true,
        accounts: validUsers.map(u => ({
          user_type: u.user_type === 'student' ? 'tutee' : u.user_type, // Normalize student->tutee
          name: u.name
        }))
      };
    }

    // B. Single account found -> Log in
    return this.generateLoginResponse(validUsers[0]);
  }

  private async generateLoginResponse(user: any) {
    // Block login if account is inactive
    if (user.status === 'inactive') {
      throw new UnauthorizedException('Your account is inactive. Please contact an administrator.');
    }

    // Map student/tutee to the correct role for frontend
    let userType = user.user_type;
    if (userType === 'student' || userType === 'tutee') {
      userType = 'student'; // Normalize both to 'student' for frontend token, but frontend might expect 'tutee' role string in response?
      // Actually, looking at previous code, it returned role: userType where userType was normalized to 'student' for token
      // But let's keep consistency.
    }

    // If user is a tutor, set online status to 'online'
    if (user.user_type === 'tutor') {
      try {
        await this.tutorsService.updateOnlineStatus(user.user_id, 'online');
      } catch (err) {
        console.warn('Failed to update tutor online status:', err);
      }
    }

    // Consistent role string for frontend routing
    const roleForToken = (userType === 'student' || userType === 'tutee') ? 'student' : userType;
    // For the "role" property in the returned user object, the frontend switch case uses 'tutee' or 'tutor'. 
    // The previous code returned `role: userType` where userType was 'student'. 
    // Wait, the UnifiedLoginPage switch(role) has case 'tutee'. 
    // If we return 'student', the switch default case will trigger error!
    // Let's check previous code: 
    // if (userType === 'student' || userType === 'tutee') userType = 'student';
    // ... role: userType ...
    // So it was returning 'student'.
    // Let's re-read UnifiedLoginPage.tsx... 
    // switch(role) { case 'tutee': ... case 'tutor': ... default: Error }
    // So if backend returns 'student', frontend fails! 
    // !!! CRITICAL FINDING !!!
    // Previous code:
    // let userType = user.user_type;
    // if (userType === 'student' || userType === 'tutee') userType = 'student';
    // return { user: { ...user, role: userType } ... }
    // So it WAS returning 'student'.
    // BUT the frontend switch has `case 'tutee'`.
    // Why did it work before? Maybe `user.user_type` was 'tutee' and the normalization branch wasn't hit?
    // OR the frontend code I viewed is slightly different or I misread it?
    // Let's look at UnifiedLoginPage.tsx again in my memory or tools.
    // Line 121: case 'tutee':
    // Line 125: case 'tutor':
    // Line 117: const role = result as string; 
    // Wait, `result` is the return value of `loginTutorTutee`.
    // `loginTutorTutee` returns `{ user: { ... }, accessToken: ... }`.
    // The `useAuth` hook `loginTutorTutee` probably extracts the role?
    // I need to check `useAuth` hook or assume the frontend handles 'student' -> 'tutee' mapping.
    // However, to be safe and match the "tutee" case in frontend, I should probably return 'tutee' if it is a student/tutee.

    // Let's normalize to what the frontend expects: 'tutee' or 'tutor'.
    const frontendRole = (user.user_type === 'student' || user.user_type === 'tutee') ? 'tutee' : user.user_type;

    // Token payload usually needs standard roles. keeping 'student' for token might be important for guards.
    const tokenRole = (user.user_type === 'student' || user.user_type === 'tutee') ? 'student' : user.user_type;

    const payload = { email: user.email, sub: user.user_id, name: user.name, role: tokenRole };

    return {
      user: { ...user, role: frontendRole }, // Return 'tutee' for frontend routing match
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

    // Send notification to admin
    this.emailService.sendRegistrationNotification({
      name: user.name,
      email: user.email,
      userType: user.user_type,
    }).catch(err => console.error('Failed to send admin notification:', err));

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
