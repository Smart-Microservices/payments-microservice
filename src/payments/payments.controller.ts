import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      success: 'success',
      message: 'payment success',
    };
  }

  @Get('cancelled')
  cancel() {
    return {
      cancel: 'success',
      message: 'payment cancel',
    };
  }

  @Post('webhook')
  webhookClient(@Req() req: Request, @Res() res: Response) {
    console.log('webhook called');
    return this.paymentsService.webhookClient(req, res);
  }
}
