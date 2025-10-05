'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fasilitas_paket_la extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Fasilitas_paket_la.belongsTo(models.Paket_la, {
        foreignKey: "paket_la_id",
      });
      Fasilitas_paket_la.hasMany(models.Detail_fasilitas_paket_la, {
        foreignKey: "fasilitas_paket_la_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Fasilitas_paket_la.init({
    paket_la_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    total: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Fasilitas_paket_la',
  });
  return Fasilitas_paket_la;
};