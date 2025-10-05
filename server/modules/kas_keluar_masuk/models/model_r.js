"use strict";
const fs = require("fs");
const path = require("path");

const {
  Op,
  Kas_keluar_masuk,
  Akun_secondary, 
  Jurnal, 
  Division
} = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

class model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    if (!this.company_id) {
      this.company_id = await getCompanyIdByCode(this.req);
    }
  }

  async list() {
    // inisialisasi
    await this.initialize(); 

    const body = this.req.body;
    const limit = body.perpage || 10;
    const page = body.pageNumber && body.pageNumber !== "0" ? body.pageNumber : 1;

    try {

      const list_akun = await this.get_akun_secondary_name(this.company_id);
  
      let where = {};

      // Filter berdasarkan division_id jika ada
      if (body.cabang) {
        where.division_id = body.cabang;
      }
  
      if (body.search) {
        where = {
          ...where,
          ...{ 
            invoice: { [Op.like]: `%${body.search}%` } 
          }
        };
      }

      var sql = {
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["id", "ASC"]],
        where: where,
      };

      const q = await Kas_keluar_masuk.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        var listInvoice = [];
        await Promise.all(
          await q.rows.map(async (e) => {
            data.push({
              id: e.id,
              invoice: e.invoice,
              dibayar_diterima: e.dibayar_diterima,
              petugas: e.petugas,
              status_kwitansi: e.status_kwitansi,
              tanggal_transaksi: moment(e.createdAt).format("YYYY-MM-DD HH:mm:ss"),
              details: [],
            });
            listInvoice.push(e.invoice);
          })
        );

        var listDetail = {};
        for( let x in  listInvoice ) {
          await Jurnal.findAll({
            where : { 
              source  : 'kaskeluarmasuk:invoice:' + listInvoice[x] ,
            },
          }).then(async (value) => {
            await Promise.all(
              await value.map(async (e) => {
                if( listDetail[listInvoice[x]] == undefined ) {
                  listDetail = {...listDetail,...{[listInvoice[x]] : [ { akun_debet : { name : list_akun[e.akun_debet], nomor: e.akun_debet }, akun_kredit: {name: list_akun[e.akun_kredit], nomor: e.akun_kredit}} ] }}
                }else{
                  listDetail[listInvoice[x]].push({ akun_debet : { name : list_akun[e.akun_debet], nomor: e.akun_debet }, akun_kredit: {name: list_akun[e.akun_kredit], nomor: e.akun_kredit}});
                }
              })
            );
          });
        }

        for( let x in data ) {
          if( listDetail[data[x].invoice] !== undefined) {
            data[x].details = listDetail[data[x].invoice];
          }
        }
      }

      return { data: data, total: total };
    } catch (error) {
      return {};
    }

  }

  async getAkun() {
    // initialize
    await this.initialize();

    try {

      var data = [{id: 0, name: 'Pilih Akun'}];

      await Akun_secondary.findAll({ 
        where: { company_id: this.company_id },
        order: [["akun_primary_id", "ASC"],["nomor_akun", "ASC"]],
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            data.push({
              id: e.id,
              name: '(' + e.nomor_akun + ') ' + e.nama_akun,
              akun_primary_id: e.akun_primary_id
            }); 
          })
        );
      });

      return data;
    } catch (error) {
      console.error("Error di getAkuns:", error);
      throw error;
    }
  }

  async get_akun_secondary(company_id) {
    var data = {};
    await Akun_secondary.findAll({ 
      where : { company_id : company_id }
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data[e.id] = e.nomor_akun;
        })
      );
    });
    return data;
  }

  async get_akun_secondary_name(company_id) {
    var data = {};
    await Akun_secondary.findAll({ 
      where : { company_id : company_id }
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          data[e.nomor_akun] = e.nama_akun;
        })
      );
    });
    return data;
  }

  async getInvoiceById(id, company_id) {
    var invoice = '';
    await Kas_keluar_masuk.findOne({
        where: { id: id },
        include: {
          required : true, 
          model: Division, 
          where: {
            company_id : company_id
          }
        }
    }).then(async (e) => {
        if (e) {
          invoice  = e.invoice
        }
    });
    return invoice;
  }
}

module.exports = model_r;
