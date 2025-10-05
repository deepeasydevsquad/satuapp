const {
  Ppob_transaction_prabayar,
  Ppob_transaction_pascabayar,
  Ppob_pascabayar_produk,
  Ppob_prabayar_produk,
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
  }

  async riwayat_transaksi() {
    await this.initialize();
    const { body } = this.req;
    const limit = parseInt(body.perpage, 10) || 10;
    const page =
      parseInt(body.pageNumber, 10) > 0 ? parseInt(body.pageNumber, 10) : 1;
    const offset = (page - 1) * limit;

    try {
      const [prabayar, pascabayar] = await Promise.all([
        Ppob_transaction_prabayar.findAll({
          where: { company_id: this.company_id },
          include: [
            {
              model: Ppob_prabayar_produk,
              attributes: ["name", "kode"],
            },
          ],
          attributes: [
            "id",
            "company_id",
            "ppob_prabayar_produk_id",
            "transaction_code",
            "nomor_tujuan",
            "price",
            "application_price",
            "company_price",
            "status",
            "createdAt",
            "updatedAt",
          ],
          limit,
          offset,
          order: [["createdAt", "DESC"]],
        }),

        Ppob_transaction_pascabayar.findAll({
          where: { company_id: this.company_id },
          include: [
            {
              model: Ppob_pascabayar_produk,
              attributes: ["name", "kode"],
            },
          ],
          attributes: [
            "id",
            "company_id",
            "ppob_pascabayar_produk_id",
            "transaction_code",
            "nomor_tujuan",
            "price",
            "application_price",
            "company_price",
            "status",
            "createdAt",
            "updatedAt",
          ],
          limit,
          offset,
          order: [["createdAt", "DESC"]],
        }),
      ]);

      // format data jadi satu array, disamain field-nya
      const dataGabung = [
        ...prabayar.map((item) => ({
          id: item.id,
          nama_produk: item.Ppob_prabayar_produk?.name || "-",
          kode_produk: item.Ppob_prabayar_produk?.kode || "-",

          transaction_code: item.transaction_code,
          nomor_tujuan: item.nomor_tujuan,
          company_price: item.company_price,
          status: item.status,
          createdAt: item.createdAt,
        })),
        ...pascabayar.map((item) => ({
          id: item.id,
          nama_produk: item.Ppob_pascabayar_produk?.name || "-",
          kode_produk: item.Ppob_pascabayar_produk?.kode || "-",

          transaction_code: item.transaction_code,
          nomor_tujuan: item.nomor_tujuan,
          company_price: item.company_price,
          status: item.status,
          createdAt: item.createdAt,
        })),
      ];

      // urutkan lagi berdasarkan createdAt
      dataGabung.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        error: false,
        data: dataGabung.slice(0, limit),
        total: dataGabung.length,
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        message: "Gagal ambil data transaksi",
      };
    }
  }
}
module.exports = Model_r;
