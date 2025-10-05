'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction_fasilitas_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction_fasilitas_detail.belongsTo(models.Item_fasilitas, {
        foreignKey: "item_fasilitas_id",
      });
      Transaction_fasilitas_detail.belongsTo(models.Transaction_fasilitas, {
        foreignKey: "transaction_fasilitas_id",
      });
    }
  }
  Transaction_fasilitas_detail.init({
    transaction_fasilitas_id: DataTypes.INTEGER,
    item_fasilitas_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaction_fasilitas_detail',
  });
  return Transaction_fasilitas_detail;
};