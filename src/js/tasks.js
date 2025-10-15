/**
 * Módulo de gerenciamento de tarefas
 * Gerencia CRUD de tarefas e interface da lista
 */

/**
 * Classe para gerenciar tarefas
 */
class TaskManager {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.init();
    }

    /**
     * Inicialização do módulo de tarefas
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botão para adicionar nova tarefa
        document.getElementById('add-task-btn')?.addEventListener('click', () => {
            this.showTaskForm();
        });

        // Botão para cancelar formulário
        document.getElementById('cancel-task-btn')?.addEventListener('click', () => {
            this.hideTaskForm();
        });

        // Formulário de tarefa
        document.getElementById('task-form')?.addEventListener('submit', (e) => {
            this.handleTaskSubmit(e);
        });
    }

    /**
     * Carregar tarefas do servidor
     */
    async loadTasks() {
        try {
            const response = await api.getTasks();
            
            if (response.success) {
                this.tasks = response.tasks || [];
                this.renderTasks();
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            showMessage('task-message', 'Erro ao carregar tarefas', 'error');
        }
    }

    /**
     * Renderizar lista de tarefas
     */
    renderTasks() {
        const tasksList = document.getElementById('tasks-list');
        const noTasks = document.getElementById('no-tasks');
        
        if (!tasksList) return;

        // Limpar lista atual
        const taskItems = tasksList.querySelectorAll('.task-item');
        taskItems.forEach(item => item.remove());

        if (this.tasks.length === 0) {
            noTasks?.classList.remove('hidden');
        } else {
            noTasks?.classList.add('hidden');
            
            this.tasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                tasksList.appendChild(taskElement);
            });
        }
    }

    /**
     * Criar elemento HTML para uma tarefa
     * @param {Object} task - Dados da tarefa
     * @returns {HTMLElement} - Elemento da tarefa
     */
    createTaskElement(task) {
        const taskItem = createElement('div', {
            className: `task-item ${task.completed ? 'completed' : ''}`,
            'data-task-id': task.id
        });

        const taskHeader = createElement('div', { className: 'task-header' });
        
        const taskTitle = createElement('h3', { className: 'task-title' }, 
            sanitizeHTML(task.title));
        
        const taskActions = createElement('div', { className: 'task-actions' });

        // Botão de completar/descompletar
        const completeBtn = createElement('button', {
            className: `task-btn complete`,
            'data-task-id': task.id
        }, task.completed ? 'Reabrir' : 'Concluir');
        
        completeBtn.addEventListener('click', () => {
            this.toggleTaskComplete(task.id, !task.completed);
        });

        // Botão de editar
        const editBtn = createElement('button', {
            className: 'task-btn edit',
            'data-task-id': task.id
        }, 'Editar');
        
        editBtn.addEventListener('click', () => {
            this.editTask(task);
        });

        // Botão de deletar
        const deleteBtn = createElement('button', {
            className: 'task-btn delete',
            'data-task-id': task.id
        }, 'Excluir');
        
        deleteBtn.addEventListener('click', () => {
            this.deleteTask(task.id, task.title);
        });

        taskActions.appendChild(completeBtn);
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        taskHeader.appendChild(taskTitle);
        taskHeader.appendChild(taskActions);

        taskItem.appendChild(taskHeader);

        // Descrição da tarefa
        if (task.description && task.description.trim()) {
            const taskDescription = createElement('p', { className: 'task-description' }, 
                sanitizeHTML(task.description));
            taskItem.appendChild(taskDescription);
        }

        // Meta informações
        const taskMeta = createElement('div', { className: 'task-meta' });
        
        const taskDate = createElement('span', { className: 'task-date' }, 
            `Criada em: ${formatDate(task.createdAt)}`);
        
        const taskStatus = createElement('span', { 
            className: `task-status ${task.completed ? 'completed' : 'pending'}` 
        }, task.completed ? 'Concluída' : 'Pendente');

        taskMeta.appendChild(taskDate);
        taskMeta.appendChild(taskStatus);

        taskItem.appendChild(taskMeta);

        return taskItem;
    }

    /**
     * Mostrar formulário de tarefa
     * @param {Object} task - Tarefa para editar (opcional)
     */
    showTaskForm(task = null) {
        const form = document.getElementById('task-form');
        const formTitle = document.getElementById('task-form-title');
        
        if (!form || !formTitle) return;

        // Limpar mensagens anteriores
        clearMessage('task-message');

        if (task) {
            // Modo edição
            this.editingTaskId = task.id;
            formTitle.textContent = 'Editar Tarefa';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
        } else {
            // Modo criação
            this.editingTaskId = null;
            formTitle.textContent = 'Nova Tarefa';
            clearForm('task-form');
        }

        form.classList.remove('hidden');
        document.getElementById('task-title')?.focus();
    }

    /**
     * Esconder formulário de tarefa
     */
    hideTaskForm() {
        const form = document.getElementById('task-form');
        if (form) {
            form.classList.add('hidden');
            clearForm('task-form');
            clearMessage('task-message');
            this.editingTaskId = null;
        }
    }

    /**
     * Processar envio do formulário de tarefa
     * @param {Event} event - Evento do formulário
     */
    async handleTaskSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim()
        };

        // Validação
        if (!this.validateTaskForm(taskData)) {
            return;
        }

        try {
            if (this.editingTaskId) {
                // Atualizar tarefa existente
                showMessage('task-message', 'Atualizando tarefa...', 'info');
                await this.updateTask(this.editingTaskId, taskData);
            } else {
                // Criar nova tarefa
                showMessage('task-message', 'Criando tarefa...', 'info');
                await this.createTask(taskData);
            }
            
            this.hideTaskForm();
            await this.loadTasks();
            
        } catch (error) {
            showMessage('task-message', error.message || 'Erro ao salvar tarefa', 'error');
        }
    }

    /**
     * Validar formulário de tarefa
     * @param {Object} taskData - Dados da tarefa
     * @returns {boolean} - True se válido
     */
    validateTaskForm(taskData) {
        if (!taskData.title) {
            showMessage('task-message', 'Título é obrigatório', 'error');
            return false;
        }

        if (taskData.title.length > 100) {
            showMessage('task-message', 'Título não pode ter mais de 100 caracteres', 'error');
            return false;
        }

        if (taskData.description && taskData.description.length > 500) {
            showMessage('task-message', 'Descrição não pode ter mais de 500 caracteres', 'error');
            return false;
        }

        return true;
    }

    /**
     * Criar nova tarefa
     * @param {Object} taskData - Dados da tarefa
     */
    async createTask(taskData) {
        const response = await api.createTask(taskData);
        
        if (!response.success) {
            throw new Error(response.message || 'Erro ao criar tarefa');
        }

        return response.task;
    }

    /**
     * Atualizar tarefa existente
     * @param {number} taskId - ID da tarefa
     * @param {Object} taskData - Novos dados da tarefa
     */
    async updateTask(taskId, taskData) {
        const response = await api.updateTask(taskId, taskData);
        
        if (!response.success) {
            throw new Error(response.message || 'Erro ao atualizar tarefa');
        }

        return response.task;
    }

    /**
     * Editar tarefa (mostrar formulário preenchido)
     * @param {Object} task - Tarefa para editar
     */
    editTask(task) {
        this.showTaskForm(task);
    }

    /**
     * Alternar status de conclusão da tarefa
     * @param {number} taskId - ID da tarefa
     * @param {boolean} completed - Novo status
     */
    async toggleTaskComplete(taskId, completed) {
        try {
            const response = await api.toggleTaskComplete(taskId, completed);
            
            if (response.success) {
                // Atualizar tarefa local
                const taskIndex = this.tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    this.tasks[taskIndex].completed = completed;
                    this.renderTasks();
                }
            }
        } catch (error) {
            console.error('Erro ao alterar status da tarefa:', error);
            showMessage('task-message', 'Erro ao alterar status da tarefa', 'error');
        }
    }

    /**
     * Deletar tarefa
     * @param {number} taskId - ID da tarefa
     * @param {string} taskTitle - Título da tarefa (para confirmação)
     */
    async deleteTask(taskId, taskTitle) {
        const confirmed = confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}"?`);
        
        if (!confirmed) return;

        try {
            const response = await api.deleteTask(taskId);
            
            if (response.success) {
                // Remover tarefa local
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.renderTasks();
            }
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            showMessage('task-message', 'Erro ao excluir tarefa', 'error');
        }
    }

    /**
     * Obter estatísticas das tarefas
     * @returns {Object} - Estatísticas
     */
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Filtrar tarefas por status
     * @param {string} status - Status para filtrar (all, completed, pending)
     */
    filterTasks(status) {
        let filteredTasks;
        
        switch (status) {
            case 'completed':
                filteredTasks = this.tasks.filter(task => task.completed);
                break;
            case 'pending':
                filteredTasks = this.tasks.filter(task => !task.completed);
                break;
            default:
                filteredTasks = this.tasks;
        }
        
        // Salvar tasks originais e aplicar filtro temporário
        const originalTasks = this.tasks;
        this.tasks = filteredTasks;
        this.renderTasks();
        this.tasks = originalTasks;
    }
}

// Instância global do gerenciador de tarefas
const taskManager = new TaskManager();

// Tornar disponível globalmente para o auth manager
window.taskManager = taskManager;

// Exportar para uso em testes (se ambiente Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TaskManager,
        taskManager
    };
}