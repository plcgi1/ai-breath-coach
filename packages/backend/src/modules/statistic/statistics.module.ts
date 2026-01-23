import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Statistics } from "../../database/models/statistics.model";
import { User } from "../../database/models/user.model";
import { Technique } from "src/database/models/technique.model";
import { BreathingModule } from "../breathing/breathing.module";
import { BreathingService } from "../breathing/breathing.service";

@Module({
  imports: [
    SequelizeModule.forFeature([Statistics, User,Technique]),
    BreathingModule
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, BreathingService],
  // Экспортируем сервис, если захотим использовать его в других модулях (например, Breathing)
  exports: [StatisticsService],
})
export class StatisticsModule {}
