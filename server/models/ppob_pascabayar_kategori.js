'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_pascabayar_kategori extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_pascabayar_kategori.hasMany(models.Ppob_pascabayar_produk, {
        foreignKey: "ppob_pascabayar_kategori_id",
        onDelete: "CASCADE",
      });
    }
  }
  Ppob_pascabayar_kategori.init({
    kode: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ppob_pascabayar_kategori',
  });
  return Ppob_pascabayar_kategori;
};