const { Saldo_akun, Jurnal, Akun_primary, Akun_secondary } = require("../models");

class Akuntansi {

    async saldo_masing_masing_akun(nomor_akun, company_id, division_id, periode) {

        const q = await Akun_secondary.findOne({
            where: {
                nomor_akun: nomor_akun, 
                company_id: company_id
            },
            include: {
                model : Akun_primary, 
                required: true
            }
        });
        const sn = q.Akun_primary.sn;

        console.log("*******************");
        console.log(nomor_akun);
        console.log(company_id);
        console.log(division_id);
        console.log(periode);
        console.log(sn);
        console.log("*******************");

        // get saldo awal
        var saldo_awal = 0;
        await Saldo_akun.findAll( {
        include : {
          required : true, 
          model : Akun_secondary,
          where : { nomor_akun : nomor_akun }
        },  
        where : { 
            division_id : division_id, 
            periode : periode 
        }}).then(async (value) => {
            await Promise.all(
                await value.map(async (e) => {
                    saldo_awal = saldo_awal + e.saldo;
                })
            );
        });

        console.log("*******saldo_awal************");
        console.log(saldo_awal);
        console.log("*******saldo_awal************");

        var saldo_jurnal = saldo_awal;
        await Jurnal.findAll({ where : { division_id : division_id, periode_id : periode }}).then(async (value) => {
            await Promise.all(
                await value.map(async (e) => {
                    if( sn == 'D') {
                        if(e.akun_debet == nomor_akun) {
                            saldo_jurnal = saldo_jurnal + e.saldo;
                        }
                        if( e.akun_kredit == nomor_akun) {
                            saldo_jurnal = saldo_jurnal - e.saldo;
                        }
                    } else if( sn == 'K') {
                        if(e.akun_debet == nomor_akun) {
                            saldo_jurnal = saldo_jurnal - e.saldo;
                        }
                        if( e.akun_kredit == nomor_akun) {
                            saldo_jurnal = saldo_jurnal + e.saldo;
                        }
                    }
                })
            );
        });

        console.log("*******saldo_jurnal************");
        console.log(saldo_jurnal);
        console.log("*******saldo_jurnal************");

        return saldo_jurnal;
    }

    
                    // // info akun
                    // var infAkunDebet =  akun_primary[e.akun_debet.toString().charAt(0)];
                    // var infAkunKredit =  akun_primary[e.akun_kredit.toString().charAt(0)];
        
                    // if( infAkunDebet.sn == 'D') {
                    //   if(saldo_jurnal[e.division_id] === undefined ) {
                    //     saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_debet] : ( e.saldo + 0 ) } } };
                    //   }else{
                    //     if( saldo_jurnal[e.division_id][e.akun_debet] === undefined ) {
                    //       saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_debet] : (e.saldo + 0)}}
                    //     }else{
                    //       saldo_jurnal[e.division_id][e.akun_debet] = saldo_jurnal[e.division_id][e.akun_debet] + e.saldo;
                    //     }
                    //   }
                    // }else if ( infAkunDebet.sn == 'K' ) {
                    //   if(saldo_jurnal[e.division_id] === undefined ) {
                    //     saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_debet] : ( 0 - e.saldo ) } } };
                    //   }else{
                    //     if( saldo_jurnal[e.division_id][e.akun_debet] === undefined ) {
                    //       saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_debet] : ( 0 - e.saldo )}}
                    //     }else{
                    //       saldo_jurnal[e.division_id][e.akun_debet] = saldo_jurnal[e.division_id][e.akun_debet] - e.saldo;
                    //     }
                    //   }
                    // }
        
