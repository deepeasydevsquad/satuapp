'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Passport_transaction_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Passport_transaction_detail.belongsTo(models.Passport_transaction, {
        foreignKey: "passport_transaction_id",
      });
      Passport_transaction_detail.belongsTo(models.Mst_kota, {
        foreignKey: "mst_kota_id",
      });
    }
  }
  Passport_transaction_detail.init({
    passport_transaction_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    birth_date: DataTypes.DATE,
    birth_place: DataTypes.STRING,
    identity_number: DataTypes.STRING,
    kk_number: DataTypes.STRING,
    mst_kota_id: DataTypes.INTEGER,
    address: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    priceCostumer: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Passport_transaction_detail',
  });
  return Passport_transaction_detail;
};