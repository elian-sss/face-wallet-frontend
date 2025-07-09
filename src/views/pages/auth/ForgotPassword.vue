<script setup>
import { useAuthStore } from '@/stores/authStore';
import { ref } from 'vue';

const resetStep = ref(1);
const email = ref('');
const code = ref('');
const password = ref('');
const password2 = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);
const authStore = useAuthStore();

const handleRequestReset = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    successMessage.value = null;
    try {
        await authStore.requestPasswordReset({ email: email.value });
        successMessage.value = "Código enviado! Verifique seu WhatsApp e prossiga.";
        resetStep.value = 2;
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro ao solicitar o código.";
    } finally {
        isLoading.value = false;
    }
};

const handleConfirmReset = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
        await authStore.confirmPasswordReset({
            code: code.value,
            password: password.value,
            password2: password2.value,
        });
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro na confirmação.";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="page-container flex items-center justify-center min-h-screen p-4 overflow-hidden">
        <div class="glassmorphism-card w-full max-w-md text-white">

            <div v-if="resetStep === 1">
                <div class="text-center mb-10">
                    <h1 class="text-3xl font-bold tracking-wider mb-2">Redefinir Senha</h1>
                    <p class="text-gray-300 text-sm">Digite seu e-mail para receber o código de recuperação no WhatsApp.</p>
                </div>
                <form @submit.prevent="handleRequestReset" class="flex flex-col gap-6">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-300 mb-2">E-mail de Cadastro</label>
                        <input id="email" v-model="email" type="email" class="form-input" />
                    </div>
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                        <span v-if="isLoading">Enviando...</span>
                        <span v-else>Enviar Código</span>
                    </button>
                </form>
            </div>

            <div v-if="resetStep === 2">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold tracking-wider mb-2">Crie sua Nova Senha</h1>
                    <p class="text-gray-300 text-sm">Digite o código recebido e sua nova senha.</p>
                </div>
                <form @submit.prevent="handleConfirmReset" class="flex flex-col gap-6">
                    <div>
                        <label for="code" class="block text-sm font-medium text-gray-300 mb-2">Código de Verificação</label>
                        <input id="code" v-model="code" type="text" class="form-input text-center tracking-widest" />
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
                        <input id="password" v-model="password" type="password" class="form-input" />
                    </div>
                    <div>
                        <label for="password2" class="block text-sm font-medium text-gray-300 mb-2">Confirme a Nova Senha</label>
                        <input id="password2" v-model="password2" type="password" class="form-input" />
                    </div>
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                        <span v-if="isLoading">Salvando...</span>
                        <span v-else>Redefinir Senha</span>
                    </button>
                </form>
            </div>

            <div v-if="errorMessage" class="text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-lg text-center mt-6">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage && !errorMessage" class="text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-lg text-center mt-6">
                {{ successMessage }}
            </div>

            <div class="text-center mt-6">
                 <router-link to="/auth/login" class="text-sm font-medium text-gray-400 hover:text-white transition-colors">Voltar para o Login</router-link>
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