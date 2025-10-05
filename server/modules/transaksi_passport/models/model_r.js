"use strict";

const {
  Op,
  Passport_transaction,
  Passport_transaction_detail,
  Mst_kota,
  Mst_visa_request_type,
  Kostumer,
  Paket,
} = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

class model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    if (!this.company_id) {
      this.company_id = await getCompanyIdByCode(this.req);
    }
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

  async daftar_transaksi_passport() {
    try {
      await this.initialize(); // init company_id

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
        where,
        include: [
          {
            model: Kostumer,
            attributes: ["name"],
          },
        ],
      };

      const q = await Passport_transaction.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        const rows = q.rows;

        const listId = rows.map((trx) => trx.id);
        const paketIds = rows.map((trx) => trx.paket_id).filter(Boolean);

        // ambil nama-nama paket secara bulk
        const paketMap = await this.ambil_nama_paket_bulk(paketIds);

        // isi data dasar transaksi
        data = rows.map((trx) => ({
          id: trx.id,
          invoice: trx.invoice,
          petugas: trx.petugas,
          kostumer_name: trx.kostumer_id ? trx.Kostumer.name : "-",
          tanggal_transaksi: moment(trx.createdAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          total_harga: 0,
          paket_name: trx.paket_id ? paketMap[trx.paket_id] || "-" : "-",
          details: [],
          createdAt: trx.createdAt,
        }));

        // ambil semua detail transaksi (pelanggan)
        const detailPassport = await Passport_transaction_detail.findAll({
          where: {
            passport_transaction_id: { [Op.in]: listId },
          },
        });

        const dataDetail = {};
        const totalDetail = {};
        const totalHargaCostumer = {}

        detailPassport.forEach((e) => {
          const trxId = e.passport_transaction_id;
          if (!dataDetail[trxId]) dataDetail[trxId] = [];
          if (!totalDetail[trxId]) totalDetail[trxId] = 0;
          if (!totalHargaCostumer[trxId]) totalHargaCostumer[trxId] = 0;

          

          dataDetail[trxId].push({
            name: e.name,
            identity_number: e.identity_number,
            kk_number: e.kk_number,
            birth_place: e.birth_place,
            birth_date: e.birth_date,
            price: e.price,
            priceCostumer: e.priceCostumer,
          });

          totalDetail[trxId] += e.price;
          totalHargaCostumer[trxId] += e.priceCostumer;
        });

        // masukin detail & total harga ke masing-masing transaksi
        data = data.map((trx) => ({
          ...trx,
          details: dataDetail[trx.id] || [],
          total_harga: totalDetail[trx.id] || 0,
          total_harga_kostumer : totalHargaCostumer[trx.id] || 0,
        }));
      }

      return { data, total };
    } catch (error) {
      console.error("Error in daftar_transaksi_passport:", error);
      return {};
    }
  }

  async getAllCities() {
    await this.initialize();

    try {
      const cities = await Mst_kota.findAll({
        attributes: ["id", "name", "kode"],
        where: {
          company_id: this.company_id,
        },
        order: [["name", "ASC"]],

        raw: true,
      });

      return cities;
    } catch (error) {
      console.error("Error di Model_r saat mengambil getAllCities:", error);
      throw error;
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

module.exports = model_r;
