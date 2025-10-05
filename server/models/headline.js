'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Headline extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Headline.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Headline.init({
    company_id: DataTypes.INTEGER,
    headline: DataTypes.TEXT,
    tampilkan: DataTypes.ENUM(['Ya', 'Tidak']),
  }, {
    sequelize,
    modelName: 'Headline',
  });
  return Headline;
};