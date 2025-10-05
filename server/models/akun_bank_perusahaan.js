'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Akun_bank_perusahaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Akun_bank_perusahaan.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Akun_bank_perusahaan.belongsTo(models.Mst_bank, {
        foreignKey: "mst_bank_id",
      });
      Akun_bank_perusahaan.hasMany(models.Request_deposit_member, {
        foreignKey: "akun_bank_perusahaan_id",
        onDelete: "CASCADE",
      });
    }
  }
  Akun_bank_perusahaan.init({
    company_id: DataTypes.INTEGER,
    mst_bank_id: DataTypes.INTEGER,
    nomor_akun: DataTypes.STRING,
    nama_akun: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Akun_bank_perusahaan',
  });
  return Akun_bank_perusahaan;
};