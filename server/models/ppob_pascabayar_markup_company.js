'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_pascabayar_markup_company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_pascabayar_markup_company.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Ppob_pascabayar_markup_company.belongsTo(models.Ppob_pascabayar_produk, {
        foreignKey: "ppob_pascabayar_produk_id",
      });
    }
  }
  Ppob_pascabayar_markup_company.init({
    company_id: DataTypes.INTEGER,
    ppob_pascabayar_produk_id: DataTypes.INTEGER,
    markup: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ppob_pascabayar_markup_company',
  });
  return Ppob_pascabayar_markup_company;
};