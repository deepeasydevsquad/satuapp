"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Whatsapp_template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Whatsapp_template.belongsTo(models.Company, {
        foreignKey: "company_id",
      });
      Whatsapp_template.hasMany(models.Whatsapp_message, {
        foreignKey: "whatsapp_template_id",
        onDelete: "CASCADE",
      });
    }
  }
  Whatsapp_template.init(
    {
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      type: DataTypes.ENUM([
        "pesan_biasa",
        "semua_jamaah",
        "staff",
        "jamaah_sudah_berangkat",
        "jamaah_paket",
        "jamaah_tabungan_umrah",
        "jamaah_utang_koperasi",
        "agen",
      ]),
      message: DataTypes.TEXT,
      variable: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Whatsapp_template",
    }
  );
  return Whatsapp_template;
};
