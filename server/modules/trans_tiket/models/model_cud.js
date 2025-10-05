const { sequelize, Ticket_transaction, Ticket_payment_history, Jurnal, Mst_airline, Division } = require("../../../models");
const { getCabang, getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");
const { generateNomorRegisterTicket, generateNomorInvoicePembayaranTicket } = require("../../../helper/randomHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
    this.result = null;
  }
  async initialize() {
    this.t = await sequelize.transaction();
    this.division_id = await getCabang(this.req);
    this.company_id = await getCompanyIdByCode(this.req);
    this.type = await tipe(this.req);
    this.state = true;
  }

  async generateNomorInvoice() {
    try {
      const nomorInvoice =
        await Ticket_payment_history.generateUniqueNomorInvoice();
      return {
        status: 200,
        message: "Nomor Invoice Berhasil Digenerate",
        data: { invoice: nomorInvoice },
      };
    } catch (error) {
      return {
        status: 200,
        message: "Nomor Invoice Gagal digenerate",
        data: {},
      };
    }
  }

  async generateNomorRegister() {
    try {
      const nomorRegister =
        await Ticket_transaction.generateUniqueNomorRegister();
      return {
        status: 200,
        message: "Nomor Register Berhasil Digenerate",
        data: { nomor_register: nomorRegister },
      };
    } catch (error) {
      return {
        status: 200,
        message: "Nomor Register Gagal digenerate",
        data: {},
      };
    }
  }

  async add() {
    await this.initialize();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      // generate nomor_register
      const nomor_register = await generateNomorRegisterTicket(body.cabang);
      // get info maskapai
      const q = await Mst_airline.findOne({
        where: { company_id: this.company_id, id: body.maskapai },
      });
      // total
      const total = body.pax * body.harga_kostumer;
      // insert ke table Ticket_transactions
      const insert = await Ticket_transaction.create(
        {
          division_id: this.division_id,
          nomor_registrasi: nomor_register,
          airlines_id: body.maskapai,
          kostumer_id: body.kostumer == 0 ? null : body.kostumer,
          paket_id: body.paket == 0 ? null : body.paket,
          status: "active",
          pax: body.pax,
          code_booking: body.kode_booking,
          travel_price: body.harga_travel,
          costumer_price: body.harga_kostumer,
          departure_date: moment(body.tanggal_keberangkatan).format(
            "YYYY-MM-DD"
          ),
          arrival_date: moment(body.tanggal_kepulangan).format("YYYY-MM-DD"),
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );
      // insert HPP Jurnal
      await Jurnal.create(
        {
          division_id: body.cabang,
          source: "ticketTransactionId:" + insert.id,
          ref: "HPP Penjualan Tiket " + q.name,
          ket: "HPP Penjualan Tiket " + q.name,
          akun_debet: q.nomor_akun_hpp,
          akun_kredit: q.nomor_akun_deposit,
          saldo: body.pax * body.harga_travel,
          removable: "false",
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      if (body.dibayar > 0) {
        const invoice = await generateNomorInvoicePembayaranTicket(body.cabang);
        await Ticket_payment_history.create(
          {
            ticket_transaction_id: insert.id,
            invoice: invoice,
            nominal: body.dibayar,
            status: "cash",
            petugas: this.type,
          },
          { transaction: this.t }
        );

        // -- JURNAL --
        // jika pembayaran tidak dilakukan secara full
        if (body.dibayar < total) {
          // insert Kas Atau Pembayaran Utang Tabungan
          await Jurnal.create(
            {
              division_id: body.cabang,
              source: "ticketTransactionId:" + insert.id,
              ref: "Kas / Pembayaran utang untuk Penjualan Tiket " + q.name,
              ket: "Kas / Pembayaran utang untuk Penjualan Tiket " + q.name,
              akun_debet: body.paket ? "23000" : "11010",
              akun_kredit: null,
              saldo: body.dibayar,
              removable: "false",
              periode_id: 0,
              createdAt: myDate,
              updatedAt: myDate,
            },
            {
              transaction: this.t,
            }
          );
          // Insert Piutang
          await Jurnal.create(
            {
              division_id: body.cabang,
              source: "ticketTransactionId:" + insert.id,
              ref: "Piutang untuk penjualan tiket " + q.name,
              ket: "Piutang untuk penjualan tiket " + q.name,
              akun_debet: "13000",
              akun_kredit: null,
              saldo: total - body.dibayar,
              removable: "false",
              periode_id: 0,
              createdAt: myDate,
              updatedAt: myDate,
            },
            {
              transaction: this.t,
            }
          );
          // Insert Pendatapatan Maskapai
          await Jurnal.create(
            {
              division_id: body.cabang,
              source: "ticketTransactionId:" + insert.id,
              ref: "Pendapatan untuk penjualan tiket " + q.name,
              ket: "Pendapatan untuk penjualan tiket " + q.name,
              akun_debet: null,
              akun_kredit: q.nomor_akun_pendapatan,
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
        } else {
          // Jika pembayaran dilakukan secara full
          // Insert Pendapatan Jurnal
          await Jurnal.create(
            {
              division_id: body.cabang,
              source: "ticketTransactionId:" + insert.id,
              ref: "Pendapatan Penjualan Tiket " + q.name,
              ket: "Pendapatan Penjualan Tiket " + q.name,
              akun_debet: body.paket ? "23000" : "11010",
              akun_kredit: q.nomor_akun_pendapatan,
              saldo: body.dibayar,
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
      }

      this.register_number = nomor_register;
    } catch (error) {
      this.state = false;
    }
  }

  async invoice() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters =
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)];

    const randomNumbers = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0"); // pastiin selalu 6 digit

    return randomLetters + randomNumbers;
  }

  async add_pembayaran_tikects() {
    await this.initialize();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

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

      // generated invoice
      const invoice = await generateNomorInvoicePembayaranTicket(q.division_id);
      //
      await Ticket_payment_history.create(
        {
          ticket_transaction_id: this.req.body.id,
          invoice: invoice,
          nominal: body.dibayar,
          status: "cash",
          petugas: this.type,
        },
        { transaction: this.t }
      );

      // Insert Pendatapatan Maskapai
      await Jurnal.create(
        {
          division_id: q.division_id,
          source: "ticketTransactionId:" + this.req.body.id,
          ref: "Pembayaran utang untuk Penjualan Tiket " + q.Mst_airline.name,
          ket: "Pembayaran utang untuk Penjualan Tiket " + q.Mst_airline.name,
          akun_debet: null,
          akun_kredit: "13000",
          saldo: this.req.body.dibayar,
          removable: "false",
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = "Pembayaran Tiker Berhasil ";
      return invoice;
    } catch (error) {
      this.state = false;
      return "";
    }
  }

  async update() {
    await this.initialize();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");
    try {
      // update ticket transaction
      await Ticket_transaction.update(
        {
          airlines_id: this.req.body.maskapai_id,
          pax: this.req.body.pax,
          code_booking: this.req.body.kode_booking,
          travel_price: this.req.body.harga_travel,
          costumer_price: this.req.body.harga_kostumer,
          departure_date: moment(this.req.body.tanggal_keberangkatan).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          updatedAt: myDate,
        },
        {
          where: { id: this.req.body.id },
        },
        {
          transaction: this.t,
        }
      );
      // destroy Jurnal
      await Jurnal.destroy(
        {
          where: { source: "ticketTransactionId:" + this.req.body.id },
          include: {
            required: true,
            model: Division,
            where: { company_id: this.company_id },
          },
        },
        {
          transaction: this.t,
        }
      );
      // get informasi transaksi tiket
      const q = await Ticket_transaction.findOne({
        where: { id: this.req.body.id },
        include: [
          {
            model: Division,
            required: true,
            where: { company_id: this.company_id },
          },
          {
            model: Mst_airline,
            required: true,
          },
        ],
      });
      // get informasi sudah bayar
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
      // get total
      var total = q.pax * q.costumer_price;
      // insert HPP Jurnal
      await Jurnal.create(
        {
          division_id: q.division_id,
          source: "ticketTransactionId:" + q.id,
          ref: "HPP Penjualan Tiket " + q.Mst_airline.name,
          ket: "HPP Penjualan Tiket " + q.Mst_airline.name,
          akun_debet: q.Mst_airline.nomor_akun_hpp,
          akun_kredit: q.Mst_airline.nomor_akun_deposit,
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

      // filter
      if (sudah_bayar < total) {
        // insert Kas Atau Pembayaran Utang Tabungan
        await Jurnal.create(
          {
            division_id: q.division_id,
            source: "ticketTransactionId:" + q.id,
            ref:
              "Kas / Pembayaran utang untuk Penjualan Tiket " +
              q.Mst_airline.name,
            ket:
              "Kas / Pembayaran utang untuk Penjualan Tiket " +
              q.Mst_airline.name,
            akun_debet: q.paket_id ? "23000" : "11010",
            akun_kredit: null,
            saldo: sudah_bayar,
            removable: "false",
            periode_id: 0,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
        // Insert Piutang
        await Jurnal.create(
          {
            division_id: q.division_id,
            source: "ticketTransactionId:" + q.id,
            ref: "Piutang untuk Penjualan Tiket " + q.Mst_airline.name,
            ket: "Piutang untuk Penjualan Tiket " + q.Mst_airline.name,
            akun_debet: "13000",
            akun_kredit: null,
            saldo: total - sudah_bayar,
            removable: "false",
            periode_id: 0,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
        // Insert Pendapatan Maskapai
        await Jurnal.create(
          {
            division_id: q.division_id,
            source: "ticketTransactionId:" + q.id,
            ref: "Pendapatan untuk Penjualan Tiket " + q.Mst_airline.name,
            ket: "Pendapatan untuk Penjualan Tiket " + q.Mst_airline.name,
            akun_debet: null,
            akun_kredit: q.Mst_airline.nomor_akun_pendapatan,
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
      } else {
        // Insert Pendapatan Jurnal
        await Jurnal.create(
          {
            division_id: q.division_id,
            source: "ticketTransactionId:" + q.id,
            ref: "Pendapatan Penjualan Tiket " + q.Mst_airline.name,
            ket: "Pendapatan Penjualan Tiket " + q.Mst_airline.name,
            akun_debet: q.paket_id ? "23000" : "11010",
            akun_kredit: q.Mst_airline.nomor_akun_pendapatan,
            saldo: sudah_bayar,
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

      this.message = `Melakukan update data ticket dengan id ${this.req.body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // delete
  async delete() {
    await this.initialize();

    try {
      // destroy Ticket Payment History
      await Ticket_payment_history.destroy(
        {
          where: { ticket_transaction_id: this.req.body.id },
          include: {
            required: true,
            model: Ticket_transaction,
            include: {
              required: true,
              model: Division,
              where: { company_id: this.company_id },
            },
          },
        },
        { transaction: this.t }
      );

      // destroy Ticket Transaction
      await Ticket_transaction.destroy(
        {
          where: { id: this.req.body.id },
          include: {
            required: true,
            model: Division,
            where: { company_id: this.company_id },
          },
        },
        {
          transaction: this.t,
        }
      );

      // destroy Jurnal
      await Jurnal.destroy(
        {
          where: { source: "ticketTransactionId:" + this.req.body.id },
          include: {
            required: true,
            model: Division,
            where: { company_id: this.company_id },
          },
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menghapus data ticket dengan id ${this.req.body.id}`;
    } catch (error) {
      this.state = false;
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
