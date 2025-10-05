"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Peminjaman.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Peminjaman.belongsTo(models.Jamaah, {
        foreignKey: "jamaah_id",
      });
      Peminjaman.hasMany(models.Riwayat_pembayaran_peminjaman, {
        foreignKey: "peminjaman_id",
        onDelete: "CASCADE",
      });
      Peminjaman.hasMany(models.Skema_peminjaman, {
        foreignKey: "peminjaman_id",
        onDelete: "CASCADE",
      });
    }
  }
  Peminjaman.init(
    {
      division_id: DataTypes.INTEGER,
      jamaah_id: DataTypes.INTEGER,
      register_number: DataTypes.STRING,
      status_peminjaman: DataTypes.ENUM(["lunas", "belum_lunas"]),
      nominal: DataTypes.INTEGER,
      tenor: DataTypes.INTEGER,
      dp: DataTypes.INTEGER,
      petugas: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Peminjaman",
    }
  );
  return Peminjaman;
};
