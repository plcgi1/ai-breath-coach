import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction } from "sequelize";
import { Pricing } from "../../database/models/pricing.model";
import { EOrderType } from "../../database/models/user-subscriptions.model";

export const CPriceMapper = {
  [EOrderType.single]: "11111111-1111-1111-1111-111111111111",
  [EOrderType.premium]: "22222222-2222-2222-2222-222222222222",
};

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing)
    private pricingModel: typeof Pricing,
  ) {}

  async getList({
    transaction,
    id,
    priceType,
  }: {
    priceType?: EOrderType;
    transaction?: Transaction;
    id?: string;
  }): Promise<Pricing[]> {
    const where = id ? { id } : {};
    if (priceType) {
      where.id = CPriceMapper[priceType];
    }
    return await this.pricingModel.findAll({ transaction, where });
  }
}
