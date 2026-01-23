import { Module } from "@nestjs/common";
import { BreathingController } from "./breathing.controller";
import { BreathingService } from "./breathing.service";
import { AiModule } from "../ai/ai.module";
import { DatabaseModule } from "../../database/database.module";
import { Technique } from "../../database/models/technique.model";
import { SequelizeModule } from "@nestjs/sequelize";
import { Pricing } from "../../database/models/pricing.model";
import { User } from "../../database/models/user.model";
import { UserSubscriptions } from "../../database/models/user-subscriptions.model";

@Module({
  imports: [
    SequelizeModule.forFeature([Technique, Pricing, User, UserSubscriptions]),
    DatabaseModule,
    AiModule,
  ],

  controllers: [BreathingController],
  providers: [BreathingService],
  exports: [BreathingService]
})
export class BreathingModule {}
