'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Riwayat_tabungan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Riwayat_tabungan.belongsTo(models.Tabungan, {
        foreignKey: "tabungan_id",
      });
    }
  }
  Riwayat_tabungan.init({
    invoice: DataTypes.STRING,
    tabungan_id: DataTypes.INTEGER,
    nominal_tabungan: DataTypes.INTEGER,
    penerima: DataTypes.STRING,
    sumber_dana: DataTypes.ENUM(['deposit', 'cash']),
    saldo_tabungan_sebelum: DataTypes.INTEGER,
    saldo_tabungan_sesudah: DataTypes.INTEGER,
    info_tabungan: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Riwayat_tabungan',
  });
  return Riwayat_tabungan;
};