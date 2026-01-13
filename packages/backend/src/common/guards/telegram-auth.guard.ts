import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { CDefaultUser } from "../default";
import { TGUser } from "../types/telegram-user";
import { User } from "../../database/models/user.model";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  private async lazyReg(inputUser: TGUser) {
    console.info("inputUser", inputUser);
    const [user] = await this.userModel.upsert(
      {
        externalId: inputUser.id.toString(),
        sourceId: "tg",
        username: inputUser.username,
        firstName: inputUser.first_name,
        lastName: inputUser.last_name,
        languageCode: inputUser.language_code,
        lastLoginAt: new Date(), // Обновляем дату каждого входа
      },
      {
        returning: true, // Чтобы метод вернул созданный/обновленный объект
      },
    );
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.configService.get("app");
    const request = context.switchToHttp().getRequest();

    if (config.authGuard.skip) {
      request.user = CDefaultUser;

      return true;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Authorization header not found");
    }

    // Ожидаем формат: "twa <initData>"
    const [type, data] = authHeader.split(" ");
    if (type !== "twa" || !data) {
      throw new UnauthorizedException("Invalid authorization type");
    }

    if (!this.validate(data)) {
      throw new UnauthorizedException("Invalid Telegram init data");
    }

    // Парсим данные юзера и прокидываем в request
    const urlParams = new URLSearchParams(data);
    const user = JSON.parse(urlParams.get("user"));
    const serverUser = await this.lazyReg(user);

    request.user = {
      ...user,
      serverId: serverUser.id,
    };

    return true;
  }

  private validate(initData: string): boolean {
    const botToken = this.configService.get<string>("TELEGRAM_BOT_TOKEN");

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    const authDate = urlParams.get("auth_date");

    if (!hash || !authDate) return false;

    const authTimestamp = parseInt(authDate, 10);
    const now = Math.floor(Date.now() / 1000); // Текущее время в секундах
    const MAX_AGE = 86400; // 24 часа в секундах
    if (now - authTimestamp > MAX_AGE) {
      // Данные устарели (более 24 часов)
      return false;
    }

    urlParams.delete("hash");
    // Сортируем параметры по алфавиту
    const dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join("\n");

    // 1. Создаем секретный ключ на основе токена бота
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // 2. Вычисляем контрольный хеш
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return hmac === hash;
  }
}
