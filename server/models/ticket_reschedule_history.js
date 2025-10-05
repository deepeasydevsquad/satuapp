'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket_reschedule_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_reschedule_history.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Ticket_reschedule_history.belongsTo(models.Ticket_transaction, {
        foreignKey: "ticket_transaction_id",
      });
      Ticket_reschedule_history.hasMany(models.Ticket_reschedule_detail_history, {
        foreignKey: "ticket_reschedule_history_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Ticket_reschedule_history.init({
    division_id: DataTypes.INTEGER,
    ticket_transaction_id: DataTypes.INTEGER,
    old_total_transaction: DataTypes.INTEGER,
    new_total_transaction: DataTypes.INTEGER,
    invoice: DataTypes.STRING,
    costumer_name: DataTypes.STRING,
    costumer_identity: DataTypes.STRING,
    petugas: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ticket_reschedule_history',
  });
  return Ticket_reschedule_history;
};