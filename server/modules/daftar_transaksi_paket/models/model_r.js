const {
  Op,
  User,
  Grup,
  Company,
  Division,
  Paket,
  Paket_price,
  Mst_paket_type,
  Paket_transaction,
  Paket_transaction_payment_history,
  Fee_agen,
  Tabungan,
  Jamaah,
  Riwayat_tabungan,
  Agen,
  Level_keagenan,
  Member,
  Handover_fasilitas,
  Handover_fasilitas_detail,
  Deposit,
  Jurnal,
  Handover_barang,
  Mst_fasilitas,
  Mst_kota,
  Mst_pendidikan,
  Mst_pekerjaan,
  File_pendukung
} = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe, getDivisionId } = require("../../../helper/companyHelper");
const { getAgenById } = require("../../../helper/JamaahHelper");
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

  // Fungsi utama
  async transformDaftarTransaksiPaket(e) {
    const paket_price = await Paket_price.findOne({ where: { paket_id: e.paket_id, mst_paket_type_id: e.mst_paket_type_id } });
    const paket = e.Paket;
    const mstPaketType = e.Mst_paket_type;
    const jamaah = e.Jamaah?.Member;
    return {
      id: e.id,
      paket_id: paket?.id,
      name: paket?.name,
      departure_date: paket?.departure_date ? moment(paket.departure_date).format("DD MMM YY") : "-",
      type: mstPaketType?.name,
      price: paket_price?.price,
      sisa: e.price + e.biaya_mahram - paket_price?.price,
      jamaah_id: e.Jamaah?.id,
      fullname: jamaah?.fullname,
      identity_number: jamaah?.identity_number,
      total_price: e.price,
      nomor_visa: e.nomor_visa || "-",
      tanggal_berlaku_visa: e.tanggal_berlaku_visa || "-",
      tanggal_berakhir_visa: e.tanggal_berakhir_visa || "-",
      biaya_mahram: e.biaya_mahram || 0,
    };
  }

  // Fungsi daftar transaksi paket
  async daftarTransaksiPaket() {
    await this.initialize();
    const division_id = await getDivisionId(this.req);

    const body = this.req.body;
    const pageNumber = typeof body.pageNumber === "undefined" || body.pageNumber === 0 ? 1 : parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";

    console.log(body);

    let where = { paket_id: body.id, division_id: division_id };
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
        attributes: ["id", "kode", "name", "departure_date", "tutup_paket"],
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

    try {

      const status = (await Paket.findOne({
        where: { id: body.id },
        include: [{
          required: true,
          model: Division,
          where: { company_id: this.company_id }
        }]
      }))?.tutup_paket ?? 'tutup';


      const query = await dbList(sql);
      const totalData = await Paket_transaction.findAndCountAll(query.total);
      const dataList = await Paket_transaction.findAll(query.sql);

      console.log("-----dataList");
      console.log(dataList);
      console.log("-----dataList");
    
      const data = await Promise.all(
        dataList.map(async (e) => {

          // console.log("*****************");
          // console.log(e.Paket.tutup_paket);
          // console.log("*****************");
          // status = e.Paket.tutup_paket;
          return await this.transformDaftarTransaksiPaket(e);
        })
      );

      var listPaketTransactionId = []
      for( let x in data ) {
        listPaketTransactionId.push(data[x].id);
      }

      var filePendukung = {};
      const q = await File_pendukung.findAndCountAll({ where: { paket_transaction_id: { [Op.in]: listPaketTransactionId } } });
      await Promise.all(
        await q.rows.map(async (e) => {
          if(filePendukung[e.paket_transaction_id] === undefined) {
            filePendukung = { ...filePendukung, [e.paket_transaction_id]: [{ title: e.title_file, filename: e.filename}] };
          }else{
            filePendukung[e.paket_transaction_id].push({ title: e.title_file, filename: e.filename });
          }
        })
      );

      for( let x in data ) {
        if(filePendukung[data[x].id] !== undefined) {
          data[x].file_pendukung = filePendukung[data[x].id];
        } else {
          data[x].file_pendukung = [];
        }
      }

      console.log('----Status-----');
      console.log(status);
      console.log('----Status-----');

      return { 
        status,
        data: data,
        total: await totalData.count
      };    
    } catch (error) {
      console.log("Error in daftarTransaksiPaket:", error);
      return { data: [], total: 0 };
    }
  }

  async getJamaahTransaksiPaket() {
    await this.initialize();
    // const division_id = await getDivisionId(this.req);
    const { id: paket_id } = this.req.body;

    try {
      // Ambil semua jamaah yang sudah terdaftar di paket ini namun belum terdaftar di paket transaksi

      // ambil divisi dari paket di 
      var division_id = 0;
      await Paket.findOne({ 
        include: {
          required: true,
          model: Division,
          where: { company_id: this.company_id },
        },
        where: { id: paket_id
        }
      }).then(async (e) => {
        if (e) { division_id = e.division_id; }
      });

      // ambil jamaah yang sudah terdaftar di paket transaksi
      var jamaahSudahTerdaftar = [];
      const q = await Paket_transaction.findAndCountAll({
        where: {
          paket_id
        },
        order: [["id", "ASC"]],
      });
      await Promise.all(
        await q.rows.map(async (e) => {
          jamaahSudahTerdaftar.push(e.jamaah_id);
        })
      );

      var data = [];
      const q1 = await Jamaah.findAndCountAll({
        where: {
          id: {
            [Op.notIn]: jamaahSudahTerdaftar,
          }
        },
        include: {
          required: true,
          model: Member,
          where: {
            division_id: division_id,
          }
        } 
      });
      await Promise.all(
        await q1.rows.map(async (e) => {
          data.push({
            id: e.id, 
            agen_id: e.agen_id,
            name: e.Member?.fullname || "-"
          });
        })
      );


      console.log("XXXXX");
      console.log(data);
      console.log("XXXXX");

      // jamaahSudahTerdaftar.push(e.jamaah_id);
     
      // const transaksiPaket = await Paket_transaction.findAll({
      //   where: { paket_id },
      //   attributes: ["jamaah_id"],
      //   raw: true,
      // });
      // const jamaahTerdaftarIds = transaksiPaket.map(e => e.jamaah_id);

      // const tabunganAktif = await Tabungan.findAll({
      //   where: {
      //     division_id,
      //     status: "active",
      //   },
      //   attributes: ["jamaah_id"],
      //   raw: true,
      // });
      // const jamaahDenganTabunganIds = new Set(tabunganAktif.map(e => e.jamaah_id));

      // const jamaah = await Jamaah.findAll({
      //   where: {
      //     division_id,
      //     id: {
      //       [Op.notIn]: [...jamaahTerdaftarIds, ...jamaahDenganTabunganIds],
      //     },
      //   },
      //   attributes: ["id", "agen_id"],
      //   include: [{
      //     model: Member,
      //     attributes: ["fullname"],
      //   }],
      // });

      // data: jamaah.map(e => ({
      //   id: e.id,
      //   agen_id: e.agen_id,
      //   name: e.Member?.fullname || "-",
      // })),


      return {
        data: data,
        total: data.length,
      };
    } catch (error) {
      console.error("Error in getJamaahTransaksiPaket:", error);
      return {
        data: [],
        total: 0,
        error: error.message,
      };
    }
  }

  async getPaketTypes() {
    await this.initialize();
    const body = this.req.body;

    try {
      const data = await Paket_price.findAll({
        where: {
          paket_id: body.id,
        },
        attributes: ["price", "mst_paket_type_id"],
        include: [{
          model: Mst_paket_type,
          attributes: ["id", "name"],
        }],
      });

      return {
        data: data.map(e => ({
          id: e.mst_paket_type_id,
          name: e.Mst_paket_type.name + " (Rp " + e.price.toLocaleString("id-ID") + ")",
          price: e.price,
        })),
        total: data.length,
      };
      
    } catch (error) {
      console.log("Error in getPaketTypes:", error);
      return {
        data: [],
        total: 0,
      };
    }
  }

  async getAgenById() {
    await this.initialize();
    const body = this.req.body;

    try {
      const agen = await getAgenById(body.id);
      const dataAgen = {
        id: agen.id,
        name: agen.Member.fullname,
        default_fee: Number(agen.Level_keagenan.default_fee),
      };

      return {
        data: dataAgen,
        total: dataAgen.length,
      };
    } catch (error) {
      console.log("Error in getAgenById:", error);
      return {
        data: [],
        total: 0,
      };
    }
  }

  async infoupdateVisaTransaksiPaket() {
    await this.initialize();
    const body = this.req.body;
    const division_id = await getDivisionId(this.req);

    try {
      const data = await Paket_transaction.findOne({
        where: {
          id: body.transpaketId,
          paket_id: body.id,
          division_id: division_id
        },
        attributes: ["nomor_visa", "tanggal_berlaku_visa", "tanggal_berakhir_visa"],
      });

      const listData = {
        id: body.id,
        transpaketId: body.transpaketId,
        nomor_visa: data.nomor_visa,
        tanggal_berlaku_visa: data.tanggal_berlaku_visa,
        tanggal_berakhir_visa: data.tanggal_berakhir_visa,
      };

      return ({
        data: listData,
        total: 1
      })
    } catch (error) {
      console.log("Error in infoupdateVisaTransaksiPaket:", error);
      return {
        data: [],
        total: 0,
      };
    }
  }

  async inforefundTransaksiPaket() {
    await this.initialize();
    const body = this.req.body;
    const division_id = await getDivisionId(this.req);

    try {
      const data = await Paket_transaction.findOne({
        where: {
          id: body.transpaketId,
          paket_id: body.id,
          division_id: division_id
        },
        attributes: ["price"],
      });

      return ({
        data: data,
        total: data.length
      })
    } catch (error) {
      console.log("Error in inforefundTransaksiPaket:", error);
      return {
        data: [],
        total: 0,
      };
    }
  }

  async infoPaket(id, mst_paket_type_id, division_id) {
    try {
      const paket = await Paket.findOne({
        where: { id, division_id },
        attributes: ["id", "kode", "name", "departure_date", "mahram_fee"],
      });

      const paketPrice = await Paket_price.findOne({
        where: { 
          paket_id: id, 
          mst_paket_type_id 
        },
        attributes: ["price", "mst_paket_type_id"],
        include: [
          {
            model: Mst_paket_type,
            attributes: ["id", "name"],
            required: true
          }
        ]
      });

      let data = {};
      if (paket) {
        data = {
          id: paket.id,
          kode: paket.kode,
          name: paket.name,
          departure_date: paket.departure_date,
          mahram_fee: paket.mahram_fee,
          price: paketPrice.price,
          mst_paket_type_id: paketPrice.mst_paket_type_id,
          mst_paket_type_name: paketPrice.Mst_paket_type.name
        };
      }
     
      return data;
    } catch (error) {
      return {};
    }
  }

  async infoDaftarTransaksiPaket(id, division_id) {
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

      console.log("========= infoDaftarTransaksiPaket =========");
      console.log(data);
      console.log("========= infoDaftarTransaksiPaket =========");

      return data;
    } catch (error) {
      console.log("Error in infoDaftarTransaksiPaket:", error);
      return {};
    }
  }
}

module.exports = Model_r;
