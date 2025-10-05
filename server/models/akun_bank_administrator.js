'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Akun_bank_administrator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Akun_bank_administrator.init({
    bank_name: DataTypes.STRING,
    account_bank_name: DataTypes.STRING,
    account_bank_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Akun_bank_administrator',
  });
  return Akun_bank_administrator;
};