'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_prabayar_produk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_prabayar_produk.belongsTo(models.Ppob_prabayar_operator, {
        foreignKey: "ppob_prabayar_operator_id",
      });
      Ppob_prabayar_produk.hasMany(models.Ppob_prabayar_markup_company, {
        foreignKey: "ppob_prabayar_produk_id",
        onDelete: "CASCADE",
      });
      Ppob_prabayar_produk.hasMany(models.Ppob_transaction_prabayar, {
        foreignKey: "ppob_prabayar_produk_id",
        onDelete: "CASCADE",
      });
    }
  }
  Ppob_prabayar_produk.init({
    ppob_prabayar_operator_id: DataTypes.INTEGER,
    kode: DataTypes.STRING,
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    markup: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    status: DataTypes.ENUM(['tersedia', 'tidak tersedia']),
  }, {
    sequelize,
    modelName: 'Ppob_prabayar_produk',
  });
  return Ppob_prabayar_produk;
};