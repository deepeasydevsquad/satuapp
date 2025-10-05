'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Handover_fasilitas_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Handover_fasilitas_detail.belongsTo(models.Handover_fasilitas, {
        foreignKey: "handover_fasilitas_id",
      });
      Handover_fasilitas_detail.belongsTo(models.Item_fasilitas, {
        foreignKey: "item_fasilitas_id",
      });
    }
  }
  Handover_fasilitas_detail.init({
    handover_fasilitas_id: DataTypes.INTEGER,
    item_fasilitas_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Handover_fasilitas_detail',
  });
  return Handover_fasilitas_detail;
};