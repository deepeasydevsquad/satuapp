'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket_rekapitulasi_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_rekapitulasi_detail.belongsTo(models.Ticket_rekapitulasi, {
        foreignKey: "ticket_rekapitulasi_id",
      });
      Ticket_rekapitulasi_detail.belongsTo(models.Ticket_transaction, {
        foreignKey: "ticket_transaction_id",
      });
    }
  }
  Ticket_rekapitulasi_detail.init({
    ticket_rekapitulasi_id: DataTypes.INTEGER,
    ticket_transaction_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ticket_rekapitulasi_detail',
  });
  return Ticket_rekapitulasi_detail;
};