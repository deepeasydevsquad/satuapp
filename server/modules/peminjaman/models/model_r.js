const { Peminjaman, Skema_peminjaman, Riwayat_pembayaran_peminjaman, Jamaah, Member, Mst_bank } = require("../../../models");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const Akuntansi = require("../../../library/akuntansi");
const{ convertToRP } = require("../../../helper/currencyHelper");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
  }

  // Inisialisasi company_id berdasarkan kode perusahaan
  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async get_sumber_dana() {
    await this.initialize();
    const akuntansi = new Akuntansi(); 
    try {
      var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun('11010', this.company_id, this.req.body.cabang, '0') );
      var sumber_dana = [{ id: 0, name: 'Kas (Saldo : ' + saldo + ')'}];
      await Mst_bank.findAll({ where: { company_id: this.company_id }, }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun(e.nomor_akun, this.company_id, this.req.body.cabang, '0') );
            sumber_dana.push({ 
              id : e.id, 
              name : e.kode + ' (Saldo : ' + saldo + ')', 
            });
          })
        );
      });
      return { data: sumber_dana };
    } catch (error) {
      console.error("Gagal ambil daftar jenis visa :", error);
      return {};
    }
  }

  // Method untuk mendapatkan daftar peminjaman
  async daftarPeminjaman() {
    await this.initialize();
    const { body } = this.req;

    const limit = parseInt(body.perpage, 10) || 10;
    const page =
      parseInt(body.pageNumber, 10) > 0 ? parseInt(body.pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    let where = {};

    // ✅ Filter cabang
    if (body.cabang) {
      where.division_id = body.cabang;
    }

    // ✅ Filter search
    if (body.search) {
      where = {
        ...where,
        [Op.or]: [
          { register_number: { [Op.like]: `%${body.search}%` } },
          { "$Jamaah.Member.fullname$": { [Op.like]: `%${body.search}%` } },
          {
            "$Jamaah.Member.identity_number$": {
              [Op.like]: `%${body.search}%`,
            },
          },
        ],
      };
    }

    try {
      const result = await Peminjaman.findAndCountAll({
        distinct: true,
        attributes: { exclude: ["company_id"] },
        limit,
        offset,
        order: [["id", "ASC"]],
        where,
        include: [
          {
            model: Skema_peminjaman,
            attributes: ["term", "nominal"],
            required: false,
          },
          {
            model: Riwayat_pembayaran_peminjaman,
            attributes: ["invoice", "nominal", "status", "createdAt"],
            required: false,
          },
          {
            model: Jamaah,
            attributes: ["id", "member_id"],
            include: [
              {
                model: Member,
                attributes: ["fullname", "identity_number"],
              },
            ],
          },
        ],
      });

      const data = result.rows.map((peminjaman) => {
        const jamaah = peminjaman.Jamaah;
        const member = jamaah?.Member;

        const nominalSkema = peminjaman.Skema_peminjamans?.[0]?.nominal || 0;

        const totalBayar = Array.isArray(
          peminjaman.Riwayat_pembayaran_peminjamans
        )
          ? peminjaman.Riwayat_pembayaran_peminjamans.reduce(
              (sum, riwayat) => sum + (riwayat.nominal || 0),
              0
            )
          : 0;

        return {
          id: peminjaman.id,
          nama_jamaah: member?.fullname || null,
          identity_number: member?.identity_number || null,
          register_number: peminjaman.register_number,
          status_peminjaman: peminjaman.status_peminjaman,
          nominal: peminjaman.nominal,
          tenor: peminjaman.tenor,
          dp: peminjaman.dp,
          nominal_skema: nominalSkema,
          total_bayar: totalBayar,
          riwayat_pembayaran: (
            peminjaman.Riwayat_pembayaran_peminjamans || []
          ).map((riwayat) => ({
            invoice: riwayat.invoice,
            nominal: riwayat.nominal,
            status: riwayat.status,
            create: riwayat.createdAt,
          })),
        };
      });

      return { data, total: result.count };
    } catch (error) {
      console.error("Error daftarPeminjaman:", error);
      return { data: [], total: 0 };
    }
  }

  async getSkemaPeminjmanByID() {
    await this.initialize(); // Pastikan inisialisasi selesai

    const { peminjaman_id } = this.req.body;

    try {
      // Cari data Skema_peminjaman berdasarkan peminjaman_id
      const result = await Skema_peminjaman.findAndCountAll({
        where: {
          peminjaman_id: peminjaman_id, // Gunakan peminjaman_id yang diterima
        },
      });

      // Mapping data sesuai format yang diinginkan
      const data = result.rows.map((skema) => ({
        id: skema.id,
        term: skema.term,
        nominal: skema.nominal,
        duedate: skema.duedate,
      }));

      return { data, total: result.count };
    } catch (error) {
      console.error("Error getSkemaByPeminjamanID:", error);
      return { data: [], total: 0 };
    }
  }

  async downloadDataPeminjaman(req, res) {
    await this.initialize();
    const { body } = this.req;

    const limit = parseInt(body.perpage, 10) || 10;
    const page =
      parseInt(body.pageNumber, 10) > 0 ? parseInt(body.pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    const search = body.search || "";

    let where = {
      division_id: this.division_id,
    };

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { register_number: { [Op.like]: `%${search}%` } },
          { "$Jamaah.Member.fullname$": { [Op.like]: `%${search}%` } },
          { "$Jamaah.Member.identity_number$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    try {
      const peminjamans = await Peminjaman.findAll({
        where,
        limit,
        offset,
        include: [
          {
            model: Jamaah,
            required: true,
            attributes: ["member_id"],
            include: [
              {
                model: Member,
                required: true,
                attributes: ["fullname", "identity_number"],
              },
            ],
          },
        ],
        attributes: ["id", "nominal", "tenor"],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Peminjaman");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama", key: "nama", width: 30 },
        { header: "Nomor KTP", key: "ktp", width: 25 },
        { header: "Jumlah Peminjaman", key: "jumlah", width: 20 },
        { header: "Sudah Dibayar", key: "sudah_dibayar", width: 20 },
        { header: "Sisa Hutang", key: "sisa_hutang", width: 20 },
        { header: "Tenor", key: "tenor", width: 10 },
      ];

      let no = 1;

      for (const pinjaman of peminjamans) {
        const member = pinjaman?.Jamaah?.Member;

        const totalDibayar = await Riwayat_pembayaran_peminjaman.sum(
          "nominal",
          {
            where: { peminjaman_id: pinjaman.id },
          }
        );

        const sudahDibayar = totalDibayar || 0;
        const sisaHutang = pinjaman.nominal - sudahDibayar;

        worksheet.addRow({
          no: no++,
          nama: member?.fullname || "-",
          ktp: member?.identity_number || "-",
          jumlah: pinjaman.nominal,
          sudah_dibayar: sudahDibayar,
          sisa_hutang: sisaHutang,
          tenor: pinjaman.tenor,
        });
      }

      let buffer;
      try {
        buffer = await workbook.xlsx.writeBuffer();
      } catch (err) {
        console.error("Gagal generate file Excel:", err);
        return res.status(500).json({ message: "Gagal generate file Excel." });
      }
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Data_Peminjaman.xlsx"
      );
      res.send(buffer);
    } catch (err) {
      console.error("Gagal download data peminjaman:", err);
      this.res.status(500).json({ message: "Gagal download data peminjaman." });
    }
  }

  async daftar_jamaah() {
    await this.initialize();
    const body = this.req.body;
    console.log(body);
    try {
      const jamaah = await Jamaah.findAll({
        where: {
          division_id: body.id_cabang,
        },
        include: [
          {
            model: Member,
            required: true,
            attributes: ["fullname"],
          },
        ],
      });
      return jamaah.map((j) => ({
        id: j.id,
        nama_jamaah: j.Member?.fullname || "-", // atau bisa ganti ke j.nama_jamaah kalau mau
      }));
    } catch (error) {
      console.error("Gagal ambil data jamaah:", error);
      return [];
    }
  }
}
module.exports = Model_r;
