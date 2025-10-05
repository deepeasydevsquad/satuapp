'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_pascabayar_produk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_pascabayar_produk.belongsTo(models.Ppob_pascabayar_kategori, {
        foreignKey: "ppob_pascabayar_kategori_id",
      });
      Ppob_pascabayar_produk.hasMany(models.Ppob_pascabayar_markup_company, {
        foreignKey: "ppob_pascabayar_produk_id",
        onDelete: "CASCADE",
      });
      Ppob_pascabayar_produk.hasMany(models.Ppob_transaction_pascabayar, {
        foreignKey: "ppob_pascabayar_produk_id",
        onDelete: "CASCADE",
      });
    }
  }
  Ppob_pascabayar_produk.init({
    ppob_pascabayar_kategori_id: DataTypes.INTEGER,
    kode: DataTypes.STRING,
    name: DataTypes.STRING,
    fee: DataTypes.INTEGER,
    markup: DataTypes.INTEGER,
    status: DataTypes.ENUM(['active', 'inactive']),
  }, {
    sequelize,
    modelName: 'Ppob_pascabayar_produk',
  });
  return Ppob_pascabayar_produk;
};