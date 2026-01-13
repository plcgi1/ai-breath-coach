"use strict";
import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("technique", "priceId", {
    type: DataTypes.UUID,
    references: {
        model: "pricing",
        key: "id",
      },
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("technique", "priceId");  
};
