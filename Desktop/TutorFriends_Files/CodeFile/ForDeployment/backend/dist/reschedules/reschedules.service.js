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
exports.ReschedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reschedule_entity_1 = require("../database/entities/reschedule.entity");
const booking_request_entity_1 = require("../database/entities/booking-request.entity");
const user_entity_1 = require("../database/entities/user.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
let ReschedulesService = class ReschedulesService {
    constructor(rescheduleRepo, bookingRepo, userRepo, notificationRepo) {
        this.rescheduleRepo = rescheduleRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
    }
    async propose(userId, dto) {
        const booking = await this.bookingRepo.findOne({ where: { id: dto.booking_id }, relations: ['student', 'tutor', 'tutor.user'] });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const isStudent = booking.student?.user_id === userId;
        const isTutor = booking.tutor?.user?.user_id === userId || (booking.tutor && booking.tutor.user && booking.tutor.user.user_id === userId);
        if (!isStudent && !isTutor)
            throw new common_1.ForbiddenException('You are not a participant of this booking');
        const receiverUserId = isStudent ? booking.tutor?.user?.user_id : booking.student?.user_id;
        if (!receiverUserId)
            throw new common_1.BadRequestException('Could not determine receiver user id');
        const proposer = await this.userRepo.findOne({ where: { user_id: userId } });
        const originalDate = booking.date;
        const originalTime = booking.time;
        const originalDuration = booking.duration;
        booking.date = new Date(dto.proposedDate);
        booking.time = dto.proposedTime;
        if (dto.proposedDuration)
            booking.duration = dto.proposedDuration;
        await this.bookingRepo.save(booking);
        const res = this.rescheduleRepo.create({
            booking: booking,
            proposer_user_id: userId,
            proposer: proposer || undefined,
            proposedDate: new Date(dto.proposedDate),
            proposedTime: dto.proposedTime,
            proposedDuration: dto.proposedDuration,
            reason: dto.reason,
            receiver_user_id: receiverUserId,
            status: 'pending',
            originalDate: originalDate,
            originalTime: originalTime,
            originalDuration: originalDuration,
        });
        const saved = await this.rescheduleRepo.save(res);
        const receiver = await this.userRepo.findOne({ where: { user_id: receiverUserId } });
        const subjectName = booking.subject || 'Session';
        const proposerName = proposer?.name || 'Someone';
        const message = `${proposerName} proposed rescheduling ${subjectName} to ${dto.proposedDate} ${dto.proposedTime}${dto.reason ? ` — ${dto.reason}` : ''}`;
        const userType = isStudent ? 'tutor' : 'tutee';
        await this.notificationRepo.save(this.notificationRepo.create({
            userId: receiverUserId.toString(),
            receiver_id: receiverUserId,
            userType: userType,
            booking: booking,
            message,
            sessionDate: booking.date,
            subjectName,
            read: false,
        }));
        try {
            console.log('Reschedule proposal saved:', { rescheduleId: saved.reschedule_id, bookingId: dto.booking_id, proposer: userId, receiver: receiverUserId });
            console.log('Reschedule notification created for receiver:', { receiver_id: receiverUserId, userType, message });
        }
        catch (err) {
            console.error('Failed to log reschedule debug info', err);
        }
        return { success: true, data: saved };
    }
    async listByBooking(bookingId) {
        return this.rescheduleRepo.find({ where: { booking: { id: bookingId } }, relations: ['proposer', 'booking'] });
    }
    async findById(id) {
        return this.rescheduleRepo.findOne({ where: { reschedule_id: id }, relations: ['proposer', 'booking', 'booking.student', 'booking.tutor', 'booking.tutor.user'] });
    }
    async accept(userId, rescheduleId) {
        const res = await this.findById(rescheduleId);
        if (!res)
            throw new common_1.NotFoundException('Reschedule proposal not found');
        if (res.status !== 'pending')
            throw new common_1.BadRequestException('Reschedule is not pending');
        if (res.receiver_user_id !== userId)
            throw new common_1.ForbiddenException('Only the receiver can accept this proposal');
        res.status = 'accepted';
        await this.rescheduleRepo.save(res);
        const proposerUser = await this.userRepo.findOne({ where: { user_id: res.proposer_user_id } });
        const receiverUser = await this.userRepo.findOne({ where: { user_id: userId } });
        const booking = await this.bookingRepo.findOne({ where: { id: res.booking.id } });
        const subjectName = booking?.subject || 'Session';
        const message = `${receiverUser?.name || 'User'} accepted the reschedule to ${res.proposedDate.toISOString().split('T')[0]} ${res.proposedTime}`;
        await this.notificationRepo.save(this.notificationRepo.create({
            userId: res.proposer_user_id.toString(),
            receiver_id: res.proposer_user_id,
            userType: 'tutee',
            booking: booking,
            message,
            sessionDate: booking?.date,
            subjectName,
            read: false,
        }));
        return { success: true, data: res };
    }
    async reject(userId, rescheduleId) {
        const res = await this.findById(rescheduleId);
        if (!res)
            throw new common_1.NotFoundException('Reschedule proposal not found');
        if (res.status !== 'pending')
            throw new common_1.BadRequestException('Reschedule is not pending');
        if (res.receiver_user_id !== userId)
            throw new common_1.ForbiddenException('Only the receiver can reject this proposal');
        const booking = await this.bookingRepo.findOne({ where: { id: res.booking.id } });
        if (booking && (res.originalDate || res.originalTime || res.originalDuration)) {
            if (res.originalDate)
                booking.date = res.originalDate;
            if (res.originalTime)
                booking.time = res.originalTime;
            if (res.originalDuration)
                booking.duration = res.originalDuration;
            await this.bookingRepo.save(booking);
        }
        res.status = 'rejected';
        await this.rescheduleRepo.save(res);
        const proposerUser = await this.userRepo.findOne({ where: { user_id: res.proposer_user_id } });
        const receiverUser = await this.userRepo.findOne({ where: { user_id: userId } });
        const subjectName = booking?.subject || 'Session';
        const message = `${receiverUser?.name || 'User'} rejected the reschedule proposal`;
        await this.notificationRepo.save(this.notificationRepo.create({
            userId: res.proposer_user_id.toString(),
            receiver_id: res.proposer_user_id,
            userType: 'tutee',
            booking: booking,
            message,
            sessionDate: booking?.date,
            subjectName,
            read: false,
        }));
        return { success: true };
    }
    async cancel(userId, rescheduleId) {
        const res = await this.findById(rescheduleId);
        if (!res)
            throw new common_1.NotFoundException('Reschedule proposal not found');
        if (res.status !== 'pending')
            throw new common_1.BadRequestException('Only pending proposals can be cancelled');
        if (res.proposer_user_id !== userId)
            throw new common_1.ForbiddenException('Only the proposer can cancel this proposal');
        res.status = 'cancelled';
        await this.rescheduleRepo.save(res);
        const receiverUser = await this.userRepo.findOne({ where: { user_id: res.receiver_user_id } });
        const booking = await this.bookingRepo.findOne({ where: { id: res.booking.id } });
        const message = `${res.proposer?.name || 'User'} cancelled the reschedule proposal`;
        await this.notificationRepo.save(this.notificationRepo.create({
            userId: res.receiver_user_id?.toString() || '',
            receiver_id: res.receiver_user_id,
            userType: 'tutor',
            booking: booking,
            message,
            sessionDate: booking?.date,
            subjectName: booking?.subject || 'Session',
            read: false,
        }));
        return { success: true };
    }
};
exports.ReschedulesService = ReschedulesService;
exports.ReschedulesService = ReschedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reschedule_entity_1.Reschedule)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_request_entity_1.BookingRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReschedulesService);
//# sourceMappingURL=reschedules.service.js.map