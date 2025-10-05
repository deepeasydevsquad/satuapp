'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Otp.init({
    otp_code: DataTypes.STRING,
    expired_time: DataTypes.DATE,
    mobile_number: DataTypes.STRING,
    otp_type: DataTypes.ENUM(['registration','login']),
    otp_status: DataTypes.ENUM(['active','inactive']),
    user_type: DataTypes.ENUM(['amra_app','company'])
  }, {
    sequelize,
    modelName: 'Otp',
  });
  return Otp;
};