const {
  Peminjaman,
  Skema_peminjaman,
  Riwayat_pembayaran_peminjaman,
  Jamaah,
  Member,
  sequelize,
} = require("../../../models");
const {
  getCompanyIdByCode,
  getCabang,
} = require("../../../helper/companyHelper");
const { Op } = require("sequelize");
const moment = require("moment");
class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
  }

  async daftar_riwayat_peminjaman() {
    await this.initialize();
    const { body } = this.req;
    const limit = parseInt(body.perpage, 10) || 10;
    const page =
      parseInt(body.pageNumber, 10) > 0 ? parseInt(body.pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    const search = body.search;
    let where = {};

    // ✅ Filter cabang
    if (body.cabang) {
      where.division_id = body.cabang;
    }

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
      const result = await Peminjaman.findAndCountAll({
        limit,
        offset,
        where,
        include: [
          {
            model: Riwayat_pembayaran_peminjaman,
            attributes: [
              "invoice",
              "nominal",
              "status",
              "petugas",
              "createdAt",
            ],
            required: false,
          },
          {
            model: Jamaah,
            required: true,
            attributes: ["member_id"],
            include: {
              model: Member,
              required: true,
              attributes: ["fullname", "identity_number"],
            },
          },
        ],
      });

      const data = result.rows.flatMap((peminjaman) => {
        const jamaah = peminjaman.Jamaah;
        const member = jamaah?.Member;
        const date = moment(peminjaman.createdAt).format("YYYY-MM-DD");

        return (peminjaman.Riwayat_pembayaran_peminjamans || []).map(
          (riwayat) => ({
            nama_jamaah: member?.fullname,
            nomor_identitas: member?.identity_number,
            register_number: peminjaman.register_number,
            invoice: riwayat.invoice,
            nominal: riwayat.nominal,
            petugas: riwayat.petugas,
            status: riwayat.status,
            tanggal_transaksi: date,
          })
        );
      });

      return {
        data,
        total: result.count,
      };
    } catch (error) {
      console.error("Error daftar_riwayat_peminjaman:", error);
      return { data: [], total: 0 };
    }
  }
}

module.exports = Model_r;
