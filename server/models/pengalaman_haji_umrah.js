'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengalaman_haji_umrah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pengalaman_haji_umrah.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pengalaman_haji_umrah',
  });
  return Pengalaman_haji_umrah;
};