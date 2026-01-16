import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "pricing", timestamps: true, updatedAt: false })
export class Pricing extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.DECIMAL(10, 9), allowNull: false })
  price: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  period: number;

  @Column({ type: DataType.STRING, allowNull: false })
  currency: string;
}
