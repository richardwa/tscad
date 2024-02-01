<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink class="link" to="/raymarch/sample.ts">Sample.ts</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.link {
  margin: 1rem;
}
</style>
