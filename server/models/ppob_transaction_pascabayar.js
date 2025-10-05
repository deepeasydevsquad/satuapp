'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_transaction_pascabayar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_transaction_pascabayar.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Ppob_transaction_pascabayar.belongsTo(models.Ppob_pascabayar_produk, {
        foreignKey: "ppob_pascabayar_produk_id",
      });
    }
  }
  Ppob_transaction_pascabayar.init({
    company_id: DataTypes.INTEGER,
    ppob_pascabayar_produk_id: DataTypes.INTEGER,
    transaction_code: DataTypes.STRING,
    nomor_tujuan: DataTypes.STRING,
    price: DataTypes.INTEGER,
    application_price: DataTypes.INTEGER,
    company_price: DataTypes.INTEGER,
    status: DataTypes.ENUM(['process', 'success', 'failed'])
  }, {
    sequelize,
    modelName: 'Ppob_transaction_pascabayar',
  });
  return Ppob_transaction_pascabayar;
};