const { 
  sequelize,
  Company,
  Jamaah,
  Headline,
  Deposit,
  Request_deposit_member,
  Riwayat_tabungan,
  Tabungan,
  Refund_tabungan,
  Division,
  Paket_transaction,
  Paket_transaction_payment_history,
  Member,
  } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
  } 

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
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
        where: { company_id: this.company_id },
        order: [["id", "DESC"]],
      });
      return member?.fullname ?? "Unknown Staff";
    }

    return "Tipe user tidak diketahui";
  }

  async generateInvoice() {
    // Generate a 6-character alphanumeric invoice code
    const possibleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const possibleNumbers = "0123456789";
    let invoice;
    let exists;

    do {
      const lettersPart = Array.from({ length: 3 }, () =>
        possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length))
      ).join("");
      
      const numbersPart = Array.from({ length: 3 }, () =>
        possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length))
      ).join("");

      invoice = lettersPart + numbersPart;

      const [inRiwayat, inRefund, inDeposit, inPaketPaymentHistory] = await Promise.all([
        Riwayat_tabungan.findOne({
          where: { invoice },
          attributes: ['id'],
          include: [{
            model: Tabungan,
            include: [{
              model: Division,
              where: { company_id: this.company_id },
            }],
          }],
        }),
        Refund_tabungan.findOne({
          where: { invoice },
          attributes: ['id'],
          include: [{
            model: Tabungan,
            include: [{
              model: Division,
              where: { company_id: this.company_id },
            }],
          }],
        }),
        Deposit.findOne({ 
          where: { invoice },
          attributes: ['id'],
          include: [{
            model: Division,
            where: { company_id: this.company_id },
          }]
        }),
        Paket_transaction_payment_history.findOne({ 
          where: { invoice },
          attributes: ['id'],
          include: [{
            model: Paket_transaction,
            include: [{
              model: Division,
              where: { company_id: this.company_id },
            }]
          }],
        }),
      ]);

      // pastikan invoice tidak ada yang sama di riwayat, refund, deposit, atau PaketPaymentHistory
      exists = inRiwayat || inRefund || inDeposit || inPaketPaymentHistory;

    } while (exists);
      return invoice;
  }

  async updateStatusRequestDepositMember() {
    await this.initialize();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const status = body.status;

    console.log("Status:", status);
    console.log("Body:", body);

    try {
      const invoice = await this.generateInvoice();
      const model = new Model_r(this.req);
      const info = await model.infoRequestDepositMember(body.id);

      console.log("Info:", info);

      const requestWhere = {
        id: body.id,
        company_id: this.company_id,
      };

      if (status === "disetujui") {
        // 1. Update status permintaan
        await Request_deposit_member.update(
          { status: "disetujui", status_note: "Permintaan deposit telah disetujui.", petugas: await this.penerima() },
          { where: requestWhere, transaction: this.t }
        );

        // 2. Update saldo deposit member
        const saldoSebelumnya = (info.total_deposit || 0);
        const saldoSesudah = saldoSebelumnya + info.nominal;

        // 3. Tambah saldo di Member
        await Member.update(
          { total_deposit: saldoSesudah },
          { where: { id: info.member_id }, transaction: this.t }
        );

        // 4. Catat log transaksi deposit
        await Deposit.create(
          {
            division_id: info.member_division_id,
            member_id: info.member_id,
            invoice,
            nominal: info.nominal,
            saldo_sebelum: saldoSebelumnya,
            saldo_sesudah: saldoSesudah,
            sumber_dana: "deposit",
            penerima: await this.penerima(),
            tipe: "deposit",
            info: `Deposit disetujui: Rp${info.nominal.toLocaleString()}`,
            createdAt: myDate,
            updatedAt: myDate,
          },
          { transaction: this.t }
        );
        this.message = `Permintaan deposit member dengan ID ${body.id} telah disetujui.`;
      } else if (status === "ditolak") {
        await Request_deposit_member.update(
          { status: "ditolak", status_note: "Permintaan deposit telah ditolak.", petugas: await this.penerima() },
          { where: requestWhere, transaction: this.t }
        );
        this.message = `Permintaan deposit member dengan ID ${body.id} telah ditolak.`;
      }

    } catch (error) {
      console.error("Error in updateStatusRequestDepositMember:", error);
      this.state = false;
    }
  }

  async deleteRequestDepositMember() {
    await this.initialize();
    const body = this.req.body;

    try {
      await Request_deposit_member.destroy({
        transaction: this.t,
        where: { id: body.id, company_id: this.company_id },
      });

      this.message = "Permintaan deposit member berhasil dihapus dengan id " + body.id;
    } catch (error) {
      console.log("Error in deleteRequestDepositMember:", error);
      this.state = false;
    }
  }

  async deleteHeadline() {
    await this.initialize();
    const body = this.req.body;

    try {
      await Headline.destroy({
        transaction: this.t,
        where: { id: body.id, company_id: this.company_id },
      });

      this.message = "Headline berhasil dihapus dengan id " + body.id;
    } catch (error) {
      console.log("Error in deleteHeadline:", error);
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
