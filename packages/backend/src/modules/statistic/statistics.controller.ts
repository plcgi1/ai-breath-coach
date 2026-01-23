import { Body, Controller, Get, NotFoundException, Post, Query, UseGuards } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { GetUser } from "../../common/decorators/user.decorator";
import { TGUser } from "../../common/types/telegram-user";
import { GetStatisticsDto } from "./dto/get-statistics.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AddStatisticDto } from "./dto/add-statistic.dto";
import { BreathingService } from '../breathing/breathing.service'
@ApiTags("statistics")
@Controller("statistics")
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly brethingService: BreathingService

  ) {}

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

  @ApiOperation({ summary: "Логирование выполнения техники" })
  @ApiResponse({ status: 200, description: "Список сессий успешно получен" })
  @UseGuards(TelegramAuthGuard)
  @Post("")
  async logUserStatistics(
    @GetUser() user: TGUser,
    @Body() body: AddStatisticDto,
  ) {
     const tech = await this.brethingService.getTechniqueById(body.techId)
    if(!tech) {
      throw new NotFoundException('No such technique')
    }
    return await this.statisticsService.logActivity(
      user.id, 
      tech.id,
      { score: 1, description: tech.name }
    );
  }
}
