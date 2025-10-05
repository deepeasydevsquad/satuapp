const {
    Kelurahan,
    Kecamatan,
    Kabupaten_kota,
    Provinsi,
} = require("../models"); // Model Kota

const alamatHelper = {};

// Mencari alamat berdasarkan nama kelurahan
alamatHelper.getAlamatInfo = async (kelurahan_id) => {
    try {
        const kelurahan = await Kelurahan.findOne({
            where: { id: kelurahan_id },
            attributes: ["id", "name"], // Ambil ID kelurahan dan name
            include: [
                {
                    model: Kecamatan,
                    attributes: ["id", "name"], // Ambil ID kecamatan dan name
                    include: [
                        {
                            model: Kabupaten_kota,
                            attributes: ["id", "name"], // Ambil ID kabupaten_kota dan name
                            include: [
                                {
                                    model: Provinsi,
                                    attributes: ["id", "name"], // Ambil ID provinsi dan nama provinsi
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        return kelurahan
            ? {
                kelurahan_id: kelurahan.id,
                kelurahan_name: kelurahan.name,
                kecamatan_id: kelurahan.Kecamatan.id,
                kecamatan_name: kelurahan.Kecamatan.name,
                kabupaten_kota_id: kelurahan.Kecamatan.Kabupaten_kotum?.id,
                kabupaten_kota_name: kelurahan.Kecamatan.Kabupaten_kotum?.name,
                provinsi_id: kelurahan.Kecamatan.Kabupaten_kotum?.Provinsi?.id,
                provinsi_name: kelurahan.Kecamatan.Kabupaten_kotum?.Provinsi?.name,
            } : null;
    } catch (error) {
        console.error("Error fetching alamat info:", error.message);
        throw error;
    }
};

module.exports = alamatHelper;
