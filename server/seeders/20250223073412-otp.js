'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Otps', [
      { 
        otp_code : 123456,
        expired_time: '2025-02-24 14:34:41',
        mobile_number: '085262802141',
        otp_type: 'registration',
        otp_status: 'active',
        user_type: 'amra_app',
        createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Otps', null, {});
  }
};
