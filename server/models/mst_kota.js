'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_kota extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_kota.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_kota.hasMany(models.Mst_hotel, {
        foreignKey: "kota_id",
        onDelete: 'CASCADE',
      });
      Mst_kota.hasMany(models.Division, {
        foreignKey: "kota_id",
        onDelete: 'CASCADE',
      });
      Mst_kota.hasMany(models.Passport_transaction_detail, {
        foreignKey: "mst_kota_id",
        onDelete: 'CASCADE',
      });
      Mst_kota.hasMany(models.Bus, {
        foreignKey: "city_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_kota.init({
    company_id: DataTypes.INTEGER,
    kode: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_kota',
  });
  return Mst_kota;
};