'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_visa_request_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_visa_request_type.hasMany(models.Visa_transaction, {
        foreignKey: "mst_visa_request_type_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Mst_visa_request_type.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mst_visa_request_type',
  });
  return Mst_visa_request_type;
};