<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <main class="container">
    <header>
      <div class="wrapper">
        <nav>
          <ul>
            <li>
              <RouterLink to="/">Home</RouterLink>
            </li>
            <li>
              <RouterLink to="/raymarch/sample.ts">Viewer</RouterLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    <RouterView />
  </main>
</template>
