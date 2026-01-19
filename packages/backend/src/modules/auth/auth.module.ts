// src/modules/auth/auth.module.ts
import { Module, Global } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../../database/models/user.model";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { TelegramWebhookGuard } from "../../common/guards/telegram-webhook.guard";

@Global() // Делаем модуль глобальным, чтобы не импортировать его везде вручную
@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [TelegramAuthGuard, TelegramWebhookGuard],
  exports: [SequelizeModule, TelegramAuthGuard],
})
export class AuthModule {}