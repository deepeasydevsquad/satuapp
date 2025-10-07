<template>
  <div>
    <label for="whatsappNumber">Nomor WhatsApp:</label>
    <input type="text" id="whatsappNumber" v-model="whatsappNumber" />

    <button @click="requestOtp">Dapatkan OTP</button>

    <label for="otp">Masukkan OTP:</label>
    <input type="text" id="otp" v-model="otp" />

    <button @click="submitOtp">Submit OTP</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      whatsappNumber: '',
      otp: '',
    }
  },
  methods: {
    async requestOtp() {
      if (!this.whatsappNumber) {
        alert('Silakan masukkan nomor WhatsApp Anda.')
        return
      }
      try {
        const response = await axios.post('/send-otp', { whatsappNumber: this.whatsappNumber })
        alert('OTP berhasil dikirim!')
      } catch (error) {
        console.error('Gagal mengirim OTP:', error)
        alert('Gagal mengirim OTP.')
      }
    },
    async submitOtp() {
      if (!this.otp) {
        alert('Silakan masukkan OTP Anda.')
        return
      }
      try {
        const response = await axios.post('/verify-otp', {
          whatsappNumber: this.whatsappNumber,
          otp: this.otp,
        })
        alert('OTP berhasil diverifikasi!')
      } catch (error) {
        console.error('OTP tidak valid atau sudah kedaluwarsa:', error)
        alert('OTP tidak valid atau sudah kedaluwarsa.')
      }
    },
  },
}
</script>

<style scoped>
/* Tambahkan gaya Anda di sini */
label {
  display: block;
  margin-top: 10px;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
