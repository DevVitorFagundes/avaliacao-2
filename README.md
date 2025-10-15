# Task Manager - Projeto de Testes Automatizados

Este é um projeto completo de testes automatizados desenvolvido para a disciplina de Qualidade de Software. O projeto inclui uma aplicação web de gerenciamento de tarefas com cobertura completa de testes unitários e de sistema.

## 📋 Sobre o Projeto

O Task Manager é uma aplicação web simples que permite aos usuários:

- Registrar e fazer login em suas contas
- Criar, editar e excluir tarefas
- Marcar tarefas como concluídas ou pendentes
- Visualizar estatísticas de suas tarefas

## 🎯 Objetivos de Aprendizagem

Este projeto foi desenvolvido para demonstrar:

1. **Testes Unitários**: Validação de funções e métodos individuais
2. **Testes de Sistema**: Automação end-to-end da interface de usuário
3. **Cenários de Teste**: Caminhos felizes, alternativos e casos extremos
4. **Boas Práticas**: Estrutura de projeto, documentação e organização de código

## 🏗️ Arquitetura do Projeto

```
avaliacao-2/
├── src/                          # Código fonte da aplicação
│   ├── index.html               # Página principal
│   ├── css/
│   │   └── styles.css          # Estilos da aplicação
│   └── js/
│       ├── app.js              # Arquivo principal da aplicação
│       ├── auth.js             # Módulo de autenticação
│       ├── tasks.js            # Módulo de gerenciamento de tarefas
│       ├── api.js              # Cliente de API
│       └── utils.js            # Funções utilitárias
├── tests/                       # Testes automatizados
│   ├── setup.js                # Configuração global dos testes
│   ├── unit/                   # Testes unitários
│   │   ├── utils.test.js       # Testes das funções utilitárias
│   │   ├── api.test.js         # Testes do cliente de API
│   │   └── tasks.test.js       # Testes do gerenciador de tarefas
│   └── system/                 # Testes de sistema (E2E)
│       ├── e2e.test.js         # Testes end-to-end principais
│       └── advanced.test.js    # Cenários avançados e casos extremos
├── server.js                   # Servidor backend Express.js
├── package.json               # Dependências e scripts
└── README.md                  # Este arquivo
```

## 🧪 Cobertura de Testes

### Testes Unitários (90 testes)

**1. Módulo de Utilitários (utils.js)**

- ✅ Validação de email (12 cenários)
- ✅ Validação de senha (12 cenários)
- ✅ Sanitização HTML (9 cenários)
- ✅ Formatação de data (6 cenários)
- ✅ Função debounce (3 cenários)

**2. Módulo de API (api.js)**

- ✅ Autenticação (login, registro, logout) (9 cenários)
- ✅ Operações CRUD de tarefas (15 cenários)
- ✅ Tratamento de erros (9 cenários)
- ✅ Casos extremos (5 cenários)

**3. Módulo de Tarefas (tasks.js)**

- ✅ Validação de formulários (12 cenários)
- ✅ Estatísticas de tarefas (8 cenários)
- ✅ Filtros e ordenação (8 cenários)
- ✅ Funcionalidades de edição (2 cenários)

### Testes de Sistema (20+ cenários)

**1. Fluxo de Autenticação**

- ✅ Registro → Login → Logout completo
- ✅ Alternância entre formulários
- ✅ Validação de credenciais inválidas
- ✅ Validação de formato de email
- ✅ Confirmação de senha

**2. Gerenciamento de Tarefas**

- ✅ Criação de nova tarefa
- ✅ Edição de tarefa existente
- ✅ Conclusão/reabertura de tarefa
- ✅ Exclusão com confirmação
- ✅ Validação de campos obrigatórios

**3. Persistência e Sessão**

- ✅ Manutenção de sessão após reload
- ✅ Carregamento de tarefas salvas
- ✅ Expiração de sessão no logout

**4. Performance e Usabilidade**

- ✅ Tempo de carregamento da interface
- ✅ Responsividade a interações
- ✅ Gerenciamento de muitas tarefas
- ✅ Interface responsiva (mobile)
- ✅ Navegação por teclado

**5. Casos Extremos**

- ✅ Títulos muito longos
- ✅ Caracteres especiais e emojis
- ✅ Conexão lenta/instável
- ✅ Preservação de dados durante erros
- ✅ Diferentes níveis de zoom
- ✅ Acessibilidade

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Google Chrome (para testes de sistema)

### Instalação

1. **Clone o repositório** (se aplicável):

```bash
git clone <url-do-repositorio>
cd avaliacao-2
```

2. **Instale as dependências**:

```bash
npm install
```

### Executando a Aplicação

1. **Inicie o servidor**:

```bash
npm start
```

2. **Acesse a aplicação**:
   - Abra seu navegador em `http://localhost:3000`

### Executando os Testes

#### Todos os Testes

```bash
npm test
```

#### Apenas Testes Unitários

```bash
npm run test:unit
```

#### Apenas Testes de Sistema

```bash
npm run test:system
```

#### Testes com Relatório de Cobertura

```bash
npm run test:coverage
```

