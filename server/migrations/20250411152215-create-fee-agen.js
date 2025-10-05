'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Fee_agens', {
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
      agen_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Agens",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      invoice: {
        type: Sequelize.STRING
      },
      nominal: {
        type: Sequelize.INTEGER
      },
      status_bayar: {
        type: Sequelize.ENUM,
        values: ["lunas", "belum_lunas"],
        defaultValue : "belum_lunas"
      },
      info: {
        type: Sequelize.TEXT
      },
      pembayaran_fee_agen_id: {
        allowNull: true,
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Fee_agens');
  }
};