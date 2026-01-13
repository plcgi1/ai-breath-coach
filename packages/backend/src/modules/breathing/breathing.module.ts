import { Module } from "@nestjs/common";
import { BreathingController } from "./breathing.controller";
import { BreathingService } from "./breathing.service";
import { AiModule } from "../ai/ai.module";
import { DatabaseModule } from "../../database/database.module";
import { Technique } from "../../database/models/technique.model";
import { SequelizeModule } from "@nestjs/sequelize";
import { StatisticsModule } from "../statistic/statistics.module";
import { Policy } from "src/database/models/policy.model";
import { Pricing } from "src/database/models/pricing.model";
import { User } from "src/database/models/user.model";

@Module({
  imports: [
    SequelizeModule.forFeature([Technique, Pricing, Policy, User]),
    DatabaseModule,
    AiModule,
    StatisticsModule,
  ],

  controllers: [BreathingController],
  providers: [BreathingService],
})
export class BreathingModule {}
