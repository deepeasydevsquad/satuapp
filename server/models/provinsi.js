'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Provinsi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Provinsi.hasMany(models.Kabupaten_kota, {
        foreignKey: "provinsi_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Provinsi.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Provinsi',
  });
  return Provinsi;
};