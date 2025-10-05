const {
  Op,
  User,
  Grup,
  Company,
  Division,
  Paket,
  Paket_price,
  Paket_transaction,
  Mst_paket_type,
  Fee_agen,
  Tabungan,
  Jamaah,
  Riwayat_tabungan,
  Agen,
  Level_keagenan,
  Member,
  Handover_fasilitas,
  Handover_fasilitas_detail,
  Handover_barang,
  Mst_fasilitas,
  Mst_kota,
  Mst_pendidikan,
  Mst_pekerjaan,
  Mst_mahram_type,
  Mahram,
  Item_fasilitas
} = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
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

  // Fungsi untuk ambil ID jamaah dari pencarian
  async getJamaahIdsFromSearch(searchTerm, division_id) {
    const jamaahIds = await Jamaah.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: [
          { '$Member.fullname$': { [Op.like]: `%${searchTerm}%` } },
          { '$Member.identity_number$': { [Op.like]: `%${searchTerm}%` } },
        ],
        division_id: division_id
      },
      include: [{ model: Member }],
      raw: true,
    });

    return jamaahIds.map((j) => j.id);
  }

  // Fungsi untuk ambil ID Paket dari pencarian
  async getPaketIdsFromSearch(searchTerm, division_id) {
    const paketIds = await Paket.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { kode: { [Op.like]: `%${searchTerm}%` } },
        ],
        division_id: division_id
      },
      raw: true,
    });

    return paketIds.map((j) => j.id);
  }

    // Mengambil data paket
  async getPaketNameById(id) {
    const paket = await Paket.findOne({ where: { id }, attributes: ["name"] });
    return paket?.name || "-";
  }

  // Mengambil data agen
  async getAgenDetailById(fee_agen_id) {
    if (!fee_agen_id) return { fullname: "-", level: "-", default_fee: "-" };

    const feeAgen = await Fee_agen.findOne({
      where: { id: fee_agen_id },
      include: [{ model: Agen, attributes: ["id"] }],
    });
    const agenId = feeAgen?.Agen?.id;

    const agen = await getAgenById(agenId);
    return {
      fullname: agen?.Member?.fullname || "-",
      level: agen?.Level_keagenan?.name || "-",
      default_fee: agen?.Level_keagenan?.default_fee || "-",
    };
  }

  // Ambil riwayat tabungan
  async getRiwayatTabungan(tabungan_id) {
    const list = await Riwayat_tabungan.findAll({
      where: { tabungan_id },
      order: [["id", "ASC"]],
    });

    return list.map((r) => ({
      id: r.id,
      invoice: r.invoice,
      nominal_tabungan: r.nominal_tabungan,
      transaksi: moment(r.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      penerima: r.penerima
    }));
  }

  // Ambil semua mst_fasilitas berdasarkan array handover_fasilitas_id
  async getMstFasilitasByHandoverIds(handoverIds) {
    if (!Array.isArray(handoverIds)) {
      handoverIds = [handoverIds];
    }
    if (handoverIds.length === 0) return [];
    const fasilitasList = await Handover_fasilitas_detail.findAll({
      // attributes: ['id', 'name'],
      attributes: [],
      where: {
        handover_fasilitas_id: { [Op.in]: handoverIds },
      },
      include: [
        {
          model: Item_fasilitas, 
          required: true,
          include: {
            model: Mst_fasilitas,
            attributes: ["id", "name"],
          }
        }
      ]
    });

    var hasil = [];
    await Promise.all(
      await fasilitasList.map(async (e) => {

        console.log("xxxxx-----xxcxxx");
        // console.log(e.Item_fasilita);
        console.log(e.Item_fasilita.Mst_fasilitas);
        console.log("xxxxx-----xxcxxx");
        hasil.push({
          id : e.Item_fasilita.Mst_fasilita.id, 
          name : e.Item_fasilita.Mst_fasilita.name
        });
      })
    );
    // Ambil hanya id dan name fasilitas
    // const fasilitas = fasilitasList
    //   .map(fd => ({ id: fd.Item_fasilitas?.Mst_fasilita?.id, name: fd.Item_fasilitas?.Mst_fasilita?.name }))
    //   .filter(f => !!f.id && !!f.name && f.name !== "-")
    //   .sort((a, b) => a.name.localeCompare(b.name));

    // const hasil = [...new Set(fasilitas.map(JSON.stringify))].map(JSON.parse);


    console.log("------Hasil Hasil Hasil");
    // console.log(fasilitas);
    console.log(hasil);
    console.log("------Hasil Hasil Hasil");

    return hasil;
  }

  // Ambil riwayat handover fasilitas
  async getRiwayatHandover(tabungan_id) {
    const handovers = await Handover_fasilitas.findAll({
      where: { tabungan_id },
      order: [["id", "ASC"]],
    });

    const handoverIds = handovers.map(h => h.id);
    const namaFasilitas = await this.getMstFasilitasByHandoverIds(handoverIds);
    return namaFasilitas;
  }

  // Check apakah totalTabungan melebihi price paket
  async isTabunganCukupUntukPaket(totalTabungan, targetPaketId) {
    if (!targetPaketId) return false;

    const paket = await Paket.findByPk(targetPaketId, {
      include: [{
        model: Paket_price,
        attributes: ["price"],
        required: true,
      }],
    });

    if (!paket || !paket.Paket_prices || paket.Paket_prices.length === 0) return false;
    const minHarga = paket.Paket_prices.reduce((min, item) => Math.min(min, item.price), Infinity);
    return totalTabungan >= minHarga;
  }

  // Fungsi utama
  async transformTabunganItem(e) {
    const member = e.Jamaah?.Member || {};
    return {
      id: e.id,
      member: {
        fullname: member.fullname || "-",
        identity_number: member.identity_number || "-",
        birth_place: member.birth_place || "-",
        birth_date: member.birth_date
          ? moment(member.birth_date).format('DD MMMM YYYY')
          : "-",
      },
      target_paket_id: e.target_paket_id,
      target_paket_name: await this.getPaketNameById(e.target_paket_id),
      total_tabungan: e.total_tabungan,
      status_paket: await this.isTabunganCukupUntukPaket(e.total_tabungan, e.target_paket_id),
      fee_agen_id: e.fee_agen_id || "-",
      agen: await this.getAgenDetailById(e.fee_agen_id),
      sisa_pembelian: e.sisa_pembelian,
      riwayat_tabungan: await this.getRiwayatTabungan(e.id),
      riwayat_handover_fasilitas: await this.getRiwayatHandover(e.id),
    };
  }

  async daftar_tabungan_umrah() {
    await this.initialize();

    const body = this.req.body;
    const pageNumber = parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";
    const filter = body.filter || "belum_beli_paket";
    const filterCabang = body.filterCabang || null;

    let where = {}
    
    if (filter === "belum_beli_paket") {
      where = { ...where, paket_transaction_id: null, batal_berangkat: "tidak" };
    } else if (filter === "sudah_beli_paket") {
      where = { ...where, paket_transaction_id: { [Op.not]: null }, batal_berangkat: "tidak" };
    } else if (filter === "batal_berangkat") {
      where = { ...where, batal_berangkat: "ya" };
    }
    
    if (filterCabang) {
      where = { ...where, division_id: filterCabang };
    } else {
      where = { ...where, division_id: this.division_id};
    }

    if (search) {
      const jamaahIds = await this.getJamaahIdsFromSearch(search, filterCabang);
      const paketIds = await this.getPaketIdsFromSearch(search, filterCabang);

      if (jamaahIds.length > 0 || paketIds.length > 0) {
        const orConditions = [];
        if (jamaahIds.length > 0) {
          orConditions.push({ jamaah_id: { [Op.in]: jamaahIds } });
        }
        if (paketIds.length > 0) {
          orConditions.push({ target_paket_id: { [Op.in]: paketIds } });
        }
        where = {
          ...where,
          [Op.or]: orConditions,
        };
      } else {
        where = {
          ...where,
          id: null,
        };
      }
    }

    const sql = {
      where,
      attributes: [
        "id", "target_paket_id", "total_tabungan", "paket_transaction_id", 
        "fee_agen_id", "sisa_pembelian", "createdAt", "updatedAt"
      ],
      include: [{
        model: Jamaah,
        required: true,
        include: [{
          model: Member,
          attributes: ["fullname", "identity_number", "birth_place", "birth_date"],
          required: false
        }]
      }],
      order: [["createdAt", "DESC"]],
      offset,
      limit: perpage,
    };

    try {
      const totalData = await Tabungan.count({ where });
      const dataList = await Tabungan.findAll(sql);
      const data = await Promise.all(dataList.map((item) => this.transformTabunganItem(item)));

      return {
        data,
        total: totalData,
      };
    } catch (error) {
      console.log("Error in daftar_tabungan_umrah:", error);
      return { data: [], total: 0};
    }
  }

  async getJamaahTabunganUmrah() {
    await this.initialize();
    const division_id = await this.getDivisionId();
    try {

      const jamaah = await Jamaah.findAll({
        where: {
          division_id: division_id,
        },
        attributes: ["id", "agen_id"],
        include: [{
          model: Member,
          attributes: ["fullname"],
        }],
      });

      const tabunganAktif = await Tabungan.findAll({
        where: {
          status: "active",
          division_id: division_id,
        },
        attributes: ["jamaah_id"],
        raw: true,
      });

      const jamaahAktifTabunganIds = new Set(tabunganAktif.map(t => t.jamaah_id));
      const filtered = jamaah.filter(j => !jamaahAktifTabunganIds.has(j.id));

      return {
        data: filtered.map(e => ({
          id: e.id,
          agen_id: e.agen_id,
          name: e.Member?.fullname || "-",
        })),
        total: filtered.length,
      };
    } catch (error) {
      console.error("Error in getJamaahTabunganUmrah:", error);
      return {
        data: [],
        total: 0,
      };
    }
  }
  
  async getPaketTabunganUmrah () {
    const body = this.req.body;
    const division_id = await this.getDivisionId();
    try {
      await this.initialize();
      var data = {};
      const paket = await Paket.findAll({
        where: {
          division_id: division_id,
          departure_date: {
            [Op.gt]: moment().format('YYYY-MM-DD'),
          },
        },
        attributes: ["id", "name", "departure_date", "quota_jamaah"],
        order: [["createdAt", "DESC"]],
      });

      const paketPrices = await Paket_price.findAll({
        where: {
          paket_id: {
            [Op.in]: paket.map(e => e.id),
          },
        },
        attributes: ["paket_id", "price"],
      });

      if (paket) {
        data = await Promise.all(paket.map(async e => {
          const hargaSemua = paketPrices
            .filter(p => p.paket_id === e.id)
            .reduce((total, current) => total + Number(current.price), 0);

          const countJamaahPaket = await Tabungan.count({
            where: {
              target_paket_id: e.id,
            }
          });

          const countPaketTransaction = await Paket_transaction.count({
            where: {
              paket_id: e.id,
              division_id: division_id,
            }
          });

          return {
            id: e.id,
            kuota_jamaah_tersisa: e.quota_jamaah - (countJamaahPaket || 0) - (countPaketTransaction || 0),
            name: e.name,
            price: hargaSemua,
            hari_tersisa: moment(e.departure_date).diff(moment(), 'days'),
          };
        }));
      }

      return {data, total: paket.length};

    } catch (error) {
      console.log("Error in getPaketTabunganUmrah:", error);
      return {};
    }
  }

  async getAgenById () {
    try {
      await this.initialize();
      const body = this.req.body;
      var data = {};
      const agen = await Agen.findOne({
        where: {
          id: body.id,
        },
        attributes: ["id"],
        include: [
          {
            model: Member,
            attributes: ["fullname"],
          },
          {
            model: Level_keagenan,
            attributes: ["default_fee"],
          }
        ],
      });

      if (agen) {
        data = {
          id: agen.id,
          name: agen.Member.fullname,
          default_fee: Number(agen.Level_keagenan.default_fee)
        };
      }

      return {data, total: 1};
    } catch (error) {
      console.log("Error in getAgenById:", error);
      return {};
    }
  }
  
  async getHandoverFasilitasById() {
    try {
      await this.initialize();
      const { id: tabunganId } = this.req.body;

      const value = await Handover_fasilitas.findAll({
        where: { tabungan_id: tabunganId },
        order: [["id", "ASC"]],
        include: [
          {
            model: Handover_fasilitas_detail,
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Item_fasilitas,
                required: true,
                include: [
                  {
                    model: Mst_fasilitas,
                    attributes: ["id", "name"],
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      var data = [];
      await Promise.all(
        value.map(
          async (hf) => {

            var det = hf.Handover_fasilitas_details?.map(fd => ({
              id: fd?.Item_fasilita?.Mst_fasilita?.id ?? null,
              name: fd?.Item_fasilita?.Mst_fasilita?.name ?? "-"
            })) ?? [];

              console.log("-------Det");
              console.log(hf);
              console.log(hf.Handover_fasilitas_details);
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
      )
      );

      console.log("xxxxx");
      console.log(data);
      console.log(data.length);
      console.log("xxxxx");


      return {
        data,
        total: data.length,
      };

    } catch (error) {

      console.log("^^^^^^^^^^^^^^^^^^^^^^^");
      console.log(error);
      console.log("^^^^^^^^^^^^^^^^^^^^^^^");
      console.error("Error in getHandoverFasilitasById:", error);
      return {};
    }
  }

  async getMstFasilitas() {
    try {
      await this.initialize();
      const { id: tabunganId } = this.req.body;
      // get info tabungan
      const tabungan = await Tabungan.findOne({ where: { id: this.req.body.id } });
      // mengambil semua fasilitas yang ada di mst_data
      var data  = {};
      await Mst_fasilitas.findAll({
        where: { company_id : this.company_id }
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            data = {...data,...{[e.id] : { id: e.id, name: e.name, stok: 0, } } };
          })
        );
      });
      console.log('_________________');
      console.log(data);
      console.log('_________________');
      // mengambil list fasilitas yang sudah diambil
      await Handover_fasilitas_detail.findAll({
        attributes: [],
        include: [
          {
            model: Item_fasilitas, 
            required: true,
            attributes: ['mst_fasilitas_id'], // hanya ambil kolom ini
          },
          {
            model: Handover_fasilitas,
            where: { tabungan_id: tabunganId },
          },
        ],
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            // menghapus semua data yang sudah ada
            delete data[e.Item_fasilita.mst_fasilitas_id];
          })
        );
      });

      console.log('_________________');
      console.log(data);
      console.log('_________________');
      // get stock list item fasilitas
      await Item_fasilitas.findAll({
        where: { status: 'belum_terjual', division_id: tabungan.division_id }
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            if (data[e.mst_fasilitas_id]) {
              data[e.mst_fasilitas_id].stok++;
            }
          })
        );
      });
     
      var newData = Object.values(data);

      return {
        data: newData,
        total: newData.length,
      };

    } catch (error) {
      console.log("^^^^^^^^^^^^^^^^^^^^^^^");
      console.log(error);
      console.log("^^^^^^^^^^^^^^^^^^^^^^^");
      console.error("Error in getMstFasilitas:", error);
      return {};
    }
  }

  async getPetugasTabunganUmrah() {
    try {
      await this.initialize();
      const division_id = await this.getDivisionId() || this.division_id;

      const data = [];
      const userType = await tipe(this.req);
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

  async header() {
    var data = {};
    let division = null;
    await Division.findOne({
      attributes: ["name", "pos_code", "address"], // ambil dari Division
      where: { id: this.division_id }, // pastikan ini berdasarkan division_id company
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

  async getCetakDataJamaahTabunganUmrah() {
    try {
      await this.initialize();
      const id = this.req.params.id;
      const petugasIdQuery = this.req.query.petugasId;
      var data = { ...data, ...(await this.header()) };

      const petugasId = petugasIdQuery.split("-")[1];
      const isPetugasAdmin = petugasIdQuery.startsWith("admin-");
      const isPetugasStaff = petugasIdQuery.startsWith("petugas-");

      if (isPetugasAdmin) {
        await this.penerima().then((penerima) => {
          data["petugas"] = "Administrator " + penerima;
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

      const tabungan = await Tabungan.findOne({
        where: { id },
        order: [["id", "ASC"]],
        include: [
          {
            model: Jamaah,
            attributes: [
              "id", 
              "kelurahan_id",
              "nama_ayah",
              "blood_type",
              "nomor_passport",
              "tanggal_di_keluarkan_passport",
              "tempat_di_keluarkan_passport",
              "masa_berlaku_passport",
              "kode_pos",
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
      const mstKota = tabungan.Paket?.departure_from 
        ? await Mst_kota.findByPk(tabungan.Paket.departure_from) 
        : null;
      const alamatInfo = tabungan.Jamaah.kelurahan_id 
        ? await getAlamatInfo(tabungan.Jamaah.kelurahan_id) 
        : null;
      const mahram = tabungan.Jamaah.id 
        ? await this.getMahramGroupByJamaahId(tabungan.Jamaah.id)
        : [];

      data["nama_paket"] = tabungan.Paket?.name ? tabungan.Paket.name : "-";
      data["nomor_register"] = tabungan.nomor_register ? tabungan.nomor_register : "-";
      data["departure_date"] = tabungan.Paket?.departure_date ? moment(tabungan.Paket.departure_date).format("YYYY-MM-DD") : "-";
      data["departure_from"] = mstKota?.name ? mstKota.name : "-";
      data["fullname_jamaah"] = tabungan.Jamaah.Member?.fullname ? tabungan.Jamaah.Member.fullname : "-";
      data["photo"] = tabungan.Jamaah.Member?.photo ? tabungan.Jamaah.Member.photo : "-";
      data["nama_ayah"] = tabungan.Jamaah?.nama_ayah ? tabungan.Jamaah.nama_ayah : "-";
      data["birth_place"] = tabungan.Jamaah.Member?.birth_place ? tabungan.Jamaah.Member.birth_place : "-";
      data["birth_date"] = tabungan.Jamaah.Member?.birth_date ? moment(tabungan.Jamaah.Member.birth_date).format("YYYY-MM-DD") : "-";
      data["gender"] = tabungan.Jamaah.Member?.gender === "laki_laki" ? 1 : 2;
      data["umur"] = tabungan.Jamaah.Member?.birth_date ? moment().diff(moment(tabungan.Jamaah.Member.birth_date), 'years') : "-";
      data["blood_type"] = tabungan.Jamaah?.blood_type ? tabungan.Jamaah.blood_type : "-";
      data["nomor_passport"] = tabungan.Jamaah?.nomor_passport ? tabungan.Jamaah.nomor_passport : "-";
      data["tanggal_di_keluarkan_passport"] = tabungan.Jamaah?.tanggal_di_keluarkan_passport ? moment(tabungan.Jamaah.tanggal_di_keluarkan_passport).format("YYYY-MM-DD") : "-";
      data["masa_berlaku_passport"] = tabungan.Jamaah?.masa_berlaku_passport ? moment(tabungan.Jamaah.masa_berlaku_passport).format("YYYY-MM-DD") : "-";
      data["tempat_di_keluarkan_passport"] = tabungan.Jamaah?.tempat_di_keluarkan_passport ? tabungan.Jamaah.tempat_di_keluarkan_passport : "-";
      data["alamat"] = tabungan.Jamaah?.alamat ? tabungan.Jamaah.alamat : "-";
      data["kelurahan"] = alamatInfo?.kelurahan_name ? alamatInfo.kelurahan_name : "-";
      data["kecamatan"] = alamatInfo?.kecamatan_name ? alamatInfo.kecamatan_name : "-";
      data["kabupaten"] = alamatInfo?.kabupaten_kota_name ? alamatInfo.kabupaten_kota_name : "-";
      data["provinsi"] = alamatInfo?.provinsi_name ? alamatInfo.provinsi_name : "-";
      data["kode_pos"] = tabungan.Jamaah?.kode_pos ? tabungan.Jamaah.kode_pos : "-";
      data["nomor_telephone"] = tabungan.Jamaah?.nomor_telephone ? tabungan.Jamaah.nomor_telephone : "-";
      data["whatsapp_number"] = tabungan.Jamaah.Member?.whatsapp_number ? tabungan.Jamaah.Member.whatsapp_number : "-";
      data["email_jamaah"] = tabungan.Jamaah?.email ? tabungan.Jamaah.email : "-";
      data["pengalaman_haji"] = tabungan.Jamaah?.pengalaman_haji === 1 ? "B" : "A";
      data["tahun_haji"] = tabungan.Jamaah?.tahun_haji ? moment(tabungan.Jamaah.tahun_haji).format("YYYY-MM-DD") : "-";
      data["pengalaman_umrah"] = tabungan.Jamaah?.pengalaman_umrah === 1 ? "B" : "A";
      data["tahun_umrah"] = tabungan.Jamaah?.tahun_umrah ? moment(tabungan.Jamaah.tahun_umrah).format("YYYY-MM-DD") : "-";
      data["desease"] = tabungan.Jamaah?.desease ? tabungan.Jamaah.desease : "-";
      data["pendidikan"] = tabungan.Jamaah?.Mst_pendidikan?.id ? tabungan.Jamaah.Mst_pendidikan.id : "-";
      data["pekerjaan"] = tabungan.Jamaah?.Mst_pekerjaan?.name ? tabungan.Jamaah.Mst_pekerjaan.name : "-";
      data["profession_instantion_name"] = tabungan.Jamaah?.profession_instantion_name ? tabungan.Jamaah.profession_instantion_name : "-";
      data["profession_instantion_address"] = tabungan.Jamaah?.profession_instantion_address ? tabungan.Jamaah.profession_instantion_address : "-";
      data["profession_instantion_telephone"] = tabungan.Jamaah?.profession_instantion_telephone ? tabungan.Jamaah.profession_instantion_telephone : "-";
      data["status_nikah"] =
        tabungan.Jamaah?.status_nikah === "menikah" ? 1 :
        tabungan.Jamaah?.status_nikah === "belum_menikah" ? 2 :
        3;
      data["mahram"] = mahram;
      data["tanggal_nikah"] = tabungan.Jamaah?.tanggal_nikah ? moment(tabungan.Jamaah.tanggal_nikah).format("YYYY-MM-DD") : "-";
      data["nama_keluarga"] = tabungan.Jamaah?.nama_keluarga ? tabungan.Jamaah.nama_keluarga : "-";
      data["alamat_keluarga"] = tabungan.Jamaah?.alamat_keluarga ? tabungan.Jamaah.alamat_keluarga : "-";
      data["telephone_keluarga"] = tabungan.Jamaah?.telephone_keluarga ? tabungan.Jamaah.telephone_keluarga : "-";

      return {
        data,
        total: 1
      };
    } catch (error) {
      console.log("Error in getCetakDataJamaahTabunganUmrah:", error);
      return { data: [], total: 0 };
    }
  }

    // ==== GET INFO UPDATE TABUNGAN ====
  async getInfoUpdateTabunganUmrah() {
    await this.initialize();
    const body = this.req.body;

    try {
      // call object
      var data = {};
      const infoTabungan = await this.infoTabungan(body.id);
      const infoPaket = infoTabungan.target_paket_id
        ? await Paket.findByPk(infoTabungan.target_paket_id, {
            attributes: ["quota_jamaah"],
          })
        : { quota_jamaah: "-" };

      const countJamaahPaket = infoTabungan.target_paket_id
        ? await Tabungan.count({
            where: {
              target_paket_id: infoTabungan.target_paket_id,
            },
          })
        : "-";

      data.id = infoTabungan.id;
      data.kuota_jamaah_tersisa = (infoPaket.quota_jamaah - countJamaahPaket) || "-";
      data.total_tabungan = infoTabungan.total_tabungan;
      data.target_paket_id = infoTabungan.target_paket_id;
      data.member = infoTabungan.jamaah ? {
        fullname: infoTabungan.jamaah.fullname,
        identity_number: infoTabungan.jamaah.identity_number,
        birth_place: infoTabungan.jamaah.birth_place,
        birth_date: infoTabungan.jamaah.birth_date
          ? moment(infoTabungan.jamaah.birth_date).format('YYYY-MM-DD')
          : "-"
      } : {};

      return {data, total: data.length};
    } catch (error) {
        console.log("error in getInfoUpdateTabunganUmrah", error);
        return {};
    }
  }

  // === GET INFO REFUNDTABUNGAN UMRAH ===
  async getInfoRefundTabunganUmrah() {
    await this.initialize();
    const body = this.req.body;

    try {
      // call object
      var data = {};
      const infoTabungan = await this.infoTabungan(body.id);
      const agen = await this.getAgenDetailById(infoTabungan.fee_agen_id);
      
      const dataTabungan = {
        id: infoTabungan.id,
        total_tabungan: Number(infoTabungan.total_tabungan) - Number(agen.default_fee),
        batal_berangkat: infoTabungan.batal_berangkat === "ya" ? true : false,
      };
      data = dataTabungan;

      return {data, total: data.length};
    } catch (error) {
        console.log("error in getInfoRefundTabunganUmrah", error);
        return {};
    }
  }

  // === GET INFO MENABUNG TABUNGAN UMRAH ===
  async getInfoMenabungTabunganUmrah() {
    await this.initialize();
    const body = this.req.body;

    try {
      // call object
      var data = {};
      const infoTabungan = await this.infoTabungan(body.id);
      
      const dataTabungan = {
        id: infoTabungan.id,
        member: {
          fullname: infoTabungan.jamaah.fullname || '-',
          identity_number: infoTabungan.jamaah.identity_number || '-',
          birth_place: infoTabungan.jamaah.birth_place || '-',
          birth_date: infoTabungan.jamaah.birth_date ? moment(infoTabungan.jamaah.birth_date).format('YYYY-MM-DD') : '-',
        },
      };
      data = dataTabungan;

      return {data, total: data.length};
    } catch (error) {
        console.log("Error in getInfoMenabungTabunganUmrah:", error);
        return {};
    }
  }    

  // === GET INFO PENGEMBALIAN HANDOVER BARANG ===
  async getInfoPengembalianHandoverBarang() {
    await this.initialize();
    const body = this.req.body;

    try {
      var data = []
      const handoverBarang = await Handover_barang.findAll({
        where: { tabungan_id: body.id },
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "tabungan_id",
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

      return {data, total: data.length};
    } catch (error) {
      console.log("Error in getInfoPengembalianHandoverBarang:", error);
      return {};
    }
  }

  // === GET INFO PAKET PEMBELIAN ===
    async getInfoPaketPembelian() {
    await this.initialize();
    const body = this.req.body;

    try {
      var data = {};
      const infoTabungan = await this.infoTabungan(body.id);
      const paket = await Paket.findByPk(infoTabungan.target_paket_id);
      const tipe_paket = await Paket_price.findAll({
        where: { paket_id: infoTabungan.target_paket_id },
        attributes: ['price'],
        include: [{
          model: Mst_paket_type,
          attributes: ['id', 'name']
        }]
      });

      data.target_paket_id = infoTabungan.target_paket_id ? infoTabungan.target_paket_id : null;
      data.kode_paket = paket ? paket.kode : '-';
      data.nama_paket = paket ? paket.name : '-';
      data.total_tabungan = Number(infoTabungan.total_tabungan) || 0;
      data.tipe_paket = tipe_paket.map(item => ({
        id: item.Mst_paket_type.id,
        name: item.Mst_paket_type.name,
        price: item.price,
      }));

      return { data, total: data.length };
    } catch (error) {
      console.log("Error in getInfoPengembalianHandoverBarang:", error);
      return {};
    }
  }

  async infoTabungan(id) {
    try {
      const tabungan = await Tabungan.findOne({
        where: { id: id },
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "target_paket_id",
          "total_tabungan",
          "jamaah_id",
          "status",
          "fee_agen_id",
          "paket_transaction_id",
          "batal_berangkat",
          "sisa_pembelian",
          "invoice_sisa_deposit",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: Jamaah,
            attributes: [
              "id",
            ],
            required: true,
            include: [
              {
                model: Member,
                attributes: [
                  "id",
                  "fullname",
                  "identity_number",
                  "birth_place",
                  "birth_date",
                ],
                required: false,
              },
            ],
          },
          {
            model: Paket,
            attributes: [
              "id",
              "mahram_fee",
            ],
            required: false,
          },
        ],
      });

      if (!tabungan) return {};

      const data = {
        id: tabungan.id,
        status: tabungan.status,
        target_paket_id: tabungan.target_paket_id,
        total_tabungan: tabungan.total_tabungan,
        jamaah_id: tabungan.jamaah_id,
        fee_agen_id: tabungan.fee_agen_id,
        batal_berangkat: tabungan.batal_berangkat,
        paket_transaction_id: tabungan.paket_transaction_id,
        sisa_pembelian: tabungan.sisa_pembelian,
        invoice_sisa_deposit: tabungan.invoice_sisa_deposit,
        createdAt: tabungan.createdAt,
        updatedAt: tabungan.updatedAt,
      };

      if (tabungan.Jamaah && tabungan.Jamaah.Member) {
        const jamaah = tabungan.Jamaah;
        data.jamaah = {
          id: jamaah.id,
          member_id: jamaah.Member.id,
          fullname: jamaah.Member.fullname,
          identity_number: jamaah.Member.identity_number,
          birth_place: jamaah.Member.birth_place,
          birth_date: jamaah.Member.birth_date,
        };
      }

      if (tabungan.Paket) {
        const paket = tabungan.Paket;
        data.paket = {
          id: paket.id,
          mahram_fee: paket.mahram_fee,
        };
      }

      return data;
    } catch (error) {
      console.log("Error in infoTabungan:", error);
      return {};
    }
  }
}

module.exports = Model_r;
