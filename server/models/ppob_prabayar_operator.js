"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ppob_prabayar_operator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_prabayar_operator.belongsTo(models.Ppob_prabayar_kategori, {
        foreignKey: "ppob_prabayar_kategori_id",
      });
      Ppob_prabayar_operator.hasMany(models.Ppob_prabayar_produk, {
        foreignKey: "ppob_prabayar_operator_id",
        onDelete: "CASCADE",
      });
    }
  }
  Ppob_prabayar_operator.init(
    {
      ppob_prabayar_kategori_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      status: DataTypes.ENUM(["tersedia", "tidak tersedia"]),
    },
    {
      sequelize,
      modelName: "Ppob_prabayar_operator",
    }
  );
  return Ppob_prabayar_operator;
};
