const { 
  sequelize,
  Op,
  Sequelize,
  Company,
  Division,
  Paket_price,
  Paket_transaction,
  Paket_transaction_payment_history,
  Tabungan,
  Jamaah,
  Riwayat_tabungan,
  Refund_tabungan,
  Fee_agen,
  Member,
  Deposit,
  Mst_fasilitas,
  Handover_fasilitas,
  Handover_fasilitas_detail,
  Handover_fasilitas_detail_paket,
  Handover_fasilitas_paket,
  Handover_barang,
  Handover_barang_paket,
  Item_fasilitas,
  Jurnal,
  Transaction_fasilitas,
  Transaction_fasilitas_detail
  } = require("../../../models");
const Model_r = require("../models/model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const { generateInvoiceHandoverFasilitas } = require("../../../helper/randomHelper");
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

  async getDivisionId() {
    const userType = await tipe(this.req);
    if (userType === "administrator") {
      return this.req.body.division_id;
    } else if (userType === "staff") {
      const decoded = jwt.decode(
        this.req.headers["authorization"]?.split(" ")[1]
      );
      return decoded?.division_id;
    } else {
      throw new Error("Role pengguna tidak valid.");
    }
  }
  
  // === CREATE ===
  async add() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    
    try {
      let invoiceTabungan, invoiceDeposit;
      do {
        invoiceTabungan = await this.generateInvoice();
        invoiceDeposit = await this.generateInvoice();
      } while (invoiceTabungan === invoiceDeposit);
      
      const penerima = await this.penerima();
      const division_id = await this.getDivisionId();
      const jamaah = await getJamaahInfo(body.jamaah_id);

      // === 1. Insert ke tabel TABUNGAN ===
      const tabungan = await Tabungan.create({
        division_id: division_id,
        jamaah_id: body.jamaah_id,
        target_paket_id: body.target_id,
        total_tabungan: body.biaya_deposit,
        status: 'active',
        fee_agen_id: null,
        batal_berangkat: 'tidak',
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // === 2. Insert ke tabel RIWAYAT_TABUNGAN ===
      await Riwayat_tabungan.create({
        invoice: invoiceTabungan,
        tabungan_id: tabungan.id,
        nominal_tabungan: body.biaya_deposit,
        penerima: penerima,
        sumber_dana: body.sumber_dana,
        saldo_tabungan_sebelum: 0,
        saldo_tabungan_sesudah: body.biaya_deposit,
        info_tabungan: body.info_deposit || null,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // === 3. Jika ada agen, insert ke FEE_KEAGENAN ===
      var feesAgen = 0;
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
        }, { transaction: this.t });
        
        feesAgen = jamaah.Agen.Level_keagenan.default_fee;

        await tabungan.update({
          fee_agen_id: agen.id,
        }, {
          where: { id: tabungan.id },
          transaction: this.t,
        });
      }

      // === 4. Jika sumber dana adalah "Deposit", update data member dan insert ke DEPOSIT ===
      const member = jamaah?.Member;
      const sumberDana = body.sumber_dana.toLowerCase();

      if (sumberDana === "deposit") {
        // === Insert ke tabel DEPOSIT (log pengurangan) ===
        await Deposit.create({
          division_id: division_id,
          member_id: member.id,
          invoice: invoiceDeposit,
          nominal: -Number(body.biaya_deposit),
          saldo_sebelum: member.total_deposit,
          saldo_sesudah: Number(member.total_deposit) - Number(body.biaya_deposit),
          sumber_dana: body.sumber_dana,
          penerima: penerima,
          tipe_transaksi: "pindah_ke_tabungan",
          info: `Digunakan untuk tabungan umrah (invoice: ${invoiceTabungan})`,
          createdAt: dateNow,
          updatedAt: dateNow,
        }, { transaction: this.t });

        // === Update total deposit dan total tabungan ===
        await member.update({
          total_deposit: member.total_deposit - Number(body.biaya_deposit),
          total_tabungan: (member.total_tabungan || 0) + Number(body.biaya_deposit),
          updatedAt: dateNow
        }, { transaction: this.t });

      } else if (sumberDana === "cash") {
        // === Langsung tambahkan ke tabungan tanpa sentuh deposit ===
        await member.update({
          total_tabungan: Number(member.total_tabungan || 0) + Number(body.biaya_deposit),
          updatedAt: dateNow
        }, { transaction: this.t });
      }
 
      // insert JURNAL
      // insert deposit
      if(body.sumber_dana == 'deposit') {
        await Jurnal.create(
          {
            division_id: division_id, 
            source: 'deposittabungan:' + tabungan.id,
            ref: 'Menabung',
            ket: 'Menabung',
            akun_debet: '24000',
            akun_kredit: '23000',
            saldo: body.biaya_deposit - feesAgen,
            removable: 'false',
            periode_id: 0,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
          {
            transaction: this.t,
          }
        );

        if(feesAgen != 0 ) {
          await Jurnal.create(
            {
              division_id: division_id, 
              source: 'deposittabunganfeeagen:' + tabungan.id,
              ref: 'Menabung (Fee Agen)',
              ket: 'Menabung (Fee Agen)',
              akun_debet: '24000',
              akun_kredit: '25000',
              saldo: feesAgen,
              removable: 'false',
              periode_id: 0,
              createdAt: dateNow,
              updatedAt: dateNow,
            },
            {
              transaction: this.t,
            }
          );
        }
      }else{
        await Jurnal.create(
          {
            division_id: division_id, 
            source: 'tabungan:' + tabungan.id,
            ref: 'Menabung',
            ket: 'Menabung',
            akun_debet: '11010',
            akun_kredit: '23000',
            saldo: body.biaya_deposit - feesAgen,
            removable: 'false',
            periode_id: 0,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
          {
            transaction: this.t,
          }
        );

        if(feesAgen != 0 ) {
          await Jurnal.create(
            {
              division_id: division_id, 
              source: 'deposittabunganfeeagen:' + tabungan.id,
              ref: 'Menabung (Fee Agen)',
              ket: 'Menabung (Fee Agen)',
              akun_debet: '11010',
              akun_kredit: '25000',
              saldo: feesAgen,
              removable: 'false',
              periode_id: 0,
              createdAt: dateNow,
              updatedAt: dateNow,
            },
            {
              transaction: this.t,
            }
          );
        }
      }

      this.message = `Data tabungan berhasil disimpan dengan invoice: ${invoiceTabungan}`;
      return invoiceTabungan;
    } catch (error) {
      console.log("Error in add():", error)
      this.state = false;
    }
  }

  // === Menabung ===
  async Menabung() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    
    try {
      const model_r = new Model_r(this.req);
      const infoTabungan = await model_r.infoTabungan(body.id);

      let invoiceTabungan, invoiceDeposit;
      do {
        invoiceTabungan = await this.generateInvoice();
        invoiceDeposit = await this.generateInvoice();
      } while (invoiceTabungan === invoiceDeposit);

      const penerima = await this.penerima();
      const division_id = await this.getDivisionId();

      console.log("Data Body:", body);
      console.log("Company ID:", this.company_id);
      console.log("Division ID:", division_id);
      console.log("Invoice Tabungan:", invoiceTabungan);
      console.log("Invoice Deposit:", invoiceDeposit);

      const tabungan = await Tabungan.findOne({ where: { id: body.id, division_id: division_id } });

      tabungan.update({
        total_tabungan: (infoTabungan.total_tabungan || 0) + Number(body.biaya_deposit),
        updatedAt: dateNow
      }, { transaction: this.t })

      // === Insert ke tabel RIWAYAT_TABUNGAN ===
      await Riwayat_tabungan.create({
        invoice: invoiceTabungan,
        tabungan_id: tabungan.id,
        nominal_tabungan: body.biaya_deposit,
        penerima: penerima,
        sumber_dana: body.sumber_dana,
        saldo_tabungan_sebelum: infoTabungan.total_tabungan,
        saldo_tabungan_sesudah: (infoTabungan.total_tabungan || 0) + Number(body.biaya_deposit),
        info_tabungan: body.info_deposit || null,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      const member = await Member.findOne({
        where: { id: infoTabungan.jamaah.member_id },
        transaction: this.t,
      });
      const sumberDana = body.sumber_dana.toLowerCase();
      if (sumberDana === "deposit") {

        // === Insert ke tabel DEPOSIT (log pengurangan) ===
        await Deposit.create({
          division_id: division_id,
          member_id: member.id,
          invoice: invoiceDeposit,
          nominal: -Number(body.biaya_deposit),
          saldo_sebelum: member.total_deposit,
          saldo_sesudah: Number(member.total_deposit) - Number(body.biaya_deposit),
          sumber_dana: body.sumber_dana,
          penerima: penerima,
          tipe_transaksi: "pindah_ke_tabungan",
          info: `Digunakan untuk tabungan umrah (invoice: ${invoiceTabungan})`,
          createdAt: dateNow,
          updatedAt: dateNow,
        }, { transaction: this.t });

        // === Update total deposit dan total tabungan ===
        await member.update({
          total_deposit: member.total_deposit - Number(body.biaya_deposit),
          total_tabungan: (member.total_tabungan || 0) + Number(body.biaya_deposit),
          updatedAt: dateNow
        }, { transaction: this.t });
        // Jurnal
        await Jurnal.create(
          {
            division_id: division_id, 
            source: 'deposittabungan:' + tabungan.id,
            ref: 'Menabung',
            ket: 'Menabung',
            akun_debet: '24000',
            akun_kredit: '23000',
            saldo: body.biaya_deposit,
            removable: 'false',
            periode_id: 0,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
          {
            transaction: this.t,
          }
        );
      } else if (sumberDana === "cash") {
        // Jurnal
        await Jurnal.create(
          {
            division_id: division_id, 
            source: 'tabungan:' + tabungan.id,
            ref: 'Menabung',
            ket: 'Menabung',
            akun_debet: '11010',
            akun_kredit: '23000',
            saldo: body.biaya_deposit,
            removable: 'false',
            periode_id: 0,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
          {
            transaction: this.t,
          }
        );
        // === Langsung tambahkan ke tabungan tanpa sentuh deposit ===
        await member.update({
          total_tabungan: Number(member.total_tabungan || 0) + Number(body.biaya_deposit),
          updatedAt: dateNow
        }, { transaction: this.t });
      }
      
      this.message = `Menambahkan tabungan umrah nama jamaah: ${infoTabungan.jamaah.fullname} dengan invoice: ${invoiceTabungan}`;
    } catch (error) {
      this.state = false;
    }
  }

  // === Refund ===
  async Refund() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    
    try {
      const model_r = new Model_r(this.req);
      const infoTabungan = await model_r.infoTabungan(body.id);
      const penerima = await this.penerima();
      const division_id = await this.getDivisionId();

      let invoiceTabungan, invoiceRefund;
      do {
        invoiceTabungan = await this.generateInvoice();
        invoiceRefund = await this.generateInvoice();
      } while (invoiceTabungan === invoiceRefund);

      const tabungan = await Tabungan.findOne({ where: { id: body.id, division_id: division_id } });

      tabungan.update({
        total_tabungan: (infoTabungan.total_tabungan || 0) - Number(body.refund_nominal),
        batal_berangkat: Number(body.batal_berangkat) === 1 ? "ya" : "tidak",
        updatedAt: dateNow
      }, { transaction: this.t })

      // === Insert ke tabel RIWAYAT_TABUNGAN ===
      await Riwayat_tabungan.create({
        invoice: invoiceTabungan,
        tabungan_id: tabungan.id,
        nominal_tabungan: -Number(body.refund_nominal),
        penerima: penerima,
        sumber_dana: "cash",
        saldo_tabungan_sebelum: infoTabungan.total_tabungan,
        saldo_tabungan_sesudah: (infoTabungan.total_tabungan || 0) - Number(body.refund_nominal),
        info_tabungan: `Refund tabungan umrah (invoice: ${invoiceTabungan})`,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // === Insert ke tabel REFUND_TABUNGAN ===
      await Refund_tabungan.create({
        invoice: invoiceRefund,
        tabungan_id: tabungan.id,
        nominal_ditahan: null,
        nominal_refund: Number(body.refund_nominal),
        petugas_refund: penerima,
        info: `Refund tabungan umrah (invoice: ${invoiceRefund})`,
        saldo_tabungan_sebelum: infoTabungan.total_tabungan,
        saldo_tabungan_sesudah: (infoTabungan.total_tabungan || 0) - Number(body.refund_nominal),
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // === Update total tabungan ===
      await Member.update({
        total_tabungan: Sequelize.literal(`total_tabungan - ${Number(body.refund_nominal)}`),
        updatedAt: dateNow
      }, {
        where: { id: infoTabungan.jamaah.member_id },
        transaction: this.t
      });
      
      this.message = `Refund tabungan umrah nama jamaah: ${infoTabungan.jamaah.fullname} dengan invoice: ${invoiceRefund}`;
    } catch (error) {
      this.message = error.message || "Terjadi kesalahan saat refund tabungan.";
      this.state = false;
    }
  }

  // ==== UPDATE TARGET PAKET ====
  async updateTargetPaket() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    const division_id = await this.getDivisionId();

    try {
      const tabungan = await Tabungan.findOne({ where: { id: body.id, division_id: division_id  } });

      await tabungan.update({
        target_paket_id: body.target_id || null,
        updatedAt: dateNow,
      }, { transaction: this.t });

      this.message = `Mengupdate target paket tabungan id: ${body.id} dengan target paket id: ${body.target_id}`;
    } catch (error) {
      this.state = false;
      this.message = error.message || "Terjadi kesalahan saat mengupdate data tabungan.";
    }
  }

  // ==== SERAH TERIMA FASILITAS ====
  async addHandoverFasilitas() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
    
    try {
      const invoiceHandover = await generateInvoiceHandoverFasilitas( this.company_id );
      const penerima = await this.penerima();
      // get info tabungan
      const tabungan = await Tabungan.findOne({ where: { id: body.id } });
      // create handover
      const handoverFasilitas = await Handover_fasilitas.create(
        {
          tabungan_id: body.id,
          invoice: invoiceHandover,
          petugas: penerima,
          penerima: body.penerima,
          nomor_identitas_penerima: body.nomor_identitas_penerima || null,  
          createdAt: dateNow,
          updatedAt: dateNow,
        }, 
        { 
          transaction: this.t 
        });

      // mengambil mst_fasilitas_id
      var listFasilitasID = [];
      for (const fasilitasId of body.detail_fasilitas) {
        listFasilitasID.push(fasilitasId)
      }

      const qItemFasilitas = await Item_fasilitas.findAll({
        where: {
          status: 'belum_terjual',
          mst_fasilitas_id: { [Op.in]: listFasilitasID }
        },
        include: [{
          required: true,
          model: Mst_fasilitas,
          where: { company_id: this.company_id }
        }],
        order: [
          ['createdAt', 'ASC'] // paling lama dulu
        ],
      });

      // mngambil item fasilitas id
      var total = 0;
      var itemFasilitasID = {};
      var itemFasilitasID2 = [];
      var itemFasilitasID3 = {};
      await Promise.all(
        await qItemFasilitas.map(async (e) => {
          itemFasilitasID = {...itemFasilitasID,...{[e.mst_fasilitas_id] : e.id }};
          itemFasilitasID3 = {...itemFasilitasID3,...{
            [e.mst_fasilitas_id] : 
            { 
              id: e.id, 
              harga_beli: e.harga_beli, 
              harga_jual: e.harga_jual, 
              nomor_akun_aset: e.Mst_fasilita.nomor_akun_aset, 
              nomor_akun_hpp: e.Mst_fasilita.nomor_akun_hpp,
              nomor_akun_pendapatan: e.Mst_fasilita.nomor_akun_pendapatan
            } }};
          itemFasilitasID2.push(e.id);
          total = total + e.harga_jual;
        })
      );

       // menginput data transaksi
      const transactionFasilitas = await Transaction_fasilitas.create({
        division_id: tabungan.division_id, 
        invoice: invoiceHandover, 
        kostumer_id: null, 
        tabungan_id: body.id,
        paket_id: null,
        petugas: penerima, 
        total: total,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // Insert detail handover fasilitas
      for (const fasilitas_id of body.detail_fasilitas) {
        // input handover detail fasilitas
        await Handover_fasilitas_detail.create({
          handover_fasilitas_id: handoverFasilitas.id,
          item_fasilitas_id: itemFasilitasID[fasilitas_id],
          createdAt: dateNow,
          updatedAt: dateNow,
        }, { transaction: this.t });
        // input transaction detail fasilitas
        await Transaction_fasilitas_detail.create({  
          transaction_fasilitas_id: transactionFasilitas.id,
          item_fasilitas_id: itemFasilitasID[fasilitas_id],
          createdAt: dateNow,
          updatedAt: dateNow,
        }, { transaction: this.t });
        // Jurnal HPP
        await Jurnal.create(
          {
            division_id: tabungan.division_id, 
            source: 'transaksiFasilitasId:' + transactionFasilitas.id,
            ref: 'HPP penjualan fasilitas',
            ket: 'HPP penjualan fasilitas',
            akun_debet: itemFasilitasID3[fasilitas_id].nomor_akun_hpp,
            akun_kredit: itemFasilitasID3[fasilitas_id].nomor_akun_aset,
            saldo: itemFasilitasID3[fasilitas_id].harga_beli,
            removable: 'false',
            periode_id: 0,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
          {
            transaction: this.t,
          }
        );
        // Jurnal Pendapatan
        await Jurnal.create(
          {
            division_id: tabungan.division_id, 
            source: 'transaksiFasilitasId:' + transactionFasilitas.id,
            ref: 'Pendapatan penjualan fasilitas',
            ket: 'Pendapatan penjualan fasilitas',
            akun_debet: '11010',
            akun_kredit: itemFasilitasID3[fasilitas_id].nomor_akun_pendapatan,
            saldo: itemFasilitasID3[fasilitas_id].harga_jual,
            removable: 'false',
            periode_id: 0,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
          {
            transaction: this.t,
          }
        );
      }

      // update item fasilitas
      await Item_fasilitas.update(
        {
          status: 'terjual',
          updatedAt: dateNow,
        },
        {
          where: { id: { [Op.in]: itemFasilitasID2 } },
          transaction: this.t,
        }
      );

      this.message = `Handover fasilitas berhasil ditambahkan untuk tabungan ID ${body.id} dengan invoice: ${invoiceHandover}`;
      return invoiceHandover;
    } catch (error) {
      this.state = false;
      this.message = error.message || "Terjadi kesalahan saat menambahkan handover fasilitas.";
    }
  }

  // === SERAH TERIMA BARANG ===
  async addHandoverBarang() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const model_r = new Model_r(this.req);
      const infoTabungan = await model_r.infoTabungan(body.id);
      const penerima = await this.penerima();
      const invoice_handover = await this.generateInvoiceHandover();

      const dataBarangList = body.barangList.map(barang => ({
        tabungan_id: body.id,
        invoice_handover: invoice_handover,
        jamaah_id: infoTabungan.jamaah.id,
        nama_barang: barang,
        status: 'diambil',  
        giver_handover: body.giver_handover,
        giver_handover_identity: body.giver_handover_identity,
        giver_handover_hp: body.giver_handover_hp,
        giver_handover_address: body.giver_handover_address,
        receiver_handover: penerima,
        date_taken: dateNow,
        createdAt: dateNow,
        updatedAt: dateNow,
      }));
      await Handover_barang.bulkCreate(dataBarangList, { transaction: this.t });

      this.message = `Handover barang berhasil ditambahkan untuk tabungan dengan nama jamaah ${infoTabungan.jamaah.fullname} dan invoice: ${invoice_handover}`;
      return invoice_handover;
    } catch (error) {
      this.state = false;
      this.message = error.message || "Terjadi kesalahan saat menambahkan handover barang.";
    }
  }

  // === PENGEMBALIAN BARANG ===
  async pengembalianHandoverBarang() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const model_r = new Model_r(this.req);
      const infoTabungan = await model_r.infoTabungan(body.id);
      const penerima = await this.penerima();
      const invoice_returned = await this.generateInvoiceHandover();

      const dataBarangList = body.selectedItems.map(barangId => ({
        where: {
          id: barangId,
          tabungan_id: body.id,
        },
        updates: {
          invoice_returned: invoice_returned,
          giver_returned: penerima,
          receiver_returned: body.receiver_returned,
          receiver_returned_identity: body.receiver_returned_identity,
          receiver_returned_hp: body.receiver_returned_hp,
          receiver_returned_address: body.receiver_returned_address,
          status: 'dikembalikan',
          date_returned: dateNow,
          updatedAt: dateNow,
        },
      }));
      for (const barang of dataBarangList) {
        await Handover_barang.update(
          barang.updates,
          {
            where: barang.where,
            transaction: this.t,
          }
        );
      }

      this.message = `Pengembalian barang berhasil ditambahkan untuk tabungan dengan nama jamaah ${infoTabungan.jamaah.fullname} dan invoice: ${invoice_returned}`;
      return invoice_returned;      
    } catch (error) {
      this.state = false;
      this.message = error.message || "Terjadi kesalahan saat menambahkan PengembalianHandoverBarang.";
    }
  }
  

  // // ==== PEMBELIAN PAKET ====
  async pembelianPaketTabunganUmrah() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const model_r = new Model_r(this.req);
      const infoTabungan = await model_r.infoTabungan(body.id);
      const totalTabungan = parseInt(infoTabungan.total_tabungan);
      const penerima = await this.penerima();
      const division_id = await this.getDivisionId()
      let invoiceSet = new Set();

      let invoiceDepositReturned, invoiceDeposit, invoiceRiwayatTabungan, invoicePaketTransactionPaymentHistory;

      do {
        invoiceDeposit = await this.generateInvoice();
        if (invoiceSet.has(invoiceDeposit)) continue;
        invoiceSet.add(invoiceDeposit);

        invoiceRiwayatTabungan = body.id ? await this.generateInvoice() : null;
        if (invoiceRiwayatTabungan) {
          if (invoiceSet.has(invoiceRiwayatTabungan)) continue;
          invoiceSet.add(invoiceRiwayatTabungan);
        }

        invoicePaketTransactionPaymentHistory = await this.generateInvoice();
        if (invoiceSet.has(invoicePaketTransactionPaymentHistory)) continue;
        invoiceSet.add(invoicePaketTransactionPaymentHistory);

        invoiceDepositReturned = await this.generateInvoice();
        if (invoiceSet.has(invoiceDepositReturned)) continue;
        invoiceSet.add(invoiceDepositReturned);

        // Jika semua invoice unik, keluar dari loop
        break;
      } while (true);

      const hargaPaket = await Paket_price.findOne({
        where: {
          Mst_paket_type_id: body.tipe_paket_id,
          paket_id: infoTabungan.target_paket_id,
        }
      });

      const harga = parseInt(hargaPaket.price);
      const sisaPembelian = totalTabungan - harga;

      // === 1. Update Member ===
      await Member.update({
        total_tabungan: Sequelize.literal(`total_tabungan - ${totalTabungan}`),
        ...(sisaPembelian > 0 && {
          total_deposit: Sequelize.literal(`COALESCE(total_deposit, 0) + ${sisaPembelian}`)
        }),
        updated_at: dateNow
      }, {
        where: { id: infoTabungan.jamaah.member_id, division_id: division_id },
        transaction: this.t
      });

      const deposit = await Deposit.findOne({
        where: { member_id: infoTabungan.jamaah.member_id },
        order: [["createdAt", "DESC"]],
        limit: 1,
        transaction: this.t
      });

      // === 2. Insert Deposit ===
      let depositTabungan = null;
      if (sisaPembelian > 0) {        
        depositTabungan = await Deposit.create({
          division_id: division_id,
          member_id: infoTabungan.jamaah.member_id,
          invoice: invoiceDeposit,
          nominal: sisaPembelian,
          saldo_sebelum: deposit?.saldo_sesudah || 0,
          saldo_sesudah: (deposit?.saldo_sesudah || 0) + sisaPembelian,
          sumber_dana: "deposit",
          penerima: penerima,
          tipe_transaksi: "sisa_pembelian_paket",
          info: `Sisa pembelian paket (Invoice: ${invoiceDeposit})`,
          createdAt: dateNow,
          updated_at: dateNow,
        }, { transaction: this.t });
      }

      // === 3. Insert Paket Transaction ===
      const paketTransaction = await Paket_transaction.create({
        division_id: division_id,
        jamaah_id: infoTabungan.jamaah.id,
        fee_agen_id: infoTabungan.fee_agen_id,
        paket_id: body.target_paket_id,
        mst_paket_type_id: body.tipe_paket_id,
        price: harga,
        batal_berangkat: "tidak",
        from: "tabungan",
        biaya_mahram: infoTabungan.paket.mahram_fee,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // === 4. Insert Payment History ===
      await Paket_transaction_payment_history.create({
        paket_transaction_id: paketTransaction.id,
        invoice: invoicePaketTransactionPaymentHistory,
        nominal: harga,
        penerima: penerima,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // === 5. Update Tabungan ===
      await Tabungan.update({
        total_tabungan: 0,
        status: "non_active",
        paket_transaction_id: paketTransaction.id,
        sisa_pembelian: sisaPembelian,
        invoice_sisa_deposit: sisaPembelian > 0 ? invoiceDeposit : null,
        updated_at: dateNow
      }, {
        where: { id: body.id, division_id: division_id },
        transaction: this.t,
      });

      // === 6. Riwayat Tabungan ===
      const riwayatTabungan = await Riwayat_tabungan.findOne({
        where: { tabungan_id: body.id },
        order: [["createdAt", "DESC"]],
        limit: 1,
        transaction: this.t
      });

      await Riwayat_tabungan.create({
        invoice: invoiceRiwayatTabungan,
        tabungan_id: body.id,
        nominal_tabungan: -harga,
        penerima: penerima,
        sumber_dana: "deposit",
        saldo_tabungan_sebelum: riwayatTabungan.saldo_tabungan_sesudah,
        saldo_tabungan_sesudah: riwayatTabungan.saldo_tabungan_sesudah - harga,
        info_tabungan: `Pembelian paket pada tabungan (invoice: ${invoiceRiwayatTabungan})`,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      if (sisaPembelian > 0) {
        await Riwayat_tabungan.create({
          invoice: invoiceDepositReturned,
          tabungan_id: body.id,
          nominal_tabungan: -sisaPembelian,
          penerima: penerima,
          sumber_dana: "deposit",
          saldo_tabungan_sebelum: riwayatTabungan.saldo_tabungan_sesudah - harga,
          saldo_tabungan_sesudah: 0,
          info_tabungan: `Sisa pembelian paket pada tabungan (invoice: ${invoiceDepositReturned})`,
          createdAt: dateNow,
          updatedAt: dateNow,
        }, { transaction: this.t });
      }

      // === 7. Insert Handover Barang ===
      const handoverBarang = await Handover_barang.findAll({ where: { tabungan_id: infoTabungan.id } });
      if (handoverBarang.length > 0) {
        const dataBarangList = handoverBarang.map(item => ({
          paket_transaction_id: paketTransaction.id,
          invoice_handover: item.invoice_handover,
          invoice_returned: item.invoice_returned,
          jamaah_id: item.jamaah_id,
          nama_barang: item.nama_barang,
          status: item.status,
          giver_handover: item.giver_handover,
          giver_handover_identity: item.giver_handover_identity,
          giver_handover_hp: item.giver_handover_hp,
          giver_handover_address: item.giver_handover_address,
          receiver_handover: item.receiver_handover,
          giver_returned: item.giver_returned,
          receiver_returned: item.receiver_returned,
          receiver_returned_identity: item.receiver_returned_identity,
          receiver_returned_hp: item.receiver_returned_hp,
          receiver_returned_address: item.receiver_returned_address,
          date_taken: item.date_taken,
          date_returned: item.date_returned,
          createdAt: dateNow,
          updatedAt: dateNow,
        }));

        await Handover_barang_paket.bulkCreate(dataBarangList, { transaction: this.t });
      }

      // === 8. Insert Handover Fasilitas & Detail ===
      const handoverFasilitas = await Handover_fasilitas.findAll({ where: { tabungan_id: infoTabungan.id } });
      if (handoverFasilitas.length > 0) {
        const dataFasilitasList = handoverFasilitas.map(item => ({
          paket_transaction_id: paketTransaction.id,
          invoice: item.invoice,
          penerima: item.penerima,
          petugas: item.petugas,
          nomor_identitas_penerima: item.nomor_identitas_penerima,
          createdAt: dateNow,
          updatedAt: dateNow,
        }));

        const fasilitasPaket = await Handover_fasilitas_paket.bulkCreate(dataFasilitasList, {
          transaction: this.t,
          returning: true,
        });

        // mengekstraks invoice dari tabel handover fasilitas
        var listInvoiceHandoverFasilitas = [];
        for( let x in dataFasilitasList) {
          listInvoiceHandoverFasilitas.push(dataFasilitasList[x].invoice);
        }

        //mengambil transaksi_fasilitas_id berdasarkan invoice
        const qTransaksiFasilitas = await Transaction_fasilitas.findAll({ where: { invoice: listInvoiceHandoverFasilitas, company_id: this.company_id } });
        const dataTransaksiFasilitasIDList = qTransaksiFasilitas.map(item => (item.id));

        // update paket id yang ada di dalam tabel transaction fasilitas
        await Transaction_fasilitas.update(
          { paket_id: body.target_paket_id,updatedAt: dateNow,},
          { where: { id: { [Op.in]: dataTransaksiFasilitasIDList } },transaction: this.t, }
        );

        // Buat mapping dari ID lama → ID baru
        const idMap = {};
        handoverFasilitas.forEach((item, index) => {
          idMap[item.id] = fasilitasPaket[index].id;
        });

        // Ambil semua detail berdasarkan ID handover_fasilitas yang lama
        const fasilitasIdMap = handoverFasilitas.map(f => f.id);
        const detailList = await Handover_fasilitas_detail.findAll({
          attributes: ["item_fasilitas_id", "handover_fasilitas_id"],
          where: { handover_fasilitas_id: { [Op.in]: fasilitasIdMap } }
        });
        
        console.log("========== Fasilitas Paket ==========");
        console.log("fasilitasPaket", fasilitasPaket);
        console.log("fasilitasIdMap", fasilitasIdMap);
        console.log("idMap", idMap);
        console.log("detailList", detailList);
        console.log("========== Fasilitas Paket ==========");

        if (detailList.length > 0) {
          const dataFasilitasDetailList = detailList.map(detail => ({
            handover_fasilitas_paket_id: idMap[detail.handover_fasilitas_id],
            item_fasilitas_id: detail.item_fasilitas_id,
            createdAt: dateNow,
            updatedAt: dateNow,
          }));
          await Handover_fasilitas_detail_paket.bulkCreate(dataFasilitasDetailList, { transaction: this.t });
        }

        // update di transaction fasilitas
      }

      console.log("================ 3 pembelianPaketTabunganUmrah ================");
      console.log("paketTransaction", paketTransaction);
      console.log("infoTabungan", infoTabungan);
      console.log("================ pembelianPaketTabunganUmrah ================");
      this.message = "Pembelian paket tabungan umrah berhasil.";
    } catch (error) {
      this.state = false;
      this.message = error.message || "Terjadi kesalahan saat pembelian paket.";
      console.log("================ pembelianPaketTabunganUmrah ================");
      console.log(error)
      console.log("================ pembelianPaketTabunganUmrah ================");
    }
  }

  // ==== DELETE ====
  async delete() {
    await this.initialize();
    const body = this.req.body;
    const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const model_r = new Model_r(this.req);
      const infoTabungan = await model_r.infoTabungan(body.id);

      const tabungan = await Tabungan.findOne({
        where: { id: body.id },
        include: [
          {
            model: Riwayat_tabungan,
            order: [["id", "DESC"]],
            limit: 1,
          },
          {
            model: Jamaah,
          },
        ],
        transaction: this.t,
      });

      const member = await Member.findOne({
        where: { id: infoTabungan.jamaah.id },
        transaction: this.t,
      });

      const nominalTerakhir = tabungan.total_tabungan;
      const saldoSebelum = member.total_deposit;
      const saldoSesudah = saldoSebelum + nominalTerakhir;

      // 1. Tambahkan kembali saldo tabungan ke deposit member
      await member.update({
        total_deposit: saldoSesudah,
        total_tabungan: member.total_tabungan - nominalTerakhir,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // 2. Buat catatan log deposit (pengembalian) //dihapus aja
      const invoiceDeposit = await this.generateInvoice();
      const penerima = await this.penerima();
      const division_id = await this.getDivisionId();

      await Deposit.create({
        division_id: division_id,
        member_id: member.id,
        invoice: invoiceDeposit,
        nominal: nominalTerakhir,
        saldo_sebelum: saldoSebelum,
        saldo_sesudah: saldoSesudah,
        sumber_dana: "deposit",
        penerima: penerima,
        tipe_transaksi: "deposit",
        info: `Pengembalian dari pembatalan tabungan umrah: ${infoTabungan.jamaah.fullname}`,
        createdAt: dateNow,
        updatedAt: dateNow,
      }, { transaction: this.t });

      // 3. Hapus Riwayat Tabungan
      await Riwayat_tabungan.destroy({
        where: { tabungan_id: tabungan.id },
        transaction: this.t,
      });

      // 4. Hapus Tabungan
      await Tabungan.destroy({
        where: { id: tabungan.id },
        transaction: this.t,
      });

      await Fee_agen.destroy({
        where: { id: tabungan.fee_agen_id },
        transaction: this.t,
      });

      this.message = `Tabungan ID ${tabungan.id} berhasil dihapus. Dana sebesar ${nominalTerakhir} dikembalikan ke deposit.`;
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
