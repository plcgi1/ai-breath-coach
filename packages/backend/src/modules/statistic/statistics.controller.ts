import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { GetUser } from "../../common/decorators/user.decorator";
import { TGUser } from "../../common/types/telegram-user";
import { GetStatisticsDto } from "./dto/get-statistics.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("statistics")
@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiOperation({ summary: "Получение истории сессий с фильтром по датам" })
  @ApiResponse({ status: 200, description: "Список сессий успешно получен" })
  @UseGuards(TelegramAuthGuard)
  @Get("list")
  async getUserStatistics(
    @GetUser() user: TGUser,
    @Query() query: GetStatisticsDto,
  ) {
    return await this.statisticsService.getUserStats(user.id, query);
  }
}
