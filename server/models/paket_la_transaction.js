'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paket_la_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paket_la_transaction.belongsTo(models.Paket_la, {
        foreignKey: "paket_la_id",
      });
      Paket_la_transaction.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Paket_la_transaction.init({
    company_id: DataTypes.INTEGER,
    paket_la_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    paid: DataTypes.INTEGER,
    status: DataTypes.ENUM(['payment', 'refund']),
    receiver: DataTypes.STRING,
    deposit_name: DataTypes.STRING,
    deposit_hp_number: DataTypes.STRING,
    deposit_address: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Paket_la_transaction',
  });
  return Paket_la_transaction;
};