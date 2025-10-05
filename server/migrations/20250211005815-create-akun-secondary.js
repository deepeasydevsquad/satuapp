'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Akun_secondaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Companies",
          key: "id",
        },
        onDelete: 'CASCADE',
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
        type: Sequelize.STRING
      },
      nama_akun: {
        type: Sequelize.STRING
      },
      tipe_akun: {
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
    await queryInterface.dropTable('Akun_secondaries');
  }
};