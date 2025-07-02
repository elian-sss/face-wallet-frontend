import router from '@/router';
import apiClient from '@/service/api';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        userForVerification: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        init() {
            if (this.token) {
                apiClient.defaults.headers.common['Authorization'] = `Token ${this.token}`;
            }
        },

        async login(credentials) {
            try {
                const response = await apiClient.post('/auth/login/', credentials);
                this.token = response.data.token;
                this.user = { id: response.data.user_id, email: response.data.email };

                apiClient.defaults.headers.common['Authorization'] = `Token ${this.token}`;

                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                router.push('/auth/verify-face-login');
            } catch (error) {
                console.error("Falha no login:", error.response?.data || error.message);
                throw error;
            }
        },

        async verifyFace(formData) {
            try {
                await apiClient.post('/auth/verify-face/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                router.push('/');
            } catch (error) {
                console.error("Falha na verificação facial:", error.response?.data || error.message);
                throw error;
            }
        },

        logout() {
            this.token = null;
            this.user = null;

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            delete apiClient.defaults.headers.common['Authorization'];

            router.push('/auth/login');
        },

        async register(formData) {
            try {
                await apiClient.post('/auth/register/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                this.userForVerification = formData.get('username'); 
                router.push('/auth/verify-phone');
            } catch (error) {
                console.error("Falha no registro:", error.response?.data || error.message);
                throw error;
            }
        },
        async verifyPhone(code) {
            if (!this.userForVerification) {
                throw new Error("Nenhum usuário em processo de verificação.");
            }
            try {
                const payload = {
                    username: this.userForVerification,
                    code: code,
                };
                await apiClient.post('/auth/verify-phone/', payload);
                
                this.userForVerification = null; 
                router.push('/auth/login');
            } catch (error) {
                console.error("Falha na verificação do telefone:", error.response?.data || error.message);
                throw error;
            }
        },
        
        async requestPasswordReset(payload) {
             try {
                await apiClient.post('/auth/password-reset/request/', payload);
             } catch (error) {
                console.error("Falha ao solicitar redefinição de senha:", error.response?.data || error.message);
                throw error;
             }
        },

        async confirmPasswordReset(payload) {
            try {
                await apiClient.post('/auth/password-reset/confirm/', payload);
                router.push('/auth/login');
            } catch(error) {
                console.error("Falha ao confirmar redefinição de senha:", error.response?.data || error.message);
                throw error;
            }
        }
    },
});