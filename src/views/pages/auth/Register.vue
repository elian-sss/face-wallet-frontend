<script setup>
import { useAuthStore } from '@/stores/authStore';
import { nextTick, ref } from 'vue';

const username = ref('');
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const capturedImageFile = ref(null); 
const capturedImagePreview = ref(null); 

const isCameraOpen = ref(false);
const videoElement = ref(null);

const registrationStep = ref(1);
const verificationCode = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);

const authStore = useAuthStore();


const openCamera = async () => {
    isCameraOpen.value = true;
    await nextTick(); 
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.value.srcObject = stream;
    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        errorMessage.value = "Não foi possível acessar a câmera. Verifique as permissões do navegador.";
        isCameraOpen.value = false;
    }
};

const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        capturedImageFile.value = new File([blob], "face_photo.jpg", { type: "image/jpeg" });
        
        capturedImagePreview.value = URL.createObjectURL(capturedImageFile.value);
        
        closeCamera();
    }, 'image/jpeg');
};

const closeCamera = () => {
    const stream = videoElement.value?.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    isCameraOpen.value = false;
};


const handleRegister = async () => {
    if (!capturedImageFile.value) {
        errorMessage.value = "Por favor, tire uma foto para o registro facial.";
        return;
    }
    
    isLoading.value = true;
    errorMessage.value = null;

    const formData = new FormData();
    formData.append('username', username.value);
    formData.append('first_name', firstName.value);
    formData.append('last_name', lastName.value);
    formData.append('email', email.value);
    formData.append('password', password.value);
    formData.append('phone_number', phoneNumber.value);
    formData.append('face_image', capturedImageFile.value);

    try {
        await authStore.register(formData);
        registrationStep.value = 2;
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro no registro.";
    } finally {
        isLoading.value = false;
    }
};

const handleVerification = async () => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
        await authStore.verifyPhone({
            username: username.value,
            code: verificationCode.value,
        });
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
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-8 px-5 sm:px-8" style="border-radius: 53px">

                    <div v-if="registrationStep === 1">
                        <div class="text-center mb-5">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-3">Registrar Conta</div>
                            <span class="text-muted-color font-medium">Preencha seus dados para começar</span>
                        </div>
                        
                        <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
                            <InputText v-model="username" placeholder="Nome de Usuário" />
                            <InputText v-model="firstName" placeholder="Primeiro Nome" />
                            <InputText v-model="lastName" placeholder="Sobrenome" />
                            <InputText v-model="email" type="email" placeholder="E-mail" />
                            <Password v-model="password" placeholder="Senha" :toggleMask="true" :feedback="false" />
                            <InputText v-model="phoneNumber" placeholder="Telefone (ex: 5511999999999)" />

                            <div class="flex flex-col md:flex-row items-center gap-4">
                                <Button label="Tirar Foto" icon="pi pi-camera" class="w-full" severity="secondary" @click="openCamera" type="button" />
                                <div v-if="capturedImagePreview" class="mt-4 md:mt-0">
                                    <img :src="capturedImagePreview" alt="Foto Capturada" class="w-24 h-24 rounded-full object-cover">
                                </div>
                            </div>
                            
                            <Button label="Registrar" type="submit" class="w-full mt-4" :loading="isLoading" />
                             <router-link to="/auth/login" class="font-medium no-underline text-primary text-center cursor-pointer mt-4">Já tem uma conta?</router-link>
                        </form>
                    </div>

                    <div v-if="registrationStep === 2">
                         <div class="text-center mb-5">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-3">Verifique seu Telefone</div>
                            <span class="text-muted-color font-medium">Digite o código de 6 dígitos que enviamos para o seu WhatsApp.</span>
                        </div>

                        <form @submit.prevent="handleVerification" class="flex flex-col gap-4">
                             <InputText v-model="verificationCode" placeholder="Código de Verificação" class="text-center" />
                             <Button label="Verificar Código" type="submit" class="w-full mt-4" :loading="isLoading" />
                        </form>
                    </div>
                    
                    <div v-if="errorMessage" class="text-red-500 text-center mt-4">
                        {{ errorMessage }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="isCameraOpen" modal header="Câmera" :style="{ width: '90vw', maxWidth: '600px' }" @hide="closeCamera">
        <div class="flex flex-col items-center">
            <video ref="videoElement" autoplay playsinline class="w-full rounded"></video>
            <Button label="Capturar" icon="pi pi-camera" class="mt-4" @click="captureImage" />
        </div>
    </Dialog>
</template>