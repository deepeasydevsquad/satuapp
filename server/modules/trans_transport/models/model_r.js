const {
  Transport_transaction,
  Transport_transaction_detail,
  Mst_mobil,
  sequelize,
  Paket,
  Kostumer,
} = require("../../../models");
const moment = require("moment");
const { Op, where } = require("sequelize");
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

  async daftar_transaksi_transport() {
    await this.initialize(); // set this.company_id

    try {
      const body = this.req.body;
      const limit = parseInt(body.perpage) || 10;
      const page =
        body.pageNumber && body.pageNumber !== "0"
          ? parseInt(body.pageNumber)
          : 1;

      let where = { division_id: this.req.body.cabang };

      if (body.search) {
        where = {
          ...where,
          invoice: { [Op.like]: `%${body.search}%` },
        };
      }

      const sql = {
        limit,
        offset: (page - 1) * limit,
        order: [["createdAt", "DESC"]],
        where,
        include: [
          {
            model: Kostumer,
            attributes: ["name"],
          },
          {
            model: Paket,
            attributes: ["name"],
          },
        ],
      };

      const q = await Transport_transaction.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        const listId = [];
        const paketIds = new Set();

        q.rows.forEach((trx) => {
          listId.push(trx.id);
          if (trx.paket_id) paketIds.add(trx.paket_id);

          data.push({
            id: trx.id,
            invoice: trx.invoice,
            petugas: trx.petugas,
            paket_id: trx.paket_id || null,
            kostumer: trx.Kostumer?.name || "-",
            paket: trx.Paket?.name || "-",
            tanggal_transaksi: moment(trx.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            total_travel_price: 0,
            total_costumer_price: 0,
            detail_mobil: [],
          });
        });

        // ambil nama paket
        const paketMap = await this.ambil_nama_paket_bulk([...paketIds]);

        // gabungin nama paket
        data = data.map((trx) => ({
          ...trx,
          paket_name: trx.paket_id ? paketMap[trx.paket_id] || "-" : "-",
        }));

        // ambil detail mobil
        const mobilDetails = await Transport_transaction_detail.findAll({
          where: {
            transport_transaction_id: { [Op.in]: listId },
          },
          include: [
            {
              model: Mst_mobil,
              required: true,
              attributes: ["name"],
            },
          ],
        });

        const dataMobil = {};
        const totalTravelMobil = {};
        const totalCostumerMobil = {};

        mobilDetails.forEach((d) => {
          const trxId = d.transport_transaction_id;
          if (!dataMobil[trxId]) dataMobil[trxId] = [];
          if (!totalTravelMobil[trxId]) totalTravelMobil[trxId] = 0;
          if (!totalCostumerMobil[trxId]) totalCostumerMobil[trxId] = 0;

          dataMobil[trxId].push({
            car_number: d.car_number || "-",
            travel_price: d.travel_price || 0,
            costumer_price: d.costumer_price || 0,
            nama_mobil: d.Mst_mobil?.name || "-",
          });

          totalTravelMobil[trxId] += d.travel_price || 0;
          totalCostumerMobil[trxId] += d.costumer_price || 0;
        });

        data = data.map((trx) => ({
          ...trx,
          detail_mobil: dataMobil[trx.id] || [],
          total_travel_price: totalTravelMobil[trx.id] || 0,
          total_costumer_price: totalCostumerMobil[trx.id] || 0,
        }));
      }

      return { data, total };
    } catch (err) {
      console.error("❌ Gagal ambil data transaksi transport:", err);
      return { data: [], total: 0 };
    }
  }

  async daftar_mobil() {
    await this.initialize();
    try {
      const sql = await Mst_mobil.findAll({
        where: {
          company_id: this.company_id,
        },
      });
      return sql.map((e) => {
        return {
          id: e.id,
          name: e.name,
        };
      });
    } catch (error) {
      return [];
      console.log(error);
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
