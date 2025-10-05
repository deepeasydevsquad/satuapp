'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kas_keluar_masuk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kas_keluar_masuk.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
    }
  }
  Kas_keluar_masuk.init({
    division_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    dibayar_diterima: DataTypes.STRING,
    petugas: DataTypes.STRING,
    status_kwitansi: DataTypes.ENUM(['keluar','masuk'])
  }, {
    sequelize,
    modelName: 'Kas_keluar_masuk',
  });
  return Kas_keluar_masuk;
};