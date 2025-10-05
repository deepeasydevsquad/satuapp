const {
  Op,
  Company,
  Mst_paket_type,
  Mst_fasilitas,
  Paket,
  Paket_price,
  Paket_transaction,
  Jamaah,
  Member,
  Handover_barang_paket,
  Handover_fasilitas_detail_paket,
  Handover_fasilitas_paket,
  Division,
  sequelize,
} = require("../../../models");
const { getCompanyIdByCode, getCabang, getDivisionId, tipe } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");
const fs = require('fs').promises; 
const path = require('path');

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
  }

  async initialize() {
    if (this.company_id && this.division_id) {
      return;
    }
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.type = await tipe(this.req);
  }

  async getPaketListTransPaket() {
    await this.initialize();

    try {

      var div = [];
      if( this.type === 'administrator' ) {
        const { rows } = await Division.findAndCountAll({ where : { company_id : this.company_id} });
        await Promise.all(
          await rows.map(async (e) => {
            div.push(e.id);
          })
        );
      }else{
        const { rows } = await Division.findAndCountAll({ where : { id: this.division, company_id : this.company_id} });
        await Promise.all(
          await rows.map(async (e) => {
            div.push(e.id);
          })
        );
      }

      const where = {
        division_id: { [Op.in]: div },
        departure_date: {
          [Op.gt]: moment().startOf('day').toDate(),
        },
      };

      const dataPaket = await Paket.findAll({
        where,
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "division_id",
          "name",
          "kode",
          "photo",
          "departure_date",
          "return_date",
        ],
        include: [
          {
            model: Paket_price,
            attributes: ["id", "price"],
          },
          {
            required: false, 
            model: Division, 
            attributes: ["id", "name"]
          },
        ],
      });

      var total_jamaah = {};
      for( let x in dataPaket ) {
        var dataJamaah = await Paket_transaction.count({
          where: {
            division_id: this.division_id,
            paket_id: dataPaket[x].id
          },
        });
        total_jamaah = {...total_jamaah,...{[dataPaket[x].id] : dataJamaah}}
      }

      const data = await Promise.all(dataPaket.map(async paket => {
        const prices = paket.Paket_prices.map(item => item.price);
        const price = {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
        };
        const photoPath = paket.photo;
        let finalPhoto = photoPath;

        if (photoPath && photoPath !== '-') {
          const absolutePath = path.join(__dirname, '../../..', photoPath); 
          console.log("Checking file:", absolutePath);
          try {
            await fs.access(absolutePath, fs.constants.F_OK); 
          } catch (e) {
            finalPhoto = null;
          }
        } else {
          finalPhoto = null;
        }

        console.log("finalPhoto:", paket);
        return {
          id: paket.id,
          division_name : paket.Division ? paket.Division.name : 'Tidak Diketahui',
          division_id: paket.division_id,
          name: paket.name,
          kode: paket.kode,
          photo: finalPhoto,
          durasi: moment(paket.return_date).diff(moment(paket.departure_date), 'days'),
          departure_date: moment(paket.departure_date).format("DD MMM YY"),
          prices: price,
          total_jamaah: total_jamaah[paket.id],
        };
      }));

      return {
        data: data,
        total: data.length,
      };
    } catch (error) {
      console.error("Error in getPaketListTransPaket:", error);
      return { data: [], total: 0 };
    }
  }

  // Fungsi untuk ambil ID paket transaction dari pencarian
  async getPaketTransactionIdsFromSearch(searchTerm) {
    const paketTransactionIds = await Paket_transaction.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: [
          { '$Jamaah.Member.fullname$': { [Op.like]: `%${searchTerm}%` } },
          { '$Jamaah.Member.identity_number$': { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      include: [{ model: Jamaah, include: [Member] }],
      raw: true,
    });

    return paketTransactionIds.map((j) => j.id);
  }

  async getHandoverBarangPaket(paket_trans_id) {
    const dataHandoverBarang = await Handover_barang_paket.findAll({
      where: {
        paket_transaction_id: paket_trans_id, 
        status: "diambil",
      },
      attributes: ["id", "nama_barang"],
      order: [['createdAt', 'Desc']],
    })

    return dataHandoverBarang.map((e) => ({
      id: e.id,
      name: e.nama_barang,
    }))
  }

  async getHandoverFasilitasPaket(paket_trans_id) {
    const dataHandoverFasilitas = await Handover_fasilitas_paket.findAll({
      where: {
        paket_transaction_id: paket_trans_id,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Handover_fasilitas_detail_paket,
          required: true,
          include: [
            {
              model: Mst_fasilitas,
              required: true,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      raw: true,
    });

    return dataHandoverFasilitas.map((row) => ({
      id: row['Handover_fasilitas_detail_pakets.Mst_fasilita.id'],
      name: row['Handover_fasilitas_detail_pakets.Mst_fasilita.name'],
    }));
  }

  // Fungsi utama
  async transformDaftarJamaahPaket(e) {
    const paket_price = await Paket_price.findOne({ where: { paket_id: e.paket_id, mst_paket_type_id: e.mst_paket_type_id } });
    const paket = e.Paket;
    const mstPaketType = e.Mst_paket_type;
    const jamaah = e.Jamaah?.Member;
    return {
      id: e.id,
      kode: paket?.kode,
      name: paket?.name,
      type: mstPaketType?.name,
      price: paket_price?.price,
      jamaah_id: e.Jamaah?.id,
      nomor_passport: e.Jamaah?.nomor_passport,
      fullname: jamaah?.fullname,
      identity_number: jamaah?.identity_number,
      birth_date: jamaah?.birth_date ? moment(jamaah.birth_date).format('DD-MM-YYYY') : '',
      birth_place: jamaah?.birth_place,
      handover_barang: await this.getHandoverBarangPaket(e.id),
      handover_fasilitas: await this.getHandoverFasilitasPaket(e.id)
    };
  }

  // Fungsi daftar jamaah paket
  async getDaftarJamaahTransPaket() {
    await this.initialize();

    const body = this.req.body;
    const pageNumber = typeof body.pageNumber === "undefined" || body.pageNumber === 0 ? 1 : parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";

    const division_id = await getDivisionId(this.req);
    let where = { division_id: division_id };
    if (search) {
      const paketTransactionIds = await this.getPaketTransactionIdsFromSearch(search);
      where = { ...where, id: { [Op.in]: paketTransactionIds } };
    }

    var sql = {}
    sql["limit"] = perpage * 1;
    sql["offset"] = offset;
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "division_id",
      "jamaah_id",
      "paket_id",
      "mst_paket_type_id",
      "createdAt",
      "updatedAt"
    ];
    sql["where"] = where;
    sql["include"] = [
      {
        model: Mst_paket_type,
        attributes: ["id", "name"],
        required: true
      },
      {
        model: Paket,
        where: {
          division_id: division_id,
          departure_date: { [Op.gt]: new Date() },
        },
        attributes: ["id", "kode", "name"],
        required: true
      },
      {
        model: Jamaah,
        attributes: ["id", "nomor_passport"],
        required: true,
        include: [
          {
            model: Member,
            attributes: ["fullname", "identity_number", "birth_date", "birth_place"],
            required: true
          }
        ]
      }
    ]

    try {
      const query = await dbList(sql);
      const totalData = await Paket_transaction.findAndCountAll(query.total);
      const dataList = await Paket_transaction.findAll(query.sql);

      const data = await Promise.all(
        dataList.map(async (e) => {
          return await this.transformDaftarJamaahPaket(e);
        })
      );

      return { 
        data: data,
        total: totalData.count
      };    
    } catch (error) {
      console.log("Error in daftarJamaahPaket:", error);
      return { data: [], total: 0 };
    }
  }
}

module.exports = Model_r;
