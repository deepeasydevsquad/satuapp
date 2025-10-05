'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transaction_fasilitas', {
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
      invoice: {
        type: Sequelize.STRING
      },
      kostumer_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue : null,
        references: {
          model: "Kostumers",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      tabungan_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue : null,
        references: {
          model: "Tabungans",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      paket_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue : null,
        references: {
          model: "Pakets",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      petugas: {
        type: Sequelize.STRING
      },
      total: {
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

  // tipe: {
//   type: Sequelize.ENUM,
//   values: ["bawaan", "tambahan"],
//   defaultValue : "bawaan"
// },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transaction_fasilitas');
  }
};