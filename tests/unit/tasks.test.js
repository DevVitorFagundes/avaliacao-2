/**
 * Testes unitários para o módulo de gerenciamento de tarefas (tasks.js)
 * 
 * Cenários de teste:
 * 1. Validação de formulários de tarefa
 * 2. Estatísticas de tarefas
 * 3. Filtros e ordenação
 */

// Mocks necessários para o ambiente de teste
global.document = {
    getElementById: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    createElement: jest.fn(() => ({
        appendChild: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn() },
        addEventListener: jest.fn(),
        setAttribute: jest.fn()
    }))
};

global.window = {
    api: {
        getTasks: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        toggleTaskComplete: jest.fn()
    }
};

// Mock das funções utilitárias
global.createElement = jest.fn();
global.sanitizeHTML = jest.fn(str => str);
global.formatDate = jest.fn(date => 'mock date');
global.showMessage = jest.fn();
global.clearMessage = jest.fn();
global.clearForm = jest.fn();

const { TaskManager } = require('../../src/js/tasks');

describe('Tasks Module - Validação de Formulários', () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new TaskManager();
        jest.clearAllMocks();
    });

    describe('Cenário: Validação de dados válidos (Caminho Feliz)', () => {
        test('deve validar tarefa com título válido', () => {
            const validTask = {
                title: 'Tarefa válida',
                description: 'Uma descrição válida'
            };

            const isValid = taskManager.validateTaskForm(validTask);
            expect(isValid).toBe(true);
        });

        test('deve validar tarefa apenas com título (sem descrição)', () => {
            const validTask = {
                title: 'Apenas título',
                description: ''
            };

            const isValid = taskManager.validateTaskForm(validTask);
            expect(isValid).toBe(true);
        });

        test('deve validar tarefa com título no limite (100 caracteres)', () => {
            const validTask = {
                title: 'A'.repeat(100),
                description: 'Descrição normal'
            };

            const isValid = taskManager.validateTaskForm(validTask);
            expect(isValid).toBe(true);
        });

        test('deve validar tarefa com descrição no limite (500 caracteres)', () => {
            const validTask = {
                title: 'Título normal',
                description: 'B'.repeat(500)
            };

            const isValid = taskManager.validateTaskForm(validTask);
            expect(isValid).toBe(true);
        });
    });

    describe('Cenário: Validação de dados inválidos (Entradas Inválidas)', () => {
        test('deve rejeitar tarefa sem título', () => {
            const invalidTask = {
                title: '',
                description: 'Descrição sem título'
            };

            const isValid = taskManager.validateTaskForm(invalidTask);
            expect(isValid).toBe(false);
            expect(global.showMessage).toHaveBeenCalledWith(
                'task-message',
                'Título é obrigatório',
                'error'
            );
        });

        test('deve rejeitar tarefa com título muito longo (>100 caracteres)', () => {
            const invalidTask = {
                title: 'A'.repeat(101),
                description: 'Descrição normal'
            };

            const isValid = taskManager.validateTaskForm(invalidTask);
            expect(isValid).toBe(false);
            expect(global.showMessage).toHaveBeenCalledWith(
                'task-message',
                'Título não pode ter mais de 100 caracteres',
                'error'
            );
        });

        test('deve rejeitar tarefa com descrição muito longa (>500 caracteres)', () => {
            const invalidTask = {
                title: 'Título normal',
                description: 'B'.repeat(501)
            };

            const isValid = taskManager.validateTaskForm(invalidTask);
            expect(isValid).toBe(false);
            expect(global.showMessage).toHaveBeenCalledWith(
                'task-message',
                'Descrição não pode ter mais de 500 caracteres',
                'error'
            );
        });

        test('deve rejeitar tarefa com título apenas espaços', () => {
            const invalidTask = {
                title: '   ',
                description: 'Descrição válida'
            };

            // Simulando o trim() que ocorre no formulário real
            invalidTask.title = invalidTask.title.trim();

            const isValid = taskManager.validateTaskForm(invalidTask);
            expect(isValid).toBe(false);
        });
    });

    describe('Cenário: Casos extremos de validação', () => {
        test('deve lidar com valores null/undefined', () => {
            const invalidTask = {
                title: null,
                description: undefined
            };

            const isValid = taskManager.validateTaskForm(invalidTask);
            expect(isValid).toBe(false);
        });

        test('deve validar tarefa com caracteres especiais no título', () => {
            const validTask = {
                title: 'Tarefa com @#$%^&*()_+',
                description: 'Descrição normal'
            };

            const isValid = taskManager.validateTaskForm(validTask);
            expect(isValid).toBe(true);
        });

        test('deve validar tarefa com emojis', () => {
            const validTask = {
                title: 'Tarefa com emojis 🚀✨',
                description: 'Descrição com 💯 emojis'
            };

            const isValid = taskManager.validateTaskForm(validTask);
            expect(isValid).toBe(true);
        });
    });
});

