'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ppob_transaction_pascabayars', {
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
      ppob_pascabayar_produk_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ppob_pascabayar_produks",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      transaction_code: {
        type: Sequelize.STRING
      },
      nomor_tujuan: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      application_price: {
        type: Sequelize.INTEGER
      },
      company_price: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM,
        values: ['process', 'success', 'failed'],
        defaultValue : "process"
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
    await queryInterface.dropTable('Ppob_transaction_pascabayars');
  }
};