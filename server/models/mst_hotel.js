'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_hotel.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_hotel.belongsTo(models.Mst_kota, {
        foreignKey: "kota_id",
      });
      Mst_hotel.hasMany(models.Kamar, {
        foreignKey: "hotel_id",
        onDelete: 'CASCADE',
      });
      Mst_hotel.hasMany(models.Hotel_transaction, {
        foreignKey: "mst_hotel_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_hotel.init({
    company_id: DataTypes.INTEGER,
    kota_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    desc: DataTypes.TEXT,
    star: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mst_hotel',
  });
  return Mst_hotel;
};