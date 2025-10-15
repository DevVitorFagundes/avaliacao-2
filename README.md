conteudo_readme = '''# Projeto de Testes Automatizados

**Sistema de Gerenciamento de Usuários e Tarefas**

Centro Universitário Senac-RS  
Disciplina: Qualidade de Software  
Professor: Luciano Zanuz  
**Integrantes:** Guilherme Fonseca e Vitor Fagundes

---

## 📋 Sobre o Projeto

Aplicação web para gerenciamento de usuários e tarefas, com simulação de autenticação, controle de sessão e manipulação de tarefas (CRUD completo).  
Inclui **testes automatizados** com foco em **validação de rotas**, **autenticação**, e **operações CRUD**, cobrindo tanto **testes unitários** quanto **testes de sistema**.

---

## 🚀 Tecnologias

- Node.js + Express  
- Jest (Testes Unitários e de Integração)  
- Supertest (para testes de API REST)  
- HTML/CSS/JavaScript  

---

## 📦 Instalação

```bash
npm install
```

---

## ▶️ Execução

### 1. Iniciar a Aplicação
```bash
npm start
```
Acesse: http://localhost:3000

### 2. Executar Testes

```bash
# Todos os testes
npm test

# Apenas unitários
npm run test:unit

# Apenas de sistema (com servidor rodando)
npm run test:system

# Relatório de cobertura
npm run test:coverage
```

**IMPORTANTE:** Para os testes de sistema, o servidor precisa estar ativo em uma janela separada do terminal.

---

## 🧪 Casos de Teste

### Testes Unitários (25 casos em 5 cenários)

**Cenário 1: Cadastro e Login de Usuário**  
- Cadastro de usuário válido  
- Rejeitar campos obrigatórios vazios  
- Email duplicado  
- Login com sucesso  
- Login com credenciais inválidas  

**Cenário 2: Logout e Sessão**  
- Logout válido  
- Bloquear acesso após logout  
- Manter sessão de usuário autenticado  

**Cenário 3: Criação de Tarefas**  
- Criar tarefa válida  
- Rejeitar título vazio  
- Bloquear criação sem login  

**Cenário 4: Manipulação de Tarefas (CRUD)**  
- Listar tarefas do usuário logado  
- Atualizar título  
- Marcar como concluída  
- Deletar tarefa  
- Erro ao deletar tarefa inexistente  

**Cenário 5: Casos Extremos**  
- ID de tarefa inválido  
- Acesso sem autenticação  
- Campos inesperados no corpo da requisição  
- Sessões paralelas  
- Tarefas duplicadas  

### Testes de Sistema (11 casos em 4 cenários)

**Cenário 1: Registro e Login**  
- Cadastro e login válidos (caminho feliz)  
- Campos vazios  
- Credenciais incorretas  

**Cenário 2: Criação e Listagem**  
- Criar tarefa via API  
- Verificar listagem após criação  
- Sessão expirada impede criação  

**Cenário 3: Atualização e Exclusão**  
- Atualizar tarefa existente  
- Excluir tarefa  
- Excluir tarefa inexistente  

**Cenário 4: Sessão e Segurança**  
- Acesso negado sem login  
- Logout limpa sessão  

**Total: 36 casos de teste**

---

## 📁 Estrutura de Pastas

```
├── src/
│   ├── server.js             # Lógica principal (Express)
│   └── public/
│       └── index.html        # Interface da aplicação
├── tests/
│   ├── unit/
│   │   └── auth.test.js      # Testes de autenticação
│   │   └── tasks.test.js     # Testes de tarefas
│   └── system/
│       └── api.test.js       # Testes de sistema com Supertest
├── package.json
└── README.md
```

---

## ✅ Requisitos Atendidos

- ✅ Testes de sistema e unitários completos  
- ✅ Cobertura de código com Jest  
- ✅ API backend funcional (Node.js + Express)  
- ✅ Operações CRUD completas de tarefas  
- ✅ Fluxos de autenticação (login/logout)  
- ✅ Enfoque em qualidade de software  

---

## 📊 Evidências

Os relatórios de execução do Jest exibem:  
- Todos os casos executados  
- Resultados (passou/falhou)  
- Tempo por teste  
- Cobertura detalhada (`npm run test:coverage`)  

---

## 🎯 Funcionalidades do Sistema

- 👤 Cadastro e Login de Usuário  
- 🗂️ Criação, Edição e Exclusão de Tarefas  
- 🔐 Controle de Sessão e Autenticação  
- 📆 Listagem filtrada por usuário  
- 📈 Métricas de testes e cobertura  

---

## 📅 Data de Entrega

15/10/2025
