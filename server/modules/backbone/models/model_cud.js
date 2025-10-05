const Model_r = require("./model_r");
const { sequelize, Mst_airline, Akun_secondary, Saldo_akun, Op } = require("../../../models");
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
    var num1 = 12001;
    var num2 = 42001;
    var num3 = 51001;

    let condition1 = true;
    while (condition1) {
      num1++;
      var check1 = await Akun_secondary.findOne({ where: { nomor_akun: num1, company_id: company_id } });
      if (!check1) condition1 = false;
    }

    let condition2 = true;
    while (condition2) {
      num2++;
      var check2 = await Akun_secondary.findOne({ where: { nomor_akun: num2, company_id: company_id } });
      if (!check2) condition2 = false;
    }

    let condition3 = true;
    while (condition3) {
      num3++;
      var check3 = await Akun_secondary.findOne({ where: { nomor_akun: num3, company_id: company_id } });
      if (!check3) condition3 = false;
    }

    return { deposit: num1, pendapatan: num2, hpp: num3 }
  }

  // Tambah Airline
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    const nomor_akun = await this.get_nomor_akun( this.company_id );

    try {

      const insert = await Mst_airline.create(
        {
          company_id : this.company_id, 
          name: body.name,
          nomor_akun_deposit: nomor_akun.deposit,
          nomor_akun_pendapatan: nomor_akun.pendapatan,
          nomor_akun_hpp: nomor_akun.hpp,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah di Akun Deposit
      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: '1',
          nomor_akun: nomor_akun.deposit,
          nama_akun: 'DEPOSIT ' + body.name,
          tipe_akun: 'bawaan', 
          path: 'airlinesIdDeposit:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah di Akun Pendapata
      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: '4',
          nomor_akun: nomor_akun.pendapatan,
          nama_akun: 'PENDAPATAN ' + body.name,
          tipe_akun: 'bawaan', 
          path: 'airlinesIdPendapatan:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah di Akun Hpp
      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: '5',
          nomor_akun: nomor_akun.pendapatan,
          nama_akun: 'HPP ' + body.name,
          tipe_akun: 'bawaan', 
          path: 'airlinesIdHpp:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Airline Baru dengan Nama Airline: ${body.name} dan ID Airline: ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit airline
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoAirline = await model_r.infoAirline(body.id, this.company_id);

      await Mst_airline.update(
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

      // update deposit
      await Akun_secondary.update(
        {
          nama_akun: 'DEPOSIT ' + body.name,
          updatedAt: myDate,
        },
        {
          where: { path: 'airlinesIdDeposit:' + body.id, company_id : this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );

      // update pendapatan
      await Akun_secondary.update(
        {
          nama_akun: 'PENDAPATAN ' + body.name,
          updatedAt: myDate,
        },
        {
          where: { path: 'airlinesIdPendapatan:' + body.id, company_id : this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );

      // update hpp
      await Akun_secondary.update(
        {
          nama_akun: 'HPP ' + body.name,
          updatedAt: myDate,
        },
        {
          where: { path: 'airlinesIdHpp:' + body.id, company_id : this.company_id,  },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Memperbaharui Data Airline dengan Nama Airline: ${infoAirline.name} dan ID Airline: ${body.id} menjadi Nama Airline: ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Airline
  async delete() {
    await this.initialize();
    const body = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      const infoAirline = await model_r.infoAirline(body.id, this.company_id);
      // get data akun secondary
      var idAkunSecondary = [];
      await Akun_secondary.findAll({
        where: { 
          [
            Op.or] : [
              { path : { [Op.like]: "%airlinesIdDeposit:" + body.id + "%" } },
              { path : { [Op.like]: "%airlinesIdPendapatan:" + body.id + "%" } },
              { path : { [Op.like]: "%airlinesIdHpp" + body.id + "%" } }
            ] 
          }}).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            idAkunSecondary.push(e.id);
          })
        );
      });
      // delete master airlines
      await Mst_airline.destroy(
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
      // delete Airlines Deposit
      await Akun_secondary.destroy(
        {
          where: {
            path: 'airlinesIdDeposit:' +  body.id,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );
      // delete airlines Pendapatan
      await Akun_secondary.destroy(
        {
          where: {
            path: 'airlinesIdPendapatan:' +  body.id,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );
      // delete airline HPP
      await Akun_secondary.destroy(
        {
          where: {
            path: 'airlinesIdHpp:' +  body.id,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );
      // delete saldo
      await Saldo_akun.destroy(
        {
          where: {
            akun_secondary_id: { [Op.in] : idAkunSecondary},
          },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menghapus Airline dengan Nama Airline: ${infoAirline.name} dan ID Airline: ${infoAirline.id}`;
    } catch (error) {

      console.log("XXXXXX");
      console.log(error);
      console.log("XXXXXX");
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
