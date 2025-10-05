'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kostumer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kostumer.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Kostumer.hasMany(models.Paket_la, {
        foreignKey: "kostumer_id",
        onDelete: 'CASCADE',
      });
      Kostumer.hasMany(models.Transport_transaction, {
        foreignKey: "kostumer_id",
        onDelete: 'CASCADE',
      });
      Kostumer.hasMany(models.Hotel_transaction, {
        foreignKey: "kostumer_id",
        onDelete: 'CASCADE',
      });
      Kostumer.hasMany(models.Passport_transaction, {
        foreignKey: "kostumer_id",
        onDelete: 'CASCADE',
      });
      Kostumer.hasMany(models.Visa_transaction, {
        foreignKey: "kostumer_id",
        onDelete: 'CASCADE',
      });
      Kostumer.hasMany(models.Ticket_transaction, {
        foreignKey: "kostumer_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Kostumer.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    address: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Kostumer',
  });
  return Kostumer;
};