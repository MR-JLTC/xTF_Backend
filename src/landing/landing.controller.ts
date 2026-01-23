import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, Tutor, University, Course, BookingRequest } from '../database/entities';
import { EmailService } from '../email/email.service';

@Controller('landing')
export class LandingController {
  constructor(
    @InjectRepository(Student) private readonly studentsRepo: Repository<Student>,
    @InjectRepository(Tutor) private readonly tutorsRepo: Repository<Tutor>,
    @InjectRepository(University) private readonly universitiesRepo: Repository<University>,
    @InjectRepository(Course) private readonly coursesRepo: Repository<Course>,
    @InjectRepository(BookingRequest) private readonly bookingRequestsRepo: Repository<BookingRequest>,
    private readonly emailService: EmailService,
  ) { }

  @Get('stats')
  async stats() {
    const [students, tutors, universities, courses, sessions] = await Promise.all([
      this.studentsRepo.count(),
      this.tutorsRepo.count(),
      this.universitiesRepo.count(),
      this.coursesRepo.count(),
      this.bookingRequestsRepo.count({ where: { status: 'completed' } }),
    ]);
    return { students, tutors, universities, courses, sessions };
  }

  @Post('contact')
  async contact(@Body() body: { name: string; email: string; message: string }) {
    return this.emailService.sendContactEmail({
      name: body.name,
      email: body.email,
      subject: 'Message from Landing Page',
      message: body.message,
    });
  }
}


