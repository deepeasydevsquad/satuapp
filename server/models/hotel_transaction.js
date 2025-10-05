"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Hotel_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hotel_transaction.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Hotel_transaction.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
      Hotel_transaction.belongsTo(models.Paket, {
        foreignKey: "paket_id",
      });
      Hotel_transaction.belongsTo(models.Mst_hotel, {
        foreignKey: "mst_hotel_id",
      });
    }
  }
  Hotel_transaction.init(
    {
      division_id: DataTypes.INTEGER,
      kostumer_id: DataTypes.INTEGER,
      paket_id: DataTypes.INTEGER,
      mst_hotel_id: DataTypes.INTEGER,
      invoice: DataTypes.STRING,
      petugas: DataTypes.STRING,
      check_in: DataTypes.DATEONLY,
      check_out: DataTypes.DATEONLY,
      tipe_kamar: DataTypes.STRING,
      jumlah_hari: DataTypes.INTEGER,
      jumlah_kamar: DataTypes.INTEGER,
      harga_travel_kamar_per_hari: DataTypes.INTEGER,
      harga_kostumer_kamar_per_hari: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Hotel_transaction",
    }
  );
  return Hotel_transaction;
};
