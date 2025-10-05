'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Refund_tabungan extends Model {
    static associate(models) {
      Refund_tabungan.belongsTo(models.Tabungan, {
        foreignKey: "tabungan_id",
      });
    }
  }
  Refund_tabungan.init({
    invoice: DataTypes.STRING,
    tabungan_id: DataTypes.INTEGER,
    nominal_ditahan: DataTypes.INTEGER,
    nominal_refund: DataTypes.INTEGER,
    petugas_refund: DataTypes.STRING,
    info: DataTypes.TEXT,
    saldo_tabungan_sebelum: DataTypes.INTEGER,
    saldo_tabungan_sesudah: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Refund_tabungan',
  });
  return Refund_tabungan;
};