// src/payment/payment.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { PaymentService } from "./payment.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@ApiTags("Payments")
@Controller("payments")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: "Создать ссылку на оплату через Telegram Stars" })
  @ApiBearerAuth()
  @UseGuards(TelegramAuthGuard)
  @Post("invoice")
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    // В req.user должен быть id из БД после lazyReg в Guard
    return await this.paymentService.createInvoiceLink(
      dto.pricingId,
      req.user.dbId,
    );
  }

  @ApiOperation({ summary: "Webhook для Telegram (обработка платежей)" })
  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() update: any) {
    const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN");

    // 1. Подтверждение готовности к платежу
    if (update.pre_checkout_query) {
      await axios.post(
        `https://api.telegram.org/bot${token}/answerPreCheckoutQuery`,
        {
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true,
        },
      );
      return { ok: true };
    }

    // 2. Обработка успешного платежа
    const success = update.message?.successful_payment;
    if (success) {
      const payload = JSON.parse(success.invoice_payload);
      await this.paymentService.handleSuccessfulPayment(payload);
    }

    return { ok: true };
  }
}
