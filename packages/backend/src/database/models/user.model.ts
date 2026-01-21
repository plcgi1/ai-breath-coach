import { Column, DataType, Model, Table, HasMany } from "sequelize-typescript";
import { Statistics } from "./statistics.model";

export enum EUserStatus {
  free = 'free',
  buyerStart = 'buyer:start',
  premiumStart = 'premium:start',
  buyer = 'buyer',
  premium = 'premium'
}

@Table({ tableName: "users", timestamps: true })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  externalId: string; // ID из Telegram или VK

  @Column({ type: DataType.STRING, allowNull: false })
  sourceId: string; // vk или tg

  @Column({ type: DataType.STRING })
  username: string;

  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  firstName: string;

  @Column({ type: DataType.STRING })
  lastName: string;

  @Column({ type: DataType.STRING, defaultValue: EUserStatus.free })
  status: EUserStatus;

  @HasMany(() => Statistics)
  stats: Statistics[];
}
