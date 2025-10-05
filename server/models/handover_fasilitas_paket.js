'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Handover_fasilitas_paket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Handover_fasilitas_paket.hasMany(models.Handover_fasilitas_detail_paket, {
        foreignKey: "handover_fasilitas_paket_id",
        onDelete: 'CASCADE',
      });
      Handover_fasilitas_paket.belongsTo(models.Paket_transaction, {
        foreignKey: "paket_transaction_id",
      });
    }
  }
  Handover_fasilitas_paket.init({
    paket_transaction_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    petugas: DataTypes.STRING,
    penerima: DataTypes.STRING,
    nomor_identitas_penerima: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Handover_fasilitas_paket',
  });
  return Handover_fasilitas_paket;
};