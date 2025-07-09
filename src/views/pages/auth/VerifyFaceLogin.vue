<script setup>
import { useAuthStore } from '@/stores/authStore';
import { nextTick, ref } from 'vue';

const isCameraOpen = ref(false);
const videoElement = ref(null);
const capturedImageFile = ref(null);
const capturedImagePreview = ref(null);
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
        errorMessage.value = "Não foi possível acessar a câmera. Verifique as permissões.";
        isCameraOpen.value = false;
    }
};

const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;
    canvas.getContext('2d').drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        capturedImageFile.value = new File([blob], "face_login_photo.jpg", { type: "image/jpeg" });
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

const handleFaceVerification = async () => {
    if (!capturedImageFile.value) {
        errorMessage.value = "Por favor, tire uma foto para a verificação.";
        return;
    }
    isLoading.value = true;
    errorMessage.value = null;
    const formData = new FormData();
    formData.append('face_image', capturedImageFile.value);
    try {
        await authStore.verifyFace(formData);
    } catch (error) {
        errorMessage.value = error.response?.data?.detail || "Ocorreu um erro na verificação.";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="page-container flex items-center justify-center min-h-screen p-4 overflow-hidden">
        <div class="glassmorphism-card w-full max-w-md text-white text-center">
            <div class="mb-8">
                <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white border-opacity-30">
                     <i class="pi pi-user-check text-4xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold tracking-wider mb-2">Verificação Facial</h1>
                <p class="text-gray-300 text-sm">Para sua segurança, um último passo.</p>
            </div>
            
            <div class="flex flex-col items-center gap-5">
                <button @click="openCamera" type="button" class="w-full bg-gray-500 bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-gray-600">
                    <i class="pi pi-camera mr-2"></i>
                    Abrir Câmera
                </button>
                
                <div v-if="capturedImagePreview" class="mt-4">
                    <img :src="capturedImagePreview" alt="Foto Capturada" class="w-48 h-48 rounded-full object-cover border-4 border-primary-400" />
                </div>

                <button 
                    v-if="capturedImageFile" 
                    @click="handleFaceVerification"
                    :disabled="isLoading"
                    class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                    <span v-if="isLoading">Verificando...</span>
                    <span v-else>Confirmar e Acessar</span>
                </button>
            </div>
            
            <div v-if="errorMessage" class="text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-lg text-center mt-6">
                {{ errorMessage }}
            </div>

            <div class="mt-8">
                <button @click="authStore.logout()" class="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sair e voltar para o Login</button>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="isCameraOpen" modal header="Câmera" :style="{ width: '90vw', maxWidth: '600px' }" @hide="closeCamera">
        <div class="flex flex-col items-center">
            <video ref="videoElement" autoplay playsinline class="w-full rounded"></video>
            <Button label="Capturar Rosto" icon="pi pi-camera" class="mt-4" @click="captureImage" />
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
}
</style>