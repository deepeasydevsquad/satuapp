'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Handover_fasilitas_detail_paket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Handover_fasilitas_detail_paket.belongsTo(models.Handover_fasilitas_paket, {
        foreignKey: "handover_fasilitas_paket_id",
      });
      Handover_fasilitas_detail_paket.belongsTo(models.Item_fasilitas, {
        foreignKey: "item_fasilitas_id",
      });
    }
  }
  Handover_fasilitas_detail_paket.init({
    handover_fasilitas_paket_id: DataTypes.INTEGER,
    item_fasilitas_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Handover_fasilitas_detail_paket',
  });
  return Handover_fasilitas_detail_paket;
};