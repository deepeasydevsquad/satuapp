'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Saldo_akun extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Saldo_akun.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Saldo_akun.belongsTo(models.Akun_secondary, {
        foreignKey: "akun_secondary_id",
      });
    }
  }
  Saldo_akun.init({
    division_id: DataTypes.INTEGER,
    akun_secondary_id: DataTypes.INTEGER,
    saldo: DataTypes.INTEGER,
    periode: DataTypes.INTEGER,
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Saldo_akun',
  });
  return Saldo_akun;
};