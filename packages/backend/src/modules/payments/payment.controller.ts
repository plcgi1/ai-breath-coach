// src/payment/payment.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
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
import { BreathingService } from "../breathing/breathing.service";
import { EOrderType } from "../../database/models/user-subscriptions.model";
import { ETechniqueType } from "src/database/models/technique.model";
import { GetUser } from "src/common/decorators/user.decorator";
import { WebhookDto } from "./dto/webhook.dto";
import { TelegramWebhookGuard } from "src/common/guards/telegram-webhook.guard";

@ApiTags("Payments")
@Controller("payments")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly breathingService: BreathingService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: "Создать ссылку на оплату через Telegram Stars" })
  @ApiBearerAuth()
  @UseGuards(TelegramAuthGuard)
  @Post("invoice")
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @GetUser("id") userId: string,
  ) {
    if (dto.order == EOrderType.single && !dto.techId) {
      throw new BadRequestException("techId is required for single order");
    }
    let technique;
    if (dto.order == EOrderType.single && dto.techId) {
      technique = await this.breathingService.getTechniqueById(dto.techId);
    }
    if (dto.order == EOrderType.single && !technique) {
      throw new BadRequestException("Technique not found");
    }
    if (technique && technique.type === ETechniqueType.free) {
      throw new BadRequestException("Technique is free");
    }
    const result = await this.paymentService.createInvoiceLink(dto, userId);
    return result;
  }

  /*
   * Telegram отправляет сюда все обновления включая платежи.
   * Настройка: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>/webhook/telegram&secret_token=<SECRET>
   * */
  @ApiOperation({ summary: "Webhook для Telegram (обработка платежей)" })
  @Post("webhook")
  @UseGuards(TelegramWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() update: WebhookDto, @GetUser("id") userId: string) {
    await this.paymentService.webhookHandler(update, userId);

    return { ok: true };
  }

  @ApiOperation({ summary: "Проверка статуса платежа" })
  @Get("check-order")
  @UseGuards(TelegramAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getWebhookOrder(@Query() query, @GetUser("id") userId: string) {
    const result = await this.paymentService.getWebhookOrder(
      query.orderId,
      userId,
    );
    return result;
  }
}
