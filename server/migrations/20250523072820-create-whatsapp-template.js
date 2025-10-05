"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Whatsapp_templates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Companies",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM,
        values: [
          "pesan_biasa",
          "semua_jamaah",
          "jamaah_sudah_berangkat",
          "staff",
          "jamaah_paket",
          "jamaah_tabungan_umrah",
          "jamaah_utang_koperasi",
          "agen",
        ],
        defaultValue: "pesan_biasa",
      },
      message: {
        type: Sequelize.TEXT,
      },
      variable: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Whatsapp_templates");
  },
};
