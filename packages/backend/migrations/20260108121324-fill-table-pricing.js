"use strict";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  const prices = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      price: 99,
      period: 30,
      name: "Single Month Plan",
      currency: "XTR",
      createdAt: new Date(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      price: 1999,
      period: 30,
      name: "Premium Month Plan",
      currency: "XTR",
      createdAt: new Date(),
    },
  ];
  await queryInterface.bulkInsert("pricing", prices);
};

export const down = async () => {
  // Нет отката для заполнения таблицы
};
