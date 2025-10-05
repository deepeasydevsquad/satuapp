"use strict";
const { sequelize, Member, Company, Kas_keluar_masuk, Jurnal } = require("../../../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../../../helper/companyHelper");
const { menghasilkan_invoice_kas_keluar_masuk } = require("../../../helper/randomHelper");
const { writeLog } = require("../../../helper/writeLogHelper");
const moment = require("moment");
const Model_r_cabang = require("../../param_cabang/models/model_r");
const Model_r = require("../models/model_r");

class model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getCabang(this.req);
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async petugas() {
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

  // Tambah Akun
  async add_kas_keluar_masuk() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const model = new Model_r_cabang(this.req);
    const listDivision = await model.paramListAllCabang();

    try {
      const model_r = new Model_r(this.req);
      const listAkun = await model_r.get_akun_secondary(this.company_id);
      const division_id = body.cabang;
      const invoice = await menghasilkan_invoice_kas_keluar_masuk(listDivision);
      const petugas = await this.petugas();
      const dibayar_diterima = body.diterima_dibayar;
      const ref = body.ref;
      const keterangan = body.keterangan;
      var status_kwitansi = '';
      const kaskeluarmasuk = JSON.parse(body.kaskeluarmasuk);
      for( let x in kaskeluarmasuk ) {
        await Jurnal.create(
          {
            division_id: division_id,
            source: 'kaskeluarmasuk:invoice:' + invoice,
            ref: ref, 
            ket: keterangan,
            akun_debet: listAkun[kaskeluarmasuk[x].akun_debet],
            akun_kredit: listAkun[kaskeluarmasuk[x].akun_kredit],
            saldo: kaskeluarmasuk[x].saldo,
            removable: 'false',
            periode_id: '0',
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
        const akunDebet = listAkun[kaskeluarmasuk[x].akun_debet];
        const akunKredit = listAkun[kaskeluarmasuk[x].akun_kredit];
        if (!akunDebet || !akunKredit) {
          throw new Error("Akun debet atau kredit tidak ditemukan dalam listAkun.");
        }
        if (akunDebet.substring(0, 1) === '1') {
          status_kwitansi = 'masuk';
        } else if (akunKredit.substring(0, 1) === '1') {
          status_kwitansi = 'keluar';
        }
      }
      const insert = await Kas_keluar_masuk.create(
        {
          division_id: division_id,
          invoice: invoice,
          dibayar_diterima: dibayar_diterima, 
          petugas: petugas,
          status_kwitansi: status_kwitansi,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      this.message = `Menambahkan Kas Keluar Masuk dengan nomor invoice : ${invoice}, Petugas : ${petugas} dan ID Kas Keluar Masuk : ${insert.id}`;
      return invoice;
    } catch (error) {
      this.state = false;
      return '';
    }
  }

  // delete kas keluar masuk
  async delete () {
    await this.initialize();
    const body = this.req.body;
    try {
      const model_r = new Model_r(this.req);
      const invoice = await model_r.getInvoiceById(body.id, this.company_id);
      await Jurnal.destroy(
        {
          where: { source: 'kaskeluarmasuk:invoice:' + invoice },
        }, 
        {
          transaction: this.t,
        }
      );
      await Kas_keluar_masuk.destroy(
        {
          where: { id: body.id },
        }, 
        {
          transaction: this.t,
        }
      );
      this.message = `Menghapus Kas Keluar dengan Invoice ${invoice} (ID Kas Keluar Masuk: ${body.id})`;
    } catch (error) {
      this.state = false;
    }
  }

  async response() {
    if (this.state) {
      await writeLog(this.req, this.t, {
        msg: this.message,
      });
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

module.exports = model_cud;
