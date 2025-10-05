'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Handover_fasilitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Handover_fasilitas.belongsTo(models.Tabungan, {
        foreignKey: "tabungan_id",
      });
      Handover_fasilitas.hasMany(models.Handover_fasilitas_detail, {
        foreignKey: "handover_fasilitas_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Handover_fasilitas.init({
    tabungan_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    petugas: DataTypes.STRING,
    penerima: DataTypes.STRING,
    nomor_identitas_penerima: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Handover_fasilitas',
  });
  return Handover_fasilitas;
};