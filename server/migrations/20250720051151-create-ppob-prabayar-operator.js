'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ppob_prabayar_operators', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ppob_prabayar_kategori_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ppob_prabayar_kategoris",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      kode: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        values: ['tersedia', 'tidak tersedia'],
        defaultValue : "tidak tersedia"
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
    await queryInterface.dropTable('Ppob_prabayar_operators');
  }
};