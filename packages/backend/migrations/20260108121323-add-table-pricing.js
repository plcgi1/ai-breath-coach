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
    price: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
