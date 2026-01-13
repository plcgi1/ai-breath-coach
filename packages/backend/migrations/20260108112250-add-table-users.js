import { Sequelize, DataTypes } from "sequelize";

/**
 * Миграция для создания таблицы Users
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
  );
  await queryInterface.createTable("users", {
    id: {
      type: DataTypes.UUID,
      // defaultValue: DataTypes.UUIDV4,
      defaultValue: Sequelize.literal("uuid_generate_v4()"),
      primaryKey: true,
      allowNull: false,
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
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
  await queryInterface.addIndex("users", ["externalId"]);
};

/**
 * Откат миграции
 */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("users");
};
