const { sequelize, Level_keagenan } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
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
    try {
      this.company_id = await getCompanyIdByCode(this.req);
      this.t = await sequelize.transaction();
    } catch (error) {
      throw new Error("Gagal menginisialisasi controller");
    }
  }

  async add() {
    await this.initialize(); // Inisialisasi company_id
    const body = this.req.body;
    const tanggalSekarang = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    console.log("data dari front end", body);
    try {
      // 1. Ambil semua level yang sudah ada
      const levelYangAda = await Level_keagenan.findAll({
        where: { company_id: this.company_id },
        attributes: ["level"],
        order: [["level", "ASC"]], // Urutkan dari terkecil
      });

      // 2. Cari level yang kosong atau tentukan level berikutnya
      let levelBerikutnya = 1;
      const levelTerpakai = levelYangAda.map((item) => item.level);

      // Cari celah di urutan level
      if (levelTerpakai.length > 0) {
        for (let i = 1; i <= levelTerpakai[levelTerpakai.length - 1]; i++) {
          if (!levelTerpakai.includes(i)) {
            levelBerikutnya = i;
            break;
          }
        }
        // Jika tidak ada celah, gunakan nomor setelah yang terakhir
        if (levelBerikutnya === 1 && levelTerpakai.length > 0) {
          levelBerikutnya = levelTerpakai[levelTerpakai.length - 1] + 1;
        }
      }

      // Konversi default_fee dari format Rupiah ke numerik
      let defaultFee = 0;
      if (body.default_fee) {
        // Hapus semua karakter non-digit dan konversi ke number
        defaultFee = Number(body.default_fee.toString().replace(/\D/g, ""));
      }

      // 3. Buat level baru
      const dataBaru = await Level_keagenan.create(
        {
          company_id: this.company_id,
          name: body.nama, // Menggunakan 'nama' dari body request
          level: body.level, // Gunakan level yang sudah dihitung
          default_fee: defaultFee, // Gunakan nilai yang sudah dikonversi
          createdAt: tanggalSekarang,
          updatedAt: tanggalSekarang,
        },
        {
          transaction: this.t,
        }
      );
      this.message = `Menambahkan level agen baru dengan nama: ${body.nama}`;
      return await this.response(); // Pastikan ada return
    } catch (error) {
      this.state = false;

      // Handle error spesifik
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Nama level sudah digunakan");
      } else if (error.name === "SequelizeValidationError") {
        throw new Error("Data yang dimasukkan tidak valid");
      } else {
        throw new Error("Terjadi kesalahan saat menambahkan level agen");
      }
    }
  }

  async update() {
    await this.initialize();
    const body = this.req.body; // Ambil semua data dari body
    console.log("Data dari front end:", body);

    try {
      // Validasi ID dari body
      if (!body.id || isNaN(parseInt(body.id))) {
        throw new Error("ID level agen tidak valid");
      }

      // Validasi input lainnya
      if (!body.nama || !body.default_fee) {
        throw new Error("Nama dan default fee harus diisi");
      }

      const defaultFee = Number(body.default_fee.toString().replace(/\D/g, ""));

      const [updated] = await Level_keagenan.update(
        {
          name: body.nama,
          default_fee: defaultFee,
          updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          where: {
            id: parseInt(body.id), // Ambil ID dari body
            company_id: this.company_id,
          },
          transaction: this.t,
        }
      );

      if (updated === 0) {
        throw new Error("Level agen tidak ditemukan");
      }

      this.message = `Berhasil update level agen ${body.nama}`;
      return await this.response();
    } catch (error) {
      await this.t.rollback();
      this.state = false;

      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Nama level sudah digunakan");
      }
      throw new Error(error.message || "Gagal mengupdate level agen");
    }
  }

  async delete() {
    await this.initialize();
    const { id } = this.req.body;
    console.log("Received ID:", id); // Debug

    try {
      const model_r = new Model_r(this.req);
      const infoAgen = await model_r.infoAgen(id);
      console.log("infoAgen:", infoAgen); // Debug

      if (!infoAgen) throw new Error("Level Agen tidak ditemukan");

      const deleted = await Level_keagenan.destroy({
        where: { id },
        transaction: this.t,
      });
      console.log("Deleted rows:", deleted); // Debug

      if (deleted === 0)
        throw new Error("Gagal menghapus data, ID mungkin tidak ditemukan.");

      this.message = `Menghapus Level Agen dengan Nama: ${infoAgen.name} dan ID: ${id}`;
      return await this.response();
    } catch (error) {
      console.error("Delete error:", error); // Debug
      this.state = false;
      this.message = error.message;
      return await this.response();
    }
  }

  formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  }

  async response() {
    try {
      if (this.state) {
        await writeLog(this.req, this.t, { msg: this.message });
        await this.t.commit();
        return {
          success: true,
          message: this.message,
        };
      } else {
        await this.t.rollback();
        return {
          success: false,
          message: this.message,
        };
      }
    } catch (error) {
      await this.t.rollback();
      throw error;
    }
  }
}

module.exports = Model_cud;
