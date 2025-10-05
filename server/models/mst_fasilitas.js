'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_fasilitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_fasilitas.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_fasilitas.hasMany(models.Handover_fasilitas_detail, {
        foreignKey: "mst_fasilitas_id",
        onDelete: 'CASCADE',
      });
      Mst_fasilitas.hasMany(models.Handover_fasilitas_detail_paket, {
        foreignKey: "mst_fasilitas_id",
        onDelete: 'CASCADE',
      });
      Mst_fasilitas.hasMany(models.Item_fasilitas, {
        foreignKey: "mst_fasilitas_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_fasilitas.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING, 
    nomor_akun_aset: DataTypes.STRING,
    nomor_akun_hpp: DataTypes.STRING,
    nomor_akun_pendapatan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_fasilitas',
  });
  return Mst_fasilitas;
};