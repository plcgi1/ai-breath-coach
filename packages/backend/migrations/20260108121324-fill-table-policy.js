"use strict";
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`
INSERT INTO "policy" (id, "dailyLimit", "canUseAI", "canUseCustomTechniques", "createdAt")
VALUES 
    ('11000000-0000-0000-0000-000000000001', 1, false, false, NOW()),
    ('11000000-0000-0000-0000-000000000100', 100, true, true, NOW())
      `);
};

export const down = async () => {
  // Нет отката для заполнения таблицы
};
