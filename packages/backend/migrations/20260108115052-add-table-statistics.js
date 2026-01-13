"use strict";
import { Sequelize, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable("statistics", {
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
    techId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("statistics");
};
