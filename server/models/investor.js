'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Investor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Investor.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
    }
  }
  Investor.init({
    division_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    identity_number: DataTypes.STRING,
    mobile_phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    invesment: DataTypes.INTEGER,
    stock: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Investor',
  });
  return Investor;
};