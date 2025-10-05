const axios = require("axios");
const FormData = require("form-data");
const moment = require("moment");
const { Op } = require("sequelize");
const {
  Whatsapp_message,
  Whatsapp_template,
  User,
  Member,
  Jamaah,
  Agen,
  Tabungan,
  Peminjaman,
  Riwayat_pembayaran_peminjaman,
  Level_keagenan,
  Paket,
  Paket_transaction,
  Company,
  Paket_la,
  sequelize,
  Division,
} = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const {
  getCompanyIdByCode,
  getCabang,
  tipe,
} = require("../../../helper/companyHelper");

// Helper buat replace variable di template pesan
function replaceTemplate(pesanTemplate, data) {
  let pesan = pesanTemplate;
  for (const key in data) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    pesan = pesan.replace(regex, data[key] !== undefined ? data[key] : "");
  }
  return pesan;
}

class Model_cud {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id = null;
    this.division_id = null;
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

  async get_key() {
    await this.initialize();
    const data = await Company.findOne({
      where: { id: this.company_id },
      attributes: ["whatsapp_device_key", "whatsapp_api_key"],
    });
    return data;
  }

  async ambil_data_jamaah() {
    await this.initialize();

    const data = await Jamaah.findAll({
      where: { division_id: this.division_id },
      include: [
        {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number", "identity_number"],
        },
        {
          required: false,
          model: Peminjaman,
          attributes: ["id", "tenor"],
          include: [
            {
              model: Riwayat_pembayaran_peminjaman,
              required: false,
              where: { company_id: this.company_id },
            },
          ],
        },
      ],
    });

    return data.map((jamaah) => {
      const member = jamaah.Member;
      const peminjaman = jamaah.Peminjaman;

      const total_tenor = peminjaman?.tenor || 0;
      const sudah_bayar =
        peminjaman?.Riwayat_pembayaran_peminjaman?.length || 0;
      const sisa_tenor = total_tenor - sudah_bayar;

      return {
        nama_jamaah: member?.fullname,
        nomor_identitas: member?.identity_number,
        nomor_wa: member?.whatsapp_number,
        total_tenor,
        sudah_bayar,
        sisa_tenor,
      };
    });
  }

  async ambil_data_staff() {
    await this.initialize();

    const data = await User.findAll({
      where: { division_id: this.division_id },
      include: [
        {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number"],
        },
      ],
    });

    return data.map((staff) => {
      const member = staff.Member;
      return {
        nama_staff: member?.fullname,
        nomor_wa: member?.whatsapp_number,
      };
    });
  }

  async ambil_data_agen() {
    await this.initialize();

    const data = await Agen.findAll({
      include: [
        {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number"],
        },
        {
          required: true,
          model: Level_keagenan,
          attributes: ["level"],
        },
      ],
    });

    return data.map((agen) => {
      const member = agen.Member;
      return {
        nama_agen: member?.fullname,
        level: agen.Level_keagenan.level,
        nomor_wa: member?.whatsapp_number,
      };
    });
  }

  async ambil_data_jamaah_tabungan() {
    await this.initialize();

    const data = await Tabungan.findAll({
      where: { division_id: this.division_id },
      attributes: ["total_tabungan"],
      include: [
        {
          required: true,
          model: Jamaah,
          include: [
            {
              required: true,
              model: Member,
              attributes: ["fullname", "whatsapp_number", "identity_number"],
            },
          ],
        },
      ],
    });

    return data.map((tabungan) => {
      const jamaah = tabungan.Jamaah;
      const member = jamaah.Member;
      return {
        nama_jamaah: member?.fullname,
        nomor_identitas: member?.identity_number,
        nomor_wa: member?.whatsapp_number,
        total_tabungan: tabungan.total_tabungan,
      };
    });
  }

  async jamaah_utang_koperasi() {
    await this.initialize();

    const data = await Jamaah.findAll({
      where: { division_id: this.division_id },
      include: [
        {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number", "identity_number"],
        },
        {
          required: true,
          model: Peminjaman,
          attributes: ["id", "tenor", "nominal", "total_utang"],
          include: [
            {
              model: Riwayat_pembayaran_peminjaman,
              required: false,
              where: { company_id: this.company_id },
            },
          ],
        },
      ],
    });

    const result = data
      .map((jamaah) => {
        const member = jamaah.Member;
        const peminjaman = jamaah.Peminjaman;
        if (!peminjaman) return null;

        const total_utang = peminjaman.total_utang || 0;
        const riwayat = peminjaman.Riwayat_pembayaran_peminjaman || [];

        const total_bayar = riwayat.reduce(
          (sum, bayar) => sum + (bayar.jumlah || 0),
          0
        );
        const sisa_utang = total_utang - total_bayar;

        return {
          nama_jamaah: member?.fullname,
          nomor_identitas: member?.identity_number,
          nomor_wa: member?.whatsapp_number,
          total_utang,
          total_bayar,
          sisa_utang,
        };
      })
      .filter(Boolean);

    return result;
  }

