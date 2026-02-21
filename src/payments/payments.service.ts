import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeApi.keySecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Entero que contiene los decimales -> 20.00 USD
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },
      // Ítems de mi orden
      line_items: lineItems,
      // Definir la modalidad de pago
      mode: 'payment',
      // Definir el success y cancel url
      success_url: envs.paths.successUrl,
      cancel_url: envs.paths.cancelUrl,
    });

    return session;
  }

  webhookClient(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    const endpointSecret = envs.stripeApi.webhookSecret;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'] as string,
        sig as string,
        endpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${(error as Error).message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        console.log({ orderId: event.data.object.metadata.orderId });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ sig });
  }
}
