'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jurnals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      division_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Divisions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      source: {
        type: Sequelize.TEXT
      },
      ref: {
        type: Sequelize.TEXT
      },
      ket: {
        type: Sequelize.TEXT
      },
      akun_debet: {
        type: Sequelize.INTEGER
      },
      akun_kredit: {
        type: Sequelize.INTEGER
      },
      saldo: {
        type: Sequelize.INTEGER
      },
      removable: {
        type: Sequelize.ENUM,
        values: ["true", "false"],
        defaultValue : "true"
      },
      periode_id: {
        type: Sequelize.INTEGER
      },
      removable: {
        type: Sequelize.ENUM,
        values: ["true", "false"],
        defaultValue : "true"
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
    await queryInterface.dropTable('Jurnals');
  }
};