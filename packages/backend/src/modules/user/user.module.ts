import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../../database/models/user.model";
import { Technique } from "src/database/models/technique.model";
import { UserService } from "./user.service";

@Module({
  imports: [
    SequelizeModule.forFeature([User, Technique]),
  ],
  providers: [UserService],
  // Экспортируем сервис, если захотим использовать его в других модулях (например, Breathing)
  exports: [UserService],
})
export class UserModule {}
