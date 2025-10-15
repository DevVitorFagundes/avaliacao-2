/**
 * Testes unitários para o módulo de utilitários (utils.js)
 * 
 * Cenários de teste:
 * 1. Validação de email - casos válidos, inválidos e extremos
 * 2. Validação de senha - casos válidos, inválidos e extremos
 * 3. Sanitização HTML - prevenção de XSS
 */

// Importar as funções a serem testadas
// Em ambiente de teste, simulamos a importação
const {
    isValidEmail,
    isValidPassword,
    sanitizeHTML,
    formatDate,
    debounce
} = require('../../src/js/utils');

describe('Utils Module - Validação de Email', () => {
    describe('Cenário: Validação de emails válidos (Caminho Feliz)', () => {
        test('deve validar email simples como válido', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
        });

        test('deve validar email com subdomain como válido', () => {
            expect(isValidEmail('user@mail.google.com')).toBe(true);
        });

        test('deve validar email com números como válido', () => {
            expect(isValidEmail('user123@domain123.com')).toBe(true);
        });

        test('deve validar email com hífen como válido', () => {
            expect(isValidEmail('first-last@example-domain.org')).toBe(true);
        });
    });

    describe('Cenário: Validação de emails inválidos (Entradas Inválidas)', () => {
        test('deve rejeitar email sem @', () => {
            expect(isValidEmail('invalidemail.com')).toBe(false);
        });

        test('deve rejeitar email sem domínio', () => {
            expect(isValidEmail('user@')).toBe(false);
        });

        test('deve rejeitar email sem usuário', () => {
            expect(isValidEmail('@domain.com')).toBe(false);
        });

        test('deve rejeitar email com espaços', () => {
            expect(isValidEmail('user @domain.com')).toBe(false);
        });

        test('deve rejeitar email com múltiplos @', () => {
            expect(isValidEmail('user@@domain.com')).toBe(false);
        });
    });

    describe('Cenário: Casos extremos de email (Valores Extremos)', () => {
        test('deve rejeitar string vazia', () => {
            expect(isValidEmail('')).toBe(false);
        });

        test('deve rejeitar null', () => {
            expect(isValidEmail(null)).toBe(false);
        });

        test('deve rejeitar undefined', () => {
            expect(isValidEmail(undefined)).toBe(false);
        });

        test('deve validar email muito longo mas válido', () => {
            const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
            expect(isValidEmail(longEmail)).toBe(true);
        });
    });
});

describe('Utils Module - Validação de Senha', () => {
    describe('Cenário: Validação de senhas válidas (Caminho Feliz)', () => {
        test('deve validar senha de 6 caracteres como válida', () => {
            expect(isValidPassword('123456')).toBe(true);
        });

        test('deve validar senha com letras e números como válida', () => {
            expect(isValidPassword('abc123')).toBe(true);
        });

        test('deve validar senha com caracteres especiais como válida', () => {
            expect(isValidPassword('pass@123')).toBe(true);
        });

        test('deve validar senha longa como válida', () => {
            expect(isValidPassword('senhamuitorande123456')).toBe(true);
        });
    });

    describe('Cenário: Validação de senhas inválidas (Entradas Inválidas)', () => {
        test('deve rejeitar senha muito curta (menos de 6 caracteres)', () => {
            expect(isValidPassword('12345')).toBe(false);
        });

        test('deve rejeitar senha vazia', () => {
            expect(isValidPassword('')).toBe(false);
        });

        test('deve rejeitar senha com apenas espaços', () => {
            expect(isValidPassword('     ')).toBe(false);
        });
    });

    describe('Cenário: Casos extremos de senha (Valores Extremos)', () => {
        test('deve rejeitar null', () => {
            expect(isValidPassword(null)).toBe(false);
        });

        test('deve rejeitar undefined', () => {
            expect(isValidPassword(undefined)).toBe(false);
        });

        test('deve validar senha exatamente com 6 caracteres', () => {
            expect(isValidPassword('exacto')).toBe(true);
        });

        test('deve validar senha extremamente longa', () => {
            const longPassword = 'a'.repeat(1000);
            expect(isValidPassword(longPassword)).toBe(true);
        });
    });
});

