'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transport_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transport_transaction.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Transport_transaction.hasMany(models.Transport_transaction_detail, {
        foreignKey: "transport_transaction_id",
        onDelete: "CASCADE",
      });
      Transport_transaction.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
      Transport_transaction.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
    }
  }
  Transport_transaction.init({
    division_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    petugas: DataTypes.STRING,
    kostumer_id: DataTypes.INTEGER,
    paket_id: DataTypes.INTEGER,
    address: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Transport_transaction',
  });
  return Transport_transaction;
};