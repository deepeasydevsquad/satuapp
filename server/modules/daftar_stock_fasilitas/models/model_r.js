const { Op, Mst_fasilitas, Item_fasilitas, Mst_bank, Division } = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
// const { dbList } = require("../../../helper/dbHelper");
const{ convertToRP } = require("../../../helper/currencyHelper");
const Akuntansi = require("../../../library/akuntansi");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
    this.tipe;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.tipe = await tipe(this.req);
  }

  async list() {
    await this.initialize();

    const body = this.req.body;
    const limit = body.perpage || 10;
    const page =
      body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;

    let where = { company_id: this.company_id };

    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        name: { [Op.like]: `%${body.search}%` },
      };
    }

    const sql = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
      attributes: ["id", "name", "createdAt", "updatedAt"],
      where: where,
    };

    try {
      const q = await Mst_fasilitas.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        // Map untuk menampung stok
        let terjual = {};
        let belum_terjual = {};

        var whereDiv = { company_id: this.company_id };
        if( this.tipe == 'staff') {
          whereDiv = {...whereDiv,...{id : this.division_id } };
        }

        var listDivisonTerjual = [];
        var listDivisonBelumTerjual = [];
      
        const qDiv = await Division.findAll({
          where: whereDiv,
        });
        qDiv.forEach((e) => {
          listDivisonTerjual.push({ id_cabang: e.id, nama_cabang: e.name, count: 0 });
          listDivisonBelumTerjual.push({ id_cabang: e.id, nama_cabang: e.name, count: 0 });
        })

        // Ambil semua item fasilitas + division
        const items = await Item_fasilitas.findAll({
          include: {
            required: true,
            model: Division,
            attributes: ["name"],
          },
        });

        // Hitung stok berdasarkan status
        items.forEach((e) => {
          if (e.status === "terjual") {
            if (!terjual[e.mst_fasilitas_id]) terjual[e.mst_fasilitas_id] = {};
            if (!terjual[e.mst_fasilitas_id][e.division_id]) {
              terjual[e.mst_fasilitas_id][e.division_id] = {
                name_cabang: e.Division.name,
                count: 0,
              };
            }
            terjual[e.mst_fasilitas_id][e.division_id].count++;
          }

          if (e.status === "belum_terjual") {
            if (!belum_terjual[e.mst_fasilitas_id]) belum_terjual[e.mst_fasilitas_id] = {};
            if (!belum_terjual[e.mst_fasilitas_id][e.division_id]) {
              belum_terjual[e.mst_fasilitas_id][e.division_id] = {
                name_cabang: e.Division.name,
                count: 0,
              };
            }
            belum_terjual[e.mst_fasilitas_id][e.division_id].count++;
          }
        });

        // Susun data output
        q.rows.forEach((e) => {
          // data terjual
          const tempTerjual = listDivisonTerjual.map((loop) => {
            const count = terjual?.[e.id]?.[loop.id_cabang]?.count ?? 0;
            return { nama_cabang: loop.nama_cabang, count };
          });

          // data belum terjual
          const tempBelumTerjual = listDivisonBelumTerjual.map((loop) => {
            const count = belum_terjual?.[e.id]?.[loop.id_cabang]?.count ?? 0;
            return { nama_cabang: loop.nama_cabang, count };
          });

          data.push({
            id: e.id,
            name: e.name,
            jumlah_stok: tempBelumTerjual ,
            jumlah_stok_terjual: tempTerjual,
          });
        });

      }

      return { data, total };
    } catch (error) {
      console.log("xxxxxxxx--------------------");
      console.log(error);
      console.log("xxxxxxxx--------------------");
      return { data: [], total: 0 };
    }
  }


  async sumber_dana() {
    await this.initialize();

    const akuntansi = new Akuntansi(); 
    const division = this.req.body.cabang;

    try {
      var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun('11010', this.company_id, division, '0') );

      console.log("------____------");
      console.log(saldo);
      console.log("------____------");

      var data = [{id: 0, name: 'KAS (Saldo : ' + saldo + ')'}];
      await Mst_bank.findAll({
        where: { 
          company_id: this.company_id
        }}).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            var saldo = await convertToRP( await akuntansi.saldo_masing_masing_akun(e.nomor_akun, this.company_id, division, '0') ) ;
            data.push({id: e.id, name: e.kode + ' (Saldo : ' + saldo + ') '});
          })
        );
      });


      return data;
    } catch (error) {
      console.log("xxxxxxxx--------------------");
      console.log(error);
      console.log("xxxxxxxx--------------------");
      throw new Error("Gagal mengambil sumber dana.");
    }
  }
}

module.exports = Model_r;
