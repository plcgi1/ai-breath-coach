import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { ConfigService } from '@nestjs/config';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios'); // Это магическая строчка, которая делает все методы axios пустышками
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

  // Мок для PaymentService
  const mockPaymentService = {
    createInvoiceLink: jest.fn(),
    handleSuccessfulPayment: jest.fn(),
  };

  // Мок для ConfigService
  const mockConfigService = {
    get: jest.fn().mockReturnValue('fake_bot_token'),
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
      ],
    })
      .overrideGuard(TelegramAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should call PaymentService.createInvoiceLink with correct parameters', async () => {
      const dto: CreateInvoiceDto = { pricingId: 'uuid-123' };
      const req = { user: { dbId: 'user-456' } };
      const expectedLink = { invoiceLink: 'https://t.me/invoice/link' };

      mockPaymentService.createInvoiceLink.mockResolvedValue(expectedLink);

      const result = await controller.createInvoice(dto, req);

      // Проверка: был ли вызван сервис с нужными ID
      expect(paymentService.createInvoiceLink).toHaveBeenCalledWith(
        dto.pricingId,
        req.user.dbId,
      );
      expect(result).toEqual(expectedLink);
    });
  });

  describe('webhook', () => {
    it('should handle pre_checkout_query and return ok', async () => {
      const update = {
        pre_checkout_query: { id: 'query_id_123' },
      };
      mockedAxios.post.mockResolvedValue({ data: { ok: true } });
      // Здесь мы не можем легко проверить axios внутри контроллера без доп. моков, 
      // но проверяем, что метод возвращает { ok: true }
      const result = await controller.webhook(update);
      expect(result).toEqual({ ok: true });
    });

    it('should call handleSuccessfulPayment when successful_payment is present', async () => {
      const payload = { userId: 'user-1', pricingId: 'price-1' };
      const update = {
        message: {
          successful_payment: {
            invoice_payload: JSON.stringify(payload),
          },
        },
      };
mockedAxios.post.mockResolvedValue({ data: { ok: true } });
      await controller.webhook(update);

      // Проверка: вызвана ли логика сохранения платежа в БД
      expect(paymentService.handleSuccessfulPayment).toHaveBeenCalledWith(payload);
    });
  });
});