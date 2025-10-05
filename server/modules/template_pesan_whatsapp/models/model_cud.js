const { Whatsapp_template, sequelize } = require("../../../models");
const moment = require("moment");
const { Op } = require("sequelize");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async tambah_tempale() {
    await this.initialize();
    const body = this.req.body;
    const my_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      // insert process
      const insert = await Whatsapp_template.create(
        {
          company_id: this.company_id,
          name: body.name,
          type: body.type,
          message: body.message,
          variable: JSON.stringify(body.variable),
          createdAt: my_date,
          updatedAt: my_date,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Template Baru dengan Nama Template : ${body.name} dan ID Template : ${insert.id}`;
    } catch (error) {
      this.state = false;
      this.message = "Gagal menambahkan template.";
      console.error("Tambah Template Error:", error);
    }
  }

  async update_template() {
    await this.initialize();
    const body = this.req.body;
    const my_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      const updated = await Whatsapp_template.update(
        {
          name: body.name,
          type: body.type,
          message: body.message,
          variable: JSON.stringify(body.variable),
          updatedAt: my_date,
        },
        {
          where: {
            id: body.id,
            company_id: this.company_id,
          },
          transaction: this.t,
        }
      );

      if (updated[0] === 0)
        throw new Error("Data tidak ditemukan atau tidak berubah");

      this.message = `Mengupdate Template dengan ID : ${body.id}`;
    } catch (error) {
      this.state = false;
      this.message = "Gagal mengupdate template.";
      console.error("Update Template Error:", error);
    }
  }

  async delete_template() {
    await this.initialize();
    const body = this.req.body;

    try {
      const deleted = await Whatsapp_template.destroy({
        where: {
          id: body.id,
          company_id: this.company_id,
        },
        transaction: this.t,
      });

      if (deleted === 0) throw new Error("Data tidak ditemukan");

      this.message = `Menghapus Template dengan ID : ${body.id}`;
    } catch (error) {
      this.state = false;
      this.message = "Gagal menghapus template.";
      console.error("Delete Template Error:", error);
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, {
        msg: this.message,
      });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
