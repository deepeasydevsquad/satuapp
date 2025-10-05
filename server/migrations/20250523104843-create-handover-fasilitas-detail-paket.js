'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Handover_fasilitas_detail_pakets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      handover_fasilitas_paket_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Handover_fasilitas_pakets",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      item_fasilitas_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Item_fasilitas",
          key: "id",
        },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Handover_fasilitas_detail_pakets');
  }
};