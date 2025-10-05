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
const { where } = require("sequelize");

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
    console.log("✅ Initialize selesai");

    const penerima = await this.penerima();
    console.log("✅ Penerima:", penerima);

    await this.transaction();
    console.log("✅ Transaction dimulai");

    const body = this.req.body;
    const my_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      console.log("📦 Body request:", body);

      const aplicant = await Agen.findOne({
        where: { id: body.agen_id },
        include: [
          {
            model: Member,
            required: true,
            attributes: ["fullname", "identity_number"],
          },
        ],
      });
      console.log("✅ Data agen & member:", aplicant?.Member);

      // ✅ Validasi fee
      const validFees = await validateFeeAgenBelumDibayar(
        body.fee_agen_id,
        this.company_id
      );
      console.log("✅ Fee tervalidasi:", validFees);

      let invoice = await menghasilkan_invoice_fee_agen();
      console.log("🧾 Invoice awal:", invoice);

      // Cek invoice unik
      while (!(await isInvoiceUnique(invoice))) {
        console.log("🔁 Invoice bentrok, generate ulang...");
        invoice = await menghasilkan_invoice_fee_agen();
      }
      console.log("✅ Invoice unik:", invoice);

      // ✅ Insert pembayaran fee agen
      const insert = await Pembayaran_fee_agen.create(
        {
          division_id: this.division,
          agen_id: body.agen_id,
          invoice,
          applicant_name: aplicant.Member.fullname,
          applicant_identity: aplicant.Member.identity_number,
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
      console.log("✅ Data pembayaran fee berhasil ditambahkan:", insert.id);

      // ✅ Update status fee jadi lunas
      const updated = await Fee_agen.update(
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
      console.log("✅ Status fee diupdate jadi lunas:", updated);

      this.message = `Pembayaran Fee Agen berhasil untuk invoice ${invoice}`;
      this.invoice = invoice;
      return invoice;
    } catch (error) {
      console.error("❌ Gagal bayar fee agen:", error.message);
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
