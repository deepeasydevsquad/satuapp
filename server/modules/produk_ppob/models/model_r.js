const {
  Ppob_prabayar_produk,
  Ppob_prabayar_markup_company,
  Ppob_pascabayar_produk,
  Ppob_pascabayar_markup_company,
} = require("../../../models");
const {
  tipe,
  getCompanyIdByCode,
  getCabang,
} = require("../../../helper/companyHelper");
const { Op } = require("sequelize");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.type;
    this.division;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.type = await tipe(this.req);
    this.division = await getCabang(this.req);
  }

  async daftar_produk() {
    await this.initialize();
    const body = this.req.body;
    const limit = parseInt(body.perpage) || 10;
    const page = parseInt(body.pageNumber) || 1;
    const tipeProduk = body.tipe; // 'prabayar' atau 'pascabayar'

    let where = {};
    if (body.search) {
      const keyword = `%${body.search}%`;
      where = {
        [Op.or]: [
          { id: { [Op.like]: keyword } },
          { kode: { [Op.like]: keyword } },
          { name: { [Op.like]: keyword } },
          // { kategori: { [Op.like]: keyword } },
        ],
      };
    }

    let ModelProduk, ModelMarkup, priceField, markupField;
    if (tipeProduk === "prabayar") {
      ModelProduk = Ppob_prabayar_produk;
      ModelMarkup = Ppob_prabayar_markup_company;
      priceField = "price";
      markupField = "Ppob_prabayar_markup_companies";
    } else if (tipeProduk === "pascabayar") {
      ModelProduk = Ppob_pascabayar_produk;
      ModelMarkup = Ppob_pascabayar_markup_company;
      priceField = "fee"; // tetap ditampilkan sebagai `price` di output
      markupField = "Ppob_pascabayar_markup_companies";
    } else {
      return this.fail("Tipe produk tidak valid (prabayar/pascabayar)");
    }

    try {
      const { rows, count } = await ModelProduk.findAndCountAll({
        attributes: ["id", "kode", "name", priceField],
        include: [
          {
            model: ModelMarkup,
            attributes: ["markup"],
            where: { company_id: this.company_id },
            required: false,
          },
        ],
        where,
        order: [["id", "ASC"]],
        limit,
        offset: (page - 1) * limit,
      });

      const data = rows.map((item) => {
        const produk = item.toJSON();

        return {
          id: produk.id,
          kode: produk.kode,
          name: produk.name,
          price: produk[priceField],
          markup:
            Array.isArray(produk[markupField]) && produk[markupField].length > 0
              ? produk[markupField][0].markup
              : 0,
          tipe: tipeProduk,
        };
      });

      return {
        total: count,
        page,
        perpage: limit,
        data,
      };
    } catch (err) {
      console.error("Error daftar_produk:", err);
      return this.fail("Gagal mengambil data produk");
    }
  }

  fail(message) {
    return {
      error: true,
      message,
    };
  }
}

module.exports = Model_r;
