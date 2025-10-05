"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Konfigurasi_surat_menyurats",
      [
        {
          company_id: 1, // sesuaikan dengan data company yang udah ada
          nama_tanda_tangan: "Tuan Muda",
          jabatan_tanda_tangan: "Direktur Utama",
          alamat_tanda_tangan: "Jl. Sukasuka No. 88, Jakarta Selatan",
          nama_perusahaan: "PT. Gen Z Maju Jaya",
          izin_perusahaan: "SIUP No. 123/XYZ/2025",
          kota_perusahaan: "Jakarta",
          provinsi_perusahaan: "DKI Jakarta",
          alamat_perusahaan: "Jl. Maju Terus No. 7, Jakarta Pusat",
          no_kontak_perusahaan: "0812-3456-7890",
          website_perusahaan: "https://genzmj.co.id",
          email_perusahaan: "admin@genzmj.co.id",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Konfigurasi_surat_menyurats", null, {});
  },
};
