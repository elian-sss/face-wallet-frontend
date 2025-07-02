# Documentação do Frontend: Aplicação Carteira Digital

## 1. Visão Geral

Este documento detalha a implementação do cliente web (frontend) para o projeto "Carteira Digital Segura". A aplicação foi desenvolvida como uma Single-Page Application (SPA) utilizando o framework **Vue.js 3**, e é responsável por fornecer a interface de usuário para interação com a API de backend.

O foco principal do frontend até o momento foi a implementação de fluxos de autenticação robustos e multifatoriais, garantindo uma experiência de usuário segura e interativa.

## 2. Tecnologias e Bibliotecas

* **Framework Principal:** [Vue.js 3](https://vuejs.org/) (utilizando a Composition API e a sintaxe `<script setup>`)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Roteamento:** [Vue Router](https://router.vuejs.org/)
* **Gerenciamento de Estado:** [Pinia](https://pinia.vuejs.org/)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Biblioteca de UI / Template:** [Sakai Vue Admin Template](https://github.com/primefaces/sakai-vue) (baseado em [PrimeVUE](https://primevue.org/))

## 3. Arquitetura e Padrões de Código

A aplicação foi estruturada seguindo padrões modernos de desenvolvimento para garantir manutenibilidade e escalabilidade.

* **Gerenciamento de Estado Centralizado:** O **Pinia** é utilizado como a única fonte da verdade para o estado global da aplicação. O `authStore` gerencia o token de autenticação, os dados do usuário e o estado de login, persistindo a sessão no `localStorage` do navegador.
* **Camada de Serviço para API:** Toda a comunicação com o backend Django é centralizada em uma camada de serviço (`src/services/api.js`). Esta camada utiliza uma instância configurada do **Axios** que intercepta todas as requisições para anexar automaticamente o token de autenticação, desacoplando a lógica de comunicação dos componentes visuais.
* **Roteamento e Proteção de Rotas:** O **Vue Router** gerencia a navegação entre as páginas. Foi implementado um "Navigation Guard" (`router.beforeEach`) global que protege as rotas privadas. Antes de cada navegação, ele verifica se o usuário está autenticado (usando o `authStore`); caso contrário, o redireciona para a página de login.
* **Componentização:** A estrutura do projeto distingue `views` (páginas completas, como Login e Dashboard) de `components` (elementos reutilizáveis, como botões e modais), promovendo a reutilização de código.

## 4. Funcionalidades Implementadas

Até o momento, os seguintes fluxos de usuário foram completamente implementados:

#### 4.1. Fluxo de Registro de Usuário (Multi-Etapas)

1.  **Formulário de Dados:** Uma página de registro (`/auth/register`) coleta os dados essenciais do usuário (nome de usuário, nome completo, e-mail, senha e telefone).
2.  **Captura Facial com Webcam:**
    * Um botão na tela de registro abre um modal que acessa a webcam do usuário através da API nativa do navegador `navigator.mediaDevices.getUserMedia()`.
    * O usuário pode visualizar o feed da câmera e capturar um quadro (uma foto), que é exibida como uma pré-visualização.
3.  **Envio para o Backend:** Ao submeter o formulário, os dados de texto e o arquivo de imagem da face são enviados para a API como `FormData`.
4.  **Verificação por WhatsApp:**
    * Após o envio bem-sucedido, o usuário é automaticamente redirecionado para a tela de verificação (`/auth/verify-phone`).
    * A aplicação utiliza o estado gerenciado pelo Pinia para "lembrar" qual usuário está em processo de verificação, evitando que ele precise digitar seu nome de usuário novamente (melhorando a UX).
    * O usuário insere o código recebido no WhatsApp para ativar sua conta. Em caso de sucesso, é redirecionado para a tela de login.

#### 4.2. Fluxo de Autenticação (Multi-Fator)

1.  **Login por Credenciais:** O usuário insere seu nome de usuário e senha na página `/auth/login`. A aplicação envia as credenciais para a API.
2.  **Verificação Facial Obrigatória:**
    * Após o sucesso do login por senha, o usuário **não** é levado ao dashboard. Em vez disso, ele é redirecionado para uma tela de verificação facial (`/auth/verify-face-login`).
    * Nesta tela, ele deve novamente usar a câmera para capturar uma foto.
    * A nova foto é enviada para a API (com o token de autenticação já configurado no cabeçalho) para ser comparada com a face cadastrada.
3.  **Acesso Concedido:** Somente após a confirmação facial bem-sucedida, o usuário é redirecionado para a página principal da aplicação (Dashboard).

#### 4.3. Controle de Sessão e Logout

* A aplicação persiste o estado de login entre recarregamentos de página usando o `localStorage`. Ao iniciar, a aplicação verifica o `localStorage` e reconfigura o estado e o cabeçalho do Axios.
* Um botão de "Sair" (Logout) funcional foi implementado na barra de navegação superior. Ao ser clicado, ele limpa o estado no Pinia, o `localStorage`, e redireciona o usuário de volta para a tela de login.

## 5. Estrutura de Pastas Principais (`src/`)

-   **`layout/`**: Contém os componentes do layout principal do template Sakai (Topbar, Sidebar, etc.).
-   **`services/`**: Onde reside a nossa lógica de comunicação com a API (e.g., `api.js`).
-   **`stores/`**: Contém os stores do Pinia (e.g., `authStore.js`).
-   **`router/`**: Definição de todas as rotas da aplicação (`index.js`).
-   **`views/`**: Componentes que representam páginas completas da aplicação (e.g., `Dashboard.vue`, `auth/Login.vue`).
-   **`components/`**: Componentes menores e reutilizáveis.

## 6. Guia de Execução

1.  **Clone o repositório** do projeto frontend.
2.  **Navegue até a pasta** do projeto via terminal.
3.  **Instale as dependências:** `npm install`.
4.  **Inicie o servidor de desenvolvimento:** `npm run dev`.
5.  **Acesse a aplicação** no navegador, geralmente em `http://localhost:5173`.

*(Certifique-se de que o servidor backend Django esteja rodando simultaneamente em `http://127.0.0.1:8000` e que a configuração de CORS no Django esteja permitindo a origem do frontend).*

## 7. Próximos Passos

As seguintes funcionalidades são os próximos objetivos para o desenvolvimento do frontend:

-   [ ] **Dashboard de Cartões:** Implementar a tela principal onde os cartões do usuário serão listados.
-   [ ] **CRUD de Cartões:** Criar os modais ou páginas para que o usuário possa adicionar, visualizar detalhes e remover seus cartões de crédito.
-   [ ] **Fluxo de "Esqueci Minha Senha":** Desenvolver a interface para os endpoints de redefinição de senha via WhatsApp que já existem no backend.
-   [ ] **Refinamento Visual:** Ajustar e polir a interface do usuário e garantir a responsividade em diferentes dispositivos.