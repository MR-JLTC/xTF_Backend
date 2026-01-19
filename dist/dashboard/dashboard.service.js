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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const session_entity_1 = require("../database/entities/session.entity");
const subject_entity_1 = require("../database/entities/subject.entity");
const student_entity_1 = require("../database/entities/student.entity");
const university_entity_1 = require("../database/entities/university.entity");
const course_entity_1 = require("../database/entities/course.entity");
const booking_request_entity_1 = require("../database/entities/booking-request.entity");
let DashboardService = class DashboardService {
    constructor(usersRepository, tutorsRepository, paymentsRepository, sessionsRepository, subjectsRepository, studentsRepository, universitiesRepository, coursesRepository, payoutsRepository, bookingRequestRepository) {
        this.usersRepository = usersRepository;
        this.tutorsRepository = tutorsRepository;
        this.paymentsRepository = paymentsRepository;
        this.sessionsRepository = sessionsRepository;
        this.subjectsRepository = subjectsRepository;
        this.studentsRepository = studentsRepository;
        this.universitiesRepository = universitiesRepository;
        this.coursesRepository = coursesRepository;
        this.payoutsRepository = payoutsRepository;
        this.bookingRequestRepository = bookingRequestRepository;
    }
    async getStats() {
        const totalUsers = await this.usersRepository.count();
        const totalTutors = await this.tutorsRepository.count({
            where: { status: 'approved' },
        });
        const pendingApplications = await this.tutorsRepository.count({
            where: { status: 'pending' },
        });
        const PLATFORM_SHARE = 0.13;
        const totalRevenueResult = await this.payoutsRepository
            .createQueryBuilder('payout')
            .select('COALESCE(SUM(payout.amount_released), 0)', 'sum')
            .where('payout.status = :releasedStatus', { releasedStatus: 'released' })
            .getRawOne();
        const totalAmount = Number(parseFloat(totalRevenueResult?.sum || '0') || 0);
        const totalRevenue = Number((totalAmount * PLATFORM_SHARE).toFixed(2));
        console.log(`[Dashboard] Total Revenue Query:`, {
            result: totalRevenueResult,
            sum: totalRevenueResult?.sum,
            totalAmount,
            totalRevenue,
            platformShare: PLATFORM_SHARE,
            filters: 'payouts.status = "released"'
        });
        const confirmedSessions = await this.bookingRequestRepository.count({
            where: { status: 'completed' },
        });
        const inDemandSubjectsRaw = await this.sessionsRepository
            .createQueryBuilder('session')
            .select('session.subject_id', 'subject_id')
            .addSelect('COUNT(session.session_id)', 'count')
            .where('session.status = :status', { status: 'completed' })
            .groupBy('session.subject_id')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();
        const subjectIds = inDemandSubjectsRaw.map((row) => row.subject_id).filter(Boolean);
        let subjectsMap = {};
        if (subjectIds.length > 0) {
            const subjects = await this.subjectsRepository.findByIds(subjectIds);
            subjectsMap = subjects.reduce((acc, s) => {
                acc[s.subject_id] = s.name;
                return acc;
            }, {});
        }
        const mostInDemandSubjects = inDemandSubjectsRaw.map((row) => ({
            subjectId: Number(row.subject_id),
            subjectName: subjectsMap[Number(row.subject_id)] || 'Unknown',
            sessions: Number(row.count),
        }));
        const paymentStatusCountsRaw = await this.paymentsRepository
            .createQueryBuilder('payment')
            .select('payment.status', 'status')
            .addSelect('COUNT(payment.payment_id)', 'count')
            .groupBy('payment.status')
            .getRawMany();
        const paymentStatusCounts = paymentStatusCountsRaw.reduce((acc, row) => {
            acc[row.status] = Number(row.count);
            return acc;
        }, {});
        const recentPaymentsSumRaw = await this.paymentsRepository
            .createQueryBuilder('payment')
            .select('COALESCE(SUM(payment.amount * :platformShare), 0)', 'sum')
            .where('payment.created_at >= NOW() - INTERVAL \'30 days\'')
            .andWhere('(payment.status = :confirmed OR payment.status = :paid)', {
            confirmed: 'confirmed',
            paid: 'paid',
            platformShare: PLATFORM_SHARE
        })
            .getRawOne();
        const recentConfirmedRevenue = Number((parseFloat(recentPaymentsSumRaw?.sum || '0') || 0).toFixed(2));
        console.log(`[Dashboard] Recent Confirmed Revenue:`, {
            result: recentPaymentsSumRaw,
            sum: recentPaymentsSumRaw?.sum,
            recentConfirmedRevenue
        });
        const paymentTrendsRaw = await this.paymentsRepository
            .createQueryBuilder('payment')
            .select("TO_CHAR(payment.created_at, 'YYYY-MM')", 'period')
            .addSelect("TO_CHAR(payment.created_at, 'Mon YYYY')", 'label')
            .addSelect('COALESCE(SUM(payment.amount * :platformShare), 0)', 'sum')
            .where('(payment.status = :confirmed OR payment.status = :paid)', {
            confirmed: 'confirmed',
            paid: 'paid',
            platformShare: PLATFORM_SHARE
        })
            .andWhere('payment.created_at >= NOW() - INTERVAL \'6 months\'')
            .groupBy('period')
            .addGroupBy('label')
            .orderBy('period', 'ASC')
            .getRawMany();
        const paymentTrends = paymentTrendsRaw.map((row) => ({
            label: row.label || row.period,
            amount: Number((parseFloat(row.sum || '0') || 0).toFixed(2)),
        }));
        console.log(`[Dashboard] Payment Trends:`, paymentTrends);
        const tutorUniRaw = await this.tutorsRepository
            .createQueryBuilder('tutor')
            .select('tutor.university_id', 'university_id')
            .addSelect('COUNT(tutor.tutor_id)', 'tutors')
            .where('tutor.university_id IS NOT NULL')
            .andWhere('tutor.status = :status', { status: 'approved' })
            .groupBy('tutor.university_id')
            .getRawMany();
        const tuteeUniRaw = await this.studentsRepository
            .createQueryBuilder('student')
            .select('student.university_id', 'university_id')
            .addSelect('COUNT(student.student_id)', 'tutees')
            .where('student.university_id IS NOT NULL')
            .groupBy('student.university_id')
            .getRawMany();
        const uniIds = Array.from(new Set([
            ...tutorUniRaw.map((r) => Number(r.university_id)),
            ...tuteeUniRaw.map((r) => Number(r.university_id)),
        ].filter(Boolean)));
        const uniMap = {};
        if (uniIds.length) {
            const universities = await this.universitiesRepository.findByIds(uniIds);
            universities.forEach(u => { uniMap[u.university_id] = u.name; });
        }
        const uniAgg = {};
        tutorUniRaw.forEach((r) => {
            const id = Number(r.university_id);
            if (!id)
                return;
            uniAgg[id] = uniAgg[id] || { university: uniMap[id] || 'Unknown', tutors: 0, tutees: 0 };
            uniAgg[id].tutors = Number(r.tutors) || 0;
        });
        tuteeUniRaw.forEach((r) => {
            const id = Number(r.university_id);
            if (!id)
                return;
            uniAgg[id] = uniAgg[id] || { university: uniMap[id] || 'Unknown', tutors: 0, tutees: 0 };
            uniAgg[id].tutees = Number(r.tutees) || 0;
        });
        const universityDistribution = Object.values(uniAgg).sort((a, b) => (b.tutors + b.tutees) - (a.tutors + a.tutees));
        const tutorsTotal = await this.tutorsRepository.count({ where: { status: 'approved' } });
        let tuteesTotal = await this.usersRepository.count({ where: { user_type: 'tutee' } });
        if (!tuteesTotal) {
            tuteesTotal = await this.studentsRepository.count();
        }
        const userTypeTotals = { tutors: tutorsTotal, tutees: tuteesTotal };
        const tutorCourseRaw = await this.tutorsRepository
            .createQueryBuilder('tutor')
            .select('tutor.course_id', 'course_id')
            .addSelect('COUNT(tutor.tutor_id)', 'tutors')
            .where('tutor.course_id IS NOT NULL')
            .andWhere('tutor.status = :status', { status: 'approved' })
            .groupBy('tutor.course_id')
            .getRawMany();
        const tuteeCourseRaw = await this.studentsRepository
            .createQueryBuilder('student')
            .select('student.course_id', 'course_id')
            .addSelect('COUNT(student.student_id)', 'tutees')
            .where('student.course_id IS NOT NULL')
            .groupBy('student.course_id')
            .getRawMany();
        const courseIds = Array.from(new Set([
            ...tutorCourseRaw.map((r) => Number(r.course_id)),
            ...tuteeCourseRaw.map((r) => Number(r.course_id)),
        ].filter(Boolean)));
        const courseMap = {};
        if (courseIds.length) {
            const courses = await this.coursesRepository.findByIds(courseIds);
            courses.forEach(c => { courseMap[c.course_id] = c.course_name || c.name; });
        }
        const courseAgg = {};
        tutorCourseRaw.forEach((r) => {
            const id = Number(r.course_id);
            if (!id)
                return;
            courseAgg[id] = courseAgg[id] || { courseName: courseMap[id] || 'Unknown', tutors: 0, tutees: 0 };
            courseAgg[id].tutors = Number(r.tutors) || 0;
        });
        tuteeCourseRaw.forEach((r) => {
            const id = Number(r.course_id);
            if (!id)
                return;
            courseAgg[id] = courseAgg[id] || { courseName: courseMap[id] || 'Unknown', tutors: 0, tutees: 0 };
            courseAgg[id].tutees = Number(r.tutees) || 0;
        });
        const courseDistribution = Object.values(courseAgg).sort((a, b) => (b.tutors + b.tutees) - (a.tutors + a.tutees));
        const subjectSessionsRaw = await this.bookingRequestRepository
            .createQueryBuilder('booking')
            .select('booking.subject', 'subject')
            .addSelect('COUNT(booking.id)', 'sessions')
            .where('booking.status IN (:...statuses)', { statuses: ['completed', 'admin_payment_pending'] })
            .groupBy('booking.subject')
            .orderBy('sessions', 'DESC')
            .getRawMany();
        const subjectSessions = subjectSessionsRaw.map((r) => {
            const subjectName = r.subject || 'Unknown';
            return {
                subjectId: null,
                subjectName: subjectName,
                sessions: Number(r.sessions) || 0,
            };
        }).filter(s => s.subjectName && s.subjectName !== 'Unknown');
        return {
            totalUsers,
            totalTutors,
            pendingApplications,
            totalRevenue,
            confirmedSessions,
            mostInDemandSubjects,
            paymentOverview: {
                byStatus: paymentStatusCounts,
                recentConfirmedRevenue,
                trends: paymentTrends,
            },
            universityDistribution,
            userTypeTotals,
            courseDistribution,
            subjectSessions,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Tutor)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(4, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(5, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(6, (0, typeorm_1.InjectRepository)(university_entity_1.University)),
    __param(7, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Payout)),
    __param(9, (0, typeorm_1.InjectRepository)(booking_request_entity_1.BookingRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map