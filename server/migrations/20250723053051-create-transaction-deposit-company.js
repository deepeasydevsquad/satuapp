"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transaction_deposit_companies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Companies",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      transaction_code: {
        type: Sequelize.STRING,
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      type_transaction: {
        allowNull: true,
        type: Sequelize.ENUM,
        values: ["deposit", "ppob"],
        defaultValue: null,
      },
      ket: {
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: true,
        type: Sequelize.ENUM,
        values: ["process", "approved", "rejected"],
        defaultValue: "process",
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
    await queryInterface.dropTable("Transaction_deposit_companies");
  },
};
