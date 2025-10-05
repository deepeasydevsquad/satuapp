const Model_r = require("./model_r");
const { sequelize, Op, Akun_secondary, Saldo_akun, Jurnal, Akun_primary, Division, Periode } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  // Tambah Akun
  async add() {
    // initialize dependensi properties
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {

      const primary_id = body.primary_id;
      const prefix = body.prefix;
      const nomor_akun = prefix + body.nomor;
      const nama_akun = body.nama;

      // insert process
      const insert = await Akun_secondary.create(
        {
          company_id : this.company_id, 
          akun_primary_id : primary_id,
          nomor_akun: nomor_akun,
          nama_akun: nama_akun,
          tipe_akun: 'tambahan',
          path: '',
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // write log message
      this.message = `Menambahkan Akun Baru dengan Nama Akun : ${body.nama}, Nomor Akun : ${nomor_akun} dan ID Akun : ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // update Akun
  async update() {
    // initialize dependensi properties
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const primary_id = body.primary_id;
    const prefix = body.prefix;
    const nomor_akun = prefix + body.nomor;
    const nama_akun = body.nama;

    try {
      // insert process
      await Akun_secondary.update(
        {
          nomor_akun: nomor_akun,
          nama_akun: nama_akun,
          createdAt: myDate,
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
      this.message = `Memperbaharui data akun ID Akun : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // delete Akun
  async delete() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    try {

      const model_r = new Model_r(this.req);
      const division_id = await model_r.get_seluruh_cabang_id(this.company_id);

      // delete saldo
      await Saldo_akun.destroy(
        {
          where: {
            akun_secondary_id: body.id,
            division_id: { [Op.in] : division_id },
            periode: 0
          },
        },
        { transaction: this.t }
      );
      // delete akun seconday
      await Akun_secondary.destroy(
        {
          where: {
            id: body.id,
            company_id : this.company_id
          },
        },
        { transaction: this.t }
      );
      // write log message
      this.message = `Menghapus Akun dengan ID Aakun : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update_saldo() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const saldo = body.saldo;
    try {
      // delete saldo
      await Saldo_akun.destroy(
        {
          where: {
            akun_secondary_id: body.id,
            division_id : body.cabang, 
            periode: 0
          },
        },
        { transaction: this.t }
      );
      // insert new saldo
      await Saldo_akun.create(
        {
          division_id : body.cabang,
          akun_secondary_id : body.id,
          saldo: saldo,
          periode: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // write log message
      this.message = `Mengupdate saldo akun dengan ID Akun : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async tutup_buku() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      const model_r = new Model_r(this.req);
      // dapatkan division id dari seluruh id cabang
      const division = await model_r.get_seluruh_cabang_id();
      // dapatkan akun primary dari database
      const akun_primary = await model_r.get_akun_primary();
      // dapatkan akun secondary dari database
      const akun_secondary_id = await model_r.get_akun_secondary();
      // dapatkan saldo awal setiap devisi
      const saldo_awal = await model_r.get_saldo_awal(division);
      // dapatkan saldo jurnal
      const saldo_jurnal = await model_r.get_saldo_jurnal(akun_primary, division);
      // dapatkan saldo akhir
      const saldo_akhir = await model_r.get_saldo_akhir(division, saldo_awal, saldo_jurnal);
      // create periode baru
      const insert = await Periode.create(
        {
          company_id : this.company_id,
          name : body.nama_periode,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // update semua saldo akun yang periodenya 0 ke periode terbaru
      for( let p in division ) {
        await Saldo_akun.update(
          {
            periode: insert.id,
            updatedAt: myDate,
          },
          {
            where: { periode: 0, division_id: division[p]},
          },
          {
            transaction: this.t,
          }
        );
      }

      // update semua periode jurnal dari periode 0 ke periode terbaru
      await Jurnal.update(
        {
          periode_id: insert.id,
          updatedAt: myDate,
        },
        {
          where: { periode_id: 0, division_id : { [Op.in] : division } },
        },
        {
          transaction: this.t,
        }
      );
      
      var laba_bersih = await model_r.laba_bersih(saldo_akhir);
      var varInclude = [1,2,3];
      for( let u in saldo_akhir ) {
        for( let i in saldo_akhir[u] ) {
          var prefix = i.toString().charAt(0);
          if( varInclude.includes(parseInt( prefix )) ){
            await Saldo_akun.create(
              {
                division_id : u,
                akun_secondary_id : akun_secondary_id[i],
                saldo : ( i == '31000' ? saldo_akhir[u][i] + laba_bersih[u] : saldo_akhir[u][i] ),
                periode : 0,
                createdAt: myDate,
                updatedAt: myDate,
              },
              {
                transaction: this.t,
              }
            );
          }
        }
      }

      // write log message
      this.message = `Menutup Buku Akuntasi pada periode ${body.nama_periode}`;
    } catch (error) {
      this.state = false;
    }
  }

  async kembalikan_buku () {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      const model_r = new Model_r(this.req);
      // get last periode
      const last_periode = await model_r.get_last_periode_id();
      // dapatkan division id dari seluruh id cabang
      const division = await model_r.get_seluruh_cabang_id();
      // delete jurnal
      await Jurnal.destroy(
        {
          where: {
            division_id: {
              [Op.in] : division
            },
            periode_id: 0
          },
        },
        { transaction: this.t }
      );
      // update jurnal
      await Jurnal.update(
        {
          periode_id: 0,
          updatedAt: myDate,
        },
        {
          where: { periode_id: last_periode, division_id: { [Op.in] : division } },
        },
        {
          transaction: this.t,
        }
      );

      // delete saldo
      await Saldo_akun.destroy(
        {
          where: {
            division_id: {
              [Op.in] : division
            },
            periode: 0
          },
        },
        { transaction: this.t }
      );
      // update saldo
      await Saldo_akun.update(
        {
          periode: 0,
          updatedAt: myDate,
        },
        {
          where: { periode: last_periode, division_id: { [Op.in] : division } },
        },
        {
          transaction: this.t,
        }
      );
      // delete periode
      await Periode.destroy(
        {
          where: { id: last_periode },
        },
        { transaction: this.t }
      );

      this.message = `Membuka Buku Akuntasi pada periode ${body.nama_periode}`;
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
