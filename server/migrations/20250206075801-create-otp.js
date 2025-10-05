'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Otps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      otp_code: {
        type: Sequelize.STRING
      },
      expired_time: {
        type: Sequelize.DATE
      },
      mobile_number: {
        type: Sequelize.STRING
      },
      otp_type: {
        type: Sequelize.ENUM,
        values: ['registration','login'],
        defaultValue : "registration"
      },
      otp_status: {
        type: Sequelize.ENUM,
        values: ['active','inactive'],
        defaultValue : "inactive"
      },
      user_type: {
        type: Sequelize.ENUM,
        values: ['amra_app','company'],
        defaultValue : "company"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Otps');
  }
};