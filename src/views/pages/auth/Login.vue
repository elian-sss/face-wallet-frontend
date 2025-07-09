<script setup>
import { useAuthStore } from '@/stores/authStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = () => {
    authStore.login({
        username: username.value,
        password: password.value
    });
};

const goToRegister = () => {
    router.push('/auth/register');
};
</script>

<template>
    <div class="login-container flex items-center justify-center min-h-screen p-4 overflow-hidden">
        
        <div class="glassmorphism-card w-full max-w-md text-white">
            
            <div class="text-center mb-10">
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white border-opacity-30">
                     <i class="pi pi-lock text-3xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold tracking-wider mb-2">Face Wallet</h1>
                <p class="text-gray-300 text-sm">Digite seus dados para continuar</p>
            </div>
            
            <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
                
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
                    <input 
                        id="username"
                        v-model="username"
                        type="text" 
                        class="form-input rounded"
                    />
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                     <input 
                        id="password"
                        v-model="password"
                        type="password"
                        class="form-input rounded"
                    />
                </div>

                <div class="text-right -mt-2">
                    <router-link to="/auth/forgot-password" class="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                        Esqueceu a senha?
                    </router-link>
                </div>

                <button 
                    type="submit" 
                    class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                    Entrar
                </button>

                <div class="my-2 flex items-center">
                    <div class="flex-grow border-t border-gray-600 border-opacity-50"></div>
                    <span class="flex-shrink mx-4 text-xs text-gray-400">Não tem uma conta?</span>
                    <div class="flex-grow border-t border-gray-600 border-opacity-50"></div>
                </div>

                <button 
                    type="button" 
                    @click="goToRegister"
                    class="w-full bg-gray-500 bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-3 rounded-lg transition-colors border border-gray-600"
                >
                    Criar Conta
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Fundo dinâmico com "aurora borealis" para o efeito de blur funcionar */
.login-container {
    background-color: #020617; /* slate-950 */
    background-image: 
        radial-gradient(at 20% 25%, hsla(212, 90%, 50%, 0.3) 0px, transparent 50%),
        radial-gradient(at 75% 30%, hsla(262, 80%, 55%, 0.25) 0px, transparent 50%),
        radial-gradient(at 5% 80%, hsla(162, 70%, 50%, 0.2) 0px, transparent 50%),
        radial-gradient(at 80% 95%, hsla(343, 80%, 55%, 0.25) 0px, transparent 50%);
}

/* Efeito Glassmorphism para o cartão de login */
.glassmorphism-card {
  background: rgba(15, 23, 42, 0.4); /* Cor de fundo semi-transparente (slate-900 com opacidade) */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Para compatibilidade com Safari */
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 1.5rem;
}

/* Estilo unificado para os inputs */
.form-input {
    width: 100%;
    padding: 0.75rem 0.5rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-input:focus {
    outline: none;
    border-bottom-color: var(--primary-color);
}
</style>