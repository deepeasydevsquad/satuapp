const { sequelize, Kostumer } = require("../../../models");
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

  // Tambah kostumer
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const insert = await Kostumer.create(
        {
          company_id: this.company_id,
          name: body.name,
          mobile_number: body.mobile_number,
          address: body.address,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan kostumer Baru dengan Nama kostumer: ${body.name} dan ID kostumer: ${insert.id}`;
    } catch (error) {
      console.log("-------ZZZZ");
      console.log(error);
      console.log("-------ZZZZ");

      this.state = false;
    }
  }

  // Edit kostumer
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infokostumer = await model_r.infokostumer(body.id, this.company_id);

      await Kostumer.update(
        {
          name: body.name,
          mobile_number: body.mobile_number,
          address: body.address,
          updatedAt: myDate,
        },
        {
          where: { id: body.id, company_id: this.company_id },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Memperbaharui Data kostumer dengan Nama kostumer ${infokostumer.name} dan ID kostumer: ${body.id} menjadi Nama kostumer ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus kostumer
  async delete() {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infokostumer = await model_r.infokostumer(body.id, this.company_id);

      await Kostumer.destroy(
        {
          where: {
            id: body.id,
            company_id: this.company_id,
          },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menghapus kostumer dengan Nama kostumer: ${infokostumer.name} dan ID kostumer: ${infokostumer.id}`;
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
