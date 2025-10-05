'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Paket_transactions', {
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
      fee_agen_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Fee_agens",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      paket_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Pakets",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      mst_paket_type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_paket_types",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      price: {
        type: Sequelize.INTEGER
      },
      nomor_visa: {
        type: Sequelize.INTEGER
      },
      tanggal_berlaku_visa: {
        type: Sequelize.DATEONLY
      },
      tanggal_berakhir_visa: {
        type: Sequelize.DATEONLY
      },
      batal_berangkat: {
        type: Sequelize.ENUM,
        values: ['ya','tidak'],
        defaultValue : "tidak"
      },
      from: {
        type: Sequelize.ENUM,
        values: ['transaksi_paket','tabungan']
      },
      biaya_mahram: {
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
    await queryInterface.dropTable('Paket_transactions');
  }
};