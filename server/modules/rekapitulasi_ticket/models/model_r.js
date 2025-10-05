const {
  Op,
  Company,
  Division,
  Paket,
  Mst_paket_type,
  Mst_kota,
  Paket_transaction,
  Jamaah,
  Member,
  Ticket_rekapitulasi,
  Ticket_rekapitulasi_detail,
  Ticket_transaction,
  Ticket_transaction_detail,
  Mst_airline,
  sequelize,
} = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const { getAlamatInfo } = require("../../../helper/alamatHelper");
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

  async header() {
    var data = {};
    let division = null;
    await Division.findOne({
      attributes: ["name", "pos_code", "address"], // ambil dari Division
      where: { id: this.division_id }, // pastikan ini berdasarkan division_id
      include: [
        {
          required: true,
          model: Company,
          attributes: [
            "logo",
            "company_name",
            "email",
            "whatsapp_company_number",
            "invoice_logo",
            "invoice_title",
          ],
        },
        {
          model: Mst_kota, // include tabel mst_kota
          attributes: ["name"], // ambil kolom name dari mst_kota
        },
      ],
    }).then(async (e) => {
      if (e) {
        let exisFile = false;
        if (e.Company.invoice_logo !== null) {
          const filePath = path.join(
            __dirname,
            "uploads",
            e.Company.invoice_logo
          );
          if (fs.existsSync(filePath)) {
            exisFile = true;
          }
        }
        data["logo"] = exisFile ? e.Company.invoice_logo : "default.png";
        data["company_name"] = e.Company.company_name || "-";
        data["city"] = e.Mst_kota?.name || "-"; // ambil nama kota dari mst_kota
        data["address"] = e.address || "-";
        data["pos_code"] = e.pos_code || "-";
        data["email"] = e.Company.email || "-";
        data["whatsapp_company_number"] = e.Company.whatsapp_company_number || "-";
      }
    });

    if (division) {
      const invoiceLogo = division.Company?.invoice_logo;
      const logoPath = invoiceLogo
        ? path.resolve(__dirname, "../../../uploads", invoiceLogo)
        : null;

      const exists = invoiceLogo && fs.existsSync(logoPath);

      data.logo = exists ? invoiceLogo : "default.png";
      data.company_name = division.Company?.company_name ?? "-";
      data.city = division.Mst_kota?.name ?? "-";
      data.address = division.address ?? "-";
      data.pos_code = division.pos_code ?? "-";
      data.email = division.Company?.email ?? "-";
      data.whatsapp_company_number =
        division.Company?.whatsapp_company_number ?? "-";
    }

    return data;
  }

  async penerima() {
    this.tipe = await tipe(this.req);

    if (this.tipe === "administrator") {
      const company = await Company.findOne({
        where: { id: this.company_id },
      });
      return company?.company_name ?? "Unknown Company";
    }

    if (this.tipe === "staff") {
      const member = await Member.findOne({
        where: { company_id: this.company_id },
        order: [["id", "DESC"]],
      });
      return member?.fullname ?? "Unknown Staff";
    }

    return "Tipe user tidak diketahui";
  }

  async getTicketTersedia() {
    await this.initialize();
    const body = this.req.body;

    try {
      const whereClause = {
        status: 'active',
        division_id: this.division_id,
        id: {
          [Op.notIn]: [
            sequelize.literal('SELECT ticket_transaction_id FROM Ticket_rekapitulasi_details')
          ]
        }
      };

      if (body.search) {
        whereClause.nomor_register = { [Op.like]: `%${body.search}%` };
      }
      const tickets = await Ticket_transaction.findAll({
        where: whereClause,
        attributes: ['id', 'nomor_register', 'total_transaksi', 'status', 'createdAt'],
        include: [
          {
            model: Ticket_transaction_detail,
            attributes: [
              'id',
              'pax',
              'code_booking',
              'departure_date',
              'travel_price',
              'costumer_price'
            ],
            include: [
              {
                model: Mst_airline,
                attributes: ['name'],
              },
            ],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const data = tickets.map(ticket => ({
        id: ticket.id,
        nomor_register: ticket.nomor_register,
        total_transaksi: ticket.total_transaksi,
        status: ticket.status,
        tanggal_transaksi: moment(ticket.createdAt).format('DD-MM-YYYY HH:mm:ss'),
        ticket_details: ticket.Ticket_transaction_details.map(detail => ({
          id: detail.id,
          pax: detail.pax,
          airlines_name: detail.Mst_airline ? detail.Mst_airline.name : 'N/A',
          code_booking: detail.code_booking,
          departure_date: moment(detail.departure_date).format('DD-MM-YYYY'),
          travel_price: detail.travel_price,
          costumer_price: detail.costumer_price
        })),
      }));

      return data;
    } catch (error) {
      console.error("Error in getTicketTersedia:", error);
      return [];
    }
  }

  // Fungsi utama
  async transformDaftarTicketRekapitulasi(e) {
    return {
      id: e.id,
      division_id: e.division_id,
      registration_number: e.registration_number,
      costumer_name: e.costumer_name,
      costumer_whatsapp_number: e.costumer_whatsapp_number,
      petugas: e.petugas,
      total_rekapitulasi: e.total_rekapitulasi,
      createdAt: moment(e.createdAt).format("DD/MM/YYYY"),
    };
  }

  // Fungsi daftar transaksi paket
  async daftarTicketRekapitulasi() {
    await this.initialize();

    const body = this.req.body;
    const pageNumber = typeof body.pageNumber === "undefined" || body.pageNumber === 0 ? 1 : parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";

    let where = { division_id: this.division_id };
    if (search) {
      where = { ...where, registration_number: { [Op.like]: `%${search}%` } };
    }

    var sql = {}
    sql["limit"] = perpage * 1;
    sql["offset"] = offset;
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "division_id",
      "registration_number",
      "costumer_name",
      "costumer_whatsapp_number",
      "petugas",
      "total_rekapitulasi",
      "createdAt",
      "updatedAt"
    ];
    sql["where"] = where;

    try {
      const query = await dbList(sql);
      const totalData = await Ticket_rekapitulasi.findAndCountAll(query.total);
      const dataList = await Ticket_rekapitulasi.findAll(query.sql);

      const data = await Promise.all(
        dataList.map(async (e) => {
          return await this.transformDaftarTicketRekapitulasi(e);
        })
      );

      return { 
        data: data,
        total: await totalData.count
      };    
    } catch (error) {
      console.log("Error in daftarTicketRekapitulasi:", error);
      return { data: [], total: 0 };
    }
  }

  async infoDaftarTicketRekapitulasi(id, division_id) {
    try {
      const where = { id: id, division_id: division_id };

      var sql = {}
      sql["attributes"] = [
        "id",
        "division_id",
        "jamaah_id",
        "paket_id",
        "mst_paket_type_id",
        "price",
        "nomor_visa",
        "tanggal_berlaku_visa",
        "tanggal_berakhir_visa",
        "biaya_mahram",
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
          attributes: ["id", "kode", "name", "departure_date"],
          required: true
        },
        {
          model: Jamaah,
          attributes: ["id"],
          required: true,
          include: [
            {
              model: Member,
              attributes: ["fullname", "identity_number"],
              required: true
            }
          ]
        }
      ]

      const dataTranspaket = await Paket_transaction.findOne(sql);
      const data = {
        id: dataTranspaket.id,
        division_id: dataTranspaket.division_id,
        jamaah_id: dataTranspaket.jamaah_id,
        paket_id: dataTranspaket.paket_id,
        mst_paket_type_id: dataTranspaket.mst_paket_type_id,
        price: dataTranspaket.price,
        nomor_visa: dataTranspaket.nomor_visa,
        tanggal_berlaku_visa: dataTranspaket.tanggal_berlaku_visa,
        tanggal_berakhir_visa: dataTranspaket.tanggal_berakhir_visa,
        biaya_mahram: dataTranspaket.biaya_mahram,
        createdAt: dataTranspaket.createdAt,
        updatedAt: dataTranspaket.updatedAt,
        Mst_paket_type: dataTranspaket.Mst_paket_type,
        Paket: dataTranspaket.Paket,
        Jamaah: dataTranspaket.Jamaah,
        Member: dataTranspaket.Jamaah.Member
      };

      console.log("========= infoDaftarTicketRekapitulasi =========");
      console.log(data);
      console.log("========= infoDaftarTicketRekapitulasi =========");

      return data;
    } catch (error) {
      console.log("Error in infoDaftarTicketRekapitulasi:", error);
      return {};
    }
  }

  async cetakDataRekapByRegnumb() {
    await this.initialize();
    const { regnumb } = this.req.params;
    try {
      let data = { ...await this.header() };
      const rekapitulasi = await Ticket_rekapitulasi.findOne({
        where: {
          registration_number: regnumb,
          division_id: this.division_id,
        },
      });

      if (!rekapitulasi) {
        return null;
      }

      const details = await Ticket_rekapitulasi_detail.findAll({
        where: {
          ticket_rekapitulasi_id: rekapitulasi.id,
        },
        include: [
          {
            model: Ticket_transaction,
            attributes: ['id', 'nomor_register', 'total_transaksi', 'createdAt'],
            include: [
              {
                model: Ticket_transaction_detail,
                attributes: ['pax', 'code_booking', 'costumer_price', 'departure_date'],
                include: [
                  {
                    model: Mst_airline,
                    attributes: ['name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const transformedDetails = details.flatMap(detail => {
        const trx = detail.Ticket_transaction;
        if (!trx || !trx.Ticket_transaction_details) {
          return [];
        }

        return trx.Ticket_transaction_details.map(trxDetail => {
          const airline = trxDetail.Mst_airline ? trxDetail.Mst_airline.name : 'N/A';
          return {
            id: trxDetail.id,
            nomor_register: trx.nomor_register,
            tanggal_transaksi: moment(trx.createdAt).format('DD-MM-YYYY'),
            pax: trxDetail.pax || 1,
            airline: airline,
            code_booking: trxDetail.code_booking || 'N/A',
            departure_date: trxDetail.departure_date ? moment(trxDetail.departure_date).format('DD-MM-YYYY') : 'N/A',
            harga: trxDetail.costumer_price || 0,
          };
        });
      });

      return {
        ...data,
        id: rekapitulasi.id,
        registration_number: rekapitulasi.registration_number,
        costumer_name: rekapitulasi.costumer_name,
        costumer_whatsapp_number: rekapitulasi.costumer_whatsapp_number,
        petugas: rekapitulasi.petugas,
        total_rekapitulasi: rekapitulasi.total_rekapitulasi,
        createdAt: moment(rekapitulasi.createdAt).format('DD MMMM YYYY'),
        tickets: transformedDetails,
      };
    } catch (error) {
      console.error("Error in cetakDataRekapByRegnumb:", error);
      throw error;
    }
  }
}

module.exports = Model_r;
