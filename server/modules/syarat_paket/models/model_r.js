const {
  Op,
  Paket_transaction,
  Jamaah,
  Member,
  Paket, 
  Division
} = require("../../../models");
const { getCompanyIdByCode, getDivisionId } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
  
class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getDivisionId(this.req);
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

  getStatusSyarat(jamaah) {
    const fields = {
      "Nomor Passport": "nomor_passport",
      "Photo 4x6": "photo_4_6",
      "Photo 3x4": "photo_3_4",
      "Foto Copy Passport": "fc_passport",
      "Foto Copy KK": "fc_kk",
      "Foto Copy KTP": "fc_ktp",
      "Buku Nikah": "buku_nikah",
      "Akta Lahir": "akte_lahir",
      "Buku Kuning": "buku_kuning",
    };

    const emptyValues = [null, "", "tidak_ada"];

    return Object.fromEntries(
      Object.entries(fields).map(([label, fieldName]) => [
        label,
        !emptyValues.includes(jamaah[fieldName]),
      ])
    );
  }

  // Fungsi utama
  async transformManifestPaket(e) {
    const jamaah = e.Jamaah ?? {};
    const jamaahMember = jamaah.Member ?? {};
    const status = this.getStatusSyarat(jamaah);

    return {
      id: e.id || "-",
      jamaah_id: jamaah.id || "-",
      fullname: jamaahMember.fullname || "-",
      identity_number: jamaahMember.identity_number || "-",
      gender: jamaahMember.gender === "laki_laki" ? "Laki-laki" : jamaahMember.gender === "perempuan" ? "Perempuan" : "-",
      status_syarat: status,
    };
  }

  // Fungsi daftar manifest paket
  async daftarSyaratPaket() {
    await this.initialize();

    const body = this.req.body;
    const pageNumber = typeof body.pageNumber === "undefined" || body.pageNumber === 0 ? 1 : parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";
    // var status = '';

    let where = { paket_id: body.paketId, division_id: this.division_id };
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
      "createdAt",
      "updatedAt"
    ];
    sql["where"] = where;
    sql["include"] = [
      {
        model: Jamaah,
        attributes: [
          "id",
          "nomor_passport",
          "photo_4_6",
          "photo_3_4",
          "fc_passport",
          "fc_kk",
          "fc_ktp",
          "buku_nikah",
          "akte_lahir",
          "buku_kuning"
        ],
        required: true,
        include: [
          {
            model: Member,
            attributes: ["fullname", "identity_number", "gender"],
            required: true
          }
        ]
      },
      {
        model: Paket, 
        required: true,
        attributes: ["tutup_paket"],
      }
    ]

    try {
      const status = (await Paket.findOne({
        where: { id: body.paketId },
        include: [{
          required: true,
          model: Division,
          where: { company_id: this.company_id }
        }]
      }))?.tutup_paket ?? 'tutup';
      const query = await dbList(sql);
      const totalData = await Paket_transaction.findAndCountAll(query.total);
      const dataList = await Paket_transaction.findAll(query.sql);

      const data = await Promise.all(
        dataList.map(async (e) => {
          // status = e.Paket.tutup_paket;
          return await this.transformManifestPaket(e);
        })
      );

      return { 
        data: data,
        total: await totalData.count,
        status
      };    
    } catch (error) {
      console.log("Error in daftarSyaratPaket:", error);
    }
  }
}

module.exports = Model_r;
