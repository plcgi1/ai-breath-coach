import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class PaymentGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // TODO проверяем оплату
    console.info("PaymentGuard.user", user);
    return true;
  }
}
