'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscribtion_payment_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscribtion_payment_history.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Subscribtion_payment_history.init({
    company_id: DataTypes.INTEGER,
    order_id: DataTypes.TEXT,
    status: DataTypes.ENUM(['process', 'accept', 'reject']),
    duration: DataTypes.INTEGER,
    pay_per_month: DataTypes.INTEGER,
    start_date_subscribtion: DataTypes.DATE,
    end_date_subscribtion: DataTypes.DATE,
    transaction_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Subscribtion_payment_history',
  });
  return Subscribtion_payment_history;
};