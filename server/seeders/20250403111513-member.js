'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Members', [
      { 
        division_id: 1, 
        fullname: 'Muhammad Iqbal', 
        identity_number: '123456789',
        identity_type: 'ktp',
        gender: 'laki_laki',
        photo : null, 
        birth_date : '2000-01-01',
        birth_place : 'Langsa',
        whatsapp_number : '085262802222',
        password: '$2a$10$Zr648UXQwtmNNUqeHhE5oujX.ecj7Kz4xL8Fv9iOQXMOREUf2PVDK',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        division_id: 1, 
        fullname: 'Muhammad Faisal', 
        identity_number: '123555555',
        identity_type: 'ktp',
        gender: 'laki_laki',
        photo : null, 
        birth_date : '2001-01-01',
        birth_place : 'Langsa',
        whatsapp_number : '085262803333',
        password: '$2a$10$JaWTb5ThDztEgIdgkioBWuBowG7UrhDNJoegQG6RmiVsb2HFEi.H.',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        division_id: 2, 
        fullname: 'Ilham Rizki', 
        identity_number: '442123123',
        identity_type: 'ktp',
        gender: 'laki_laki',
        photo : null, 
        birth_date : '1992-01-01',
        birth_place : 'Medan',
        whatsapp_number : '0852628055555',
        password: '$2a$10$JaWTb5ThDztEgIdgkioBWuBowG7UrhDNJoegQG6RmiVsb2HFEi.H.',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        division_id: 1, 
        fullname: 'Kurniawan', 
        identity_number: '77777777',
        identity_type: 'ktp',
        gender: 'laki_laki',
        photo : null, 
        birth_date : '1993-07-01',
        birth_place : 'Pekan Baru',
        whatsapp_number : '0852600000000',
        password: '$2a$10$JaWTb5ThDztEgIdgkioBWuBowG7UrhDNJoegQG6RmiVsb2HFEi.H.',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Members', null, {});
  }
};
