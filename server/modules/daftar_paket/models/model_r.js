const { Op, Paket, Paket_price, Mst_provider, Mst_asuransi, Mst_paket_type, Division } = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
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

  async getDivisionId() {
    const userType = await tipe(this.req);
    if (userType === "administrator") {
      return this.req.body.division_id;
    } else if (userType === "staff") {
      const decoded = jwt.decode(
        this.req.headers["authorization"]?.split(" ")[1]
      );
      return decoded?.division_id;
    } else {
      throw new Error("Role pengguna tidak valid.");
    }
  }

  async cekDate(departureDate) {
    const today = moment(new Date()).format('YYYY-MM-DD');
    const departure = moment(departureDate).format('YYYY-MM-DD');
  
    if (departure <= today) {
      return 'sudah_berangkat';
    } else {
      return 'belum_berangkat';
    }
  }

  async namaTipePaket(id) {
    const data = await Mst_paket_type.findByPk(id, {
      attributes: ['name']
    });
    return data ? data.name : null;
  }

  async daftar_paket() {
    // initialize dependensi properties
    await this.initialize();

    const body = this.req.body;
    const division_id = await this.getDivisionId();

    console.log("division_id:", division_id);
    console.log("body:", body);
    
    const pageNumber = parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== '0' ) page = body.pageNumber;

    const search = body.search || "";
    const filter = body.filter || "";
    const today = moment().format('YYYY-MM-DD');

    var where = { division_id: division_id };

    if (filter === "belum_berangkat") {
      where = {
        ...where,
        departure_date: {
          [Op.gt]: today,
        },
      };
    } else if (filter === "sudah_berangkat") {
      where = {
        ...where,
        departure_date: {
          [Op.lte]: today,
        },
      };
    }

    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { kode: { [Op.like]: `%${search}%` } },
        ]
      };
    }
    console.log("where:", where);

    var sql = {};
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "division_id",
      "jenis_kegiatan",
      "kode",
      "photo",
      "slug",
      "name",
      "description",
      "departure_date",
      "return_date",
      "departure_from",
      "duration_trip",
      "mahram_fee",
      "quota_jamaah",
      "city_visited",
      "airlines",
      "hotel",
      "facilities",
      "show_homepage",
      "airport_destination",
      "airport_departure",
      "departure_time",
      "arrival_time",
      "tutup_paket",
      "provider_visa_id",
      "asuransi_id",
      "no_polis",
      "tgl_input_polis",
      "tgl_awal_polis",
      "tgl_akhir_polis",
      "createdAt",
      "updatedAt"
    ];
    sql["where"] = where;
    sql["limit"] = perpage;
    sql["offset"] = offset;
    sql['include'] = {
      required : true, 
      model: Division, 
      attributes: ['name']
    }

    try {
      const query = await dbList(sql);
      const q = await Paket.findAndCountAll(query.total);
      const total = await q.count;
    
      var data = [];
      if (total > 0) {
        var list_paket_id = [];
        await Paket.findAll(query.sql).then(async (value) => {
          await Promise.all(
            value.map(async (e) => {
              data.push({
                id: e.id,
                division_id: e.division_id,
                division_name: e.Division.name,
                jenis_kegiatan: e.jenis_kegiatan,
                kode: e.kode,
                name: e.name,
                description: e.description,
                departure_date: e.departure_date,
                return_date: e.return_date,
                quota_jamaah: e.quota_jamaah,
                city_visited: JSON.parse(e.city_visited),
                airlines: JSON.parse(e.airlines),
                hotel: JSON.parse(e.hotel),
                facilities: JSON.parse(e.facilities),
                departure_time: e.departure_time,
                arrival_time: e.arrival_time,
                prices: [],
                tutup_paket: e.tutup_paket,
                status: await this.cekDate(e.departure_date),
              });

              list_paket_id.push(e.id);
            })
          );
        });

        var list_paket_price = {};
        await Paket_price.findAll({ where : { paket_id : { [Op.in] : list_paket_id}}, include: {
          required: true,
          model: Mst_paket_type,
          attributes: ['name']
        } }).then(async (value) => {
          await Promise.all(
            value.map(async (e) => {
              if( list_paket_price[e.paket_id] === undefined ) {
                list_paket_price = {...list_paket_price,...{[e.paket_id] : [{id: e.price, paket_tipe: e.Mst_paket_type.name, price: e.price}]}};
              }else{
                list_paket_price[e.paket_id].push({ id: e.price, paket_tipe: e.Mst_paket_type.name, price: e.price});
              }
            })
          );
        });

        for( let x in data ) {
          if(list_paket_price[data[x].id] !== undefined) {
            data[x].prices = list_paket_price[data[x].id];
          }
        }
      }

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      return {};
    }
  }


  async get_paket() {
    // initialize dependensi properties
    await this.initialize();
    const division_id = await this.getDivisionId();

    const body = this.req.body;

    console.log("Body:", body); // Log the request body for debugging

    var where = { id: body.id, division_id: division_id };

    var sql = {};
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = [
      "id",
      "jenis_kegiatan",
      "kode",
      "name",
      "description",
      "departure_date",
      "return_date",
      "departure_from",
      "duration_trip",
      "mahram_fee",
      "quota_jamaah",
      "city_visited",
      "airlines",
      "hotel",
      "facilities",
      "show_homepage",
      "airport_destination",
      "airport_departure",
      "departure_time",
      "arrival_time",
      "provider_visa_id",
      "asuransi_id",
      "no_polis",
      "tgl_input_polis",
      "tgl_awal_polis",
      "tgl_akhir_polis",
      "createdAt",
      "updatedAt"
    ];
    sql["include"] = [
      {
        model: Paket_price,
        attributes: [
          "id",
          "mst_paket_type_id",
          "price"
        ],
        required: false
      },
      {
        model: Mst_provider,
        attributes: [
          "id",
          "name"
        ],
        required: false
      },
      {
        model: Mst_asuransi,
        attributes: [
          "id",
          "name"
        ],
        required: false
      }
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      console.log("Query:", query);
      const q = await Paket.findAndCountAll(query.total);
      console.log("Count:", q.count);
      const total = await q.count;
    
      var data = [];
      if (total > 0) {
        await Paket.findAll(query.sql).then(async (value) => {
          console.log("Value:", value);
          await Promise.all(
            value.map(async (e) => {
              data.push({
                id: e.id,
                jenis_kegiatan: e.jenis_kegiatan,
                kode: e.kode,
                photo: e.photo,
                name: e.name,
                description: e.description,
                departure_date: e.departure_date,
                return_date: e.return_date,
                departure_from: e.departure_from,
                duration_trip: e.duration_trip,
                mahram_fee: e.mahram_fee,
                quota_jamaah: e.quota_jamaah,
                city_visited: JSON.parse(e.city_visited),
                airlines: JSON.parse(e.airlines),
                hotel: JSON.parse(e.hotel),
                facilities: JSON.parse(e.facilities),
                show_homepage: e.show_homepage === 'tampilkan' ? true : false,
                airport_destination: e.airport_destination,
                airport_departure: e.airport_departure,
                departure_time: moment(e.departure_time).format('YYYY-MM-DD HH:mm:ss'),
                arrival_time: moment(e.arrival_time).format('YYYY-MM-DD HH:mm:ss'),
                provider_visa_id: e.provider_visa_id,
                asuransi_id: e.asuransi_id,
                no_polis: e.no_polis,
                tgl_input_polis: e.tgl_input_polis,
                tgl_awal_polis: e.tgl_awal_polis,
                tgl_akhir_polis: e.tgl_akhir_polis,
                paket_types: e.Paket_prices.map((price) => ({ id: price.mst_paket_type_id })),
                paket_prices: e.Paket_prices.reduce((acc, price) => {
                  acc[price.mst_paket_type_id] = price.price;
                  return acc;
                }, {}),
                createdAt: moment(e.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: moment(e.updatedAt).format('YYYY-MM-DD HH:mm:ss')
              });
            })
          );
        });
      }

      console.log("Data:", data); // Log data to check its structure

      return {
        data: data,
        total: total,
      };

    } catch (error) {
      console.error("Error in daftar_paket:", error);
      return {};
    }
  }

  async infoPaket(id, division_id) {
    try {
      var data = {};
      const paket = await Paket.findOne({
        where: division_id ? { id: id, division_id: division_id } : { id: id },
        include: [
          {
            model: Paket_price,
            attributes: ["id", "mst_paket_type_id", "price"],
            required: false,
          },
        ],
      });
      if (paket) {
        data["id"] = paket.id;
        data["kode"] = paket.kode;
        data["photo"] = paket.photo;
        data["name"] = paket.name;
        data["paket_prices"] = paket.Paket_prices.reduce((acc, price) => {
          acc[price.mst_paket_type_id] = price.price;
          return acc;
        }, {});
      }

      return data;  
    } catch (error) {
      return {};
    }
  }
}

module.exports = Model_r;
