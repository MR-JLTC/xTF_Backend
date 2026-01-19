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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const entities_2 = require("../database/entities");
let PaymentsService = class PaymentsService {
    constructor(paymentsRepository, payoutsRepository, bookingRepository, tutorsRepository, usersRepository, studentsRepository, notificationRepository, subjectRepository) {
        this.paymentsRepository = paymentsRepository;
        this.payoutsRepository = payoutsRepository;
        this.bookingRepository = bookingRepository;
        this.tutorsRepository = tutorsRepository;
        this.usersRepository = usersRepository;
        this.studentsRepository = studentsRepository;
        this.notificationRepository = notificationRepository;
        this.subjectRepository = subjectRepository;
    }
    findAll() {
        return this.paymentsRepository.find({
            relations: ['student', 'student.user', 'tutor', 'tutor.user', 'bookingRequest', 'subject'],
            order: {
                created_at: 'DESC',
            },
        });
    }
    findAllPayouts() {
        return this.payoutsRepository.find({
            where: {
                status: 'released',
            },
            relations: ['payment', 'tutor', 'tutor.user'],
            order: {
                created_at: 'DESC',
            },
        });
    }
    async getCompletedBookingsWaitingForPayment() {
        try {
            const adminPaymentPendingBookings = await this.bookingRepository.find({
                where: [
                    { status: 'admin_payment_pending' },
                ],
                relations: ['tutor', 'tutor.user', 'student'],
            });
            const completedBookings = await this.bookingRepository.find({
                where: [
                    { status: 'completed' },
                ],
                relations: ['tutor', 'tutor.user', 'student'],
            });
            const allBookings = [...adminPaymentPendingBookings, ...completedBookings];
            const waitingForPayment = [];
            for (const booking of allBookings) {
                try {
                    if (!booking.tutor || !booking.student) {
                        console.warn(`Skipping booking ${booking.id}: missing tutor or student relation`);
                        continue;
                    }
                    const existingPayment = await this.paymentsRepository.findOne({
                        where: {
                            booking_request_id: booking.id,
                        },
                    });
                    let payoutStatus = null;
                    let releaseProofUrl = null;
                    if (existingPayment) {
                        const payout = await this.payoutsRepository.findOne({
                            where: {
                                payment_id: existingPayment.payment_id,
                                status: 'released',
                            },
                        });
                        if (payout) {
                            payoutStatus = 'released';
                            releaseProofUrl = payout.release_proof_url || null;
                        }
                    }
                    if (booking.status !== 'admin_payment_pending' && payoutStatus !== 'released') {
                        continue;
                    }
                    const tutorId = booking.tutor?.tutor_id;
                    if (!tutorId) {
                        console.warn(`Skipping booking ${booking.id}: missing tutor_id`);
                        continue;
                    }
                    const tutor = await this.tutorsRepository.findOne({
                        where: { tutor_id: tutorId },
                        relations: ['user'],
                    });
                    if (!tutor) {
                        console.warn(`Skipping booking ${booking.id}: tutor not found`);
                        continue;
                    }
                    const sessionRate = Number(tutor?.session_rate_per_hour || 0);
                    const duration = Number(booking.duration || 0);
                    const amount = sessionRate * duration;
                    const tutorUser = tutor?.user;
                    const studentUser = booking.student;
                    waitingForPayment.push({
                        booking_id: booking.id,
                        tutor: {
                            tutor_id: tutorId,
                            name: tutorUser?.name || 'Unknown',
                            gcash_number: tutor?.gcash_number || null,
                            gcash_qr_url: tutor?.gcash_qr_url || null,
                            session_rate_per_hour: sessionRate,
                        },
                        student: {
                            user_id: studentUser?.user_id || null,
                            name: studentUser?.name || 'Unknown',
                        },
                        subject: booking.subject || null,
                        date: booking.date || null,
                        time: booking.time || null,
                        duration: duration,
                        session_proof_url: booking.session_proof_url || null,
                        tutee_rating: booking.tutee_rating || null,
                        tutee_comment: booking.tutee_comment || null,
                        amount: amount,
                        calculated_amount: amount * 0.87,
                        payment_status: payoutStatus === 'released' ? 'paid' : (existingPayment ? existingPayment.status : null),
                        payment_id: existingPayment ? existingPayment.payment_id : null,
                        payout_status: payoutStatus,
                        release_proof_url: releaseProofUrl,
                    });
                }
                catch (error) {
                    console.error(`Error processing booking ${booking.id}:`, error);
                    continue;
                }
            }
            return waitingForPayment;
        }
        catch (error) {
            console.error('Error in getCompletedBookingsWaitingForPayment:', error);
            throw error;
        }
    }
    async processAdminPayment(bookingId, receipt) {
        if (!receipt) {
            throw new common_1.BadRequestException('Payment receipt is required');
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tutor', 'tutor.user', 'student'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== 'completed' && booking.status !== 'admin_payment_pending') {
            throw new common_1.BadRequestException('Booking is not completed or ready for payment');
        }
        if (!booking.session_proof_url) {
            throw new common_1.BadRequestException('Tutor must provide session proof before payment can be processed');
        }
        if (!booking.tutee_rating) {
            throw new common_1.BadRequestException('Tutee must provide a rating before payment can be processed');
        }
        if (!booking.tutee_feedback_at) {
            throw new common_1.BadRequestException('Tutee must provide feedback before payment can be processed');
        }
        const tutor = await this.tutorsRepository.findOne({
            where: { tutor_id: booking.tutor.tutor_id },
        });
        const sessionRate = tutor?.session_rate_per_hour || 0;
        const amount = Number(sessionRate) * Number(booking.duration || 0);
        const studentUser = await this.usersRepository.findOne({
            where: { user_id: booking.student.user_id },
        });
        if (!studentUser)
            throw new common_1.NotFoundException('Student user not found');
        let student = await this.studentsRepository.findOne({
            where: { user: { user_id: studentUser.user_id } },
            relations: ['user'],
        });
        if (!student) {
            const newStudent = this.studentsRepository.create({ user: studentUser });
            const savedStudent = await this.studentsRepository.save(newStudent);
            student = Array.isArray(savedStudent) ? savedStudent[0] : savedStudent;
        }
        let payment = await this.paymentsRepository.findOne({
            where: {
                booking_request_id: bookingId,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found for this booking. Please ensure the tutee has paid first.');
        }
        const receiptUrl = `/tutor_documents/${receipt.filename}`;
        const amountReleased = Number((Number(payment.amount) * 0.87).toFixed(2));
        let existingPayout = await this.payoutsRepository.findOne({
            where: {
                payment_id: payment.payment_id,
            },
        });
        if (existingPayout) {
            existingPayout.status = 'released';
            existingPayout.amount_released = amountReleased;
            existingPayout.release_proof_url = receiptUrl;
            await this.payoutsRepository.save(existingPayout);
        }
        else {
            const newPayout = this.payoutsRepository.create({
                payment_id: payment.payment_id,
                tutor_id: booking.tutor.tutor_id,
                amount_released: amountReleased,
                status: 'released',
                release_proof_url: receiptUrl,
            });
            await this.payoutsRepository.save(newPayout);
        }
        booking.status = 'completed';
        await this.bookingRepository.save(booking);
        return { success: true, payment, payout: existingPayout || await this.payoutsRepository.findOne({ where: { payment_id: payment.payment_id } }) };
    }
    async updateDispute(id, dto) {
        const payment = await this.paymentsRepository.findOne({ where: { payment_id: id } });
        if (!payment) {
            throw new Error('Payment not found');
        }
        payment.dispute_status = dto.dispute_status;
        return this.paymentsRepository.save(payment);
    }
    async submitProof(bookingId, adminId, amount, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['tutor', 'student']
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const tutor = await this.tutorsRepository.findOne({ where: { tutor_id: booking.tutor?.tutor_id }, relations: ['user'] });
        const studentUser = await this.usersRepository.findOne({ where: { user_id: booking.student?.user_id } });
        if (!tutor || !studentUser)
            throw new common_1.BadRequestException('Invalid booking parties');
        let student = await this.studentsRepository.findOne({
            where: { user: { user_id: studentUser.user_id } },
            relations: ['user']
        });
        if (!student) {
            const newStudent = this.studentsRepository.create({
                user: studentUser
            });
            const savedStudent = await this.studentsRepository.save(newStudent);
            student = Array.isArray(savedStudent) ? savedStudent[0] : savedStudent;
            console.log(`submitProof: Created new Student record with student_id=${student.student_id} for user_id=${studentUser.user_id}`);
        }
        const fileUrl = `/tutor_documents/${file.filename}`;
        let subjectId = null;
        if (booking.subject) {
            const subject = await this.subjectRepository.findOne({
                where: { subject_name: booking.subject }
            });
            subjectId = subject?.subject_id || null;
        }
        const existingPayment = await this.paymentsRepository.findOne({
            where: {
                booking_request_id: bookingId,
            },
        });
        let saved;
        let savedId;
        if (existingPayment) {
            existingPayment.amount = Number(amount);
            if (subjectId)
                existingPayment.subject_id = subjectId;
            existingPayment.status = 'pending';
            existingPayment.payment_proof_url = fileUrl;
            saved = await this.paymentsRepository.save(existingPayment);
            savedId = saved.payment_id;
            console.log(`submitProof: Updated existing payment with payment_id=${savedId}`);
        }
        else {
            const payment = this.paymentsRepository.create({
                student_id: student.student_id,
                tutor_id: tutor.tutor_id,
                booking_request_id: bookingId,
                amount: Number(amount),
                status: 'pending',
                dispute_status: 'none',
                subject_id: subjectId,
                payment_proof_url: fileUrl,
            });
            saved = await this.paymentsRepository.save(payment);
            savedId = saved.payment_id;
            console.log(`submitProof: Created payment with payment_id=${savedId}, student_id=${student.student_id}, tutor_id=${tutor.tutor_id}`);
        }
        console.log(`submitProof: Created payment with payment_id=${savedId}, student_id=${student.student_id}, tutor_id=${tutor.tutor_id}`);
        booking.payment_proof = fileUrl;
        booking.status = 'payment_pending';
        await this.bookingRepository.save(booking);
        console.log(`submitProof: Updated booking_id=${booking.id} to status=payment_pending`);
        try {
            const admins = await this.usersRepository.find({ where: { user_type: 'admin' } });
            const studentName = booking?.student?.name || studentUser?.name || 'Student';
            const notifications = admins.map((admin) => this.notificationRepository.create({
                userId: String(admin.user_id),
                receiver_id: admin.user_id,
                userType: 'admin',
                message: `New payment proof submitted by ${studentName} for ${booking.subject}.`,
                timestamp: new Date(),
                read: false,
                sessionDate: new Date(),
                subjectName: 'Payment Submission'
            }));
            if (notifications.length) {
                await this.notificationRepository.save(notifications);
                console.log(`submitProof: Notified ${notifications.length} admin(s) of new payment proof`);
            }
            try {
                const pendingCount = await this.paymentsRepository.count({ where: { status: 'pending' } });
                for (const admin of admins) {
                    const existing = await this.notificationRepository.findOne({ where: { receiver_id: admin.user_id, subjectName: 'Unreviewed Payments', read: false } });
                    if (!existing) {
                        const summary = this.notificationRepository.create({
                            userId: String(admin.user_id),
                            receiver_id: admin.user_id,
                            userType: 'admin',
                            message: `There are currently ${pendingCount} unreviewed payment proof(s) awaiting review.`,
                            timestamp: new Date(),
                            read: false,
                            sessionDate: new Date(),
                            subjectName: 'Unreviewed Payments'
                        });
                        await this.notificationRepository.save(summary);
                        console.log(`submitProof: Created unreviewed payments summary notification for admin user_id=${admin.user_id}`);
                    }
                }
            }
            catch (e) {
                console.warn('submitProof: Failed to create unreviewed payments summary notifications', e);
            }
        }
        catch (e) {
            console.warn('submitProof: Failed to notify admins of payment submission', e);
        }
        return { success: true, payment_id: savedId, booking_id: booking.id };
    }
    async verifyPayment(id, status, adminProofFile, rejectionReason) {
        const payment = await this.paymentsRepository.findOne({
            where: { payment_id: id },
            relations: ['tutor', 'tutor.user', 'student', 'student.user', 'bookingRequest']
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (status === 'confirmed') {
            payment.status = 'confirmed';
        }
        else {
            payment.status = 'refunded';
        }
        await this.paymentsRepository.save(payment);
        try {
            const pendingNow = await this.paymentsRepository.count({ where: { status: 'pending' } });
            if (pendingNow === 0) {
                await this.notificationRepository.update({ subjectName: 'Unreviewed Payments' }, { read: true });
                console.log('verifyPayment: No pending payments remain - marked Unreviewed Payments notifications as read');
            }
        }
        catch (e) {
            console.warn('verifyPayment: Failed to update Unreviewed Payments summary notifications', e);
        }
        if (status === 'confirmed') {
            try {
                const bookingRequestId = payment?.booking_request_id;
                if (bookingRequestId) {
                    const booking = await this.bookingRepository.findOne({
                        where: { id: bookingRequestId },
                        relations: ['tutor', 'student']
                    });
                    if (booking) {
                        booking.status = 'upcoming';
                        await this.bookingRepository.save(booking);
                        console.log(`verifyPayment: Updated booking_id=${bookingRequestId} to status=upcoming`);
                    }
                    else {
                        console.warn(`verifyPayment: No booking found with id=${bookingRequestId} associated with payment_id=${id}`);
                    }
                }
                else {
                    console.warn(`verifyPayment: Payment ${id} has no booking_request_id, cannot update booking status`);
                }
            }
            catch (err) {
                console.error('verifyPayment: Failed to update related booking status', err);
            }
        }
        const amount = payment.amount;
        const studentUserId = payment.student?.user?.user_id;
        const tutorUserId = payment.tutor?.user?.user_id;
        const studentName = payment.student?.user?.name || 'Student';
        const tutorName = payment.tutor?.user?.name || 'Tutor';
        const subject = payment.subject || 'session';
        if (studentUserId) {
            try {
                let tuteeMessage = '';
                let tuteeSubjectName = '';
                if (status === 'confirmed') {
                    tuteeMessage = `Your payment of ₱${Number(amount).toFixed(2)} for ${subject} with ${tutorName} has been approved by the admin. Your session is now confirmed and upcoming.`;
                    tuteeSubjectName = 'Payment Approved by Admin';
                }
                else if (status === 'rejected') {
                    const reasonText = rejectionReason ? ` Reason: ${rejectionReason}` : '';
                    tuteeMessage = `Your payment of ₱${Number(amount).toFixed(2)} for ${subject} with ${tutorName} has been rejected by the admin.${reasonText} Please check your payment proof and resubmit if needed.`;
                    tuteeSubjectName = 'Payment Rejected';
                }
                if (tuteeMessage) {
                    let sessionDate = new Date();
                    try {
                        const booking = await this.bookingRepository.findOne({
                            where: {
                                student: { user_id: studentUserId },
                                tutor: { tutor_id: payment.tutor_id },
                                status: 'payment_pending'
                            },
                            order: { created_at: 'DESC' }
                        });
                        if (booking && booking.date) {
                            sessionDate = new Date(booking.date);
                        }
                    }
                    catch (e) {
                        console.warn('verifyPayment: Could not find booking for session date, using current date');
                    }
                    const tuteeNotification = this.notificationRepository.create({
                        userId: studentUserId.toString(),
                        receiver_id: studentUserId,
                        userType: 'tutee',
                        message: tuteeMessage,
                        timestamp: new Date(),
                        read: false,
                        sessionDate: sessionDate,
                        subjectName: tuteeSubjectName
                    });
                    await this.notificationRepository.save(tuteeNotification);
                    console.log(`verifyPayment: Sent notification to tutee user_id=${studentUserId} for payment ${status}`);
                }
            }
            catch (e) {
                console.error('verifyPayment: Failed to create notification for tutee', e);
            }
        }
        return { success: true };
    }
    async confirmByTutor(id, tutorUserId) {
        const payment = await this.paymentsRepository.findOne({
            where: { payment_id: id },
            relations: ['tutor', 'tutor.user', 'student', 'student.user']
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const linkedTutorUserId = payment?.tutor?.user?.user_id;
        if (!linkedTutorUserId || linkedTutorUserId !== tutorUserId) {
            throw new common_1.ForbiddenException('You are not authorized to confirm this payment');
        }
        payment.status = 'confirmed';
        await this.paymentsRepository.save(payment);
        try {
            const studentUserId = payment?.student?.user?.user_id;
            const tutorId = payment?.tutor_id;
            if (studentUserId && tutorId) {
                const booking = await this.bookingRepository.findOne({
                    where: {
                        student: { user_id: studentUserId },
                        tutor: { tutor_id: tutorId },
                        status: 'payment_pending'
                    },
                    order: { created_at: 'DESC' },
                    relations: ['tutor', 'student']
                });
                let targetBooking = booking;
                if (!targetBooking) {
                    targetBooking = await this.bookingRepository.findOne({
                        where: {
                            student: { user_id: studentUserId },
                            tutor: { tutor_id: tutorId },
                            status: 'awaiting_payment'
                        },
                        order: { created_at: 'DESC' },
                        relations: ['tutor', 'student']
                    });
                }
                if (targetBooking) {
                    targetBooking.status = 'upcoming';
                    await this.bookingRepository.save(targetBooking);
                    console.log(`confirmByTutor: Updated booking_id=${targetBooking.id} to status=upcoming`);
                }
                else {
                    console.warn(`confirmByTutor: No matching booking found to update for tutor_id=${tutorId}, student_user_id=${studentUserId}`);
                }
            }
        }
        catch (err) {
            console.error('confirmByTutor: Failed to update related booking status', err);
        }
        try {
            const studentUserId = payment.student?.user?.user_id;
            if (studentUserId) {
                const notification = this.notificationRepository.create({
                    userId: String(studentUserId),
                    receiver_id: studentUserId,
                    userType: 'tutee',
                    message: `Your payment of $${Number(payment.amount).toFixed(2)} has been confirmed by the tutor.`,
                    timestamp: new Date(),
                    read: false,
                    sessionDate: new Date(),
                    subjectName: 'Payment Confirmed'
                });
                await this.notificationRepository.save(notification);
            }
        }
        catch (e) {
            console.warn('confirmByTutor: Failed to notify student', e);
        }
        return { success: true };
    }
    async requestPayment(bookingId, tutorId, amount, subject) {
        try {
            const booking = await this.bookingRepository.findOne({
                where: { id: bookingId },
                relations: ['student', 'tutor']
            });
            if (!booking)
                throw new common_1.NotFoundException('Booking not found');
            const tutor = await this.tutorsRepository.findOne({ where: { tutor_id: tutorId }, relations: ['user'] });
            if (!tutor)
                throw new common_1.NotFoundException('Tutor not found');
            const studentUser = await this.usersRepository.findOne({ where: { user_id: booking.student?.user_id } });
            if (!studentUser)
                throw new common_1.NotFoundException('Student user not found');
            let student = await this.studentsRepository.findOne({ where: { user: { user_id: studentUser.user_id } }, relations: ['user'] });
            if (!student) {
                const newStudent = this.studentsRepository.create({ user: studentUser });
                const savedStudent = await this.studentsRepository.save(newStudent);
                student = Array.isArray(savedStudent) ? savedStudent[0] : savedStudent;
            }
            const bookingSubject = subject || booking.subject || null;
            const existingPayment = await this.paymentsRepository.findOne({
                where: {
                    booking_request_id: bookingId,
                },
            });
            let saved;
            let savedId;
            let subjectId = null;
            if (bookingSubject) {
                const subject = await this.subjectRepository.findOne({
                    where: { subject_name: bookingSubject }
                });
                subjectId = subject?.subject_id || null;
            }
            if (existingPayment) {
                existingPayment.amount = Number(amount);
                if (subjectId)
                    existingPayment.subject_id = subjectId;
                saved = await this.paymentsRepository.save(existingPayment);
                savedId = saved.payment_id;
            }
            else {
                const payment = this.paymentsRepository.create({
                    student_id: student.student_id,
                    tutor_id: tutor.tutor_id,
                    booking_request_id: bookingId,
                    amount: Number(amount),
                    status: 'pending',
                    dispute_status: 'none',
                    subject_id: subjectId,
                });
                saved = await this.paymentsRepository.save(payment);
                savedId = saved.payment_id;
            }
            booking.status = 'admin_payment_pending';
            await this.bookingRepository.save(booking);
            try {
                const admins = await this.usersRepository.find({ where: { user_type: 'admin' } });
                const tutorName = tutor.user?.name || 'Tutor';
                const notifications = admins.map((admin) => this.notificationRepository.create({
                    userId: String(admin.user_id),
                    receiver_id: admin.user_id,
                    userType: 'admin',
                    message: `Payment request submitted by ${tutorName} for session ${subject || booking.subject || ''}.`,
                    timestamp: new Date(),
                    read: false,
                    sessionDate: new Date(),
                    subjectName: 'Payment Request'
                }));
                if (notifications.length) {
                    await this.notificationRepository.save(notifications);
                }
            }
            catch (e) {
                console.warn('requestPayment: Failed to notify admins', e);
            }
            return { success: true, payment_id: savedId, booking_id: booking.id };
        }
        catch (error) {
            console.error('requestPayment: Error occurred', error);
            throw error;
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Payout)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_2.BookingRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_2.Tutor)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_2.User)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_2.Student)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_2.Notification)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_2.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map