const fs = require("fs");
const { Company, Member, Division, Menu, Submenu, Tab, Grup, User } = require("../../../models");
const jwt = require("jsonwebtoken");
const moment = require("moment");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async get_user_information() {
    const body = this.req.body;
    try {
        var data = {};
        if( body.type === 'administrator') {
            await Company.findOne({
                where: { username: body.username },
            }).then(async (e) => {
                if (e) {
                    data["company_code"] = e.code;
                    data["password"] = e.password;
                    data["start_subscribtion"] = e.start_subscribtion;
                    data["end_subscribtion"] = e.end_subscribtion;
                    data["type_subscribtion"] = e.type;
                    data["refresh_token"] = e.refresh_token;
                }
            });
        }else if( body.type === 'staff' ) {
            await Member.findOne({
                where: { whatsapp_number: body.nomor_whatsapp },
                include : {
                    required : true, 
                    model : Division,
                    include : {
                        required : true, 
                        model : Company,
                        where : { code : body.company_code }
                    }
                }
            }).then(async (e) => {
                if (e) {

                  console.log("******");
                  console.log(e.Division);
                  console.log(e.Division.Company);
                  console.log("******");
                    data["company_code"] = e.Division.Company.code;
                    data["division_id"] = e.Division.id;
                    data["password"] = e.password;
                    data["start_subscribtion"] = e.Division.Company.start_subscribtion;
                    data["end_subscribtion"] = e.Division.Company.end_subscribtion;
                    data["type_subscribtion"] = e.Division.Company.type;
                    data["refresh_token"] = e.Division.Company.refresh_token;
                }
            });
        }
        return data;
    } catch (error) {

      console.log("______________");
      console.log(error);
      console.log("______________");
        return {}        
    }
  }

  async get_menu_submenu_tab() {
    try {
        const authHeader = this.req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwt.decode(token);
        const company_code = decoded.company_code;
        const type = decoded.type;
        
        var list_tab_user = { menu: [], submenu: [] };

        var user_info = { company_code, type };
        if( type === 'administrator' ) {
          const username = decoded.username;
          user_info['username'] = username;
        } else if( type === 'staff' ) {
          const nomor_whatsapp = decoded.nomor_whatsapp;
          user_info['nomor_whatsapp'] = nomor_whatsapp;
          
          await User.findOne({
              include : [
                {
                  required: true, 
                  model: Member,
                  where: { whatsapp_number: nomor_whatsapp },
                  include: {
                    model: Division, 
                    required : true,
                    include: {
                      required : true, 
                      model : Company, 
                      where: {
                        code: company_code
                      }
                    }
                  }
                }, 
                {
                  required : true, 
                  model: Grup
                }
              ]
          }).then(async (e) => {
              if (e) {

                // console.log("CCCCCCCCC");
                // console.log(e.Member);
                // console.log(e.Member.fullname);
                // console.log(e.Grup);
                // console.log(e.Grup.group_access);
                // console.log("CCCCCCCCC");
                user_info['fullname'] = e.Member.fullname;
                user_info['group_access'] = JSON.parse(e.Grup.group_access);
              }
          });

          console.log("++++++++++++++user_info.group_access");
          console.log(user_info.group_access);
          console.log("++++++++++++++user_info.group_access");

          for( let x in user_info.group_access ) {
            list_tab_user.menu.push(user_info.group_access[x].id);
            if( user_info.group_access[x].Submenus.length > 0  ) {
              for( let y in  user_info.group_access[x].Submenus ) {
                list_tab_user.submenu.push(user_info.group_access[x].Submenus[y].id);
              }
            }
          }

          console.log("^^^^^^^^");
          console.log(list_tab_user);
          console.log("^^^^^^^^");

        }
        await Company.findOne({
            where: { code: company_code },
        }).then(async (e) => {
            if (e) {
              user_info['logo'] = e.logo;
              user_info['company_name'] = e.company_name;
              user_info['tipe_berlangganan'] = e.type;
              user_info['akhir_berlangganan'] = moment(e.end_subscribtion).format("D MMMM YYYY");
            }
        });

        var posisiLogo = "/uploads/pengaturan/" + user_info.logo;
        if ( ! await fs.existsSync(posisiLogo) ) {
          user_info.logo = "default.png"; // Update jika file tidak ada
        }

        var menu = {};
        await Menu.findAll().then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              if( type === 'administrator' ) {
                menu[e.id] = { id : e.id, name : e.name, path : e.path, icon : e.icon, tab : e.path === '#' ? '' : JSON.parse(e.tab)};
              }else if( type === 'staff' ){
                if( list_tab_user.menu.includes(e.id)  ) {
                  menu[e.id] = { id : e.id, name : e.name, path : e.path, icon : e.icon, tab : e.path === '#' ? '' : JSON.parse(e.tab)};
                }
              }
            })
          );
        });
  
        var submenu = {};
        await Submenu.findAll().then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
                if(submenu[e.menu_id] === undefined ) {
                  if( type === 'administrator' ) {
                    submenu = {...submenu,...{[e.menu_id] : [{ id: e.id, name : e.name, path: e.path, tab : e.tab === '' ? '' : JSON.parse(e.tab) }]}}
                  }else if( type === 'staff' ) {
                    if( list_tab_user.submenu.includes(e.id)  ) {
                      submenu = {...submenu,...{[e.menu_id] : [{ id: e.id, name : e.name, path: e.path, tab : e.tab === '' ? '' : JSON.parse(e.tab) }]}}
                    }
                  }
                }else{
                  if( type === 'administrator' ) {
                    submenu[e.menu_id].push({ id: e.id, name : e.name, path: e.path, tab : e.tab === '' ? '' : JSON.parse(e.tab) });
                  }else if( type === 'staff' ) {
                    if( list_tab_user.submenu.includes(e.id)  ) {
                      submenu[e.menu_id].push({ id: e.id, name : e.name, path: e.path, tab : e.tab === '' ? '' : JSON.parse(e.tab) });
                    }
                  }
                }
            })
          );
        });

        var tab = {};
        await Tab.findAll().then(async (value) => {
            await Promise.all(
              await value.map(async (e) => {
                tab = {...tab,...{[e.id] : { id : e.id, name : e.name, icon : e.icon, path: e.path, desc : e.desc }}};
              })
            );
        });

        var defaut_tab = {};
        // if( Object.keys(defaut_tab).length === 0 ) {

        // }

        return { menu_info : { menu , submenu, tab }, user_info : user_info };
    } catch (error) {

      console.log("^^^^^^^^^^^^^^^^^^^^^^");
      console.log(error);
      console.log("^^^^^^^^^^^^^^^^^^^^^^");
        return {}    
    }
  }
}

module.exports = Model_r;
