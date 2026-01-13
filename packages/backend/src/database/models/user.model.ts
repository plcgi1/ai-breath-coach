import { Column, DataType, Model, Table, HasMany } from "sequelize-typescript";
import { Statistics } from "./statistics.model";

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

  @HasMany(() => Statistics)
  stats: Statistics[];
}
