import api from "./api";

export const getDaftarPermintaanDepositMember = async (param: any) => {
  try {
    const response = await api.post('/permintaan-deposit-member/daftar-permintaan-deposit-member', param);
    return response.data;
  } catch (error) {
    console.error('Error fetching Daftar Deposit:', error);
    throw error;
  }
}

export const updateStatusRequestDepositMember = async (param: any) => {
  try {
    const response = await api.post('/permintaan-deposit-member/update-request-deposit-member', param);
    return response.data;
  } catch (error) {
    console.error('Error updating status permintaan deposit member:', error);
    throw error;
  }
}

export const deleteRequestDepositMember = async (id: number) => {
  try {
    const response = await api.post('/permintaan-deposit-member/delete-request-deposit-member', { id });
    return response.data;
  } catch (error) {
    console.error('Error deleting permintaan deposit member:', error);
    throw error;
  }
}
