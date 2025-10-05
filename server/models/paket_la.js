'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paket_la extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Paket_la.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Paket_la.belongsTo(models.Kostumer, {
        foreignKey: "kostumer_id",
      });
      Paket_la.hasMany(models.Fasilitas_paket_la, {
        foreignKey: "paket_la_id",
        onDelete: 'CASCADE',
      });
      Paket_la.hasMany(models.Paket_la_transaction, {
        foreignKey: "paket_la_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Paket_la.init({
    division_id: DataTypes.INTEGER,
    register_number: DataTypes.STRING,
    kostumer_id: DataTypes.INTEGER,
    client_name: DataTypes.STRING,
    client_hp_number: DataTypes.STRING,
    client_address: DataTypes.STRING,
    status: DataTypes.ENUM(['active', 'cancel', 'close']),
    discount: DataTypes.INTEGER,
    total_price: DataTypes.INTEGER,
    total_jamaah: DataTypes.INTEGER,
    departure_date: DataTypes.DATE,
    arrival_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Paket_la',
  });
  return Paket_la;
};