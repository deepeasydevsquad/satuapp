'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tabungan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tabungan.belongsTo(models.Jamaah, {
        foreignKey: "jamaah_id",
      });
      Tabungan.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Tabungan.belongsTo(models.Paket, {
        foreignKey: "target_paket_id",
      });
      Tabungan.hasMany(models.Riwayat_tabungan, {
        foreignKey: "tabungan_id",
        onDelete: 'CASCADE',
      });
      Tabungan.hasMany(models.Refund_tabungan, {
        foreignKey: "tabungan_id",
        onDelete: 'CASCADE',
      });
      Tabungan.belongsTo(models.Fee_agen, {
        foreignKey: "fee_agen_id",
      });
      Tabungan.hasMany(models.Handover_fasilitas, {
        foreignKey: "tabungan_id",
        onDelete: 'CASCADE',
      });
      Tabungan.hasMany(models.Handover_barang, {
        foreignKey: "tabungan_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Tabungan.init({
    division_id: DataTypes.INTEGER,
    jamaah_id: DataTypes.INTEGER,
    target_paket_id: DataTypes.INTEGER,
    total_tabungan: DataTypes.INTEGER,
    status: DataTypes.ENUM(['active', 'non_active']),
    fee_agen_id: DataTypes.INTEGER,
    batal_berangkat: DataTypes.ENUM(['ya', 'tidak']),
    paket_transaction_id: DataTypes.INTEGER,
    sisa_pembelian: DataTypes.INTEGER,
    invoice_sisa_deposit: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tabungan',
  });
  return Tabungan;
};