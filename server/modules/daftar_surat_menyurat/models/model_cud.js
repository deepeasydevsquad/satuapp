const {
  sequelize,
  Konfigurasi_surat_menyurat,
  Riwayat_surat_menyurat,
  Company,
  Member,
} = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.company_id = null;
    this.message = "";
    this.t = null;
    this.state = true;
  }

  async petugas() {
    const role = await tipe(this.req);

    if (role === "administrator") {
      const company = await Company.findOne({ where: { id: this.company_id } });
      return {
        role: "administrator",
        name: company?.company_name ?? "Unknown Company",
      };
    }

    if (role === "staff") {
      const member = await Member.findOne({
        where: { company_id: this.company_id, role: "staff" },
        order: [["id", "DESC"]],
      });

      return {
        role: "staff",
        id: member?.id ?? null,
        name: member?.fullname ?? "Unknown Staff",
      };
    }

    return {
      role: "unknown",
      name: "Tipe user tidak diketahui",
    };
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async addKonfigurasiSuratMenyurat() {
    await this.initialize();
    const body = this.req.body;
    console.log("body", body);
    let data;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    try {
      if (body.id) {
        // Cek dulu apakah ID yang dikirim ada di database
        const existing = await Konfigurasi_surat_menyurat.findOne({
          where: { id: body.id },
        });

        if (existing) {
          // Kalau ada, update data-nya
          await Konfigurasi_surat_menyurat.update(
            { ...body },
            {
              where: { id: body.id },
              transaction: this.t,
            }
          );
          this.message = `Berhasil update Konfigurasi Surat Menyurat dengan ID: ${body.id}`;
          return;
        }
      }

      // Kalau gak ada ID, atau ID gak ditemukan, maka create baru
      data = await Konfigurasi_surat_menyurat.create(
        {
          company_id: this.company_id,
          nama_tanda_tangan: body.nama_tanda_tangan,
          jabatan_tanda_tangan: body.jabatan_tanda_tangan,
          alamat_tanda_tangan: body.alamat_tanda_tangan,
          nama_perusahaan: body.nama_perusahaan,
          izin_perusahaan: body.izin_perusahaan,
          kota_perusahaan: body.kota_perusahaan,
          provinsi_perusahaan: body.provinsi_perusahaan,
          alamat_perusahaan: body.alamat_perusahaan,
          no_kontak_perusahaan: body.no_kontak_perusahaan,
          website_perusahaan: body.website_perusahaan,
          email_perusahaan: body.email_perusahaan,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan Konfigurasi Surat Menyurat Baru dengan ID: ${data.id}`;
    } catch (error) {
      this.state = false;
      console.error("Error di addKonfigurasiSuratMenyurat:", error);
    }
  }

  async addSurat() {
    await this.initialize();
    const body = this.req.body;
    const mydate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Ambil info petugas
    const petugasInfo = await this.petugas();

    // Cek apakah ada konfigurasi surat utk company ini
    const konfigurasi = await Konfigurasi_surat_menyurat.findOne({
      where: { company_id: this.company_id },
    });

    if (!konfigurasi) {
      this.state = false;
      this.message = "Silahkan Buat Konfigurasi Terlebih Dahulu";
      console.log("Silahkan Buat Konfigurasi Terlebih Dahulu");
      return;
    }

    // Format field info
    let info = {};

    switch (body.tipe_surat) {
      case "rekom_paspor":
        info = {
          jamaah_id: body.jamaah_id,
          bulan_tahun_berangkat: body.bulan_tahun_berangkat,
        };
        break;

      case "surat_cuti":
        info = {
          jamaah_id: body.jamaah_id,
          jabatan: body.jabatan,
          keberangkatan: body.keberangkatan,
          kepulangan: body.kepulangan,
        };
        break;

      default:
        this.state = false;
        this.message = "Tipe surat tidak dikenali.";
        return;
    }

    try {
      await Riwayat_surat_menyurat.create(
        {
          company_id: this.company_id,
          nomor_surat: body.nomor_surat,
          tipe_surat: body.tipe_surat,
          tanggal_surat: body.tanggal_surat,
          info: JSON.stringify(info),
          tujuan: body.tujuan,
          nama_petugas: petugasInfo.name,
          petugas_id: petugasInfo.id || null,
          createdAt: mydate,
          updatedAt: mydate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Surat berhasil ditambahkan oleh ${petugasInfo.name}`;
    } catch (error) {
      this.state = false;
      console.error("❌ Error di addSurat:", error);
      this.message = "Gagal menambahkan surat.";
    }
  }

  async deleteSurat() {
    await this.initialize();
    const body = this.req.body;

    try {
      await Riwayat_surat_menyurat.destroy({
        where: { id: body.id, company_id: this.company_id },
        transaction: this.t,
      });
      this.message = "Surat berhasil dihapus.";
    } catch (error) {
      this.state = false;
      console.error("❌ Error di deleteSurat:", error);
      this.message = "Gagal menghapus surat.";
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
