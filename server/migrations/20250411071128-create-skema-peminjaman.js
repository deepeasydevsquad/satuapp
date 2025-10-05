"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Skema_peminjamans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      division_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Divisions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      peminjaman_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Peminjamans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      term: {
        type: Sequelize.INTEGER,
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      duedate: {
        type: Sequelize.DATEONLY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Skema_peminjamans");
  },
};
