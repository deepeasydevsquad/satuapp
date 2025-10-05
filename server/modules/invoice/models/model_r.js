const fs = require("fs");
const path = require("path");
const moment = require("moment");

const {
  Akun_secondary,
  Member,
  Deposit,
  Paket,
  Paket_la,
  Fasilitas_paket_la,
  Detail_fasilitas_paket_la,
  Paket_la_transaction,
  Company,
  Division,
  Jamaah,
  Tabungan,
  Riwayat_tabungan,
  Mst_kota,
  Mst_paket_type,
  Riwayat_pembayaran_peminjaman,
  Peminjaman,
  Handover_fasilitas,
  Handover_fasilitas_paket,
  Handover_fasilitas_detail,
  Handover_fasilitas_detail_paket,
  Handover_barang,
  Handover_barang_paket,
  Mst_fasilitas,
  Visa_transaction,
  Mst_visa_request_type,
  Fee_agen,
  Pembayaran_fee_agen,
  Agen,
  Paket_transaction,
  Paket_transaction_payment_history,
  Hotel_transaction,
  Mst_hotel,
  Passport_transaction,
  Passport_transaction_detail,
  Transport_transaction,
  Transport_transaction_detail,
  Mst_mobil,
  Kas_keluar_masuk,
  Jurnal,
  Kostumer,
  Transaction_fasilitas,
  Transaction_fasilitas_detail,
  Item_fasilitas,
  Ticket_transaction,
  Ticket_payment_history,
  Mst_airline,
} = require("../../../models");
const { Op, where } = require("sequelize");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");

