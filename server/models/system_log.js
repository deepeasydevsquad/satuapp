'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class System_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      System_log.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
    }
  }
  System_log.init({
    msg: DataTypes.TEXT,
    company_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    log_ip: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'System_log',
  });
  return System_log;
};