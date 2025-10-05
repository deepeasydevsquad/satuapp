'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paket_price extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paket_price.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
      Paket_price.belongsTo(models.Mst_paket_type, {
        foreignKey: "mst_paket_type_id",
      });
    }
  }
  Paket_price.init({
    paket_id: DataTypes.INTEGER,
    mst_paket_type_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Paket_price',
  });
  return Paket_price;
};