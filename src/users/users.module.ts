import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, Admin, Tutor, Course, University, Student, Notification, BookingRequest, Session, Subject } from '../database/entities';
import { TutorsModule } from '../tutors/tutors.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Tutor, Course, University, Student, Notification, BookingRequest, Session, Subject]), TutorsModule, NotificationsModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for use in AuthModule
})
export class UsersModule {}
