const { sequelize, Passport_transaction, Passport_transaction_detail, Company, Member, Mst_bank, Jurnal, Division } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.t;
    this.state = true;
    this.message = "";
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  //Menentukan nama petugas berdasarkan role dari token JWT.
  async petugas() {
    const role = await tipe(this.req);

    if (!this.company_id) {
      console.error("DEBUG [petugas]: GAGAL KARENA company_id KOSONG!");
      return "Error: Company ID tidak ditemukan";
    }

    if (role === "administrator") {
      const company = await Company.findOne({ where: { id: this.company_id } });

      return company?.company_name ?? "Unknown Company";
    }

    if (role === "staff") {
      console.log("DEBUG [petugas]: Mencari data member sebagai staff...");
      const member = await Member.findOne({
        where: { company_id: this.company_id, role: "staff" },
        order: [["id", "DESC"]],
      });
      return member?.fullname ?? "Unknown Staff";
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

  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const invoice = await this.generate_invoice();

    try {
      const namaPetugas = await this.petugas();
      if (namaPetugas.startsWith("Error:") || namaPetugas.includes("Unknown")) {
        throw new Error(
          `Gagal menentukan petugas yang valid. Diterima: ${namaPetugas}`
        );
      }
      const newTransaction = await Passport_transaction.create(
        {
          invoice: invoice,
          division_id: body.cabang,
          petugas: namaPetugas,
          kostumer_id: this.req.body.kostumer == 0 ? null : this.req.body.kostumer,
          paket_id: this.req.body.paket == 0 ? null : this.req.body.paket,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      const newTransactionId = newTransaction.id;

      var total_harga_travel = 0;
      var total_harga_kostumer = 0;

      if (body.passport_details && Array.isArray(body.passport_details)) {
        for (const detail of body.passport_details) {
          
          total_harga_travel = total_harga_travel + detail.price;
          total_harga_kostumer = total_harga_kostumer + detail.priceCostumer;

          await Passport_transaction_detail.create(
            {
              passport_transaction_id: newTransactionId,
              name: detail.name,
              identity_number: detail.identity_number,
              birth_place: detail.birth_place,
              birth_date: detail.birth_date,
              kk_number: detail.kk_number,
              address: detail.address,
              mst_kota_id: detail.city,
              price: detail.price,
              priceCostumer: detail.priceCostumer,
              createdAt: myDate,
              updatedAt: myDate,
            },
            { transaction: this.t }
          );
        }
      } else {
        throw new Error(
          "Data detail passport tidak ditemukan atau tidak valid."
        );
      }

      // jurnal 
      var akun_kredit = '';
      if(this.req.body.sumber_dana == 0) {
        akun_kredit = '11010'; //
      }else{
        const q = await Mst_bank.findOne({
          where: {
            id: this.req.body.sumber_dana,
            company_id: this.company_id
          },
        });
        akun_kredit = q.nomor_akun;
      }


      // ===== JURNAL ====
      // insert HPP Jurnal Visa
      await Jurnal.create(
        {
          division_id: this.req.body.cabang, 
          source: 'passportTransactionId:' + newTransactionId,
          ref: 'HPP Penjualan Passport ',
          ket: 'HPP Penjualan Passport ',
          akun_debet: '54000',
          akun_kredit: akun_kredit,
          saldo: total_harga_travel,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // insert Pendapatan Jurnal Visa
      await Jurnal.create(
        {
          division_id: this.req.body.cabang, 
          source: 'passportTransactionId:' + newTransactionId,
          ref: 'Pendapatan Penjualan Passport ',
          ket: 'Pendapatan Penjualan Passport ',
          akun_debet: '11010',
          akun_kredit: '46000',
          saldo: total_harga_kostumer,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // tambah pengurangan utang tabungan
      if( this.req.body.paket != 0 ) {
        await Jurnal.create(
          {
            division_id: this.req.body.cabang, 
            source: 'passportTransactionId:' + newTransactionId,
            ref: 'Pembayaran Utang Tabungan Untuk Penjualan Passport ',
            ket: 'Pembayaran Utang Tabungan Untuk Penjualan Passport ',
            akun_debet: '23000',
            akun_kredit: null,
            saldo: total_harga_kostumer,
            removable: 'false',
            periode_id: 0,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
      }

      await this.t.commit();
      this.message = `Menambahkan Transaksi Passport Baru untuk : ${body.payer} dengan ID Transaksi : ${newTransactionId} oleh petugas: ${namaPetugas}`;
    } catch (error) {
      if (this.t) await this.t.rollback();
      console.error("Error di model CUD add:", error);
      this.state = false;
      this.message = `Gagal menambahkan transaksi: ${error.message}`;
    }
  }

  async hapus(transactionId) {
    await this.initialize();

    try {
      const namaPetugas = await this.petugas(); //
      const existingTransaction = await Passport_transaction.findOne({
        where: {
          id: transactionId,
        }, //
        include: {
          model: Division,
          required: true, 
          where: {
            company_id: this.company_id
          }
        }, 
      });

      if (!existingTransaction) {
        throw new Error(
          "Data transaksi passport tidak ditemukan atau Anda tidak memiliki akses"
        );
      }

      // Hapus detail transaksi terlebih dahulu
      await Passport_transaction_detail.destroy({
        where: { Passport_transaction_id: transactionId },
        transaction: this.t,
      }); //

      // Hapus transaksi utama
      await Passport_transaction.destroy({
        where: {
          id: transactionId,
        },
        transaction: this.t,
      }); //

      // delete jurnal
      await Jurnal.destroy({
        where: {
          source: 'passportTransactionId:' + transactionId
        },
        include: {
          model: Division,
          required: true, 
          where: {
            company_id: this.company_id
          }
        }, 
        transaction: this.t,
      }); //

      await this.t.commit();

      this.message = `Menghapus Transaksi Passport dengan ID: ${transactionId} untuk pelanggan: ${existingTransaction.payer} oleh petugas: ${namaPetugas}`; //
    } catch (error) {
      if (this.t) await this.t.rollback();
      console.error("Error di model CUD hapus:", error);
      this.state = false;
      this.message = error.message;
    }
  }

  async response() {
    return this.state;
  }
}

module.exports = Model_cud;
