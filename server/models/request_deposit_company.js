"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Request_deposit_company extends Model {
    static associate(models) {
      Request_deposit_company.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Request_deposit_company.init(
    {
      company_id: DataTypes.INTEGER,
      request_code: DataTypes.STRING,
      bank: DataTypes.STRING,
      number_account_bank: DataTypes.STRING,
      name_account_bank: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
      nominal_code: DataTypes.INTEGER,
      sending_payment_status: DataTypes.ENUM([
        "sudah_dikirim",
        "belum_dikirim",
      ]),
      sending_payment_time: DataTypes.DATE,
      status: DataTypes.ENUM(["disetujui", "ditolak", "diproses"]),
      status_node: DataTypes.TEXT,
      petugas: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Request_deposit_company",
    }
  );
  return Request_deposit_company;
};
