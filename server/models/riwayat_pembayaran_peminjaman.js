"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Riwayat_pembayaran_peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Riwayat_pembayaran_peminjaman.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Riwayat_pembayaran_peminjaman.belongsTo(models.Peminjaman, {
        foreignKey: "peminjaman_id",
      });
    }
  }
  Riwayat_pembayaran_peminjaman.init(
    {
      division_id: DataTypes.INTEGER,
      peminjaman_id: DataTypes.INTEGER,
      invoice: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
      status: DataTypes.ENUM(["dp", "cicilan"]),
      petugas: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Riwayat_pembayaran_peminjaman",
    }
  );
  return Riwayat_pembayaran_peminjaman;
};
