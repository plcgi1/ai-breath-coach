import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
// import { McpModule } from '@rekog/mcp-nest';

// Импорт бизнес-модулей
// import { AuthModule } from "./modules/auth/auth.module";
import { BreathingModule } from "./modules/breathing/breathing.module";
import { StatisticsModule } from "./modules/statistic/statistics.module";
// import { BotModule } from './modules/bot/bot.module';
// import { PaymentsModule } from './modules/payments/payments.module';
// import { McpCoreModule } from './mcp/mcp.module';

import { appConfig } from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
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
    DatabaseModule,
    // 4. Бизнес-логика
    // AuthModule,
    // BotModule,
    BreathingModule,
    StatisticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
