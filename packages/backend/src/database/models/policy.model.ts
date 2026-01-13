import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "policy", timestamps: true, updatedAt: false })
export class Policy extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  dailyLimit: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  canUseAI: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  canUseCustomTechniques: number;
}
