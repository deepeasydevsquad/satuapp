'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Whatsapp_messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      division_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Divisions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM,
        values: ['pesan_biasa','semua_jamaah','staff','jamaah_paket','jamaah_tabungan_umrah','jamaah_utang_koperasi','agen'],
        defaultValue : "pesan_biasa"
      },
      nomor_asal: {
        type: Sequelize.STRING
      },
      pesan: {
        type: Sequelize.TEXT
      },
      whatsapp_template_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Whatsapp_templates",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM,
        values: ['process','finish'],
        defaultValue : "process"
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
    await queryInterface.dropTable('Whatsapp_messages');
  }
};