const { convertToRP } = require("../../../helper/currencyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async header() {
    await this.initialize();
    return this.header_kwitansi_invoice();
  }

  async get_akun_secondary_name(company_id) {
    var data = {};
    await Akun_secondary.findAll({
      where: { company_id: company_id },
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data[e.nomor_akun] = e.nama_akun;
        })
      );
    });
    return data;
  }

  async dataInvoiceKasKeluarMasuk() {
    await this.initialize();

    const list_akun = await this.get_akun_secondary_name(this.company_id);

    try {
      var data = {};
      await Kas_keluar_masuk.findOne({
        where: { invoice: this.req.params.invoice }, // pastikan ini berdasarkan division_id
        include: [
          {
            required: true,
            model: Division,
            where: {
              company_id: this.company_id,
            },
          },
        ],
      }).then(async (e) => {
        if (e) {
          data = {
            id: e.id,
            invoice: e.invoice,
            dibayar_diterima: e.dibayar_diterima,
            petugas: e.petugas,
            status_kwitansi: e.status_kwitansi,
            tanggal_transaksi: moment(e.createdAt).format(
              "YYYY-MM-DD HH:mm:ss"
            ),
            details: [],
          };
        }
      });
      // filter
      if (Object.keys(data).length > 0) {
        var details = [];
        await Jurnal.findAll({
          where: {
            source: "kaskeluarmasuk:invoice:" + this.req.params.invoice,
          },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              details.push({
                ref: e.ref,
                ket: e.ket,
                akun_debet:
                  e.akun_debet + `<br><b>[${list_akun[e.akun_debet]}]</b>`,
                akun_kredit:
                  e.akun_kredit + `<br><b>[${list_akun[e.akun_kredit]}]</b>`,
                saldo: await convertToRP(e.saldo),
              });
            })
          );
        });

        data.details = details;
      }

      return data;
    } catch (error) {
      console.log("------XXX-----");
      console.log(error);
      console.log("------XXX-----");
      return {};
    }
  }

  async header_kwitansi_invoice() {
    var data = {};
    let division = null;
    await Division.findOne({
      attributes: ["name", "pos_code", "address"], // ambil dari Division
      where: { id: this.division_id }, // pastikan ini berdasarkan division_id
      include: [
        {
          required: true,
          model: Company,
          attributes: [
            "logo",
            "company_name",
            "email",
            "whatsapp_company_number",
            "invoice_logo",
            "invoice_title",
          ],
        },
        {
          model: Mst_kota, // include tabel mst_kota
          attributes: ["name"], // ambil kolom name dari mst_kota
        },
      ],
    }).then(async (e) => {
      if (e) {
        let exisFile = false;
        if (e.Company.invoice_logo !== null) {
          const filePath = path.join(
            __dirname,
            "uploads",
            e.Company.invoice_logo
          );
          if (fs.existsSync(filePath)) {
            exisFile = true;
          }
        }
        data["logo"] = exisFile ? e.Company.invoice_logo : "default.png";
        data["company_name"] = e.Company.company_name || "-";
        data["city"] = e.Mst_kota?.name || "-"; // ambil nama kota dari mst_kota
        data["address"] = e.address || "-";
        data["pos_code"] = e.pos_code || "-";
        data["email"] = e.Company.email || "-";
        data["whatsapp_company_number"] =
          e.Company.whatsapp_company_number || "-";
      }
    });

    if (division) {
      const invoiceLogo = division.Company?.invoice_logo;
      const logoPath = invoiceLogo
        ? path.resolve(__dirname, "../../../uploads", invoiceLogo)
        : null;
      const exists = invoiceLogo && fs.existsSync(logoPath);

      data.logo = exists ? invoiceLogo : "default.png";
      data.company_name = division.Company?.company_name ?? "-";
      data.city = division.Mst_kota?.name ?? "-";
      data.address = division.address ?? "-";
      data.pos_code = division.pos_code ?? "-";
      data.email = division.Company?.email ?? "-";
      data.whatsapp_company_number =
        division.Company?.whatsapp_company_number ?? "-";
    }

    console.log(data);
    return data;
  }

  async dataInvoiceDeposit() {
    await this.initialize();

    try {
      var data = { ...data, ...(await this.header_kwitansi_invoice()) };

      await Deposit.findOne({
        where: {
          division_id: this.division_id,
          invoice: this.req.params.invoice,
        },
        include: {
          required: true,
          model: Member,
          attributes: ["fullname"],
        },
      }).then(async (e) => {
        if (e) {
          data["invoice"] = e.invoice;
          data["nominal"] = e.nominal;
          data["createdAt"] = e.createdAt;
          data["penerima"] = e.penerima;
          data["info"] = e.info;
          data["tipe_transaksi"] = e.tipe_transaksi;
          data["fullname"] = e.Member.fullname;
          data["saldo_sesudah"] = e.saldo_sesudah;
        }
      });

      return data;
    } catch (error) {
      return {};
    }
  }

  async dataInvoicePaketLa() {
    await this.initialize();
    const myDate = moment(new Date()).format("DD MMMM YYYY");

    try {
      var data = { ...data, ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Fasilitas_paket_la.findOne({
        where: {
          invoice: this.req.params.invoice,
        },
      });

      if (!adaInvoice) {
        return {};
      }

      const sql = {
        attributes: ["client_name", "client_hp_number", "client_address"],
        where: {
          division_id: this.division_id,
        },
        include: {
          model: Fasilitas_paket_la,
          attributes: ["invoice", "total"],
          where: {
            invoice: this.req.params.invoice,
          },
          required: true,
          include: [
            {
              model: Detail_fasilitas_paket_la,
              attributes: [
                "description",
                "check_in",
                "check_out",
                "createdAt",
                "day",
                "pax",
                "price",
              ],
            },
          ],
        },
      };

      await Paket_la.findOne(sql).then(async (e) => {
        if (e) {
          data["client_name"] = e.client_name;
          data["client_hp_number"] = e.client_hp_number;
          data["client_address"] = e.client_address;
          data["order_date"] = myDate;
          data["invoice"] = e.Fasilitas_paket_las[0].invoice;
          data["total"] = e.Fasilitas_paket_las[0].total;
          data["detail_fasilitas"] = (
            e.Fasilitas_paket_las[0].Detail_fasilitas_paket_las || []
          ).map((detail) => ({
            description: detail.description,
            check_in: moment(detail.check_in).format("YYYY-MM-DD"),
            check_out: moment(detail.check_out).format("YYYY-MM-DD"),
            order_date: detail.createdAt,
            day: detail.day,
            pax: detail.pax,
            price: detail.price,
          }));
        }
      });

      console.log(data);

      return data;
    } catch (error) {
      return {};
    }
  }

  async dataKwitansiTerakhir() {
    await this.initialize();
    const myDate = moment(new Date()).format("DD MMMM YYYY");

    try {
      var data = { ...data, ...(await this.header_kwitansi_invoice()) };

      const adaRegNum = await Paket_la.findOne({
        where: {
          register_number: this.req.params.register_number,
        },
      });

      if (!adaRegNum) {
        return {};
      }

      const sql = {
        attributes: [
          "register_number",
          "client_name",
          "client_hp_number",
          "client_address",
          "createdAt",
        ],
        where: {
          division_id: this.division_id,
          register_number: this.req.params.register_number,
        },
        include: {
          model: Paket_la_transaction,
          attributes: ["status", "invoice", "paid", "createdAt", "receiver"],
          required: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      };

      await Paket_la.findOne(sql).then(async (e) => {
        if (e) {
          data["register_number"] = e.register_number;
          data["client_name"] = e.client_name;
          data["Transaksi"] = (e.Paket_la_transactions || []).map(
            (transaction) => ({
              status: transaction.status,
              invoice: transaction.invoice,
              receiver: transaction.receiver,
              paid: transaction.paid,
              date: moment(transaction.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            })
          );
        }
      });

      console.log(data);

      return data;
    } catch (error) {
      return {};
    }
  }

  async dataKwitansiTabunganUmrah() {
    await this.initialize();
    const myDate = moment(new Date()).format("DD MMMM YYYY");

    try {
      var data = { ...data, ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Riwayat_tabungan.findOne({
        where: {
          invoice: this.req.params.invoice,
        },
      });

      if (!adaInvoice) {
        return {};
      }

      const sql = {
        attributes: [
          "invoice",
          "nominal_tabungan",
          "sumber_dana",
          "penerima",
          "saldo_tabungan_sebelum",
          "saldo_tabungan_sesudah",
          "info_tabungan",
          "createdAt",
        ],
        where: {
          invoice: this.req.params.invoice,
        },
        include: {
          model: Tabungan,
          attributes: ["createdAt"],
          include: [
            {
              model: Jamaah,
              include: [
                {
                  model: Member,
                  attributes: ["fullname", "whatsapp_number"],
                },
              ],
            },
          ],
        },
      };

      await Riwayat_tabungan.findOne(sql).then(async (e) => {
        if (e) {
          (data["invoice"] = e.invoice),
            (data["fullname"] = e.Tabungan.Jamaah.Member.fullname),
            (data["whatsapp_number"] =
              e.Tabungan.Jamaah.Member.whatsapp_number),
            (data["nominal_tabungan"] = e.nominal_tabungan),
            (data["sumber_dana"] = e.sumber_dana),
            (data["penerima"] = e.penerima),
            (data["saldo_tabungan_sebelum"] = e.saldo_tabungan_sebelum),
            (data["saldo_tabungan_sesudah"] = e.saldo_tabungan_sesudah),
            (data["info_tabungan"] = e.info_tabungan),
            (data["createdAt"] = e.createdAt);
        }
      });

      console.log(data);

      return data;
    } catch (error) {
      return {};
    }
  }

  async checkKwitansiTabunganUmrah() {
    try {
      const body = this.req.body;
      const adaData = await Riwayat_tabungan.findOne({
        where: { invoice: body.invoice },
      });
      return adaData ? { data: true } : { data: null };
    } catch (error) {
      console.error(error);
      throw {};
    }
  }

  async dataKwitansiHandoverFasilitas() {
    await this.initialize();
    const myDate = moment(new Date()).format("DD MMMM YYYY");

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Handover_fasilitas.findOne({
        where: { invoice: this.req.params.invoice },
      });

      if (!adaInvoice) {
        return {};
      }

      const hasil = await Handover_fasilitas.findOne({
        attributes: [
          "id",
          "invoice",
          "petugas",
          "penerima",
          "nomor_identitas_penerima",
          "createdAt",
        ],
        where: { invoice: this.req.params.invoice },
        include: [
          {
            model: Tabungan,
            include: [
              {
                model: Jamaah,
                include: [
                  {
                    model: Member,
                    attributes: ["fullname", "whatsapp_number"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!hasil) return {};

      // Basic info
      data.invoice = hasil.invoice;
      data.petugas = hasil.petugas;
      data.penerima = hasil.penerima;
      data.nomor_identitas_penerima = hasil.nomor_identitas_penerima;
      data.tanggal_transaksi = moment(hasil.createdAt).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      // Detail fasilitas
      const details = await Handover_fasilitas_detail.findAll({
        attributes: [],
        where: { handover_fasilitas_id: hasil.id },
        include: {
          required: true,
          model: Item_fasilitas,
        },
        // raw: true,
      });

      console.log("00000000");
      if (!details || details.length === 0) {
        data.detail = [];
      } else {
        const fasilitasIds = details.map(
          (d) => d.Item_fasilita.mst_fasilitas_id
        );
        console.log("11111111");
        const fasilitasList = await Mst_fasilitas.findAll({
          where: { id: { [Op.in]: fasilitasIds } },
          attributes: ["id", "name"],
          raw: true,
        });

        const fasilitasMap = fasilitasList.reduce((acc, f) => {
          acc[f.id] = f.name;
          return acc;
        }, {});

        data.detail = details.map((detail) => ({
          name:
            fasilitasMap[detail.Item_fasilita.mst_fasilitas_id] ||
            "Tidak diketahui",
        }));
      }

      // Info jamaah
      const member = hasil?.Tabungan?.Jamaah?.Member;
      if (member) {
        data.fullname = member.fullname;
        data.whatsapp_number = member.whatsapp_number;
      }

      return data;
    } catch (error) {
      console.error("Error in dataKwitansiHandoverFasilitas:", error);
      throw error;
    }
  }

  async dataKwitansiHandoverBarang() {
    await this.initialize();

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Handover_barang.findOne({
        where: { invoice_handover: this.req.params.invoice },
      });

      if (!adaInvoice) {
        return {};
      }

      const handoverBarang = await Handover_barang.findAll({
        where: { invoice_handover: this.req.params.invoice },
        attributes: [
          "invoice_handover",
          "nama_barang",
          "giver_handover",
          "giver_handover_identity",
          "giver_handover_hp",
          "giver_handover_address",
          "receiver_handover",
          "date_taken",
        ],
        raw: true,
      });
      data.invoice_handover = handoverBarang[0].invoice_handover;
      data.handover_barang = handoverBarang.map((item) => item.nama_barang);
      data.giver_handover = handoverBarang[0].giver_handover;
      data.giver_handover_identity = handoverBarang[0].giver_handover_identity;
      data.giver_handover_hp = handoverBarang[0].giver_handover_hp;
      data.giver_handover_address = handoverBarang[0].giver_handover_address;
      data.receiver_handover = handoverBarang[0].receiver_handover;
      data.receiver_jabatan = (await tipe(this.req)).toUpperCase();
      data.date_taken = moment(handoverBarang[0].date_taken).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      return data;
    } catch (error) {
      console.log("Error in dataKwitansiHandoverBarang", error);
      throw error;
    }
  }

  async dataKwitansiPengembalianHandoverBarang() {
    await this.initialize();

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Handover_barang.findOne({
        where: { invoice_returned: this.req.params.invoice },
      });

      if (!adaInvoice) {
        return {};
      }

      const handoverBarang = await Handover_barang.findAll({
        where: { invoice_returned: this.req.params.invoice },
        attributes: [
          "invoice_returned",
          "nama_barang",
          "giver_returned",
          "receiver_returned",
          "receiver_returned_identity",
          "receiver_returned_hp",
          "receiver_returned_address",
          "date_returned",
        ],
        raw: true,
      });
      data.invoice_returned = handoverBarang[0].invoice_returned;
      data.handover_barang = handoverBarang.map((item) => item.nama_barang);
      data.giver_returned = handoverBarang[0].giver_returned;
      data.giver_jabatan = (await tipe(this.req)).toUpperCase();
      data.receiver_returned = handoverBarang[0].receiver_returned;
      data.receiver_returned_identity =
        handoverBarang[0].receiver_returned_identity;
      data.receiver_returned_hp = handoverBarang[0].receiver_returned_hp;
      data.receiver_returned_address =
        handoverBarang[0].receiver_returned_address;
      data.date_returned = moment(handoverBarang[0].date_returned).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      console.log(data);
      return data;
    } catch (error) {
      console.log("Error in dataKwitansiPengembalianHandoverBarang", error);
      throw error;
    }
  }

  async kwitansiPembayaranPerbulan() {
    await this.initialize();
    const myDate = moment(new Date()).format("DD MMMM YYYY");

    try {
      let data = await this.header_kwitansi_invoice();

      const adaInvoice = await Riwayat_pembayaran_peminjaman.findOne({
        where: {
          invoice: this.req.params.invoice,
        },
        include: {
          model: Peminjaman,
          required: true,
          attributes: [
            "id",
            "register_number",
            "nominal",
            "tenor",
            "status_peminjaman",
          ],
          include: {
            model: Jamaah,
            required: true,
            attributes: ["member_id"],
            include: {
              model: Member,
              required: true,
              attributes: ["fullname", "identity_number"],
            },
          },
        },
      });

      if (adaInvoice) {
        const pinjamanId = adaInvoice.Peminjaman.id;

        // Ambil semua cicilan sorted by createdAt
        const semuaCicilan = await Riwayat_pembayaran_peminjaman.findAll({
          where: {
            peminjaman_id: pinjamanId,
            status: "cicilan",
          },
          order: [["createdAt", "ASC"]], // Bisa juga pakai 'id' kalau lebih aman
        });

        // Cari index keberapa invoice ini muncul
        const termKe =
          semuaCicilan.findIndex(
            (item) => item.invoice === adaInvoice.invoice
          ) + 1;

        // Hitung total pembayaran
        const totalPembayaran = await Riwayat_pembayaran_peminjaman.sum(
          "nominal",
          {
            where: {
              peminjaman_id: pinjamanId,
            },
          }
        );

        const pinjaman = adaInvoice.Peminjaman;
        const jamaah = pinjaman?.Jamaah;
        const member = jamaah?.Member;

        // Ambil petugas dari Riwayat_pembayaran_peminjaman (misalnya 'petugas_name')
        const petugasName = adaInvoice.petugas_name || "Administrator"; // Fallback default

        data["invoice"] = adaInvoice.invoice;
        data["nominal"] = adaInvoice.nominal;
        data["status_pembayaran"] = adaInvoice.status;
        data["bulan"] = adaInvoice.bulan;
        data["tahun"] = adaInvoice.tahun;
        data["createdAt"] = moment(adaInvoice.createdAt).format("YYYY-MM-DD");
        data["tanggal_pembayaran"] = myDate;

        data["status_peminjaman"] = pinjaman.status_peminjaman;
        data["register_number"] = pinjaman.register_number;
        data["pinjaman_nominal"] = pinjaman.nominal;
        data["pinjaman_tenor"] = pinjaman.tenor;
        data["term"] = termKe;
        data["total_pembayaran"] = totalPembayaran || 0;

        if (member) {
          data["nama_jamaah"] = member.fullname;
          data["identity_number"] = member.identity_number;
        }

        // Tambahkan data petugas ke response
        data["nama_petugas"] = petugasName;
      }

      return data;
    } catch (error) {
      console.error("KWITANSI ERROR:", error);
      return {};
    }
  }

  async KwitansiVisa() {
    await this.initialize();

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };
      console.log("Data Header:", data);
      console.log("Invoice Param:", this.req.params.invoice);

      const transaksi = await Visa_transaction.findOne({
        where: {
          invoice: this.req.params.invoice,
        },
        attributes: [
          "invoice",
          "petugas",
          "pax",
          "harga_travel",
          "harga_costumer",
          "createdAt",
        ],
        include: [
          {
            model: Division,
            attributes: ["name"],
            required: true,
            where: { company_id: this.company_id },
          },
          {
            model: Mst_visa_request_type,
            attributes: ["name"],
          },
          {
            model: Kostumer,
            attributes: ["name", "mobile_number", "address"],
          },
        ],
      });

      console.log("Transaksi Visa:", transaksi);

      if (!transaksi) {
        return {};
      }

      const jenisVisaName = transaksi.Mst_visa_request_type
        ? transaksi.Mst_visa_request_type.name
        : "Jenis Tidak Diketahui";

      data = {
        ...data,
        invoice: transaksi.invoice,
        petugas: transaksi.petugas,
        pax: transaksi.pax,
        harga_travel: transaksi.harga_travel,
        harga_costumer: transaksi.harga_costumer,
        createdAt: transaksi.createdAt,

        kostumer_name: transaksi.Kostumer ? transaksi.Kostumer.name : "-",
        kostumer_mobile: transaksi.Kostumer
          ? transaksi.Kostumer.mobile_number
          : "-",
        kostumer_address: transaksi.Kostumer ? transaksi.Kostumer.address : "-",
        jenis_visa: jenisVisaName,
      };
      return data;
    } catch (error) {
      console.error("Error in dataKwitansiVisa (with Jenis Visa):", error);
      return {};
    }
  }

  async invoice_pembayaran_fee_agen() {
    await this.initialize();
    try {
      const data = await this.header_kwitansi_invoice();

      const feeAgens = await Fee_agen.findAll({
        where: {
          invoice: this.req.params.invoice,
        },
        include: [
          {
            model: Pembayaran_fee_agen,
            required: true,
          },
          {
            model: Agen,
            required: true,
            include: {
              model: Member,
              required: true,
              attributes: ["fullname", "identity_number"],
            },
          },
        ],
      });

      if (!feeAgens || feeAgens.length === 0) {
        throw new Error("Data fee agen tidak ditemukan");
      }

      // Ambil info pembayaran dari fee pertama (karena 1 pembayaran aja)
      const pembayaran = feeAgens[0].Pembayaran_fee_agen;

      const data_invoice = feeAgens.map((item) => ({
        agen_name: item.Agen.Member.fullname,
        agen_identity: item.Agen.Member.identity_number,
        nominal_fee: item.nominal,
        info: item.info || "-",
      }));

      return {
        data_header: data,
        data_invoice,
        pembayaran: {
          invoice: pembayaran.invoice,
          tanggal_pembayaran: pembayaran.createdAt,
          penerima: pembayaran.penerima,
          nama_pemohon: pembayaran.applicant_name,
          identitas_pemohon: pembayaran.applicant_identity,
          nominal_pembayaran: pembayaran.nominal,
        },
      };
    } catch (error) {
      console.error("Gagal generate invoice pembayaran fee agen:", error);
      throw error;
    }
  }

  async dataKwitansiPembayaranTransaksiPaketUmrah() {
    await this.initialize();
    try {
      let data = await this.header_kwitansi_invoice();

      const paketTransactionHistory =
        await Paket_transaction_payment_history.findOne({
          order: [["createdAt", "DESC"]],
          where: {
            invoice: this.req.params.invoice,
          },
          include: [
            {
              model: Paket_transaction,
              required: true,
              include: [
                {
                  model: Mst_paket_type,
                  required: true,
                  attributes: ["name"],
                },
                {
                  model: Jamaah,
                  required: true,
                  include: {
                    model: Member,
                    required: true,
                    attributes: ["fullname", "whatsapp_number"],
                  },
                },
              ],
            },
          ],
        });

      data = {
        ...data,
        invoice: paketTransactionHistory.invoice,
        fullname:
          paketTransactionHistory.Paket_transaction.Jamaah.Member.fullname,
        whatsapp_number:
          paketTransactionHistory.Paket_transaction.Jamaah.Member
            .whatsapp_number,
        penerima: paketTransactionHistory.penerima,
        nominal: paketTransactionHistory.nominal,
        info_paket:
          "Pembelian Paket Tipe " +
          paketTransactionHistory.Paket_transaction.Mst_paket_type.name,
        createdAt: moment(paketTransactionHistory.createdAt).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      };

      return data;
    } catch (error) {
      console.error(
        "Error in dataKwitansiPembayaranTransaksiPaketUmrah:",
        error
      );
      return {};
    }
  }

  async invoice_trans_hotel() {
    await this.initialize();

    try {
      const invoice = this.req.params.invoice; // ⬅️ ambil dari params
      const header = await this.header_kwitansi_invoice();

      const transaksi = await Hotel_transaction.findOne({
        where: {
          invoice: invoice,
        },
        attributes: [
          "invoice",
          "petugas",
          "check_in",
          "check_out",
          "tipe_kamar",
          "jumlah_hari",
          "jumlah_kamar",
          "harga_travel_kamar_per_hari",
          "harga_kostumer_kamar_per_hari",
          "createdAt",
        ],
        include: [
          {
            model: Division,
            attributes: ["name"],
            required: true,
            where: { company_id: this.company_id },
          },
          {
            model: Mst_hotel,
            attributes: ["name"],
          },
          {
            model: Kostumer,
            attributes: ["name", "mobile_number", "address"],
          },
        ],
      });

      // Kalau invoice nggak ditemukan
      if (!transaksi) {
        throw new Error(`Transaksi dengan invoice ${invoice} tidak ditemukan.`);
      }

      return {
        header,
        data: {
          invoice: transaksi.invoice,
          hotel_name: transaksi.Mst_hotel?.name ?? "-",
          division_name: transaksi.Division?.name ?? "-",
          nama_kostumer: transaksi.Kostumer?.name ?? "-",
          mobile_number: transaksi.Kostumer?.mobile_number ?? "-",
          address: transaksi.Kostumer?.address ?? "-",
          petugas: transaksi.petugas,
          check_in: transaksi.check_in,
          check_out: transaksi.check_out,
          tipe_kamar: transaksi.tipe_kamar,
          jumlah_hari: transaksi.jumlah_hari,
          jumlah_kamar: transaksi.jumlah_kamar,
          harga_kostumer_kamar_per_hari:
            transaksi.harga_kostumer_kamar_per_hari,
          total_harga:
            transaksi.harga_kostumer_kamar_per_hari *
            transaksi.jumlah_kamar *
            transaksi.jumlah_hari,
          createdAt: transaksi.createdAt,
        },
      };
    } catch (error) {
      console.error("❌ Gagal generate invoice hotel:", error.message);
      throw error;
    }
  }

  async KwitansiPassport() {
    await this.initialize();

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const transaksi = await Passport_transaction.findOne({
        where: {
          invoice: this.req.params.invoice,
          division_id: this.division_id,
        },
        include: [
          {
            model: Passport_transaction_detail,
            required: true,
            include: [
              {
                model: Mst_kota,
                as: "Mst_kotum",
                attributes: ["name"],
                required: false,
              },
            ],
          },
          {
            model: Kostumer,
            required: true,
            attributes: ["name"],
          },
        ],
      });

      if (!transaksi) {
        return {};
      }

      const detailsArray = transaksi.Passport_transaction_details;
      if (!detailsArray || detailsArray.length === 0) {
        console.error(
          `[ERROR] Transaksi ${transaksi.invoice} ditemukan tetapi tidak memiliki detail.`
        );
        return {};
      }

      // Memproses SEMUA detail, bukan hanya yang pertama
      const invoiceDetails = detailsArray.map((detail) => {
        return {
          name: detail.name,
          identity_number: detail.identity_number,
          birth_place: detail.birth_place,
          birth_date: detail.birth_date,
          kk_number: detail.kk_number,
          address: detail.address,
          price: detail.price,
          city: detail.Mst_kotum
            ? detail.Mst_kotum.name
            : "Kota Tidak Diketahui",
        };
      });

      // Menghitung total harga dari semua detail
      const totalPrice = detailsArray.reduce((sum, detail) => {
        return sum + Number(detail.price || 0);
      }, 0);

      data = {
        ...data,
        invoice: transaksi.invoice,
        petugas: transaksi.petugas,
        nama_kostumer: transaksi.Kostumer.name,
        createdAt: transaksi.createdAt,
        details: invoiceDetails,
        total_price: totalPrice,
      };

      return data;
    } catch (error) {
      console.error("Error in dataKwitansiPassport", error);
      return {};
    }
  }

  async dataKwitansiHandoverFasilitasPaket() {
    await this.initialize();
    const myDate = moment(new Date()).format("DD MMMM YYYY");

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Handover_fasilitas_paket.findOne({
        where: { invoice: this.req.params.invoice },
      });

      console.log(this.req.params);
      console.log("ini adaInvoive: ", adaInvoice);

      if (!adaInvoice) {
        return {};
      }

      const hasil = await Handover_fasilitas_paket.findOne({
        attributes: [
          "id",
          "invoice",
          "petugas",
          "penerima",
          "nomor_identitas_penerima",
          "createdAt",
        ],
        where: { invoice: this.req.params.invoice },
        include: [
          {
            model: Paket_transaction,
            include: [
              {
                model: Jamaah,
                include: [
                  {
                    model: Member,
                    attributes: ["fullname", "whatsapp_number"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!hasil) return {};

      // Basic info
      data.invoice = hasil.invoice;
      data.petugas = hasil.petugas;
      data.penerima = hasil.penerima;
      data.nomor_identitas_penerima = hasil.nomor_identitas_penerima;
      data.tanggal_transaksi = moment(hasil.createdAt).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      // Detail fasilitas
      const details = await Handover_fasilitas_detail_paket.findAll({
        where: { handover_fasilitas_paket_id: hasil.id },
        raw: true,
      });

      if (!details || details.length === 0) {
        data.detail = [];
      } else {
        const fasilitasIds = details.map((d) => d.mst_fasilitas_id);

        const fasilitasList = await Mst_fasilitas.findAll({
          where: { id: { [Op.in]: fasilitasIds } },
          attributes: ["id", "name"],
          raw: true,
        });

        const fasilitasMap = fasilitasList.reduce((acc, f) => {
          acc[f.id] = f.name;
          return acc;
        }, {});

        data.detail = details.map((detail) => ({
          name: fasilitasMap[detail.mst_fasilitas_id] || "Tidak diketahui",
        }));
      }

      // Info jamaah
      const member = hasil?.Tabungan?.Jamaah?.Member;
      if (member) {
        data.fullname = member.fullname;
        data.whatsapp_number = member.whatsapp_number;
      }

      return data;
    } catch (error) {
      console.error("Error in dataKwitansiHandoverFasilitasPaket:", error);
      throw error;
    }
  }

  async dataKwitansiHandoverBarangPaket() {
    await this.initialize();

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Handover_barang_paket.findOne({
        where: { invoice_handover: this.req.params.invoice },
      });

      if (!adaInvoice) {
        return {};
      }

      const handoverBarang = await Handover_barang_paket.findAll({
        where: { invoice_handover: this.req.params.invoice },
        attributes: [
          "invoice_handover",
          "nama_barang",
          "giver_handover",
          "giver_handover_identity",
          "giver_handover_hp",
          "giver_handover_address",
          "receiver_handover",
          "date_taken",
        ],
        raw: true,
      });
      data.invoice_handover = handoverBarang[0].invoice_handover;
      data.handover_barang = handoverBarang.map((item) => item.nama_barang);
      data.giver_handover = handoverBarang[0].giver_handover;
      data.giver_handover_identity = handoverBarang[0].giver_handover_identity;
      data.giver_handover_hp = handoverBarang[0].giver_handover_hp;
      data.giver_handover_address = handoverBarang[0].giver_handover_address;
      data.receiver_handover = handoverBarang[0].receiver_handover;
      data.receiver_jabatan = (await tipe(this.req)).toUpperCase();
      data.date_taken = moment(handoverBarang[0].date_taken).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      return data;
    } catch (error) {
      console.log("Error in dataKwitansiHandoverBarangPaket", error);
      throw error;
    }
  }

  async dataKwitansiPengembalianHandoverBarangPaket() {
    await this.initialize();

    try {
      let data = { ...(await this.header_kwitansi_invoice()) };

      const adaInvoice = await Handover_barang_paket.findOne({
        where: { invoice_returned: this.req.params.invoice },
      });

      if (!adaInvoice) {
        return {};
      }

      const handoverBarang = await Handover_barang_paket.findAll({
        where: { invoice_returned: this.req.params.invoice },
        attributes: [
          "invoice_returned",
          "nama_barang",
          "giver_returned",
          "receiver_returned",
          "receiver_returned_identity",
          "receiver_returned_hp",
          "receiver_returned_address",
          "date_returned",
        ],
        raw: true,
      });
      data.invoice_returned = handoverBarang[0].invoice_returned;
      data.handover_barang = handoverBarang.map((item) => item.nama_barang);
      data.giver_returned = handoverBarang[0].giver_returned;
      data.giver_jabatan = (await tipe(this.req)).toUpperCase();
      data.receiver_returned = handoverBarang[0].receiver_returned;
      data.receiver_returned_identity =
        handoverBarang[0].receiver_returned_identity;
      data.receiver_returned_hp = handoverBarang[0].receiver_returned_hp;
      data.receiver_returned_address =
        handoverBarang[0].receiver_returned_address;
      data.date_returned = moment(handoverBarang[0].date_returned).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      console.log(data);
      return data;
    } catch (error) {
      console.log(
        "Error in dataKwitansiPengembalianHandoverBarangPaket",
        error
      );
      throw error;
    }
  }

  async invoice_trans_transport() {
    await this.initialize();

    try {
      const invoice = this.req.params.invoice;

      const header = await this.header_kwitansi_invoice();

      const transaksi = await Transport_transaction.findOne({
        where: {
          division_id: this.division_id,
          invoice: invoice,
        },
        include: [
          {
            model: Transport_transaction_detail,
            attributes: ["car_number", "costumer_price"],
            include: [
              {
                model: Mst_mobil,
                attributes: ["name"],
              },
            ],
          },
          {
            model: Kostumer,
            required: true,
            attributes: ["name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!transaksi) {
        this.message = "Data transaksi tidak ditemukan.";
        this.state = false;
        return {
          status: false,
          message: this.message,
          data: null,
        };
      }

      const detail_mobil = transaksi.Transport_transaction_details.map((d) => ({
        car_number: d.car_number,
        price: d.costumer_price,
        nama_mobil: d.Mst_mobil?.name || "-",
      }));

      const total_price = detail_mobil.reduce(
        (sum, d) => sum + (d.price || 0),
        0
      );

      const data = {
        invoice: transaksi.invoice,
        nama_kostumer: transaksi.Kostumer.name,
        petugas: transaksi.petugas,
        total_price,
        detail_mobil,
        header_kwitansi: header,
      };

      return {
        status: true,
        message: "Data invoice berhasil diambil.",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: "Gagal ambil data invoice transport.",
        data: null,
      };
    }
  }

  async invoice_trans_fasilitas() {
    await this.initialize();

    console.log("***************");
    console.log("***************");
    console.log("***************");
    try {
      console.log("11111111111111111111");
      const invoice = this.req.params.invoice;

      const header_kwitansi = await this.header_kwitansi_invoice();

      const transaksi = await Transaction_fasilitas.findOne({
        where: {
          invoice,
        },
        include: [
          {
            model: Division,
            required: true,
            where: { company_id: this.company_id },
          },
          {
            model: Kostumer,
            required: false,
            attributes: ["name"],
          },
          {
            model: Tabungan,
            required: false,
            include: {
              model: Jamaah,
              required: false,
              include: {
                model: Member,
                required: true,
              },
            },
          },
          {
            model: Paket,
            required: false,
            attributes: ["name"],
          },
        ],
      });

      var namajamaah = "";
      if (transaksi.kostumer_id == null && transaksi.tabungan_id == null) {
        const q = await Handover_fasilitas_paket.findOne({
          where: { invoice: invoice },
          include: [
            {
              model: Paket_transaction,
              required: true,
              include: [
                {
                  model: Division,
                  required: true,
                  where: { company_id: this.company_id },
                },
                {
                  model: Jamaah,
                  required: true,
                  include: {
                    model: Member,
                    required: true,
                    attributes: ["fullname"],
                  },
                },
              ],
            },
          ],
        });

        namajamaah = q.Paket_transaction.Jamaah.Member.fullname;
      }
      console.log("2222222222222222222");
      console.log(transaksi);
      console.log("2222222222222222222");

      if (!transaksi) {
        return {};
      }

      const detailList = await Transaction_fasilitas_detail.findAll({
        where: { transaction_fasilitas_id: transaksi.id },
        include: [
          {
            model: Item_fasilitas,
            attributes: ["item_code", "harga_jual"],
            include: [
              {
                model: Mst_fasilitas,
                attributes: ["name"],
                required: true,
              },
            ],
          },
        ],
      });

      const detail_fasilitas = detailList.map((item) => {
        const itemFasilitas = item.Item_fasilita;
        return {
          item_code: itemFasilitas?.item_code || "-",
          price: itemFasilitas?.harga_jual || 0,
          nama_fasilitas: itemFasilitas?.Mst_fasilita?.name || "-",
        };
      });

      const total_price = detail_fasilitas.reduce(
        (sum, item) => sum + item.price,
        0
      );

      // transaksi.Tabungan?.Jamaah?.Member?.fullname
      let data = {
        header_kwitansi,
        invoice: transaksi.invoice,
        nama_kostumer:
          transaksi.kostumer_id != null
            ? transaksi.Kostumer.name
            : transaksi.tabungan_id != null
            ? transaksi.Tabungan?.Jamaah?.Member?.fullname
            : namajamaah,
        petugas: transaksi.petugas,
        nama_paket: transaksi.Paket?.name ?? "-",
        total_price,
        detail_fasilitas,
      };

      return data;
    } catch (error) {
      console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      console.log(error);
      console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      console.error("Gagal ambil data invoice fasilitas:", error);
      return {
        status: false,
        message: "Gagal ambil data invoice fasilitas.",
        data: null,
      };
    }
  }

  async invoice_trans_tiket() {
    await this.initialize();

    try {
      const regnum = this.req.params.regnum; // ambil dari route param

      const header_kwitansi = await this.header_kwitansi_invoice();

      const transaksi = await Ticket_transaction.findOne({
        where: {
          division_id: this.division_id,
          nomor_registrasi: regnum, // pake nomor_registrasi sebagai invoice id
        },
        include: [
          {
            model: Kostumer,
            attributes: ["name"],
          },
          {
            model: Paket,
            attributes: ["name"],
          },
          {
            model: Mst_airline,
            attributes: ["name"],
          },
        ],
      });

      if (!transaksi) {
        return {
          status: false,
          message: "Data transaksi tiket tidak ditemukan.",
          data: null,
        };
      }

      // format data invoice
      // format data invoice
      const data_invoice = {
        header: header_kwitansi,
        nomor_registrasi: transaksi.nomor_registrasi,
        airlines_name: transaksi.Mst_airline?.name || "-",
        customer: transaksi.Kostumer?.name || "-",
        paket: transaksi.Paket?.name || "-",
        status: transaksi.status,
        pax: transaksi.pax,
        code_booking: transaksi.code_booking,
        // harga per pax
        costumer_price: transaksi.costumer_price,
        // total harga (per pax x jumlah pax)
        total_harga: transaksi.costumer_price * transaksi.pax,
        departure_date: transaksi.departure_date,
        arrival_date: transaksi.arrival_date,
        createdAt: transaksi.createdAt,
        updatedAt: transaksi.updatedAt,
      };

      console.log("Data invoice tiket:", data_invoice);

      return {
        status: true,
        message: "Berhasil ambil data invoice tiket.",
        data: data_invoice,
      };
    } catch (error) {
      console.error("Gagal ambil data invoice ticket:", error);
      return {
        status: false,
        message: "Gagal ambil data invoice ticket.",
        data: null,
      };
    }
  }

  async kwitansi_refund_tiket() {
    await this.initialize();

    try {
      const invoice = this.req.params.invoice; // ambil dari route param
      console.log("invoice", invoice);

      const header_kwitansi = await this.header_kwitansi_invoice();

      const transaksi = await Ticket_payment_history.findOne({
        where: {
          invoice: invoice,
        },
        include: [
          {
            model: Ticket_transaction,
            include: [
              {
                model: Kostumer,
                attributes: ["name"],
              },
              {
                model: Paket,
                attributes: ["name"],
              },
              {
                model: Mst_airline,
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      if (!transaksi) {
        return {
          status: false,
          message: "Data refund ticket tidak ditemukan.",
          data: null,
        };
      }

      return {
        header: header_kwitansi, // data header (perusahaan / logo / alamat)
        transaksi: {
          invoice: transaksi.invoice,
          tanggal: transaksi.createdAt,
          nominal_refund: transaksi.nominal,
          petugas: transaksi.petugas,
          nomor_registrasi: transaksi.Ticket_transaction.nomor_registrasi,
          customer: transaksi.Ticket_transaction.Kostumer?.name,
          paket: transaksi.Ticket_transaction.Paket?.name,
          airline: transaksi.Ticket_transaction.Mst_airline?.name,
          pax: transaksi.Ticket_transaction.pax,
          departure_date: transaksi.Ticket_transaction.departure_date,
          arrival_date: transaksi.Ticket_transaction.arrival_date,
        },
      };
    } catch (error) {
      console.error("Gagal ambil data refund ticket:", error);
      return {
        status: false,
        message: "Gagal ambil data refund ticket.",
        data: null,
      };
      
    }
  }


  async invoice_pembayaran_tiket() {
    await this.initialize();
    try {
      const invoice = this.req.params.invoice; // ambil invoice dari URL

      const header_kwitansi = await this.header_kwitansi_invoice();

      // Cari payment berdasarkan invoice
      const pembayaran = await Ticket_payment_history.findOne({
        where: { invoice },
        include: [
          {
            model: Ticket_transaction,
            attributes: [
              "id",
              "costumer_price",
              "status",
              "pax",
              "departure_date",
              "arrival_date",
            ],
            include: [
              { model: Kostumer, attributes: ["name"] },
              { model: Paket, attributes: ["name"] },
              { model: Mst_airline, attributes: ["name"] },
            ],
          },
        ],
      });

      if (!pembayaran) throw new Error("Data pembayaran tidak ditemukan");

      const transaksi = pembayaran.Ticket_transaction;

      // Hitung total pembayaran untuk transaksi ini
      const totalPembayaran = await Ticket_payment_history.sum("nominal", {
        where: { ticket_transaction_id: transaksi.id },
      });

      const totalTagihan = transaksi.costumer_price;
      const sisaPembayaran = totalTagihan - totalPembayaran;
      const statusPembayaran = sisaPembayaran <= 0 ? "Lunas" : "Belum Lunas";

      return {
        header_kwitansi,
        invoice: pembayaran.invoice,
        tanggal_pembayaran: pembayaran.createdAt,
        customer: transaksi.Kostumer?.name,
        paket: transaksi.Paket?.name,
        airline: transaksi.Mst_airline?.name,
        totalTagihan,
        totalPembayaran,
        sisaPembayaran: sisaPembayaran > 0 ? sisaPembayaran : 0,
        statusPembayaran,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = Model_r;
