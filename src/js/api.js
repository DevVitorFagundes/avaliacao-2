/**
 * Módulo de comunicação com API
 * Centraliza todas as chamadas para o backend
 */

const API_BASE_URL = window.location.origin;

/**
 * Classe para gerenciar chamadas de API
 */
class ApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Método genérico para fazer requisições HTTP
     * @param {string} endpoint - Endpoint da API
     * @param {Object} options - Opções da requisição
     * @returns {Promise<Object>} - Resposta da API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Registro de novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} - Resposta da API
     */
    async register(userData) {
        return this.request('/api/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Login do usuário
     * @param {Object} credentials - Credenciais do usuário
     * @returns {Promise<Object>} - Resposta da API
     */
    async login(credentials) {
        return this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    /**
     * Logout do usuário
     * @returns {Promise<Object>} - Resposta da API
     */
    async logout() {
        return this.request('/api/logout', {
            method: 'POST'
        });
    }

    /**
     * Buscar tarefas do usuário
     * @returns {Promise<Object>} - Lista de tarefas
     */
    async getTasks() {
        return this.request('/api/tasks');
    }

    /**
     * Criar nova tarefa
     * @param {Object} taskData - Dados da tarefa
     * @returns {Promise<Object>} - Tarefa criada
     */
    async createTask(taskData) {
        return this.request('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    /**
     * Atualizar tarefa existente
     * @param {number} taskId - ID da tarefa
     * @param {Object} taskData - Novos dados da tarefa
     * @returns {Promise<Object>} - Tarefa atualizada
     */
    async updateTask(taskId, taskData) {
        return this.request(`/api/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }

    /**
     * Deletar tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {Promise<Object>} - Resposta da API
     */
    async deleteTask(taskId) {
        return this.request(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Marcar tarefa como concluída/pendente
     * @param {number} taskId - ID da tarefa
     * @param {boolean} completed - Status de conclusão
     * @returns {Promise<Object>} - Tarefa atualizada
     */
    async toggleTaskComplete(taskId, completed) {
        return this.updateTask(taskId, { completed });
    }
}

// Instância global da API
const apiClient = new ApiClient();

// Métodos de conveniência para uso direto
const api = {
    // Autenticação
    register: (userData) => apiClient.register(userData),
    login: (credentials) => apiClient.login(credentials),
    logout: () => apiClient.logout(),
    
    // Tarefas
    getTasks: () => apiClient.getTasks(),
    createTask: (taskData) => apiClient.createTask(taskData),
    updateTask: (taskId, taskData) => apiClient.updateTask(taskId, taskData),
    deleteTask: (taskId) => apiClient.deleteTask(taskId),
    toggleTaskComplete: (taskId, completed) => apiClient.toggleTaskComplete(taskId, completed)
};

// Exportar para uso em testes (se ambiente Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ApiClient,
        api
    };
}