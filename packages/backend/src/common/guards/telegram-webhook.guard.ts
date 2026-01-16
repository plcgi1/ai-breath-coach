import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TelegramWebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.configService.get("app");
    const request = context.switchToHttp().getRequest();

    const signature = request.headers["x-telegram-bot-api-secret-token"];

    if (!signature) {
      throw new UnauthorizedException(
        "TelegramWebhookGuard.Authorization header not found",
      );
    }
    if (signature !== config.authGuard.webhookSecret) {
      throw new UnauthorizedException(
        "TelegramWebhookGuard.Invalid webhook secret",
      );
    }

    return true;
  }
}
