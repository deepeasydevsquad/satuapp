'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Whatsapp_setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Whatsapp_setting.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  Whatsapp_setting.init({
    company_id: DataTypes.INTEGER,
    device_key: DataTypes.STRING,
    api_key: DataTypes.TEXT,
    whatsapp_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Whatsapp_setting',
  });
  return Whatsapp_setting;
};