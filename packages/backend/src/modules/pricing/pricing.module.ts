import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { PricingService } from "./pricing.service";
import { Pricing } from "src/database/models/pricing.model";

@Module({
  imports: [SequelizeModule.forFeature([Pricing]), DatabaseModule],

  providers: [PricingService],
})
export class PricingModule {}
