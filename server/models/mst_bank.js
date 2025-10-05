'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_bank.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_bank.hasMany(models.Akun_bank_perusahaan, {
        foreignKey: "mst_bank_id",
        onDelete: "CASCADE",
      });
    }
  }
  Mst_bank.init({
    company_id: DataTypes.INTEGER,
    kode: DataTypes.STRING,
    name: DataTypes.STRING, 
    nomor_akun: DataTypes.STRING, 
  }, {
    sequelize,
    modelName: 'Mst_bank',
  });
  return Mst_bank;
};