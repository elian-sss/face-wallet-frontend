<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
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
    password: password.value,
  });
};

const goToRegister = () => {
    router.push('/auth/register');
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                            </svg>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">FaceWallet</div>
                        <span class="text-muted-color font-medium">Faça login para continuar</span>
                    </div>

                    <form @submit.prevent="handleLogin">
                        <div>
                            <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Usuário</label>
                            <InputText id="username" type="text" placeholder="Seu nome de usuário" class="w-full md:w-[30rem] mb-8" v-model="username" />

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Senha</label>
                            <Password id="password" v-model="password" placeholder="Sua senha" :toggleMask="true" class="mb-4" :feedback="false" inputClass="w-full md:w-[30rem]" fluid></Password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <router-link to="/auth/forgot-password" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">
                                    Esqueceu a senha?
                                </router-link>
                            </div>
                            
                            <Button label="Login" type="submit" class="w-full"></Button>
                             <Button label="Criar Conta" severity="secondary" outlined class="w-full" @click="goToRegister"></Button>
                        </div>
                    </form>
                    </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
