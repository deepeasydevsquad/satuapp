"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Amra_settings",
      [
        {
          name: "wapisender_api_key",
          value: "4BQEL001HE7FCFFCSTYHFNNAS9D2FENS",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "wapisender_device_key",
          value: "KTDDDC",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "nomor_wa",
          value: "6281285607689",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "harga_langganan",
          value: "3000000",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "nama_rekening",
          value: "amra",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "MIDTRANS_GET_STATUS_URL",
          value:
            "https://api.sandbox.midtrans.com/v2/",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Amra_settings", null, {});
  },
};
