const { sequelize, Paket_la } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCabang } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id;
  }

  async initialize() {
    this.division_id = await getCabang(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async generateRegisterNumber() {
    // generate nomor registrasi unik serta tidak sama dengan yang sudah ada
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    while (true) {
      const registerNumber = Array.from({ length: 6 }, () =>
        possible.charAt(Math.floor(Math.random() * possible.length))
      ).join("");
  
      const sama = await Paket_la.findOne({ where: { register_number: registerNumber } });
      if (!sama) return registerNumber;
    }
  }

  // Tambah  paket la
  async add() {
    // initialize dependensi properties
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    const register_number = await this.generateRegisterNumber();

    try {
      // insert process
      const insert = await Paket_la.create(
        {
          division_id: this.division_id,
          register_number: register_number,
          kostumer_id: body.kostumer_id,
          client_name: body.client_name,
          client_hp_number: body.client_hp_number,
          client_address: body.client_address,
          status: "active",
          discount: body.discount || 0,
          total_price: body.total_price || 0,
          total_jamaah: body.total_jamaah,
          departure_date: body.departure_date,
          arrival_date: body.arrival_date,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan paket la Baru dengan Nomor Registrasi : ${register_number}, Nama klien : ${body.client_name} dan ID paket la : ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit  paket la
  async update() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    // update process
    try {
      // call object
      const model_r = new Model_r(this.req);
      // get info  paket la
      const infoPaketLA = await model_r.infoPaketLA(body.id, this.division_id);
      // update data  paket la
      await Paket_la.update(
        {
          kostumer_id: body.kostumer_id,
          client_name: body.client_name,
          client_hp_number: body.client_hp_number,
          client_address: body.client_address,
          discount: body.discount,
          total_jamaah: body.total_jamaah,
          departure_date: body.departure_date,
          arrival_date: body.arrival_date,
          updatedAt: myDate,
        },
        {
          where: { id: body.id, division_id: this.division_id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memperbaharui Data paket la dengan Nomor Registrasi : ${infoPaketLA.register_number}, Nama klien ${infoPaketLA.client_name} dan ID paket la : ${body.id} menjadi Nama klien ${body.client_name}`; 
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus  paket la
  async delete() {
    // initialize dependensi properties
    await this.initialize();
    const body = this.req.body;
    try {
      // call object
      const model_r = new Model_r(this.req);
      // get info  paket la
      const infoPaketLA = await model_r.infoPaketLA(body.id, this.division_id);
      // delete process
      await Paket_la.destroy(
        {
          where: {
            id: body.id,
            division_id: this.division_id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menghapus paket la dengan Nomor Registrasi : ${infoPaketLA.register_number}, Nama klien : ${infoPaketLA.client_name} dan ID paket la : ${infoPaketLA.id}`;
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
