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
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen">
        <div class="p-4 md:p-8 text-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-3">Verificação Facial</div>
                    <span class="text-muted-color font-medium">Para sua segurança, precisamos confirmar sua identidade.</span>

                    <div class="mt-8 flex flex-col items-center gap-5">
                        <Button label="Abrir Câmera" icon="pi pi-camera" @click="openCamera" class="w-full md:w-[20rem]" />
                        
                        <div v-if="capturedImagePreview" class="mt-4">
                            <img :src="capturedImagePreview" alt="Foto Capturada" class="w-48 h-48 rounded-full object-cover border-4 border-primary-500" />
                        </div>

                        <Button 
                            v-if="capturedImageFile" 
                            label="Confirmar e Acessar" 
                            @click="handleFaceVerification"
                            :loading="isLoading" 
                            class="w-full md:w-[20rem] mt-4" 
                        />
                    </div>
                     <div v-if="errorMessage" class="text-red-500 text-center mt-4">
                        {{ errorMessage }}
                    </div>
                     <div class="mt-8">
                        <Button label="Sair e voltar para o Login" @click="authStore.logout()" text severity="secondary" />
                    </div>
                </div>
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