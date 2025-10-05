const { Op, Mst_bank, Akun_bank_perusahaan } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async daftar_mst_bank() {
    try {
      await this.initialize();

      const data = await Mst_bank.findAll({
        attributes: ["id", "kode"],
      });

      // Ubah hasilnya: ganti 'kode' jadi 'nama'
      const result = data.map((item) => ({
        id: item.id,
        name: item.kode, // rename 'kode' jadi 'nama'
      }));

      return result;
    } catch (error) {
      console.error("Error daftar_mst_bank:", error);
      return [];
    }
  }

  async daftar_bank() {
    try {
      await this.initialize();
      const body = this.req.body;
      const limit = parseInt(body.perpage) || 10;
      const page =
        body.pageNumber && body.pageNumber !== "0"
          ? parseInt(body.pageNumber)
          : 1;

      const where = {
        company_id: this.company_id,
      };

      if (body.search && body.search !== "") {
        where[Op.or] = [
          { nama_akun: { [Op.like]: `%${body.search}%` } },
          { nomor_akun: { [Op.like]: `%${body.search}%` } },
        ];
      }

      const data = await Akun_bank_perusahaan.findAndCountAll({
        limit,
        offset: (page - 1) * limit,
        order: [["id", "ASC"]],
        attributes: ["id", "nomor_akun", "nama_akun"],
        include: [
          {
            model: Mst_bank,
            attributes: [
              ["name", "nama_bank"],
              ["kode", "kode_bank"],
            ],
          },
        ],
        where,
        raw: true,
        nest: true,
      });

      const cleanData = data.rows.map((item) => ({
        id: item.id,
        nomor_akun: item.nomor_akun,
        nama_akun: item.nama_akun,
        nama_bank: item.Mst_bank?.nama_bank || null,
        kode_bank: item.Mst_bank?.kode_bank || null,
      }));

      return {
        total: data.count,
        data: cleanData,
      };
    } catch (error) {
      console.error("Error daftar_bank:", error);
      return {
        total: 0,
        data: [],
        error: error.message,
      };
    }
  }

  async detail_bank() {
    const body = this.req.body;

    try {
      await this.initialize();

      const data = await Akun_bank_perusahaan.findOne({
        where: {
          id: body.id,
        },
        attributes: ["id", "nomor_akun", "nama_akun"],
        include: [
          {
            model: Mst_bank,
            attributes: ["name", "kode", "id"],
          },
        ],
      });

      if (!data) return null;

      // Extract and flatten the result
      const flatData = {
        id: data.id,
        mst_bank_id: data.Mst_bank?.id || null,
        nomor_akun: data.nomor_akun,
        nama_akun: data.nama_akun,
        nama_bank: data.Mst_bank?.name || null,
        kode_bank: data.Mst_bank?.kode || null,
      };

      return flatData;
    } catch (error) {
      console.error("Error detail_bank:", error);
      return null;
    }
  }
}

module.exports = Model_r;
