import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user.model";
import { Pricing } from "./pricing.model";

@Table({ tableName: "user_subscriptions", timestamps: true, updatedAt: false })
export class UserSubscriptions extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ForeignKey(() => Pricing)
  @Column({ type: DataType.UUID, allowNull: false })
  priceId: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Pricing)
  price: Pricing;
}
