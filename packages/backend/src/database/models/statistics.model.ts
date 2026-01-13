import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user.model";
import { Technique } from "./technique.model";

@Table({ tableName: "statistics", timestamps: true, updatedAt: false })
export class Statistics extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ForeignKey(() => Technique)
  @Column({ type: DataType.UUID, allowNull: false })
  techId: string;

  @Column({ type: DataType.JSONB })
  metadata: any; // Для хранения оценки (score) или контекста сессии

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Technique)
  technique: Technique;
}
