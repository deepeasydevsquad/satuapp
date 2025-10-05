'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket_transaction_refund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_transaction_refund.belongsTo(models.Ticket_transaction, {
        foreignKey: "ticket_transaction_id",
      });
      Ticket_transaction_refund.belongsTo(models.Mst_airline, {
        foreignKey: "airlines_id",
      });
    }
  }
  Ticket_transaction_refund.init({
    ticket_transaction_id: DataTypes.INTEGER,
    pax: DataTypes.INTEGER,
    code_booking: DataTypes.STRING,
    airlines_id: DataTypes.INTEGER,
    departure_date: DataTypes.DATEONLY,
    travel_price: DataTypes.INTEGER,
    costumer_price: DataTypes.INTEGER,
    refund: DataTypes.INTEGER,
    fee: DataTypes.INTEGER,
    petugas: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ticket_transaction_refund',
  });
  return Ticket_transaction_refund;
};