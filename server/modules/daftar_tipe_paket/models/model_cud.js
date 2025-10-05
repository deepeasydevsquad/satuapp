const { sequelize, Mst_paket_type } = require("../../../models");
const Model_r = require("./model_r");
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
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  // Tambah Tipe Paket
  async add() {
    // initialize dependensi properties
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      // insert process
      const insert = await Mst_paket_type.create(
        {
          company_id : this.company_id,
          name: body.name,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Tipe Paket Baru dengan Nama Tipe Paket : ${body.name} dan ID Tipe Paket  : ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit fasilitas
  async update() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // update process
    try {
      // call object
      const model_r = new Model_r(this.req);
      // get info fasilitas
      const infoTipePaket = await model_r.infoTipePaket(body.id, this.company_id);
      // update data fasilitas
      await Mst_paket_type.update(
        {
          name: body.name,
          updatedAt: myDate,
        },
        {
          where: { id: body.id, company_id : this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memperbaharui Data Tipe Paket dengan Nama Tipe Paket ${infoTipePaket.name} dan ID Tipe Paket : ${body.id} menjadi Nama Tipe Paket ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Tipe Paket
  async delete() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    try {
      // call object
      const model_r = new Model_r(this.req);
      // get info fasilitas
      const infoTipePaket = await model_r.infoTipePaket(body.id, this.company_id);
      // delete process
      await Mst_paket_type.destroy(
        {
          where: {
            id: body.id,
            company_id : this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menghapus Tipe Paket dengan Nama Tipe Paket : ${infoTipePaket.name} dan ID Tipe Paket : ${infoTipePaket.id}`;
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
