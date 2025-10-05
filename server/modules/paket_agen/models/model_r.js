const {
  Op,
  Agen,
  Pembayaran_fee_agen,
  Member,
  Fee_agen,
  Level_keagenan,
  sequelize,
  Jamaah,
  Paket_transaction,
  Paket, 
  Division
} = require("../../../models");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");
const { convertToRP } = require("../../../helper/currencyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.type;
    this.division;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.type = await tipe(this.req);
    this.division = await getCabang(this.req);
  }

  async daftar_detail_agen_by_paket(req, res) {
    await this.initialize();

    const paket_id = this.req.body.paket_id;
    const division_id = this.division;
    var data = {};

    try {
      const status = (await Paket.findOne({
        where: { id: paket_id },
        include: [{
          required: true,
          model: Division,
          where: { company_id: this.company_id }
        }]
      }))?.tutup_paket ?? 'tutup';

      const q = await Paket_transaction.findAndCountAll({
        where: {
          paket_id,
          division_id,
        },
        include: [
          {
            required: true,
            model: Jamaah,
            include: [
              {
                required: true,
                model: Agen,
                include: [
                  {
                    model: Member,
                    attributes: ["fullname", "whatsapp_number"],
                  },
                  {
                    model: Level_keagenan,
                    attributes: ["name"],
                  },
                  {
                    model: Fee_agen,
                    attributes: ["nominal", "status_bayar"],
                  },
                  {
                    model: Jamaah,
                    include: {
                      model: Member,
                      attributes: ["fullname", "identity_number"],
                    },
                  },
                ],
              },
              {
                required: true,
                model: Member,
              },
            ],
          },
          {
            required: true, 
            model: Paket,  
            attributes: ['tutup_paket']
          }
        ]
      });
      var list_agen_id = [];
      await Promise.all(
        await q.rows.map(async (e) => {
          if (data[e.Jamaah.agen_id] == undefined) {
            data = {
              ...data,
              ...{
                [e.Jamaah.agen_id]: {
                  agen_id: e.Jamaah.agen_id,
                  nama_agen: e.Jamaah.Agen.Member?.fullname || null,
                  whatsapp_number:
                    e.Jamaah.Agen.Member?.whatsapp_number || null,
                  level_keagenan: e.Jamaah.Agen.Level_keagenan?.name || null,
                  total_belum_lunas: 0,
                  total_lunas: 0,
                  rekrutans: [
                    {
                      id: e.Jamaah.id,
                      fullname: e.Jamaah.Member?.fullname || null,
                      identity_number: e.Jamaah.Member?.identity_number || null,
                    },
                  ],
                },
              },
            };
            list_agen_id.push(e.Jamaah.agen_id);
          } else {
            data[e.Jamaah.agen_id].rekrutans.push({
              id: e.Jamaah.id,
              fullname: e.Jamaah.Member?.fullname || null,
              identity_number: e.Jamaah.Member?.identity_number || null,
            });
          }
        })
      );

      const q2 = await Fee_agen.findAndCountAll({
        where: {
          agen_id: { [Op.in]: list_agen_id },
        },
      });
      var feeAgen = {};
      await Promise.all(
        await q2.rows.map(async (e) => {
          if (feeAgen[e.agen_id] === undefined) {
            feeAgen = {
              ...feeAgen,
              ...{
                [e.agen_id]: {
                  total_belum_lunas:
                    e.status_bayar == "belum_lunas" ? e.nominal : 0,
                  total_lunas: e.status_bayar == "lunas" ? e.nominal : 0,
                },
              },
            };
          } else {
            feeAgen[e.agen_id].total_belum_lunas +=
              e.status_bayar == "belum_lunas" ? e.nominal : 0;
            feeAgen[e.agen_id].total_lunas +=
              e.status_bayar == "lunas" ? e.nominal : 0;
          }
        })
      );

      for (let x in data) {
        if (feeAgen[x] !== undefined) {
          data[x].total_belum_lunas = feeAgen[x].total_belum_lunas;
          data[x].total_lunas = feeAgen[x].total_lunas;
        }
      }

      return {
        status: true,
        status_tutup: status,
        message: "Berhasil ambil data agen dari paket & division",
        data: data,
        total: Object.keys(data).length,
      };
    } catch (error) {
      return {
        status: false,
        message: "Gagal ambil data agen dari paket & division",
        error: error.message,
      };
    }
  }
}

module.exports = Model_r;
