import { Test, TestingModule } from "@nestjs/testing";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { ConfigService } from "@nestjs/config";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import axios from "axios";
import { EOrderType } from "../../database/models/user-subscriptions.model";
import { BreathingService } from "../breathing/breathing.service";
import { BadRequestException } from "@nestjs/common";
import { WebhookDto } from "./dto/webhook.dto";

jest.mock("axios"); // Это магическая строчка, которая делает все методы axios пустышками
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("PaymentController", () => {
  let controller: PaymentController;
  let paymentService: PaymentService;
  let breathingService: BreathingService;

  // Мок для PaymentService
  const mockPaymentService = {
    createInvoiceLink: jest.fn(),
    handleSuccessfulPayment: jest.fn(),
  };

  // Мок для ConfigService
  const mockConfigService = {
    get: jest.fn().mockReturnValue("fake_bot_token"),
  };
  const mockBreathingService = {
    getTechniqueById: jest.fn(),
  };

  // Мок для Guard (чтобы не срабатывала реальная проверка Telegram)
  const mockGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        { provide: BreathingService, useValue: mockBreathingService },
      ],
    })
      .overrideGuard(TelegramAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    breathingService = module.get<BreathingService>(BreathingService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createInvoice", () => {
    it("should throw BadRequest if single order has no techId", async () => {
      const dto: CreateInvoiceDto = { order: EOrderType.single };
      const req = { user: { dbId: "user-1" } };

      await expect(controller.createInvoice(dto, "user-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should create invoice link for a valid single order", async () => {
      const dto: CreateInvoiceDto = {
        order: EOrderType.single,
        techId: "tech-123",
      };
      const req = { user: { dbId: "user-1" } };
      const expectedResponse = { invoiceLink: "http://t.me/invoice" };

      mockBreathingService.getTechniqueById.mockResolvedValue({
        id: "tech-123",
      });
      mockPaymentService.createInvoiceLink.mockResolvedValue(expectedResponse);

      const result = await controller.createInvoice(dto, "user-1");

      expect(breathingService.getTechniqueById).toHaveBeenCalledWith(
        "tech-123",
      );
      expect(paymentService.createInvoiceLink).toHaveBeenCalledWith(
        dto,
        "user-1",
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should create invoice link for AI unlimited order without techId", async () => {
      const dto: CreateInvoiceDto = { order: EOrderType.premium }; // Предположим, такой тип в ENUM
      const req = { user: { dbId: "user-1" } };
      const expectedResponse = { invoiceLink: "http://t.me/invoice_ai" };

      mockPaymentService.createInvoiceLink.mockResolvedValue(expectedResponse);

      const result = await controller.createInvoice(dto, "user-1");
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("webhook", () => {
    it("should handle pre_checkout_query and return ok", async () => {
      const update: WebhookDto = {
        update_id: 123456789,
        message: {
          message_id: 1,
          from: { id: 111111 },
          chat: { id: 222222, type: "private" },
          date: 1620000000,
        },
      };
      mockedAxios.post.mockResolvedValue({ data: { ok: true } });
      // Здесь мы не можем легко проверить axios внутри контроллера без доп. моков,
      // но проверяем, что метод возвращает { ok: true }
      const result = await controller.webhook(update, "user-1");
      expect(result).toEqual({ ok: true });
    });

    it("should call handleSuccessfulPayment when successful_payment is present", async () => {
      const payload = { userId: "user-1", pricingId: "price-1" };
      const update: WebhookDto = {
        update_id: 123456789,
        message: {
          message_id: 1,
          from: { id: 111111 },
          chat: { id: 222222, type: "private" },
          date: 1620000000,
          successful_payment: {
            invoice_payload: JSON.stringify(payload),
            currency: "USD",
            total_amount: 1000,
            telegram_payment_charge_id: "charge-123",
            provider_payment_charge_id: "provider-123",
          },
        },
      };
      mockedAxios.post.mockResolvedValue({ data: { ok: true } });
      await controller.webhook(update, "user-1");

      // Проверка: вызвана ли логика сохранения платежа в БД
      expect(paymentService.webhookHandler).toHaveBeenCalledWith(payload);
    });
  });
});
