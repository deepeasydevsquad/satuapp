const { Mst_airline, Kostumer, Paket, Division, Ticket_transaction, Ticket_payment_history } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const Akuntansi = require("../library/akuntansi");
const validation = {};

// Mengecek jumlah saldo maskapai
validation.check_jumlah_saldo_maskapai = async ( value,  { req } ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        const akuntansi = new Akuntansi();
        const q = await Mst_airline.findOne({ where: {company_id: company_id, id: value } });
        const total = req.body.harga_travel * req.body.pax;
        const saldo = await akuntansi.saldo_masing_masing_akun(q.nomor_akun_deposit, company_id, q.division_id, '0') ;
        if(saldo < total) {
            throw new Error(`Saldo maskapai tidak mencukupi untuk melakukan transaksi ini.`); 
        }       
    } catch (error) {
        console.log("********************");
        console.log(error);
        console.log("********************");
    }
    
    return true;
}

validation.check_maskapai_id = async (value,  { req } ) => {
    if( value <= 0 ) {
        throw new Error("Anda wajib memilih salah satu maskapai");
    }else{
        const company_id = await getCompanyIdByCode(req);
        const q = await Mst_airline.findOne({ where: { company_id: company_id, id: value } });
        if (!q) {
            throw new Error("ID Maskapai tidak terdaftar dipangkalan data");
        }
    }
    return true;
}

validation.check_jumlah_refund = async ( value,  { req } ) => {
    try {
        if( value <= 0 ) {
            throw new Error("Jumlah nominal yang direfund tidak boleh lebih kecil dari 0");
        }else{
            const company_id = await getCompanyIdByCode(req);

            const q = await Ticket_transaction.findOne({ 
                where: { 
                    id: req.body.id 
                }, 
                include: [
                    { 
                    model: Division, 
                    required: true, 
                    where: { 
                        company_id: company_id 
                    } 
                    },
                    { 
                    model: Mst_airline, 
                    required: true, 
                    },
                ]
            });

            const total = q.pax * q.costumer_price;

            var sudah_bayar = 0;
            await Ticket_payment_history.findAll({
            attributes: ["id", "nominal", "status"],
            where: { ticket_transaction_id: req.body.id },
            include: {
                model: Ticket_transaction, 
                required: true,
                where: { division_id: q.division_id }
            }
            }).then(async (value) => {
                await Promise.all(
                    await value.map(async (e) => {
                        if( e.status == 'cash') {
                            sudah_bayar = sudah_bayar + parseInt(e.nominal);
                        }
                    })
                );
            });

            const refund = req.body.refund;
            const fee = req.body.fee;

            // filter
            if( sudah_bayar != (refund + fee) ) {
                throw new Error("Jumlah nominal yang direfund plus fee harus sama dengan nominal sudah dibayar");
            }
            if( total < (refund + fee)  ) {
                throw new Error("Jumlah nominal yang direfund plus fee tidak boleh lebih besar dari total ticket");
            }
        }
    } catch (error) {
        console.log(error);
    }
    return true;
}

validation.check_jumlah_dibayar = async (value, { req } ) => {
    if( value <= 0 ) {
        throw new Error("Jumlah nominal yang dibayar tidak boleh lebih kecil dari 0");
    }else{
        const company_id = await getCompanyIdByCode(req);

        const q = await Ticket_transaction.findOne({ 
            where: { 
                id: req.body.id 
            }, 
            include: [
                { 
                model: Division, 
                required: true, 
                where: { 
                    company_id: company_id 
                } 
                },
                { 
                model: Mst_airline, 
                required: true, 
                },
            ]
        });

        const total = q.pax * q.costumer_price;

        var sudah_bayar = 0;
        await Ticket_payment_history.findAll({
        attributes: ["id", "nominal", "status"],
        where: { ticket_transaction_id: req.body.id },
        include: {
            model: Ticket_transaction, 
            required: true,
            where: { division_id: q.division_id }
        }
        }).then(async (value) => {
            await Promise.all(
                await value.map(async (e) => {
                    if( e.status == 'cash') {
                        sudah_bayar = sudah_bayar + parseInt(e.nominal);
                    }
                })
            );
        });

        const total_pembayaran = sudah_bayar + req.body.dibayar;

        if( total_pembayaran > total ) {
            throw new Error("Jumlah nominal yang dibayar tidak boleh lebih besar dari total harga tiket");
        }
    }
    
    return true;
}

validation.check_id = async (value, { req } ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        const q = await Ticket_transaction.findOne({ where: { id: value }, include: { model: Division, required: true, where: { company_id: company_id } } });
        if (!q) {
            throw new Error("ID Transaksi Tiket tidak terdaftar dipangkalan data");
        }    
    } catch (error) {
        console.log(":::::::::::::::::::");
        console.log(error);
        console.log(":::::::::::::::::::");
    }
    
    return true;
}

validation.check_ticketing = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    const akuntansi = new Akuntansi();
    const q = await Mst_airline.findOne({ where: {company_id: company_id, id: req.body.maskapai } });
    const total = req.body.harga_travel * req.body.pax;
    const saldo = await akuntansi.saldo_masing_masing_akun(q.nomor_akun_deposit, company_id, req.body.cabang, '0') ;
    if(saldo < total) {
        throw new Error(`Saldo maskapai tidak mencukupi untuk melakukan transaksi ini.`); 
    }    
    return true;
};

validation.check_maskapai_id = async ( value, { req } ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        const q = await Mst_airline.findOne({ where: {company_id: company_id, id: value } });
        if (!q) {
            throw new Error("ID Maskapai tidak terdaftar dipangkalan data");
        }    
    } catch (error) {
        console.log("-------DDD------");
        console.log(error);
        console.log("-------DDD------");
    }
    
    return true;
}

validation.check_kostumer_paket_id = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    try {
        if( req.body.kostumer == '0' && req.body.paket == '0' ) {
            throw new Error("Anda wajib memilih salah satu kostumer atau paket untuk melanjutkan proses ini.");
        }
        // check kostumer
        if( req.body.kostumer != 0) {
            const q = await Kostumer.findOne({ where: {company_id: company_id, id: req.body.kostumer } });
            if (!q) {
                throw new Error("ID Kostumer tidak terdaftar dipangkalan data");
            }
        }
        // check paket
        if( req.body.paket != 0) {
            const qP = await Paket.findOne({ where: { id: req.body.paket }, include: { model : Division, required: true, where: { company_id: company_id } } });
            if (!qP) {
                throw new Error("ID Paket tidak terdaftar dipangkalan data");
            }
        }    
    } catch (error) {
        console.log("XXXXXXXXXXXXXx");
        console.log(error);
        console.log("XXXXXXXXXXXXXx"); 
    }
    
    return true;
}

module.exports = validation;
