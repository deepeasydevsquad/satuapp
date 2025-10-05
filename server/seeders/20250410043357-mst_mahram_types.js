'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_mahram_types', [
      { 
        name: 'Suami',
        gender: 'laki_laki', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Istri',
        gender: 'perempuan', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Anak Laki-laki',
        gender: 'laki_laki', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Anak Perempuan',
        gender: 'perempuan', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Ayah',
        gender: 'laki_laki', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'Ibu',
        gender: 'perempuan', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_mahram_types', null, {});
  }
};
