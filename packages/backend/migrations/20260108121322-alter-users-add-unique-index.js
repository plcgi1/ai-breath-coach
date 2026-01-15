"use strict";
import { Sequelize, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.addIndex("users", ["externalId"], {
    indicesType: "UNIQUE",
    type: "UNIQUE",
    name: "users_externalId_unique",
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("users", "users_externalId_unique");
};
