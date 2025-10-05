'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Jurnals', [
      { 
        division_id: 1,
        source: '', 
        ref: 'MODAL GRUP KEREN', 
        ket: 'Investasi awal',
        akun_debet: '11010', 
        akun_kredit: '31000',
        saldo: '100000000',
        periode_id: 0,
        removable: true,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        division_id: 1,
        source: '', 
        ref: 'PENJUALAN PAKET SECARA KREDIT', 
        ket: 'Penjualan kredit Paket',
        akun_debet: '13000', 
        akun_kredit: '41000',
        saldo: '30000000',
        periode_id: 0,
        removable: true,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        division_id: 1,
        source: '', 
        ref: 'PEMBAYARAN GAJI KARYAWAN', 
        ket: 'Gaji Karyawan',
        akun_debet: '60001', 
        akun_kredit: '11010',
        saldo: '3000000',
        periode_id: 0,  
        removable: true,
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Jurnals', null, {});
  }
};
