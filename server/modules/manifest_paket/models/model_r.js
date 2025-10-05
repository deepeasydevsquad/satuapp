const {
  Op,
  Paket,
  Paket_transaction,
  Jamaah,
  Member,
  Mst_pendidikan,
  Mst_pekerjaan,
  Mst_provider,
  Mst_asuransi, 
  Division
} = require("../../../models");
const { getCompanyIdByCode, getDivisionId } = require("../../../helper/companyHelper");
const { getAlamatInfo } = require("../../../helper/alamatHelper");
const { dbList } = require("../../../helper/dbHelper");
const moment = require("moment");
const ExcelJS = require('exceljs');
  
class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.division_id;
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.division_id = await getDivisionId(this.req);
  }

  // Fungsi untuk ambil ID paket transaction dari pencarian
  async getPaketTransactionIdsFromSearch(searchTerm) {
    const paketTransactionIds = await Paket_transaction.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: [
          { '$Jamaah.Member.fullname$': { [Op.like]: `%${searchTerm}%` } },
          { '$Jamaah.Member.identity_number$': { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      include: [{ model: Jamaah, include: [Member] }],
      raw: true,
    });

    return paketTransactionIds.map((j) => j.id);
  }

  async checkKelengkapanData(jamaah) {
    const missingItems = [];

    if (!jamaah?.Member?.fullname) missingItems.push("Nama Jamaah");
    if (!jamaah?.Member?.birth_date) missingItems.push("Tanggal Lahir");
    if (!jamaah?.Member?.birth_place) missingItems.push("Tempat Lahir");
    if (!jamaah?.nomor_passport) missingItems.push("Nomor Paspor");
    if (!jamaah?.tanggal_di_keluarkan_passport) missingItems.push("Tanggal Keluar Paspor");
    if (!jamaah?.tempat_di_keluarkan_passport) missingItems.push("Tempat Keluar Paspor");
    if (!jamaah?.masa_berlaku_passport) missingItems.push("Masa Berlaku Paspor");

    const status = missingItems.length === 0 ? "KOMPLIT" : "BELUM KOMPLIT";
    return { status, missingItems };
  }

  // Fungsi utama
  async transformManifestPaket(e) {
    const jamaah = e.Jamaah ?? {};
    const jamaahMember = jamaah.Member ?? {};
    const { status, missingItems } = await this.checkKelengkapanData(jamaah);

    return {
      id: e.id,
      jamaah_id: jamaah.id,
      nama_jamaah: jamaahMember.fullname,
      birth_place: jamaahMember.birth_place,
      birth_date: jamaahMember.birth_date ? moment(jamaahMember.birth_date).format("YYYY-MM-DD") : "",
      umur: jamaahMember.birth_date ? moment().diff(moment(jamaahMember.birth_date), "years") : "-",
      whatsapp_number: jamaahMember.whatsapp_number,
      status_kelengkapan: status,
      daftar_item_belum_lengkap: missingItems,
      nama_agen: e.Agen?.Member?.fullname,
      nomor_identitas: jamaahMember.identity_number,
      tempat_tanggal_lahir: jamaahMember.birth_place && jamaahMember.birth_date
        ? `${jamaahMember.birth_place}, ${moment(jamaahMember.birth_date).format("DD MMMM YYYY")}`
        : "-",
      identity_type: jamaahMember.identity_type,
      gender: jamaahMember.gender,
      photo: jamaahMember.photo,
      nomor_passport: jamaah.nomor_passport,
      title: jamaah.title,
      nama_ayah: jamaah.nama_ayah,
      nama_passport: jamaah.nama_passport,
      tanggal_di_keluarkan_passport: jamaah.tanggal_di_keluarkan_passport,
      tempat_di_keluarkan_passport: jamaah.tempat_di_keluarkan_passport,
      masa_berlaku_passport: jamaah.masa_berlaku_passport,
      kode_pos: jamaah.kode_pos,
      nomor_telephone: jamaah.nomor_telephone,
      pengalaman_haji: jamaah.pengalaman_haji,
      tahun_haji: jamaah.tahun_haji,
      pengalaman_umrah: jamaah.pengalaman_umrah,
      tahun_umrah: jamaah.tahun_umrah,
      desease: jamaah.desease,
      last_education: jamaah.last_education,
      blood_type: jamaah.blood_type,
      photo_4_6: jamaah.photo_4_6,
      photo_3_4: jamaah.photo_3_4,
      fc_passport: jamaah.fc_passport,
      mst_pekerjaan_id: jamaah.mst_pekerjaan_id,
      profession_instantion_name: jamaah.profession_instantion_name,
      profession_instantion_address: jamaah.profession_instantion_address,
      profession_instantion_telephone: jamaah.profession_instantion_telephone,
      fc_kk: jamaah.fc_kk,
      fc_ktp: jamaah.fc_ktp,
      buku_nikah: jamaah.buku_nikah,
      akte_lahir: jamaah.akte_lahir,
      buku_kuning: jamaah.buku_kuning,
      keterangan: jamaah.keterangan,
      nama_keluarga: jamaah.nama_keluarga,
      alamat_keluarga: jamaah.alamat_keluarga,
      telephone_keluarga: jamaah.telephone_keluarga,
      status_nikah: jamaah.status_nikah,
      tanggal_nikah: jamaah.tanggal_nikah,
      kewarganegaraan: jamaah.kewarganegaraan,
    };
  }

  // Fungsi daftar manifest paket
  async daftarManifestPaket() {
    await this.initialize();

    const body = this.req.body;
    const pageNumber = typeof body.pageNumber === "undefined" || body.pageNumber === 0 ? 1 : parseInt(body.pageNumber) || 1;
    const perpage = parseInt(body.perpage) || 10;
    const offset = (pageNumber - 1) * perpage;
    const search = body.search || "";

    let where = { paket_id: body.paketId, division_id: this.division_id };
    if (search) {
      const paketTransactionIds = await this.getPaketTransactionIdsFromSearch(search);
      where = { ...where, id: { [Op.in]: paketTransactionIds } };
    }

    var sql = {}
    sql["limit"] = perpage * 1;
    sql["offset"] = offset;
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "division_id",
      "jamaah_id",
      "createdAt",
      "updatedAt"
    ];
    sql["where"] = where;
    sql["include"] = [
      {
        model: Jamaah,
        required: true,
        include: [
          {
            model: Member,
            required: true
          }
        ]
      }, 
      {
        model: Paket, 
        required: true, 
        attributes: ['tutup_paket']
      }
    ]

    try {
      const status = (await Paket.findOne({
        where: { id: body.paketId },
        include: [{
          required: true,
          model: Division,
          where: { company_id: this.company_id }
        }]
      }))?.tutup_paket ?? 'tutup';

      const query = await dbList(sql);
      const totalData = await Paket_transaction.findAndCountAll(query.total);
      const dataList = await Paket_transaction.findAll(query.sql);

      const data = await Promise.all(
        dataList.map(async (e) => {
          return await this.transformManifestPaket(e);
        })
      );

      return { 
        data: data,
        total: await totalData.count,
        status
      };    
    } catch (error) {
      console.log("Error in daftarManifestPaket:", error);
    }
  }

  async getNameFromTable(model, id) {
    const data = await model.findOne({ where: { id } });
    return data?.name;
  }

  async dataManifestExcel(data, res) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Manifest');

      // Header excel
      worksheet.columns = [
        { header: 'NO', key: 'no', width: 5 },
        { header: 'TITLE', key: 'title', width: 10 },
        { header: 'NAMA', key: 'nama', width: 25 },
        { header: 'NAMA AYAH', key: 'nama_ayah', width: 25 },
        { header: 'JENIS IDENTITAS', key: 'jenis_identitas', width: 20 },
        { header: 'NO IDENTITAS', key: 'no_identitas', width: 20 },
        { header: 'NAMA PASPOR', key: 'nama_paspor', width: 25 },
        { header: 'NO PASPOR', key: 'no_paspor', width: 20 },
        { header: 'TANGGAL DIKELUARKAN PASPOR', key: 'tanggal_dikeluarkan_paspor', width: 20 },
        { header: 'TANGGAL EXPIRED PASPOR', key: 'tanggal_expired_paspor', width: 20 },
        { header: 'KOTA PASPOR', key: 'kota_paspor', width: 20 },
        { header: 'TEMPAT LAHIR', key: 'tempat_lahir', width: 20 },
        { header: 'TANGGAL LAHIR', key: 'tanggal_lahir', width: 20 },
        { header: 'ALAMAT', key: 'alamat', width: 30 },
        { header: 'PROVINSI', key: 'provinsi', width: 20 },
        { header: 'KABUPATEN', key: 'kabupaten', width: 20 },
        { header: 'KECAMATAN', key: 'kecamatan', width: 20 },
        { header: 'KELURAHAN', key: 'kelurahan', width: 20 },
        { header: 'NO TELEPON', key: 'no_telepon', width: 20 },
        { header: 'NO HP', key: 'no_hp', width: 20 },
        { header: 'KEWARGANEGARAAN', key: 'kewarganegaraan', width: 20 },
        { header: 'STATUS PERNIKAHAN', key: 'status_pernikahan', width: 20 },
        { header: 'PENDIDIKAN', key: 'pendidikan', width: 20 },
        { header: 'PEKERJAAN', key: 'pekerjaan', width: 20 },
        { header: 'PROVIDER VISA', key: 'provider_visa', width: 20 },
        { header: 'NO VISA', key: 'no_visa', width: 20 },
        { header: 'TANGGAL BERLAKU VISA', key: 'tanggal_berlaku_visa', width: 20 },
        { header: 'TANGGAL AKHIR VISA', key: 'tanggal_akhir_visa', width: 20 },
        { header: 'ASURANSI', key: 'asuransi', width: 20 },
        { header: 'NO POLIS', key: 'no_polis', width: 20 },
        { header: 'TANGGAL INPUT POLIS', key: 'tanggal_input_polis', width: 20 },
        { header: 'TANGGAL AWAL POLIS', key: 'tanggal_awal_polis', width: 20 },
        { header: 'TANGGAL AKHIR POLIS', key: 'tanggal_akhir_polis', width: 20 },
      ];
      worksheet.getRow(1).font = { bold: true };

      data.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          title: item.title || '-',
          nama: item.nama || '-',
          nama_ayah: item.nama_ayah || '-',
          jenis_identitas: item.jenis_identitas || '-',
          no_identitas: item.no_identitas || '-',
          nama_paspor: item.nama_paspor || '-',
          no_paspor: item.no_paspor || '-',
          tanggal_dikeluarkan_paspor: item.tanggal_dikeluarkan_paspor || '-',
          tanggal_expired_paspor: item.tanggal_expired_paspor || '-',
          kota_paspor: item.kota_paspor || '-',
          tempat_lahir: item.tempat_lahir || '-',
          tanggal_lahir: item.tanggal_lahir || '-',
          alamat: item.alamat || '-',
          provinsi: item.provinsi || '-',
          kabupaten: item.kabupaten || '-',
          kecamatan: item.kecamatan || '-',
          kelurahan: item.kelurahan || '-',
          no_telepon: item.no_telepon || '-',
          no_hp: item.no_hp || '-',
          kewarganegaraan: item.kewarganegaraan || '-',
          status_pernikahan: item.status_pernikahan || '-',
          pendidikan: item.pendidikan || '-',
          pekerjaan: item.pekerjaan || '-',
          provider_visa: item.provider_visa || '-',
          no_visa: item.no_visa || '-',
          tanggal_berlaku_visa: item.tanggal_berlaku_visa || '-',
          tanggal_akhir_visa: item.tanggal_akhir_visa || '-',
          asuransi: item.asuransi || '-',
          no_polis: item.no_polis || '-',
          tanggal_input_polis: item.tanggal_input_polis || '-',
          tanggal_awal_polis: item.tanggal_awal_polis || '-',
          tanggal_akhir_polis: item.tanggal_akhir_polis || '-',
        });
      });

      // Response download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=manifest.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log('Error in dataManifestExcel: ', error);
    }
  }

  async downloadManifestPaket(res) {
    await this.initialize();
    const body = this.req.body;

    try {
      const paketTransaction = await Paket_transaction.findAll({
        where: {
          paket_id: body.paketId,
          division_id: this.division_id
        },
        include: [
          {
            model: Paket,
            required: true
          },
          {
            model: Jamaah,
            required: true,
            include: [
              {
                model: Member,
                required: true
              }
            ]
          }
        ]
      });

      const dataManifest = await Promise.all(
        paketTransaction.map(async (item) => {
          const member = item.Jamaah.Member || {};
          const jamaah = item.Jamaah;
          const paket = item.Paket;
          const alamat = await getAlamatInfo(jamaah.kelurahan_id);
          const pendidikan = await this.getNameFromTable(Mst_pendidikan, jamaah.last_education);
          const pekerjaan = await this.getNameFromTable(Mst_pekerjaan, jamaah.mst_pekerjaan_id);
          const providerVisa = await this.getNameFromTable(Mst_provider, paket.provider_visa_id);
          const asuransi = await this.getNameFromTable(Mst_asuransi, paket.asuransi_id);

          return {
            title: jamaah.title || '',
            nama: member.fullname || '',
            nama_ayah: jamaah.nama_ayah || '',
            jenis_identitas: member.identity_type || '',
            no_identitas: member.identity_number || '',
            nama_paspor: jamaah.nama_passport || '',
            no_paspor: jamaah.nomor_passport || '',
            tanggal_dikeluarkan_paspor: jamaah.tanggal_di_keluarkan_passport ? moment(jamaah.tanggal_di_keluarkan_passport).format('YYYY/MM/DD') : '',
            tanggal_expired_paspor: jamaah.masa_berlaku_passport ? moment(jamaah.masa_berlaku_passport).format('YYYY/MM/DD') : '',
            kota_paspor: jamaah.tempat_di_keluarkan_passport || '',
            tempat_lahir: member.birth_place || '',
            tanggal_lahir: member.birth_date ? moment(member.birth_date).format('YYYY/MM/DD') : '',
            alamat: member.address || '',
            provinsi: alamat.provinsi_name || '',
            kabupaten: alamat.kabupaten_kota_name || '',
            kecamatan: alamat.kecamatan_name || '',
            kelurahan: alamat.kelurahan_name || '',
            no_telepon: jamaah.nomor_telephone || '',
            no_hp: member.whatsapp_number || '',
            kewarganegaraan: jamaah.kewarganegaraan || '',
            status_pernikahan: jamaah.status_nikah === "menikah" ? "Menikah" : jamaah.status_nikah === "belum_menikah" ? "Belum Menikah" : "Janda",
            pendidikan: pendidikan || '',
            pekerjaan: pekerjaan || '',
            provider_visa: providerVisa || '',
            no_visa: item.nomor_visa || '',
            tanggal_berlaku_visa: item.tanggal_berlaku_visa ? moment(item.tanggal_berlaku_visa).format('YYYY/MM/DD') : '',
            tanggal_akhir_visa: item.tanggal_berakhir_visa ? moment(item.tanggal_berakhir_visa).format('YYYY/MM/DD') : '',
            asuransi: asuransi || '',
            no_polis: paket.no_polis || '',
            tanggal_input_polis: paket.tgl_input_polis ? moment(paket.tgl_input_polis).format('YYYY/MM/DD') : '',
            tanggal_awal_polis: paket.tgl_awal_polis ? moment(paket.tgl_awal_polis).format('YYYY/MM/DD') : '',
            tanggal_akhir_polis: paket.tgl_akhir_polis ? moment(paket.tgl_akhir_polis).format('YYYY/MM/DD') : '',
          };
        })
      );

      // panggil function untuk export ke excel
      await this.dataManifestExcel(dataManifest, res);
    } catch (error) {
      console.log('Error in downloadManifestPaket: ', error);
    }
  }

  async infoManifestPaket(id, division_id) {
    try {
      const where = { id: id, division_id: division_id };

      var sql = {}
      sql["attributes"] = [
        "id",
        "division_id",
        "jamaah_id",
        "paket_id",
        "mst_paket_type_id",
        "price",
        "nomor_visa",
        "tanggal_berlaku_visa",
        "tanggal_berakhir_visa",
        "biaya_mahram",
        "createdAt",
        "updatedAt"
      ];
      sql["where"] = where;
      sql["include"] = [
        {
          model: Jamaah,
          required: true,
          include: [
            {
              model: Member,
              required: true
            }
          ]
        }
      ]

      const dataTranspaket = await Paket_transaction.findOne(sql);

      const data = {
        id: dataTranspaket.id,
        division_id: dataTranspaket.division_id,
        jamaah_id: dataTranspaket.jamaah_id,
        price: dataTranspaket.price,
        nomor_visa: dataTranspaket.nomor_visa,
        tanggal_berlaku_visa: dataTranspaket.tanggal_berlaku_visa,
        tanggal_berakhir_visa: dataTranspaket.tanggal_berakhir_visa,
        biaya_mahram: dataTranspaket.biaya_mahram,
        createdAt: dataTranspaket.createdAt,
        updatedAt: dataTranspaket.updatedAt,
        Jamaah: dataTranspaket.Jamaah,
        Member: dataTranspaket.Jamaah.Member
      };

      console.log("========= infoManifestPaket =========");
      console.log(data);
      console.log("========= infoManifestPaket =========");

      return data;
    } catch (error) {
      console.log("Error in infoManifestPaket:", error);
      return {};
    }
  }
}

module.exports = Model_r;
