'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paket_transaction_payment_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paket_transaction_payment_history.belongsTo(models.Paket_transaction, {
        foreignKey: "paket_transaction_id",
      });
    }
  }
  Paket_transaction_payment_history.init({
    paket_transaction_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    nominal: DataTypes.INTEGER,
    penerima: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Paket_transaction_payment_history',
  });
  return Paket_transaction_payment_history;
};