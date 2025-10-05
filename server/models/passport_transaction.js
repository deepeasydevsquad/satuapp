'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Passport_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Passport_transaction.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Passport_transaction.hasMany(models.Passport_transaction_detail, {
        foreignKey: "passport_transaction_id",
        onDelete: 'CASCADE',
      });
      Passport_transaction.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
    }
  }
  Passport_transaction.init({
    division_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    petugas: DataTypes.STRING,
    kostumer_id: DataTypes.INTEGER,
    paket_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Passport_transaction',
  });
  return Passport_transaction;
};