'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Level_keagenan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Level_keagenan.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Level_keagenan.hasMany(models.Agen, {
        foreignKey: "level_keagenan_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Level_keagenan.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    level: DataTypes.INTEGER,
    default_fee: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Level_keagenan',
  });
  return Level_keagenan;
};