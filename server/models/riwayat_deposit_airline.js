'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Riwayat_deposit_airline extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Riwayat_deposit_airline.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Riwayat_deposit_airline.belongsTo(models.Mst_airline, {
        foreignKey: "mst_airline_id",
      });
    }
  }
  // division_id: body.cabang,
  Riwayat_deposit_airline.init({
    division_id: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    sumber_dana: DataTypes.INTEGER,
    mst_airline_id: DataTypes.INTEGER,
    deposit: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Riwayat_deposit_airline',
  });
  return Riwayat_deposit_airline;
};