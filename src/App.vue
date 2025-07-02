<script setup>
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const authStore = useAuthStore();
onMounted(() => {
  authStore.init(); 
})
</script>

<template>
    <router-view />
</template>

<style scoped></style>
