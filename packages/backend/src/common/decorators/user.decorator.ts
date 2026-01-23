import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TGUser } from "../types/telegram-user";
import { User } from "../../database/models/user.model";

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): Partial<User> | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    // console.log("GetUser decorator accessed, user:", user);
    return data ? user?.[data] : user;
  },
);
