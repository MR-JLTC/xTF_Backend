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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const notifications_service_1 = require("../notifications/notifications.service");
const schedule_1 = require("@nestjs/schedule");
const bcrypt = require("bcrypt");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository, adminRepository, tutorRepository, coursesRepository, universitiesRepository, studentRepository, notificationRepository, bookingRequestRepository, sessionRepository, subjectRepository, notificationsService) {
        this.usersRepository = usersRepository;
        this.adminRepository = adminRepository;
        this.tutorRepository = tutorRepository;
        this.coursesRepository = coursesRepository;
        this.universitiesRepository = universitiesRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findAll() {
        return this.usersRepository.find({ relations: ['admin_profile', 'tutor_profile', 'student_profile', 'student_profile.university', 'student_profile.course', 'tutor_profile.university', 'tutor_profile.course'] });
    }
    async moveOverdueBookingsToSessions() {
        const now = new Date();
        const overdueBookings = await this.bookingRequestRepository.find({
            where: { status: 'upcoming' },
            relations: ['student', 'tutor'],
        });
        let moved = 0;
        for (const booking of overdueBookings) {
            const [hour, minute] = booking.time.split(':').map(Number);
            const startDate = new Date(booking.date);
            startDate.setHours(hour, minute, 0, 0);
            const endDate = new Date(startDate.getTime() + booking.duration * 60 * 60 * 1000);
            if (endDate < now) {
                const existingSession = await this.sessionRepository.findOne({
                    where: {
                        student: { user: { user_id: booking.student.user_id } },
                        tutor: { tutor_id: booking.tutor.tutor_id },
                        start_time: startDate,
                    },
                });
                if (!existingSession) {
                    const studentEntity = await this.studentRepository.findOne({ where: { user: { user_id: booking.student.user_id } } });
                    const tutorEntity = await this.tutorRepository.findOne({ where: { tutor_id: booking.tutor.tutor_id } });
                    let subjectEntity = null;
                    if (typeof booking.subject === 'string') {
                        subjectEntity = await this.subjectRepository.findOne({ where: { subject_name: booking.subject } });
                    }
                    else {
                        subjectEntity = booking.subject;
                    }
                    await this.sessionRepository.save({
                        student: studentEntity,
                        tutor: tutorEntity,
                        subject: subjectEntity,
                        start_time: startDate,
                        end_time: endDate,
                        status: 'scheduled',
                    });
                }
                moved++;
            }
        }
        return { moved };
    }
    async handleMoveOverdueBookingsCron() {
        const result = await this.moveOverdueBookingsToSessions();
        if (result.moved > 0) {
            this.logger.log(`Moved ${result.moved} overdue bookings to sessions.`);
        }
    }
    async findOneById(id) {
        return this.usersRepository.findOne({ where: { user_id: id }, relations: ['admin_profile', 'tutor_profile', 'student_profile', 'student_profile.university', 'student_profile.course', 'tutor_profile.university', 'tutor_profile.course'] });
    }
    async findOneByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async hasAdmin() {
        const adminCount = await this.usersRepository.count({ where: { user_type: 'admin' } });
        return adminCount > 0;
    }
    async createAdmin(registerDto) {
        if (await this.hasAdmin()) {
            throw new common_1.BadRequestException('An admin account already exists. Please log in instead.');
        }
        let university;
        if (registerDto.university_id) {
            university = await this.universitiesRepository.findOne({ where: { university_id: registerDto.university_id } });
            if (!university) {
                throw new common_1.BadRequestException('Invalid university ID');
            }
        }
        const newUser = this.usersRepository.create({
            name: registerDto.name,
            email: registerDto.email,
            password: registerDto.password,
            user_type: 'admin',
            status: 'active',
            profile_image_url: 'user_profile_images/userProfile_admin.png',
        });
        const savedUser = await this.usersRepository.save(newUser);
        const adminProfile = this.adminRepository.create({
            user: savedUser,
            ...(university && { university: university, university_id: university.university_id })
        });
        await this.adminRepository.save(adminProfile);
        return this.findOneById(savedUser.user_id);
    }
    async submitBookingFeedback(bookingId, studentUserId, rating, comment) {
        const booking = await this.bookingRequestRepository.findOne({ where: { id: bookingId }, relations: ['student', 'tutor', 'tutor.user'] });
        if (!booking)
            throw new common_1.BadRequestException('Booking not found');
        if (booking.student?.user_id !== studentUserId)
            throw new common_1.BadRequestException('Not allowed');
        if (booking.status !== 'completed') {
            throw new common_1.BadRequestException('Booking must be marked completed before leaving feedback');
        }
        booking.tutee_rating = Number(rating);
        booking.tutee_comment = comment || null;
        booking.tutee_feedback_at = new Date();
        await this.bookingRequestRepository.save(booking);
        const admins = await this.adminRepository.find({ relations: ['user'] });
        const messages = admins.map((a) => {
            const adminUser = a.user;
            const msg = `${booking.student.name || 'A student'} left feedback for ${booking.subject}: ${rating}/5${comment ? ' — ' + comment : ''}`;
            return this.notificationRepository.create({
                userId: adminUser.user_id.toString(),
                receiver_id: adminUser.user_id,
                userType: 'admin',
                message: msg,
                timestamp: new Date(),
                read: false,
                sessionDate: booking.date,
                subjectName: booking.subject,
                booking: booking
            });
        });
        try {
            await Promise.all(messages.map(m => this.notificationRepository.save(m)));
        }
        catch (e) {
            console.warn('submitBookingFeedback: failed to save admin notifications', e);
        }
        return { success: true };
    }
    async confirmBookingCompletion(bookingId, studentUserId) {
        const booking = await this.bookingRequestRepository.findOne({ where: { id: bookingId }, relations: ['student', 'tutor', 'tutor.user'] });
        if (!booking)
            throw new common_1.BadRequestException('Booking not found');
        if (booking.student?.user_id !== studentUserId)
            throw new common_1.BadRequestException('Not allowed');
        if (booking.status !== 'awaiting_confirmation') {
            throw new common_1.BadRequestException('Booking is not awaiting confirmation');
        }
        booking.status = 'completed';
        booking.tutee_feedback_at = booking.tutee_feedback_at || null;
        booking.tutee_marked_done_at = new Date();
        const saved = await this.bookingRequestRepository.save(booking);
        try {
            const tutorUserId = booking.tutor?.user?.user_id;
            if (tutorUserId) {
                const note = this.notificationRepository.create({
                    userId: tutorUserId.toString(),
                    receiver_id: tutorUserId,
                    userType: 'tutor',
                    message: `The student has confirmed completion for ${booking.subject}.`,
                    timestamp: new Date(),
                    read: false,
                    sessionDate: booking.date,
                    subjectName: booking.subject,
                    booking: saved
                });
                await this.notificationRepository.save(note);
            }
        }
        catch (e) {
            console.warn('confirmBookingCompletion: failed to notify tutor', e);
        }
        return { success: true };
    }
    async isAdmin(userId) {
        const admin = await this.adminRepository.findOne({ where: { user: { user_id: userId } } });
        return !!admin;
    }
    async getAdminProfile(userId) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['admin_profile', 'admin_profile.university']
        });
        if (!user || !user.admin_profile) {
            throw new common_1.BadRequestException('Admin not found');
        }
        const admin = user.admin_profile;
        return {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            profile_image_url: user.profile_image_url,
            created_at: user.created_at,
            university_id: admin.university_id || null,
            university_name: admin.university?.name || null,
            qr_code_url: admin.qr_code_url || null,
        };
    }
    async updateAdminQr(userId, qrUrl) {
        const admin = await this.adminRepository.findOne({
            where: { user: { user_id: userId } },
            relations: ['user']
        });
        if (!admin) {
            throw new common_1.BadRequestException('Admin not found');
        }
        admin.qr_code_url = qrUrl;
        await this.adminRepository.save(admin);
        return { success: true, qr_code_url: qrUrl };
    }
    async getAdminsWithQr() {
        const admins = await this.adminRepository.find({ relations: ['user'] });
        return admins
            .filter((a) => !!a.qr_code_url)
            .map((a) => ({
            user_id: a.user?.user_id,
            name: a.user?.name,
            qr_code_url: a.qr_code_url,
        }));
    }
    async findTutorProfile(userId) {
        return this.tutorRepository.findOne({ where: { user: { user_id: userId } } });
    }
    async updatePassword(userId, hashedPassword) {
        await this.usersRepository.update(userId, { password: hashedPassword });
    }
    async updateStatus(userId, status) {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.status = status;
        return this.usersRepository.save(user);
    }
    async resetPassword(userId, newPassword) {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
        return { success: true };
    }
    async updateUser(userId, body) {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (body.name !== undefined)
            user.name = body.name;
        if (body.email !== undefined)
            user.email = body.email;
        if (body.status !== undefined)
            user.status = body.status;
        if (body.year_level !== undefined)
            user.year_level = body.year_level;
        if (body.university_id !== undefined)
            user.university_id = body.university_id;
        if (body.profile_image_url !== undefined)
            user.profile_image_url = body.profile_image_url;
        return this.usersRepository.save(user);
    }
    async deleteUser(userId) {
        try {
            await this.usersRepository.delete({ user_id: userId });
        }
        catch (error) {
            throw new common_1.BadRequestException('Unable to delete this user because they have related records (e.g., profiles, sessions, or payments). Please resolve related records first or deactivate the user instead.');
        }
        return { success: true };
    }
    async createStudent(body) {
        console.log('=== CREATE STUDENT DEBUG ===');
        console.log('Password already hashed:', body.password.startsWith('$2b$'));
        let resolvedCourseId = body.course_id ?? null;
        if (!resolvedCourseId && body.course_name && body.course_name.trim().length > 0) {
            const uni = await this.universitiesRepository.findOne({ where: { university_id: body.university_id } });
            if (uni) {
                const existingCourse = await this.coursesRepository.findOne({ where: { course_name: body.course_name.trim(), university: { university_id: uni.university_id } }, relations: ['university'] });
                if (existingCourse) {
                    resolvedCourseId = existingCourse.course_id;
                }
                else {
                    const newCourse = this.coursesRepository.create({ course_name: body.course_name.trim(), university: uni });
                    const savedCourse = await this.coursesRepository.save(newCourse);
                    resolvedCourseId = savedCourse.course_id;
                }
            }
        }
        const user = this.usersRepository.create({
            name: body.name,
            email: body.email,
            password: body.password,
            user_type: 'student',
            status: 'active',
        });
        const savedUser = await this.usersRepository.save(user);
        let university;
        if (body.university_id) {
            university = await this.universitiesRepository.findOne({ where: { university_id: body.university_id } });
            if (!university) {
                throw new common_1.BadRequestException('Invalid university ID');
            }
        }
        let course;
        if (resolvedCourseId) {
            course = await this.coursesRepository.findOne({ where: { course_id: resolvedCourseId } });
        }
        const student = this.studentRepository.create({
            user: savedUser,
            year_level: body.year_level,
            ...(university && { university: university, university_id: university.university_id }),
            ...(course && { course: course, course_id: course.course_id }),
        });
        await this.studentRepository.save(student);
        return (await this.usersRepository.findOne({ where: { user_id: savedUser.user_id }, relations: ['student_profile', 'student_profile.university', 'student_profile.course'] }));
    }
    async createTutor(body) {
        console.log('=== CREATE TUTOR DEBUG ===');
        console.log('Password already hashed:', body.password.startsWith('$2b$'));
        let resolvedCourseId = body.course_id ?? null;
        if (!resolvedCourseId && body.course_name && body.course_name.trim().length > 0) {
            const uni = await this.universitiesRepository.findOne({ where: { university_id: body.university_id } });
            if (uni) {
                const existingCourse = await this.coursesRepository.findOne({ where: { course_name: body.course_name.trim(), university: { university_id: uni.university_id } }, relations: ['university'] });
                if (existingCourse) {
                    resolvedCourseId = existingCourse.course_id;
                }
                else {
                    const newCourse = this.coursesRepository.create({ course_name: body.course_name.trim(), university: uni });
                    const savedCourse = await this.coursesRepository.save(newCourse);
                    resolvedCourseId = savedCourse.course_id;
                }
            }
        }
        const user = this.usersRepository.create({
            name: body.name,
            email: body.email,
            password: body.password,
            user_type: 'tutor',
            status: 'active',
        });
        const savedUser = await this.usersRepository.save(user);
        let university;
        if (body.university_id) {
            university = await this.universitiesRepository.findOne({ where: { university_id: body.university_id } });
            if (!university) {
                throw new common_1.BadRequestException('Invalid university ID');
            }
        }
        let course;
        if (resolvedCourseId) {
            course = await this.coursesRepository.findOne({ where: { course_id: resolvedCourseId } });
        }
        const tutor = this.tutorRepository.create({
            user: savedUser,
            bio: body.bio,
            year_level: body.year_level,
            gcash_number: body.gcash_number,
            session_rate_per_hour: body.SessionRatePerHour ? Number(body.SessionRatePerHour) : null,
            ...(university && { university: university, university_id: university.university_id }),
            ...(course && { course: course, course_id: course.course_id }),
        });
        await this.tutorRepository.save(tutor);
        return (await this.usersRepository.findOne({ where: { user_id: savedUser.user_id }, relations: ['tutor_profile', 'tutor_profile.university', 'tutor_profile.course'] }));
    }
    async getNotifications(userId) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile', 'student_profile']
        });
        if (!user) {
            console.log(`getNotifications: User with user_id=${userId} not found`);
            return { success: true, data: [] };
        }
        let userType = user.user_type;
        if (!userType) {
            userType = user.tutor_profile ? 'tutor' : (user.student_profile ? 'tutee' : 'admin');
        }
        else {
            if (userType === 'student')
                userType = 'tutee';
        }
        console.log(`getNotifications: Fetching notifications for user_id=${userId}, userType=${userType}`);
        let notifications = await this.notificationsService.getNotifications(userId, userType);
        if (userType === 'tutor') {
            notifications = notifications.filter((n) => {
                const message = (n.message || '').toLowerCase();
                return message.includes('requested a booking') ||
                    message.includes('booking request') ||
                    (message.includes('payment') && message.includes('approved by admin'));
            });
        }
        if (userType === 'tutee') {
            notifications = notifications.filter((n) => !((n.message || '').toLowerCase().includes('upcoming')));
        }
        console.log(`getNotifications: Found ${notifications.length} notifications for user_id=${userId}, userType=${userType}`);
        const mapped = notifications.map((n) => {
            let type = 'system';
            const messageLower = (n.message || '').toLowerCase();
            if (messageLower.includes('payment') || messageLower.includes('pay') || messageLower.includes('amount') || messageLower.includes('₱')) {
                type = 'payment';
            }
            else if (messageLower.includes('booking') || messageLower.includes('approved') || messageLower.includes('accepted') || messageLower.includes('declined')) {
                type = 'booking_update';
            }
            else if (n.sessionDate) {
                type = 'upcoming_session';
            }
            return {
                notification_id: n.notification_id,
                user_id: n.userId,
                booking_id: n.booking?.id || null,
                title: n.subjectName || 'Notification',
                message: n.message,
                type: type,
                is_read: n.read,
                created_at: n.timestamp,
                scheduled_for: n.sessionDate ? new Date(n.sessionDate).toISOString() : undefined,
                metadata: {
                    session_date: n.sessionDate ? new Date(n.sessionDate).toISOString() : undefined,
                    subject: n.subjectName,
                    tutor_name: n.booking?.tutor?.user?.name || undefined,
                    student_name: n.booking?.student?.name || undefined
                }
            };
        });
        return { success: true, data: mapped };
    }
    async getUnreadNotificationCount(userId) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile', 'student_profile']
        });
        if (!user) {
            return { success: true, data: { count: 0 } };
        }
        let userType = user.user_type;
        if (!userType) {
            userType = user.tutor_profile ? 'tutor' : (user.student_profile ? 'tutee' : 'admin');
        }
        else if (userType === 'student') {
            userType = 'tutee';
        }
        const count = await this.notificationRepository.count({
            where: { receiver_id: userId, userType: userType, read: false }
        });
        return { success: true, data: { count } };
    }
    async hasUpcomingSessions(userId) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile', 'student_profile']
        });
        if (!user)
            return { success: true, data: { hasUpcoming: false } };
        let isTutor = false;
        if (user.user_type) {
            isTutor = (user.user_type === 'tutor');
        }
        else {
            isTutor = !!user.tutor_profile;
        }
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysFromNow = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);
        const endOfSevenDays = new Date(sevenDaysFromNow);
        endOfSevenDays.setHours(23, 59, 59, 999);
        const statuses = ['upcoming'];
        let hasUpcoming = false;
        if (isTutor) {
            const tutor = await this.tutorRepository.findOne({ where: { user: { user_id: userId } }, relations: ['user'] });
            if (tutor) {
                const count = await this.bookingRequestRepository.count({
                    where: {
                        tutor: { tutor_id: tutor.tutor_id },
                        status: (0, typeorm_2.In)(statuses),
                        date: (0, typeorm_2.Between)(startOfDay, endOfSevenDays)
                    }
                });
                hasUpcoming = count > 0;
            }
        }
        else {
            const count = await this.bookingRequestRepository.count({
                where: {
                    student: { user_id: userId },
                    status: (0, typeorm_2.In)(statuses),
                    date: (0, typeorm_2.Between)(startOfDay, endOfSevenDays)
                }
            });
            hasUpcoming = count > 0;
        }
        return { success: true, data: { hasUpcoming } };
    }
    async getUpcomingSessionsList(userId) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile', 'student_profile']
        });
        if (!user)
            return { success: true, data: [] };
        let isTutor = false;
        if (user.user_type) {
            isTutor = (user.user_type === 'tutor');
        }
        else {
            isTutor = !!user.tutor_profile;
        }
        console.log(`getUpcomingSessionsList: user_id=${userId}, resolved isTutor=${isTutor}, user_type=${user.user_type}`);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysFromNow = new Date(startOfDay.getTime() + 30 * 24 * 60 * 60 * 1000);
        const endOfThirtyDays = new Date(thirtyDaysFromNow);
        endOfThirtyDays.setHours(23, 59, 59, 999);
        const statuses = ['upcoming'];
        let bookings = [];
        if (isTutor) {
            const tutor = await this.tutorRepository.findOne({ where: { user: { user_id: userId } }, relations: ['user'] });
            console.log(`getUpcomingSessionsList: tutor lookup result for user_id=${userId}:`, !!tutor ? `tutor_id=${tutor.tutor_id}` : 'no tutor');
            if (tutor) {
                bookings = await this.bookingRequestRepository.find({
                    where: {
                        tutor: { tutor_id: tutor.tutor_id },
                        status: (0, typeorm_2.In)(statuses),
                        date: (0, typeorm_2.Between)(startOfDay, endOfThirtyDays)
                    },
                    relations: ['tutor', 'tutor.user', 'student'],
                    order: { date: 'ASC' }
                });
                console.log(`getUpcomingSessionsList: found ${bookings.length} upcoming bookings for tutor_id=${tutor.tutor_id}`);
            }
        }
        else {
            bookings = await this.bookingRequestRepository.find({
                where: {
                    student: { user_id: userId },
                    status: (0, typeorm_2.In)(statuses),
                    date: (0, typeorm_2.Between)(startOfDay, endOfThirtyDays)
                },
                relations: ['tutor', 'tutor.user', 'student'],
                order: { date: 'ASC' }
            });
            console.log(`getUpcomingSessionsList: found ${bookings.length} upcoming bookings for student user_id=${userId}`);
        }
        const data = bookings.map((b) => ({
            id: b.id,
            subject: b.subject,
            date: b.date,
            time: b.time,
            duration: b.duration,
            status: b.status,
            created_at: b.created_at,
            tutor_name: b.tutor?.user?.name,
            student_name: b.student?.name
        }));
        return { success: true, data };
    }
    async markNotificationAsRead(notificationId) {
        await this.notificationRepository.update(notificationId, { read: true });
        return { success: true };
    }
    async markAllNotificationsAsRead(userId) {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['tutor_profile', 'student_profile']
        });
        if (!user) {
            return { success: true };
        }
        let userType = user.user_type;
        if (!userType) {
            userType = user.tutor_profile ? 'tutor' : (user.student_profile ? 'tutee' : 'admin');
        }
        else if (userType === 'student') {
            userType = 'tutee';
        }
        await this.notificationRepository.update({ receiver_id: userId, userType: userType }, { read: true });
        return { success: true };
    }
    async markBookingFinished(bookingId) {
        const booking = await this.bookingRequestRepository.findOne({ where: { id: bookingId } });
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        if (booking.status !== 'upcoming') {
            throw new common_1.BadRequestException('Only upcoming bookings can be marked as finished');
        }
        booking.status = 'completed';
        booking.tutor_marked_done_at = new Date();
        await this.bookingRequestRepository.save(booking);
        return { success: true };
    }
};
exports.UsersService = UsersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "handleMoveOverdueBookingsCron", null);
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Admin)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Tutor)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Course)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.University)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Student)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Session)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], UsersService);
//# sourceMappingURL=users.service.js.map