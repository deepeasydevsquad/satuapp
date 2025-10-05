"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Companies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
      },
      division_id: {
        type: Sequelize.STRING,
      },
      kurs: {
        type: Sequelize.ENUM,
        values: ["rp", "usd", "sar"],
        defaultValue: "rp",
      },
      division_id: {
        type: Sequelize.STRING,
      },
      logo: {
        type: Sequelize.STRING,
      },
      icon: {
        type: Sequelize.STRING,
      },
      company_name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM,
        values: ["limited", "unlimited"],
        defaultValue: "limited",
      },
      verify_status: {
        type: Sequelize.ENUM,
        values: ["verified", "unverified"],
        defaultValue: "unverified",
      },
      verify_time: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
      whatsapp_company_number: {
        type: Sequelize.STRING,
      },
      otp: {
        type: Sequelize.STRING,
      },
      otp_expired_time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      invoice_logo: {
        type: Sequelize.STRING,
      },
      invoice_title: {
        type: Sequelize.STRING,
      },
      start_subscribtion: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      end_subscribtion: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      whatsapp_device_number: {
        type: Sequelize.STRING,
      },
      whatsapp_api_key: {
        type: Sequelize.STRING,
      },
      whatsapp_device_key: {
        type: Sequelize.STRING,
      },
      refresh_token: {
        type: Sequelize.TEXT,
      },
      saldo: {
        type: Sequelize.INTEGER,
      },
      markup_ppob: {
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Companies");
  },
};

// code: DataTypes.STRING,
//       kurs: DataTypes.ENUM(["rp", "usd", 'sar']),
//       logo: DataTypes.STRING,
//       company_name: DataTypes.STRING,
//       email: DataTypes.STRING,
//       type: DataTypes.ENUM(["limited", "unlimited"]),
//       verify_status: DataTypes.ENUM(["verified", "unverified"]),
//       verify_time: DataTypes.DATE,
//       whatsapp_company_number: DataTypes.STRING,
//       otp: DataTypes.STRING,
//       otp_expired_time: DataTypes.DATE,
//       invoice_logo: DataTypes.STRING,
//       invoice_title: DataTypes.STRING,
//       username: DataTypes.STRING,
//       password: DataTypes.STRING,
