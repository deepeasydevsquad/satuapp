const {
  sequelize,
  Ticket_transaction,
  Ticket_transaction_detail,
  Ticket_transaction_refund,
  Ticket_payment_history,
  Ticket_reschedule_history,
  Ticket_reschedule_detail_history,
  Users,
  Member,
  Company,
} = require("../../../models");

const {
  getCabang,
  tipe,
  getCompanyIdByCode,
} = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id = null;
    this.company_id = null;
    this.division = null;
    this.t = null;
    this.state = true;
    this.message = "Berhasil melakukan refund tiket";
  }

  async initialize() {
    this.t = await sequelize.transaction();
    this.division = await getCabang(this.req);
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async penerima() {
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

  async generate_invoice() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters = () => {
      return (
        letters[Math.floor(Math.random() * 26)] +
        letters[Math.floor(Math.random() * 26)]
      );
    };

    const randomNumbers = () => {
      return Math.floor(10 + Math.random() * 90);
    };

    return `${randomLetters()}${randomNumbers()}`;
  }

  async reschedule_tiket() {
    await this.initialize();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const invoice = await this.generate_invoice();
    const petugas = await this.penerima();

    try {
      // 🔍 Validasi basic
      if (!body.ticket_transaction_id || !Array.isArray(body.details)) {
        throw new Error("Data tidak lengkap untuk proses reschedule.");
      }

      for (const detail of body.details) {
        if (
          !detail.ticket_transaction_detail_id ||
          !detail.departure_date ||
          detail.travel_price == null ||
          detail.costumer_price == null ||
          !detail.code_booking
        ) {
          throw new Error("Beberapa data detail tidak lengkap.");
        }
      }

      // 1. Ambil data transaksi lama
      const transaksi = await Ticket_transaction.findOne({
        where: { id: body.ticket_transaction_id },
        include: [
          { model: Ticket_transaction_detail },
          {
            model: Ticket_payment_history,
          },
        ],
        transaction: this.t,
      });

      if (!transaksi) throw new Error("Transaksi tidak ditemukan.");

      // 2. Hitung total baru
      const newTotalTransaction = body.details.reduce(
        (total, d) => total + Number(d.costumer_price || 0),
        0
      );

      // 3. Simpan ke history utama
      const tiket_reschedule = await Ticket_reschedule_history.create(
        {
          division_id: this.division,
          ticket_transaction_id: transaksi.id,
          old_total_transaction: transaksi.total_transaksi,
          new_total_transaction: newTotalTransaction,
          invoice: invoice,
          kostumer_id: body.kostumer_id,
          petugas: petugas,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      // 4. Insert semua ke detail history
      for (const detailBaru of body.details) {
        const detailLama = transaksi.Ticket_transaction_details.find(
          (d) => d.id === detailBaru.ticket_transaction_detail_id
        );

        if (!detailLama) {
          console.warn(
            "❌ Detail lama gak ditemukan untuk ID:",
            detailBaru.ticket_transaction_detail_id
          );
          continue;
        }

        await Ticket_reschedule_detail_history.create(
          {
            ticket_reschedule_history_id: tiket_reschedule.id,
            ticket_transaction_detail_id: detailLama.id,
            old_departure_date: detailLama.departure_date,
            old_travel_price: detailLama.travel_price,
            old_costumer_price: detailLama.costumer_price,
            old_code_booking: detailLama.code_booking,
            new_departure_date: detailBaru.departure_date,
            new_travel_price: detailBaru.travel_price,
            new_costumer_price: detailBaru.costumer_price,
            new_code_booking: detailBaru.code_booking,
            createdAt: myDate,
            updatedAt: myDate,
          },
          { transaction: this.t }
        );
      }

      // 5. Update total transaksi
      await Ticket_transaction.update(
        { total_transaksi: newTotalTransaction },
        { where: { id: transaksi.id }, transaction: this.t }
      );

      // 6 Update detail transaksi satu-satu
      for (const detailBaru of body.details) {
        const detailLama = transaksi.Ticket_transaction_details.find(
          (d) => d.id === detailBaru.ticket_transaction_detail_id
        );

        if (!detailLama) continue;

        await Ticket_transaction_detail.update(
          {
            departure_date: detailBaru.departure_date,
            travel_price: detailBaru.travel_price,
            costumer_price: detailBaru.costumer_price,
            code_booking: detailBaru.code_booking,
            updatedAt: myDate,
          },
          {
            where: { id: detailLama.id },
            transaction: this.t,
          }
        );
      }

      // 7. Hitung total nominal lama dari semua history pembayaran
      const totalNominalLama = transaksi.Ticket_payment_histories.reduce(
        (total, item) => total + Number(item.nominal || 0),
        0
      );

      // 8. Hapus semua history pembayaran lama
      await Ticket_payment_history.destroy({
        where: { ticket_transaction_id: transaksi.id },
        transaction: this.t,
      });

      // 9. Buat 1 payment history baru pakai total nominal lama
      await Ticket_payment_history.create(
        {
          ticket_transaction_id: transaksi.id,
          nominal: totalNominalLama,
          invoice: invoice,
          kostumer_id: body.kostumer_id,
          status: "cash",
          petugas: petugas,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      this.invoice = invoice;
      this.message = "Berhasil melakukan reschedule tiket";
    } catch (error) {
      console.error("❌ Error saat reschedule tiket:", error);
      this.state = false;
      this.message = error.message;
    }
  }

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

module.exports = Model_cud;
