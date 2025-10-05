"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Tab_administrators",
      [
        {
          id: 1,
          name: "Dashboard",
          icon: "fas fa-tachometer-alt",
          path: "dashboard",
          desc: "Beranda Utama",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Daftar Perusahaan",
          icon: "fas fa-building",
          path: "daftar_perusahaan",
          desc: "Fitur Daftar Perusahaan",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "Daftar Produk",
          icon: "fas fa-box-open",
          path: "daftar_produk",
          desc: "Fitur untuk menampilkan semua daftar produk yang tersedia",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "Daftar Operator",
          icon: "fas fa-user-cog",
          path: "daftar_operator",
          desc: "Fitur untuk menampilkan semua daftar operator amra yang tersedia",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: "Transaksi PPOB",
          icon: "fas fa-exchange-alt",
          path: "transaksi_ppob",
          desc: "Fitur untuk menampilkan semua daftar transaksi ppob",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: "Request Tambah Saldo",
          icon: "fas fa-money-check-alt",
          path: "request_tambah_saldo",
          desc: "Fitur untuk menampilkan semua daftar request tambah saldo perusahaan",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          name: "Daftar Aktifitas Perusahaan",
          icon: "fas fa-clipboard-list",
          path: "daftar_aktifitas_perusahaan",
          desc: "Fitur Untuk Melihat Aktifitas Perusahaan",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Tab_administrators", null, {});
  },
};
