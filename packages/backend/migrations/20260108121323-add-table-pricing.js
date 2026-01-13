"use strict";
import { Sequelize, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable("pricing", {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("uuid_generate_v4()"),
      primaryKey: true,
      allowNull: false,
    },
    policyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "policy",
        key: "id",
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 9),
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "day", // week month year lifetime
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "usd",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("pricing");
};
