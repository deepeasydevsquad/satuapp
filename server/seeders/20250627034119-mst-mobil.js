"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Mst_mobils",
      [
        {
          company_id: 1,
          name: "HI ACE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 1,
          name: "Innova Reborn",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 1,
          name: "Alphard",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Mst_mobils", null, {});
  },
};
