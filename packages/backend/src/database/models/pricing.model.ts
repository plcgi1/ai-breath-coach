import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Policy } from "./policy.model";

@Table({ tableName: "pricing", timestamps: true, updatedAt: false })
export class Pricing extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Policy)
  @Column({ type: DataType.UUID, allowNull: false })
  policyId: string;

  @BelongsTo(() => Policy)
  policy: Policy;

  @Column({ type: DataType.DECIMAL(10, 9), allowNull: false })
  price: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  period: number;

  @Column({ type: DataType.STRING, allowNull: false })
  currency: string;
}
