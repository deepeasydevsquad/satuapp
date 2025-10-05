"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_deposit_company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction_deposit_company.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Transaction_deposit_company.init(
    {
      company_id: DataTypes.INTEGER,
      transaction_code: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
      type_transaction: DataTypes.ENUM(["deposit", "ppob"]),
      ket: DataTypes.TEXT,
      status: DataTypes.ENUM(["process", "approved", "rejected"]),
    },
    {
      sequelize,
      modelName: "Transaction_deposit_company",
    }
  );
  return Transaction_deposit_company;
};
