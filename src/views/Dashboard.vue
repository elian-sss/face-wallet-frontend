<script setup>
import cardService from '@/service/cardService';
import { useAuthStore } from '@/stores/authStore';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const cards = ref([]);
const isLoading = ref(true);

const userName = computed(() => authStore.user?.email || 'Usuário');
const cardCount = computed(() => cards.value.length);
const recentCards = computed(() => cards.value.slice(-3).reverse());

const fetchData = async () => {
    isLoading.value = true;
    try {
        const response = await cardService.getCards();
        cards.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar dados para o dashboard:", error);
    } finally {
        isLoading.value = false;
    }
};

const goToCardsPage = () => {
    router.push('/cards');
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div>
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Bem-vindo de Volta, <span class="text-primary-500">{{ userName.split('@')[0] }}</span>!</h1>
            <p class="text-gray-500 dark:text-gray-400">Aqui está o resumo da sua carteira digital.</p>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6 lg:col-4">
                <div class="p-6 rounded-lg bg-white dark:bg-surface-800 shadow-md flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <i class="pi pi-credit-card text-2xl text-blue-500"></i>
                    </div>
                    <div>
                        <span class="text-gray-500 dark:text-gray-400 font-medium">Meus Cartões</span>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ cardCount }} Cadastrados</p>
                    </div>
                </div>
            </div>
            
            <div class="col-12 md:col-6 lg:col-4">
                <div class="p-6 rounded-lg bg-white dark:bg-surface-800 shadow-md flex items-center gap-4">
                     <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <i class="pi pi-shield text-2xl text-green-500"></i>
                    </div>
                    <div>
                        <span class="text-gray-500 dark:text-gray-400 font-medium">Segurança</span>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white mt-1">Conta Verificada</p>
                    </div>
                </div>
            </div>

            <div class="col-12 lg:col-4">
                 <div class="p-6 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors shadow-md flex items-center justify-center h-full cursor-pointer" @click="goToCardsPage">
                    <div class="text-center">
                        <i class="pi pi-plus-circle text-white text-4xl mb-2"></i>
                        <p class="text-xl font-bold text-white">Adicionar Novo Cartão</p>
                    </div>
                 </div>
            </div>
        </div>

        <div class="grid mt-4">
            <div class="col-12 lg:col-5">
                <div class="card h-full">
                    <h5 class="font-bold">Cartões Recentes</h5>
                    <ul class="list-none p-0 m-0 mt-4">
                         <li v-if="isLoading" class="text-center p-3">
                            <i class="pi pi-spin pi-spinner text-2xl"></i>
                        </li>
                        <li v-else-if="recentCards.length === 0" class="text-center p-3 text-gray-500 dark:text-gray-400">
                            Nenhum cartão cadastrado.
                        </li>
                        <li v-for="card in recentCards" :key="card.id" class="flex items-center p-3 border-t border-gray-200 dark:border-surface-700">
                            <i class="pi pi-credit-card text-2xl text-primary-500 mr-4"></i>
                            <div>
                                <span class="font-semibold text-gray-800 dark:text-white">{{ card.card_holder_name }}</span>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Final {{ card.card_number.slice(-4) }}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>