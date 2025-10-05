'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Riwayat_surat_menyurat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Riwayat_surat_menyurat.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Riwayat_surat_menyurat.init({
    company_id: DataTypes.INTEGER,
    nomor_surat: DataTypes.STRING,
    tipe_surat: DataTypes.ENUM(['rekom_paspor', 'surat_cuti']),
    tanggal_surat: DataTypes.DATE,
    info: DataTypes.TEXT,
    tujuan: DataTypes.TEXT,
    nama_petugas: DataTypes.STRING,
    petugas_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Riwayat_surat_menyurat',
  });
  return Riwayat_surat_menyurat;
};