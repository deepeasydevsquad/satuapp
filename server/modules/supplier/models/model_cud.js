const { sequelize, Supplier } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { getBankIdByName } = require("../../../helper/bankHelper");
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

  // Tambah Kota
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      // insert process
      const insert = await Supplier.create(
        {
          company_id : this.company_id, 
          name: body.name,
          address: body.address,
          bank_id: body.bank_id,
          nomor_rekening: body.nomor_rekening,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Supplier Baru dengan Nama Supplier : ${body.name} dan ID Supplier  : ${insert.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Edit kota
  async update() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoSupplier = await model_r.infoSupplier(body.id, this.company_id);
      await Supplier.update(
        {
          name: body.name,
          address: body.address,
          bank_id: body.bank_id,
          nomor_rekening: body.nomor_rekening,
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
      this.message = `Memperbaharui Data Supplier dengan Nama Supplier ${infoSupplier.name} dan ID Supplier : ${body.id} menjadi Nama Supplier ${body.name}, alamat ${body.address}, bank ${body.bank} dan nomor rekening ${body.nomor_rekening}`;
    } catch (error) {
      this.state = false;
    }
  }

  // Hapus Kota
  async delete() {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const infoSupplier = await model_r.infoSupplier(body.id, this.company_id);
      await Supplier.destroy(
        {
          where: {
            id: body.id,
            company_id : this.company_id
          },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menghapus Supplier dengan Nama Supplier : ${infoSupplier.name} dan ID Supplier  : ${infoSupplier.id}`;
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
