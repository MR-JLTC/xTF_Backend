import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
