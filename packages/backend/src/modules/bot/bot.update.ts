import { Update, Start, Help, Ctx } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/interfaces/config.interface';
import { i18n } from './bot.translations';

@Update()
export class BotUpdate implements OnModuleInit{
  constructor(private configService: ConfigService) {}
  
  private getLang(@Ctx() ctx: Context): string {
    const lang = ctx.from?.language_code === 'ru' ? 'ru' : 'en';
    return lang
  }
    // Этот метод сработает при запуске приложения
  async onModuleInit() {
    try {
      // Здесь мы говорим Telegram, какую кнопку показывать в меню бота
      // Обычно используется для всех пользователей
      // 'setChatMenuButton' позволяет задать кнопку для конкретного чата,
      // но для Mini App чаще используют глобальную настройку через BotFather 
      // или метод API ниже:
    } catch (e) {
      console.error('Ошибка настройки кнопки меню', e);
    }
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const config = this.configService.get<AppConfig>('app')
    const lang = this.getLang(ctx)
    const text = i18n['start.welcome'][lang]
    
    const webAppUrl = config.appURL; 

    // Принудительно устанавливаем кнопку меню для этого пользователя
    await ctx.setChatMenuButton({
      type: 'web_app',
      text: i18n['start.launchCoach'][lang],
      web_app: { url: webAppUrl }
    });

    await ctx.replyWithHTML(
      text,
      Markup.keyboard([
        Markup.button.webApp(i18n['start.launchCoach'][lang], webAppUrl)
      ]).resize()
    );    
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    const config = this.configService.get<AppConfig>('app')
    const lang = this.getLang(ctx)
    const text = i18n['help.howto'][lang](config.supportChannel[lang])
    await ctx.reply(text);
  }
}