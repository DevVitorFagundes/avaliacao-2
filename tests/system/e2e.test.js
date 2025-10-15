/**
 * Testes de sistema para a aplicação Task Manager
 * Utilizando Selenium WebDriver para automação end-to-end
 * 
 * Cenários de teste:
 * 1. Fluxo completo de autenticação (registro → login → logout)
 * 2. Gerenciamento completo de tarefas (criar → editar → completar → excluir)
 * 3. Validações e tratamento de erros de interface
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('Sistema Task Manager - Testes End-to-End', () => {
    let driver;
    const BASE_URL = 'http://localhost:3000';
    const TIMEOUT = 10000;

    beforeAll(async () => {
        // Configurar opções do Chrome para testes
        const options = new chrome.Options();
        options.addArguments('--headless'); // Executar sem interface gráfica
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Aguardar o servidor estar rodando
        await driver.get(BASE_URL);
        await driver.wait(until.titleContains('Task Manager'), TIMEOUT);
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async () => {
        // Resetar para página inicial antes de cada teste
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.id('auth-section')), TIMEOUT);
        
        // Limpar localStorage para garantir estado limpo
        await driver.executeScript('localStorage.clear();');
        await driver.refresh();
        await driver.wait(until.elementLocated(By.id('auth-section')), TIMEOUT);
    });

    describe('Cenário: Fluxo de Autenticação Completo (Caminho Feliz)', () => {
        const testUser = {
            username: 'usuarioteste',
            email: 'teste@example.com',
            password: '123456'
        };

        test('deve completar fluxo de registro → login → logout', async () => {
            // Passo 1: Registro de usuário
            await driver.findElement(By.id('register-tab')).click();
            await driver.wait(until.elementIsVisible(
                driver.findElement(By.id('register-form'))
            ), TIMEOUT);

            await driver.findElement(By.id('register-username')).sendKeys(testUser.username);
            await driver.findElement(By.id('register-email')).sendKeys(testUser.email);
            await driver.findElement(By.id('register-password')).sendKeys(testUser.password);
            await driver.findElement(By.id('register-confirm-password')).sendKeys(testUser.password);

            await driver.findElement(By.css('#register-form button[type="submit"]')).click();

            // Verificar mensagem de sucesso
            const successMessage = await driver.wait(
                until.elementLocated(By.css('#register-message.success')), 
                TIMEOUT
            );
            const messageText = await successMessage.getText();
            expect(messageText).toContain('sucesso');

            // Aguardar redirecionamento automático para login
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('login-form'))), 
                TIMEOUT
            );

            // Passo 2: Login com usuário criado
            await driver.findElement(By.id('login-email')).sendKeys(testUser.email);
            await driver.findElement(By.id('login-password')).sendKeys(testUser.password);
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            // Verificar redirecionamento para dashboard
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            // Verificar mensagem de boas-vindas
            const welcomeMessage = await driver.findElement(By.id('welcome-message'));
            const welcomeText = await welcomeMessage.getText();
            expect(welcomeText).toContain(testUser.username);

            // Passo 3: Logout
            await driver.findElement(By.id('logout-btn')).click();

            // Verificar retorno à tela de login
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('auth-section'))), 
                TIMEOUT
            );

            // Verificar que o navigation está oculto
            const navigation = await driver.findElement(By.id('navigation'));
            const isHidden = await navigation.getAttribute('class');
            expect(isHidden).toContain('hidden');
        }, 30000);

        test('deve alternar entre abas de login e registro', async () => {
            // Verificar aba de login ativa por padrão
            const loginTab = await driver.findElement(By.id('login-tab'));
            const loginTabClass = await loginTab.getAttribute('class');
            expect(loginTabClass).toContain('active');

            // Clicar na aba de registro
            await driver.findElement(By.id('register-tab')).click();

            // Verificar mudança de aba
            const registerTab = await driver.findElement(By.id('register-tab'));
            const registerTabClass = await registerTab.getAttribute('class');
            expect(registerTabClass).toContain('active');

            // Verificar formulário de registro visível
            const registerForm = await driver.findElement(By.id('register-form'));
            const registerFormClass = await registerForm.getAttribute('class');
            expect(registerFormClass).toContain('active');

            // Voltar para aba de login
            await driver.findElement(By.id('login-tab')).click();

            // Verificar retorno ao estado inicial
            const loginTabClassFinal = await loginTab.getAttribute('class');
            expect(loginTabClassFinal).toContain('active');
        });
    });

    describe('Cenário: Validações de Autenticação (Entradas Inválidas)', () => {
        test('deve exibir erro para login com credenciais inválidas', async () => {
            await driver.findElement(By.id('login-email')).sendKeys('email@inexistente.com');
            await driver.findElement(By.id('login-password')).sendKeys('senhaerrada');
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            // Aguardar mensagem de erro
            const errorMessage = await driver.wait(
                until.elementLocated(By.css('#login-message.error')), 
                TIMEOUT
            );
            const messageText = await errorMessage.getText();
            expect(messageText).toContain('inválidas');
        });

        test('deve validar formato de email no registro', async () => {
            await driver.findElement(By.id('register-tab')).click();
            await driver.wait(until.elementIsVisible(
                driver.findElement(By.id('register-form'))
            ), TIMEOUT);

            await driver.findElement(By.id('register-username')).sendKeys('usuario');
            await driver.findElement(By.id('register-email')).sendKeys('email-invalido');
            await driver.findElement(By.id('register-password')).sendKeys('123456');
            await driver.findElement(By.id('register-confirm-password')).sendKeys('123456');

            await driver.findElement(By.css('#register-form button[type="submit"]')).click();

            // Verificar validação HTML5 do campo email
            const emailField = await driver.findElement(By.id('register-email'));
            const validationMessage = await emailField.getAttribute('validationMessage');
            expect(validationMessage).toBeTruthy();
        });

        test('deve validar confirmação de senha no registro', async () => {
            await driver.findElement(By.id('register-tab')).click();
            await driver.wait(until.elementIsVisible(
                driver.findElement(By.id('register-form'))
            ), TIMEOUT);

            await driver.findElement(By.id('register-username')).sendKeys('usuario');
            await driver.findElement(By.id('register-email')).sendKeys('teste@email.com');
            await driver.findElement(By.id('register-password')).sendKeys('123456');
            await driver.findElement(By.id('register-confirm-password')).sendKeys('654321');

            await driver.findElement(By.css('#register-form button[type="submit"]')).click();

            // Aguardar mensagem de erro
            const errorMessage = await driver.wait(
                until.elementLocated(By.css('#register-message.error')), 
                TIMEOUT
            );
            const messageText = await errorMessage.getText();
            expect(messageText).toContain('coincidem');
        });
    });

    describe('Cenário: Gerenciamento Completo de Tarefas (Caminho Feliz)', () => {
        beforeEach(async () => {
            // Fazer login antes de cada teste de tarefa
            await driver.findElement(By.id('login-email')).sendKeys('teste@example.com');
            await driver.findElement(By.id('login-password')).sendKeys('123456');
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );
        });

        test('deve criar nova tarefa com sucesso', async () => {
            const taskTitle = 'Minha nova tarefa';
            const taskDescription = 'Descrição detalhada da tarefa';

            // Clicar no botão de nova tarefa
            await driver.findElement(By.id('add-task-btn')).click();

            // Aguardar formulário aparecer
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Preencher formulário
            await driver.findElement(By.id('task-title')).sendKeys(taskTitle);
            await driver.findElement(By.id('task-description')).sendKeys(taskDescription);

            // Enviar formulário
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            // Aguardar formulário desaparecer
            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Verificar se tarefa apareceu na lista
            const taskItems = await driver.findElements(By.css('.task-item'));
            expect(taskItems.length).toBeGreaterThan(0);

            // Verificar conteúdo da tarefa
            const taskTitleElement = await driver.findElement(By.css('.task-title'));
            const titleText = await taskTitleElement.getText();
            expect(titleText).toBe(taskTitle);
        });

        test('deve completar tarefa existente', async () => {
            // Primeiro criar uma tarefa
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            await driver.findElement(By.id('task-title')).sendKeys('Tarefa para completar');
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Clicar no botão de completar
            const completeBtn = await driver.findElement(By.css('.task-btn.complete'));
            await completeBtn.click();

            // Verificar que tarefa foi marcada como concluída
            await driver.wait(async () => {
                const taskItem = await driver.findElement(By.css('.task-item'));
                const className = await taskItem.getAttribute('class');
                return className.includes('completed');
            }, TIMEOUT);

            // Verificar que o botão mudou para "Reabrir"
            const reopenBtn = await driver.findElement(By.css('.task-btn.complete'));
            const btnText = await reopenBtn.getText();
            expect(btnText).toBe('Reabrir');
        });

        test('deve editar tarefa existente', async () => {
            const originalTitle = 'Tarefa original';
            const updatedTitle = 'Tarefa atualizada';

            // Criar tarefa
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            await driver.findElement(By.id('task-title')).sendKeys(originalTitle);
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Clicar no botão de editar
            const editBtn = await driver.findElement(By.css('.task-btn.edit'));
            await editBtn.click();

            // Aguardar formulário de edição
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Verificar que o formulário está preenchido
            const titleField = await driver.findElement(By.id('task-title'));
            const currentValue = await titleField.getAttribute('value');
            expect(currentValue).toBe(originalTitle);

            // Atualizar o título
            await titleField.clear();
            await titleField.sendKeys(updatedTitle);

            // Salvar alterações
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Verificar que a tarefa foi atualizada
            const taskTitleElement = await driver.findElement(By.css('.task-title'));
            const titleText = await taskTitleElement.getText();
            expect(titleText).toBe(updatedTitle);
        });

        test('deve excluir tarefa com confirmação', async () => {
            // Criar tarefa
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            await driver.findElement(By.id('task-title')).sendKeys('Tarefa para excluir');
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Preparar para aceitar o diálogo de confirmação
            let alertAccepted = false;
            driver.executeScript(`
                window.originalConfirm = window.confirm;
                window.confirm = function(message) {
                    window.lastConfirmMessage = message;
                    return true; // Simular aceitar
                };
            `);

            // Clicar no botão de excluir
            const deleteBtn = await driver.findElement(By.css('.task-btn.delete'));
            await deleteBtn.click();

            // Aguardar um momento para a exclusão processar
            await driver.sleep(1000);

            // Verificar que não há mais tarefas
            const noTasksMessage = await driver.findElement(By.id('no-tasks'));
            const isVisible = await noTasksMessage.isDisplayed();
            expect(isVisible).toBe(true);
        });
    });

    describe('Cenário: Validações de Tarefas (Entradas Inválidas)', () => {
        beforeEach(async () => {
            // Fazer login
            await driver.findElement(By.id('login-email')).sendKeys('teste@example.com');
            await driver.findElement(By.id('login-password')).sendKeys('123456');
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );
        });

        test('deve validar campo título obrigatório', async () => {
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Tentar enviar formulário vazio
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            // Verificar validação HTML5
            const titleField = await driver.findElement(By.id('task-title'));
            const validationMessage = await titleField.getAttribute('validationMessage');
            expect(validationMessage).toBeTruthy();
        });

        test('deve cancelar criação de tarefa', async () => {
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Preencher alguns dados
            await driver.findElement(By.id('task-title')).sendKeys('Tarefa para cancelar');

            // Clicar em cancelar
            await driver.findElement(By.id('cancel-task-btn')).click();

            // Verificar que o formulário foi fechado
            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Verificar que nenhuma tarefa foi criada
            const noTasksMessage = await driver.findElement(By.id('no-tasks'));
            const isVisible = await noTasksMessage.isDisplayed();
            expect(isVisible).toBe(true);
        });
    });

    describe('Cenário: Interface Responsiva e Acessibilidade', () => {
        test('deve funcionar em viewport mobile', async () => {
            // Simular viewport mobile
            await driver.manage().window().setRect({ width: 375, height: 667 });

            await driver.findElement(By.id('login-email')).sendKeys('teste@example.com');
            await driver.findElement(By.id('login-password')).sendKeys('123456');
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            // Verificar que elementos são clicáveis em mobile
            const addTaskBtn = await driver.findElement(By.id('add-task-btn'));
            expect(await addTaskBtn.isDisplayed()).toBe(true);
            expect(await addTaskBtn.isEnabled()).toBe(true);

            // Restaurar viewport
            await driver.manage().window().setRect({ width: 1920, height: 1080 });
        });

        test('deve permitir navegação por teclado', async () => {
            // Usar Tab para navegar pelos campos
            const emailField = await driver.findElement(By.id('login-email'));
            await emailField.click();
            await emailField.sendKeys('teste@example.com');

            // Navegar para próximo campo com Tab
            await driver.actions().sendKeys(Key.TAB).perform();
            
            // O campo de senha deve estar focado
            const passwordField = await driver.findElement(By.id('login-password'));
            const activeElement = await driver.executeScript('return document.activeElement');
            const passwordElement = await driver.findElement(By.id('login-password'));
            
            // Verificar que o campo correto está focado
            const activeId = await driver.executeScript('return document.activeElement.id');
            expect(activeId).toBe('login-password');
        });
    });
}, 60000);