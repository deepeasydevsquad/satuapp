'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kecamatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kecamatan.belongsTo(models.Kabupaten_kota, {
        foreignKey: "kabupaten_kota_id",
      });
      Kecamatan.hasMany(models.Kelurahan, {
        foreignKey: "kecamatan_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Kecamatan.init({
    kabupaten_kota_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Kecamatan',
  });
  return Kecamatan;
};