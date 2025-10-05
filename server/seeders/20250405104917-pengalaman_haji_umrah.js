'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Pengalaman_haji_umrahs', [
      { 
        name: 'Belum Pernah',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 1 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 2 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 3 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 4 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 5 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 6 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 7 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 8 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 9 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 10 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Sudah 11 Kali',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Pengalaman_haji_umrahs', null, {});
  }
};
