'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tabungans', {
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
      jamaah_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Jamaahs",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      target_paket_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue : null,
        references: {
          model: "Pakets",
          key: "id",
        },
      },
      total_tabungan: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'non_active'],
        defaultValue : "active"
      },
      fee_agen_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue : null,
        references: {
          model: "Fee_agens",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      batal_berangkat: {
        type: Sequelize.ENUM,
        values: ['ya', 'tidak'],
        defaultValue : "tidak"
      },
      paket_transaction_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue : null,
      },
      sisa_pembelian: {
        type: Sequelize.INTEGER
      },
      invoice_sisa_deposit: {
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
    await queryInterface.dropTable('Tabungans');
  }
};