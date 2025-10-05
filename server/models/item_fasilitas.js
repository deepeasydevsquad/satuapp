'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item_fasilitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item_fasilitas.belongsTo(models.Mst_fasilitas, {
        foreignKey: "mst_fasilitas_id",
      });
      Item_fasilitas.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Item_fasilitas.hasMany(models.Transaction_fasilitas_detail, {
        foreignKey: "item_fasilitas_id",
        onDelete: 'CASCADE',
      });
      Item_fasilitas.hasMany(models.Handover_fasilitas_detail, {
        foreignKey: "item_fasilitas_id",
        onDelete: 'CASCADE',
      });
      Item_fasilitas.hasMany(models.Handover_fasilitas_detail, {
        foreignKey: "item_fasilitas_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Item_fasilitas.init({
    division_id: DataTypes.INTEGER,
    item_code: DataTypes.STRING,
    mst_fasilitas_id: DataTypes.INTEGER,
    status: DataTypes.ENUM(['terjual',"belum_terjual"]),
    harga_beli: DataTypes.INTEGER,
    harga_jual: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Item_fasilitas',
  });
  return Item_fasilitas;
};