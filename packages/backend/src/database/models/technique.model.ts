import {
  Column,
  DataType,
  Model,
  Table,
  HasMany,
  HasOne,
  BelongsTo,
} from "sequelize-typescript";
import { Statistics } from "./statistics.model";
import { UserSubscriptions } from "./user-subscriptions.model";

export enum ETechniqueType {
  free = "free",
  premium = "premium",
}

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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ETechniqueType.premium,
  })
  type: string;

  @HasMany(() => Statistics)
  stats: Statistics[];

  @HasOne(() => UserSubscriptions)
  purchase: UserSubscriptions;
}
