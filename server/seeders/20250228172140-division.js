'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Divisions', [
      { 
        company_id : 1, 
        name : 'Cabang Langsa', 
        kota_id : 1, 
        pos_code : '2232233', 
        address : 'Tes Alamat', 
        note: '', 
        tanda_tangan : '',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id : 1, 
        name : 'Cabang Banda Aceh', 
        kota_id : 2, 
        pos_code : '2232233', 
        address : 'Tes Alamat', 
        note: '', 
        tanda_tangan : '',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Divisions', null, {});
  }
};