describe('Tasks Module - Estatísticas de Tarefas', () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new TaskManager();
        jest.clearAllMocks();
    });

    describe('Cenário: Cálculo de estatísticas (Caminho Feliz)', () => {
        test('deve calcular estatísticas para lista vazia', () => {
            taskManager.tasks = [];

            const stats = taskManager.getTaskStats();

            expect(stats).toEqual({
                total: 0,
                completed: 0,
                pending: 0,
                completionRate: 0
            });
        });

        test('deve calcular estatísticas para tarefas mistas', () => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: true },
                { id: 2, title: 'Tarefa 2', completed: false },
                { id: 3, title: 'Tarefa 3', completed: true },
                { id: 4, title: 'Tarefa 4', completed: false },
                { id: 5, title: 'Tarefa 5', completed: true }
            ];

            const stats = taskManager.getTaskStats();

            expect(stats).toEqual({
                total: 5,
                completed: 3,
                pending: 2,
                completionRate: 60
            });
        });

        test('deve calcular 100% de conclusão', () => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: true },
                { id: 2, title: 'Tarefa 2', completed: true }
            ];

            const stats = taskManager.getTaskStats();

            expect(stats.completionRate).toBe(100);
        });

        test('deve calcular 0% de conclusão', () => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: false },
                { id: 2, title: 'Tarefa 2', completed: false }
            ];

            const stats = taskManager.getTaskStats();

            expect(stats.completionRate).toBe(0);
        });
    });

    describe('Cenário: Casos extremos de estatísticas', () => {
        test('deve arredondar taxa de conclusão corretamente', () => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: true },
                { id: 2, title: 'Tarefa 2', completed: false },
                { id: 3, title: 'Tarefa 3', completed: false }
            ];

            const stats = taskManager.getTaskStats();

            // 1/3 = 0.333... deve arredondar para 33%
            expect(stats.completionRate).toBe(33);
        });

        test('deve lidar com uma única tarefa concluída', () => {
            taskManager.tasks = [
                { id: 1, title: 'Única tarefa', completed: true }
            ];

            const stats = taskManager.getTaskStats();

            expect(stats).toEqual({
                total: 1,
                completed: 1,
                pending: 0,
                completionRate: 100
            });
        });

        test('deve lidar com muitas tarefas', () => {
            const manyTasks = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                title: `Tarefa ${i + 1}`,
                completed: i % 2 === 0 // Metade concluída, metade pendente
            }));

            taskManager.tasks = manyTasks;
            const stats = taskManager.getTaskStats();

            expect(stats.total).toBe(1000);
            expect(stats.completed).toBe(500);
            expect(stats.pending).toBe(500);
            expect(stats.completionRate).toBe(50);
        });
    });
});

describe('Tasks Module - Filtros de Tarefas', () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new TaskManager();
        taskManager.renderTasks = jest.fn(); // Mock do método de renderização
        jest.clearAllMocks();
    });

    describe('Cenário: Filtros funcionais (Caminho Feliz)', () => {
        beforeEach(() => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: true },
                { id: 2, title: 'Tarefa 2', completed: false },
                { id: 3, title: 'Tarefa 3', completed: true },
                { id: 4, title: 'Tarefa 4', completed: false }
            ];
        });

        test('deve filtrar apenas tarefas concluídas', () => {
            taskManager.filterTasks('completed');

            // Verificar se renderTasks foi chamado
            expect(taskManager.renderTasks).toHaveBeenCalled();
            
            // As tarefas originais devem ser preservadas
            expect(taskManager.tasks).toHaveLength(4);
        });

        test('deve filtrar apenas tarefas pendentes', () => {
            taskManager.filterTasks('pending');

            expect(taskManager.renderTasks).toHaveBeenCalled();
            expect(taskManager.tasks).toHaveLength(4);
        });

        test('deve mostrar todas as tarefas (filtro padrão)', () => {
            taskManager.filterTasks('all');

            expect(taskManager.renderTasks).toHaveBeenCalled();
            expect(taskManager.tasks).toHaveLength(4);
        });

        test('deve mostrar todas as tarefas para filtro inválido', () => {
            taskManager.filterTasks('invalid-filter');

            expect(taskManager.renderTasks).toHaveBeenCalled();
            expect(taskManager.tasks).toHaveLength(4);
        });
    });

    describe('Cenário: Filtros com casos extremos', () => {
        test('deve lidar com lista vazia', () => {
            taskManager.tasks = [];

            taskManager.filterTasks('completed');

            expect(taskManager.renderTasks).toHaveBeenCalled();
            expect(taskManager.tasks).toHaveLength(0);
        });

        test('deve lidar com todas as tarefas concluídas', () => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: true },
                { id: 2, title: 'Tarefa 2', completed: true }
            ];

            taskManager.filterTasks('pending');

            expect(taskManager.renderTasks).toHaveBeenCalled();
        });

        test('deve lidar com todas as tarefas pendentes', () => {
            taskManager.tasks = [
                { id: 1, title: 'Tarefa 1', completed: false },
                { id: 2, title: 'Tarefa 2', completed: false }
            ];

            taskManager.filterTasks('completed');

            expect(taskManager.renderTasks).toHaveBeenCalled();
        });

        test('deve preservar dados originais após múltiplos filtros', () => {
            const originalTasks = [
                { id: 1, title: 'Tarefa 1', completed: true },
                { id: 2, title: 'Tarefa 2', completed: false }
            ];

            taskManager.tasks = [...originalTasks];

            // Aplicar múltiplos filtros
            taskManager.filterTasks('completed');
            taskManager.filterTasks('pending');
            taskManager.filterTasks('all');

            // Os dados originais devem estar intactos
            expect(taskManager.tasks).toEqual(originalTasks);
        });
    });

    describe('Cenário: Funcionalidades de edição', () => {
        test('deve inicializar modo de edição corretamente', () => {
            const task = { id: 1, title: 'Teste', description: 'Desc' };
            
            taskManager.showTaskForm = jest.fn();
            taskManager.editTask(task);

            expect(taskManager.showTaskForm).toHaveBeenCalledWith(task);
        });

        test('deve resetar ID de edição ao esconder formulário', () => {
            taskManager.editingTaskId = 123;
            
            const mockForm = {
                classList: { add: jest.fn() }
            };
            
            // Configurar mock corretamente
            global.document.getElementById = jest.fn().mockReturnValue(mockForm);
            
            taskManager.hideTaskForm();

            expect(taskManager.editingTaskId).toBeNull();
        });
    });
});