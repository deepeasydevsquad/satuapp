'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pembayaran_gaji extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pembayaran_gaji.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Pembayaran_gaji.belongsTo(models.User, {
        foreignKey: "user_id",
      });
    }
  }
  Pembayaran_gaji.init({
    division_id: DataTypes.INTEGER,
    sumber_dana: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    nominal: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pembayaran_gaji',
  });
  return Pembayaran_gaji;
};