                    // if( infAkunKredit.sn == 'D') {
                    //   if(saldo_jurnal[e.division_id] === undefined ) {
                    //     saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_kredit] : ( 0 - e.saldo ) } } };
                    //   }else{
                    //     if( saldo_jurnal[e.division_id][e.akun_kredit] === undefined ) {
                    //       saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_kredit] : (0 - e.saldo)}}
                    //     }else{
                    //       saldo_jurnal[e.division_id][e.akun_kredit] = saldo_jurnal[e.division_id][e.akun_kredit] - e.saldo;
                    //     }
                    //   }
                    // }else if ( infAkunKredit.sn == 'K' ) {
                    //   if(saldo_jurnal[e.division_id] === undefined ) {
                    //     saldo_jurnal = {...saldo_jurnal,...{[e.division_id] : { [e.akun_kredit] : ( e.saldo + 0 ) } } };
                    //   }else{
                    //     if( saldo_jurnal[e.division_id][e.akun_kredit] === undefined ) {
                    //       saldo_jurnal[e.division_id] = {...saldo_jurnal[e.division_id],...{[e.akun_kredit] : ( e.saldo + 0 )}}
                    //     }else{
                    //       saldo_jurnal[e.division_id][e.akun_kredit] = saldo_jurnal[e.division_id][e.akun_kredit] + e.saldo;
                    //     }
                    //   }
                    // }

    async iktisar_laba_rugi(periode, division_id, company_id) {

        try {

            var akun_primary = [1,2,3];
            const q = await Saldo_akun.findAndCountAll({ 
                where : { 
                division_id: division_id, 
                periode: periode, 
                },
                order : [["id", "asc"]]
            });
            var saldo_awal = {};
            await Promise.all(
                await q.rows.map(async (e) => {
                saldo_awal = {...saldo_awal,...{ [e.akun_secondary_id] : e.saldo } };
                })
            );

            const q1 = await Jurnal.findAndCountAll({ 
                where : { 
                division_id: division_id, 
                periode_id: periode, 
                },
                order : [["id", "asc"]]
            });
            var akun_debet = {};
            var akun_kredit = {};
            await Promise.all(
                await q1.rows.map(async (e) => {
                    if( akun_debet[e.akun_debet] !== undefined ) {
                        akun_debet[e.akun_debet] = akun_debet[e.akun_debet] + e.saldo;
                    } else {
                        akun_debet = {...akun_debet,...{[e.akun_debet] : e.saldo } };
                    }
                    if( akun_kredit[e.akun_kredit] !== undefined ) {
                        akun_kredit[e.akun_kredit] = akun_kredit[e.akun_kredit] + e.saldo;
                    } else {
                        akun_kredit = {...akun_kredit,...{[e.akun_kredit] : e.saldo } };
                    }
                })
            );

            var total = {};
            for( let x in akun_primary ) {
                const q2 = await Akun_secondary.findAndCountAll({ 
                    include: {
                        required: true,
                        model : Akun_primary,
                        where : {
                            id: akun_primary[x]
                        }
                    },
                    where : { 
                        company_id: company_id
                    },
                    order : [["id", "asc"]]
                });
                await Promise.all(
                    await q2.rows.map(async (e) => {


                        var saldo = 0;
                        if( saldo_awal[e.id] !== undefined ) {
                            saldo = saldo + saldo_awal[e.id];
                        }

                        if(e.Akun_primary.sn == 'D') {
                            if( akun_debet[e.nomor_akun] !== undefined ) {
                                saldo = saldo + akun_debet[e.nomor_akun];
                            }
                            if( akun_kredit[e.nomor_akun] !== undefined ) {
                                saldo = saldo - akun_kredit[e.nomor_akun]
                            }
                        }else if( e.Akun_primary.sn == 'K') {
                            if( akun_debet[e.nomor_akun] !== undefined ) {
                                saldo = saldo - akun_debet[e.nomor_akun]
                            }
                            if( akun_kredit[e.nomor_akun] !== undefined ) {
                                saldo = saldo + akun_kredit[e.nomor_akun]
                            }
                        }

                        if( total[akun_primary[x]] !== undefined ) {
                            total[akun_primary[x]] = total[akun_primary[x]] + saldo
                        }else{
                            total = {...total,...{[akun_primary[x]] : saldo} };
                        }
                    })
                );
            }

            return ( total[1] !== undefined ? total[1] : 0 ) - ( total[2] !== undefined ? total[2] : 0 ) - ( total[3] !== undefined ? total[3] : 0 );
        } catch (error) {
            return 0
        }
    }

