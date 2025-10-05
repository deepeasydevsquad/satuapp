'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fee_agen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Fee_agen.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Fee_agen.belongsTo(models.Agen, {
        foreignKey: "agen_id",
      });
      Fee_agen.belongsTo(models.Pembayaran_fee_agen, {
        foreignKey: "pembayaran_fee_agen_id",
      });
      Fee_agen.hasMany(models.Tabungan, {
        foreignKey: "fee_agen_id",
        onDelete: 'CASCADE',
      });
      Fee_agen.hasMany(models.Paket_transaction, {
        foreignKey: "fee_agen_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Fee_agen.init({
    company_id: DataTypes.INTEGER,
    agen_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    nominal: DataTypes.INTEGER,
    status_bayar: DataTypes.ENUM(['lunas','belum_lunas']),
    info: DataTypes.TEXT,
    pembayaran_fee_agen_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Fee_agen',
  });
  return Fee_agen;
};