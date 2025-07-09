<script setup>
import cardService from '@/service/cardService';
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref } from 'vue';

// --- Estado do Componente ---
const cards = ref([]);
const isLoading = ref(true);
const cardDialog = ref(false);
const currentCard = ref({});
const isEditing = ref(false);
const confirm = useConfirm();

// --- FUNÇÃO ADICIONADA para formatar o número do cartão ---
const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    // Adiciona um espaço a cada 4 dígitos
    return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
};

// --- Funções de API ---
const fetchCards = async () => {
    isLoading.value = true;
    try {
        const response = await cardService.getCards();
        cards.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
    } finally {
        isLoading.value = false;
    }
};

// --- Funções de Interação (Event Handlers) ---
const openNew = () => {
    currentCard.value = {};
    isEditing.value = false;
    cardDialog.value = true;
};

const editCard = (cardToEdit) => {
    currentCard.value = { ...cardToEdit };
    isEditing.value = true;
    cardDialog.value = true;
};

const hideDialog = () => {
    cardDialog.value = false;
    currentCard.value = {};
};

const saveCard = async () => {
    isLoading.value = true;
    try {
        if (isEditing.value) {
            await cardService.updateCard(currentCard.value.id, currentCard.value);
        } else {
            await cardService.createCard(currentCard.value);
        }
        
        hideDialog();
        await fetchCards(); 

    } catch (error) {
        console.error("Erro ao salvar o cartão:", error.response?.data);
        isLoading.value = false;
    } 
};

const confirmDeleteCard = (cardToDelete) => {
    confirm.require({
        message: 'Você tem certeza que quer deletar este cartão?',
        header: 'Confirmação de Exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim, deletar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                await cardService.deleteCard(cardToDelete.id);
                cards.value = cards.value.filter(card => card.id !== cardToDelete.id);
            } catch (error) {
                console.error("Erro ao deletar o cartão:", error);
            }
        }
    });
};

onMounted(() => {
    fetchCards();
});

console.log(cards)
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Adicionar Cartão" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>
                </Toolbar>

                <div class="grid" v-if="!isLoading && cards.length > 0">
                    <div v-for="card in cards" :key="card.id" class="col-12 md:col-6 lg:col-4 p-3">
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between h-full border border-gray-200 dark:border-gray-700">
                            
                            <div class="flex justify-between items-start">
                                <span class="font-bold text-lg text-gray-800 dark:text-white">{{ card?.card_holder_name }}</span>
                                <i class="pi pi-credit-card text-2xl text-primary"></i>
                            </div>
                            
                            <div class="text-center my-8">
                                <span class="text-2xl font-mono tracking-widest text-gray-600 dark:text-gray-300">{{ formatCardNumber(card?.card_number) }}</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <div>
                                    <small class="text-gray-500 dark:text-gray-400">VALIDADE</small>
                                    <p class="mt-1 font-semibold text-gray-700 dark:text-gray-200">{{ card?.expiry_date }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <button @click="editCard(card)" class="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                                        <i class="pi pi-pencil"></i>
                                    </button>
                                    <button @click="confirmDeleteCard(card)" class="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                                        <i class="pi pi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!isLoading && cards.length === 0" class="text-center p-5">
                    <p class="text-muted-color">Nenhum cartão encontrado. Adicione um para começar!</p>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="cardDialog" :style="{ width: '450px' }" :header="isEditing ? 'Editar Cartão' : 'Novo Cartão'" :modal="true" class="p-fluid">
        <div class="field">
            <label for="name">Nome no Cartão</label>
            <InputText id="name" v-model.trim="currentCard.card_holder_name" required="true" autofocus />
        </div>
        <div class="field">
            <label for="number">Número do Cartão</label>
            <InputText id="number" v-model.trim="currentCard.card_number" required="true" />
        </div>
        <div class="field">
            <label for="expiry">Data de Validade (MM/AA)</label>
            <InputText id="expiry" v-model.trim="currentCard.expiry_date" required="true" />
        </div>
        <div class="field">
            <label for="cvv">CVV</label>
            <InputText id="cvv" v-model.trim="currentCard.cvv" required="true" />
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Salvar" icon="pi pi-check" text @click="saveCard" />
        </template>
    </Dialog>
    
    <ConfirmDialog></ConfirmDialog>
</template>