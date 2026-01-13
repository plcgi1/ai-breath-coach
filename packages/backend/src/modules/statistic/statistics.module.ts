import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Statistics } from "../../database/models/statistics.model";
import { User } from "../../database/models/user.model";

@Module({
  imports: [
    // Регистрируем схему в Mongoose, чтобы сервис мог работать с коллекцией
    SequelizeModule.forFeature([Statistics, User]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  // Экспортируем сервис, если захотим использовать его в других модулях (например, Breathing)
  exports: [StatisticsService],
})
export class StatisticsModule {}
