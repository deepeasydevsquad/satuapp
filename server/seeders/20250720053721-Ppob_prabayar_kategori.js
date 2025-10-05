'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Ppob_prabayar_kategoris', [
  {id: "1", name: "PULSA ALL OPERATOR", type: "REGULER", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "2", name: "PAKET DATA", type: "INTERNET", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "4", name: "VOUCHER GOOGLE PLAY", type: "REGULER", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "5", name: "PULSA SMS TELEPHONE", type: "SMS", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "6", name: "PULSA TRANSFER", type: "TRANSFER", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "11", name: "VOUCHER GAME", type: "GAME", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "12", name: "PUBG MOBILE UC", type: "GAME", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "14", name: "VOUCHER WIFI.ID", type: "LAIN", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "19", name: "TOKEN LISTRIK", type: "PLN", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "20", name: "E-TOLL", type: "LAIN", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "22", name: "FREE FIRE DIAMOND", type: "GAME", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "23", name: "MALAYSIA TOPUP", type: "REGULER", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "24", name: "SINGAPORE TOPUP", type: "REGULER", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "25", name: "E-MONEY", type: "LAIN", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "26", name: "MOBILE LEGEND", type: "GAME", status: "tersedia", createdAt: new Date(), updatedAt: new Date()},
  {id: "76", name: "VOUCHER", type: "LAIN", status: "tersedia", createdAt: new Date(), updatedAt: new Date()}
]
, 
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

 