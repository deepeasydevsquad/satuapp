'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bus.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Bus.belongsTo(models.Mst_kota, {
        foreignKey: "city_id",
      });
      Bus.hasMany(models.Bus_jamaah, {
        foreignKey: "bus_id",
        onDelete: "CASCADE",
      });
    }
  }
  Bus.init({
    company_id: DataTypes.INTEGER,
    bus_number: DataTypes.STRING,
    kapasitas_bus: DataTypes.INTEGER,
    bus_leader: DataTypes.STRING,
    city_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bus',
  });
  return Bus;
};