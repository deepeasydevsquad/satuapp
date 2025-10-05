'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Supplier.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Supplier.belongsTo(models.Mst_bank, {
        foreignKey: "bank_id",
      });
    }
  }
  Supplier.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    address: DataTypes.TEXT,
    bank_id: DataTypes.INTEGER,
    nomor_rekening: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Supplier',
  });
  return Supplier;
};