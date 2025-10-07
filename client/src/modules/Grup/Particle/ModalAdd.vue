<template>
  <Form
    :form-status="isOpen"
    :label="'Tambah Grup Baru'"
    width="sm:w-full sm:max-w-md"
    @close="closeModal"
    @cancel="closeModal"
    @submit="saveGroup"
    :submitLabel="'TAMBAH GRUP'"
  >
    <div class="py-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Grup</label>
        <input
          v-model="groupData.name"
          type="text"
          class="w-full border rounded-md px-3 py-2 text-gray-700"
          placeholder="Nama Grup"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Cabang</label>
        <select
          v-model="groupData.branchName"
          class="w-full border rounded-md px-3 py-2 text-gray-700 bg-white"
        >
          <option value="" disabled>Pilih Cabang</option>
          <option
            class="text-gray-700"
            v-for="cabang in cabangs"
            :key="cabang.name"
            :value="cabang.name"
          >
            {{ cabang.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Menu</label>
        <div v-for="menu in menus" :key="menu.id" class="mb-2">
          <label class="flex items-center text-gray-700">
            <input
              type="checkbox"
              v-model="selectedMenus"
              :value="menu.id"
              class="mr-2 text-gray-700"
            />
            {{ menu.name }}
          </label>
          <div v-if="menu.Submenus.length" class="ml-4 text-gray-700">
            <label
              v-for="submenu in menu.Submenus"
              :key="submenu.id"
              class="flex items-center text-gray-700"
            >
              <input
                type="checkbox"
                v-model="selectedSubmenus"
                :value="submenu.id"
                class="mr-2 text-gray-700"
              />
              {{ submenu.name }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, reactive, ref, onMounted } from 'vue';
import { daftarMenu } from '@/service/grup';
import { daftarCabang } from '@/service/cabang';
import Form from '@/components/Modal/Form.vue';

interface ErrorFields {
  nameGrup?: string;
  cabangId?: string;
}

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'save']);

// Data grup
const groupData = reactive({ name: '', branchName: '' });
const menus = ref<any[]>([]);
const cabangs = ref<any[]>([]);
const selectedMenus = ref<number[]>([]);
const selectedSubmenus = ref<number[]>([]);
const errors = ref<ErrorFields>({
  nameGrup: '',
  cabangId: '',
});

// Fetch data cabang
const fetchCabang = async () => {
  try {
    const response = await daftarCabang();
    cabangs.value = response.data;
    console.log('ini adalah data cabang', cabangs.value);
  } catch (error) {
    console.error('Error fetching cabang:', error);
  }
};

// Fetch data menu
const fetchMenu = async () => {
  try {
    const response = await daftarMenu();
    menus.value = response;
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
};

// Tutup modal
const closeModal = () => {
  emit('close');
};

// Validasi form
const validateForm = (): boolean => {
  errors.value = {
    nameGrup: '',
    cabangId: '',
  };

  let isValid = true;

  if (!groupData.name.trim()) {
    errors.value.nameGrup = 'Nama tidak boleh kosong';
    isValid = false;
  }

  if (groupData.branchName == '0') {
    errors.value.cabangId = 'Anda wajib memilih salah satu cabang';
    isValid = false;
  }

  return isValid;
};

// Simpan data dan kirim ke parent
const saveGroup = () => {
  if (!validateForm()) {
    return;
  }

  const formattedData = {
    division_name: groupData.branchName,
    name: groupData.name,
    group_acces: menus.value
      .filter((menu) => selectedMenus.value.includes(menu.id))
      .map((menu) => ({
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        Submenus: menu.Submenus.filter((submenu) =>
          selectedSubmenus.value.includes(submenu.id),
        ).map((submenu) => ({
          id: submenu.id,
          menu_id: menu.id,
          name: submenu.name,
          path: submenu.path,
        })),
      })),
  };

  emit('save', formattedData);
  closeModal();
};

// Panggil fungsi fetch saat komponen dimount
onMounted(() => {
  fetchMenu();
  fetchCabang();
});
</script>
