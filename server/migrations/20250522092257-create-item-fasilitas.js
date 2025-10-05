'use strict';

const mst_fasilitas = require('../models/mst_fasilitas');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Item_fasilitas', {
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
      item_code: {
        type: Sequelize.STRING
      },
      mst_fasilitas_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_fasilitas",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM,
        values: ['terjual', 'belum_terjual'],
        defaultValue : "belum_terjual"
      },
      harga_beli: {
        type: Sequelize.INTEGER
      },
      harga_jual: {
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
    await queryInterface.dropTable('Item_fasilitas');
  }
};