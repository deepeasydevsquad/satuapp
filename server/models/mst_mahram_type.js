'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_mahram_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_mahram_type.hasMany(models.Mahram, {
        foreignKey: "mst_mahram_type_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_mahram_type.init({
    name: DataTypes.STRING,
    gender: DataTypes.ENUM(['laki_laki', 'perempuan'])
  }, {
    sequelize,
    modelName: 'Mst_mahram_type',
  });
  return Mst_mahram_type;
};