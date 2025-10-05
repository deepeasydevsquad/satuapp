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
  Jamaah,
  Member,
  Mahram,
  Handover_barang_paket,
  Handover_fasilitas_paket,
  Handover_fasilitas_detail_paket,
  Mst_fasilitas,
  Mst_mahram_type,
  Mst_pendidikan,
  Mst_pekerjaan,
  Mst_kota, 
  Item_fasilitas
} = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe, getDivisionId } = require("../../../helper/companyHelper");
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
          attributes: [],
          required: true,
          include: [
            {
              model: Item_fasilitas,
              required: true,
              include:  {
                model: Mst_fasilitas,
                required: true,
                attributes: ['id', 'name']
              }
            }
          ]
        }
      ],
      raw: true,
    });

    return dataHandoverFasilitas.map((row) => ({
      id: row['Handover_fasilitas_detail_pakets.Item_fasilita.Mst_fasilita.id'],
      name: row['Handover_fasilitas_detail_pakets.Item_fasilita.Mst_fasilita.name'],
    }));
  }

  async getMahramGroupByJamaahId(jamaah_id) {
    const dataMahram = await Mahram.findOne({ where: { jamaah_id } })
    if (!dataMahram) return []
    const mahram_id = dataMahram.mahram_id
    const listMahram = await Mahram.findAll({
      where: { mahram_id, jamaah_id: { [Op.ne]: jamaah_id } },
      include: [
        {
          model: Mst_mahram_type,
          attributes: ['name'],
          required: true
        },
        {
          model: Jamaah,
          attributes: ["nomor_telephone"],
          required: true,
          include: [
            {
              model: Member,
              required: true,
              attributes: ["fullname"]
            }
          ]
        }
      ]
    })
    return listMahram.map(item => {
      return {
        id: item.jamaah_id,
        mahram_type: item.Mst_mahram_type.name,
        fullname: item.Jamaah?.Member?.fullname ?? '-',
        nomor_telephone: item.Jamaah?.nomor_telephone
      }
    })
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
      fullname: jamaah?.fullname,
      identity_number: jamaah?.identity_number,
      mahram: await this.getMahramGroupByJamaahId(e.Jamaah.id),
      handover_barang: await this.getHandoverBarangPaket(e.id),
      handover_fasilitas: await this.getHandoverFasilitasPaket(e.id)
    };
  }

  // Fungsi daftar jamaah paket
  async daftarJamaahPaket() {
    await this.initialize();

    const body = this.req.body;
    const pageNumber = typeof body.pageNumber === "undefined" || body.pageNumber === 0 ? 1 : parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";
    const division_id = await getDivisionId(this.req);
    // var status = 'tutup';
    console.log(body);

    let where = { paket_id: body.paketId, division_id: division_id };
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
        attributes: ["id", "kode", "name", "tutup_paket"],
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

      console.log(dataList);

      const data = await Promise.all(
        dataList.map(async (e) => {
          return await this.transformDaftarJamaahPaket(e);
        })
      );

      return { 
        data: data,
        total: await totalData.count,
        status
      };    
    } catch (error) {
      console.log("Error in daftarJamaahPaket:", error);
    }
  }

  async getPetugasJamaahPaket() {
    try {
      await this.initialize();
      const division_id = await getDivisionId(this.req);
      const userType = await tipe(this.req);
      const data = [];

      if (userType === "administrator") {
        data.push({
          id: `admin-${this.company_id}`,
          label: `Administrator ${await this.penerima()} (Administrator)`,
          type: "admin",
        });
      } 
      
      // Tambahkan user Staff dan pegawai
      const users = await User.findAll({
        where: { division_id: division_id },
        attributes: ["id"],
        include: [{
          model: Member,
          attributes: ["fullname"],
        }, 
        {
          model: Grup,
          attributes: ["name"],
        }],
      });
      
      users.forEach(user => {
        if (user.Grup.name === "admin") {
          data.push({
            id: `admin-${user.id}`,
            label: `${user.Member.fullname} (${user.Grup.name})`,
            type: "admin",
          });
        }
        data.push({
          id: `petugas-${user.id}`,
          label: `${user.Member.fullname} (${user.Grup.name})`,
          type: "petugas",
        });
      });

      data.sort((a, b) => {
        const prioritas = { admin: 1, agent: 2, petugas: 3 };
        return prioritas[a.type] - prioritas[b.type];
      });

      return {
        data,
        total: data.length,
      };
    } catch (error) {
      console.log("Error in getPetugasbyTabunganId:", error);
      return { data: [], total: 0 };
    }
  }

  async getCetakDataJamaahPaket() {
    try {
      await this.initialize();
      const id = this.req.params.id;
      const petugasIdQuery = this.req.query.petugasId;
      const userType = await tipe(this.req);
      let data = await this.header();

      const petugasId = petugasIdQuery.split("-")[1];
      const isPetugasAdmin = petugasIdQuery.startsWith("admin-");
      const isPetugasStaff = petugasIdQuery.startsWith("petugas-");

      if (isPetugasAdmin && userType === "administrator") {
        await this.penerima().then((penerima) => {
          data["petugas"] = penerima;
          data["jabatan"] = "Administrator";
        });
      } else if (isPetugasStaff) {
        const user = await User.findByPk(petugasId, {
          include: [
            {
              model: Member,
              attributes: ["fullname"],
            },
            {
              model: Grup,
              attributes: ["name"],
            },
          ],
        });
        if (user && user.Member) {
          data["petugas"] = user.Member.fullname || "-";
          data["jabatan"] = user.Grup.name || "Staff";
        } else {
          data["petugas"] = "Staff tidak ditemukan";
        }
      } else {
        data["petugas"] = "Petugas tidak diketahui";
      }

      const dataJamaahPaket = await Paket_transaction.findOne({
        where: { id },
        order: [["id", "ASC"]],
        include: [
          {
            model: Jamaah,
            attributes: [
              "id", 
              "kelurahan_id",
              "address",
              "nama_ayah",
              "blood_type",
              "nomor_passport",
              "tanggal_di_keluarkan_passport",
              "tempat_di_keluarkan_passport",
              "masa_berlaku_passport",
              "kode_pos",
              "email",
              "nomor_telephone",
              "pengalaman_haji",
              "tahun_haji",
              "pengalaman_umrah",
              "tahun_umrah",
              "desease",
              "profession_instantion_name",
              "profession_instantion_address",
              "profession_instantion_telephone",
              "status_nikah",
              "tanggal_nikah",
              "nama_keluarga",
              "alamat_keluarga",
              "telephone_keluarga",
            ],
            required: true,
            include: [
              {
                model: Member,
                attributes: [
                  "id",
                  "fullname", 
                  "gender", 
                  "photo", 
                  "birth_place", 
                  "birth_date", 
                  "whatsapp_number", 
                ],
                required: true,
              },
              {
                model: Mst_pendidikan,
                attributes: ["id", "name"], 
                required: false,
              },
              {
                model: Mst_pekerjaan,
                attributes: ["id", "name"],
                required: false,
              },
            ],
          },
          {
            model: Paket,
            attributes: ["id", "name", "departure_date", "departure_from"],
            required: false,
          },
        ],
      });
      const mstKota = dataJamaahPaket.Paket?.departure_from 
        ? await Mst_kota.findByPk(dataJamaahPaket.Paket.departure_from) 
        : null;
      const alamatInfo = dataJamaahPaket.Jamaah.kelurahan_id 
        ? await getAlamatInfo(dataJamaahPaket.Jamaah.kelurahan_id) 
        : null;
      const mahram = dataJamaahPaket.Jamaah.id
        ? await this.getMahramGroupByJamaahId(dataJamaahPaket.Jamaah.id)
        : [];

      data["nama_paket"] = dataJamaahPaket.Paket?.name ? dataJamaahPaket.Paket.name : "-";
      data["nomor_register"] = dataJamaahPaket.nomor_register ? dataJamaahPaket.nomor_register : "-";
      data["departure_date"] = dataJamaahPaket.Paket?.departure_date ? moment(dataJamaahPaket.Paket.departure_date).format("YYYY-MM-DD") : "-";
      data["departure_from"] = mstKota?.name ? mstKota.name : "-";
      data["fullname_jamaah"] = dataJamaahPaket.Jamaah.Member?.fullname ? dataJamaahPaket.Jamaah.Member.fullname : "-";
      data["photo"] = dataJamaahPaket.Jamaah.Member?.photo ? dataJamaahPaket.Jamaah.Member.photo : "-";
      data["nama_ayah"] = dataJamaahPaket.Jamaah?.nama_ayah ? dataJamaahPaket.Jamaah.nama_ayah : "-";
      data["birth_place"] = dataJamaahPaket.Jamaah.Member?.birth_place ? dataJamaahPaket.Jamaah.Member.birth_place : "-";
      data["birth_date"] = dataJamaahPaket.Jamaah.Member?.birth_date ? moment(dataJamaahPaket.Jamaah.Member.birth_date).format("YYYY-MM-DD") : "-";
      data["gender"] = dataJamaahPaket.Jamaah.Member?.gender === "laki_laki" ? 1 : 2;
      data["umur"] = dataJamaahPaket.Jamaah.Member?.birth_date ? moment().diff(moment(dataJamaahPaket.Jamaah.Member.birth_date), 'years') : "-";
      data["blood_type"] = dataJamaahPaket.Jamaah?.blood_type ? dataJamaahPaket.Jamaah.blood_type : "-";
      data["nomor_passport"] = dataJamaahPaket.Jamaah?.nomor_passport ? dataJamaahPaket.Jamaah.nomor_passport : "-";
      data["tanggal_di_keluarkan_passport"] = dataJamaahPaket.Jamaah?.tanggal_di_keluarkan_passport ? moment(dataJamaahPaket.Jamaah.tanggal_di_keluarkan_passport).format("YYYY-MM-DD") : "-";
      data["masa_berlaku_passport"] = dataJamaahPaket.Jamaah?.masa_berlaku_passport ? moment(dataJamaahPaket.Jamaah.masa_berlaku_passport).format("YYYY-MM-DD") : "-";
      data["tempat_di_keluarkan_passport"] = dataJamaahPaket.Jamaah?.tempat_di_keluarkan_passport ? dataJamaahPaket.Jamaah.tempat_di_keluarkan_passport : "-";
      data["alamat"] = dataJamaahPaket.Jamaah?.address ? dataJamaahPaket.Jamaah.address : "-";
      data["kelurahan"] = alamatInfo?.kelurahan_name ? alamatInfo.kelurahan_name : "-";
      data["kecamatan"] = alamatInfo?.kecamatan_name ? alamatInfo.kecamatan_name : "-";
      data["kabupaten"] = alamatInfo?.kabupaten_kota_name ? alamatInfo.kabupaten_kota_name : "-";
      data["provinsi"] = alamatInfo?.provinsi_name ? alamatInfo.provinsi_name : "-";
      data["kode_pos"] = dataJamaahPaket.Jamaah?.kode_pos ? dataJamaahPaket.Jamaah.kode_pos : "-";
      data["email"] = dataJamaahPaket.Jamaah?.email ? dataJamaahPaket.Jamaah.email : "-";
      data["nomor_telephone"] = dataJamaahPaket.Jamaah?.nomor_telephone ? dataJamaahPaket.Jamaah.nomor_telephone : "-";
      data["whatsapp_number"] = dataJamaahPaket.Jamaah.Member?.whatsapp_number ? dataJamaahPaket.Jamaah.Member.whatsapp_number : "-";
      data["email_jamaah"] = dataJamaahPaket.Jamaah?.email ? dataJamaahPaket.Jamaah.email : "-";
      data["pengalaman_haji"] = dataJamaahPaket.Jamaah?.pengalaman_haji === 1 ? "B" : "A";
      data["tahun_haji"] = dataJamaahPaket.Jamaah?.tahun_haji ? moment(dataJamaahPaket.Jamaah.tahun_haji).format("YYYY-MM-DD") : "-";
      data["pengalaman_umrah"] = dataJamaahPaket.Jamaah?.pengalaman_umrah === 1 ? "B" : "A";
      data["tahun_umrah"] = dataJamaahPaket.Jamaah?.tahun_umrah ? moment(dataJamaahPaket.Jamaah.tahun_umrah).format("YYYY-MM-DD") : "-";
      data["desease"] = dataJamaahPaket.Jamaah?.desease ? dataJamaahPaket.Jamaah.desease : "-";
      data["pendidikan"] = dataJamaahPaket.Jamaah?.Mst_pendidikan?.id ? dataJamaahPaket.Jamaah.Mst_pendidikan.id : "-";
      data["pekerjaan"] = dataJamaahPaket.Jamaah?.Mst_pekerjaan?.name ? dataJamaahPaket.Jamaah.Mst_pekerjaan.name : "-";
      data["profession_instantion_name"] = dataJamaahPaket.Jamaah?.profession_instantion_name ? dataJamaahPaket.Jamaah.profession_instantion_name : "-";
      data["profession_instantion_address"] = dataJamaahPaket.Jamaah?.profession_instantion_address ? dataJamaahPaket.Jamaah.profession_instantion_address : "-";
      data["profession_instantion_telephone"] = dataJamaahPaket.Jamaah?.profession_instantion_telephone ? dataJamaahPaket.Jamaah.profession_instantion_telephone : "-";
      data["status_nikah"] =
        dataJamaahPaket.Jamaah?.status_nikah === "menikah" ? 1 :
        dataJamaahPaket.Jamaah?.status_nikah === "belum_menikah" ? 2 :
        3;
      data["mahram"] = mahram;
      data["tanggal_nikah"] = dataJamaahPaket.Jamaah?.tanggal_nikah ? moment(dataJamaahPaket.Jamaah.tanggal_nikah).format("YYYY-MM-DD") : "-";
      data["nama_keluarga"] = dataJamaahPaket.Jamaah?.nama_keluarga ? dataJamaahPaket.Jamaah.nama_keluarga : "-";
      data["alamat_keluarga"] = dataJamaahPaket.Jamaah?.alamat_keluarga ? dataJamaahPaket.Jamaah.alamat_keluarga : "-";
      data["telephone_keluarga"] = dataJamaahPaket.Jamaah?.telephone_keluarga ? dataJamaahPaket.Jamaah.telephone_keluarga : "-";
      console.log(data);
      return {
        data
      };
    } catch (error) {
      console.log("Error in getCetakDataJamaahPaket:", error);
    }
  }

  async getCetakAbsensiJamaahPaket() {
    try {
      await this.initialize();
      const paketId = this.req.params.paketId;
      const petugasIdQuery = this.req.query.petugasId;
      const userType = await tipe(this.req);

      let data = await this.header();

      const petugasId = petugasIdQuery.split("-")[1];
      const isPetugasAdmin = petugasIdQuery.startsWith("admin-");
      const isPetugasStaff = petugasIdQuery.startsWith("petugas-");

      if (isPetugasAdmin && userType === "administrator") {
        const penerima = await this.penerima();
        data["petugas"] = "Administrator " + penerima;
        data["jabatan"] = "Administrator";
      } else if (isPetugasStaff) {
        const user = await User.findByPk(petugasId, {
          include: [
            {
              model: Member,
              attributes: ["fullname"],
            },
            {
              model: Grup,
              attributes: ["name"],
            },
          ],
        });
        if (user && user.Member) {
          data["petugas"] = user.Member.fullname || "-";
          data["jabatan"] = user.Grup?.name || "Staff";
        } else {
          data["petugas"] = "Staff tidak ditemukan";
        }
      } else {
        data["petugas"] = "Petugas tidak diketahui";
      }

      // Ambil semua transaksi paket (jamaah)
      const paketTransaction = await Paket_transaction.findAll({ 
        where: { paket_id: paketId },
        attributes: ["id", "jamaah_id"],
        order: [["createdAt", "ASC"]],
        raw: true,
      });

      const jamaahIds = paketTransaction.map(t => t.jamaah_id);

      console.log(jamaahIds)
      const paket = await Paket.findByPk(paketId, {
        attributes: ["name", "kode"],
      });

      const jamaah = await Jamaah.findAll({
        where: { id: { [Op.in]: jamaahIds } },
        include: [
          {
            model: Member,
            attributes: ["fullname"],
          }
        ],
        attributes: ["id", "nomor_telephone", "address"], // dari tabel Jamaah cukup id saja
        raw: false,
      });

      data["paket"] = paket?.name || "-";
      data["kode"] = paket?.kode || "-";
      data["Jamaah"] = jamaah.map(j => ({
        id: j.id,
        fullname: j.Member?.fullname || "-",
        alamat: j.address || "-",
        nomor_telepon: j.nomor_telephone || "-",
      }));

      console.log(data);

      return { data };
    } catch (error) {
      console.error("Error in getCetakAbsensiJamaahPaket:", error);
      return { data: {}, error: true, message: error.message };
    }
  }

  async getMstFasilitas() {
    const { id } = this.req.body;

    try {
      await this.initialize();

      const paketTransaction = await Paket_transaction.findOne({ where: { id } });
      const paket = await Paket.findByPk(paketTransaction.paket_id, {
        attributes: ["facilities"],
        raw: true,
      });

      const fasilitasIds = JSON.parse(paket?.facilities || "[]").map(f => +f.id);
      if (!fasilitasIds.length) {
        return {};
      }

      const usedIds = await Handover_fasilitas_detail_paket.findAll({
        attributes: [],
        include: [
          {
            model: Handover_fasilitas_paket,
            where: { paket_transaction_id: id },
          }, 
          {
            model: Item_fasilitas,
            attributes: ["mst_fasilitas_id"],
          }, 
        ],
        // raw: true,
      }).then(rows => rows.map(r => r.Item_fasilita.mst_fasilitas_id));

      const fasilitas = await Mst_fasilitas.findAll({
        where: {
          id: {
            [Op.in]: fasilitasIds,
            ...(usedIds.length && { [Op.notIn]: usedIds }),
          },
          company_id: this.company_id,
        },
        order: [["name", "ASC"]],
        raw: true,
      });

      var listFasilitasID = [];
      await Promise.all(
        await fasilitas.map(async (e) => {
            listFasilitasID.push(e.id)
        })
      );

      const itemFasilitas = await Item_fasilitas.findAll({
        where: {
          mst_fasilitas_id : { [Op.in] : listFasilitasID },
          status: 'belum_terjual'
        },
      });

      var stokFasilitas = {};
      await Promise.all(
        await itemFasilitas.map(async (e) => {
          if(stokFasilitas[e.mst_fasilitas_id] == undefined ) {
            stokFasilitas = {...stokFasilitas,...{[e.mst_fasilitas_id] : 1 } }
          }else{
            stokFasilitas[e.mst_fasilitas_id] = stokFasilitas[e.mst_fasilitas_id] + 1;
          }
        })
      );

      return {
        data: fasilitas.map(f => ({ id: f.id, name: f.name, stok: stokFasilitas[f.id] !== undefined ? stokFasilitas[f.id] : 0 })),
        total: fasilitas.length,
      };

    } catch (error) {
      console.error("Error in getMstFasilitas:", error);
      return {};
    }
  }

  async getHandoverFasilitasById() {
    const body = this.req.body;

    try {
      await this.initialize();
      
      const handoverFasilitasPaket = await Handover_fasilitas_paket.findAll({
        where: { paket_transaction_id: body.id },
        order: [["id", "ASC"]],
        include: [
          {
            model: Handover_fasilitas_detail_paket,
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Item_fasilitas,
                required: true,
                include: {
                  model: Mst_fasilitas,
                  attributes: ["id", "name"],
                  required: true,
                },
              },
            ],
          },  
        ],
      });

      if (handoverFasilitasPaket) {
        var data = [];
        await Promise.all(
          handoverFasilitasPaket.map(
            async (hf) => {
              var det = hf.Handover_fasilitas_detail_pakets?.map(fd => ({
                id: fd?.Item_fasilita?.Mst_fasilita?.id ?? null,
                name: fd?.Item_fasilita?.Mst_fasilita?.name ?? "-"
              })) ?? [];
  
                console.log("-------Det");
                console.log(hf);
                console.log(hf.Handover_fasilitas_detail_pakets);
                console.log(det);
                console.log("-------Det");
  
              data.push({ 
                id: hf.id,
                invoice: hf.invoice,
                petugas: hf.petugas,
                penerima: hf.penerima,
                nomor_identitas_penerima: hf.nomor_identitas_penerima,
                tgl_penerima: moment(hf.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                detail: det,
              });
            }
        ));


        console.log("_________________");
        console.log(data);
        console.log("_________________");

        return {
          data : data,
          total: handoverFasilitasPaket.length,
        };
      }
      
    } catch (error) {
      console.log("Error in getHandoverFasilitasById:", error);
      return {};
    }
  }

  async getInfoPengembalianHandoverBarangPaket() {
    await this.initialize();
    const body = this.req.body;

    try {
      var data = []
      const handoverBarang = await Handover_barang_paket.findAll({
        where: { paket_transaction_id: body.id },
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "paket_transaction_id",
          "jamaah_id",
          "invoice_handover",
          "invoice_returned",
          "nama_barang",
          "status",
          "giver_handover",
          "receiver_handover",
          "giver_returned",
          "receiver_returned",
          "date_taken",
          "date_returned",
          "createdAt",
          "updatedAt",
        ],
      })

      data = handoverBarang.map(item => ({
        id: item.id,
        nama_barang: item.nama_barang,
        giver_handover: item.giver_handover ? item.giver_handover : "-",
        receiver_handover: item.receiver_handover ? item.receiver_handover : "-",
        giver_returned: item.giver_returned ? item.giver_returned : "-",
        receiver_returned: item.receiver_returned ? item.receiver_returned : "-",
        date_taken: item.date_taken ? moment(item.date_taken).format('YYYY-MM-DD HH:mm:ss') : '-',
        date_returned: item.date_returned ? moment(item.date_returned).format('YYYY-MM-DD HH:mm:ss') : '-',
        status: item.status,
      }));

      return {data};
    } catch (error) {
      console.log("Error in getInfoPengembalianHandoverBarangPaket:", error);
      return {};
    }
  }

  async infoDaftarJamaahPaket(id) {
    try {
      const where = { id: id };

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

      console.log("========= infoDaftarJamaahPaket =========");
      console.log(data);
      console.log("========= infoDaftarJamaahPaket =========");

      return data;
    } catch (error) {
      console.log("Error in infoTabungan:", error);
      return {};
    }
  }
}

module.exports = Model_r;
