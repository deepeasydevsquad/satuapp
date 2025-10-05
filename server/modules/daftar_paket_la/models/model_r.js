const { Op, Paket_la, Paket_la_transaction, Kostumer } = require("../../../models");
const { getCabang, getCompanyIdByCode } = require("../../../helper/companyHelper");
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

  async daftar_paket_la() {
    await this.initialize();

    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    var where = { division_id : this.division_id };
        
    if (body.search != undefined && body.search != "") {
      where = {...where,...{ 
        [Op.or]: [{ register_number : { [Op.like]: "%" + body.search + "%" } }, 
                  { client_name : { [Op.like]: "%" + body.search + "%" }}, 
                  { client_hp_number : { [Op.like]: "%" + body.search + "%" }}, 
                  { client_address : { [Op.like]: "%" + body.search + "%" }},
                  { status : { [Op.like]: "%" + body.search + "%" }}
        ]
      }};
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "ASC"]];
    sql["attributes"] = [
      "id",
      "division_id",
      "register_number",
      "kostumer_id",
      "client_name",
      "client_hp_number",
      "client_address",
      "status",
      "discount",
      "total_price",
      "total_jamaah",
      "departure_date",
      "arrival_date",
      "createdAt",
      "updatedAt"
    ];
    sql["include"] = [
      {
        model: Paket_la_transaction,
        attributes: ['paid', 'status']
      },
    ];
    sql["where"] = where;
    
    try {

      const query = await dbList(sql);
      const q = await Paket_la.findAndCountAll(query.total);
      const total = await q.count;
      var data = [];
      if (total > 0) {
        const paketList = await Paket_la.findAll(query.sql);

        await Promise.all(
          paketList.map(async (e) => {
            const payments = e.Paket_la_transactions.filter(trx => trx.status === "payment");
            const refunds = e.Paket_la_transactions.filter(trx => trx.status === "refund");

            const totalTerbayar = payments.reduce((sum, trx) => sum + Number(trx.paid), 0);
            const totalRefund = refunds.reduce((sum, trx) => sum + Number(trx.paid), 0);

            data.push({
              id: e.id,
              register_number: e.register_number,
              kostumer_id: e.kostumer_id,
              client_name: e.client_name,
              client_hp_number: e.client_hp_number,
              client_address: e.client_address,
              status: e.status,
              discount: e.discount,
              total_price: e.total_price,
              total_jamaah: e.total_jamaah,
              departure_date: moment(e.departure_date).format("YYYY-MM-DD"),
              arrival_date: moment(e.arrival_date).format("YYYY-MM-DD"),
              terbayar: totalTerbayar - totalRefund,
              sisa: e.total_price - (totalTerbayar - totalRefund),
              createdAt: e.createdAt,
              updatedAt: e.updatedAt
            });
          })
        );
      }

      return {
        data: data,
        total: total,
      };

    } catch (error) {
      return {};
    }
  }

  async daftar_kostumer() {
    await this.initialize();
    
    try {
      const dataKostumer = await Kostumer.findAndCountAll({
        where: {
          company_id: this.company_id
        }
      })
      let data = []
      await Promise.all(
        dataKostumer.rows.map(async (e) => {
          data.push({
            id: e.id,
            name: e.name,
            mobile_number: e.mobile_number,
            address: e.address
          })
        })
      )
      return { 
        data: data, 
        total: dataKostumer.count
      }
    } catch (error) {
      console.log("Error in daftar_kostumer: ", error)
      return {}
    }
  }

  async infoPaketLA(id, division_id) {
    try {
      var data = {};
      await Paket_la.findOne({
          where: { id: id },
      }).then(async (e) => {
          if (e) {
              data["id"] = e.id;
              data["division_id"] = e.division_id;
              data["register_number"] = e.register_number;
              data["kostumer_id"] = e.kostumer_id;
              data["client_name"] = e.client_name;
              data["client_hp_number"] = e.client_hp_number;
              data["client_address"] = e.client_address;
              data["status"] = e.status;
              data["discount"] = e.discount;
              data["total_price"] = e.total_price;
              data["total_jamaah"] = e.total_jamaah;
              data["departure_date"] = e.departure_date;
              data["arrival_date"] = e.arrival_date;
          }
      });
     
      return data
    } catch (error) {
      return {}      
    }
  } 
}

module.exports = Model_r;
