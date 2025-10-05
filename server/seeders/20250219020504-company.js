"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Companies",
      [
        {
          division_id: 1,
          code: "AR60045",
          kurs: "rp",
          logo: "237a47f733bb76d0b0bf01b4a5513d3a.png",
          icon: null,
          company_name: "PT. MUHANDIS QUR'ANI WISATA",
          email: "admin@gmail.com",
          type: "unlimited",
          verify_status: "verified",
          verify_time: "2025-02-07 15:33:41",
          whatsapp_company_number: "085262802144",
          otp: "123456",
          otp_expired_time: "2025-02-07 15:33:41",
          invoice_logo: null,
          invoice_title: null,
          start_subscribtion: "2025-02-04 15:33:41",
          end_subscribtion: "2026-02-05 15:33:41",
          whatsapp_device_number: "085143184283",
          whatsapp_device_key: "YSQDUT",
          whatsapp_api_key: "4BQEL001HE7FCFFCSTYHFNNAS9D2FENS",
          refresh_token: "y87238giehgaiuwgd82o123455gskiassmnxzxclaoihdsobk",
          saldo: 0,
          markup_ppob: 0,
          username: "admin",
          password:
            "$2a$10$Zr648UXQwtmNNUqeHhE5oujX.ecj7Kz4xL8Fv9iOQXMOREUf2PVDK",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          // division_id: 1,
          code: "AR600DD",
          kurs: "rp",
          logo: "237a47f733bb76d0b0bf01b4a5513d3a.png",
          icon: null,
          company_name: "PT. AAAAA",
          email: "admin@gmail.com",
          type: "unlimited",
          verify_status: "verified",
          verify_time: "2025-02-07 15:33:41",
          whatsapp_company_number: "085262802144",
          otp: "123456",
          otp_expired_time: "2025-02-07 15:33:41",
          invoice_logo: null,
          invoice_title: null,
          start_subscribtion: "2025-02-04 15:33:41",
          end_subscribtion: "2026-02-05 15:33:41",
          whatsapp_device_number: "085143184283",
          whatsapp_device_key: "YSQDUT",
          whatsapp_api_key: "4BQEL001HE7FCFFCSTYHFNNAS9D2FENS",
          refresh_token: "y87238giehgaiuwgd82o123455gskiassmnxzxclaoihdsobk",
          saldo: 100000,
          markup_ppob: 0,
          username: "admin123",
          password:
            "$2a$10$Zr648UXQwtmNNUqeHhE5oujX.ecj7Kz4xL8Fv9iOQXMOREUf2PVDK",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Companies", null, {});
  },
};
