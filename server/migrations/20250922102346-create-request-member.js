'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Request_members', {
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
        values: ['ktp','passport']
      },
      gender: {
        type: Sequelize.ENUM, 
        values: ['laki_laki','perempuan']
      },
      photo: {
        type: Sequelize.STRING
      },
      birth_date: {
        type: Sequelize.DATEONLY
      },
      birth_place: {
        type: Sequelize.STRING
      },
      whatsapp_number: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      agen_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Agens",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      address: {
        type: Sequelize.TEXT
      },
      kelurahan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "Kelurahans",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM, 
        values: ['process','approved','rejected'],
        defaultValue: 'process',
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
    await queryInterface.dropTable('Request_members');
  }
};