const {
  Transaction_fasilitas,
  Transaction_fasilitas_detail,
  Mst_fasilitas,
  Kostumer,
  Paket,
  sequelize,
  Tabungan,
  Item_fasilitas,
  Jamaah,
  Company,
  Users,
  Member,
  Handover_fasilitas_paket,
  Paket_transaction,
  Division
} = require("../../../models");
const moment = require("moment");
const { Op } = require("sequelize");
const { getCompanyIdByCode, tipe } = require("../../../helper/companyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.division_id;
    this.company_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
  }

  async ambil_nama_paket_bulk(ids) {
    const paketList = await Paket.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ["id", "name"],
    });

    const paketMap = {};
    paketList.forEach((paket) => {
      paketMap[paket.id] = paket.name;
    });

    return paketMap;
  }

  async daftar_transaksi_fasilitas() {
    try {
      await this.initialize();
      const body = this.req.body;
      const limit = parseInt(body.perpage) || 10;
      const page = body.pageNumber && body.pageNumber !== "0" ? parseInt(body.pageNumber) : 1;

      let where = { division_id: this.req.body.cabang };

      if (body.search) {
        where.invoice = { [Op.like]: `%${body.search}%` };
      }

      const sql = {
        limit,
        offset: (page - 1) * limit,
        order: [["updatedAt", "DESC"]],
        where,
        include: [
          {
            model: Kostumer,
            attributes: ["name"],
          },
          {
            model: Tabungan,
            required: false,
            attributes: ["id"],
            include: [
              {
                model: Jamaah,
                required: false,
                include: [
                  {
                    model: Member,
                    required: false,
                    attributes: ["fullname"],
                  },
                ],
              },
              {
                model: Paket,
                required: false,
                attributes: ["id", "name"],
              }
            ],
          },
          {
            model: Paket,
            attributes: ["id", "name"],
          },
        ],
      };

      const q = await Transaction_fasilitas.findAndCountAll(sql);
      const total = q.count;
      let data = [];

      if (total > 0) {
        const listId = [];
        const paketIds = new Set();

        // const listInvoice = q.rows.map((trx) => {
        //   if( trx.kostumer_id == null && trx.tabungan_id == null) {
        //     return trx.invoice;
        //   }
        // });
        const listInvoice = q.rows
          .filter(trx => trx.kostumer_id == null && trx.tabungan_id == null)
          .map(trx => trx.invoice);

        // mengambil nama jamaah per invoice
        var listJamaah = {};
        if( listInvoice.length > 0 ) {
          const qlistJamaah = await Handover_fasilitas_paket.findAll({
            where: { invoice: { [Op.in]: listInvoice } },
            include: [  
              {
                model: Paket_transaction,
                required: true,
                include: [
                  {
                    model: Division, 
                    required: true,
                    where: { company_id: this.company_id }
                  },
                  {
                    model: Jamaah,
                    required: true,
                    include: {
                      model: Member, 
                      required: true, 
                      attributes: ['fullname']
                    }
                  },
                ],
              },
            ],
          });

          // await Promise.all(
          //   await qlistJamaah.map(async (e) => {
          //     listJamaah = {...listJamaah,...{[e.invoice] : e.Paket_transaction.Jamaah.Member.name}}
          //   })
          // );

          qlistJamaah.forEach((e) => {
            listJamaah[e.invoice] = e.Paket_transaction.Jamaah.Member.fullname;
          });
        }


        // Mapping transaksi dasar
        data = q.rows.map((trx) => {
          listId.push(trx.id);
          if (trx.paket_id) paketIds.add(trx.paket_id);

          return {
            id: trx.id,
            invoice: trx.invoice,
            petugas: trx.petugas,
            paket_id: trx.paket_id || null,
            kostumer_name: trx.Kostumer?.name || "-",
            nama_jamaah: listJamaah[trx.invoice] !== undefined ? listJamaah[trx.invoice] : '-',
            tabungan_name: trx.Tabungan?.Jamaah?.Member?.fullname || "-",
            tanggal_transaksi: moment(trx.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            total_harga: 0,
            details: [],
          };
        });



        // Mapping nama paket
        const paketMap = await this.ambil_nama_paket_bulk([...paketIds]);

        data = data.map((trx) => ({
          ...trx,
          paket_name: trx.paket_id ? paketMap[trx.paket_id] || "-" : "-",
        }));

        // Ambil detail fasilitas
        const detailList = await Transaction_fasilitas_detail.findAll({
          where: { transaction_fasilitas_id: { [Op.in]: listId } },
          include: [  
            {
              model: Item_fasilitas,
              required: true,
              attributes: ["item_code", "status", "harga_jual"],
              include: [
                {
                  model: Mst_fasilitas,
                  required: true,
                  attributes: ["name"],
                },
              ],
            },
          ],
        });

        // Susun data detail per transaksi
        const fasilitasMap = {};
        const totalHargaMap = {};

        detailList.forEach((e) => {
          const trxId = e.transaction_fasilitas_id;
          if (!fasilitasMap[trxId]) fasilitasMap[trxId] = [];
          if (!totalHargaMap[trxId]) totalHargaMap[trxId] = 0;

          const item = e.Item_fasilita;
          const fasilitas = {
            item_code: item?.item_code || "-",
            status: item?.status || "-",
            harga: item?.harga_jual || 0,
            fasilitas_name: item?.Mst_fasilita?.name || "-",
          };

          fasilitasMap[trxId].push(fasilitas);
          totalHargaMap[trxId] += Number(fasilitas.harga) || 0;
        });

        // Gabungkan kembali ke data utama
        data = data.map((trx) => ({
          ...trx,
          details: fasilitasMap[trx.id] || [],
          total_harga: totalHargaMap[trx.id] || 0,
        }));
      }

      console.log("Total Transaksi:", total, "Halaman:", page, "Per Halaman:", limit);
      console.log("Data Transaksi:", data.length, "items");
      console.log("Data Transaksi:", JSON.stringify(data, null, 2));

      return { data, total };
    } catch (error) {
      console.error("Error in daftar_transaksi_fasilitas:", error);
      return { data: [], total: 0 };
    }
  }

  async daftar_fasilitas() {
    try {
      await this.initialize();
      const { division_id } = this.req.body;

     

        // await Riwayat_deposit_airline.findAll(query.sql).then(async (value) => {
        //   await Promise.all(
        //     await value.map(async (e) => {
        //       data.push({ 
        //         id : e.id, 
        //         invoice : e.invoice,
        //         nama_maskapai : e.Mst_airline.name,
        //         nominal_deposit : e.deposit,  
        //         tanggal_deposit : moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss")
        //       });
        //     })
        //   );
        // });

      // // Ambil fasilitas dari paket
      // const paket = await Paket.findOne({
      //   where: { id: paket_id, division_id },
      //   attributes: ["facilities"],
      // });

      // const facilitiesIds = new Set(
      //   JSON.parse(paket.facilities).map((f) => f.id)
      // );

      // if (facilitiesIds.size === 0) {
      //   return [];
      // }

      // Ambil item fasilitas yang valid
      var listJumlahFasilitas = {};
      await Item_fasilitas.findAll({
        where: {
          division_id: this.req.body.division_id,
          status: 'belum_terjual'
        },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            if( listJumlahFasilitas[e.mst_fasilitas_id] == undefined ) {
              listJumlahFasilitas = {...listJumlahFasilitas,...{[e.mst_fasilitas_id] : 1} };
            }else{
              listJumlahFasilitas[e.mst_fasilitas_id] = listJumlahFasilitas[e.mst_fasilitas_id] + 1;
            }
          })
        )
      });

      var data = [];
      await Mst_fasilitas.findAll({
        where: {
          company_id: this.company_id,
        },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            data.push({ 
              id : e.id, 
              name : e.name + ' (Stok : '+ ( listJumlahFasilitas[e.id] != undefined ? listJumlahFasilitas[e.id] : 0 ) + ')'
            });
          })
        );
      });

      return data;
    } catch (error) {
      console.error("Gagal mengambil daftar fasilitas:", error);
      return [];
    }
  }

  async daftar_kostumer() {
    try {
      await this.initialize(); // inisialisasi company_id
      const sql = await Kostumer.findAll({
        where: { company_id: this.company_id },
      });

      const data = sql.map((d) => ({
        id: d.id,
        name: d.name,
      }));
      return data;
    } catch (error) {
      console.error("Gagal ambil daftar kostumer:", error);
      return [];
    }
  }

  async daftar_paket() {
    const body = this.req.body;
    try {
      const sql = await Paket.findAll({
        where: { division_id: body.division_id },
      });

      const data = sql.map((d) => ({
        id: d.id,
        name: d.name,
      }));

      return data;
    } catch (error) {
      console.error("Gagal ambil daftar kostumer:", error);
      return [];
    }
  }
}

module.exports = Model_r;
