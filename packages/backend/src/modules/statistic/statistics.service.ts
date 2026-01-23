import { Injectable } from "@nestjs/common";
import { Statistics } from "../../database/models/statistics.model";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction, Op } from "sequelize";
import { GetStatisticsDto } from "./dto/get-statistics.dto";
import { Technique } from "../../database/models/technique.model";

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Statistics)
    private statModel: typeof Statistics,
  ) {}

  async logActivity(
    userId: string,
    techId: string,
    metadata: any,
    transaction?: Transaction,
  ) {
    return await this.statModel.create(
      { userId, techId, metadata },
      { transaction }, // Передаем транзакцию сюда
    );
  }

  getWhere(userId: string, filters?: GetStatisticsDto) {
    const where: any = { userId };

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt[Op.gte] = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        where.createdAt[Op.lte] = new Date(filters.toDate);
        where.createdAt[Op.lte].setHours(23, 59, 59, 999);
      }
    }
    return where;
  }

  getInclude() {
    return [
      {
        model: Technique,
        attributes: ["id", "name", "description", "tags", 'icon', 'slug'],
      },
    ];
  }

  async getUserStats(
    userId: string,
    filters?: GetStatisticsDto,
  ): Promise<{ count: number; data: Statistics[] }> {
    const where = this.getWhere(userId, filters);
    const include = this.getInclude();

    const data = await this.statModel.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });
    const count = await this.statModel.count({
      where,
    });
    return {
      count,
      data,
    };
  }
}
