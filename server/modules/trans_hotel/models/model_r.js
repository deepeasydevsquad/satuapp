const {
  Hotel_transaction,
  Hotel_transaction_detail,
  Mst_hotel,
  Mst_kota,
  Kostumer,
  Paket,
  sequelize,
  Company,
  Users,
  Member,
} = require("../../../models");
const moment = require("moment");
const { Op } = require("sequelize");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async ambil_nama_paket_bulk(ids) {
    const paketList = await Paket.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ["id", "name"],
    });

    const paketMap = {};
    paketList.forEach((paket) => {
      paketMap[paket.id] = paket.name;
    });

    return paketMap;
  }

  async daftar_transaksi_hotel() {
    try {
      await this.initialize();

      const body = this.req.body;
      const limit = body.perpage || 10;
      const page =
        body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;

      let where = { division_id: this.req.body.cabang };

      if (body.search) {
        where = {
          ...where,
          invoice: { [Op.like]: `%${body.search}%` },
        };
      }

      const sql = {
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["updatedAt", "DESC"]],
        where: where,
        include: [
          {
            model: Kostumer,
            required: false,
            attributes: ["name"],
          },
          {
            model: Paket,
            required: false,
            attributes: ["name"],
          },
          {
            model: Mst_hotel,
            required: false,
            attributes: ["name"],
          },
        ],
      };

      const q = await Hotel_transaction.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        q.rows.forEach((e) => {
          data.push({
            id: e.id,
            invoice: e.invoice, 
            petugas: e.petugas,
            kostumer: e.Kostumer?.name || "-", 
            paket: e.Paket?.name || "-", 
            hotel: e.Mst_hotel.name,
            jumlah_hari: e.jumlah_hari,
            jumlah_kamar: e.jumlah_kamar,
            harga_travel_kamar_per_hari: e.harga_travel_kamar_per_hari,
            harga_kostumer_kamar_per_hari: e.harga_kostumer_kamar_per_hari,
            tipe_kamar: e.tipe_kamar,
            tanggal_transaksi: moment(e.createdAt).format("D MMMM YYYY")
          });
        });
      }

      return { data, total };
    } catch (error) {
      console.log("xxxxx");
      console.log(error);
      console.log("xxxxx");
      return {};
    }
  }

  async daftar_kota() {
    try {
      await this.initialize(); // inisialisasi company_id
      const sql = await Mst_kota.findAll({
        where: { company_id: this.company_id },
      });

      const data = sql.map((d) => ({
        id: d.id,
        name: d.name,
        kode: d.kode,
      }));
      return data;
    } catch (error) {
      console.error("Gagal ambil daftar kota:", error);
      return [];
    }
  }

  async daftar_hotel() {
    try {
      await this.initialize(); // inisialisasi company_id
      const sql = await Mst_hotel.findAll({
        where: { company_id: this.company_id },
        include: [
          {
            model: Mst_kota,
            required: true,
            attributes: ["name"],
          },
        ],
      });

      const data = sql.map((d) => ({
        id: d.id,
        name: d.name,
        kota: d.Mst_kotum.name,
      }));
      return data;
    } catch (error) {
      console.error("Gagal ambil daftar hotel:", error);
      return [];
    }
  }

  async daftar_kostumer() {
    try {
      await this.initialize(); // inisialisasi company_id
      const sql = await Kostumer.findAll({
        where: { company_id: this.company_id },
      });

      const data = sql.map((d) => ({
        id: d.id,
        name: d.name,
      }));
      return data;
    } catch (error) {
      console.error("Gagal ambil daftar kostumer:", error);
      return [];
    }
  }

  async daftar_paket() {
    const body = this.req.body;
    try {
      const sql = await Paket.findAll({
        where: { division_id: body.division_id },
      });

      const data = sql.map((d) => ({
        id: d.id,
        name: d.name,
      }));

      return data;
    } catch (error) {
      console.error("Gagal ambil daftar kostumer:", error);
      return [];
    }
  }
}

module.exports = Model_r;
