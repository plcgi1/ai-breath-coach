"use strict";
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`
INSERT INTO "pricing" ("id", "policyId", "period", "name", "price", "currency", "createdAt")
VALUES 
    -- Free (технически может существовать для описания условий)
    (
      '10000000-0000-0000-0000-000000000001', 
      '11000000-0000-0000-0000-000000000001', 
      365,
      'free', 
      0.000000000, 
      'XTR', 
      NOW()
    ),

    -- Zen Lite (Подписка на месяц, цена например 50 звезд)
    (
      '10000000-0000-0000-0000-000000000002', 
      '11000000-0000-0000-0000-000000000100', 
      30,
      'zen-lite', 
      50.000000000, 
      'XTR', 
      NOW()
    ),

    -- Inner Circle (Годовой, цена например 300 звезд)
    (
      '10000000-0000-0000-0000-000000000003', 
      '11000000-0000-0000-0000-000000000100', 
      365, 
      'inner-circle', 
      300.000000000, 
      'XTR', 
      NOW()
    ),

    -- Eternal Peace (Lifetime, цена например 1000 звезд)
    (
      '10000000-0000-0000-0000-000000000004', 
      '11000000-0000-0000-0000-000000000100', 
      1000, 
      'eternal-peace', 
      1000.000000000, 
      'XTR', 
      NOW()
    );
      `);
};

export const down = async () => {
  // Нет отката для заполнения таблицы
};
