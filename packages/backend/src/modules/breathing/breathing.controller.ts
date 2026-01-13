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

@Controller("breathing")
export class BreathingController {
  constructor(private readonly breathingService: BreathingService) {}

  @UseGuards(TelegramAuthGuard, PaymentGuard)
  @Get("base-techniques")
  async getBaseTechniques() {
    const techniques = await this.breathingService.getBaseTechniques();
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
}
