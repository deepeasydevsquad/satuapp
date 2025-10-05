const { Op, Visa_transaction, Visa_transaction_detail, Mst_visa_request_type, Mst_kota, Mst_bank, Kostumer, Division } = require("../models");
const { getCompanyIdByCode, getCabang } = require("../helper/companyHelper");
const Akuntansi = require("../library/akuntansi");
    
const validation = {};


validation.check_saldo = async ( value, { req} ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        const akuntansi = new Akuntansi(); 
        var nomor_akun = '';
        if( req.body.sumber_dana == '0' ) {
            nomor_akun = '11010';
        }else{
            const qB = await Mst_bank.findOne({ where: { id: req.body.sumber_dana, company_id: company_id } });
            nomor_akun = qB.nomor_akun;
        }
        const saldo = await akuntansi.saldo_masing_masing_akun(nomor_akun, company_id, req.body.cabang, '0');
        if(saldo < ( value * req.body.pax ) ) {
            throw new Error("Jumlah total harga travel tidak boleh lebih besar dari saldo sumber dana.");
        }else{
            if( ( value * req.body.pax ) <= 1000 ) {
                throw new Error("Jumlah total harga travel tidak boleh lebih kecil dari Rp 1000 .");
            }
        }    
    } catch (error) {
        console.log("---------1");
        console.log(error);
        console.log("---------1");
    }
    
    return true;
}

validation.check_jenis_visa = async ( value ) => {
    try {
        const check = await Mst_visa_request_type.findOne({
            where: { id: value },
        });
        // check
        if (!check) {
            throw new Error("ID jenis visa tidak terdaftar di pangkalan data.");
        }    
    } catch (error) {
        console.log("---------2");
        console.log(error);
        console.log("---------2");
    }
    
    return true
}

validation.check_paket = async ( value,  { req } ) => {

    try {
        if( value != 0) {
            const company_id = await getCompanyIdByCode(req);
            const check = await Paket.findOne({
                where: { id: value },
                include: {
                    model: Division,
                    required: true,
                    where: { company_id }
                }
            });
            // check
            if (!check) {
                throw new Error("ID paket tidak terdaftar di pangkalan data.");
            }
        }        
    } catch (error) {
        console.log("---------3");
        console.log(error);
        console.log("---------3");
    }

    return true;
}

validation.check_kostumer = async ( value,  { req } ) => {
    try{
        if( value != 0) {
            const company_id = await getCompanyIdByCode(req);
            const check = await Kostumer.findOne({
                where: { id: value, company_id },
            });
            // check
            if (!check) {
                throw new Error("ID kostumer tidak terdaftar di pangkalan data.");
            }
        }
    } catch (error) {
        console.log("---------4");
        console.log(error);
        console.log("---------4");
    }
    return true;
}

// validation.check_sumber_dana = async ( value,  { req} ) => {
//     if(value != 0){
//         const company_id = await getCompanyIdByCode(req);
//         const check = await Mst_bank.findOne({
//             where: { id: value, company_id },
//         });
//         // check
//         if (!check) {
//             throw new Error("ID sumber dana tidak terdaftar di pangkalan data.");
//         }
//     }
//     return true;
// }

