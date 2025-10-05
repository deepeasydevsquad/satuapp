'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction_fasilitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction_fasilitas.hasMany(models.Transaction_fasilitas_detail, {
        foreignKey: "transaction_fasilitas_id",
        onDelete: 'CASCADE',
      });
      Transaction_fasilitas.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
      Transaction_fasilitas.belongsTo(models.Tabungan, {
        foreignKey: "tabungan_id",
      });
      Transaction_fasilitas.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
      Transaction_fasilitas.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
    }
  }
  Transaction_fasilitas.init({
    division_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    kostumer_id: DataTypes.INTEGER,
    tabungan_id: DataTypes.INTEGER,
    paket_id: DataTypes.INTEGER,
    petugas: DataTypes.STRING,
    total: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaction_fasilitas',
  });
  return Transaction_fasilitas;
};