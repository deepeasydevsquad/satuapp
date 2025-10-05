const { sequelize, Akun_bank_perusahaan } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  getCompanyIdByCode,
  getCabang,
  tipe,
} = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id = null;
    this.company_id = null;
    this.t = null;
    this.state = true;
    this.message = "";
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
  }

  async add() {
    await this.initialize();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const insert = await Akun_bank_perusahaan.create(
        {
          company_id: this.company_id,
          mst_bank_id: body.mst_bank_id,
          nomor_akun: body.nomor_akun,
          nama_akun: body.nama_akun,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      this.message = `Menambahkan Akun Bank Baru dengan Nama Akun Bank: ${body.nama_akun} dan ID Akun Bank: ${insert.id}`;
    } catch (error) {
      this.state = false;
      console.error(error);
    }
  }

  async update() {
    await this.initialize();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      await Akun_bank_perusahaan.update(
        {
          mst_bank_id: body.mst_bank_id,
          nomor_akun: body.nomor_akun,
          nama_akun: body.nama_akun,
          updatedAt: myDate,
        },
        {
          where: { id: body.id },
          transaction: this.t,
        }
      );

      this.message = `Memperbaharui data akun bank dengan Nama Akun Bank: ${body.nama_akun} dan ID Akun Bank: ${body.id}`;
    } catch (error) {
      this.state = false;
      console.error(error);
    }
  }

  async delete() {
    await this.initialize();
    const body = this.req.body;

    try {
      await Akun_bank_perusahaan.destroy({
        where: { id: body.id },
        transaction: this.t,
      });

      this.message = "Akun Bank berhasil dihapus.";
    } catch (error) {
      this.state = false;
      this.message = error.message;
      console.error(error);
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, {
        msg: this.message,
      });
      await this.t.commit();
      return true;
    } else {
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
