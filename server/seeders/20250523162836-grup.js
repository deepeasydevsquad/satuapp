'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Grups', [
      { 
        division_id: 1,
        name: 'Staff',
        group_access: '[{"id":1,"name":"Beranda","path":"beranda","icon":"fas fa-home","Submenus":[]},{"id":2,"name":"Transaksi","path":"#","icon":"fas fa-exchange","Submenus":[{"id":1,"menu_id":2,"name":"Transaksi Tiket","path":"transaksi_tiket"},{"id":2,"menu_id":2,"name":"Transaksi Paket","path":"transaksi_paket"},{"id":3,"menu_id":2,"name":"Transaksi Umum","path":"transaksi_umum"},{"id":4,"menu_id":2,"name":"Rekapitulasi","path":"rekapitulasi"}]},{"id":3,"name":"Paket & Paket LA","path":"#","icon":"fas fa-box-open","Submenus":[{"id":5,"menu_id":3,"name":"Daftar Paket","path":"daftar_paket"},{"id":6,"menu_id":3,"name":"Daftar Paket LA","path":"daftar_paket_la"}]}]',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Grups', null, {});
  }
};
