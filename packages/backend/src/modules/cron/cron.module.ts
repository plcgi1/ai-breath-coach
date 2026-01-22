import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { PaymentModule } from '../payments/payment.module'; // Путь к вашему модулю платежей
import { SequelizeModule } from '@nestjs/sequelize';
import {
  UserSubscriptions,
} from "../../database/models/user-subscriptions.model";

@Module({
  imports: [
    // Инициализация планировщика задач
    ScheduleModule.forRoot(),
    SequelizeModule.forFeature([UserSubscriptions]),
    // Импорт модуля, где находится PaymentService
    PaymentModule,
  ],
  providers: [CronService],
  exports: [],
})
export class CronModule {}