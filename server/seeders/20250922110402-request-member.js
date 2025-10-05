'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Request_members', [
      {
        division_id: 1,
        fullname: 'Rizky Maulana',
        identity_number: '3201234567890001',
        identity_type: 'ktp',
        gender: 'laki_laki',
        photo: 'rizky.jpg',
        birth_date: '1995-05-10',
        birth_place: 'Bekasi',
        whatsapp_number: '081234567890',
        password: 'hashed_password',
        agen_id: 1,
        address: 'Jl. Raya Jakarta Cikarang No. 1, Cikarang Utara, Cikarang, Jawa Barat',
        kelurahan_id: 1101012001,
        status: 'process',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
  }
};
