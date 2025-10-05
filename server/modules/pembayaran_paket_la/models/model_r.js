const { Op, Paket_la_transaction, Paket_la } = require("../../../models");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

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

  async totalPaid(paketlaId) {
    const payment = await Paket_la_transaction.sum("paid", {
      where: {
        paket_la_id: paketlaId,
        status: "payment",
      },
    });

    const refund = await Paket_la_transaction.sum("paid", {
      where: {
        paket_la_id: paketlaId,
        status: "refund",
      },
    });

    const data = payment - refund;
    return data;
  }

  async pembayaran_paket_la() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;

    var where = { id: body.paketlaId, division_id: this.division_id };

    var sql = {};
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "total_price"
    ];
    sql["include"] = [
      {
        model: Paket_la_transaction,
        where: { company_id: this.company_id},
        attributes: [
          "id",
          "invoice",
          "paid",
          "status",
          "receiver",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        required: false
      },
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql); // ini query masih dari struktur awal
      const q = await Paket_la.findAndCountAll(query.total);
      const total = await q.count;
      const totalPaid = await this.totalPaid(body.paketlaId);
    
      var data = [];
      if (total > 0) {
        await Paket_la.findAll(query.sql).then(async (value) => {
          await Promise.all(
            value.map(async (e) => {
              data  = ({
                id: e.id,
                total_price: e.total_price,
                total_paid: totalPaid ? totalPaid : 0,
                item_transaksi: e.Paket_la_transactions.map((trx) => ({
                  id: trx.id,
                  invoice: trx.invoice,
                  paid: trx.paid,
                  status: trx.status,
                  receiver: trx.receiver,
                  date: moment(trx.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                  updatedAt: trx.updatedAt,
                })),
              });
            })
          );
        });
      }

      return {
        data: data,
        total: total,
      };

    } catch (error) {
      return {};
    }
  }

  async infoPembayaranPaketLA(id, company_id) {
    try {
      var data = {};
      const transaction = await Paket_la.findOne({
        where: { id: id },
        attributes: ["id", "total_price"],
        include: [
              {
                model: Paket_la_transaction,
                attributes: [
                  "id",
                  "invoice",
                  "paid",
                  "status",
                  "receiver",
                  "deposit_name",
                  "deposit_hp_number",
                  "deposit_address",
                ],
                required: false,
              },
            ],
      });

      if (transaction) {
        data["id"] = transaction.id;
        data["total_price"] = transaction.total_price;
        data["item_transaksi"] = transaction.Paket_la_transactions.map((trx) => ({
          id: trx.id,
          invoice: trx.invoice,
          paid: trx.paid,
          status: trx.status,
          receiver: trx.receiver,
          deposit_name: trx.deposit_name,
          deposit_hp_number: trx.deposit_hp_number,
          deposit_address: trx.deposit_address,
        }));
      }
     
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;
