const { Peminjaman, Skema_peminjaman, Riwayat_pembayaran_peminjaman, Deposit, Fee_agen, Member, Company, Level_keagenan, Jamaah, Agen, Division, Jurnal } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, tipe, getCabang } = require("../../../helper/companyHelper");
const { menghasilkan_invoice_riwayat_pembayaran_peminjaman, menghasilkan_nomor_registrasi_peminjaman, menghasilkan_invoice_fee_agen } = require("../../../helper/randomHelper");
const moment = require("moment");
const { sequelize } = require("../../../models");

class Model_cud {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id = null;
    this.division_id;
    this.message = "";
    this.t = null;
    this.state = true;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async transaction() {
    this.t = await sequelize.transaction();
  }

  async hapus() {

    await this.initialize();

    await this.transaction();

    try {
      var data = await Peminjaman.findOne({ 
        where: { 
          id: this.req.body.id 
        }, 
        include: { 
          model: Division, 
          required: true,
          where: { 
            company_id: this.company_id 
          }
        }
      });

      // delete riwayat peminjaman 
      await Riwayat_pembayaran_peminjaman.destroy(
        {
          where: {
            peminjaman_id: data.id,
            division_id: data.division_id
          },
          transaction: this.t,
        },
      );

      // delete skema peminjaman
      await Skema_peminjaman.destroy(
        {
          where: {
            peminjaman_id: data.id,
            division_id: data.division_id
          },
          transaction: this.t,
        },
      );

      // delete peminjaman 
      await Peminjaman.destroy(
        {
          where: {
            id: this.req.body.id,
            division_id: data.division_id
          },
          transaction: this.t,
        },
      );

      // delete jurnal
      await Jurnal.destroy(
        {
          where: {
            source: 'peminjamanId:' + this.req.body.id,
            division_id: data.division_id
          },
          transaction: this.t,
        },
      );

      this.message = `Menghapus data peminjaman dengan nomor registrasi peminjaman ${data.register_number}`;
    } catch (error) {
      console.log("^^^^^^^^^^^^^^^^^^^^");
      console.log(error);
      console.log("^^^^^^^^^^^^^^^^^^^^");
      this.state = false;
    }
  }

  async mengambil_info_jamaah() {
    try {
      const jamaah = await Jamaah.findOne({
        attribute: ["member_id", "agen_id"],
        where: { id: this.req.body.jamaah_id },
        include: {
          required: true,
          model: Member,
          attribute: ["total_deposit"],
        },
      });
      return {
        member_id: jamaah.member_id,
        agen_id: jamaah.agen_id,
        total_deposit: jamaah.Member.total_deposit,
      };
    } catch (error) {
      return {};
    }
  }

  async petugas() {
    const role = await tipe(this.req);

    if (role === "administrator") {
      const company = await Company.findOne({ where: { id: this.company_id } });
      return company?.company_name ?? "Unknown Company";
    }

    if (role === "staff") {
      const member = await Member.findOne({
        where: { division_id: this.division_id, role: "staff" },
        order: [["id", "DESC"]],
      });
      return member?.fullname ?? "Unknown Staff";
    }

    return "Tipe user tidak diketahui";
  }

  async defaultFee() {
    try {
      const jamaah = await Jamaah.findOne({
        where: { id: this.req.body.jamaah_id },
        include: {
          model: Agen,
          include: { model: Level_keagenan },
        },
      });
      const default_fee = jamaah?.Agen?.Level_keagenan?.default_fee ?? 0;
      const agen_id = jamaah?.Agen?.id ?? null;
      return { default_fee, agen_id };
    } catch (err) {
      return { default_fee: 0, agen_id: null };
    }
  }

