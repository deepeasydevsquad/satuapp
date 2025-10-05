const {
  Op,
  Agen,
  Pembayaran_fee_agen,
  Member,
  Fee_agen,
  Level_keagenan,
  Users,
  Company,
  sequelize,
} = require("../../../models");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  validateFeeAgenBelumDibayar,
  isInvoiceUnique,
} = require("../../../validation/fee_agen");

const moment = require("moment");

const {
  menghasilkan_invoice_fee_agen,
} = require("../../../helper/randomHelper");

class Model_cud {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id;
    this.type;
    this.division;
    this.t; // Transaction object
    this.state = true; // State untuk menandai sukses/gagal
    this.message = ""; // Pesan log
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.type = await tipe(this.req);
    this.division = await getCabang(this.req);
  }

  async transaction() {
    this.t = await sequelize.transaction();
  }

  async penerima() {
    await this.initialize();
    const role = await tipe(this.req);

    if (role === "administrator") {
      const company = await Company.findOne({ where: { id: this.company_id } });
      return company?.company_name ?? "Unknown Company";
    }

    if (role === "staff") {
      const staff = await Users.findOne({
        where: { division_id: this.division },
        include: [{ model: Member, attributes: ["fullname"] }],
      });
      return staff?.Member?.fullname ?? "Unknown Staff";
    }
    return "Tipe user tidak diketahui";
  }

  async bayar_fee_agen() {
    await this.initialize();
    const penerima = await this.penerima();
    await this.transaction();
    const body = this.req.body;
    const my_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      // ✅ Validasi fee
      const validFees = await validateFeeAgenBelumDibayar(
        body.fee_agen_id,
        this.company_id
      );

      let invoice = await menghasilkan_invoice_fee_agen();

      // Cek invoice unik
      while (!(await isInvoiceUnique(invoice))) {
        invoice = await menghasilkan_invoice_fee_agen(); // ulang generate sampe dapet yg unik
      }

      // ✅ Insert pembayaran fee agen
      const insert = await Pembayaran_fee_agen.create(
        {
          division_id: body.division_id,
          agen_id: body.agen_id,
          invoice,
          applicant_name: body.aplicant_name,
          applicant_identity: body.applicant_identity,
          penerima: penerima,
          fee_agen_id: JSON.stringify(body.fee_agen_id),
          nominal: body.nominal,
          createdAt: my_date,
          updatedAt: my_date,
        },
        {
          transaction: this.t,
        }
      );

      // ✅ Update status fee jadi lunas
      await Fee_agen.update(
        {
          status_bayar: "lunas",
          pembayaran_fee_agen_id: insert.id,
          invoice,
          updatedAt: my_date,
        },
        {
          where: {
            id: {
              [Op.in]: body.fee_agen_id,
            },
          },
          transaction: this.t,
        }
      );

      this.message = `Pembayaran Fee Agen berhasil untuk invoice ${invoice}`;
      this.invoice = invoice;
      return invoice;
    } catch (error) {
      console.error("Gagal bayar fee agen:", error.message);
      throw error;
    }
  }

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
