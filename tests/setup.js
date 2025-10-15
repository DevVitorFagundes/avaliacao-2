// Configuração global para testes Jest
// Este arquivo é executado antes de cada arquivo de teste

// Mock para localStorage (necessário para testes do navegador)
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock para sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock para window.alert
global.alert = jest.fn();

// Mock para window.confirm
global.confirm = jest.fn();

// Mock para console.log em testes (opcional, para evitar spam)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };