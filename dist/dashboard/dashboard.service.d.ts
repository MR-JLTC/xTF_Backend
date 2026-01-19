import { Repository } from 'typeorm';
import { User, Tutor, Payment, Payout } from '../database/entities';
import { Session } from '../database/entities/session.entity';
import { Subject } from '../database/entities/subject.entity';
import { Student } from '../database/entities/student.entity';
import { University } from '../database/entities/university.entity';
import { Course } from '../database/entities/course.entity';
import { BookingRequest } from '../database/entities/booking-request.entity';
export declare class DashboardService {
    private usersRepository;
    private tutorsRepository;
    private paymentsRepository;
    private sessionsRepository;
    private subjectsRepository;
    private studentsRepository;
    private universitiesRepository;
    private coursesRepository;
    private payoutsRepository;
    private bookingRequestRepository;
    constructor(usersRepository: Repository<User>, tutorsRepository: Repository<Tutor>, paymentsRepository: Repository<Payment>, sessionsRepository: Repository<Session>, subjectsRepository: Repository<Subject>, studentsRepository: Repository<Student>, universitiesRepository: Repository<University>, coursesRepository: Repository<Course>, payoutsRepository: Repository<Payout>, bookingRequestRepository: Repository<BookingRequest>);
    getStats(): Promise<{
        totalUsers: number;
        totalTutors: number;
        pendingApplications: number;
        totalRevenue: number;
        confirmedSessions: number;
        mostInDemandSubjects: {
            subjectId: number;
            subjectName: string;
            sessions: number;
        }[];
        paymentOverview: {
            byStatus: any;
            recentConfirmedRevenue: number;
            trends: {
                label: any;
                amount: number;
            }[];
        };
        universityDistribution: {
            university: string;
            tutors: number;
            tutees: number;
        }[];
        userTypeTotals: {
            tutors: number;
            tutees: number;
        };
        courseDistribution: {
            courseName: string;
            tutors: number;
            tutees: number;
        }[];
        subjectSessions: {
            subjectId: any;
            subjectName: any;
            sessions: number;
        }[];
    }>;
}
