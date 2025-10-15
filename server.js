const express = require('express');
const path = require('path');
const app = express();

// Configurar para servir arquivos estáticos da pasta src
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.json());

// Simulação de banco de dados em memória
let users = [];
let tasks = [];
let currentUserId = null;

// Rota para página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// API para registro de usuário
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Validação básica
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
  }
  
  // Verificar se usuário já existe
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ success: false, message: 'Email já cadastrado' });
  }
  
  const user = {
    id: users.length + 1,
    username,
    email,
    password // Em produção, seria hasheado
  };
  
  users.push(user);
  res.json({ success: true, message: 'Usuário cadastrado com sucesso' });
});

// API para login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUserId = user.id;
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// API para logout
app.post('/api/logout', (req, res) => {
  currentUserId = null;
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// API para obter tarefas do usuário logado
app.get('/api/tasks', (req, res) => {
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }
  
  const userTasks = tasks.filter(task => task.userId === currentUserId);
  res.json({ success: true, tasks: userTasks });
});

// API para criar nova tarefa
app.post('/api/tasks', (req, res) => {
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }
  
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Título é obrigatório' });
  }
  
  const task = {
    id: tasks.length + 1,
    userId: currentUserId,
    title,
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(task);
  res.json({ success: true, task });
});

// API para atualizar tarefa
app.put('/api/tasks/:id', (req, res) => {
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }
  
  const taskId = parseInt(req.params.id);
  const { title, description, completed } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === currentUserId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
  }
  
  if (title !== undefined) tasks[taskIndex].title = title;
  if (description !== undefined) tasks[taskIndex].description = description;
  if (completed !== undefined) tasks[taskIndex].completed = completed;
  
  res.json({ success: true, task: tasks[taskIndex] });
});

// API para deletar tarefa
app.delete('/api/tasks/:id', (req, res) => {
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }
  
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === currentUserId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
  }
  
  tasks.splice(taskIndex, 1);
  res.json({ success: true, message: 'Tarefa deletada com sucesso' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;