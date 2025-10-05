'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Default_akun_secondaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      akun_primary_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Akun_primaries",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      nomor_akun: {
        type: Sequelize.INTEGER
      },
      nama_akun: {
        type: Sequelize.STRING
      },
      tipe: {
        type: Sequelize.ENUM,
        values: ["bawaan", "tambahan"],
        defaultValue : "bawaan"
      },
      path: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Default_akun_secondaries');
  }
};