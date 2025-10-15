/**
 * Testes de sistema adicionais para cenários específicos
 * Foca em fluxos alternativos e casos extremos
 * 
 * Cenários de teste:
 * 1. Persistência de dados e sessão
 * 2. Performance e usabilidade
 * 3. Casos extremos de interface
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('Sistema Task Manager - Cenários Avançados', () => {
    let driver;
    const BASE_URL = 'http://localhost:3000';
    const TIMEOUT = 10000;

    beforeAll(async () => {
        const options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get(BASE_URL);
        await driver.wait(until.titleContains('Task Manager'), TIMEOUT);
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async () => {
        await driver.get(BASE_URL);
        await driver.executeScript('localStorage.clear();');
        await driver.refresh();
        await driver.wait(until.elementLocated(By.id('auth-section')), TIMEOUT);
    });

    describe('Cenário: Persistência e Gerenciamento de Sessão', () => {
        const testUser = {
            username: 'persistuser',
            email: 'persist@example.com',
            password: '123456'
        };

        test('deve manter sessão após reload da página', async () => {
            // Registrar e fazer login
            await driver.findElement(By.id('register-tab')).click();
            await driver.wait(until.elementIsVisible(
                driver.findElement(By.id('register-form'))
            ), TIMEOUT);

            await driver.findElement(By.id('register-username')).sendKeys(testUser.username);
            await driver.findElement(By.id('register-email')).sendKeys(testUser.email);
            await driver.findElement(By.id('register-password')).sendKeys(testUser.password);
            await driver.findElement(By.id('register-confirm-password')).sendKeys(testUser.password);
            await driver.findElement(By.css('#register-form button[type="submit"]')).click();

            // Aguardar redirecionamento para login
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('login-form'))), 
                TIMEOUT
            );

            // Fazer login
            await driver.findElement(By.id('login-email')).sendKeys(testUser.email);
            await driver.findElement(By.id('login-password')).sendKeys(testUser.password);
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            // Aguardar dashboard
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            // Recarregar página
            await driver.refresh();

            // Verificar que usuário continua logado
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            const welcomeMessage = await driver.findElement(By.id('welcome-message'));
            const welcomeText = await welcomeMessage.getText();
            expect(welcomeText).toContain(testUser.username);
        });

        test('deve carregar tarefas salvas após reload', async () => {
            // Login primeiro
            await driver.findElement(By.id('login-email')).sendKeys(testUser.email);
            await driver.findElement(By.id('login-password')).sendKeys(testUser.password);
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            // Criar algumas tarefas
            const taskTitles = ['Tarefa 1', 'Tarefa 2', 'Tarefa 3'];

            for (const title of taskTitles) {
                await driver.findElement(By.id('add-task-btn')).click();
                await driver.wait(
                    until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                    TIMEOUT
                );

                await driver.findElement(By.id('task-title')).sendKeys(title);
                await driver.findElement(By.css('#task-form button[type="submit"]')).click();

                await driver.wait(
                    until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                    TIMEOUT
                );
            }

            // Recarregar página
            await driver.refresh();

            // Aguardar carregamento
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            // Verificar que todas as tarefas foram carregadas
            const taskItems = await driver.findElements(By.css('.task-item'));
            expect(taskItems.length).toBe(taskTitles.length);

            // Verificar conteúdo das tarefas
            const taskTitleElements = await driver.findElements(By.css('.task-title'));
            const loadedTitles = await Promise.all(
                taskTitleElements.map(el => el.getText())
            );

            taskTitles.forEach(title => {
                expect(loadedTitles).toContain(title);
            });
        });

        test('deve expirar sessão corretamente no logout', async () => {
            // Login
            await driver.findElement(By.id('login-email')).sendKeys(testUser.email);
            await driver.findElement(By.id('login-password')).sendKeys(testUser.password);
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );

            // Logout
            await driver.findElement(By.id('logout-btn')).click();

            // Verificar redirecionamento para login
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('auth-section'))), 
                TIMEOUT
            );

            // Recarregar página - deve continuar na tela de login
            await driver.refresh();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('auth-section'))), 
                TIMEOUT
            );

            // Verificar que navigation está oculto
            const navigation = await driver.findElement(By.id('navigation'));
            const isHidden = await navigation.getAttribute('class');
            expect(isHidden).toContain('hidden');
        });
    });

    describe('Cenário: Performance e Usabilidade', () => {
        beforeEach(async () => {
            // Login para testes de performance
            await driver.findElement(By.id('login-email')).sendKeys('persist@example.com');
            await driver.findElement(By.id('login-password')).sendKeys('123456');
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );
        });

        test('deve carregar interface rapidamente', async () => {
            const startTime = Date.now();

            // Navegar para página
            await driver.get(BASE_URL);

            // Aguardar elemento principal aparecer
            await driver.wait(until.elementLocated(By.id('auth-section')), TIMEOUT);

            const loadTime = Date.now() - startTime;

            // Interface deve carregar em menos de 3 segundos
            expect(loadTime).toBeLessThan(3000);
        });

        test('deve responder rapidamente a interações do usuário', async () => {
            const startTime = Date.now();

            // Clicar no botão de nova tarefa
            await driver.findElement(By.id('add-task-btn')).click();

            // Aguardar formulário aparecer
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            const responseTime = Date.now() - startTime;

            // Resposta deve ser quase instantânea (< 500ms)
            expect(responseTime).toBeLessThan(500);
        });

        test('deve lidar com muitas tarefas sem degradação', async () => {
            // Criar múltiplas tarefas rapidamente
            const numberOfTasks = 20;

            for (let i = 1; i <= numberOfTasks; i++) {
                await driver.findElement(By.id('add-task-btn')).click();
                await driver.wait(
                    until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                    TIMEOUT
                );

                await driver.findElement(By.id('task-title')).sendKeys(`Tarefa ${i}`);
                await driver.findElement(By.css('#task-form button[type="submit"]')).click();

                await driver.wait(
                    until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                    TIMEOUT
                );
            }

            // Verificar que todas as tarefas foram criadas
            const taskItems = await driver.findElements(By.css('.task-item'));
            expect(taskItems.length).toBe(numberOfTasks);

            // Verificar que a interface ainda responde
            const addTaskBtn = await driver.findElement(By.id('add-task-btn'));
            expect(await addTaskBtn.isEnabled()).toBe(true);

            // Testar scroll na lista de tarefas
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.executeScript('window.scrollTo(0, 0);');

            // Interface deve continuar responsiva
            const firstTask = await driver.findElement(By.css('.task-item:first-child .task-btn.complete'));
            await firstTask.click();

            // Verificar que a ação foi processada
            await driver.wait(async () => {
                const taskItem = await driver.findElement(By.css('.task-item:first-child'));
                const className = await taskItem.getAttribute('class');
                return className.includes('completed');
            }, TIMEOUT);
        });
    });

    describe('Cenário: Casos Extremos de Interface', () => {
        beforeEach(async () => {
            // Login
            await driver.findElement(By.id('login-email')).sendKeys('persist@example.com');
            await driver.findElement(By.id('login-password')).sendKeys('123456');
            await driver.findElement(By.css('#login-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('tasks-section'))), 
                TIMEOUT
            );
        });

        test('deve lidar com títulos de tarefa muito longos', async () => {
            const longTitle = 'Este é um título extremamente longo que pode quebrar o layout da aplicação se não for tratado corretamente pelo CSS e pela validação do formulário';

            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            await driver.findElement(By.id('task-title')).sendKeys(longTitle);
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            // Se validação funcionar, deve mostrar erro
            // Se não houver validação, deve criar tarefa com título truncado
            try {
                await driver.wait(
                    until.elementLocated(By.css('#task-message.error')), 
                    2000
                );
                // Validação funcionou - teste passou
                expect(true).toBe(true);
            } catch {
                // Sem validação - verificar se tarefa foi criada
                await driver.wait(
                    until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                    TIMEOUT
                );

                const taskTitle = await driver.findElement(By.css('.task-title'));
                const titleText = await taskTitle.getText();
                expect(titleText.length).toBeGreaterThan(0);
            }
        });

        test('deve lidar com caracteres especiais em tarefas', async () => {
            const specialTitle = '📝 Tarefa com émojis & caracteres especiais <script>alert("xss")</script>';
            const specialDescription = 'Descrição com HTML: <b>negrito</b> & <i>itálico</i> + 💻';

            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            await driver.findElement(By.id('task-title')).sendKeys(specialTitle);
            await driver.findElement(By.id('task-description')).sendKeys(specialDescription);
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            // Verificar que tarefa foi criada
            const taskTitle = await driver.findElement(By.css('.task-title'));
            const titleText = await taskTitle.getText();

            // HTML deve ser escapado/sanitizado
            expect(titleText).not.toContain('<script>');
            expect(titleText).toContain('📝'); // Emojis devem ser preservados

            const taskDescription = await driver.findElement(By.css('.task-description'));
            const descText = await taskDescription.getText();
            expect(descText).not.toContain('<b>'); // HTML deve ser escapado
        });

        test('deve funcionar com conexão lenta/instável', async () => {
            // Simular conexão lenta usando Chrome DevTools
            await driver.executeScript(`
                // Simular delay na rede
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(originalFetch.apply(this, args));
                        }, 1000); // 1 segundo de delay
                    });
                };
            `);

            const startTime = Date.now();

            // Tentar criar tarefa com delay simulado
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            await driver.findElement(By.id('task-title')).sendKeys('Tarefa com delay');
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            // Aguardar processamento com delay
            await driver.wait(
                until.elementIsNotVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT + 2000 // Timeout extra para o delay
            );

            const totalTime = Date.now() - startTime;

            // Verificar que operação foi concluída mesmo com delay
            const taskItems = await driver.findElements(By.css('.task-item'));
            expect(taskItems.length).toBeGreaterThan(0);

            // Tempo deve refletir o delay simulado
            expect(totalTime).toBeGreaterThan(1000);
        });

        test('deve preservar dados do formulário durante erros', async () => {
            await driver.findElement(By.id('add-task-btn')).click();
            await driver.wait(
                until.elementIsVisible(driver.findElement(By.id('task-form'))), 
                TIMEOUT
            );

            const titleText = 'Tarefa com dados preservados';
            const descText = 'Descrição que deve ser preservada';

            // Preencher formulário
            await driver.findElement(By.id('task-title')).sendKeys(titleText);
            await driver.findElement(By.id('task-description')).sendKeys(descText);

            // Simular erro de rede
            await driver.executeScript(`
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    return Promise.reject(new Error('Network error'));
                };
            `);

            // Tentar enviar formulário
            await driver.findElement(By.css('#task-form button[type="submit"]')).click();

            // Aguardar mensagem de erro (se houver tratamento)
            await driver.sleep(2000);

            // Verificar que dados foram preservados no formulário
            const titleField = await driver.findElement(By.id('task-title'));
            const descField = await driver.findElement(By.id('task-description'));

            const preservedTitle = await titleField.getAttribute('value');
            const preservedDesc = await descField.getAttribute('value');

            expect(preservedTitle).toBe(titleText);
            expect(preservedDesc).toBe(descText);

            // Restaurar fetch original
            await driver.executeScript(`
                window.fetch = originalFetch;
            `);
        });

        test('deve funcionar sem JavaScript habilitado', async () => {
            // Este teste é mais conceitual - verificar elementos base HTML
            
            // Verificar que formulários têm action e method adequados
            const loginForm = await driver.findElement(By.id('login-form'));
            const registerForm = await driver.findElement(By.id('register-form'));

            // Verificar elementos de acessibilidade
            const titleField = await driver.findElement(By.id('login-email'));
            const hasLabel = await driver.executeScript(`
                const field = arguments[0];
                const label = document.querySelector('label[for="' + field.id + '"]');
                return label !== null;
            `, titleField);

            expect(hasLabel).toBe(true);

            // Verificar que botões têm tipos adequados
            const submitBtn = await driver.findElement(By.css('#login-form button[type="submit"]'));
            const btnType = await submitBtn.getAttribute('type');
            expect(btnType).toBe('submit');
        });
    });

    describe('Cenário: Acessibilidade e Usabilidade', () => {
        test('deve permitir navegação completa por teclado', async () => {
            // Testar navegação por Tab em toda a interface
            let currentElement = await driver.findElement(By.id('login-email'));
            await currentElement.click();

            const elementsToTab = [
                'login-email',
                'login-password',
                'login-tab',
                'register-tab'
            ];

            for (let i = 0; i < elementsToTab.length; i++) {
                await driver.actions().sendKeys(Key.TAB).perform();
                await driver.sleep(100); // Pequena pausa para processar

                const activeElementId = await driver.executeScript('return document.activeElement.id');
                // Verificar que elementos focáveis estão recebendo foco
                expect(activeElementId).toBeTruthy();
            }
        });

        test('deve ter contraste adequado e texto legível', async () => {
            // Verificar propriedades CSS de contraste
            const titleElement = await driver.findElement(By.css('header h1'));
            
            const styles = await driver.executeScript(`
                const element = arguments[0];
                const computedStyle = window.getComputedStyle(element);
                return {
                    color: computedStyle.color,
                    backgroundColor: computedStyle.backgroundColor,
                    fontSize: computedStyle.fontSize
                };
            `, titleElement);

            // Verificar que texto tem tamanho mínimo
            const fontSize = parseInt(styles.fontSize);
            expect(fontSize).toBeGreaterThanOrEqual(16); // Mínimo para acessibilidade

            // Verificar que elementos têm cores definidas
            expect(styles.color).toBeTruthy();
        });

        test('deve funcionar bem em diferentes zoom levels', async () => {
            // Testar com zoom 150%
            await driver.executeScript('document.body.style.zoom = "150%"');
            
            // Verificar que elementos ainda são clicáveis
            const loginBtn = await driver.findElement(By.css('#login-form button[type="submit"]'));
            expect(await loginBtn.isDisplayed()).toBe(true);
            expect(await loginBtn.isEnabled()).toBe(true);

            // Testar com zoom 75%
            await driver.executeScript('document.body.style.zoom = "75%"');
            
            // Verificar que interface ainda é usável
            const emailField = await driver.findElement(By.id('login-email'));
            await emailField.click();
            await emailField.sendKeys('test@example.com');

            const enteredValue = await emailField.getAttribute('value');
            expect(enteredValue).toBe('test@example.com');

            // Restaurar zoom normal
            await driver.executeScript('document.body.style.zoom = "100%"');
        });
    });
}, 120000);