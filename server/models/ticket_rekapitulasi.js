'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket_rekapitulasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_rekapitulasi.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Ticket_rekapitulasi.hasMany(models.Ticket_rekapitulasi_detail, {
        foreignKey: "ticket_rekapitulasi_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Ticket_rekapitulasi.init({
    division_id: DataTypes.INTEGER,
    registration_number: DataTypes.STRING,
    costumer_name: DataTypes.STRING,
    costumer_whatsapp_number: DataTypes.STRING,
    petugas: DataTypes.STRING,
    total_rekapitulasi: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ticket_rekapitulasi',
  });
  return Ticket_rekapitulasi;
};