"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const email_verification_service_1 = require("./email-verification.service");
const tutors_service_1 = require("../tutors/tutors.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, emailVerificationService, tutorsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailVerificationService = emailVerificationService;
        this.tutorsService = tutorsService;
    }
    async validateUser(email, pass) {
        console.log('\n=== VALIDATE USER DEBUG ===');
        console.log('Email:', email);
        console.log('Password provided length:', pass?.length || 0);
        const user = await this.usersService.findOneByEmail(email);
        console.log('User found in database:', !!user);
        if (user) {
            console.log('\nUser details:', {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                user_type: user.user_type,
                status: user.status,
                has_password: !!user.password,
                password_length: user.password?.length || 0
            });
            if (!pass || !user.password) {
                console.log('❌ Missing password data:', {
                    providedPassword: !!pass,
                    storedPassword: !!user.password
                });
                return null;
            }
            try {
                console.log('\nAttempting normal password comparison...');
                let passwordMatch = await bcrypt.compare(pass, user.password);
                console.log('Password match (normal):', passwordMatch);
                if (!passwordMatch) {
                    console.log('\nTrying double-hashed password comparison...');
                    const doubleHashed = await bcrypt.hash(pass, 10);
                    passwordMatch = await bcrypt.compare(doubleHashed, user.password);
                    console.log('Password match (double-hashed):', passwordMatch);
                    if (passwordMatch) {
                        console.log('✅ Double-hashed password detected, updating to single-hashed');
                        const singleHashed = await bcrypt.hash(pass, 10);
                        await this.usersService.updatePassword(user.user_id, singleHashed);
                        console.log('Password updated to single-hashed version');
                    }
                }
                if (passwordMatch) {
                    const { password, ...result } = user;
                    console.log('\n✅ User validation successful');
                    console.log('Returning user data:', result);
                    return result;
                }
                else {
                    console.log('\n❌ Password does not match');
                    console.log('Password comparison failed for user:', user.email);
                }
            }
            catch (error) {
                console.error('\n❌ Error during password comparison:', error);
                return null;
            }
        }
        else {
            console.log('\n❌ No user found with this email');
        }
        console.log('\n❌ User validation failed');
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'inactive') {
            throw new common_1.UnauthorizedException('Your account is inactive. Please contact an administrator.');
        }
        const isAdmin = await this.usersService.isAdmin(user.user_id);
        if (!isAdmin) {
            throw new common_1.UnauthorizedException('Access denied. Only admins can log in.');
        }
        const payload = { email: user.email, sub: user.user_id, name: user.name, role: 'admin' };
        return {
            user: { ...user, role: 'admin' },
            accessToken: this.jwtService.sign(payload),
        };
    }
    async loginTutorTutee(loginDto) {
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'inactive') {
            console.log('❌ Account is inactive');
            throw new common_1.UnauthorizedException('Your account is inactive. Please contact an administrator.');
        }
        const isAdmin = await this.usersService.isAdmin(user.user_id);
        console.log('Is admin:', isAdmin);
        if (isAdmin) {
            console.log('❌ Admin account blocked from tutor/tutee login');
            throw new common_1.UnauthorizedException('Admin accounts are not allowed here. Please use the Admin Portal.');
        }
        let userType = user.user_type;
        if (userType === 'student' || userType === 'tutee') {
            userType = 'student';
        }
        console.log('Mapped user type:', userType);
        if (userType === 'tutor') {
            try {
                await this.tutorsService.updateOnlineStatus(user.user_id, 'online');
                console.log('✅ Tutor online status set to online');
            }
            catch (err) {
                console.warn('Failed to update tutor online status:', err);
            }
        }
        const payload = { email: user.email, sub: user.user_id, name: user.name, role: userType };
        console.log('✅ Login successful, generating token');
        return {
            user: { ...user, role: userType },
            accessToken: this.jwtService.sign(payload),
        };
    }
    async determineUserType(userId) {
        const tutorProfile = await this.usersService.findTutorProfile(userId);
        console.log(`Determining user type for user_id ${userId}:`, tutorProfile ? 'tutor' : 'student');
        if (tutorProfile) {
            return 'tutor';
        }
        return 'student';
    }
    async register(registerDto) {
        console.log('=== REGISTRATION DEBUG ===');
        console.log('Register DTO:', registerDto);
        const emailVerificationStatus = await this.emailVerificationService.getEmailVerificationStatus(registerDto.email, registerDto.user_type);
        console.log('Email verification status:', emailVerificationStatus);
        if (!emailVerificationStatus.is_verified) {
            throw new common_1.BadRequestException('Email address not verified. Please complete email verification first.');
        }
        if (registerDto.user_type === 'admin') {
            const adminExists = await this.usersService.hasAdmin();
            if (adminExists) {
                throw new common_1.BadRequestException('An admin account already exists. Please log in instead.');
            }
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        let user;
        if (registerDto.user_type === 'admin') {
            user = await this.usersService.createAdmin({ ...registerDto, password: hashedPassword });
        }
        else if (registerDto.user_type === 'tutee') {
            user = await this.usersService.createStudent({ ...registerDto, password: hashedPassword });
        }
        else if (registerDto.user_type === 'tutor') {
            user = await this.usersService.createTutor({ ...registerDto, password: hashedPassword });
        }
        else {
            throw new common_1.BadRequestException('Invalid user type provided.');
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
    async registerStudent(body) {
        const existingUser = await this.usersService.findOneByEmail(body.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const user = await this.usersService.createStudent(body);
        const payload = { email: user.email, sub: user.user_id, name: user.name, role: 'student' };
        return {
            user: { ...user, role: 'student' },
            accessToken: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_verification_service_1.EmailVerificationService,
        tutors_service_1.TutorsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map