'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visa_transaction extends Model {
    static associate(models) {
      Visa_transaction.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Visa_transaction.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
      Visa_transaction.belongsTo(models.Mst_visa_request_type, {
        foreignKey: "mst_visa_request_type_id",
      });
      Visa_transaction.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
    }
  }
  Visa_transaction.init({
    division_id: DataTypes.INTEGER,
    mst_visa_request_type_id: DataTypes.INTEGER,
    kostumer_id: DataTypes.INTEGER,
    paket_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    pax: DataTypes.INTEGER,
    harga_travel: DataTypes.INTEGER,
    harga_costumer: DataTypes.INTEGER,
    petugas: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Visa_transaction',
  });
  return Visa_transaction;
};