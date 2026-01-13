import { DataTypes, Sequelize } from "sequelize";

/**
 * Миграция для создания таблицы  Techniques
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable("technique", {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("uuid_generate_v4()"),
      primaryKey: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    symptoms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    audio: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    rounds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Добавляем индекс для ускорения поиска по externalId
  await queryInterface.addIndex("technique", ["slug"]);
};

/**
 * Откат миграции
 */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("technique");
};
