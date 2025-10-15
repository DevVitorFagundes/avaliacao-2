/**
 * Módulo de funções utilitárias
 * Contém funções auxiliares reutilizáveis em toda a aplicação
 */

/**
 * Validação de email usando regex
 * @param {string} email - Email para validar
 * @returns {boolean} - True se email for válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validação de senha (mínimo 6 caracteres)
 * @param {string} password - Senha para validar
 * @returns {boolean} - True se senha for válida
 */
function isValidPassword(password) {
    if (!password || typeof password !== 'string') {
        return false;
    }
    return password.trim().length >= 6;
}

/**
 * Sanitização de string HTML para prevenir XSS
 * @param {string} str - String para sanitizar
 * @returns {string} - String sanitizada
 */
function sanitizeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(match) {
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        };
        return htmlEntities[match];
    });
}

/**
 * Formatação de data para exibição
 * @param {string} dateString - String de data ISO
 * @returns {string} - Data formatada
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Normalizar as datas para meia-noite para comparação correta
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Hoje';
    } else if (diffDays === 1) {
        return 'Ontem';
    } else if (diffDays <= 7) {
        return `${diffDays} dias atrás`;
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

/**
 * Exibição de mensagem para o usuário
 * @param {string} elementId - ID do elemento onde exibir a mensagem
 * @param {string} message - Mensagem para exibir
 * @param {string} type - Tipo da mensagem (success, error, info)
 * @param {number} duration - Duração em ms (opcional, padrão 5000)
 */
function showMessage(elementId, message, type = 'info', duration = 5000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    if (duration > 0) {
        setTimeout(() => {
            element.style.display = 'none';
            element.textContent = '';
            element.className = 'message';
        }, duration);
    }
}

/**
 * Limpar mensagens de um elemento
 * @param {string} elementId - ID do elemento para limpar
 */
function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
        element.textContent = '';
        element.className = 'message';
    }
}

/**
 * Alternar visibilidade de elementos
 * @param {string} hideElementId - ID do elemento para esconder
 * @param {string} showElementId - ID do elemento para mostrar
 */
function toggleSections(hideElementId, showElementId) {
    const hideElement = document.getElementById(hideElementId);
    const showElement = document.getElementById(showElementId);
    
    if (hideElement) {
        hideElement.classList.add('hidden');
    }
    
    if (showElement) {
        showElement.classList.remove('hidden');
    }
}

/**
 * Limpar formulário
 * @param {string} formId - ID do formulário para limpar
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Limpar mensagens associadas ao formulário
        const messageElements = form.querySelectorAll('.message');
        messageElements.forEach(element => {
            element.style.display = 'none';
            element.textContent = '';
            element.className = 'message';
        });
    }
}

/**
 * Validação de formulário genérica
 * @param {HTMLFormElement} form - Elemento do formulário
 * @returns {boolean} - True se formulário for válido
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#ddd';
        }
    });
    
    return isValid;
}

/**
 * Criar elemento HTML com atributos
 * @param {string} tag - Tag do elemento
 * @param {Object} attributes - Atributos do elemento
 * @param {string} textContent - Conteúdo de texto (opcional)
 * @returns {HTMLElement} - Elemento criado
 */
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

/**
 * Debounce para limitar execução de funções
 * @param {Function} func - Função para fazer debounce
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar para uso em testes (se ambiente Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        isValidPassword,
        sanitizeHTML,
        formatDate,
        showMessage,
        clearMessage,
        toggleSections,
        clearForm,
        validateForm,
        createElement,
        debounce
    };
}