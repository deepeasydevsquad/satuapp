const moment = require("moment");

jest.mock("../../../models", () => ({
  Op: {},
  Konfigurasi_surat_menyurat: {
    findOne: jest.fn(),
  },
  Riwayat_surat_menyurat: {
    findAll: jest.fn(),
  },
}));

jest.mock("../../../helper/companyHelper", () => ({
  getCompanyIdByCode: jest.fn(),
}));

const {
  Konfigurasi_surat_menyurat,
  Riwayat_surat_menyurat,
} = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");

const Model_r = require("./model_r");

describe("Model_r", () => {
  let reqPalsu;

  beforeEach(() => {
    reqPalsu = {};
    jest.clearAllMocks();
  });

  describe("konfigurasi_surat", () => {
    it("harus balikkan data konfigurasi surat kalau ada", async () => {
      getCompanyIdByCode.mockResolvedValue(123);
      Konfigurasi_surat_menyurat.findOne.mockResolvedValue({
        nama_tanda_tangan: "Tuan Muda",
        jabatan_tanda_tangan: "CEO",
        alamat_tanda_tangan: "Jl. Keren",
        nama_perusahaan: "Perusahaan Keren",
        izin_perusahaan: "12345",
        kota_perusahaan: "Jakarta",
        provinsi_perusahaan: "DKI Jakarta",
        alamat_perusahaan: "Jl. Kantor",
        no_kontak_perusahaan: "08123456789",
        website_perusahaan: "https://perusahaan.id",
        email_perusahaan: "contact@perusahaan.id",
      });

      const model = new Model_r(reqPalsu);
      const hasil = await model.konfigurasi_surat();

      expect(getCompanyIdByCode).toHaveBeenCalledWith(reqPalsu);
      expect(Konfigurasi_surat_menyurat.findOne).toHaveBeenCalledWith({
        where: { company_id: 123 },
      });

      expect(hasil).toEqual({
        nama_tanda_tangan: "Tuan Muda",
        jabatan_tanda_tangan: "CEO",
        alamat_tanda_tangan: "Jl. Keren",
        nama_perusahaan: "Perusahaan Keren",
        izin_perusahaan: "12345",
        kota_perusahaan: "Jakarta",
        provinsi_perusahaan: "DKI Jakarta",
        alamat_perusahaan: "Jl. Kantor",
        no_kontak_perusahaan: "08123456789",
        website_perusahaan: "https://perusahaan.id",
        email_perusahaan: "contact@perusahaan.id",
      });
    });

    it("harus balikkan null kalau datanya gak ada", async () => {
      getCompanyIdByCode.mockResolvedValue(123);
      Konfigurasi_surat_menyurat.findOne.mockResolvedValue(null);

      const model = new Model_r(reqPalsu);
      const hasil = await model.konfigurasi_surat();

      expect(hasil).toBeNull();
    });

    it("harus balikkan null kalau error", async () => {
      getCompanyIdByCode.mockResolvedValue(123);
      Konfigurasi_surat_menyurat.findOne.mockRejectedValue(
        new Error("Error DB")
      );

      const model = new Model_r(reqPalsu);
      const hasil = await model.konfigurasi_surat();

      expect(hasil).toBeNull();
    });
  });

  describe("daftar_riwayat_surat", () => {
    it("harus balikkan array data surat yang sudah diformat", async () => {
      getCompanyIdByCode.mockResolvedValue(456);
      const dataPalsu = [
        {
          nomor_surat: "SUR001",
          tipe_surat: "Undangan",
          tanggal_surat: new Date("2023-05-10"),
          info: "Info surat",
          tujuan: "Tujuan surat",
          nama_petugas: "Petugas 1",
        },
        {
          nomor_surat: "SUR002",
          tipe_surat: "Pemberitahuan",
          tanggal_surat: new Date("2023-06-11"),
          info: "Info surat 2",
          tujuan: "Tujuan surat 2",
          nama_petugas: "Petugas 2",
        },
      ];

      Riwayat_surat_menyurat.findAll.mockResolvedValue(dataPalsu);

      const model = new Model_r(reqPalsu);
      const hasil = await model.daftar_riwayat_surat();

      expect(Riwayat_surat_menyurat.findAll).toHaveBeenCalledWith({
        where: { company_id: 456 },
        order: [["id", "DESC"]],
      });

      expect(hasil).toEqual([
        {
          nomor_surat: "SUR001",
          tipe_surat: "Undangan",
          tanggal_surat: moment(dataPalsu[0].tanggal_surat).format(
            "YYYY-MM-DD"
          ),
          info: "Info surat",
          tujuan: "Tujuan surat",
          nama_petugas: "Petugas 1",
        },
        {
          nomor_surat: "SUR002",
          tipe_surat: "Pemberitahuan",
          tanggal_surat: moment(dataPalsu[1].tanggal_surat).format(
            "YYYY-MM-DD"
          ),
          info: "Info surat 2",
          tujuan: "Tujuan surat 2",
          nama_petugas: "Petugas 2",
        },
      ]);
    });

    it("harus balikkan null kalau error", async () => {
      getCompanyIdByCode.mockResolvedValue(456);
      Riwayat_surat_menyurat.findAll.mockRejectedValue(new Error("Error DB"));

      const model = new Model_r(reqPalsu);
      const hasil = await model.daftar_riwayat_surat();

      expect(hasil).toBeNull();
    });
  });
});
