'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_provider extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_provider.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_provider.hasMany(models.Paket, {
        foreignKey: "provider_visa_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_provider.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_provider',
  });
  return Mst_provider;
};