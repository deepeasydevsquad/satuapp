"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ticket_reschedule_detail_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket_reschedule_detail_history.belongsTo(
        models.Ticket_reschedule_history,
        {
          foreignKey: "ticket_reschedule_history_id",
        }
      );

      // Ticket_reschedule_detail_history.belongsTo(
      //   models.Ticket_transaction_detail,
      //   {
      //     foreignKey: "ticket_transaction_detail_id",
      //   }
      // );
    }
  }
  Ticket_reschedule_detail_history.init(
    {
      ticket_reschedule_history_id: DataTypes.INTEGER,
      // ticket_transaction_detail_id: DataTypes.INTEGER,
      old_departure_date: DataTypes.DATE,
      old_travel_price: DataTypes.INTEGER,
      old_costumer_price: DataTypes.INTEGER,
      old_code_booking: DataTypes.STRING,
      new_departure_date: DataTypes.DATE,
      new_travel_price: DataTypes.INTEGER,
      new_costumer_price: DataTypes.INTEGER,
      new_code_booking: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Ticket_reschedule_detail_history",
    }
  );
  return Ticket_reschedule_detail_history;
};
