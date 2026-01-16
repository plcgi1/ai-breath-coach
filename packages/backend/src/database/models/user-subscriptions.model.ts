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
import { Technique } from "./technique.model";

export enum EOrderType {
  single = "single",
  premium = "premium",
}

export enum EOrderStatus {
  pending = "pending",
  paid = "paid",
  cancelled = "cancelled",
}

@Table({ tableName: "user_subscription", timestamps: true })
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

  @BelongsTo(() => Pricing)
  price: Pricing;

  @ForeignKey(() => Technique)
  @Column({ type: DataType.UUID, allowNull: true })
  techId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  orderType: EOrderType;

  @Column({ type: DataType.STRING })
  orderUrl: string;

  @Column({ type: DataType.DATE, allowNull: false })
  startedAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  expiredAt: Date;

  @Column({ type: DataType.DATE })
  paidAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: EOrderStatus.pending,
  })
  status: EOrderStatus;
}
