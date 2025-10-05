'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Request_deposit_members', [
      {
        company_id: 1,
        member_id: 1,
        nominal: 500000,
        code: 123,
        status: 'diproses',
        status_note: 'Menunggu konfirmasi pembayaran.',
        petugas: null,
        akun_bank_perusahaan_id: null,
        sending_payment_status: 'sudah_dikirim',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        company_id: 1,
        member_id: 1,
        nominal: 1000000,
        code: 456,
        status: 'disetujui',
        status_note: 'Permintaan deposit telah disetujui.',
        petugas: "PT. MUHANDIS QUR'ANI WISATA",
        akun_bank_perusahaan_id: null,
        sending_payment_status: 'sudah_dikirim',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        company_id: 1,
        member_id: 2,
        nominal: 750000,
        code: 456,
        status: 'diproses',
        status_note: 'Menunggu konfirmasi pembayaran.',
        petugas: null,
        akun_bank_perusahaan_id: null,
        sending_payment_status: 'sudah_dikirim',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        company_id: 1,
        member_id: 3,
        nominal: 1200000,
        code: 456,
        status: 'diproses',
        status_note: 'Menunggu konfirmasi pembayaran.',
        petugas: null,
        akun_bank_perusahaan_id: null,
        sending_payment_status: 'belum_dikirim',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Request_deposit_members', null, {});
  }
};
