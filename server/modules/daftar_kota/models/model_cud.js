const { sequelize, Mst_kota } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  // Tambah Kota
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const insert = await Mst_kota.create(
        {
          company_id: this.company_id, 
          kode: body.kode,
          name: body.name,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Kota Baru dengan Kode Kota: ${body.kode} dan Nama Kota: ${body.name} dan ID Kota: ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit kota
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      const infoKota = await model_r.infoKota(body.id, this.company_id);

      await Mst_kota.update(
        {
          kode: body.kode,
          name: body.name,
          updatedAt: myDate,
        },
        {
          where: { id: body.id, company_id: this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Memperbaharui Data Kota dengan Kode Kota: ${infoKota.kode}, Nama Kota: ${infoKota.name} dan ID Kota: ${body.id} menjadi Kode Kota: ${body.kode} dan Nama Kota ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Kota
  async delete() {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoKota = await model_r.infoKota(body.id, this.company_id);
      
      await Mst_kota.destroy(
        {
          where: {
            id: body.id,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menghapus Kota dengan Kode Kota: ${infoKota.kode} dan Nama Kota: ${infoKota.name} dan ID Kota: ${infoKota.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // response
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