#### Testes em Modo Watch (desenvolvimento)

```bash
npm run test:watch
```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm test` - Executa todos os testes
- `npm run test:unit` - Executa testes unitários
- `npm run test:system` - Executa testes de sistema
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run serve` - Serve arquivos estáticos (alternativo)

## 📊 Tecnologias Utilizadas

### Aplicação

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Armazenamento**: LocalStorage (frontend), Memória (backend)

### Testes

- **Framework de Testes**: Jest
- **Testes de Sistema**: Selenium WebDriver
- **Mocks**: Jest Mocks para fetch API
- **Cobertura**: Jest Coverage Reporter

### Desenvolvimento

- **Linter**: ESLint (implícito via Jest)
- **Formato de Código**: Prettier (configurável)
- **Gestão de Pacotes**: npm

## 📈 Relatórios de Teste

### Como Visualizar Relatórios

1. **Cobertura de Código**:

```bash
npm run test:coverage
```

Abre automaticamente o relatório em `coverage/lcov-report/index.html`

2. **Resultados dos Testes**:
   Os resultados são exibidos no terminal com detalhes de:

- Número de testes passando/falhando
- Tempo de execução
- Cobertura por arquivo
- Casos de teste específicos

### Interpretando os Resultados

- ✅ **Teste Passou**: Funcionalidade implementada corretamente
- ❌ **Teste Falhou**: Problema identificado, necessita correção
- ⏱️ **Tempo de Execução**: Performance dos testes
- 📊 **Cobertura**: Percentual de código testado

## 🎨 Funcionalidades da Aplicação

### Autenticação

- Registro de novos usuários
- Login com email e senha
- Logout seguro
- Persistência de sessão

### Gerenciamento de Tarefas

- Criação de tarefas com título e descrição
- Edição de tarefas existentes
- Marcação como concluída/pendente
- Exclusão de tarefas
- Listagem com filtros

### Interface

- Design responsivo
- Validação de formulários
- Mensagens de feedback
- Acessibilidade via teclado

## 🔍 Cenários de Teste Detalhados

### Testes Unitários

#### 1. Validação de Email

- **Caminho Feliz**: Emails válidos diversos formatos
- **Entradas Inválidas**: Sem @, sem domínio, com espaços
- **Casos Extremos**: String vazia, null, undefined

#### 2. Validação de Senha

- **Caminho Feliz**: Senhas com 6+ caracteres
- **Entradas Inválidas**: Muito curtas, vazias
- **Casos Extremos**: Null, undefined, muito longas

#### 3. Sanitização HTML

- **Caminho Feliz**: Texto normal mantido
- **Prevenção XSS**: Tags HTML escapadas
- **Casos Extremos**: Strings vazias, muito longas

### Testes de Sistema

#### 1. Fluxo Completo de Usuário

1. Usuário acessa a aplicação
2. Registra nova conta
3. Faz login
4. Cria várias tarefas
5. Edita e completa tarefas
6. Faz logout

#### 2. Validações de Interface

- Formulários não podem ser enviados vazios
- Mensagens de erro são exibidas apropriadamente
- Navegação funciona corretamente
- Interface responde a diferentes dispositivos

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

1. **Testes de Sistema Falhando**:

   - Verificar se o Chrome está instalado
   - Aumentar timeouts se necessário
   - Verificar se o servidor está rodando

2. **Problemas de Instalação**:

   - Limpar cache do npm: `npm cache clean --force`
   - Deletar node_modules e reinstalar
   - Verificar versão do Node.js

3. **Testes Unitários Falhando**:
   - Verificar mocks estão configurados
   - Checar importações de módulos
   - Validar estrutura de dados de teste

### Logs e Debugging

- Use `console.log` para debugging durante desenvolvimento
- Jest exibe stack traces detalhados para falhas
- Selenium logs são visíveis no terminal

## 📚 Recursos Adicionais

### Documentação

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Selenium WebDriver](https://selenium-webdriver.js.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Boas Práticas Implementadas

- Separação de responsabilidades (MVC pattern)
- Testes isolados e independentes
- Nomenclatura descritiva de testes
- Cobertura abrangente de cenários
- Documentação clara e detalhada

## 👥 Contribuição

Este projeto foi desenvolvido como trabalho acadêmico. Para sugestões ou melhorias:

1. Identifique o problema ou melhoria
2. Implemente a solução
3. Adicione testes correspondentes
4. Verifique que todos os testes passam
5. Documente as mudanças

## 📄 Licença

Este projeto é licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎓 Contexto Acadêmico

**Disciplina**: Qualidade de Software  
**Instituição**: SENAC  
**Objetivo**: Demonstrar conhecimentos em testes automatizados  
**Critérios Atendidos**:

- ✅ Testes de sistema (3+ casos por cenário)
- ✅ Testes unitários (3+ casos por cenário)
- ✅ Caminho feliz, alternativos e inválidos
- ✅ Aplicação web funcional
- ✅ Automação completa
- ✅ Documentação abrangente

---

**Desenvolvido com ❤️ para demonstrar a importância dos testes automatizados na garantia da qualidade de software.**
