'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket_payment_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_payment_history.belongsTo(models.Ticket_transaction, {
        foreignKey: "ticket_transaction_id",
      });
    }
    // 🔽 Static method to generate unique nomor_invoice
    static async generateUniqueNomorInvoice() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const randomLetters = () =>
        letters.charAt(Math.floor(Math.random() * 26)) +
        letters.charAt(Math.floor(Math.random() * 26));

      const randomNumber = () =>
        String(Math.floor(100000 + Math.random() * 900000)); // 6-digit

      let nomorInvoice = '';
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 1000) {
        nomorInvoice = `${randomLetters()}${randomNumber()}`;
        const exists = await Ticket_payment_history.findOne({
          where: { invoice: nomorInvoice },
        });
        if (!exists) isUnique = true;
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique nomor_invoice after 1000 attempts');
      }

      return nomorInvoice;
    }
  }
  Ticket_payment_history.init({
    ticket_transaction_id: DataTypes.INTEGER,
    nominal: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    status: DataTypes.ENUM(['cash', 'refund']),
    petugas: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ticket_payment_history',
  });
  return Ticket_payment_history;
};