"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pembayaran_fee_agen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pembayaran_fee_agen.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Pembayaran_fee_agen.belongsTo(models.Agen, {
        foreignKey: "agen_id",
      });
      Pembayaran_fee_agen.hasMany(models.Fee_agen, {
        foreignKey: "pembayaran_fee_agen_id",
        onDelete: "CASCADE",
      });
    }
  }
  Pembayaran_fee_agen.init(
    {
      division_id: DataTypes.INTEGER,
      agen_id: DataTypes.INTEGER,
      invoice: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
      applicant_name: DataTypes.STRING,
      applicant_identity: DataTypes.STRING,
      penerima: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Pembayaran_fee_agen",
    }
  );
  return Pembayaran_fee_agen;
};
