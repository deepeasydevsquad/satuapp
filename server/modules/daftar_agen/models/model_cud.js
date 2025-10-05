const { sequelize, Agen, Member, Grup, Division } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const bcrypt = require("bcryptjs");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.t = null;
    this.state = true;
    this.message = "";
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
  }

  // Tambah Pengguna
  async tambahAgen() {
    // initialize dependensi properties
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const uplineId = body.upline_id || 0;

      // insert process
      const insert = await Agen.create(
        {
          company_id: this.company_id,
          member_id: body.member_id,
          level_keagenan_id: body.level_keagenan_id,
          upline_id: uplineId,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Agen Baru dengan ID Agen : ${insert.id}`;
      return await this.response();
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Pengguna
  async delete() {
    // initialize dependensi properties
    await this.initialize();

    const { id } = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      const infoAgen = await model_r.infoAgen(id);
      await Agen.destroy({ 
        where: { 
          id : id 
        }
      },  
      { 
        transaction: this.t
      });

      this.message = `Menghapus Pengguna dengan Username: ${infoAgen.Member.fullname} dan ID: ${id}`;
    } catch (error) {

      console.log("xxxxx");
      console.log(error);
      console.log("xxxxx");
      
      this.state = false;
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message, });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }

  // Response handler
  // async response() {
  //   if (this.state) {
  //     await writeLog(this.req, this.t, { msg: this.message });
  //     await this.t.commit();
  //     return { success: true, message: this.message };
  //   } else {
  //     await this.t.rollback();
  //     return { success: false, message: this.message };
  //   }
  // }
}

module.exports = Model_cud;
