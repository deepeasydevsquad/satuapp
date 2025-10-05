'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ppob_prabayar_kategori extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ppob_prabayar_kategori.hasMany(models.Ppob_prabayar_operator, {
        foreignKey: "ppob_prabayar_kategori_id",
        onDelete: "CASCADE",
      });
    }
  }
  Ppob_prabayar_kategori.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    status: DataTypes.ENUM(['tersedia','tidak tersedia']),
  }, {
    sequelize,
    modelName: 'Ppob_prabayar_kategori',
  });
  return Ppob_prabayar_kategori;
};