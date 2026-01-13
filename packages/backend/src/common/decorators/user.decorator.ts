import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TGUser } from "../types/telegram-user";
import { CDefaultUser } from "../default";

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): Partial<TGUser> | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user || CDefaultUser;

    return data ? user?.[data] : user;
  },
);
