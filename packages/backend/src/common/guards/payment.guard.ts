import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { EUserStatus } from "src/database/models/user.model";

@Injectable()
export class PaymentGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if(user.status !== EUserStatus.premium) {
      return false
    }
    
    return true;
  }
}
