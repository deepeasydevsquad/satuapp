'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paket_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paket_transaction.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Paket_transaction.belongsTo(models.Jamaah, {
        foreignKey: "jamaah_id",
      });
      Paket_transaction.belongsTo(models.Fee_agen, {
        foreignKey: "fee_agen_id",
      });
      Paket_transaction.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
      Paket_transaction.belongsTo(models.Mst_paket_type, {
        foreignKey: "mst_paket_type_id",
      });
      Paket_transaction.hasMany(models.Paket_transaction_payment_history, {
        foreignKey: "paket_transaction_id",
        onDelete: 'CASCADE',
      });
      Paket_transaction.hasMany(models.Handover_fasilitas_paket, {
        foreignKey: "paket_transaction_id",
        onDelete: 'CASCADE',
      });
      Paket_transaction.hasMany(models.Handover_barang_paket, {
        foreignKey: "paket_transaction_id",
        onDelete: 'CASCADE',
      });
      Paket_transaction.hasMany(models.Bus_jamaah, {
        foreignKey: "paket_transaction_id",
        onDelete: "CASCADE",
      });
      Paket_transaction.hasMany(models.Kamar_jamaah, {
        foreignKey: "paket_transaction_id",
        onDelete: "CASCADE",
      });
      Paket_transaction.hasMany(models.File_pendukung, {
        foreignKey: "paket_transaction_id",
        onDelete: "CASCADE",
      });
    }
  }
  Paket_transaction.init({
    division_id: DataTypes.INTEGER,
    jamaah_id: DataTypes.INTEGER,
    fee_agen_id: DataTypes.INTEGER,
    paket_id: DataTypes.INTEGER,
    mst_paket_type_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    nomor_visa: DataTypes.INTEGER,
    tanggal_berlaku_visa: DataTypes.DATEONLY,
    tanggal_berakhir_visa: DataTypes.DATEONLY,
    batal_berangkat: DataTypes.ENUM(['ya','tidak']),
    from: DataTypes.ENUM(['transaksi_paket','tabungan']),
    biaya_mahram: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Paket_transaction',
  });
  return Paket_transaction;
};