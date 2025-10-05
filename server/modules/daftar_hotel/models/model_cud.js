const { sequelize, Mst_hotel } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { getKotaIdByName } = require("../../../helper/kotaHelper");
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

  // Tambah Hotel
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const insert = await Mst_hotel.create(
        {
          company_id: this.company_id, 
          kota_id: await getKotaIdByName(body.kota, this.company_id),
          name: body.name,
          desc: body.desc,
          star: body.star,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Hotel Baru dengan Kota: ${body.kota} dan Nama Hotel: ${body.name} dan ID Hotel: ${insert.id}`;
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
      const infoHotel = await model_r.infoHotel(body.id, this.company_id);

      await Mst_hotel.update(
        {
          kota_id: await getKotaIdByName(body.kota,  this.company_id),
          name: body.name,
          desc: body.desc,
          star: body.star,
          updatedAt: myDate,
        },
        {
          where: { id: body.id, company_id: this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Memperbaharui Data Hotel dengan Kota: ${infoHotel.kota}, Nama Hotel: ${infoHotel.name} dan ID Hotel: ${body.id} menjadi Kota ${body.kota} dan Nama Hotel ${body.name} dan Deskripsi ${body.desc} dan Rating ${body.star}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Hotel
  async delete() {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoHotel = await model_r.infoHotel(body.id, this.company_id);
      
      await Mst_hotel.destroy(
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

      this.message = `Menghapus Hotel dengan Kota: ${infoHotel.kota}, Nama Hotel: ${infoHotel.name} dan ID Hotel: ${infoHotel.id}`;
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
