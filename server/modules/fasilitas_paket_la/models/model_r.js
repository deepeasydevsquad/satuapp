const { Op, Fasilitas_paket_la, Detail_fasilitas_paket_la, Paket_la } = require("../../../models");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
    this.paket_la_id;
  }

  async initialize() {
    console.log("==========================");
    console.log(this.req.body);
    console.log("==========================");
  }

  async fasilitas_paket_la() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "paket_la_id",
      "invoice",
      "total",
      "createdAt",
      "updatedAt",
    ];
    
    sql["include"] = [
      {
        model: Detail_fasilitas_paket_la,
        attributes: [
          "id",
          "fasilitas_paket_la_id",
          "description",
          "check_in",
          "check_out",
          "day",
          "pax",
          "price",
          "createdAt",
          "updatedAt",
        ],
      },
    ];

    try {
      const query = await dbList(sql);
      const q = await Fasilitas_paket_la.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        await Fasilitas_paket_la.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              // Get detail fasilitas
              const details = e.Detail_fasilitas_paket_las ? e.Detail_fasilitas_paket_las.map(detail => ({
                id: detail.id,
                fasilitas_paket_la_id: detail.fasilitas_paket_la_id,
                description: detail.description,
                check_in: moment(detail.check_in).format("YYYY-MM-DD"),
                check_out: moment(detail.check_out).format("YYYY-MM-DD"),
                day: detail.day,
                pax: detail.pax,
                price: detail.price,
                createdAt: detail.createdAt,
                updatedAt: detail.updatedAt
              })) : [];
              
              data.push({ 
                id: e.id,
                paket_la_id: e.paket_la_id,
                invoice: e.invoice,
                total: e.total,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
                detail_fasilitas: details
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

  async infoFasilitasPaketLA(id, paket_la_id) {
    try {
      var data = {};
      await Fasilitas_paket_la.findOne({
          where: { id: id },
          include: [
            {
              model: Detail_fasilitas_paket_la,
              attributes: [
                "id",
                "fasilitas_paket_la_id",
                "description",
                "check_in",
                "check_out",
                "day",
                "pax",
                "price",
                "createdAt",
                "updatedAt",
              ],
            },
          ],
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["paket_la_id"] = e.paket_la_id;
              data["invoice"] = e.invoice;
              data["total"] = e.total;
              
              // Add detail fasilitas
              data["detail_fasilitas"] = e.Detail_fasilitas_paket_las ? e.Detail_fasilitas_paket_las.map(detail => ({
                id: detail.id,
                fasilitas_paket_la_id: detail.fasilitas_paket_la_id,
                description: detail.description,
                check_in: detail.check_in,
                check_out: detail.check_out,
                day: detail.day,
                pax: detail.pax,
                price: detail.price,
                createdAt: detail.createdAt,
                updatedAt: detail.updatedAt
              })) : [];
          }
      });
     
      return data
    } catch (error) {
      return {}      
    }
  } 

  async total_price(paket_la_id) {

    try {
      const body = this.req.body;
      if( paket_la_id !== undefined ) {
        paket_la_id = body.paketlaId;
      }
      var total_price = 0;
      await Paket_la.findOne({ where: { id: paket_la_id } }).then(async (e) => {
        if (e) {
          total_price = e.total_price;
        }
      });
      return total_price;
    } catch (error) {
      return 0;
    }
    
  }
}

module.exports = Model_r;
