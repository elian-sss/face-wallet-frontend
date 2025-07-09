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
        errorMessage.value = error.message || "Ocorreu um erro no registro.";
    } finally {
        isLoading.value = false;
    }
};

const handleVerification = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
        await authStore.verifyPhone(verificationCode.value);
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro na verificação.";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="page-container flex items-center justify-center min-h-screen p-4 overflow-hidden">
        <div class="glassmorphism-card w-full max-w-lg text-white">

            <div v-if="registrationStep === 1">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold tracking-wider mb-2">Crie sua Conta</h1>
                    <p class="text-gray-300 text-sm">Insira seus dados para começar</p>
                </div>
                
                <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input v-model="firstName" type="text" placeholder="Primeiro Nome" class="form-input" />
                        <input v-model="lastName" type="text" placeholder="Sobrenome" class="form-input" />
                    </div>
                    <input v-model="username" type="text" placeholder="Nome de Usuário" class="form-input" />
                    <input v-model="email" type="email" placeholder="E-mail" class="form-input" />
                    <input v-model="password" type="password" placeholder="Senha" class="form-input" />
                    <input v-model="phoneNumber" type="tel" placeholder="Telefone (55119...)" class="form-input" />

                    <div class="flex items-center gap-4 p-2 rounded-lg bg-white bg-opacity-10">
                        <button @click="openCamera" type="button" class="flex-grow bg-gray-500 bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-gray-600">
                            <i class="pi pi-camera mr-2"></i>
                            Capturar Rosto
                        </button>
                        <div v-if="capturedImagePreview" class="flex-shrink-0">
                            <img :src="capturedImagePreview" alt="Foto Capturada" class="w-16 h-16 rounded-full object-cover border-2 border-primary-400">
                        </div>
                    </div>
                    
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                        <span v-if="isLoading">Registrando...</span>
                        <span v-else>Registrar</span>
                    </button>
                    <div class="text-center mt-2">
                         <router-link to="/auth/login" class="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                            Já tem uma conta? Faça Login
                        </router-link>
                    </div>
                </form>
            </div>

            <div v-if="registrationStep === 2">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold tracking-wider mb-2">Verifique seu Telefone</h1>
                    <p class="text-gray-300 text-sm">Digite o código que enviamos para seu WhatsApp.</p>
                </div>

                <form @submit.prevent="handleVerification" class="flex flex-col gap-5">
                    <input v-model="verificationCode" type="text" placeholder="Código de 6 dígitos" class="form-input text-center text-2xl tracking-widest" />
                    <button type="submit" :disabled="isLoading" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                        <span v-if="isLoading">Verificando...</span>
                        <span v-else>Verificar e Ativar</span>
                    </button>
                </form>
            </div>
            
            <div v-if="errorMessage" class="text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-lg text-center mt-6">
                {{ errorMessage }}
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
  width: 100%;
  max-width: 550px;
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