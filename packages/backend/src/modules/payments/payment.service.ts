// src/payment/payment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pricing } from '../../database/models/pricing.model';
import { Policy } from '../../database/models/policy.model';
import { UserPricing } from '../../database/models/user-pricing.model';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly botApiUrl: string;

  constructor(
    @InjectModel(Pricing) private pricingModel: typeof Pricing,
    @InjectModel(UserPricing) private userPricingModel: typeof UserPricing,
    private configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.botApiUrl = `https://api.telegram.org/bot${token}`;
  }

  async createInvoiceLink(pricingId: string, userId: string) {
    const pricing = await this.pricingModel.findByPk(pricingId, { include: [Policy] });
    if (!pricing) throw new NotFoundException('Pricing plan not found');

    const payload = JSON.stringify({ userId, pricingId });

    try {
      const response = await axios.post(`${this.botApiUrl}/createInvoiceLink`, {
        title: pricing.name,
        description: `Activation of ${pricing.name} plan`,
        payload: payload,
        currency: pricing.currency,
        prices: [{ label: pricing.name, amount: Math.round(Number(pricing.price)) }],
      });

      return { invoiceLink: response.data.result };
    } catch (e) {
      throw new BadRequestException('Telegram API Error: Failed to create invoice link');
    }
  }

  async handleSuccessfulPayment(payload: { userId: string; pricingId: string }) {
    return await this.userPricingModel.create({
      userId: payload.userId,
      priceId: payload.pricingId,
    });
  }
}