"use strict";
const fs = require("fs");
const path = require("path");

const {
  Op,
  Company,
  Division,
  Kamar,
  Kamar_jamaah,
  Paket_transaction,
  Jamaah,
  Member,
  Mst_kota,
  Mst_paket_type,
  Mst_hotel,
  Agen,
  Paket,
  Sequelize,
  sequelize
} = require("../../../models");
const { getCompanyIdByCode, getDivisionId, getCabang } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");

class model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
  }

  async initialize() {
    if (!this.company_id) {
      this.company_id = await getCompanyIdByCode(this.req);
    }
    if (!this.division_id) {
      this.division_id = await getDivisionId(this.req);
    }
  }

  async getAllHotels() {
    await this.initialize();
    try {
      const hotels = await Mst_hotel.findAll({
        where: { company_id: this.company_id },
        order: [["name", "ASC"]],
      });

      const formattedHotels = await Promise.all(
        hotels.map(async (hotel) => {
          let cityName = "N/A";
          if (hotel.kota_id) {
            const kota = await Mst_kota.findOne({
              where: { id: hotel.kota_id },
              attributes: ["name"],
            });
            if (kota) {
              cityName = kota.name;
            }
          }
          return {
            id: hotel.id,
            name: hotel.name,
            kota_name: cityName,
          };
        })
      );

      return formattedHotels;
    } catch (error) {
      console.error("Error di getAllHotels:", error);
      throw error;
    }
  }

  async getAllAvailableJamaah() {
    await this.initialize();

    try {
      var listJamaahHaveKamar = [];
      var where = {};
      if(this.req.body.id) {
        where = {...where,...{ kamar_id: { [Op.ne]: this.req.body.id}}};
      }

      const q = await Kamar_jamaah.findAndCountAll({
        where: where,
        include : {
          required: true, 
          model: Paket_transaction,
          where: { paket_id : this.req.body.paket_id }
        }
      });

      await Promise.all(
        await q.rows.map(async (e) => {
          listJamaahHaveKamar.push(e.paket_transaction_id);
        })
      );

      const q2 = await Paket_transaction.findAndCountAll({
        where: {
          division_id: this.division_id,
          paket_id : this.req.body.paket_id,
          id: { 
            [Op.notIn] : listJamaahHaveKamar
          }
        },
        include: [
          {
            model: Jamaah,
            required: true,
            include: [
              {
                model: Member,
                required: true,
                attributes: ["fullname", "identity_number"],
              },
            ],
          },
        ],
      });

      var data = [];
      await Promise.all(
        await q2.rows.map(async (e) => {
          data.push({
            id: e.id,
            fullname: e.Jamaah.Member.fullname,
            identity_number: e.Jamaah.Member.identity_number,
          });
        })
      );

      // const data = rows.map((t) => ({
      //   id: t.id,
      //   fullname: t.Jamaah.Member.fullname,
      //   identity_number: t.Jamaah.Member.identity_number,
      // }));
      // console.log("Datanya: ", data)
      return { data };
    } catch (error) {
      console.error("Error di getAllAvailableJamaah:", error);
      throw error;
    }
  }

  async kamar_paket() {
    await this.initialize();

    const body = this.req.body;
    const limit = parseInt(body.perpage) || 10;
    const page = parseInt(body.pageNumber) || 1;
    const offset = (page - 1) * limit;
    // var status = 'tutup';

    try {

      const status = (await Paket.findOne({
        where: { id: body.paketId },
        include: [{
          required: true,
          model: Division,
          where: { company_id: this.company_id }
        }]
      }))?.tutup_paket ?? 'tutup';

      const whereKamar = {};

      // Optional search filter untuk kamar
      if (body.search) {
        whereKamar[Op.or] = [
          { tipe_kamar: { [Op.like]: `%${body.search}%` } },
          { kapasitas_kamar: { [Op.like]: `%${body.search}%` } },
        ];
      }

      // Ambil semua kamar dengan hotel + kota
      const { rows: kamarList, count: total } = await Kamar.findAndCountAll({
        where: whereKamar,
        limit,
        offset,
        order: [["id", "ASC"]],
        include: [
          {
            model: Mst_hotel,
            attributes: ["id", "name"],
            include: [{ model: Mst_kota, attributes: ["id", "name"] }],
          },
        ],
      });

      const kamarIds = kamarList.map((k) => k.id);

      // Ambil semua Kamar_jamaah yang terkait dengan kamar tersebut
      const kamarJamaahList = await Kamar_jamaah.findAll({
        where: {
          kamar_id: { [Op.in]: kamarIds },
        },
        include: [
          {
            model: Paket_transaction,
            where: {
              division_id: this.division_id,
              paket_id: body.paketId, // filter berdasarkan paketId
            },
            required: true,
            include: [
              {
                model: Jamaah,
                required: true,
                include: [
                  {
                    model: Member,
                    required: true,
                    attributes: ["fullname", "identity_number"],
                  },
                ],
              },
              {
                model: Mst_paket_type,
                attributes: ["name"],
              },
              {
                model: Paket, 
                required: true, 
                attributes: ['tutup_paket']
              }
            ],
          },
        ],
      });

      // Kelompokkan jamaah berdasarkan kamar
      const kamarToJamaahMap = {};

      kamarJamaahList.forEach((kj) => {
        const kamarId = kj.kamar_id;
        const trans = kj.Paket_transaction;
        
        // status = trans.Paket.status;

        if (trans && trans.Jamaah && trans.Jamaah.Member) {
          const jamaah = {
            id: trans.Jamaah.id,
            fullname: trans.Jamaah.Member.fullname,
            identity_number: trans.Jamaah.Member.identity_number,
            tipe_paket: trans.Mst_paket_type?.name || "-",
          };

          if (!kamarToJamaahMap[kamarId]) kamarToJamaahMap[kamarId] = [];
          kamarToJamaahMap[kamarId].push(jamaah);
        }
      });

      // Format data akhir
      const result = kamarList.map((kamar) => ({
        id: kamar.id,
        tipe_kamar: kamar.tipe_kamar
          ?.replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .replace(/ /g, "-"),
        hotel_name: kamar.Mst_hotel?.name || "N/A",
        kapasitas_kamar: kamar.kapasitas_kamar,
        daftar_jamaah: kamarToJamaahMap[kamar.id] || [],
        nama_kota: kamar.Mst_hotel?.Mst_kotum?.name || "N/A",
      }));

      return {
        data: result,
        total,
        status
      };
    } catch (error) {


      console.log("_________________________");
      console.log(error);
      console.log("_________________________");
      console.error("Error di kamar_paket:", error);
      return { data: [], total: 0 };
    }
  }

  async getAllJamaahForEdit() {
    await this.initialize();
    const { kamar_id } = this.req.body;

    try {
      // 1. Dapatkan semua ID transaksi paket yang sudah ada di kamar LAIN.
      const jamaahInOtherRooms = await Kamar_jamaah.findAll({
        where: {
          kamar_id: {
            [Op.ne]: kamar_id, // Op.ne berarti "not equal" atau "tidak sama dengan"
          },
        },
        attributes: ['paket_transaction_id'],
        raw: true,
      });
      const jamaahIdsInOtherRooms = jamaahInOtherRooms.map(j => j.paket_transaction_id);

      // 2. Dapatkan semua jamaah yang ID transaksinya TIDAK ADA di daftar jamaahIdsInOtherRooms.
      // Ini akan mencakup jamaah di kamar saat ini + jamaah yang belum punya kamar.
      const { count, rows } = await Paket_transaction.findAndCountAll({
        where: {
          division_id: this.division_id,
          id: {
            [Op.notIn]: jamaahIdsInOtherRooms,
          },
        },
        include: [
          {
            model: Jamaah,
            required: true,
            include: [
              {
                model: Member,
                required: true,
                attributes: ['fullname', 'identity_number'],
              },
            ],
          },
        ],
        order: [[Jamaah, Member, 'fullname', 'ASC']],
      });

      const result = rows.map((t) => ({
        id: t.id,
        fullname: t.Jamaah.Member.fullname,
        identity_number: t.Jamaah.Member.identity_number,
      }));

      return {
        data: result,
        total: count,
      };
    } catch (error) {
      console.error("Error di getAllJamaahForEdit:", error);
      throw error;
    }
  }

  async get_kamar_by_id() {
    await this.initialize();
    console.log("this.req.params: ", this.req.params);
    const params = this.req.params;
    console.log("params: ", params.id);

    try {
      const kamar = await Kamar.findOne({
        where: { id: params.id , company_id: this.company_id },
        include: [
          {
            model: Kamar_jamaah,
            include: [{ model: Paket_transaction }],
          },
        ],
      });

      const formatTipeKamar = (tipe) => {
        if (!tipe) return "N/A";
        return tipe
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .replace(/ /g, "-");
      };

      const formattedData = {
        id: kamar.id,
        hotel_id: kamar.hotel_id,
        tipe_kamar: kamar.tipe_kamar,
        kapasitas_kamar: kamar.kapasitas_kamar,
        jamaah_ids: kamar.Kamar_jamaahs.map((kj) => ({
          id: kj.Paket_transaction.id,
        })),
      };
      return formattedData;
    } catch (error) {
      console.error("Error di get_kamar_by_id:", error);
      throw error;
    }
  }

  async download_daftar_kamar() {
    await this.initialize();

    try {
      console.log(
        "Memulai download_daftar_kamar untuk company_id:",
        this.company_id
      );

      let companyInfo = null;
      try {
        const division = await Division.findOne({
          attributes: ["name", "pos_code", "address"],
          where: { company_id: this.company_id },
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
              model: Mst_kota,
              attributes: ["name"],
            },
          ],
        });

        if (division) {
          let exisFile = false;
          if (division.Company && division.Company.invoice_logo) {
            const filePath = path.join(
              __dirname,
              "../../../uploads",
              division.Company.invoice_logo
            );
            if (fs.existsSync(filePath)) {
              exisFile = true;
            }
          }

          companyInfo = {
            logo: exisFile ? division.Company.invoice_logo : "default.png",
            company_name: division.Company.company_name || "-",
            city: division.Mst_kota?.name || "-",
            address: division.address || "-",
            pos_code: division.pos_code || "-",
            email: division.Company.email || "-",
            whatsapp_company_number:
              division.Company.whatsapp_company_number || "-",
          };
        } else {
          console.warn(
            "Division tidak ditemukan untuk company_id:",
            this.company_id
          );

          const company = await Company.findByPk(this.company_id, {
            attributes: [
              "company_name",
              "address",
              "email",
              "whatsapp_company_number",
              "logo",
              "invoice_logo",
            ],
          });

          if (company) {
            companyInfo = {
              logo: company.invoice_logo || company.logo || "default.png",
              company_name: company.company_name || "-",
              city: "-",
              address: company.address || "-",
              pos_code: "-",
              email: company.email || "-",
              whatsapp_company_number: company.whatsapp_company_number || "-",
            };
          }
        }
      } catch (companyError) {
        console.error("Error mengambil data company:", companyError);
      }

      const allKamars = await Kamar.findAll({
        where: { company_id: this.company_id },
        order: [["id", "ASC"]],
      });

      console.log("Jumlah kamar ditemukan:", allKamars.length);

      const roomDetails = [];

      for (const kamar of allKamars) {
        try {
          let hotel = null;
          let kota = null;

          try {
            hotel = await Mst_hotel.findOne({ where: { id: kamar.hotel_id } });
            if (hotel && hotel.kota_id) {
              kota = await Mst_kota.findOne({ where: { id: hotel.kota_id } });
            }
          } catch (hotelError) {
            console.error(
              `Error mengambil data hotel untuk kamar ${kamar.id}:`,
              hotelError
            );
          }

          const kamarJamaahs = await Kamar_jamaah.findAll({
            where: { kamar_id: kamar.id },
            include: [
              {
                model: Paket_transaction,
                include: [{ model: Jamaah, include: [{ model: Member }] }],
              },
            ],
          });

          const daftar_jamaah_murni = [];
          for (const kj of kamarJamaahs) {
            try {
              if (kj.Paket_transaction?.Jamaah?.Member) {
                const isAgent = await Agen.findOne({
                  where: { member_id: kj.Paket_transaction.Jamaah.Member.id },
                });
                if (!isAgent) {
                  daftar_jamaah_murni.push({
                    nama: kj.Paket_transaction.Jamaah.Member.fullname,
                    no_identity:
                      kj.Paket_transaction.Jamaah.Member.identity_number,
                  });
                }
              }
            } catch (jamaahError) {
              console.error(
                `Error memproses jamaah untuk kamar ${kamar.id}:`,
                jamaahError
              );
            }
          }

          const formatTipeKamar = (tipe) => {
            if (!tipe) return "N/A";
            return tipe
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
              .replace(/ /g, "-");
          };

          roomDetails.push({
            tipe_kamar: formatTipeKamar(kamar.tipe_kamar),
            hotel_name: hotel ? hotel.name : "N/A",
            nama_kota: kota ? kota.name : "N/A",
            kapasitas_kamar: kamar.kapasitas_kamar || 0,
            jamaah: daftar_jamaah_murni,
          });
        } catch (kamarError) {
          console.error(`Error memproses kamar ${kamar.id}:`, kamarError);
          roomDetails.push({
            tipe_kamar: kamar.tipe_kamar || "N/A",
            hotel_name: "N/A",
            nama_kota: "N/A",
            kapasitas_kamar: kamar.kapasitas_kamar || 0,
            jamaah: [],
          });
        }
      }

      const result = {
        company: companyInfo || {
          logo: "default.png",
          company_name: "N/A",
          city: "N/A",
          address: "N/A",
          pos_code: "N/A",
          email: "N/A",
          whatsapp_company_number: "N/A",
        },
        rooms: roomDetails,
      };

      console.log("Download data berhasil dipersiapkan:", {
        companyName: result.company.company_name,
        roomCount: result.rooms.length,
      });

      return result;
    } catch (error) {
      console.error("Error di download_daftar_kamar:", error);
      throw new Error(`Gagal mempersiapkan data download: ${error.message}`);
    }
  }
}

module.exports = model_r;
