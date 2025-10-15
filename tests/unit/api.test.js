/**
 * Testes unitários para o módulo de API (api.js)
 * 
 * Cenários de teste:
 * 1. Autenticação - login, registro, logout
 * 2. Gerenciamento de tarefas - CRUD operations
 * 3. Tratamento de erros de rede e API
 */

// Mock do fetch para simular chamadas HTTP
global.fetch = jest.fn();

// Mock da window.location
Object.defineProperty(window, 'location', {
    value: {
        origin: 'http://localhost:3000'
    },
    writable: true
});

const { ApiClient } = require('../../src/js/api');

describe('API Module - Autenticação', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = new ApiClient('http://localhost:3000');
        fetch.mockClear();
        // Silenciar console.error para testes de erro intencionais
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('Cenário: Login bem-sucedido (Caminho Feliz)', () => {
        test('deve fazer login com credenciais válidas', async () => {
            const mockResponse = {
                success: true,
                user: { id: 1, username: 'testuser', email: 'test@example.com' }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const credentials = { email: 'test@example.com', password: '123456' };
            const result = await apiClient.login(credentials);

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            expect(result).toEqual(mockResponse);
        });

        test('deve fazer registro com dados válidos', async () => {
            const mockResponse = {
                success: true,
                message: 'Usuário cadastrado com sucesso'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const userData = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123'
            };

            const result = await apiClient.register(userData);

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            expect(result).toEqual(mockResponse);
        });

        test('deve fazer logout corretamente', async () => {
            const mockResponse = {
                success: true,
                message: 'Logout realizado com sucesso'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.logout();

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('Cenário: Falhas de autenticação (Entradas Inválidas)', () => {
        test('deve tratar erro de login com credenciais inválidas', async () => {
            const mockErrorResponse = {
                success: false,
                message: 'Credenciais inválidas'
            };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => mockErrorResponse
            });

            const credentials = { email: 'wrong@email.com', password: 'wrongpass' };

            await expect(apiClient.login(credentials))
                .rejects.toThrow('Credenciais inválidas');
        });

        test('deve tratar erro de registro com email duplicado', async () => {
            const mockErrorResponse = {
                success: false,
                message: 'Email já cadastrado'
            };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => mockErrorResponse
            });

            const userData = {
                username: 'testuser',
                email: 'existing@example.com',
                password: 'password123'
            };

            await expect(apiClient.register(userData))
                .rejects.toThrow('Email já cadastrado');
        });

        test('deve tratar erro de rede', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const credentials = { email: 'test@example.com', password: '123456' };

            await expect(apiClient.login(credentials))
                .rejects.toThrow('Network error');
        });
    });

    describe('Cenário: Casos extremos de autenticação', () => {
        test('deve tratar resposta sem campo message', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({})
            });

            const credentials = { email: 'test@example.com', password: '123456' };

            await expect(apiClient.login(credentials))
                .rejects.toThrow('HTTP Error: 500');
        });

        test('deve usar baseUrl personalizada', () => {
            const customApiClient = new ApiClient('https://api.custom.com');
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            customApiClient.login({ email: 'test@test.com', password: '123456' });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.custom.com/api/login',
                expect.any(Object)
            );
        });
    });
});

describe('API Module - Gerenciamento de Tarefas', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = new ApiClient('http://localhost:3000');
        fetch.mockClear();
        // Silenciar console.error para testes de erro intencionais
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('Cenário: Operações CRUD de tarefas (Caminho Feliz)', () => {
        test('deve buscar lista de tarefas', async () => {
            const mockResponse = {
                success: true,
                tasks: [
                    { id: 1, title: 'Tarefa 1', completed: false },
                    { id: 2, title: 'Tarefa 2', completed: true }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.getTasks();

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tasks', {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(result).toEqual(mockResponse);
            expect(result.tasks).toHaveLength(2);
        });

        test('deve criar nova tarefa', async () => {
            const newTask = { title: 'Nova Tarefa', description: 'Descrição da tarefa' };
            const mockResponse = {
                success: true,
                task: { id: 3, ...newTask, completed: false }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.createTask(newTask);

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });
            expect(result.task.title).toBe(newTask.title);
        });

        test('deve atualizar tarefa existente', async () => {
            const taskId = 1;
            const updateData = { title: 'Tarefa Atualizada', completed: true };
            const mockResponse = {
                success: true,
                task: { id: taskId, ...updateData }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.updateTask(taskId, updateData);

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tasks/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            expect(result.task.completed).toBe(true);
        });

        test('deve deletar tarefa', async () => {
            const taskId = 1;
            const mockResponse = {
                success: true,
                message: 'Tarefa deletada com sucesso'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.deleteTask(taskId);

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tasks/1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            expect(result.success).toBe(true);
        });

        test('deve alternar status de conclusão da tarefa', async () => {
            const taskId = 1;
            const completed = true;
            const mockResponse = {
                success: true,
                task: { id: taskId, completed }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.toggleTaskComplete(taskId, completed);

            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tasks/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            expect(result.task.completed).toBe(true);
        });
    });

    describe('Cenário: Erros em operações de tarefas (Entradas Inválidas)', () => {
        test('deve tratar erro ao buscar tarefas sem autenticação', async () => {
            const mockErrorResponse = {
                success: false,
                message: 'Usuário não autenticado'
            };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => mockErrorResponse
            });

            await expect(apiClient.getTasks())
                .rejects.toThrow('Usuário não autenticado');
        });

        test('deve tratar erro ao criar tarefa com dados inválidos', async () => {
            const mockErrorResponse = {
                success: false,
                message: 'Título é obrigatório'
            };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => mockErrorResponse
            });

            const invalidTask = { description: 'Sem título' };

            await expect(apiClient.createTask(invalidTask))
                .rejects.toThrow('Título é obrigatório');
        });

        test('deve tratar erro ao atualizar tarefa inexistente', async () => {
            const mockErrorResponse = {
                success: false,
                message: 'Tarefa não encontrada'
            };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => mockErrorResponse
            });

            await expect(apiClient.updateTask(999, { title: 'Nova' }))
                .rejects.toThrow('Tarefa não encontrada');
        });
    });

    describe('Cenário: Casos extremos de tarefas', () => {
        test('deve lidar com resposta vazia de tarefas', async () => {
            const mockResponse = {
                success: true,
                tasks: []
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.getTasks();
            expect(result.tasks).toEqual([]);
        });

        test('deve lidar com tarefa com dados extremos', async () => {
            const extremeTask = {
                title: 'A'.repeat(1000),
                description: 'B'.repeat(5000)
            };

            const mockResponse = {
                success: true,
                task: { id: 1, ...extremeTask }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await apiClient.createTask(extremeTask);
            expect(result.task.title.length).toBe(1000);
        });

        test('deve usar headers customizados quando fornecidos', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            await apiClient.request('/test', {
                headers: { 'Authorization': 'Bearer token123' }
            });

            // O teste deve verificar que o fetch foi chamado corretamente
            expect(fetch).toHaveBeenCalledTimes(1);
            
            const [url, options] = fetch.mock.calls[0];
            expect(url).toBe('http://localhost:3000/test');
            
            // Verificar que o header de Authorization foi passado
            expect(options.headers['Authorization']).toBe('Bearer token123');
            
            // Verificar que a estrutura de headers existe
            expect(options.headers).toBeDefined();
        });
    });
});