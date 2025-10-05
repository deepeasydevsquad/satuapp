'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Riwayat_surat_menyurats', {
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
      nomor_surat: {
        type: Sequelize.STRING
      },
      tipe_surat: {
        type: Sequelize.ENUM,
        values: ['rekom_paspor', 'surat_cuti'],
        defaultValue : "rekom_paspor"
      },
      tanggal_surat: {
        type: Sequelize.DATE
      },
      info: {
        type: Sequelize.TEXT
      },
      tujuan: {
        type: Sequelize.TEXT
      },
      nama_petugas: {
        type: Sequelize.STRING
      },
      petugas_id: {
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
    await queryInterface.dropTable('Riwayat_surat_menyurats');
  }
};