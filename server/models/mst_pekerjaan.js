'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_pekerjaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_pekerjaan.hasMany(models.Jamaah, {
        foreignKey: "mst_pekerjaan_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_pekerjaan.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_pekerjaan',
  });
  return Mst_pekerjaan;
};