const { sequelize, Mst_mobil } = require("../../../models");
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
    this.t = await sequelize.transaction();
    this.state = true;
  }

  // Tambah Jenis Mobil
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const insert = await Mst_mobil.create(
        {
          company_id: this.company_id, 
          name: body.name,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Jenis Mobil Baru dengan Nama Jenis Mobil: ${body.name} dan ID Jenis Mobil: ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit jenis mobil
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    
    try {
      const model_r = new Model_r(this.req);
      const infoJenisMobil = await model_r.infoJenisMobil(body.id, this.company_id);

      await Mst_mobil.update(
        {
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

      this.message = `Memperbaharui Data Jenis Mobil dengan Nama Jenis Mobil: ${infoJenisMobil.name} dan ID Jenis Mobil: ${body.id} menjadi Nama Jenis Mobil: ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Jenis Mobil
  async delete() {
    await this.initialize();
    const body = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      const infoJenisMobil = await model_r.infoJenisMobil(body.id, this.company_id);
      
      await Mst_mobil.destroy(
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

      this.message = `Menghapus Jenis Mobil dengan Nama Jenis Mobil: ${infoJenisMobil.name} dan ID Jenis Mobil: ${infoJenisMobil.id}`;
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
