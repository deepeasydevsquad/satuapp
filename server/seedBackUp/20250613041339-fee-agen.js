"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Fee_agens", [
      {
        company_id: 1,
        agen_id: 1,
        invoice: null,
        nominal: 120000,
        status_bayar: "belum_lunas",
        info: "Fee dari transaksi 2025-06-08",
        pembayaran_fee_agen_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        agen_id: 1,
        invoice: null,
        nominal: 180000,
        status_bayar: "belum_lunas",
        info: "Fee dari transaksi 2025-06-09",
        pembayaran_fee_agen_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        agen_id: 1,
        invoice: null,
        nominal: 175000,
        status_bayar: "belum_lunas",
        info: "Fee dari transaksi 2025-06-10",
        pembayaran_fee_agen_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        agen_id: 1,
        invoice: null,
        nominal: 130000,
        status_bayar: "belum_lunas",
        info: "Fee dari transaksi 2025-06-11",
        pembayaran_fee_agen_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        agen_id: 1,
        invoice: null,
        nominal: 210000,
        status_bayar: "belum_lunas",
        info: "Fee dari transaksi 2025-06-12",
        pembayaran_fee_agen_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("fee_agen", {
      info: {
        [Sequelize.Op.in]: [
          "Fee dari transaksi 2025-06-08",
          "Fee dari transaksi 2025-06-09",
          "Fee dari transaksi 2025-06-10",
          "Fee dari transaksi 2025-06-11",
          "Fee dari transaksi 2025-06-12",
        ],
      },
    });
  },
};
