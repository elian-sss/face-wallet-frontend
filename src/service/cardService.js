import apiClient from './api';

const cardService = {
    getCards() {
        return apiClient.get('/cards/');
    },

    createCard(cardData) {
        return apiClient.post('/cards/', cardData);
    },

    updateCard(cardId, cardData) {
        return apiClient.put(`/cards/${cardId}/`, cardData);
    },

    deleteCard(cardId) {
        return apiClient.delete(`/cards/${cardId}/`);
    },
};

export default cardService;