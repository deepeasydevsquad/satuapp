'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Konfigurasi_surat_menyurat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Konfigurasi_surat_menyurat.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Konfigurasi_surat_menyurat.init({
    company_id: DataTypes.INTEGER,
    nama_tanda_tangan: DataTypes.STRING,
    jabatan_tanda_tangan: DataTypes.STRING,
    alamat_tanda_tangan: DataTypes.TEXT,
    nama_perusahaan: DataTypes.TEXT,
    izin_perusahaan: DataTypes.TEXT,
    kota_perusahaan: DataTypes.STRING,
    provinsi_perusahaan: DataTypes.STRING,
    alamat_perusahaan: DataTypes.TEXT,
    no_kontak_perusahaan: DataTypes.STRING,
    website_perusahaan: DataTypes.TEXT,
    email_perusahaan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Konfigurasi_surat_menyurat',
  });
  return Konfigurasi_surat_menyurat;
};