/**
 * Módulo de autenticação
 * Gerencia login, registro e estado de autenticação
 */

/**
 * Classe para gerenciar autenticação
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    /**
     * Inicialização do módulo de autenticação
     */
    init() {
        this.setupEventListeners();
        this.loadUserFromStorage();
        this.checkAuthState();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Tabs de autenticação
        document.getElementById('login-tab')?.addEventListener('click', () => {
            this.switchTab('login');
        });

        document.getElementById('register-tab')?.addEventListener('click', () => {
            this.switchTab('register');
        });

        // Formulários
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });
    }

    /**
     * Alternar entre tabs de login e registro
     * @param {string} tab - Nome da tab (login ou register)
     */
    switchTab(tab) {
        // Remover classe active de todas as tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Esconder todos os formulários
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Ativar tab e formulário selecionados
        document.getElementById(`${tab}-tab`)?.classList.add('active');
        document.getElementById(`${tab}-form`)?.classList.add('active');

        // Limpar mensagens
        clearMessage('login-message');
        clearMessage('register-message');
    }

    /**
     * Processar login
     * @param {Event} event - Evento do formulário
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password')
        };

        // Validação básica
        if (!this.validateLoginForm(credentials)) {
            return;
        }

        try {
            showMessage('login-message', 'Fazendo login...', 'info');
            
            const response = await api.login(credentials);
            
            if (response.success) {
                this.setCurrentUser(response.user);
                this.saveUserToStorage(response.user);
                showMessage('login-message', 'Login realizado com sucesso!', 'success', 1000);
                
                setTimeout(() => {
                    this.showDashboard();
                }, 1000);
            }
        } catch (error) {
            showMessage('login-message', error.message || 'Erro ao fazer login', 'error');
        }
    }

    /**
     * Processar registro
     * @param {Event} event - Evento do formulário
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Validação
        if (!this.validateRegisterForm(userData)) {
            return;
        }

        try {
            showMessage('register-message', 'Criando conta...', 'info');
            
            const response = await api.register({
                username: userData.username,
                email: userData.email,
                password: userData.password
            });
            
            if (response.success) {
                showMessage('register-message', 'Conta criada com sucesso! Você pode fazer login agora.', 'success');
                form.reset();
                
                setTimeout(() => {
                    this.switchTab('login');
                }, 2000);
            }
        } catch (error) {
            showMessage('register-message', error.message || 'Erro ao criar conta', 'error');
        }
    }

    /**
     * Processar logout
     */
    async handleLogout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.clearCurrentUser();
            this.removeUserFromStorage();
            this.showLogin();
        }
    }

    /**
     * Validar formulário de login
     * @param {Object} credentials - Credenciais do usuário
     * @returns {boolean} - True se válido
     */
    validateLoginForm(credentials) {
        if (!credentials.email) {
            showMessage('login-message', 'Email é obrigatório', 'error');
            return false;
        }

        if (!isValidEmail(credentials.email)) {
            showMessage('login-message', 'Email inválido', 'error');
            return false;
        }

        if (!credentials.password) {
            showMessage('login-message', 'Senha é obrigatória', 'error');
            return false;
        }

        return true;
    }

    /**
     * Validar formulário de registro
     * @param {Object} userData - Dados do usuário
     * @returns {boolean} - True se válido
     */
    validateRegisterForm(userData) {
        if (!userData.username) {
            showMessage('register-message', 'Nome de usuário é obrigatório', 'error');
            return false;
        }

        if (userData.username.length < 3) {
            showMessage('register-message', 'Nome de usuário deve ter pelo menos 3 caracteres', 'error');
            return false;
        }

        if (!userData.email) {
            showMessage('register-message', 'Email é obrigatório', 'error');
            return false;
        }

        if (!isValidEmail(userData.email)) {
            showMessage('register-message', 'Email inválido', 'error');
            return false;
        }

        if (!userData.password) {
            showMessage('register-message', 'Senha é obrigatória', 'error');
            return false;
        }

        if (!isValidPassword(userData.password)) {
            showMessage('register-message', 'Senha deve ter pelo menos 6 caracteres', 'error');
            return false;
        }

        if (userData.password !== userData.confirmPassword) {
            showMessage('register-message', 'Senhas não coincidem', 'error');
            return false;
        }

        return true;
    }

    /**
     * Definir usuário atual
     * @param {Object} user - Dados do usuário
     */
    setCurrentUser(user) {
        this.currentUser = user;
    }

    /**
     * Limpar usuário atual
     */
    clearCurrentUser() {
        this.currentUser = null;
    }

    /**
     * Verificar se usuário está autenticado
     * @returns {boolean} - True se autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obter usuário atual
     * @returns {Object|null} - Dados do usuário ou null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Salvar usuário no localStorage
     * @param {Object} user - Dados do usuário
     */
    saveUserToStorage(user) {
        try {
            localStorage.setItem('taskmanager_user', JSON.stringify(user));
        } catch (error) {
            console.error('Erro ao salvar usuário no storage:', error);
        }
    }

    /**
     * Carregar usuário do localStorage
     */
    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('taskmanager_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário do storage:', error);
            this.removeUserFromStorage();
        }
    }

    /**
     * Remover usuário do localStorage
     */
    removeUserFromStorage() {
        try {
            localStorage.removeItem('taskmanager_user');
        } catch (error) {
            console.error('Erro ao remover usuário do storage:', error);
        }
    }

    /**
     * Verificar estado de autenticação na inicialização
     */
    checkAuthState() {
        if (this.isAuthenticated()) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    /**
     * Mostrar tela de login
     */
    showLogin() {
        toggleSections('tasks-section', 'auth-section');
        document.getElementById('navigation')?.classList.add('hidden');
        clearForm('login-form');
        clearForm('register-form');
    }

    /**
     * Mostrar dashboard (área de tarefas)
     */
    showDashboard() {
        toggleSections('auth-section', 'tasks-section');
        document.getElementById('navigation')?.classList.remove('hidden');
        
        if (this.currentUser) {
            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Olá, ${this.currentUser.username}!`;
            }
        }

        // Carregar tarefas do usuário
        if (window.taskManager) {
            window.taskManager.loadTasks();
        }
    }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();

// Exportar para uso em testes (se ambiente Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthManager,
        authManager
    };
}