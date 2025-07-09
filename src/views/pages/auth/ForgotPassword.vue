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
    try {
        await authStore.requestPasswordReset({ email: email.value });
        successMessage.value = "Código enviado! Verifique seu WhatsApp e prossiga para a próxima etapa.";
        resetStep.value = 2;
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro.";
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
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen">
        <div class="p-4 md:p-8">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">

                    <div v-if="resetStep === 1">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-3">Redefinir Senha</div>
                            <span class="text-muted-color font-medium">Digite seu e-mail para receber o código de recuperação no WhatsApp.</span>
                        </div>
                        <form @submit.prevent="handleRequestReset" class="flex flex-col gap-5">
                            <div>
                                <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">E-mail</label>
                                <InputText id="email" v-model="email" type="email" placeholder="Seu e-mail de cadastro" class="w-full md:w-[30rem]" />
                            </div>
                            <Button label="Enviar Código de Recuperação" type="submit" class="w-full mt-4" :loading="isLoading" />
                        </form>
                    </div>

                    <div v-if="resetStep === 2">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-3">Crie sua Nova Senha</div>
                            <span class="text-muted-color font-medium">Digite o código recebido e sua nova senha.</span>
                        </div>
                        <form @submit.prevent="handleConfirmReset" class="flex flex-col gap-5">
                            <div>
                                <label for="code" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Código de Verificação</label>
                                <InputText id="code" v-model="code" placeholder="Código de 6 dígitos" class="w-full md:w-[30rem]" />
                            </div>
                             <div>
                                <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Nova Senha</label>
                                <Password id="password" v-model="password" placeholder="Digite a nova senha" :toggleMask="true" class="w-full" :feedback="false" inputClass="w-full md:w-[30rem]"></Password>
                            </div>
                             <div>
                                <label for="password2" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirme a Nova Senha</label>
                                <Password id="password2" v-model="password2" placeholder="Confirme a nova senha" :toggleMask="true" class="w-full" :feedback="false" inputClass="w-full md:w-[30rem]"></Password>
                            </div>
                            <Button label="Redefinir Senha" type="submit" class="w-full mt-4" :loading="isLoading" />
                        </form>
                    </div>
                     <div v-if="errorMessage" class="text-red-500 text-center mt-4">
                        {{ errorMessage }}
                    </div>
                     <div v-if="successMessage && !errorMessage" class="text-green-500 text-center mt-4">
                        {{ successMessage }}
                    </div>
                     <router-link to="/auth/login" class="font-medium no-underline text-primary text-center cursor-pointer mt-6 block">Voltar para o Login</router-link>
                </div>
            </div>
        </div>
    </div>
</template>