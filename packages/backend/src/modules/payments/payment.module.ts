// src/payment/payment.module.ts
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { Pricing } from "../../database/models/pricing.model";
import { UserSubscriptions } from "../../database/models/user-subscriptions.model";
import { User } from "../../database/models/user.model";
import { PricingModule } from "../pricing/pricing.module";
import { PricingService } from "../pricing/pricing.service";
import { BreathingModule } from "../breathing/breathing.module";
import { BreathingService } from "../breathing/breathing.service";
import { StatisticsService } from "../statistic/statistics.service";
import { Technique } from "src/database/models/technique.model";
import { Statistics } from "src/database/models/statistics.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Pricing,
      UserSubscriptions,
      User,
      Technique,
      Statistics,
    ]),
    PricingModule,
    BreathingModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PricingService,
    BreathingService,
    StatisticsService,
  ],
})
export class PaymentModule {}
