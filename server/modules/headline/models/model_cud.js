const { 
  sequelize,
  Headline,
  } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
  } 

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async addHeadline() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const insert = await Headline.create({
        company_id: this.company_id,
        headline: body.headline,
        tampilkan: body.tampilkan,
        createdAt: dateNow,
        updatedAt: dateNow,
      });

      this.message = "Headline berhasil ditambahkan dengan id " + insert.id;
    } catch (error) {
      console.log("Error in addHeadline:", error);
      this.state = false;
    }
  }

  async updateHeadline() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(body);

    try {
      await Headline.update(
        {
          company_id: this.company_id,
          headline: body.headline,
          tampilkan: body.tampilkan,
          updatedAt: dateNow,
        },
        {
          where: { id: body.id, company_id: this.company_id },
          transaction: this.t,
        }
      );

      this.message = "Headline berhasil diperbaharui dengan id " + body.id;
    } catch (error) {
      console.log("Error in updateHeadline:", error);
      this.state = false;
    }
  }
  
  async deleteHeadline() {
    await this.initialize();
    const body = this.req.body;

    try {
      await Headline.destroy({
        transaction: this.t,
        where: { id: body.id, company_id: this.company_id },
      });

      this.message = "Headline berhasil dihapus dengan id " + body.id;
    } catch (error) {
      console.log("Error in deleteHeadline:", error);
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
