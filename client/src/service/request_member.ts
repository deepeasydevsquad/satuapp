import api from "./api"; // Import service API

export const list = async (param : any) => {
  try {
    const response = await api.post("/request_member/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal:", error);
    throw error;
  }
};

export const setujuiRequestMemberUrl = async (id : number) => {
  try {
    const response = await api.post("/request_member/setujuiRequestMember", { id : id });
    return response.data;
  } catch (error) {
    console.error("Gagal:", error);
    throw error;
  }
};

export const rejectRequestMemberUrl = async (id : number) => {
  try {
    const response = await api.post("/request_member/rejectRequestMember", { id : id });
    return response.data;
  } catch (error) {
    console.error("Gagal:", error);
    throw error;
  }
};

// export const add = async (param : any) => {
//   try {
//     const response = await api.post("/kostumer/add", param);
//     return response.data;
//   } catch (error) {
//     console.error("Gagal menambahkan kostumer:", error);
//     throw error;
//   }
// };

// export const edit = async (id : any, param : any) => {
//   try {
//     const response = await api.post(`/kostumer/update` , {...param,...{id : id }});
//     return response.data;
//   } catch (error) {
//     console.error("Gagal mengedit kostumer:", error);
//     throw error;
//   }
// };

// export const deleteKostumer = async (id : number) => {
//   try {
//     const response = await api.post(`/kostumer/delete`,{ id : id});
//     return response.data;
//   } catch (error) {
//     console.error("Gagal menghapus kostumer:", error);
//     throw error;
//   }
// };

