'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Hotel_transactions', {
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
      kostumer_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Kostumers",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      paket_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Pakets",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      mst_hotel_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_hotels",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      invoice: {
        type: Sequelize.STRING
      },
      petugas: {
        type: Sequelize.STRING
      },
      check_in: {
        type: Sequelize.DATEONLY
      },
      check_out: {
        type: Sequelize.DATEONLY
      },
      tipe_kamar: {
        type: Sequelize.STRING
      },
      jumlah_hari: {
        type: Sequelize.INTEGER
      },
      jumlah_kamar: {
        type: Sequelize.INTEGER
      },
      harga_travel_kamar_per_hari: {
        type: Sequelize.INTEGER
      },
      harga_kostumer_kamar_per_hari: {
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
    await queryInterface.dropTable('Hotel_transactions');
  }
};