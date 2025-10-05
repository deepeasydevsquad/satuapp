'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Konfigurasi_surat_menyurats', {
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
      nama_tanda_tangan: {
        type: Sequelize.STRING
      },
      jabatan_tanda_tangan: {
        type: Sequelize.STRING
      },
      alamat_tanda_tangan: {
        type: Sequelize.TEXT
      },
      nama_perusahaan: {
        type: Sequelize.TEXT
      },
      izin_perusahaan: {
        type: Sequelize.TEXT
      },
      kota_perusahaan: {
        type: Sequelize.STRING
      },
      provinsi_perusahaan: {
        type: Sequelize.STRING
      },
      alamat_perusahaan: {
        type: Sequelize.TEXT
      },
      no_kontak_perusahaan: {
        type: Sequelize.STRING
      },
      website_perusahaan: {
        type: Sequelize.TEXT
      },
      email_perusahaan: {
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
    await queryInterface.dropTable('Konfigurasi_surat_menyurats');
  }
};