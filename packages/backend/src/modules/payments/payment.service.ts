// src/payment/payment.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import {
  EOrderStatus,
  EOrderType,
  UserSubscriptions,
} from "../../database/models/user-subscriptions.model";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { Sequelize } from "sequelize-typescript";
import { PricingService } from "../pricing/pricing.service";
import { addDays } from "../../utils/date";
import { AppConfig } from "../../config/interfaces/config.interface";
import { WebhookDto } from "./dto/webhook.dto";
import { Pricing } from "src/database/models/pricing.model";

// import { AppConfig } from "../config/interfaces/config.interface";
// const appConfig = configService.get<AppConfig>("app");

@Injectable()
export class PaymentService {
  private readonly botApiUrl: string;

  constructor(
    @InjectModel(UserSubscriptions)
    private userSubscriptionsModel: typeof UserSubscriptions,
    private readonly sequelize: Sequelize,
    private pricingService: PricingService,
    private configService: ConfigService,
  ) {
    const appConfig = configService.get<AppConfig>("app");
    const token = appConfig.authGuard.apiKey;
    this.botApiUrl = `https://api.telegram.org/bot${token}`;
  }

  async createInvoiceLink(dto: CreateInvoiceDto, userId: string) {
    return await this.sequelize.transaction(async (t) => {
      const prices = await this.pricingService.getList({
        transaction: t,
        priceType: dto.order,
      });
      if (!prices || prices.length === 0) {
        throw new NotFoundException("Pricing plan not found");
      }
      const price = prices[0];

      const userSubscription = await this.userSubscriptionsModel.create(
        {
          userId: userId,
          priceId: price.id,
          orderType: dto.order,
          techId: dto.techId || null,
          startedAt: new Date(),
          expiredAt: addDays(new Date(), 30),
          status: EOrderStatus.pending,
        },
        { transaction: t },
      );

      const payload = { oid: userSubscription.id };
      if (dto.order == EOrderType.single && dto.techId) {
        Object.assign(payload, { techId: dto.techId });
      }
      const payloadJson = JSON.stringify(payload);
      let response;
      try {
        response = await axios.post(`${this.botApiUrl}/createInvoiceLink`, {
          title: price.name,
          description: `Activation of ${price.name} plan`,
          payload: payloadJson,
          currency: price.currency,
          prices: [
            { label: price.name, amount: Math.round(Number(price.price)) },
          ],
        });

        userSubscription.orderUrl = response.data.result;
        await userSubscription.save({ transaction: t });

        return {
          invoiceUrl: response.data.result,
          orderId: userSubscription.id,
        };
      } catch (e) {
        console.info("Telegram API Error:", e.response?.data || e.message);
        // throw new BadRequestException(
        //   "Telegram API Error: Failed to create invoice link",
        // );
        throw e;
      }
    });
  }

  async webhookHandler(update: WebhookDto, userId: string) {
    // // 1. Подтверждение готовности к платежу
    if (update.pre_checkout_query) {
      await axios.post(`${this.botApiUrl}/answerPreCheckoutQuery`, {
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: true,
      });
      return { ok: true };
    }

    // // 2. Обработка успешного платежа
    const success = update.message?.successful_payment;
    if (!success) {
      return { ok: true };
    }
    const payload = JSON.parse(success.invoice_payload);
    const invoice = await this.getWebhookOrder(payload.oid, userId);
    if (success.total_amount !== invoice.price.price) {
      throw new NotFoundException("Incorrect payment amount");
    }
    invoice.expiredAt = addDays(new Date(), 30);
    invoice.status = EOrderStatus.paid;
    invoice.paidAt = new Date();

    await invoice.save();

    return { ok: true };
  }

  async getWebhookOrder(orderId: string, userId: string) {
    console.log("getWebhookOrder called with orderId:", orderId, userId);
    const invoice = await this.userSubscriptionsModel.findOne({
      where: { id: orderId, userId },
      include: [{ model: Pricing }],
    });
    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }
    return invoice;
  }
}
