import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('TELEGRAM_BOT_TOKEN'), // Токен из вашего .env
      }),
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}