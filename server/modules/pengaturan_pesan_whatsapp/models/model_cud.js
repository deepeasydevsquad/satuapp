const { Op, sequelize, Company } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id = null;
    this.message = "";
    this.t = null;
    this.state = true;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
  }

  async update_setingan_whatsapp() {
    await this.initialize();
    const body = this.req.body;
    const my_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    console.log("memulai_update_data");
    try {
      const update = await Company.update(
        {
          company_id: this.company_id,
          whatsapp_device_number: body.whatsapp_device_number,
          whatsapp_device_key: body.device_key,
          whatsapp_api_key: body.api_key,
          updatedAt: my_date,
        },
        {
          where: { id: this.company_id },
          transaction: this.t,
        }
      );

      this.message = "Berhasil memperbaharui data";
    } catch (error) {
      this.state = false;
      this.message = error.message;
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message });
      await this.t.commit();
      return true;
    } else {
      if (this.t) await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
