'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kamar_jamaah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kamar_jamaah.belongsTo(models.Kamar, {
        foreignKey: "kamar_id",
      });
      Kamar_jamaah.belongsTo(models.Paket_transaction, {
        foreignKey: "paket_transaction_id",
      });
    }
  }
  Kamar_jamaah.init({
    kamar_id: DataTypes.INTEGER,
    paket_transaction_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Kamar_jamaah',
  });
  return Kamar_jamaah;
};