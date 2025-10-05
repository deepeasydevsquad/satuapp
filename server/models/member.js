'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Member.hasMany(models.User, {
        foreignKey: "member_id",
        onDelete: 'CASCADE',
      });
      Member.hasMany(models.Agen, {
        foreignKey: "member_id",
        onDelete: 'CASCADE',
      });
      Member.hasMany(models.Deposit, {
        foreignKey: "member_id",
        onDelete: 'CASCADE',
      });
      Member.hasMany(models.Jamaah, {
        foreignKey: "member_id",
        onDelete: 'CASCADE',
      });
      Member.hasMany(models.Request_deposit_member, {
        foreignKey: "member_id",
        onDelete: "CASCADE",
      });
    }
  }
  Member.init({
    division_id: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    identity_number: DataTypes.STRING,
    identity_type: DataTypes.ENUM(['ktp','passport']),
    gender: DataTypes.ENUM(['laki_laki','perempuan']),
    photo: DataTypes.STRING,
    birth_date: DataTypes.DATE,
    birth_place: DataTypes.STRING,
    whatsapp_number: DataTypes.STRING,
    total_deposit: DataTypes.INTEGER,
    total_tabungan: DataTypes.INTEGER,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};