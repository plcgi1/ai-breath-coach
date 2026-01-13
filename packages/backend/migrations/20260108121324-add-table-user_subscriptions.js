"use strict";
import { Sequelize, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable(
    "user_subscriptions",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      priceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "pricing",
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      comment: "Хранение отношений пользователя и тарифа",
    },
  );
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("user_subscriptions");
};
