// src/payment/payment.module.ts
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { Pricing } from "../../database/models/pricing.model";
import { UserSubscriptions } from "../../database/models/user-subscriptions.model";
import { User } from "../../database/models/user.model";
import { BreathingModule } from "../breathing/breathing.module";
import { BreathingService } from "../breathing/breathing.service";
import { StatisticsService } from "../statistic/statistics.service";
import { Technique } from "../../database/models/technique.model";
import { Statistics } from "../../database/models/statistics.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Pricing,
      UserSubscriptions,
      User,
      Technique,
      Statistics,
    ]),
    BreathingModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, BreathingService, StatisticsService],
})
export class PaymentModule {}
