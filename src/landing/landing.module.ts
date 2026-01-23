import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingController } from './landing.controller';
import { Student, Tutor, University, Course, BookingRequest } from '../database/entities';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Tutor, University, Course, BookingRequest]),
    EmailModule,
  ],
  controllers: [LandingController],
})
export class LandingModule { }


