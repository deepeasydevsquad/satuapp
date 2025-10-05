'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ppob_pascabayar_produks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ppob_pascabayar_kategori_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ppob_pascabayar_kategoris",
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
      fee: {
        type: Sequelize.INTEGER
      },
      markup: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        defaultValue : "inactive"
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
    await queryInterface.dropTable('Ppob_pascabayar_produks');
  }
};