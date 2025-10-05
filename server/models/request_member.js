'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Request_member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Request_member.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Request_member.belongsTo(models.Agen, {
        foreignKey: "agen_id",
      });
      Request_member.belongsTo(models.Kelurahan, {
        foreignKey: "kelurahan_id",
      });
    }
  }
  Request_member.init({
    division_id: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    identity_number: DataTypes.STRING,
    identity_type: DataTypes.ENUM(['ktp','passport']),
    gender: DataTypes.ENUM(['laki_laki','perempuan']),
    photo: DataTypes.STRING,
    birth_date: DataTypes.DATEONLY,
    birth_place: DataTypes.STRING,
    whatsapp_number: DataTypes.STRING,
    password: DataTypes.STRING,
    agen_id: DataTypes.INTEGER,
    address: DataTypes.TEXT,
    kelurahan_id: DataTypes.BIGINT,
    status: DataTypes.ENUM(['process','approved','rejected']),
  }, {
    sequelize,
    modelName: 'Request_member',
  });
  return Request_member;
};