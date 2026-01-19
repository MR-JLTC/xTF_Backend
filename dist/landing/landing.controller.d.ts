import { Repository } from 'typeorm';
import { Student, Tutor, University, Course, BookingRequest } from '../database/entities';
export declare class LandingController {
    private readonly studentsRepo;
    private readonly tutorsRepo;
    private readonly universitiesRepo;
    private readonly coursesRepo;
    private readonly bookingRequestsRepo;
    constructor(studentsRepo: Repository<Student>, tutorsRepo: Repository<Tutor>, universitiesRepo: Repository<University>, coursesRepo: Repository<Course>, bookingRequestsRepo: Repository<BookingRequest>);
    stats(): Promise<{
        students: number;
        tutors: number;
        universities: number;
        courses: number;
        sessions: number;
    }>;
}
