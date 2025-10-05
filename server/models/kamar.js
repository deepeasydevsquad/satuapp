'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kamar.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Kamar.belongsTo(models.Mst_hotel, {
        foreignKey: "hotel_id",
      });
      Kamar.hasMany(models.Kamar_jamaah, {
        foreignKey: "kamar_id",
        onDelete: "CASCADE",
      });
    }
  }
  Kamar.init({
    company_id: DataTypes.INTEGER,
    hotel_id: DataTypes.INTEGER,
    tipe_kamar: DataTypes.ENUM(['laki_laki','perempuan']),
    kapasitas_kamar: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Kamar',
  });
  return Kamar;
};