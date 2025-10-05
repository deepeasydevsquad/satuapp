'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Handover_barang_pakets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      paket_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Paket_transactions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      invoice_handover: {
        type: Sequelize.STRING
      },
      invoice_returned: {
        type: Sequelize.STRING
      },
      jamaah_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Jamaahs",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      nama_barang: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        values: ['dikembalikan', 'diambil'],
        defaultValue : "dikembalikan"
      },
      giver_handover: {
        type: Sequelize.STRING
      },
      giver_handover_identity: {
        type: Sequelize.STRING
      },
      giver_handover_hp: {
        type: Sequelize.STRING
      },
      giver_handover_address: {
        type: Sequelize.TEXT
      },
      receiver_handover: {
        type: Sequelize.STRING
      },
      giver_returned: {
        type: Sequelize.STRING
      },
      receiver_returned: {
        type: Sequelize.STRING
      },
      receiver_returned_identity: {
        type: Sequelize.STRING
      },
      receiver_returned_hp: {
        type: Sequelize.STRING
      },
      receiver_returned_address: {
        type: Sequelize.TEXT
      },
      date_taken: {
        type: Sequelize.DATE
      },
      date_returned: {
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
    await queryInterface.dropTable('Handover_barang_pakets');
  }
};