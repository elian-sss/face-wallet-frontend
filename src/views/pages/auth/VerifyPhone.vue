<script setup>
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { computed, ref } from 'vue';

const code = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);
const authStore = useAuthStore();
const usernameForVerification = computed(() => authStore.userForVerification);

if (!usernameForVerification.value) {
    router.push('/auth/register');
}

const handleVerification = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
        await authStore.verifyPhone(code.value);
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro na verificação.";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="page-container flex items-center justify-center min-h-screen p-4 overflow-hidden">
        <div class="glassmorphism-card w-full max-w-md text-white">

            <div class="text-center mb-10">
                 <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white border-opacity-30">
                     <i class="pi pi-whatsapp text-4xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold tracking-wider mb-2">Último Passo!</h1>
                <p v-if="usernameForVerification" class="text-gray-300 text-sm">
                    Enviamos um código para o WhatsApp do usuário <strong>{{ usernameForVerification }}</strong>.
                </p>
            </div>

            <form @submit.prevent="handleVerification" class="flex flex-col gap-6">
                <div>
                    <label for="code" class="block text-sm font-medium text-gray-300 mb-2">Código de Verificação</label>
                    <input id="code" v-model="code" type="text" placeholder="------" class="form-input text-center text-3xl tracking-[1rem]" />
                </div>
                <button type="submit" :disabled="isLoading" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                    <span v-if="isLoading">Verificando...</span>
                    <span v-else>Verificar e Ativar Conta</span>
                </button>
            </form>
            
            <div v-if="errorMessage" class="text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-lg text-center mt-6">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container {
    background-color: #020617;
    background-image: 
        radial-gradient(at 20% 25%, hsla(212, 90%, 50%, 0.3) 0px, transparent 50%),
        radial-gradient(at 75% 30%, hsla(262, 80%, 55%, 0.25) 0px, transparent 50%);
}
.glassmorphism-card {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 1.5rem;
}
.form-input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
}
.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.3);
}
</style>