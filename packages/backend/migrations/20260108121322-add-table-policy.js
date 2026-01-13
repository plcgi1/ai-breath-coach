"use strict";
import { Sequelize, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable("policy", {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("uuid_generate_v4()"),
      primaryKey: true,
      allowNull: false,
    },
    dailyLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    canUseAI: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canUseCustomTechniques: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("policy");
};
