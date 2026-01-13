//

"use strict";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`
INSERT INTO users(id,"externalId","sourceId",username,email,"firstName", "lastName","createdAt", "updatedAt")
VALUES(
       '11111111-1111-1111-1111-111111111111',
       'local',
       'tg',
       'fake',
       'fake@rmail.com',
       '',
       '',
       NOW(),       
       NOW()
      );     

      `);
};

export const down = async () => {
  // Нет отката для заполнения таблицы
};
