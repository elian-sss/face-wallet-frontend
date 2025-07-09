<script setup>
import cardService from '@/service/cardService';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import { useConfirm } from "primevue/useconfirm";
import { onMounted, ref } from 'vue';

const cards = ref([]);
const isLoading = ref(true);
const cardDialog = ref(false);
const currentCard = ref({});
const isEditing = ref(false);
const confirm = useConfirm();

const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
};

const fetchCards = async () => {
    isLoading.value = true;
    try {
        const response = await cardService.getCards();
        cards.value = response.data.map(card => ({
            ...card,
            isCensored: true
        }));
    } catch (error) {
        console.error("Erro ao buscar cartões:", error);
    } finally {
        isLoading.value = false;
    }
};

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

const toggleCensored = (card) => {
    card.isCensored = !card.isCensored;
};

const displayCardNumber = (card) => {
    if (card.isCensored) {
        return `**** **** **** ${card.card_number.slice(-4)}`;
    }
    return formatCardNumber(card.card_number);
};

onMounted(() => {
    fetchCards();
});
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
                            <div class="text-center my-8 flex items-center justify-center gap-4">
                                <span class="text-2xl font-mono tracking-widest text-gray-600 dark:text-gray-300">
                                    {{ displayCardNumber(card) }}
                                </span>
                                <button @click="toggleCensored(card)" class="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                                    <i class="pi" :class="card.isCensored ? 'pi-eye-slash' : 'pi-eye'"></i>
                                </button>
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

                <div v-if="isLoading" class="text-center p-5">
                    <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="cardDialog" :header="isEditing ? 'Editar Cartão' : 'Novo Cartão'" :modal="true" class="glassmorphism-dialog w-full max-w-lg">
        <div class="flex justify-content-center mb-6">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border border-white border-opacity-30">
                <i class="pi pi-credit-card text-3xl text-white"></i>
            </div>
        </div>

        <div class="flex flex-col gap-6">
            <div>
                <label for="name" class="form-label">Nome no Cartão</label>
                <InputText id="name" v-model.trim="currentCard.card_holder_name" class="form-input" autofocus />
            </div>
            <div>
                <label for="number" class="form-label">Número do Cartão</label>
                <InputText id="number" v-model.trim="currentCard.card_number" class="form-input" />
            </div>
            
            <div class="grid grid-nogutter gap-4">
                <div class="col">
                    <label for="expiry" class="form-label">Validade (MM/AA)</label>
                    <InputText id="expiry" v-model.trim="currentCard.expiry_date" class="form-input" />
                </div>
                <div class="col">
                    <label for="cvv" class="form-label">CVV</label>
                    <InputText id="cvv" v-model.trim="currentCard.cvv" class="form-input" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-3">
                <Button label="Cancelar" @click="hideDialog" severity="secondary" text class="text-white hover:bg-white hover:bg-opacity-10"></Button>
                <Button label="Salvar" @click="saveCard" class="bg-primary-500 hover:bg-primary-600 border-none"></Button>
            </div>
        </template>
    </Dialog>
    
    <ConfirmDialog></ConfirmDialog>
</template>

<style scoped>
.error-message {
    color: #f87171;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05) !important; 
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 0.5rem;
    color: white !important;
    font-size: 1rem;
    transition: all 0.3s;
}
.form-input:focus {
    outline: none;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.3) !important;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #cbd5e1;
    margin-bottom: 0.5rem;
}
.glassmorphism-dialog .p-dialog {
    background: rgba(30, 41, 59, 0.6) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 1.5rem !important;
    box-shadow: none !important;
}

.glassmorphism-dialog .p-dialog-header {
    background: transparent !important;
    color: white !important;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.glassmorphism-dialog .p-dialog-content {
    background: transparent !important;
    padding: 0rem 1.5rem 1rem 1.5rem;
}

.glassmorphism-dialog .p-dialog-footer {
    background: transparent !important;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
}
</style>