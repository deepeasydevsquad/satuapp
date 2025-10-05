const { sequelize, Op, Mst_bank, Akun_secondary, Saldo_akun } = require("../../../models");
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

  async get_nomor_akun( company_id ) {
    var num = 11020;
    let condition = true;
    while (condition) {
      num++;
      var check = await Akun_secondary.findOne({ where: { nomor_akun: num, company_id: company_id } });
      if (!check) condition = false;
    }
    return num
  }

  // Tambah Bank
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const nomor_akun = await this.get_nomor_akun( this.company_id );

    try {
      const insert = await Mst_bank.create(
        {
          company_id : this.company_id, 
          kode: body.kode,
          name: body.name,
          nomor_akun: nomor_akun,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: 1, 
          nomor_akun: nomor_akun,
          nama_akun: body.name.toUpperCase(),
          tipe_akun: 'bawaan',
          path: 'bankId:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Bank Baru dengan Kode Bank : ${body.kode} dan Nama Bank : ${body.name} dan ID Bank : ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit Bank
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      const infoBank = await model_r.infoBank(body.id, this.company_id);

      await Mst_bank.update(
        {
          kode: body.kode,
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

      await Akun_secondary.update(
        {
          nama_akun: body.name.toUpperCase(), 
          updatedAt: myDate,
        },
        {
          where: { path: 'bankId:'+ body.id, company_id : this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );
      
      this.message = `Memperbaharui Data Bank dengan Kode Bank ${infoBank.kode}, Nama Bank ${infoBank.name} dan ID Bank : ${body.id} menjadi Kode Bank ${body.kode} dan Nama Bank ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Bank
  async delete() {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoBank = await model_r.infoBank(body.id, this.company_id);
      const idAkunSecondary = await model_r.getInfoAkunSecondary(this.company_id, infoBank.kode);
      const list_division_id = await model_r.get_seluruh_cabang_id(this.company_id);

      await Saldo_akun.destroy(
        {
          where: {
            akun_secondary_id: idAkunSecondary.id,
            division_id : {
              [Op.in] : list_division_id
            }
          },
        },
        {
          transaction: this.t,
        }
      );

       await Akun_secondary.destroy(
        {
          where: {
            path: 'bankId:' +  body.id,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );

      await Mst_bank.destroy(
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

      this.message = `Menghapus Bank dengan Kode Bank : ${infoBank.kode} dan Nama Bank : ${infoBank.name} dan ID Bank  : ${infoBank.id}`;
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
