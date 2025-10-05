'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Members', {
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
      fullname: {
        type: Sequelize.STRING
      },
      identity_number: {
        type: Sequelize.STRING
      },
      identity_type: {
        type: Sequelize.ENUM,
        values: ['ktp', 'passport'],
        defaultValue : "ktp"
      },
      gender: {
        type: Sequelize.ENUM,
        values: ['laki_laki', 'perempuan'],
        defaultValue : "laki_laki"
      },
      photo: {
        type: Sequelize.STRING
      },
      birth_date: {
        type: Sequelize.DATE
      },
      birth_place: {
        type: Sequelize.STRING
      },
      whatsapp_number: {
        type: Sequelize.STRING
      },
      total_deposit: {
        type: Sequelize.INTEGER
      },
      total_tabungan: {
        type: Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Members');
  }
};