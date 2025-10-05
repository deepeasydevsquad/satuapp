const { sequelize, Deposit, Member, Company, Jurnal } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.tipe = req;
    this.company_id = null;
    this.division_id = null;
    this.t = null;
    this.state = true;
    this.message = "";
    this.insertedDeposit = null; // ✅ Buat simpan hasil insert
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
  }

  async penerima() {
    this.tipe = await tipe(this.req);

    if (this.tipe === "administrator") {
      const company = await Company.findOne({
        where: { id: this.company_id },
      });
      return company?.company_name ?? "Unknown Company";
    }

    if (this.tipe === "staff") {
      const member = await Member.findOne({
        where: { company_id: this.company_id, role: "staff" },
        order: [["id", "DESC"]],
      });
      return member?.fullname ?? "Unknown Staff";
    }

    return "Tipe user tidak diketahui";
  }

  // ✅ Tambah deposit
  async tambahDeposit(invoice) {
    await this.initialize();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const member = await Member.findOne({
        where: { id: body.memberId },
      });

      if (!member) {
        throw new Error("Member tidak ditemukan");
      }

      const saldoSebelum = member.total_deposit ?? 0;
      const saldoSesudah = saldoSebelum + body.nominal;

      const insert = await Deposit.create(
        {
          division_id: body.division_id,
          member_id: body.memberId,
          invoice: invoice,
          nominal: body.nominal,
          saldo_sebelum: saldoSebelum,
          saldo_sesudah: saldoSesudah,
          sumber_dana: "cash",
          penerima: await this.penerima(),
          tipe_transaksi: "deposit",
          info: body.info,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // ✅ Simpan hasil insert ke properti class
      this.insertedDeposit = insert;

      await Member.update(
        {
          total_deposit: saldoSesudah,
        },
        {
          where: { id: body.memberId },
          transaction: this.t,
        }
      );

      // insert jurnal
      await Jurnal.create(
        {
          division_id: body.division_id, 
          source: '',
          ref: 'DEPOSIT SALDO MEMBER ' + member.fullname + ' dengan nominal Rp ' + body.nominal.toLocaleString("id-ID")  ,
          ket: 'DEPOSIT SALDO MEMBER ' + member.fullname + ' dengan nominal Rp ' + body.nominal.toLocaleString("id-ID"),
          akun_debet: '11010',
          akun_kredit: '24000',
          saldo: body.nominal,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan deposit ke ${ member.fullname } sebesar Rp${body.nominal.toLocaleString("id-ID")}`;
    } catch (error) {
      console.error("Gagal tambah deposit:", error);
      this.state = false;
      this.message = "Gagal menambahkan deposit";
    }
  }

  // ✅ Response handler
  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message });
      await this.t.commit();
      return true;
    } else {
      await this.t.rollback();
      return false;
    }
  }
}

// { success: false, message: this.message };
// { success: true, message: this.message };
// ,
// id: this.insertedDeposit?.id,
// invoice: this.insertedDeposit?.invoice,

module.exports = Model_cud;
