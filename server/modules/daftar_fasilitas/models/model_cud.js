const { sequelize, Mst_fasilitas, Akun_secondary, Saldo_akun, Op } = require("../../../models");
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

  async get_nomor_akun_aset( company_id ) {
    var num = 19110;
    let condition = true;
    while (condition) {
      num++;
      var check = await Akun_secondary.findOne({ where: { nomor_akun: num, company_id: company_id } });
      if (!check) condition = false;
    }
    return num
  }

  async get_nomor_akun_hpp( company_id ) {
    var num = 57000;
    let condition = true;
    while (condition) {
      num++;
      var check = await Akun_secondary.findOne({ where: { nomor_akun: num, company_id: company_id } });
      if (!check) condition = false;
    }
    return num
  }

  async get_nomor_akun_pendapatan( company_id ) {
    var num = 49000;
    let condition = true;
    while (condition) {
      num++;
      var check = await Akun_secondary.findOne({ where: { nomor_akun: num, company_id: company_id } });
      if (!check) condition = false;
    }
    return num
  }

  // Tambah Fasilitas
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const nomor_akun_aset = await this.get_nomor_akun_aset( this.company_id );
      const nomor_akun_hpp = await this.get_nomor_akun_hpp( this.company_id );
      const nomor_akun_pendapatan = await this.get_nomor_akun_pendapatan( this.company_id );
      
      const insert = await Mst_fasilitas.create(
        {
          company_id: this.company_id, 
          name: body.name,
          nomor_akun_aset: nomor_akun_aset,
          nomor_akun_hpp: nomor_akun_hpp,
          nomor_akun_pendapatan: nomor_akun_pendapatan,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah di Akun aset
      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: '1',
          nomor_akun: nomor_akun_aset,
          nama_akun: body.name,
          tipe_akun: 'bawaan', 
          path: 'fasilitasId:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah akun hpp
      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: '5',
          nomor_akun: nomor_akun_hpp,
          nama_akun: 'HPP '+body.name,
          tipe_akun: 'bawaan', 
          path: 'fasilitasId:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah akun pendapatan
      await Akun_secondary.create(
        {
          company_id: this.company_id, 
          akun_primary_id: '4',
          nomor_akun: nomor_akun_pendapatan,
          nama_akun: 'PENDAPATAN ' + body.name,
          tipe_akun: 'bawaan', 
          path: 'fasilitasId:' + insert.id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Fasilitas Baru dengan Nama Fasilitas: ${body.name} dan ID Fasilitas: ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit fasilitas
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const model_r = new Model_r(this.req);
      const infoFasilitas = await model_r.infoFasilitas(body.id, this.company_id);

      // update fasilitas
      await Mst_fasilitas.update(
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

      // update akun secondary aset
      await Akun_secondary.update(
        {
          nama_akun: body.name,
          updatedAt: myDate,
        },
        {
          where: { 
            path: 'fasilitasId:' +  body.id, 
            nomor_akun: infoFasilitas.nomor_akun_aset,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );

      // update akun secondary hpp
      await Akun_secondary.update(
        {
          nama_akun: 'HPP ' + body.name,
          updatedAt: myDate,
        },
        {
          where: { 
            path: 'fasilitasId:' +  body.id, 
            nomor_akun: infoFasilitas.nomor_akun_hpp,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );

      // update akun secondary pendapatan
      await Akun_secondary.update(
        {
          nama_akun: 'PENDAPATAN ' + body.name,
          updatedAt: myDate,
        },
        {
          where: { 
            path: 'fasilitasId:' +  body.id, 
            nomor_akun: infoFasilitas.nomor_akun_pendapatan,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Memperbaharui Data Fasilitas dengan Nama Fasilitas: ${infoFasilitas.name} dan ID Fasilitas: ${body.id} menjadi Nama Fasilitas: ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Fasilitas
  async delete() {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoFasilitas = await model_r.infoFasilitas(body.id, this.company_id);
      const qA = await Akun_secondary.findOne({ where: { path: 'fasilitasId:' + body.id, company_id : this.company_id } })
     
      await Mst_fasilitas.destroy(
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

      await Akun_secondary.destroy(
        {
          where: {
            path: 'fasilitasId:' +  body.id,
            company_id: this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );

      await Saldo_akun.destroy(
        {
          where: {
            akun_secondary_id: qA.id,
          },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menghapus Fasilitas dengan Nama Fasilitas: ${infoFasilitas.name} dan ID Fasilitas: ${infoFasilitas.id}`;
    } catch (error) {

      console.log("xxxxAAAA");
      console.log(error);
      console.log("xxxxAAAA");

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