    // saldo awal 
    async saldo_awal(periode, division_id) {
        // get saldo_awal
      const q1 = await Saldo_akun.findAndCountAll({ 
        where : { 
          division_id: division_id, 
          periode: periode, 
        },
        order : [["id", "asc"]]
      });
      var saldo_awal = {};
      await Promise.all(
        await q1.rows.map(async (e) => {
          saldo_awal = {...saldo_awal,...{ [e.akun_secondary_id] : e.saldo } };
        })
      );
      return saldo_awal
    }

    // get jurnal
    async get_jurnal_by_periode(periode, division_id) {
        const q2 = await Jurnal.findAndCountAll({
            where : { 
            division_id: division_id, 
            periode_id: periode, 
            },
            order : [["id", "asc"]]
        });
        var akun_debet = {};
        var akun_kredit = {};
        await Promise.all(
            await q2.rows.map(async (e) => {
            // AKUN DEBET
            if(akun_debet[e.akun_debet]) {
                akun_debet[e.akun_debet] = akun_debet[e.akun_debet] + e.saldo;
            }else{
                akun_debet = {...akun_debet,...{[e.akun_debet] : e.saldo } }
            }
            // AKUN KREDIT
            if(akun_kredit[e.akun_kredit]) {
                akun_kredit[e.akun_kredit] = akun_kredit[e.akun_kredit] + e.saldo;
            }else{
                akun_kredit = {...akun_kredit,...{[e.akun_kredit] : e.saldo } }
            }
            })
        );
        return { akun_debet, akun_kredit };
    }   

    // total saldo
    async total_saldo(periode, akun_debet, akun_kredit, division_id, saldo_awal, company_id) {

        try {
            var akun_primary = [1,2,3];
            var list = {};
            for( let x in akun_primary ) {
                const q = await Akun_secondary.findAndCountAll({
                    include: {
                        required : true, 
                        model : Akun_primary, 
                        where: { id : akun_primary[x] }
                    },
                    where : { 
                        company_id: company_id, 
                    },
                    order : [["nomor_akun", "asc"]]
                });
                await Promise.all(
                    await q.rows.map(async (e) => {
                        var saldo = 0;
                        if( saldo_awal[e.id]) {
                            saldo = saldo + saldo_awal[e.id];
                        }

                        if( e.Akun_primary.sn == 'D' ) {
                            if(akun_debet[e.nomor_akun]) {
                                saldo = saldo + akun_debet[e.nomor_akun];
                            }
                            if(akun_kredit[e.nomor_akun]) {
                                saldo = saldo - akun_kredit[e.nomor_akun];
                            }
                        }else if( e.Akun_primary.sn == 'K' ) {
                            if(akun_debet[e.nomor_akun]) {
                                saldo = saldo - akun_debet[e.nomor_akun];
                            }
                            if(akun_kredit[e.nomor_akun]) {
                                saldo = saldo + akun_kredit[e.nomor_akun];
                            }
                        }

                        if(e.nomor_akun == '33000') {
                            var iktisar_laba_rugi = await this.iktisar_laba_rugi(periode, division_id, company_id);
                            saldo = saldo + iktisar_laba_rugi;
                        }


                        if( list[akun_primary[x]] !== undefined ) {
                            list[akun_primary[x]].push({ nomor_akun : e.nomor_akun, nama_akun: e.nama_akun, saldo: saldo});
                        }else{
                            list = {...list,...{[akun_primary[x]] : [{ nomor_akun : e.nomor_akun, nama_akun: e.nama_akun, saldo: saldo}] } };
                        }
                    })
                );
            }
            return list
            
        } catch (error) {
            return {}
        }
        
    }


     // saldo awal 
    async saldo_modal_awal(periode, division_id) {
        // get saldo_awal
      const q1 = await Saldo_akun.findAndCountAll({ 
        where : { 
          division_id: division_id, 
          periode: periode, 
        },
        include: {
            required : true, 
            model: Akun_secondary, 
            where: { nomor_akun: '31000'}
        },
        order : [["id", "asc"]]
      });
      var saldo_modal_awal = 0;
      await Promise.all(
        await q1.rows.map(async (e) => {
            saldo_modal_awal = saldo_modal_awal + e.saldo;
        })
      );
      return saldo_modal_awal;
    }
}

module.exports = Akuntansi;
