'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kabupaten_kota extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kabupaten_kota.belongsTo(models.Provinsi, {
        foreignKey: "provinsi_id",
      });
      Kabupaten_kota.hasMany(models.Kecamatan, {
        foreignKey: "kabupaten_kota_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Kabupaten_kota.init({
    provinsi_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Kabupaten_kota',
  });
  return Kabupaten_kota;
};