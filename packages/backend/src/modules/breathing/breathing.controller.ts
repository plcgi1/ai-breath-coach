import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { TelegramAuthGuard } from "../../common/guards/telegram-auth.guard";
import { AnalyzeDto } from "./dto/analyze.dto";
import { BreathingService } from "./breathing.service";
import { GetUser } from "../../common/decorators/user.decorator";
import { PaymentGuard } from "../../common/guards/payment.guard";
import { Technique } from "src/database/models/technique.model";

@Controller("breathing")
export class BreathingController {
  constructor(private readonly breathingService: BreathingService) {}

  @UseGuards(TelegramAuthGuard, PaymentGuard)
  @Get("techniques")
  async getTechniques(@GetUser("id") userId: string): Promise<Technique[]> {
    const techniques = await this.breathingService.getList(userId);
    return techniques;
  }

  @UseGuards(TelegramAuthGuard, PaymentGuard)
  @Get("ready/:slug")
  async getReadyTechnique(@Param("slug") slug: string, @Req() req: any) {
    const technique = await this.breathingService.getTechniqueBySlug(
      slug,
      req.user?.id,
    );
    return { technique, description: technique.description || null };
  }

  @UseGuards(TelegramAuthGuard, PaymentGuard)
  @Post("ai")
  async getAi(@Body() body: AnalyzeDto, @GetUser("id") userId: string) {
    return this.breathingService.getTechniqueByModel(body.request, userId);
  }

  @UseGuards(TelegramAuthGuard)
  @Get("prices")
  async getList(@GetUser("id") userId: string) {
    const techniques = await this.breathingService.getList(userId, true);
    const prices = this.breathingService.getCalculatedPrices(techniques);
    return prices;
  }
}
