import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
// Импорт бизнес-модулей
import { BreathingModule } from "./modules/breathing/breathing.module";
import { StatisticsModule } from "./modules/statistic/statistics.module";
import { appConfig } from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { PaymentModule } from "./modules/payments/payment.module";
import { UserModule } from "./modules/user/user.module";
import { CronModule } from "./modules/cron/cron.module";
import { BotModule } from "./modules/bot/bot.module";

const globalConfig = appConfig();

@Module({
  imports: [
    // 1. Конфигурация (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [appConfig],
    }),

    LoggerModule.forRoot({
      pinoHttp: globalConfig.logging,
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), "dist", "public", "main"),
        serveRoot: "/",
        exclude: ["/api/*path"],
      },
      {
        rootPath: join(process.cwd(), "dist", "public", "stat"),
        serveRoot: "/stat", // Второе приложение по пути /stats
      },
    ),
    BotModule,
    CronModule,
    DatabaseModule,

    BreathingModule,
    StatisticsModule,
    PaymentModule,
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