  async jamaah_paket() {
    await this.initialize();

    const data = await Jamaah.findAll({
      where: { division_id: this.division_id },
      include: [
        {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number", "identity_number"],
        },
        {
          model: Paket_transaction,
          required: false,
          include: [
            {
              required: true,
              model: Paket,
              attributes: ["name", "kode"],
            },
          ],
        },
      ],
    });

    return data.map((jamaah) => {
      const member = jamaah.Member;
      const paket = jamaah.Paket_transaction?.Paket;
      return {
        nama_jamaah: member?.fullname,
        nomor_identitas: member?.identity_number,
        nomor_wa: member?.whatsapp_number,
        nama_paket: paket?.name,
        kode_paket: paket?.kode,
      };
    });
  }

  async jamaah_sudah_berangkat() {
    await this.initialize();

    const data = await Jamaah.findAll({
      where: { division_id: this.division_id },
      include: [
        {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number", "identity_number"],
        },
        {
          required: true,
          model: Paket_transaction,
          as: "Paket_transactions",
          include: [
            {
              required: true,
              model: Paket,
              attributes: ["name", "kode", "departure_date", "return_date"],
              where: { departure_date: { [Op.lte]: new Date() } },
            },
          ],
        },
      ],
    });

    return data.flatMap((jamaah) => {
      const member = jamaah.Member;
      const transactions = jamaah.Paket_transactions || [];

      return transactions.map((trx) => {
        const paket = trx.Paket;
        return {
          nama_jamaah: member?.fullname,
          nomor_identitas: member?.identity_number,
          nomor_wa: member?.whatsapp_number,
          nama_paket: paket?.name,
          kode_paket: paket?.kode,
          tanggal_berangkat: paket?.departure_date,
          tanggal_kepulangan: paket?.return_date,
        };
      });
    });
  }

  async hit_kewapisender({ type, pesan, whatsapp_template_id }) {
    await this.initialize();

    const nomor_asal = this.req.body.nomor_asal || "";
    const nomor_tujuan = this.req.body.nomor_tujuan || "";

    let target = [];

    switch (type) {
      case "pesan_biasa":
        target = Array.isArray(nomor_tujuan)
          ? nomor_tujuan.map((n) => ({ nomor_wa: n }))
          : [{ nomor_wa: nomor_tujuan }];
        break;
      case "semua_jamaah":
        target = await this.ambil_data_jamaah();
        break;
      case "staff":
        target = await this.ambil_data_staff();
        break;
      case "agen":
        target = await this.ambil_data_agen();
        break;
      case "jamaah_tabungan":
        target = await this.ambil_data_jamaah_tabungan();
        break;
      case "jamaah_utang_koperasi":
        target = await this.jamaah_utang_koperasi();
        break;
      case "jamaah_paket":
        target = await this.jamaah_paket();
        break;
      case "jamaah_sudah_berangkat":
        target = await this.jamaah_sudah_berangkat();
        break;
      default:
        throw new Error(`Tipe pesan ${type} tidak dikenal`);
    }

    const keys = await this.get_key();
    if (!keys) throw new Error("Gagal mendapatkan API Key Wapisender");

    for (const orang of target) {
      if (!orang.nomor_wa) continue;

      const pesanFinal = replaceTemplate(pesan, orang);

      const form = new FormData();
      form.append("api_key", keys.whatsapp_api_key);
      form.append("device_key", keys.whatsapp_device_key);
      form.append("destination", orang.nomor_wa);
      form.append("message", pesanFinal);

      try {
        const response = await axios.post(
          "https://wapisender.id/api/v5/message/text",
          form,
          { headers: form.getHeaders() }
        );
        console.log(`Pesan ke ${orang.nomor_wa} sukses`, response.data);
        if (
          response.data.status === "ok" &&
          response.data.data?.status === "sent"
        ) {
          // Update status jadi finish di Whatsapp_message
          await Whatsapp_message.update(
            { status: "finish" },
            { where: { division_id: this.division_id } } // atau sesuaikan field-nya
          );
        }
      } catch (error) {
        console.error(
          `Gagal kirim pesan ke ${orang.nomor_wa}`,
          error.response?.data || error.message
        );
      }
    }
  }

  // Contoh fungsi add_pesan buat simpan pesan ke DB
  async add_pesan() {
    await this.initialize();
    await this.transaction();
    const my_date = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const insert = await Whatsapp_message.create(
        {
          division_id: this.division_id,
          type: this.req.body.type,
          pesan: this.req.body.pesan,
          nomor_asal: this.req.body.nomor_asal || null,
          whatsapp_template_id: this.req.body.whatsapp_template_id || null,
          status: "process",
          createdAt: my_date,
          updatedAt: my_date,
        },
        { transaction: this.t }
      );
      this.message = `Menambahkan Pesan Baru dengan ID Pesan : ${insert.id}`;
    } catch (error) {
      console.error("Gagal tambah pesan:", error);
      this.message = "Gagal menambahkan pesan.";
      await this.t.rollback();
      this.state = false;
      throw error;
    }
  }

  async delete_pesan() {
    await this.initialize();
    await this.transaction();
    const body = this.req.body;
    try {
      const deleted = await Whatsapp_message.destroy({
        where: {
          id: body.id,
          division_id: this.division_id,
        },
        transaction: this.t,
      });

      if (deleted === 0) throw new Error("Data tidak ditemukan");

      this.message = `Menghapus Template dengan ID : ${body.id}`;
    } catch (error) {
      console.error("Gagal menghapus pesan:", error);
      this.message = "Gagal menghapus pesan.";
      await this.t.rollback();
      this.state = false;
      throw error;
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
