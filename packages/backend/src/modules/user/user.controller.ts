import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { GetUser } from "../../common/decorators/user.decorator";
import { TGUser } from "../../common/types/telegram-user";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "../../database/models/user.model";

@ApiTags("user")
@Controller("user")
export class UserController {
  @ApiOperation({ summary: "Получение данных о текущем пользователе" })
  @ApiResponse({ status: 200, description: "" })
  @UseGuards(TelegramAuthGuard)
  @Get("me")
  async getUser(
    @GetUser() user: User,
  ) {
    return {
        id: user.id,
        status: user.status
    };
  }
}
