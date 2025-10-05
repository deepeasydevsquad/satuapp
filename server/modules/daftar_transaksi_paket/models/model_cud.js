const { 
  sequelize,
  Op,
  Company,
  Division,
  Paket_transaction,
  Paket_transaction_payment_history,
  Tabungan,
  Riwayat_tabungan,
  Refund_tabungan,
  Fee_agen,
  Member,
  Deposit,
  Handover_fasilitas,
  Handover_barang,
  Paket, 
  Jurnal
  } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, tipe, getDivisionId } = require("../../../helper/companyHelper");
const moment = require("moment");
const { getJamaahInfo } = require("../../../helper/JamaahHelper");

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

  async generateInvoiceAgen() {
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
      
      const inDeposit = await Fee_agen.findOne({ where: { invoice, company_id: this.company_id } });
      exists = inDeposit;
    } while (exists);
    return invoice;
  }

  async generateInvoiceHandover() {
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
      
      const inHandoverFasilitas = await Handover_fasilitas.findOne({
        where: { invoice },
        include: [{
          model: Tabungan,
          include: [{
            model: Division,
            where: { company_id: this.company_id },
          }],
        }],
      });

      const inHandoverBarang = await Handover_barang.findOne({
        where: {
          [Op.or]: [
            { invoice_handover: invoice },
            { invoice_returned: invoice },
          ],
        },
        include: [{
          model: Tabungan,
          include: [{
            model: Division,
            where: { company_id: this.company_id },
          }],
        }],
      });

      exists = inHandoverFasilitas || inHandoverBarang;
    } while (exists);
    return invoice;
  }
  
  // === CREATE ===
  async addTransaksiPaket() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    
    try {
      // call object
      const model_r = new Model_r(this.req);
      
      // get division_id from paket
      var division_id = 0
      await Paket.findOne({ 
        include: {
          required: true,
          model: Division,
          where: { company_id: this.company_id },
        },
        where: { id: body.id
        }
      }).then(async (e) => {
        if (e) { division_id = e.division_id; }
      });

      // get info tabungan
      const infoPaket = await model_r.infoPaket(body.id, body.paket_types_id, division_id);
      const invoicePaketTransactionPaymentHistory = await this.generateInvoice();
      const penerima = await this.penerima();
      const jamaah = await getJamaahInfo(body.jamaah_id);
      console.log("___________AAAA___________");
      console.log(infoPaket);
      console.log("___________AAAA___________");
      // console.log("Data Body:", body);
      // console.log("Company ID:", this.company_id);
      // console.log("Division ID:", division_id);
      // console.log("Invoice Tabungan:", invoicePaketTransactionPaymentHistory);
      
      // === 1. Insert ke tabel fee agen ===
      let agenId = null;
      if (jamaah?.Agen) {
        const invoiceAgen = await this.generateInvoiceAgen();
        const agen = await Fee_agen.create({
          company_id: this.company_id,
          agen_id: jamaah.Agen.id,
          invoice: invoiceAgen,
          nominal: jamaah.Agen.Level_keagenan.default_fee || 0,
          status_bayar: 'belum_lunas',
          info: `Fee dari transaksi ${moment(dateNow).format('YYYY-MM-DD')}`,
          pembayaran_fee_agen_id: null,
          createdAt: dateNow,
          updatedAt: dateNow,
        }, 
        { 
          transaction: this.t 
        });
        agenId = agen.id;
      }

      // === 2. Insert ke tabel paket transaction ===
      const paketTransaction = await Paket_transaction.create({
        division_id: division_id,
        jamaah_id: body.jamaah_id,
        fee_agen_id: agenId,
        paket_id: body.id,
        mst_paket_type_id: body.paket_types_id,
        price: infoPaket.price,
        batal_berangkat: "tidak",
        from: "transaksi_paket",
        biaya_mahram: infoPaket.mahram_fee,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, 
      { 
        transaction: this.t 
      });

      // === 3. Insert ke tabel paket transaction payment history
      await Paket_transaction_payment_history.create({
        paket_transaction_id: paketTransaction.id,
        invoice: invoicePaketTransactionPaymentHistory,
        nominal: infoPaket.price,
        penerima: penerima,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, 
      { 
        transaction: this.t 
      });

      // insert jurnal
      await Jurnal.create(
        {
          division_id: division_id, 
          source: '',
          ref: 'PEMBELIAN PAKET OLEH MEMBER ' + jamaah.Member.fullname + ' dengan nominal Rp ' + infoPaket.price.toLocaleString("id-ID")  ,
          ket: 'PEMBELIAN PAKET OLEH MEMBER ' + jamaah.Member.fullname + ' dengan nominal Rp ' + infoPaket.price.toLocaleString("id-ID"),
          akun_debet: '11010',
          akun_kredit: '23000',
          saldo: infoPaket.price,
          removable: 'false',
          periode_id: 0,
          createdAt: dateNow,
          updatedAt: dateNow,
        },
        {
          transaction: this.t,
        }
      );


      this.message = `Transaksi paket berhasil ditambahkan dengan invoice: ${invoicePaketTransactionPaymentHistory}`;
      return invoicePaketTransactionPaymentHistory;
    } catch (error) {
      console.log("Error in addTransaksiPaket:", error);
      this.state = false;
    }
  }

  // ==== UPDATE VISA TRANSAKSI PAKET ====
  async updateVisaTransaksiPaket() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    const division_id = await getDivisionId(this.req);

    try {
      await Paket_transaction.update({
        nomor_visa: body.nomor_visa,
        tanggal_berlaku_visa: body.tanggal_berlaku_visa,
        tanggal_berakhir_visa: body.tanggal_berakhir_visa,
        updatedAt: dateNow,
      }, {
        where: {
          id: body.transpaketId,
          paket_id: body.id,
          division_id: division_id
        }, transaction: this.t});

      this.message = `Mengupdate visa transaksi paket id: ${body.id}`;
    } catch (error) {
      console.log("Error in updateVisaTransaksiPaket:", error);
      this.state = false;
    }
  }

  // ==== REFUND TRANSAKSI PAKET ====
  async refundTransaksiPaket() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    const division_id = await getDivisionId(this.req);

    try {
      const model_r = new Model_r(this.req);
      const infoDaftarTransaksiPaket = await model_r.infoDaftarTransaksiPaket(body.transpaketId, this.division_id);
      const invoicePaketTransactionPaymentHistory = await this.generateInvoice();
      
      console.log(infoDaftarTransaksiPaket);
      console.log(body);

      await Paket_transaction.update({
        price: infoDaftarTransaksiPaket.price - body.nominal_refund,
        updatedAt: dateNow,
      }, {
        where: {
          id: body.transpaketId,
          paket_id: body.id,
          division_id: division_id
        }, transaction: this.t});

      await Paket_transaction_payment_history.create({
        paket_transaction_id: body.transpaketId,
        invoice: invoicePaketTransactionPaymentHistory,
        nominal: -body.nominal_refund,
        penerima: infoDaftarTransaksiPaket.Member.fullname.toUpperCase(),
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });
      
      this.message = `Refund transaksi paket id: ${body.id}`;
    } catch (error) {
      console.log("Error in refundTransaksiPaket:", error);
      this.state = false;
    }
  };

  // ==== DELETE ====
  async deleteTransaksiPaket() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    const division_id = await getDivisionId(this.req);

    try {
      await Paket_transaction.destroy({
        where: {
          id: body.transpaketId,
          paket_id: body.id,
          division_id: division_id
        }, transaction: this.t});

      this.message = `Menghapus transaksi paket id: ${body.id}`;
    } catch (error) {
      console.error("Error deleting tabungan:", error);
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
