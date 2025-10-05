'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Divisions', {
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
      name: {
        type: Sequelize.STRING
      },
      kota_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_kota",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      pos_code: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      note: {
        type: Sequelize.TEXT
      },
      tanda_tangan: {
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
    await queryInterface.dropTable('Divisions');
  }
};