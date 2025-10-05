"use strict";
const {
  Op,
  Company,
  Division,
  Bus,
  Bus_jamaah,
  Paket_transaction,
  Jamaah,
  Member,
  Mst_kota,
  Agen,
  Paket
} = require("../../../models");
const { getCompanyIdByCode, getDivisionId } = require("../../../helper/companyHelper");
const { dbList } = require("../../../helper/dbHelper");

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

  // async getAllAvailableJamaah() {
  //   await this.initialize();
  //   try {
  //     const assignedTransactions = await Bus_jamaah.findAll({
  //       attributes: ["paket_transaction_id"],
  //     });
  //     const assignedTransactionIds = assignedTransactions.map(
  //       (item) => item.paket_transaction_id
  //     );

  //     const availableTransactions = await Paket_transaction.findAll({
  //       where: {
  //         id: { [Op.notIn]: assignedTransactionIds },
  //       },
  //       include: [
  //         {
  //           model: Jamaah,
  //           required: true,
  //           include: [{ model: Member, required: true }],
  //         },
  //       ],
  //     });

  //     return availableTransactions.map((t) => ({
  //       id: t.id,
  //       fullname: t.Jamaah.Member.fullname,
  //       identity_number: t.Jamaah.Member.identity_number,
  //     }));
  //   } catch (error) {
  //     console.error("Error di getAllAvailableJamaah:", error);
  //     throw error;
  //   }
  // }

  
  async getAllAvailableJamaah() {
    await this.initialize();

    try {
      var listJamaahHaveBus = [];
      var where = {};
      if(this.req.body.id) {
        where = {...where,...{ bus_id: { [Op.ne]: this.req.body.id}}};
      }

      const q = await Bus_jamaah.findAndCountAll({
        where: where,
        include : {
          required: true, 
          model: Paket_transaction,
          where: { paket_id : this.req.body.paket_id }
        }
      });

      await Promise.all(
        await q.rows.map(async (e) => {
          listJamaahHaveBus.push(e.paket_transaction_id);
        })
      );

      const q2 = await Paket_transaction.findAndCountAll({
        where: {
          division_id: this.division_id,
          paket_id : this.req.body.paket_id,
          id: { 
            [Op.notIn] : listJamaahHaveBus
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

  async bus_paket() {
    await this.initialize();

    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined && body.pageNumber !== "0")
      page = body.pageNumber;

    var where = { company_id: this.company_id };

    try {
      const status = (await Paket.findOne({
        where: { id: body.paketId },
        include: [{
          required: true,
          model: Division,
          where: { company_id: this.company_id }
        }]
      }))?.tutup_paket ?? 'tutup';

      let busIds = [];
      if (body.search !== undefined && body.search !== "") {
        const searchTerm = body.search.toLowerCase();

        const buses = await Bus.findAll({
          where: {
            [Op.or]: [
              { bus_number: { [Op.like]: `%${searchTerm}%` } },
              { bus_leader: { [Op.like]: `%${searchTerm}%` } },
            ],
            company_id: this.company_id,
          },
          attributes: ["id"],
        });

        busIds = buses.map((bus) => bus.id);

        if (busIds.length === 0) {
          where.id = { [Op.in]: [-1] };
        } else {
          where.id = { [Op.in]: busIds };
        }
      }

      var sql = {};
      sql["limit"] = limit * 1;
      sql["offset"] = (page - 1) * limit;
      sql["order"] = [["id", "ASC"]];
      sql["attributes"] = [
        "id",
        "bus_number",
        "kapasitas_bus",
        "bus_leader",
        "city_id",
      ];
      sql["where"] = where;

      const query = await dbList(sql);
      const q = await Bus.findAndCountAll(query.total);
      const total = q.count;
      var data = [];

      if (total > 0) {
        await Bus.findAll(query.sql).then(async (value) => {
          await Promise.all(
            await value.map(async (bus) => {
              let cityName = "N/A";

              const city = await Mst_kota.findOne({
                where: { id: bus.city_id },
              });
              if (city) {
                cityName = city.name;
              }

              const busJamaahs = await Bus_jamaah.findAll({
                where: { bus_id: bus.id },
                include: [
                  {
                    model: Paket_transaction,
                    include: [
                      {
                        model: Jamaah,
                        include: [{ model: Member }],
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

              const daftar_jamaah_murni = [];
              for (const kj of busJamaahs) {
                if ( kj.Paket_transaction && kj.Paket_transaction.Jamaah && kj.Paket_transaction.Jamaah.Member ) {
                  const memberId = kj.Paket_transaction.Jamaah.Member.id;
                  const isAgent = await Agen.findOne({
                    where: { member_id: memberId },
                  });
                  if (!isAgent) {
                    daftar_jamaah_murni.push({
                      nama: kj.Paket_transaction.Jamaah.Member.fullname,
                      no_identity:
                        kj.Paket_transaction.Jamaah.Member.identity_number,
                      tipe_paket: "Normal",
                    });
                  }
                }
              }

              data.push({
                id: bus.id,
                bus_number: bus.bus_number,
                kapasitas_bus: bus.kapasitas_bus,
                bus_leader: bus.bus_leader,
                daftar_jamaah: daftar_jamaah_murni,
                nama_kota: cityName,
              });
            })
          );
        });
      }

      return {
        data: data,
        total: total,
        status
      };
    } catch (error) {
      console.error("Error di bus_paket:", error);
      return { data: [], total: 0 };
    }
  }

  async getAllCities() {
    await this.initialize();

    try {
      const cities = await Mst_kota.findAll({
        attributes: ["id", "name", "kode"],
        where: {
          company_id: this.company_id,
        },
        order: [["name", "ASC"]],

        raw: true,
      });

      return cities;
    } catch (error) {
      console.error("Error di Model_r saat mengambil getAllCities:", error);
      throw error;
    }
  }

  async getAllJamaahForEdit(currentBusId = null) {
    await this.initialize();
    try {
      let assignedToOtherBuses = [];

      if (currentBusId) {
        const assignedTransactions = await Bus_jamaah.findAll({
          where: {
            bus_id: { [Op.ne]: currentBusId },
          },
          attributes: ["paket_transaction_id"],
        });
        assignedToOtherBuses = assignedTransactions.map(
          (item) => item.paket_transaction_id
        );
      } else {
        const assignedTransactions = await Bus_jamaah.findAll({
          attributes: ["paket_transaction_id"],
        });
        assignedToOtherBuses = assignedTransactions.map(
          (item) => item.paket_transaction_id
        );
      }

      let currentBusJamaah = [];
      if (currentBusId) {
        const currentAssignments = await Bus_jamaah.findAll({
          where: { bus_id: currentBusId },
          attributes: ["paket_transaction_id"],
        });
        currentBusJamaah = currentAssignments.map(
          (item) => item.paket_transaction_id
        );
      }

      const availableTransactionIds = [...currentBusJamaah];

      const unassignedTransactions = await Paket_transaction.findAll({
        where: {
          id: { [Op.notIn]: assignedToOtherBuses },
        },
        attributes: ["id"],
      });

      availableTransactionIds.push(...unassignedTransactions.map((t) => t.id));

      const availableTransactions = await Paket_transaction.findAll({
        where: {
          id: { [Op.in]: availableTransactionIds },
        },
        include: [
          {
            model: Jamaah,
            required: true,
            include: [{ model: Member, required: true }],
          },
        ],
      });

      return availableTransactions.map((t) => ({
        id: t.id,
        fullname: t.Jamaah.Member.fullname,
        identity_number: t.Jamaah.Member.identity_number,
      }));
    } catch (error) {
      console.error("Error di getAllJamaahForEdit:", error);
      throw error;
    }
  }

  async get_bus_by_id(id) {
    await this.initialize();
    try {
      const bus = await Bus.findByPk(id, {
        include: [
          {
            model: Bus_jamaah,
            include: [{ model: Paket_transaction }],
          },
        ],
      });
      if (!bus) throw new Error("Bus tidak ditemukan");

      const formattedData = {
        id: bus.id,
        city_id: bus.city_id,
        bus_number: bus.bus_number,
        kapasitas_bus: bus.kapasitas_bus,
        bus_leader: bus.bus_leader,
        jamaah_ids: bus.Bus_jamaahs.map((kj) => ({
          id: kj.Paket_transaction.id,
        })),
      };
      return formattedData;
    } catch (error) {
      console.error("Error di get_bus_by_id:", error);
      throw error;
    }
  }
}

module.exports = model_r;
