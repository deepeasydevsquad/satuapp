"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Skema_peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Skema_peminjaman.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Skema_peminjaman.belongsTo(models.Peminjaman, {
        foreignKey: "peminjaman_id",
      });
    }
  }
  Skema_peminjaman.init(
    {
      division_id: DataTypes.INTEGER,
      peminjaman_id: DataTypes.INTEGER,
      term: DataTypes.INTEGER,
      nominal: DataTypes.INTEGER,
      duedate: DataTypes.DATEONLY,
    },
    {
      sequelize,
      modelName: "Skema_peminjaman",
    }
  );
  return Skema_peminjaman;
};
