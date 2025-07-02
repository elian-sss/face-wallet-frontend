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
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen">
        <div class="p-4 md:p-8">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-3">Último Passo!</div>
                        <span v-if="usernameForVerification" class="text-muted-color font-medium">
                            Enviamos um código para o WhatsApp do usuário <strong>{{ usernameForVerification }}</strong>.
                        </span>
                    </div>

                    <form @submit.prevent="handleVerification" class="flex flex-col gap-5">
                        <div>
                            <label for="code" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Código de Verificação</label>
                            <InputText id="code" v-model="code" placeholder="Código de 6 dígitos" class="w-full md:w-[30rem] text-center" />
                        </div>
                        
                        <Button label="Verificar e Ativar Conta" type="submit" class="w-full mt-4" :loading="isLoading" />
                    </form>
                    
                    <div v-if="errorMessage" class="text-red-500 text-center mt-4">
                        {{ errorMessage }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>