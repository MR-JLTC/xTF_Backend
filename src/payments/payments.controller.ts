import { Controller, Get, Patch, Param, Body, UseGuards, Post, UploadedFile, UseInterceptors, Request, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePaymentDisputeDto } from './payment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Tutor requests payment for a completed/overdue session
  @Post('request')
  async requestPayment(@Body() body: { bookingId: number; tutorId: number; amount: number; subject?: string }) {
    return this.paymentsService.requestPayment(body.bookingId, body.tutorId, body.amount, body.subject);
  }
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('payouts')
  findAllPayouts() {
    return this.paymentsService.findAllPayouts();
  }

  @Patch(':id/dispute')
  updateDispute(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDisputeDto,
  ) {
    return this.paymentsService.updateDispute(+id, dto);
  }

  @Post('submit-proof')
  @UseInterceptors(FileInterceptor('file'))
  async submitProof(
    @Body() body: { bookingId: string; adminId: string; amount: string },
    @UploadedFile() file: any
  ) {
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `paymentProof_${Date.now()}${ext}`;

    const publicUrl = await this.supabaseService.uploadFile('payment_proofs', filename, file.buffer, file.mimetype);

    const fileForService = {
      ...file,
      filename: filename,
      destination: 'payment_proofs',
      path: publicUrl,
    };

    return this.paymentsService.submitProof(+body.bookingId, +body.adminId, Number(body.amount), fileForService);
  }

  @Patch(':id/verify')
  @UseInterceptors(FileInterceptor('adminProof'))
  async verifyPayment(
    @Param('id') id: string, 
    @Body() body: { status: 'confirmed' | 'rejected'; rejection_reason?: string },
    @UploadedFile() adminProof?: any
  ) {
    try {
      let fileForService = adminProof;
      if (adminProof && adminProof.buffer) {
        const ext = path.extname(adminProof.originalname) || '.jpg';
        const filename = `adminPaymentProof_${Date.now()}${ext}`;
        console.log(`PaymentsController.verifyPayment: Uploading adminProof to Supabase as ${filename}`);

        await this.supabaseService.uploadFile('payment_proofs', filename, adminProof.buffer, adminProof.mimetype);

        fileForService = {
          ...adminProof,
          filename: filename,
          destination: 'payment_proofs',
        };
      } else {
        console.log('PaymentsController.verifyPayment: No adminProof file received in request');
      }
      if (body.status === 'rejected' && body.rejection_reason) {
        console.log(`PaymentsController.verifyPayment: Rejection reason: ${body.rejection_reason}`);
      }
      const res = await this.paymentsService.verifyPayment(+id, body.status, fileForService, body.rejection_reason);
      console.log(`PaymentsController.verifyPayment: Service result:`, res);
      return res;
    } catch (err) {
      console.error('PaymentsController.verifyPayment: Error while verifying payment:', err);
      throw err;
    }
  }

  @Patch(':id/confirm')
  async confirmByTutor(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const userId = req.user?.user_id;
    return this.paymentsService.confirmByTutor(+id, userId);
  }

  @Get('waiting-for-payment')
  async getCompletedBookingsWaitingForPayment() {
    return this.paymentsService.getCompletedBookingsWaitingForPayment();
  }

  @Post('process-admin-payment/:bookingId')
  @UseInterceptors(FileInterceptor('receipt'))
  async processAdminPayment(
    @Param('bookingId') bookingId: string,
    @UploadedFile() receipt?: any
  ) {
    if (!receipt) {
      throw new BadRequestException('Payment receipt is required');
    }

    const ext = path.extname(receipt.originalname) || '.jpg';
    const filename = `adminPaymentReceipt_${Date.now()}${ext}`;

    await this.supabaseService.uploadFile('payment_proofs', filename, receipt.buffer, receipt.mimetype);

    const fileForService = {
      ...receipt,
      filename: filename,
      destination: 'payment_proofs',
    };

    return this.paymentsService.processAdminPayment(+bookingId, fileForService);
  }
}
