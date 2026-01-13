"use strict";
import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("technique", "status", {
    type: DataTypes.STRING,
    defaultValue: "active",
    allowNull: false,
  });
  await queryInterface.addColumn("technique", "icon", {
    type: DataTypes.STRING,
    defaultValue: "😌",
    allowNull: false,
  });

  await queryInterface.addColumn("technique", "color", {
    type: DataTypes.STRING,
    defaultValue: "red",
    allowNull: false,
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("technique", "status");
  await queryInterface.removeColumn("technique", "icon");
  await queryInterface.removeColumn("technique", "color");
};
