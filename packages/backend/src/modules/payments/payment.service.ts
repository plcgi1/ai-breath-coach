import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import {
  EOrderStatus,
  EOrderType,
  UserSubscriptions,
} from "../../database/models/user-subscriptions.model";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { Sequelize } from "sequelize-typescript";
import { addDays } from "../../utils/date";
import { AppConfig } from "../../config/interfaces/config.interface";
import { WebhookDto } from "./dto/webhook.dto";
import { Pricing } from "src/database/models/pricing.model";
import {
  BreathingService,
  ETechniqueStatus,
  ITechniqueListResponse,
} from "../breathing/breathing.service";
import { Transaction } from "sequelize";
import { ETechniqueType, Technique } from "src/database/models/technique.model";
import { randomUUID } from "node:crypto";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Injectable()
export class PaymentService {
  private readonly botApiUrl: string;

  constructor(
    @InjectModel(UserSubscriptions)
    private userSubscriptionsModel: typeof UserSubscriptions,
    private readonly sequelize: Sequelize,
    private breathingService: BreathingService,
    private configService: ConfigService,
    @InjectPinoLogger(PaymentService.name)
    private readonly logger: PinoLogger,
  ) {
    const appConfig = configService.get<AppConfig>("app");
    const token = appConfig.authGuard.apiKey;
    this.botApiUrl = `https://api.telegram.org/bot${token}`;
  }

  async createInvoiceLink(dto: CreateInvoiceDto, userId: string) {
    const techniques = await this.breathingService.getList(userId, true);
    if (dto.order === EOrderType.single) {
      return this._createInvoiceLinkSingle(
        techniques,
        dto.order,
        dto.techId,
        userId,
      );
    }
    return this._createInvoiceLinkPremium(techniques, userId);
  }

  getCreatePaymentLinkPayload(orderId: string) {
    const payload = {
      oid: orderId,
    };
    const payloadJson = JSON.stringify(payload);
    return payloadJson;
  }

  async _createInvoiceLinkSingle(
    techniques: ITechniqueListResponse[],
    order: EOrderType,
    techId: string,
    userId: string,
  ) {
    const orderId = randomUUID();
    return await this.sequelize.transaction(async (t) => {
      // если какимто боком пришел запрос с купленной техникой
      const checkTech = techniques.find((t) => t.id === techId && t.purchase);
      if (checkTech) {
        return {
          invoiceUrl: checkTech.purchase.orderUrl,
          orderId: checkTech.purchase.orderId,
          status: checkTech.purchase.status,
        };
      }
      const tech = techniques.find((t) => t.id === techId);
      const userSubscription = await this.userSubscriptionsModel.create(
        {
          userId: userId,
          orderType: order,
          techId: techId || null,
          startedAt: new Date(),
          expiredAt: addDays(new Date(), 30),
          status: EOrderStatus.pending,
          amount: tech.price,
          orderId,
        },
        { transaction: t },
      );
      const payloadJson = this.getCreatePaymentLinkPayload(orderId);
      let response;
      try {
        response = await axios.post(`${this.botApiUrl}/createInvoiceLink`, {
          title: tech.name,
          description: `Activation of "${tech.name}"`,
          payload: payloadJson,
          currency: "XTR",
          prices: [
            { label: tech.name, amount: Math.round(Number(tech.price)) },
          ],
        });

        userSubscription.orderUrl = response.data.result;
        await userSubscription.save({ transaction: t });

        return {
          invoiceUrl: response.data.result,
          orderId,
        };
      } catch (e) {
        this.logger.error(
          { error: e },
          "_createInvoiceLinkSingle.Telegram API Error:",
        );
        throw e;
      }
    });
  }

  async _createInvoiceLinkPremium(
    techniques: ITechniqueListResponse[],
    userId: string,
  ) {
    const nonPurchasedTech = techniques.filter(
      (item) => item.status === ETechniqueStatus.locked,
    );
    const freeTech = techniques.filter(
      (item) => item.type === ETechniqueType.free,
    );
    const prices = this.breathingService.getCalculatedPrices(techniques);
    const oneUnitPrice = prices.premiumAmount / nonPurchasedTech.length;
    const orderId = randomUUID();
    const startedAt = new Date();
    const expiredAt = addDays(startedAt, 30);

    const purchasedTechs = techniques.filter((tech) => tech.purchase);
    if (purchasedTechs.length + freeTech.length === techniques.length) {
      return {
        status: EOrderStatus.pending,
      };
    }

    return await this.sequelize.transaction(async (t) => {
      const payloadJson = this.getCreatePaymentLinkPayload(orderId);
      let response;
      try {
        response = await axios.post(`${this.botApiUrl}/createInvoiceLink`, {
          title: "Premium",
          description: `Activation of "Premium"`,
          payload: payloadJson,
          currency: "XTR",
          prices: [{ label: "Premium", amount: prices.premiumAmount }],
        });
        const orderUrl = response.data.result;
        const bulkData = nonPurchasedTech.map((tech) => {
          return {
            userId: userId,
            orderType: EOrderType.premium,
            techId: tech.id,
            orderUrl,
            orderId,
            startedAt,
            expiredAt,
            status: EOrderStatus.pending,
            amount: oneUnitPrice,
          };
        });

        await this.userSubscriptionsModel.bulkCreate(bulkData, {
          transaction: t,
        });

        return {
          invoiceUrl: response.data.result,
          orderId,
        };
      } catch (e) {
        this.logger.error(
          { error: e },
          "_createInvoiceLinkPremium.Telegram API Error:",
        );
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
    const invoices = await this.getWebhookOrder(payload.oid, userId);
    const amount = invoices.reduce((sum: number, item: UserSubscriptions) => {
      return (sum = sum + item.amount);
    }, 0);

    if (success.total_amount !== amount) {
      throw new NotFoundException("Incorrect payment amount");
    }

    await this.userSubscriptionsModel.update(
      {
        expiredAt: addDays(new Date(), 30),
        status: EOrderStatus.paid,
        paidAt: new Date(),
      },
      { where: { orderId: payload.oid } },
    );

    return { ok: true };
  }

  async getWebhookOrder(
    orderId: string,
    userId: string,
  ): Promise<UserSubscriptions[]> {
    const invoices = await this.userSubscriptionsModel.findAll({
      where: { orderId, userId },
    });
    if (!invoices) {
      throw new NotFoundException("Invoice not found");
    }
    return invoices;
  }
}
