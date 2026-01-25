import { Controller, Get, Patch, Param, Body, UseGuards, Delete, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { UsersService } from './users.service';
import { TutorsService } from '../tutors/tutors.service';
import { Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SupabaseService } from '../supabase/supabase.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tutorsService: TutorsService,
    private readonly supabaseService: SupabaseService
  ) { }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    // This is a simplified mapping. A real app might use DTOs or serializers.
    return users.map(u => ({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      profile_image_url: u.profile_image_url,
      university_id: u.student_profile?.university_id || u.tutor_profile?.university_id || null,
      course_id: u.student_profile?.course_id || u.tutor_profile?.course_id || null,
      university_name: u.student_profile?.university?.name || u.tutor_profile?.university?.name || 'N/A',
      university: u.student_profile?.university || u.tutor_profile?.university || null,
      course: u.student_profile?.course || u.tutor_profile?.course || null,
      status: u.status,
      created_at: u.created_at,
      role: u.admin_profile ? 'admin' : (u.tutor_profile ? 'tutor' : 'student'),
      tutor_profile: u.tutor_profile ? {
        tutor_id: u.tutor_profile.tutor_id,
        status: u.tutor_profile.status,
        activity_status: u.tutor_profile.activity_status ?? 'offline'
      } : null
    }));
  }
  /**
   * Admin endpoint: Move overdue bookings to sessions and mark as finished
   */
  @Patch('bookings/move-overdue')
  async moveOverdueBookingsToSessions() {
    return this.usersService.moveOverdueBookingsToSessions();
  }

  @Get('test-auth')
  async testAuth() {
    console.log('=== TEST AUTH ENDPOINT ===');
    return { message: 'Authentication successful', timestamp: new Date().toISOString() };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: 'active' | 'inactive' }) {
    return this.usersService.updateStatus(+id, body.status);
  }

  @Patch(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Body() body: { newPassword: string }) {
    return this.usersService.resetPassword(+id, body.newPassword);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; status?: 'active' | 'inactive'; year_level?: number; university_id?: number; profile_image_url?: string },
  ) {
    return this.usersService.updateUser(+id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }

  @Post(':id/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(@Param('id') id: string, @UploadedFile() file: any) {
    const userId = parseInt(id);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `userProfile_${userId}${ext}`;

    // Upload to Supabase 'user_profile_images' bucket/folder
    // Assuming 'user_profile_images' is a folder inside the main bucket
    const publicUrl = await this.supabaseService.uploadFile('user_profile_images', filename, file.buffer, file.mimetype);

    // Update the user's profile_image_url in the database
    // We store the full public URL now.
    await this.usersService.updateUser(userId, {
      profile_image_url: publicUrl
    });

    return {
      message: 'Profile image uploaded successfully',
      profile_image_url: publicUrl
    };
  }

  @Post(':id/profile-image-placeholder')
  async setPlaceholderProfileImage(@Param('id') id: string) {
    const userId = parseInt(id);
    // No placeholder image stored, just return success
    // The frontend will use initials as fallback

    return {
      message: 'Placeholder profile image set successfully',
      profile_image_url: null
    };
  }

  @Get('me/bookings')
  async getMyBookings(@Req() req: any) {
    const userId = req.user?.user_id;
    return this.tutorsService.getStudentBookingRequests(userId);
  }

  @Get(':id/bookings')
  async getBookingsForUser(@Param('id') id: string) {
    return this.tutorsService.getStudentBookingRequests(+id);
  }

  // Notifications endpoints
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any) {
    const userId = req.user?.user_id;
    return this.usersService.getNotifications(userId);
  }

  @Get('notifications/unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.user_id;
    return this.usersService.getUnreadNotificationCount(userId);
  }

  @Get('notifications/upcoming-sessions')
  async getUpcomingSessions(@Req() req: any) {
    const userId = req.user?.user_id;
    return this.usersService.hasUpcomingSessions(userId);
  }

  @Get('upcoming-sessions/list')
  async getUpcomingSessionsList(@Req() req: any) {
    const userId = req.user?.user_id;
    return this.usersService.getUpcomingSessionsList(userId);
  }

  @Post('bookings/:bookingId/feedback')
  async submitBookingFeedback(@Param('bookingId') bookingId: string, @Req() req: any, @Body() body: { rating: number; comment?: string }) {
    const userId = req.user?.user_id;
    return this.usersService.submitBookingFeedback(+bookingId, userId, body.rating, body.comment || '');
  }

  @Post('bookings/:bookingId/confirm-completion')
  async confirmBookingCompletion(@Param('bookingId') bookingId: string, @Req() req: any) {
    const userId = req.user?.user_id;
    return this.usersService.confirmBookingCompletion(+bookingId, userId);
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string) {
    return this.usersService.markNotificationAsRead(+id);
  }

  @Patch('notifications/mark-all-read')
  async markAllNotificationsAsRead(@Req() req: any) {
    const userId = req.user?.user_id;
    return this.usersService.markAllNotificationsAsRead(userId);
  }

  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id: string) {
    return { success: true };
  }

  @Get('admins-with-qr')
  async getAdminsWithQr() {
    return { success: true, data: await this.usersService.getAdminsWithQr() };
  }

  // Admin profile details
  @Get(':id/admin-profile')
  async getAdminProfile(@Param('id') id: string) {
    return this.usersService.getAdminProfile(+id);
  }

  // Upload Admin QR code image
  @Post(':id/admin-qr')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdminQr(@Param('id') id: string, @UploadedFile() file: any) {
    const userId = parseInt(id);
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }

    const ext = path.extname(file.originalname) || '.png';
    const filename = `adminQR_${userId}${ext}`;

    const publicUrl = await this.supabaseService.uploadFile('admin_qr', filename, file.buffer, file.mimetype);

    return this.usersService.updateAdminQr(userId, publicUrl);
  }
}
