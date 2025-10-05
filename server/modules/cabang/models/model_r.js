const { Division, Mst_kota } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async getKota() {
    try {
      const kota = await Mst_kota.findAll({
        attributes: ["id", "name"],
      });

      return { success: true, data: kota };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllDivisions() {
    try {
      const company_id = await getCompanyIdByCode(this.req);
      if (!company_id) throw new Error("Company ID tidak ditemukan.");

      var data = [];
      await Division.findAll({
        where : { 
          company_id : company_id 
        },
        include : {
          required: true,
          model: Mst_kota, 
          attributes: ["name", "id"],
        }
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            data.push({ 
              id : e.id, 
              name : e.name, 
              city : e.Mst_kotum.name,
              city_id : e.Mst_kotum.id,
              pos_code: e.pos_code, 
              tanda_tangan: e.tanda_tangan,
              address: e.address,
              note: e.note
            });
          })
        );
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // sas

  async getDivisionById(id) {
    try {
      const company_id = await getCompanyIdByCode(this.req);
      if (!company_id) throw new Error("Company ID tidak ditemukan.");

      const division = await Division.findOne();

      if (!division) {
        return { success: false, error: "Division tidak ditemukan." };
      }

      return { success: true, data: division };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = Model_r;
