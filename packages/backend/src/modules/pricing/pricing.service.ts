import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Pricing } from "src/database/models/pricing.model";

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing)
    private pricingModel: typeof Pricing,
    @InjectPinoLogger(PricingService.name)
    private readonly logger: PinoLogger,
  ) {}
}
