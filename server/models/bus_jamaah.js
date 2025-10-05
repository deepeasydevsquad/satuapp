'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bus_jamaah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bus_jamaah.belongsTo(models.Bus, {
        foreignKey: "bus_id",
      });
       Bus_jamaah.belongsTo(models.Paket_transaction, {
        foreignKey: "paket_transaction_id",
      });
    }
  }
  Bus_jamaah.init({
    bus_id: DataTypes.INTEGER,
    paket_transaction_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bus_jamaah',
  });
  return Bus_jamaah;
};