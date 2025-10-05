'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detail_fasilitas_paket_la extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Detail_fasilitas_paket_la.belongsTo(models.Fasilitas_paket_la, {
        foreignKey: "fasilitas_paket_la_id",
      });
    }
  }
  Detail_fasilitas_paket_la.init({
    fasilitas_paket_la_id: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    check_in: DataTypes.DATE,
    check_out: DataTypes.DATE,
    day: DataTypes.INTEGER,
    pax: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Detail_fasilitas_paket_la',
  });
  return Detail_fasilitas_paket_la;
};