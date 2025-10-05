'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Paket_las', {
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
      register_number: {
        type: Sequelize.STRING
      },
      kostumer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Kostumers",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      client_name: {
        type: Sequelize.STRING
      },
      client_hp_number: {
        type: Sequelize.STRING
      },
      client_address: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'cancel', 'close'],
        defaultValue : "close"
      },
      discount: {
        type: Sequelize.INTEGER
      },
      total_price: {
        type: Sequelize.INTEGER
      },
      total_jamaah: {
        type: Sequelize.INTEGER
      },
      departure_date: {
        type: Sequelize.DATE
      },
      arrival_date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Paket_las');
  }
};