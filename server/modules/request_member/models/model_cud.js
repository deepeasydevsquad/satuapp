const { sequelize, Request_member, Member, Jamaah } = require("../../../models");
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

  // Menyetujui request member
  async setujuiRequestMember() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      // get data 
      var q = await Request_member.findOne({ where: { id: body.id } });
      // menambahkan ke tabel Member
      var insert = await Member.create(
        {
          division_id: q.division_id,
          fullname: q.fullname,
          identity_number: q.identity_number,
          identity_type: q.identity_type,
          gender: q.gender,
          photo: q.photo,
          birth_date: q.birth_date,
          birth_place: q.birth_place,
          whatsapp_number: q.whatsapp_number,
          password: q.password,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // menambahkan ke tabel Jamaah
      await Jamaah.create(
        {
          division_id: q.division_id,
          agen_id: q.agen_id,
          member_id: insert.id,
          kelurahan_id: q.kelurahan_id,
          address: q.address,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // update ke tabel request member
      await Request_member.update(
        {
          status: 'approved',
          updatedAt: myDate,
        },
        {
          where: { id: body.id, division_id : q.division_id },
        },
        {
          transaction: this.t,
        }
      );
      // set message
      this.message = `Menyetujui Request Member Baru dengan Nama Calon Member: ${q.fullname} dan ID Request: ${q.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Menolak request member
  async rejectRequestMember() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      // get data
      var q = await Request_member.findOne({ where: { id: body.id } });    
      // update ke tabel request member
      await Request_member.update(
        {
          status: 'rejected',
          updatedAt: myDate,
        },
        {
          where: { id: body.id, division_id : q.division_id },
        },
        {
          transaction: this.t,
        }
      );
      // set message
      this.message = `Menolak Request Member Baru dengan Nama Calon Member: ${q.fullname} dan ID Request: ${q.id}`;
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
      await this.t.commit();
      return true;
    } else {
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
