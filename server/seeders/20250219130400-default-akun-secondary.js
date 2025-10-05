'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Default_akun_secondaries', [
      {  akun_primary_id: 1, nomor_akun: '11010', nama_akun : 'KAS', tipe : 'bawaan', path : 'kas', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '11020', nama_akun : 'BANK', tipe : 'bawaan', path : 'bank', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '13000', nama_akun : 'PIUTANG', tipe : 'bawaan', path : 'piutang', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '14000', nama_akun : 'KENDARAAN', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '14010', nama_akun : 'AKUMULASI PENYUSUTAN KENDARAAN', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '15000', nama_akun : 'PERALATAN KANTOR', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '15010', nama_akun : 'AKUMULASI PENYUSUTAN PERALATAN KANTOR', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '16000', nama_akun : 'TANAH', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '17000', nama_akun : 'BANGUNAN', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '17010', nama_akun : 'AKUMULASI PENYUSUTAN BANGUNAN', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '18000', nama_akun : 'ASET LAINNYA', tipe : 'tambahan', path : 'kas', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 1, nomor_akun: '18010', nama_akun : 'AKUMULASI PENYUSUTAN ASET LAINNYA', tipe : 'tambahan', path : '', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 2, nomor_akun: '21000', nama_akun : 'UTANG USAHA', tipe : 'bawaan', path : 'utang_usaha', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 2, nomor_akun: '22000', nama_akun : 'UTANG JANGKA PANJANG', tipe : 'bawaan', path : 'utang_jangka_panjang', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 3, nomor_akun: '31000', nama_akun : 'EKUITAS/MODAL', tipe : 'bawaan', path : 'ekuitas_modal', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 3, nomor_akun: '32000', nama_akun : 'LABA DITAHAN', tipe : 'bawaan', path : 'laba_ditahan', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 3, nomor_akun: '33000', nama_akun : 'LABA/RUGI TAHUN BERJALAN', tipe : 'bawaan', path : 'laba_rugi_tahun_berjalan', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '41000', nama_akun : 'PENDAPATAN PAKET', tipe : 'bawaan', path : 'pendapatan_paket', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '42000', nama_akun : 'PENDAPATAN PAKET LA', tipe : 'bawaan', path : 'pendapatan_paket_la', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '43000', nama_akun : 'PENDAPATAN TIKET', tipe : 'bawaan', path : 'pendapatan_tiket', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '44000', nama_akun : 'PENDAPATAN HOTEL', tipe : 'bawaan', path : 'pendapatan_hotel', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '45000', nama_akun : 'PENDAPATAN VISA', tipe : 'bawaan', path : 'pendapatan_visa', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '46000', nama_akun : 'PENDAPATAN PASSPORT', tipe : 'bawaan', path : 'pendapatan_passport', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '47000', nama_akun : 'PENDAPATAN TRANSPORT', tipe : 'bawaan', path : 'pendapatan_transport', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 4, nomor_akun: '48000', nama_akun : 'PENDAPATAN LAINNYA', tipe : 'bawaan', path : 'pendapatan_lainnya', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 5, nomor_akun: '51000', nama_akun : 'HPP TIKET', tipe : 'bawaan', path : 'hpp_tiket', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 5, nomor_akun: '52000', nama_akun : 'HPP VISA', tipe : 'bawaan', path : 'hpp_visa', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 5, nomor_akun: '53000', nama_akun : 'HPP HOTEL', tipe : 'bawaan', path : 'hpp_hotel', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 5, nomor_akun: '54000', nama_akun : 'HPP PASSPORT', tipe : 'bawaan', path : 'hpp_passport', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 5, nomor_akun: '55000', nama_akun : 'HPP TRANSPORT', tipe : 'bawaan', path : 'hpp_transport', createdAt: new Date(), updatedAt: new Date() },
      {  akun_primary_id: 5, nomor_akun: '56000', nama_akun : 'PROMOSI DAN IKLAN', tipe : 'bawaan', path : '', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Default_akun_secondaries', null, {});
  }
};
