'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Kamars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Companies",
          key: "id",
        },
        onDelete: 'CASCADE',
      }, 
      hotel_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_hotels",
          key: "id",
        },
        onDelete: 'CASCADE',
      }, 
      tipe_kamar: {
        type: Sequelize.ENUM,
        values: ['laki_laki', 'perempuan'],
        defaultValue : "laki_laki"
      },
      kapasitas_kamar: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Kamars');
  }
};