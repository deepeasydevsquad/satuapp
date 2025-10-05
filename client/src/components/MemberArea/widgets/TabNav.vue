
<template>
  <div class="w-screen h-screen items-center justify-center">
    <ul class="flex border-b">
      <li v-for="tab in tabs" :key="tab" class="mr-1">
        <a
          class="inline-block px-4 py-2 font-semibold"
          :class="{
            'bg-blue-500 text-white': tab === selected,
            'text-blue-500 hover:text-blue-800': tab !== selected,
          }"
          @click="setTab(tab)"
        >
          {{ tab }}
        </a>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script >
export default {
   props: {
   	  tabs: {
   	  	 type: Array,
   	  	 required: true,
   	  },
   	  selected: {
   	  	type: String,
   	  	required: true,
   	  }
   },
   methods: {
   	 setTab(tab) {
   	 	this.$emit('selected', tab);
   	 }
   }
}
	
</script>