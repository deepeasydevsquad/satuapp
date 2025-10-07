<template>
  <Form
    :form-status="isOpen"
    :label="'Update Grup'"
    width="sm:w-full sm:max-w-md"
    @close="closeModal"
    @cancel="closeModal"
    @submit="saveGroup"
    :submitLabel="'UPDATE GRUP'"
  >
    <div class="py-6 space-y-4" :key="selectedMenus.length">
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
          <option v-for="cabang in cabangs" :key="cabang.name" :value="cabang.name">
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
              :checked="isMenuSelected(menu.id)"
              @change="toggleMenu(menu.id)"
              class="mr-2 text-gray-700"
            />
            {{ menu.name }}
          </label>
          <div v-if="menu.Submenus?.length" class="ml-4 text-gray-700">
            <label v-for="submenu in menu.Submenus" :key="submenu.id" class="flex items-center">
              <input
                type="checkbox"
                :checked="isSubmenuSelected(submenu.id)"
                @change="toggleSubmenu(submenu.id)"
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
import { defineProps, defineEmits, reactive, ref, onMounted, watch, nextTick } from 'vue';
import { daftarMenu } from '@/service/grup';
import { daftarCabang } from '@/service/cabang';
import Form from '@/components/Modal/Form.vue';

const props = defineProps<{
  isOpen: boolean;
  grupToUpdate?: any;
}>();
const emit = defineEmits(['close', 'save']);

const groupData = reactive({ name: '', branchName: '' });

const menus = ref<any[]>([]);
const cabangs = ref<any[]>([]);
const selectedMenus = ref<number[]>([]);
const selectedSubmenus = ref<number[]>([]);

// Fetch data cabang
const fetchCabang = async () => {
  try {
    const response = await daftarCabang();
    cabangs.value = response.data;
  } catch (error) {
    console.error('Error fetching cabang:', error);
  }
};

// Fetch data menu
const fetchMenu = async () => {
  try {
    const response = await daftarMenu();
    menus.value = response.map((menu) => ({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      Submenus: menu.Submenus || [],
    }));
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
};

// Isi form dengan data grup yang akan diupdate
watch(
  () => props.grupToUpdate,
  async (newVal) => {
    if (newVal) {
      groupData.name = newVal.name;
      groupData.branchName = newVal.division;

      selectedMenus.value = newVal.group_access?.map((menu) => menu.id) || [];
      selectedSubmenus.value =
        newVal.group_access?.flatMap((menu) => menu.Submenus?.map((submenu) => submenu.id)) || [];

      await nextTick(); // Paksa Vue buat update tampilan
      console.log('Updated selectedMenus:', selectedMenus.value);
      console.log('Updated selectedSubmenus:', selectedSubmenus.value);
    }
  },
  { deep: true, immediate: true },
);

// Cek apakah menu/submenu terpilih
const isMenuSelected = (menuId: number) => selectedMenus.value.includes(menuId);
const isSubmenuSelected = (submenuId: number) => selectedSubmenus.value.includes(submenuId);

// Toggle menu selection
const toggleMenu = (menuId: number) => {
  if (selectedMenus.value.includes(menuId)) {
    selectedMenus.value = selectedMenus.value.filter((id) => id !== menuId);
  } else {
    selectedMenus.value.push(menuId);
  }
  console.log('Updated selectedMenus:', selectedMenus.value);
};

// Toggle submenu selection
const toggleSubmenu = (submenuId: number) => {
  if (selectedSubmenus.value.includes(submenuId)) {
    selectedSubmenus.value = selectedSubmenus.value.filter((id) => id !== submenuId);
  } else {
    selectedSubmenus.value.push(submenuId);
  }
  console.log('Updated selectedSubmenus:', selectedSubmenus.value);
};

// Tutup modal
const closeModal = () => {
  emit('close');
};

// Simpan data
const saveGroup = () => {
  const formattedData = {
    id: props.grupToUpdate?.id,
    division_name: groupData.branchName,
    name: groupData.name,
    group_access: menus.value
      .filter((menu) => selectedMenus.value.includes(menu.id))
      .map((menu) => ({
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        Submenus:
          menu.Submenus?.filter((submenu) => selectedSubmenus.value.includes(submenu.id)).map(
            (submenu) => ({
              id: submenu.id,
              menu_id: menu.id,
              name: submenu.name,
              path: submenu.path,
            }),
          ) || [],
      })),
  };

  emit('save', formattedData);
  closeModal();
};

// Fetch data saat komponen dimount
onMounted(() => {
  fetchMenu();
  fetchCabang();
});
</script>
