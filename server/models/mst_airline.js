'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mst_airline extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mst_airline.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Mst_airline.hasMany(models.Ticket_transaction, {
        foreignKey: "airlines_id",
        onDelete: 'CASCADE',
      });
      Mst_airline.hasMany(models.Ticket_transaction_refund, {
        foreignKey: "airlines_id",
        onDelete: 'CASCADE',
      });
      Mst_airline.hasMany(models.Riwayat_deposit_airline, {
        foreignKey: "mst_airline_id",
        onDelete: 'CASCADE',
      });
    }
  }

      //   Ticket_transaction.belongsTo(models.Mst_airline, {
      //   foreignKey: "airlines_id",
      // });
  Mst_airline.init({
    company_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    nomor_akun_deposit: DataTypes.STRING,
    nomor_akun_pendapatan: DataTypes.STRING,
    nomor_akun_hpp: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Mst_airline',
  });
  return Mst_airline;
};