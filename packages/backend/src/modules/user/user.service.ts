import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Technique } from "../../database/models/technique.model";
import { EUserStatus, User } from "../../database/models/user.model";
import { Transaction } from "sequelize";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  getWhere(userId: string) {
    const where: any = { userId };

    return where;
  }

  getInclude() {
    return [
      {
        model: Technique,
        attributes: ["id", "name", "description", "slug"],
      },
    ];
  }

  getNextStatus(user: User): EUserStatus {
    if (user.status === EUserStatus.buyerStart) {
        return EUserStatus.buyer
    }
    if (user.status === EUserStatus.premiumStart) {
        return EUserStatus.premium
    }
    return user.status
  }

  async getUser(
    userId: string,
    transaction?: Transaction
  ): Promise<User> {
    const where = this.getWhere(userId);
    const include = this.getInclude();

    const data = await this.userModel.findOne({
      where,
      include,
      transaction
    });
    return data;
  }

  async updateStatus(status: EUserStatus, userId: string, transaction?: Transaction) {
    await this.userModel.update(
        { status },
        { where: { id: userId }, transaction }
    )
  }
}
