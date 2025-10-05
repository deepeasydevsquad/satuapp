'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_pendidikan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_pendidikan.hasMany(models.Jamaah, {
        foreignKey: "last_education",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_pendidikan.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_pendidikan',
  });
  return Mst_pendidikan;
};