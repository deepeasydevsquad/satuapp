'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mahram extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mahram.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mahram.belongsTo(models.Jamaah, {
        foreignKey: "jamaah_id",
      });
      Mahram.belongsTo(models.Mst_mahram_type, {
        foreignKey: "mst_mahram_type_id",
      });
    }
  }
  Mahram.init({
    company_id: DataTypes.INTEGER,
    jamaah_id: DataTypes.INTEGER,
    mahram_id: DataTypes.INTEGER,
    mst_mahram_type_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mahram',
  });
  return Mahram;
};