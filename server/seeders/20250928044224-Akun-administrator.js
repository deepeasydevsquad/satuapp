"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Akun_administrators",
      [
        {
          fullname: "Administrator",
          username: "admin",
          password:
            "$2a$10$jTrtFeM5gOQvF5fZ82JlFeUEfcrsPPXvay2dTPcBNEcCPUW4jz7Y6",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Akun_administrators", null, {});
  },
};
