// src/payment/payment.module.ts
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { Pricing } from "../../database/models/pricing.model";
import { UserSubscriptions } from "../../database/models/user-subscriptions.model";
import { User } from "../../database/models/user.model";

@Module({
  imports: [SequelizeModule.forFeature([Pricing, UserSubscriptions, User])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
