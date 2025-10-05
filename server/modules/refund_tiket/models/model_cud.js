const {
  sequelize,
  Ticket_transaction,
  Mst_airline,
  Division,
  Users,
  Member,
  Company,
  Jurnal,
  Ticket_payment_history,
} = require("../../../models");
const {
  getCabang,
  tipe,
  getCompanyIdByCode,
} = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  generateNomorInvoicePembayaranTicket,
} = require("../../../helper/randomHelper");
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

  async refund_tiket() {
    await this.initialize();
    const petugas = await this.penerima();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    try {
      const q = await Ticket_transaction.findOne({
        where: {
          id: this.req.body.id,
        },
        include: [
          {
            model: Division,
            required: true,
            where: {
              company_id: this.company_id,
            },
          },
          {
            model: Mst_airline,
            required: true,
          },
        ],
      });

      var sudah_bayar = 0;
      await Ticket_payment_history.findAll({
        attributes: ["id", "nominal", "status"],
        where: { ticket_transaction_id: this.req.body.id },
        include: {
          model: Ticket_transaction,
          required: true,
          where: { division_id: q.division_id },
        },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            if (e.status == "cash") {
              sudah_bayar = sudah_bayar + parseInt(e.nominal);
            }
          })
        );
      });

      const invoice = await generateNomorInvoicePembayaranTicket(q.division_id);

      await Ticket_transaction.update(
        { status: "refund", total_transaksi: 0 },
        { where: { id: this.req.body.id }, transaction: this.t }
      );

      await Ticket_payment_history.create(
        {
          ticket_transaction_id: this.req.body.id,
          nominal: this.req.body.refund,
          invoice: invoice,
          status: "refund",
          petugas,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      // ===== PROSES JURNAL =====
      const total = q.pax * q.costumer_price;
      // kembalikan / Reverse biaya deposit
      await Jurnal.create(
        {
          division_id: q.division_id,
          source: "ticketTransactionId:" + this.req.body.id,
          ref: "Refund HPP Penjualan Tiket " + q.Mst_airline.name,
          ket: "Refund HPP Penjualan Tiket " + q.Mst_airline.name,
          akun_debet: q.Mst_airline.nomor_akun_deposit,
          akun_kredit: q.Mst_airline.nomor_akun_hpp,
          saldo: q.pax * q.travel_price,
          removable: "false",
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // pendapatan administratif jika refund
      if (body.fee > 0) {
        await Jurnal.create(
          {
            division_id: q.division_id,
            source: "ticketTransactionId:" + q.id,
            ref:
              "Pendapatan Administratif Refund Penjualan Tiket " +
              q.Mst_airline.name,
            ket:
              "Pendapatan Administratif Refund Penjualan Tiket " +
              q.Mst_airline.name,
            akun_debet: null,
            akun_kredit: q.Mst_airline.nomor_akun_pendapatan,
            saldo: body.fee,
            removable: "false",
            periode_id: 0,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
      }

      // Reverse pendapatan maskapai
      await Jurnal.create(
        {
          division_id: q.division_id,
          source: "ticketTransactionId:" + q.id,
          ref: "Refund Pendapatan Penjualan Tiket " + q.Mst_airline.name,
          ket: "Refund Pendapatan Penjualan Tiket " + q.Mst_airline.name,
          akun_debet: q.Mst_airline.nomor_akun_pendapatan,
          akun_kredit: null,
          saldo: total,
          removable: "false",
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // reverse Kas / Pembayaran Utan
      await Jurnal.create(
        {
          division_id: q.division_id,
          source: "ticketTransactionId:" + q.id,
          ref:
            "Refund Kas / Pembayaran utang untuk Penjualan Tiket " +
            q.Mst_airline.name,
          ket:
            "Refund Kas / Pembayaran utang untuk Penjualan Tiket " +
            q.Mst_airline.name,
          akun_debet: null,
          akun_kredit: q.paket_id ? "23000" : "11010",
          saldo: body.refund,
          removable: "false",
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      if (sudah_bayar < total) {
        // kembalikan tanpa proses piutang
        await Jurnal.create(
          {
            division_id: q.division_id,
            source: "ticketTransactionId:" + q.id,
            ref:
              "Refund Piutang utang untuk Penjualan Tiket " +
              q.Mst_airline.name,
            ket:
              "Refund Piutang utang untuk Penjualan Tiket " +
              q.Mst_airline.name,
            akun_debet: null,
            akun_kredit: "13000",
            saldo: total - (body.refund + body.fee),
            removable: "false",
            periode_id: 0,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
      }

      this.message = "Berhasil melakukan refund tiket";
      this.invoice = invoice;
    } catch (error) {
      this.state = false;
      console.error("refund_tiket error:", error);
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
