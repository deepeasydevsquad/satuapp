'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_transaction_prabayar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_transaction_prabayar.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Ppob_transaction_prabayar.belongsTo(models.Ppob_prabayar_produk, {
        foreignKey: "ppob_prabayar_produk_id",
      });
    }
  }
  Ppob_transaction_prabayar.init({
    company_id: DataTypes.INTEGER,
    ppob_prabayar_produk_id: DataTypes.INTEGER,
    transaction_code: DataTypes.STRING,
    nomor_tujuan: DataTypes.STRING,
    price: DataTypes.INTEGER,
    application_price: DataTypes.INTEGER,
    company_price: DataTypes.INTEGER,
    status: DataTypes.ENUM(['process', 'success', 'failed'])
  }, {
    sequelize,
    modelName: 'Ppob_transaction_prabayar',
  });
  return Ppob_transaction_prabayar;
};

// ('process', 'success', 'failed')