import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { PricingService } from "./pricing.service";

@ApiTags("Pricing")
@Controller("pricing")
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
  ) {}

  @ApiOperation({ summary: "Список цен" })
  @ApiBearerAuth()
  @UseGuards(TelegramAuthGuard)
  @Get("list")
  async getList() {
    const result = await this.pricingService.getList({});
    return result;
  }
}
