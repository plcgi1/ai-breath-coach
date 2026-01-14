import { NestFactory } from "@nestjs/core";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { AppConfig } from "./config/interfaces/config.interface";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>("app");

  const port = appConfig.port;

  app.setGlobalPrefix("api");

  // Настройка для Telegram Web App
  app.enableCors({
    origin: "*", // TODO В идеале ограничить доменом сайта-визитки
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders:
      "Content-Type, Accept, Authorization, X-User-Id, referer, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, user-agent",
  });
  // app.enableCors({
  //   origin: 'https://ваш-фронтенд-на-vercel-или-render.com',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Помогает автоматически определять типы по метаданным TS
      },
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.log("Validation Errors:", JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  await app.listen(port);

  logger.log(
    { ip: appConfig.ip, port: appConfig.port, version: appConfig.version },
    `Server running on ${appConfig.ip}:${appConfig.port}/api`,
  );
}
bootstrap();