// Validasi untuk memastikan kota yang dipilih valid
validation.check_city_id = async (value, { req }) => {
    try {
        const city = await Mst_kota.findOne({
            where: { 
                id: value,
            }
        });
        
        if (!city) {
            console.debug(`ID Kota tidak terdaftar di pangkalan data`);
            throw new Error("ID Kota tidak terdaftar di pangkalan data");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan jenis visa yang dipilih valid
validation.check_visa_type = async (value, { req }) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        
        // Cek apakah jenis visa exists
        const visaType = await Mst_visa_request_type.findOne({
            where: { 
                name: value,
            }
        });
        
        if (!visaType) {
            console.debug(`Jenis visa tidak terdaftar di pangkalan data`);
            throw new Error("Jenis visa tidak terdaftar di pangkalan data");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan gender valid
validation.check_gender = async (value, { req }) => {
    try {
        const validGenders = ['Laki-laki', 'Perempuan'];
        
        if (!validGenders.includes(value)) {
            console.debug(`Jenis kelamin tidak valid`);
            throw new Error("Jenis kelamin harus 'Laki-laki' atau 'Perempuan'");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan tanggal lahir valid (tidak di masa depan)
validation.check_birth_date = async (value, { req }) => {
    try {
        const birthDate = new Date(value);
        const today = new Date();
        
        if (birthDate > today) {
            console.debug(`Tanggal lahir tidak boleh di masa depan`);
            throw new Error("Tanggal lahir tidak boleh di masa depan");
        }
        
        // Validasi umur minimal (misalnya 17 tahun)
        const minAge = 17;
        const ageLimit = new Date();
        ageLimit.setFullYear(ageLimit.getFullYear() - minAge);
        
        if (birthDate > ageLimit) {
            console.debug(`Umur minimal adalah ${minAge} tahun`);
            throw new Error(`Umur minimal adalah ${minAge} tahun`);
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan tanggal passport valid
validation.check_passport_dates = async (value, { req }) => {
    try {
        const issuedDate = new Date(req.body.passport_issued_date);
        const expireDate = new Date(req.body.passport_expire_date);
        const today = new Date();
        
        // Tanggal dikeluarkan tidak boleh di masa depan
        if (issuedDate > today) {
            console.debug(`Tanggal dikeluarkan passport tidak boleh di masa depan`);
            throw new Error("Tanggal dikeluarkan passport tidak boleh di masa depan");
        }
        
        // Tanggal expire harus setelah tanggal dikeluarkan
        if (expireDate <= issuedDate) {
            console.debug(`Tanggal berakhir passport harus setelah tanggal dikeluarkan`);
            throw new Error("Tanggal berakhir passport harus setelah tanggal dikeluarkan");
        }
        
        // Passport harus masih berlaku minimal 6 bulan dari sekarang
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        
        if (expireDate < sixMonthsFromNow) {
            console.debug(`Passport harus berlaku minimal 6 bulan dari sekarang`);
            throw new Error("Passport harus berlaku minimal 6 bulan dari sekarang");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan nomor passport unik
validation.check_passport_number_unique = async (value, { req }) => {
    try {
        const division_id = await getCabang(req);
        
        // Cek apakah nomor passport sudah digunakan
        const existingVisa = await Visa_transaction_detail.findOne({
            where: { 
                passport_number: value,
                ...(req.body.id && { id: { [Op.ne]: req.body.id } })
            }
        });
        
        if (existingVisa) {
            console.debug(`Nomor passport sudah terdaftar`);
            throw new Error("Nomor passport sudah terdaftar di sistem");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan nomor identitas unik
validation.check_identity_number_unique = async (value, { req }) => {
    try {
        const division_id = await getCabang(req);
        
        // Cek apakah nomor identitas sudah digunakan
        const existingVisa = await Visa_transaction.findOne({
            where: { 
                payer_identity: value,
                ...(req.body.id && { id: { [Op.ne]: req.body.id } })
            }
        });
        
        if (existingVisa) {
            console.debug(`Nomor identitas sudah terdaftar`);
            throw new Error("Nomor identitas sudah terdaftar di sistem");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan invoice code unik
validation.check_invoice_unique = async (value, { req }) => {
    try {
        const division_id = await getCabang(req);
        
        // Cek apakah invoice sudah digunakan
        const existingVisa = await Visa_transaction.findOne({
            where: { 
                invoice: value,
                ...(req.body.id && { id: { [Op.ne]: req.body.id } })
            }
        });
        
        if (existingVisa) {
            console.debug(`Invoice code sudah terdaftar`);
            throw new Error("Invoice code sudah terdaftar di sistem");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan harga valid
validation.check_price = async (value, { req }) => {
    try {
        const price = Number(value);
        
        if (price <= 0) {
            console.debug(`Harga harus lebih dari 0`);
            throw new Error("Harga harus lebih dari 0");
        }
        
        // Validasi harga maksimal (opsional)
        const maxPrice = 100000000; // 100 juta
        if (price > maxPrice) {
            console.debug(`Harga tidak boleh lebih dari ${maxPrice.toLocaleString('id-ID')}`);
            throw new Error(`Harga tidak boleh lebih dari Rp ${maxPrice.toLocaleString('id-ID')}`);
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan tanggal permohonan valid
validation.check_valid_until = async (value, { req }) => {
    try {
        const validUntil = new Date(value);
        const today = new Date();
        
        // Tanggal permohonan tidak boleh di masa lalu
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const validUntilStart = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate());
        
        if (validUntilStart < todayStart) {
            console.debug(`Tanggal permohonan tidak boleh di masa lalu`);
            throw new Error("Tanggal permohonan tidak boleh di masa lalu");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan nomor telepon valid
validation.check_phone_number = async (value, { req }) => {
    try {
        // Regex untuk validasi nomor telepon Indonesia
        const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
        
        if (!phoneRegex.test(value)) {
            console.debug(`Format nomor telepon tidak valid`);
            throw new Error("Format nomor telepon tidak valid (contoh: 08123456789, +6281234567890)");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan kode pos valid
validation.check_postal_code = async (value, { req }) => {
    try {
        // Regex untuk kode pos Indonesia (5 digit)
        const postalCodeRegex = /^[0-9]{5}$/;
        
        if (!postalCodeRegex.test(value)) {
            console.debug(`Kode pos harus 5 digit angka`);
            throw new Error("Kode pos harus 5 digit angka");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Validasi untuk memastikan transaksi visa exists (untuk update/delete)
validation.check_visa_transaction_exists = async (value, { req }) => {

    try {
        const company_id = await getCompanyIdByCode(req);
        const check = await Visa_transaction.findOne({ 
            where: { 
                id: value 
            }, 
            include: { 
                model: Division, 
                required: true, 
                where: { 
                    company_id: company_id 
                } 
            } 
        });
        // filter
        if (!check) {
            throw new Error("ID visa transaksi tidak terdaftar di pangkalan data");
        }    
    } catch (error) {
        console.log("_________________");
        console.log(error);
        console.log("_________________");
    }
    
    return true;
};

validation.check_invoice_exists = async (value, { req }) => {
    try {
        // TAMBAHKAN DEBUG LOGGING
        console.log(`[DEBUG VALIDATION] Received value: "${value}"`);
        console.log(`[DEBUG VALIDATION] Value type:`, typeof value);
        console.log(`[DEBUG VALIDATION] Req params:`, req.params);
        console.log(`[DEBUG VALIDATION] Full URL:`, req.originalUrl);
        
        // Cek apakah value ada dan tidak undefined/null
        if (!value || value === 'undefined' || value === 'null') {
            console.error(`[DEBUG VALIDATION] Invalid invoice value: ${value}`);
            throw new Error("Invoice tidak valid atau kosong");
        }
        
        const company_id = await getCompanyIdByCode(req);
        console.log(`[DEBUG VALIDATION] Company ID: ${company_id}`);
        
        // Cari transaksi berdasarkan invoice
        const transaksi = await Visa_transaction.findOne({
            where: { 
                invoice: value,
                company_id: company_id
            },
            include: [{
                model: Visa_transaction_detail,
                required: true
            }]
        });
        
        console.log(`[DEBUG VALIDATION] Transaction found:`, transaksi ? 'Yes' : 'No');
        
        if (!transaksi) {
            // Debug lebih detail
            const anyTransaction = await Visa_transaction.findOne({
                where: { invoice: value }
            });
            
            if (anyTransaction) {
                console.log(`[DEBUG VALIDATION] Transaction exists but company mismatch. DB company: ${anyTransaction.company_id}, Current company: ${company_id}`);
            } else {
                console.log(`[DEBUG VALIDATION] No transaction found with invoice: ${value}`);
            }
            
            throw new Error("Invoice tidak ditemukan atau Anda tidak memiliki akses");
        }
        
        // Simpan data transaksi di request untuk digunakan di controller
        req.visaTransaction = transaksi;
        return true;
    } catch (error) {
        console.error('[ERROR] in check_invoice_exists:', error);
        throw error;
    }
};

module.exports = validation;