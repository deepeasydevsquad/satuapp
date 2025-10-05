const {
  sequelize,
  Akun_bank_administrator,
  Request_deposit_company,
} = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const {
  generatedNominalCodeTambahDepositPerusahaan,
  generatedRequestCodeTambahDepositPerusahaan,
} = require("../../../helper/randomHelper");
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
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      // get data
      var q = await Akun_bank_administrator.findOne({
        where: { id: body.bank_id },
      });

      const nominal_code = await generatedNominalCodeTambahDepositPerusahaan(
        this.company_id
      );
      const request_code = await generatedRequestCodeTambahDepositPerusahaan(
        this.company_id
      );

      // menambahkan ke tabel Member
      var insert = await Request_deposit_company.create(
        {
          company_id: this.company_id,
          request_code: request_code,
          bank: q.bank_name,
          number_account_bank: q.account_bank_number,
          name_account_bank: q.account_bank_name,
          nominal: body.nominal,
          nominal_code: nominal_code,
          sending_payment_status: "belum_dikirim",
          sending_payment_time: null,
          status: "diproses",
          petugas_id: null,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // set message
      this.message = `Menambah request deposit perusahaan ke bank ${q.bank_name} (${q.account_bank_name} - ${q.account_bank_number}) dengan nominal ${body.nominal} dan kode request ${request_code}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    let where = { company_id: this.company_id, id: body.id };

    try {
      var q = await Akun_bank_administrator.findOne({
        where: { id: body.bank_id },
      });

      const nominal_code = await generatedNominalCodeTambahDepositPerusahaan(
        this.company_id
      );
      const request_code = await generatedRequestCodeTambahDepositPerusahaan(
        this.company_id
      );

      // update process
      await Request_deposit_company.update(
        {
          request_code: request_code,
          bank: q.bank_name,
          number_account_bank: q.account_bank_number,
          name_account_bank: q.account_bank_name,
          nominal: body.nominal,
          nominal_code: nominal_code,
          updatedAt: myDate,
        },
        {
          where: where,
          transaction: this.t,
        }
      );
      // set message
      this.message = `Mengupdate request deposit perusahaan ID: ${body.id} ke bank ${q.bank_name} (${q.account_bank_name} - ${q.account_bank_number}) dengan nominal ${body.nominal} dan kode request ${request_code}`;
    } catch (error) {
      console.log("------");
      console.log(error);
      console.log("------");
      this.state = false;
    }
  }

  async delete() {
    await this.initialize();
    const body = this.req.body;
    let where = { company_id: this.company_id, id: body.id };
    try {
      // delete process
      await Request_deposit_company.destroy({
        where: where,
        transaction: this.t,
      });
      // set message
      this.message = `Menghapus request deposit perusahaan ID: ${body.id}`;
    } catch (error) {
      console.log("---|||||||||||||||||");
      console.log(error);
      console.log("---|||||||||||||||||");
      this.state = false;
    }
  }

  async sudah_dikirim() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    let where = { company_id: this.company_id, id: body.id };

    try {
      // update process
      await Request_deposit_company.update(
        {
          sending_payment_status: "sudah_dikirim",
          sending_payment_time: myDate,
          updatedAt: myDate,
        },
        {
          where: where,
          transaction: this.t,
        }
      );
      // set message
      this.message = `Mengubah status request deposit perusahaan ID: ${body.id} menjadi sudah dikirim`;
    } catch (error) {
      console.log("------");
      console.log(error);
      console.log("------");
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
