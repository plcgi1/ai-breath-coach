import {
  Column,
  DataType,
  Model,
  Table,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import { Statistics } from "./statistics.model";

@Table({ tableName: "technique", timestamps: true })
export class Technique extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string;

  @Column({ type: DataType.TEXT })
  name: string;

  @Column({ type: DataType.TEXT })
  description: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  symptoms: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  tags: string[];

  @Column({ type: DataType.JSONB })
  // TODO конкретизировать
  settings: Record<string, any>;

  @Column({ type: DataType.STRING, allowNull: false })
  color: string;

  @Column({ type: DataType.STRING, allowNull: false })
  icon: string;

  @Column({ type: DataType.STRING, allowNull: false })
  sortBy: string;

  @HasMany(() => Statistics)
  stats: Statistics[];
}
