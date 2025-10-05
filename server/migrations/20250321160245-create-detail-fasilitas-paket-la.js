'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Detail_fasilitas_paket_las', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fasilitas_paket_la_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Fasilitas_paket_las",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.TEXT
      },
      check_in: {
        type: Sequelize.DATE
      },
      check_out: {
        type: Sequelize.DATE
      },
      day: {
        type: Sequelize.INTEGER
      },
      pax: {
        type: Sequelize.INTEGER
      },
      price: {
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
    await queryInterface.dropTable('Detail_fasilitas_paket_las');
  }
};