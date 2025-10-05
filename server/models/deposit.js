"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Deposit.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Deposit.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
    }
  }
  Deposit.init(
    {
      division_id: DataTypes.INTEGER,
      member_id: DataTypes.INTEGER,
      invoice: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
      saldo_sebelum: DataTypes.INTEGER,
      saldo_sesudah: DataTypes.INTEGER,
      sumber_dana: DataTypes.ENUM(["cash", "deposit"]),
      penerima: DataTypes.STRING,
      tipe_transaksi: DataTypes.ENUM([
        "deposit",
        "pindah_ke_tabungan",
        "sisa_pembelian_paket",
        "pembelian_ppob",
      ]),
      info: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Deposit",
    }
  );
  return Deposit;
};
