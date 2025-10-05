'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_kota', [
      { 
        company_id : 1, 
        kode : 'LGS', 
        name : 'Langsa', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        kode : 'BNA', 
        name : 'Banda Aceh', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        kode : 'MDN', 
        name : 'Medan', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        kode : 'JKT', 
        name : 'Jakarta', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        kode : 'MDH', 
        name : 'Madinah', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        kode : 'JDH', 
        name : 'Jeddah', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        kode : 'MKH', 
        name : 'Mekkah', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_kota', null, {});
  }
};
