'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_prabayar_markup_company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_prabayar_markup_company.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Ppob_prabayar_markup_company.belongsTo(models.Ppob_prabayar_produk, {
        foreignKey: "ppob_prabayar_produk_id",
      });
    }
  }
  Ppob_prabayar_markup_company.init({
    company_id: DataTypes.INTEGER,
    ppob_prabayar_produk_id: DataTypes.INTEGER,
    markup: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ppob_prabayar_markup_company',
  });
  return Ppob_prabayar_markup_company;
};