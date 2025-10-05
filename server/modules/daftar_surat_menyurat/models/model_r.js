const {
  Op,
  Konfigurasi_surat_menyurat,
  Riwayat_surat_menyurat,
  Jamaah,
  Member,
  Division,
  Company,
  Mst_kota,
  Kelurahan,
  Kecamatan,
  Kabupaten_kota,
  Provinsi,
} = require("../../../models");
const {
  getCompanyIdByCode,
  getCabang,
} = require("../../../helper/companyHelper");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async data_perusahaan() {
    await this.initialize();

    const division = await Division.findOne({
      attributes: ["name", "pos_code", "address"],
      where: { id: this.division_id },
      include: [
        {
          model: Company,
          attributes: ["invoice_logo", "company_name"],
          required: true,
        },
        { model: Mst_kota, attributes: ["name"] },
      ],
    });

    if (!division) return { logo: "default.png", company_name: "-", city: "-" };

    const logoFile = division.Company?.invoice_logo;
    const logoPath = logoFile
      ? path.join(__dirname, "../../../uploads", logoFile)
      : null;
    const logoExists = logoFile && fs.existsSync(logoPath);
    console.log(JSON.stringify(division, null, 2));

    return {
      logo: logoExists ? logoFile : "default.png",
      company_name: division.Company?.company_name ?? "-",
      city: division.Mst_kotum?.name ?? "-",
    };
  }

  async daftar_jamaah() {
    const jamaah = await Jamaah.findAll({
      attributes: ["id"],
      include: [
        {
          model: Member,
          attributes: ["fullname", "identity_number"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Ekstrak datanya biar hasilnya clean
    const hasil = jamaah.map((item) => {
      return {
        jamaah_id: item.id,
        nama_jamaah: item.Member?.fullname || null,
        identity_number: item.Member?.identity_number || null,
      };
    });

    return hasil;
  }

  async formatInfoSurat(infoRaw) {
    let parsedInfo;
    try {
      parsedInfo = JSON.parse(infoRaw);
    } catch {
      return {
        text: "Info tidak valid (bukan JSON)",
        jamaah_id: null,
      };
    }

    let nama_jamaah = null;
    let jamaah_id = parsedInfo.jamaah_id ?? null;

    if (jamaah_id) {
      const jamaah = await Jamaah.findOne({
        where: { id: jamaah_id },
        include: [{ model: Member, attributes: ["fullname"] }],
      });

      nama_jamaah = jamaah?.Member?.fullname ?? "(Jamaah tidak ditemukan)";
    }

    let text;

    if (parsedInfo.bulan_tahun_berangkat) {
      text = `Jamaah: ${nama_jamaah}, Berangkat: ${parsedInfo.bulan_tahun_berangkat}`;
    } else if (
      parsedInfo.jabatan &&
      parsedInfo.keberangkatan &&
      parsedInfo.kepulangan
    ) {
      text = `Jamaah: ${nama_jamaah}, Jabatan: ${parsedInfo.jabatan}, Cuti: ${parsedInfo.keberangkatan} s/d ${parsedInfo.kepulangan}`;
    } else {
      text = JSON.stringify(parsedInfo, null, 2); // fallback
    }

    return {
      text,
      jamaah_id,
    };
  }

  async get_konfigurasi_surat() {
    await this.initialize();
    try {
      const config = await Konfigurasi_surat_menyurat.findOne({
        where: {
          company_id: this.company_id,
        },
      });

      if (!config) {
        return null;
      }

      const data = {
        id: config.id,
        nama_tanda_tangan: config.nama_tanda_tangan,
        jabatan_tanda_tangan: config.jabatan_tanda_tangan,
        alamat_tanda_tangan: config.alamat_tanda_tangan,
        nama_perusahaan: config.nama_perusahaan,
        izin_perusahaan: config.izin_perusahaan,
        kota_perusahaan: config.kota_perusahaan,
        provinsi_perusahaan: config.provinsi_perusahaan,
        alamat_perusahaan: config.alamat_perusahaan,
        no_kontak_perusahaan: config.no_kontak_perusahaan,
        website_perusahaan: config.website_perusahaan,
        email_perusahaan: config.email_perusahaan,
      };

      return data;
    } catch (error) {
      console.error("Error konfigurasi_surat:", error);
      return null;
    }
  }

  async daftar_riwayat_surat() {
    await this.initialize();
    const body = this.req.body;

    const limit = parseInt(body.perpage) || 10;
    const page = parseInt(body.pageNumber) || 1;
    const offset = (page - 1) * limit;
    const search = body.search;

    try {
      // ambil semua data dulu
      const raw = await Riwayat_surat_menyurat.findAll({
        where: {
          company_id: this.company_id,
          ...(search && search !== ""
            ? {
                [Op.or]: [
                  { nomor_surat: { [Op.like]: `%${search}%` } },
                  { tipe_surat: { [Op.like]: `%${search}%` } },
                  { tujuan: { [Op.like]: `%${search}%` } },
                  { nama_petugas: { [Op.like]: `%${search}%` } },
                ],
              }
            : {}),
        },
        order: [["id", "DESC"]],
      });

      // format datanya
      const allData = await Promise.all(
        raw.map(async (item) => {
          const infoFormatted = await this.formatInfoSurat(item.info);
          return {
            id: item.id,
            nomor_surat: item.nomor_surat,
            tipe_surat: item.tipe_surat,
            tanggal_surat: moment(item.tanggal_surat).format("YYYY-MM-DD"),
            info: infoFormatted,
            tujuan: item.tujuan,
            nama_petugas: item.nama_petugas,
          };
        })
      );

      const data = allData.slice(offset, offset + limit);

      return {
        total: allData.length,
        data: data,
      };
    } catch (error) {
      console.error("Error daftar_riwayat_surat:", error);
      return {
        total: 0,
        data: [],
        error: "Gagal ambil data riwayat surat",
      };
    }
  }

  async data_jamaah(jamaah_id) {
    const dataJamaah = await Jamaah.findOne({
      where: { id: jamaah_id },
      include: [
        {
          model: Member,
          attributes: [
            "fullname",
            "identity_number",
            "birth_date",
            "birth_place",
          ],
        },
        {
          model: Kelurahan,
          attributes: ["name"],
          include: [
            {
              model: Kecamatan,
              attributes: ["name"],
              include: [
                {
                  model: Kabupaten_kota,
                  attributes: ["name"],
                  include: [
                    {
                      model: Provinsi,
                      attributes: ["name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const data = {
      fullname: dataJamaah.Member?.fullname,
      identity_number: dataJamaah.Member?.identity_number,
      birth_date: dataJamaah.Member?.birth_date,
      birth_place: dataJamaah.Member?.birth_place,
      alamat: [
        dataJamaah.Kelurahan?.name,
        dataJamaah.Kelurahan?.Kecamatan?.name,
        dataJamaah.Kelurahan?.Kecamatan?.Kabupaten_kotum?.name,
        dataJamaah.Kelurahan?.Kecamatan?.Kabupaten_kotum?.Provinsi?.name,
      ]
        .filter(Boolean)
        .join(", "),
    };

    return data;
  }

  async cetak_rekom_paspor(jamaah_id) {
    await this.initialize();
    const data_perusahaan = await this.data_perusahaan();
    const data_pimpinan = await this.get_konfigurasi_surat();
    const data_jamaah = await this.data_jamaah(jamaah_id);

    // Ambil semua surat rekom paspor
    const allData = await Riwayat_surat_menyurat.findAll({
      where: {
        company_id: this.company_id,
        tipe_surat: "rekom_paspor",
      },
    });

    // Filter manual berdasarkan jamaah_id yang ada di info
    const matching = allData.find((item) => {
      try {
        const info = JSON.parse(item.info);
        return info.jamaah_id == jamaah_id.toString(); // pastiin tipe data sama
      } catch (e) {
        return false;
      }
    });

    if (!matching) return null;

    const infoFormatted = await this.formatInfoSurat(matching.info);

    const data_surat = {
      nomor_surat: matching.nomor_surat,
      tipe_surat: matching.tipe_surat,
      tanggal_surat: moment(matching.tanggal_surat).format("YYYY-MM-DD"),
      info: infoFormatted,
      tujuan: matching.tujuan,
      nama_petugas: matching.nama_petugas,
    };

    return {
      data_pimpinan,
      data_surat,
      data_perusahaan,
      data_jamaah,
    };
  }

  async cetak_surat_cuti(jamaah_id) {
    await this.initialize();
    const data_perusahaan = await this.data_perusahaan();
    const data_pimpinan = await this.get_konfigurasi_surat();
    const data_jamaah = await this.data_jamaah(jamaah_id);

    // Ambil semua surat rekom paspor
    const allData = await Riwayat_surat_menyurat.findAll({
      where: {
        company_id: this.company_id,
        tipe_surat: "surat_cuti",
      },
    });

    // Filter manual berdasarkan jamaah_id yang ada di info
    const matching = allData.find((item) => {
      try {
        const info = JSON.parse(item.info);
        return info.jamaah_id?.toString() === jamaah_id?.toString();
      } catch (err) {
        console.error("Gagal parse JSON info:", item.info, err);
        return false;
      }
    });

    if (!matching) {
      console.error(
        "❌ Tidak ditemukan surat cuti untuk jamaah_id:",
        jamaah_id
      );
      return null;
    }
    console.log("=======================================");
    console.log("📥 Input jamaah_id:", jamaah_id);
    console.log("📄 Matching surat cuti:", matching);
    console.log("=======================================");

    const infoFormatted = await this.formatInfoSurat(matching.info);

    const data_surat = {
      nomor_surat: matching.nomor_surat,
      tipe_surat: matching.tipe_surat,
      tanggal_surat: moment(matching.tanggal_surat).format("YYYY-MM-DD"),
      info: infoFormatted,
      tujuan: matching.tujuan,
      nama_petugas: matching.nama_petugas,
    };

    return {
      data_pimpinan,
      data_surat,
      data_perusahaan,
      data_jamaah,
    };
  }

  async cetak_surat() {
    await this.initialize();

    const jenis_surat = this.req.params.jenis_surat;
    const jamaah_id = this.req.body.jamaah_id;

    console.log("=======================================");
    console.log("data", jenis_surat, jamaah_id);
    console.log("=======================================");
    try {
      if (jenis_surat === "surat_cuti") {
        const data = await this.cetak_surat_cuti(jamaah_id);
        return data;
      } else if (jenis_surat === "rekom_paspor") {
        const data = await this.cetak_rekom_paspor(jamaah_id);
        return data;
      } else {
        throw new Error("Jenis surat tidak dikenali");
      }
    } catch (error) {
      console.error("Gagal cetak surat:", error);
      return null; // atau bisa juga throw error lagi kalau mau error handling di atas
    }
  }
}

module.exports = Model_r;
