/**
 * Arquivo principal da aplicação Task Manager
 * Inicializa todos os módulos e configura a aplicação
 */

/**
 * Classe principal da aplicação
 */
class App {
    constructor() {
        this.version = '1.0.0';
        this.init();
    }

    /**
     * Inicialização da aplicação
     */
    init() {
        // Aguardar carregamento completo do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    /**
     * Configuração inicial da aplicação
     */
    setup() {
        console.log(`Task Manager v${this.version} - Iniciando aplicação...`);
        
        try {
            // Verificar se todos os módulos foram carregados
            this.checkDependencies();
            
            // Configurar manipuladores de erro globais
            this.setupErrorHandlers();
            
            // Configurar temas (se disponível)
            this.setupTheme();
            
            // Configurar atalhos de teclado
            this.setupKeyboardShortcuts();
            
            // Configurar service worker (para cache offline - futuro)
            // this.setupServiceWorker();
            
            console.log('Task Manager inicializado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.showFatalError(error);
        }
    }

    /**
     * Verificar dependências necessárias
     */
    checkDependencies() {
        const requiredGlobals = [
            'authManager',
            'taskManager',
            'api',
            'isValidEmail',
            'showMessage'
        ];

        const missing = requiredGlobals.filter(dep => typeof window[dep] === 'undefined');
        
        if (missing.length > 0) {
            throw new Error(`Dependências não encontradas: ${missing.join(', ')}`);
        }
    }

    /**
     * Configurar manipuladores de erro globais
     */
    setupErrorHandlers() {
        // Erros JavaScript não capturados
        window.addEventListener('error', (event) => {
            console.error('Erro não capturado:', event.error);
            this.handleGlobalError(event.error);
        });

        // Promises rejeitadas não capturadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada não capturada:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    /**
     * Lidar com erros globais
     * @param {Error} error - Erro ocorrido
     */
    handleGlobalError(error) {
        // Em produção, enviar erro para serviço de monitoramento
        console.error('Erro global capturado:', error);
        
        // Mostrar mensagem amigável para o usuário
        const errorMessages = document.querySelectorAll('.message');
        if (errorMessages.length === 0) {
            // Se não há elementos de mensagem visíveis, criar um
            this.showTopLevelError('Ocorreu um erro inesperado. Tente recarregar a página.');
        }
    }

    /**
     * Mostrar erro no nível superior da página
     * @param {string} message - Mensagem de erro
     */
    showTopLevelError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            max-width: 90%;
            width: 400px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }

    /**
     * Mostrar erro fatal que impede o funcionamento da aplicação
     * @param {Error} error - Erro fatal
     */
    showFatalError(error) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #f8f9fa;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 400px;
                ">
                    <h2 style="color: #dc3545; margin-bottom: 1rem;">
                        Erro Fatal
                    </h2>
                    <p style="margin-bottom: 1rem; color: #6c757d;">
                        A aplicação não pôde ser carregada devido a um erro crítico.
                    </p>
                    <p style="
                        font-family: monospace;
                        background: #f8f9fa;
                        padding: 1rem;
                        border-radius: 4px;
                        margin-bottom: 1rem;
                        word-break: break-word;
                        font-size: 0.8rem;
                    ">
                        ${error.message || error.toString()}
                    </p>
                    <button 
                        onclick="window.location.reload()" 
                        style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                        "
                    >
                        Recarregar Página
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Configurar tema da aplicação
     */
    setupTheme() {
        // Verificar preferência salva do usuário
        const savedTheme = localStorage.getItem('taskmanager_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);
        
        // Escutar mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('taskmanager_theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Definir tema da aplicação
     * @param {string} theme - Tema a ser aplicado (light ou dark)
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskmanager_theme', theme);
    }

    /**
     * Configurar atalhos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Verificar se o usuário está digitando em um campo
            const isTyping = event.target.matches('input, textarea, [contenteditable]');
            
            if (isTyping) return;

            // Ctrl/Cmd + N: Nova tarefa
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                if (authManager.isAuthenticated()) {
                    taskManager.showTaskForm();
                }
            }

            // Escape: Fechar formulários
            if (event.key === 'Escape') {
                event.preventDefault();
                taskManager.hideTaskForm();
            }

            // Ctrl/Cmd + /: Ajuda (futuro)
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                this.showHelp();
            }
        });
    }

    /**
     * Mostrar ajuda (placeholder para futuro)
     */
    showHelp() {
        alert(`Task Manager v${this.version}

Atalhos de teclado:
• Ctrl+N: Nova tarefa
• Esc: Fechar formulários
• Ctrl+/: Esta ajuda

Funcionalidades:
• Criar, editar e excluir tarefas
• Marcar tarefas como concluídas
• Sistema de login e registro
• Interface responsiva`);
    }

    /**
     * Configurar service worker para cache offline (futuro)
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch((error) => {
                    console.log('Falha ao registrar Service Worker:', error);
                });
        }
    }

    /**
     * Obter informações sobre a aplicação
     * @returns {Object} - Informações da aplicação
     */
    getInfo() {
        return {
            version: this.version,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            authentication: authManager.isAuthenticated(),
            currentUser: authManager.getCurrentUser(),
            taskCount: taskManager.tasks.length
        };
    }
}

// Inicializar aplicação
const app = new App();

// Tornar disponível globalmente para debugging
window.app = app;
window.authManager = authManager;
window.taskManager = taskManager;

// Exportar para uso em testes (se ambiente Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        App,
        app
    };
}