const {
  Op,
  Agen,
  Pembayaran_fee_agen,
  Member,
  Fee_agen,
  Level_keagenan,
  Paket_transaction,
  Paket,
  sequelize,
  Jamaah,
} = require("../../../models");
const {
  getCompanyIdByCode,
  tipe,
  getCabang,
} = require("../../../helper/companyHelper");
const { convertToRP } = require("../../../helper/currencyHelper");
const { where } = require("sequelize");

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

  async daftar_fee_all() {

    await this.initialize();
    
    const body = this.req.body;

    const limit = parseInt(body.perpage) || 10;
    const page = parseInt(body.pageNumber) || 1;
    const offset = (page - 1) * limit;

    const search = body.search;

    console.log("xxxxxxxxxxxxxxxxxxxxxxxxx");
    console.log(body);
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxx");

    let whereMember = {};

    if (body.cabang) {
      whereMember = {
        ...whereMember,
        division_id: body.cabang,
      };
    }

    if (search && search !== "") {
      whereFee["$Agen.Member.fullname$"] = {
        [Op.like]: `%${search}%`,
      };
    }

    try {
      const result = await Fee_agen.findAll({
        where: { 
          company_id : this.company_id
        }, 
        include: [
          {
            model: Agen,
            required: true,
            include: [
              {
                model: Level_keagenan, 
                required: true,
                attributes: ['name']
              }, 
              {
                model: Member,
                required: true,
                attributes: ["fullname", "identity_number", "whatsapp_number", "gender", "identity_type"],
                where: {
                  ...(search && search !== ""
                    ? {
                        [Op.or]: [
                          { fullname: { [Op.like]: `%${search}%` } },
                          { identity_number: { [Op.like]: `%${search}%` } },
                          { whatsapp_number: { [Op.like]: `%${search}%` } },
                        ],
                      }
                    : {}),
                  ...whereMember,
                },
              },
            ],
          },
          {
            model: Paket_transaction,
            required: true,
            include: [
              {
                model: Paket,
                attributes: ["id", "name", "kode"],
                required: true,
              },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      // 🔁 Grup data per agen
      const grouped = {};

      for (const item of result) {
        const agenId = item?.Agen?.id;
        if (!grouped[agenId]) {
          grouped[agenId] = {
            agen_id: agenId,
            member_fullname: item?.Agen?.Member?.fullname,
            member_identity_number: item?.Agen?.Member?.identity_number,
            member_identity_type:item?.Agen?.Member?.identity_type,
            member_whatsapp_number: item?.Agen?.Member?.whatsapp_number,
            member_gender: item?.Agen?.Member?.gender,
            member_level_keagenan: item?.Agen?.Level_keagenan?.name, 
            total_fee_lunas: 0,
            total_fee_belum_lunas: 0,
            jumlah_transaksi: 0,
          };
        }

        // Hitung berdasarkan status
        if (item.status_bayar === "lunas") {
          grouped[agenId].total_fee_lunas += Number(item.nominal);
        } else {
          grouped[agenId].total_fee_belum_lunas += Number(item.nominal);
        }

        grouped[agenId].jumlah_transaksi += 1;
      }

      const allData = Object.values(grouped);

      // Manual paginasi
      const paginated = allData.slice(offset, offset + limit);

      return {
        total: allData.length,
        data: paginated,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return {
        total: 0,
        data: [],
        error: "Gagal ambil data",
      };
    }
  }

  async fee_agen_by_id() {
    await this.initialize();
    const body = this.req.body;
    const division_id = this.division;

    console.log("agen id:", body.agen_id);

    try {
      const sql = await Paket_transaction.findAll({
        where: { division_id },
        include: [
          {
            model: Fee_agen, // relasi langsung ke transaksi
            where: { agen_id: body.agen_id },
            attributes: ["nominal", "status_bayar", "id"],
          },
          {
            model: Jamaah,
            include: [
              {
                model: Member,
                attributes: ["fullname", "identity_number"],
              },
              {
                model: Agen,
                where: { id: body.agen_id },
                include: [
                  {
                    model: Member,
                    attributes: ["fullname", "whatsapp_number"],
                  },
                  {
                    model: Level_keagenan,
                    attributes: ["name"],
                  },
                ],
              },
            ],
          },
          {
            model: Paket,
            attributes: ["id", "name", "kode"],
          },
        ],
      });

      const hasil = sql
        .filter((t) => t.Jamaah?.Agen) // pastikan cuma yg punya agen (biar sesuai filter)
        .map((transaksi) => {
          const paket = transaksi.Paket;
          const jamaah = transaksi.Jamaah;
          const agen = jamaah?.Agen;
          const fee = transaksi.Fee_agen;

          console.log("fee_agen:", transaksi.Fee_agen);

          return {
            paket_transaction_id: transaksi.id,
            kode_paket: paket?.kode || "",
            nama_paket: paket?.name || "",

            nama_agen: agen?.Member?.fullname ?? "-",
            no_wa_agen: agen?.Member?.whatsapp_number ?? "-",
            level_agen: agen?.Level_keagenan?.name ?? "-",

            nama_jamaah: jamaah?.Member?.fullname ?? "-",
            no_identitas_jamaah: jamaah?.Member?.identity_number ?? "-",

            // 👉 Tambahin ini
            id_fee_agen: fee?.id ?? null,

            nominal_fee: fee?.nominal || 0,
            status_bayar: fee?.status_bayar || false,
          };
        });

      console.log("hasil:", hasil);
      return hasil;
    } catch (error) {
      console.error("Error di fee_agen_by_id:", error);
      throw error;
    }
  }

  // async fee_agen_by_id() {
  //   await this.initialize();
  //   const body = this.req.body;
  //   try {
  //     const sql = await Fee_agen.findAll({
  //       where: {
  //         agen_id: body.agen_id,
  //         company_id: this.company_id,
  //         status_bayar: "belum_lunas",
  //       },
  //     });

  //     if (!sql || sql.length === 0) return [];

  //     const data = await Promise.all(
  //       sql.map(async (item) => {
  //         return {
  //           id: item.id,
  //           nominal: await convertToRP(item.nominal),
  //           status: item.status,
  //           info: item.info,
  //         };
  //       })
  //     );

  //     return data;
  //   } catch (error) {
  //     console.error("Error di fee_agen_by_id:", error);
  //     throw error;
  //   }
  // }
}

module.exports = Model_r;
