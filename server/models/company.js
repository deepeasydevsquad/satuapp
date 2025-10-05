"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.Division, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Subscribtion_payment_history, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_bank, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_fasilitas, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_hotel, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_kota, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_airline, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_airport, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_asuransi, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mst_provider, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Supplier, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Akun_secondary, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.System_log, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Level_keagenan, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Periode, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Mahram, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });

      Company.hasMany(models.Fee_agen, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });

      Company.hasMany(models.Konfigurasi_surat_menyurat, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Riwayat_surat_menyurat, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Whatsapp_setting, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Whatsapp_template, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Kamar, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Bus, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      // Company.hasMany(models.Transaction_fasilitas, {
      //   foreignKey: "company_id",
      //   onDelete: "CASCADE",
      // });
      Company.hasMany(models.Headline, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Akun_bank_perusahaan, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.File_pendukung, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Request_deposit_member, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Ppob_prabayar_markup_company, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Transaction_deposit_company, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Ppob_pascabayar_markup_company, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Ppob_transaction_pascabayar, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Ppob_transaction_prabayar, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
      Company.hasMany(models.Request_deposit_company, {
        foreignKey: "company_id",
        onDelete: "CASCADE",
      });
    }
  }
  Company.init(
    {
      code: DataTypes.STRING,
      division_id: DataTypes.STRING,
      kurs: DataTypes.ENUM(["rp", "usd", "sar"]),
      division_id: DataTypes.STRING,
      logo: DataTypes.STRING,
      icon: DataTypes.STRING,
      company_name: DataTypes.STRING,
      email: DataTypes.STRING,
      type: DataTypes.ENUM(["limited", "unlimited"]),
      verify_status: DataTypes.ENUM(["verified", "unverified"]),
      verify_time: DataTypes.DATE,
      whatsapp_company_number: DataTypes.STRING,
      otp: DataTypes.STRING,
      otp_expired_time: DataTypes.DATE,
      invoice_logo: DataTypes.STRING,
      invoice_title: DataTypes.STRING,
      start_subscribtion: DataTypes.DATE,
      end_subscribtion: DataTypes.DATE,
      whatsapp_device_number: DataTypes.STRING,
      whatsapp_api_key: DataTypes.STRING,
      whatsapp_device_key: DataTypes.STRING,
      refresh_token: DataTypes.TEXT,
      saldo: DataTypes.INTEGER,
      markup_ppob: DataTypes.INTEGER,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Company",
    }
  );
  return Company;
};
