'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_asuransi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_asuransi.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_asuransi.hasMany(models.Paket, {
        foreignKey: "asuransi_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_asuransi.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_asuransi',
  });
  return Mst_asuransi;
};