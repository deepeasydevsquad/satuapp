'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Ppob_pascabayar_kategoris', [
        {id:"1",kode:"PLNP",name:"PLN Pascabayar", createdAt: new Date(), updatedAt: new Date()},
        {id:"2",kode:"PP",name:"Pulsa Pascabayar", createdAt: new Date(), updatedAt: new Date()},
        {id:"3",kode:"TELKOM",name:"Telkom", createdAt: new Date(), updatedAt: new Date()},
        {id:"4",kode:"BPJS",name:"BPJS", createdAt: new Date(), updatedAt: new Date()},
        {id:"5",kode:"PDAM",name:"PDAM", createdAt: new Date(), updatedAt: new Date()},
        {id:"6",kode:"PGN",name:"PGN", createdAt: new Date(), updatedAt: new Date()},
        {id:"7",kode:"TVP",name:"TV Pascabayar", createdAt: new Date(), updatedAt: new Date()}
      ], 
    {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

 