describe('Utils Module - Sanitização HTML', () => {
    describe('Cenário: Sanitização básica (Caminho Feliz)', () => {
        test('deve manter texto normal inalterado', () => {
            expect(sanitizeHTML('texto normal')).toBe('texto normal');
        });

        test('deve manter números e letras', () => {
            expect(sanitizeHTML('abc123XYZ')).toBe('abc123XYZ');
        });
    });

    describe('Cenário: Prevenção de XSS (Entradas Maliciosas)', () => {
        test('deve escapar caracteres HTML básicos', () => {
            expect(sanitizeHTML('<script>alert("xss")</script>'))
                .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });

        test('deve escapar ampersand', () => {
            expect(sanitizeHTML('João & Maria')).toBe('João &amp; Maria');
        });

        test('deve escapar aspas simples e duplas', () => {
            expect(sanitizeHTML(`'test' "quoted"`)).toBe('&#x27;test&#x27; &quot;quoted&quot;');
        });

        test('deve escapar tags HTML complexas', () => {
            expect(sanitizeHTML('<img src="x" onerror="alert(1)">'))
                .toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
        });
    });

    describe('Cenário: Casos extremos de sanitização (Valores Extremos)', () => {
        test('deve retornar string vazia para entrada vazia', () => {
            expect(sanitizeHTML('')).toBe('');
        });

        test('deve retornar string vazia para null', () => {
            expect(sanitizeHTML(null)).toBe('');
        });

        test('deve retornar string vazia para undefined', () => {
            expect(sanitizeHTML(undefined)).toBe('');
        });

        test('deve processar string muito longa', () => {
            const longString = '<script>' + 'a'.repeat(1000) + '</script>';
            const result = sanitizeHTML(longString);
            expect(result).toContain('&lt;script&gt;');
            expect(result).toContain('&lt;/script&gt;');
        });
    });
});

describe('Utils Module - Formatação de Data', () => {
    describe('Cenário: Formatação de datas válidas (Caminho Feliz)', () => {
        test('deve formatar data de hoje', () => {
            const today = new Date().toISOString();
            expect(formatDate(today)).toBe('Hoje');
        });

        test('deve formatar data de ontem', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(formatDate(yesterday.toISOString())).toBe('Ontem');
        });

        test('deve formatar datas de alguns dias atrás', () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            expect(formatDate(threeDaysAgo.toISOString())).toBe('3 dias atrás');
        });
    });

    describe('Cenário: Entradas inválidas para formatação', () => {
        test('deve retornar string vazia para entrada vazia', () => {
            expect(formatDate('')).toBe('');
        });

        test('deve retornar string vazia para null', () => {
            expect(formatDate(null)).toBe('');
        });

        test('deve retornar string vazia para undefined', () => {
            expect(formatDate(undefined)).toBe('');
        });
    });
});

describe('Utils Module - Função Debounce', () => {
    describe('Cenário: Funcionamento do debounce (Caminho Feliz)', () => {
        test('deve executar função apenas uma vez após período de espera', (done) => {
            const mockFn = jest.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            // Chamar múltiplas vezes rapidamente
            debouncedFn();
            debouncedFn();
            debouncedFn();
            
            // Verificar que não foi chamada imediatamente
            expect(mockFn).not.toHaveBeenCalled();
            
            // Aguardar o período do debounce
            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledTimes(1);
                done();
            }, 150);
        });

        test('deve passar argumentos corretamente', (done) => {
            const mockFn = jest.fn();
            const debouncedFn = debounce(mockFn, 50);
            
            debouncedFn('arg1', 'arg2');
            
            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
                done();
            }, 100);
        });
    });

    describe('Cenário: Comportamento com múltiplas chamadas', () => {
        test('deve cancelar execução anterior ao receber nova chamada', (done) => {
            const mockFn = jest.fn();
            const debouncedFn = debounce(mockFn, 100);
            
            debouncedFn();
            
            setTimeout(() => {
                debouncedFn(); // Nova chamada cancela a anterior
            }, 50);
            
            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledTimes(1);
                done();
            }, 200);
        });
    });
});