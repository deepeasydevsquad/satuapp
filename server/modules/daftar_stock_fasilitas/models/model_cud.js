const { sequelize, Item_fasilitas, Mst_fasilitas, Jurnal, Saldo_akun, Mst_bank } = require("../../../models");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode, getCabang } = require("../../../helper/companyHelper");
const { generate_item_code } = require("../../../helper/randomHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.division_id = null;
    this.t = null;
    this.state = true;
    this.message = "";
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
  }

  async tambah_stok() {
    await this.initialize();
    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    try {
      const division_id = body.cabang;
      const sumber_dana = body.sumber_dana;
      const jumlah = parseInt(body.jumlah || 1);
      const items = [];

      for (let i = 0; i < jumlah; i++) {
        const item_code = await generate_item_code();
        items.push({
          division_id: division_id,
          item_code,
          mst_fasilitas_id: body.mst_fasilitas_id,
          status: "belum_terjual",
          harga_beli: body.harga_beli,
          harga_jual: body.harga_jual,
          createdAt: myDate,
          updatedAt: myDate,
        });
      }

      // ⛳ bulk insert pakai transaction
      await Item_fasilitas.bulkCreate(items, { transaction: this.t });

      // get info mst 
      const q = await Mst_fasilitas.findOne({ where: { id: body.mst_fasilitas_id, company_id: this.company_id } });
      const debet_akun = q.nomor_akun_aset;
      // akun kredit
      var kredit_akun = '';
      if(sumber_dana == '0') {
        kredit_akun = '11010';
      }else{
        const qB = await Mst_bank.findOne({ where: { id: body.sumber_dana, company_id: this.company_id } });
        kredit_akun = qB.nomor_akun;
      }

      // Insert Jurnal
      await Jurnal.create(
        {
          division_id: division_id, 
          source: '',
          ref: 'Menambah stok fasilitas',
          ket: 'Menambah stok fasilitas',
          akun_debet: debet_akun,
          akun_kredit: kredit_akun,
          saldo: body.harga_beli * jumlah,
          removable: 'false',
          periode_id: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      this.message = `Menambahkan ${jumlah} stok fasilitas baru`;
    } catch (error) {
      console.error("Error tambah stok:", error);
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, { msg: this.message });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
