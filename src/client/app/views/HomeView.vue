<script setup lang="ts">
import { onMounted, ref } from 'vue'

const files = ref<string[]>([])
onMounted(async () => {
  const resp = await fetch('/ls')
  files.value = await resp.json()
})
</script>
<template>
  <main class="grid">
    <div v-for="file in files" :key="file">
      <RouterLink :to="`/raymarch/${file}`">
        <button>
          {{ file }}
        </button>
      </RouterLink>
    </div>
  </main>
</template>