  async Skema_peminjaman(peminjaman_id) {
    const { nominal, tenor, dp, mulai_bayar } = this.req.body;
    const utang = nominal - dp;
    let biaya_perbulan = Math.ceil(utang / tenor / 1000) * 1000;
    const sisaUtang = utang - biaya_perbulan * (tenor - 1);
    biaya_perbulan = biaya_perbulan > 0 ? biaya_perbulan : 1000;

    const skema = [];
    for (let i = 0; i < tenor; i++) {
      const jumlah = i === tenor - 1 ? sisaUtang : biaya_perbulan;
      const tanggalJatuhTempo = moment(mulai_bayar)
        .add(i, "months")
        .format("YYYY-MM-DD");

      skema.push({
        division_id: this.division_id,
        peminjaman_id,
        term: i + 1,
        nominal: jumlah,
        duedate: tanggalJatuhTempo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await Skema_peminjaman.bulkCreate(skema, { transaction: this.t });
  }

  async createPeminjaman() {
    await this.initialize();

    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    const { cabang, sumber_dana, jamaah_id, nominal, tenor, dp, sudah_berangkat = false, } = this.req.body;
    const petugas = await this.petugas();
    const register_number = await menghasilkan_nomor_registrasi_peminjaman();
    const invoice = await menghasilkan_invoice_riwayat_pembayaran_peminjaman();
    const invoice_fee_agen = await menghasilkan_invoice_fee_agen();
    const info_jamaah = await this.mengambil_info_jamaah();
    const saldoSebelum = info_jamaah.total_deposit;
    const saldoSesudah = saldoSebelum + nominal;
    const member_id = info_jamaah.member_id;
    const body = this.req.body;
    try {
      await this.transaction();
      // Insert data Peminjaman baru
      const IP = await Peminjaman.create(
        {
          division_id: cabang,
          jamaah_id,
          register_number,
          nominal,
          tenor,
          dp : dp == '' ? 0 : dp,
          petugas,
          status_peminjaman: "belum_lunas",
          createdAt: now,
          updatedAt: now,
        },
        { transaction: this.t }
      );

       // Jurnal
      await Jurnal.create(
        {
          division_id: this.req.body.cabang, 
          source: 'peminjamanId:' + IP.id,
          ref: 'Transaksi Peminjaman dengan nomor registrasi ' + register_number,
          ket: 'Transaksi Peminjaman dengan nomor registrasi ' + register_number,
          akun_debet: '13000',
          akun_kredit: '11010',
          saldo: (nominal - dp),
          removable: 'false',
          periode_id: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          transaction: this.t,
        }
      );

      if (tenor && nominal) {
        //membuat skema peminjaman
        await this.Skema_peminjaman(IP.id);
      }

      if (dp > 0) {
        // menginput riwayat pembayara jika ada DP
        await Riwayat_pembayaran_peminjaman.create(
          {
            division_id: body.cabang,
            peminjaman_id: IP.id,
            invoice,
            nominal: dp,
            status: "dp",
            petugas,
            createdAt: now,
            updatedAt: now,
          },
          { transaction: this.t }
        );
      }

      if (!sudah_berangkat) {
        await Deposit.create(
          {
            division_id: body.cabang,
            member_id,
            invoice,
            nominal,
            saldo_sebelum: saldoSebelum,
            saldo_sesudah: saldoSesudah,
            sumber_dana: "cash",
            penerima: petugas,
            tipe_transaksi: "deposit",
            info: "dari peminjaman yang belum berangkat",
            createdAt: now,
            updatedAt: now,
          },
          { transaction: this.t }
        );
      }

      // tambah fee agen jika ada
      if (info_jamaah.agen_id) {
        const { default_fee } = await this.defaultFee();

        return await Fee_agen.create(
          {
            division_id: body.cabang,
            agen_id: info_jamaah.agen_id,
            invoice: invoice_fee_agen,
            nominal: default_fee,
            status_bayar: "belum_lunas",
            info: "dari pinjaman jamaah",
            createdAt: now,
            updatedAt: now,
          },
          { transaction: this.t }
        );
      }

      this.message = "Peminjaman berhasil dibuat";
    } catch (err) {
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      console.log(err);
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      this.state = false;
      this.message = "Gagal membuat peminjaman: " + err.message;
      console.error(err);
    }
  }

  async updateSkema() {
    await this.initialize(); // bikin this.t
    await this.transaction();
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const { peminjaman_id, updatedSkema } = this.req.body;
      // delete skema peminjaman
      await Skema_peminjaman.destroy(
        {
          where: {
            peminjaman_id: peminjaman_id,
            division_id: this.division_id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // create new skema peminjaman
      for (let x in updatedSkema) {
        await Skema_peminjaman.create(
          {
            division_id: this.division_id,
            peminjaman_id: peminjaman_id,
            term: updatedSkema[x].term,
            nominal: updatedSkema[x].nominal,
            duedate: updatedSkema[x].duedate,
            createdAt: now,
            updatedAt: now,
          },
          { transaction: this.t }
        );
      }

      this.message = "Skema berhasil diperbarui";
    } catch (err) {
      this.state = false;
      this.message = "Gagal memperbarui skema: " + err.message;
      console.error("updateSkema Error:", err);
    }
  }

  async generateInvoicePembayaran() {
    const prefix = "BYR-";
    const year = new Date().getFullYear();

    const randomAlphanumeric = (length) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    const invoiceCode = `${prefix}${year}${randomAlphanumeric(6)}`;
    return invoiceCode;
  }

  async pembayaranPerbulan() {
    await this.initialize();
    await this.transaction();

    const { peminjaman_id, nominal } = this.req.body;
    this.invoice = await this.generateInvoicePembayaran(); // Simpan invoice dalam properti ini
    const petugas = await this.petugas();
    const status = "cicilan";
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log("data dari front end:", this.req.body);

    try {

      var data = await Peminjaman.findOne({ 
        where: { 
          id: peminjaman_id 
        }, 
        include: { 
          model: Jamaah, 
          required: true, 
          include: {
            model: Member, 
            required: true
          }
        }
      });

      await Riwayat_pembayaran_peminjaman.create(
        {
          division_id: data.division_id,
          peminjaman_id,
          invoice: this.invoice, // Gunakan invoice yang sudah disimpan
          nominal,
          petugas,
          status,
          createdAt: now,
          updatedAt: now,
        },
        { transaction: this.t }
      );

      // jurnal
      await Jurnal.create(
        {
          division_id: data.division_id, 
          source: 'peminjamanId:' + peminjaman_id,
          ref: `Pembayaran Utang Peminjaman Jamaah ${data.Jamaah.Member.fullname} dengan nomor registrasi ${data.register_number} dan nomor invoice ${this.invoice}`,
          ket: `Pembayaran Utang Peminjaman Jamaah ${data.Jamaah.Member.fullname} dengan nomor registrasi ${data.register_number} dan nomor invoice ${this.invoice}`,
          akun_debet: '11010',
          akun_kredit: '13000',
          saldo: nominal,
          removable: 'false',
          periode_id: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          transaction: this.t,
        }
      );

      this.message = "Pembayaran perbulan berhasil dibuat"; // Set message
    } catch (err) {
      this.state = false;
      this.message = "Gagal membuat pembayaran perbulan: " + err.message;
      console.error("pembayaranPerbulan Error:", err);
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
