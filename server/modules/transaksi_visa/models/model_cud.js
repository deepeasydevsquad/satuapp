const { sequelize, Visa_transaction, Visa_transaction_detail, Company, Member, Mst_visa_request_type, Mst_bank, Jurnal, Division } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");
const { generateNomorInvoiceVisa } = require("../../../helper/randomHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.t; // transaction
    this.state = true; // status operasi
    this.message = ""; // pesan untuk log dan respons
    this.invoiceVisa
  }

  //Menginisialisasi transaksi database dan mengambil company_id dari token.

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req); //
    this.type = await tipe(this.req);
    this.t = await sequelize.transaction(); //
    this.state = true; //
  }

  //Menentukan nama petugas berdasarkan role dari token JWT.
  async petugas() {
    console.log("DEBUG [petugas]: Memulai fungsi petugas...");

    const role = await tipe(this.req); //
    console.log("DEBUG [petugas]: Role/Tipe yang didapat dari helper =>", role);

    console.log(
      "DEBUG [petugas]: Company ID yang digunakan =>",
      this.company_id
    );
    if (!this.company_id) {
      console.error("DEBUG [petugas]: GAGAL KARENA company_id KOSONG!");
      return "Error: Company ID tidak ditemukan";
    }

    if (role === "administrator") {
      console.log(
        "DEBUG [petugas]: Mencari data company sebagai administrator..."
      );
      const company = await Company.findOne({ where: { id: this.company_id } }); //
      console.log(
        "DEBUG [petugas]: Hasil pencarian company =>",
        company ? company.toJSON() : null
      );
      return company?.company_name ?? "Unknown Company"; //
    }

    if (role === "staff") {
      console.log("DEBUG [petugas]: Mencari data member sebagai staff...");
      const member = await Member.findOne({
        where: { company_id: this.company_id, role: "staff" }, //
        order: [["id", "DESC"]], //
      });
      console.log(
        "DEBUG [petugas]: Hasil pencarian member =>",
        member ? member.toJSON() : null
      );
      return member?.fullname ?? "Unknown Staff"; //
    }

    console.log(
      "DEBUG [petugas]: Role tidak dikenali, mengembalikan nilai default."
    );
    return "Tipe user tidak diketahui"; //
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

  async addVisa() {
    await this.initialize();
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {

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


      this.invoiceVisa = await generateNomorInvoiceVisa(this.req.body.cabang);
      // Insert ke Visa_transaction
      const insert = await Visa_transaction.create(
        {
          division_id: this.req.body.cabang,
          mst_visa_request_type_id: this.req.body.jenis_visa,
          kostumer_id: this.req.body.kostumer == 0 ? null : this.req.body.kostumer, 
          paket_id: this.req.body.paket == 0 ? null : this.req.body.paket, 
          invoice: this.invoiceVisa, 
          pax: this.req.body.pax,
          harga_travel: this.req.body.harga_travel,
          harga_costumer: this.req.body.harga_costumer,
          petugas: this.type,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      // ===== JURNAL ====
      // insert HPP Jurnal Visa
      await Jurnal.create(
        {
          division_id: this.req.body.cabang, 
          source: 'visaTransactionId:' + insert.id,
          ref: 'HPP Penjualan Visa ',
          ket: 'HPP Penjualan Visa ',
          akun_debet: '52000',
          akun_kredit: akun_kredit,
          saldo: this.req.body.pax * this.req.body.harga_travel,
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
          source: 'visaTransactionId:' + insert.id,
          ref: 'Pendapatan Penjualan Visa ',
          ket: 'Pendapatan Penjualan Visa ',
          akun_debet: '11010',
          akun_kredit: '45000',
          saldo: this.req.body.pax * this.req.body.harga_costumer,
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
            source: 'visaTransactionId:' + insert.id,
            ref: 'Pembayaran Utang Tabungan Untuk Penjualan Visa ',
            ket: 'Pembayaran Utang Tabungan Untuk Penjualan Visa ',
            akun_debet: '23000',
            akun_kredit: null,
            saldo: this.req.body.pax * this.req.body.harga_costumer,
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

      this.message = ` Melakukan proses transaksi visa dengan invoice ${this.invoice}.`;
    } catch (error) {

      console.log("XXXXXX");
      console.log(error);
      console.log("XXXXXX");
      this.state = false;
    }
  }

  async add() {
    await this.initialize();

    const petugas = await this.petugas();
    const invoice = await this.invoice();
    const body = this.req.body;
    const myDate = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      if (!Array.isArray(body.details) || body.details.length === 0) {
        throw new Error("Data details kosong.");
      }

      // Insert ke Visa_transaction
      const transaksi = await Visa_transaction.create(
        {
          invoice,
          company_id: this.company_id,
          petugas,
          kostumer_id: body.kostumer_id,
          paket_id: body.paket_id,
          createdAt: myDate,
          updatedAt: myDate,
        },
        { transaction: this.t }
      );

      // Insert ke Visa_transaction_detail
      const detailData = await Promise.all(
        body.details.map(async (d) => {
          return {
            visa_transaction_id: transaksi.id,
            mst_visa_request_type_id: d.jenis_visa,
            name: d.name,
            identity_number: d.identity_number,
            gender: d.gender ? d.gender.toLowerCase().replace("-", "_") : null,
            birth_place: d.birth_place,
            birth_date: d.birth_date,
            citizenship: d.origin_country,
            passport_number: d.passport_number,
            date_issued: d.passport_issued_date,
            place_of_release: d.passport_issued_place,
            valid_until: d.passport_expire_date,
            profession_idn: d.indonesia_job,
            profession_foreign: d.abroad_job,
            profession_address: d.work_address,
            pofession_pos_code: d.postal_code,
            profession_city: d.city,
            profession_country: d.origin_country,
            profession_telephone: d.phone,
            price: d.price,
            createdAt: myDate,
            updatedAt: myDate,
          };
        })
      );

      await Visa_transaction_detail.bulkCreate(detailData, {
        transaction: this.t,
      });

      this.invoice = invoice;
      this.message = `Transaksi visa berhasil disimpan dengan ${detailData.length} detail.`;
    } catch (error) {
      this.state = false;
      this.message = `Gagal simpan transaksi visa: ${error.message}`;
      console.error("VisaTransactionAddError:", error);
    }
  }

  //Menghapus data transaksi visa dari database.
  async hapus(transactionId) {
    // Terima ID sebagai parameter
    await this.initialize();

    try {
      const q = await Visa_transaction.findOne({
        where: {
          id: transactionId,
        }, 
        include: {
          required: true, 
          model: Division, 
          where: {
            company_id: this.company_id,
          }
        }
      });

      // Hapus transaksi utama
      await Visa_transaction.destroy({
        where: {
          id: transactionId,
        },
         include: {
          required: true, 
          model: Division, 
          where: {
            company_id: this.company_id,
          }
        },
        transaction: this.t,
      });

      // delete jurnal
      await Jurnal.destroy({
        where: {
          source: 'visaTransactionId:' + transactionId,
        },
        include: {
          model: Division, 
          required : true, 
          where: { 
              company_id: this.company_id
          }
        }, 
        transaction: this.t,
      });

      this.message = `Menghapus Transaksi Visa dengan ID: ${transactionId} dengan invoice pelanggan: ${q.invoice}`; //
    } catch (error) {
      console.log("xxxxAAA");
      console.log(error);
      console.log("xxxxAAA");
      this.state = false; //
    }
  }

  //Menyelesaikan transaksi (commit atau rollback) dan menulis log.
  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message }); //
      await this.t.commit(); //
      return true; //
    } else {
      await this.t.rollback(); //
      return false; //
    }
  }
}

module.exports = Model_cud;
