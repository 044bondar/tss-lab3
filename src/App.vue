<script setup lang="ts">
import Users from './components/Users.vue';
</script>

<template>
  <main class="app-layout">
    <header class="app-header">
      <h1>Лабораторна робота №3: Компоненти та директиви Vue 3</h1>
    </header>
    <Users />
  </main>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: #f8fafc;
}

.app-header {
  text-align: center;
  padding: 1.5rem 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}
</style>