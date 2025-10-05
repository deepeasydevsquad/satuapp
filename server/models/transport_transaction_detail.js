'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transport_transaction_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transport_transaction_detail.belongsTo(models.Transport_transaction, {
        foreignKey: "transport_transaction_id",
      });
      Transport_transaction_detail.belongsTo(models.Mst_mobil, {
        foreignKey: "mst_mobil_id",
      });
    }
  }
  Transport_transaction_detail.init({
    transport_transaction_id: DataTypes.INTEGER,
    mst_mobil_id: DataTypes.INTEGER,
    car_number: DataTypes.STRING,
    travel_price: DataTypes.INTEGER,
    costumer_price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transport_transaction_detail',
  });
  return Transport_transaction_detail;
};