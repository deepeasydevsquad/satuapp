'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Whatsapp_message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Whatsapp_message.belongsTo(models.Division, {
        foreignKey: "division_id",
      });
      Whatsapp_message.belongsTo(models.Whatsapp_template, {
        foreignKey: "whatsapp_template_id",
      });
    }
  }
  Whatsapp_message.init({
    division_id: DataTypes.INTEGER,
    type: DataTypes.ENUM(['pesan_biasa','semua_jamaah','staff','jamaah_paket','jamaah_tabungan_umrah','jamaah_utang_koperasi','agen']),
    nomor_asal: DataTypes.STRING,
    pesan: DataTypes.TEXT,
    whatsapp_template_id: DataTypes.INTEGER,
    status: DataTypes.ENUM(['process','finish']),
  }, {
    sequelize,
    modelName: 'Whatsapp_message',
  });
  return Whatsapp_message;
};