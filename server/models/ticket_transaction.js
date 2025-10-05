'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_transaction.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Ticket_transaction.belongsTo(models.Mst_airline, {
        foreignKey: "airlines_id",
      });
      Ticket_transaction.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
      Ticket_transaction.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
      Ticket_transaction.hasMany(models.Ticket_payment_history, {
        foreignKey: "ticket_transaction_id",
        onDelete: 'CASCADE',
      });
      Ticket_transaction.hasMany(models.Ticket_transaction_refund, {
        foreignKey: "ticket_transaction_id",
        onDelete: 'CASCADE',
      });
      Ticket_transaction.hasMany(models.Ticket_rekapitulasi_detail, {
        foreignKey: "ticket_transaction_id",
        onDelete: 'CASCADE',
      });
      Ticket_transaction.hasMany(models.Ticket_reschedule_history, {
        foreignKey: "ticket_transaction_id",
        onDelete: 'CASCADE',
      });

      
    }
  }
  Ticket_transaction.init({
    division_id: DataTypes.INTEGER,
    nomor_registrasi: DataTypes.STRING,
    airlines_id: DataTypes.INTEGER,
    kostumer_id: DataTypes.INTEGER,
    paket_id: DataTypes.INTEGER,
    status: DataTypes.ENUM(['active', 'refund', 'cancel']),
    pax: DataTypes.INTEGER,
    code_booking: DataTypes.STRING,
    travel_price: DataTypes.INTEGER,
    costumer_price: DataTypes.INTEGER,
    departure_date: DataTypes.DATEONLY,
    arrival_date: DataTypes.DATEONLY,
  }, {
    sequelize,
    modelName: 'Ticket_transaction',
  });
  return Ticket_transaction;
};
    
// Ticket_transaction.hasMany(models.Ticket_transaction_detail, {
//   foreignKey: "ticket_transaction_id",
//   onDelete: 'CASCADE',
// });
// 🔽 Static method to generate unique nomor_register
// static async generateUniqueNomorRegister() {
//   const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   const randomLetters = () =>
//     letters.charAt(Math.floor(Math.random() * 26)) +
//     letters.charAt(Math.floor(Math.random() * 26));

//   const randomNumber = () =>
//     String(Math.floor(100000 + Math.random() * 900000)); // 6-digit

//   let nomorRegister = '';
//   let isUnique = false;
//   let attempts = 0;

//   while (!isUnique && attempts < 1000) {
//     nomorRegister = `${randomLetters()}${randomNumber()}`;
//     const exists = await Ticket_transaction.findOne({
//       where: { nomor_register: nomorRegister },
//     });
//     if (!exists) isUnique = true;
//     attempts++;
//   }

//   if (!isUnique) {
//     throw new Error('Failed to generate unique nomor_register after 1000 attempts');
//   }

//   return nomorRegister;
// }