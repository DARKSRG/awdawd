// Глобальные переменные
let currentUser = null;

// Данные для демонстрации (в реальном приложении будут храниться в базе данных)
const programs = [
    { id: 1, name: 'Google Chrome', description: 'Веб-браузер', icon: 'chrome.png' },
    { id: 2, name: 'Microsoft Office', description: 'Пакет офисных приложений', icon: 'office.png' },
    { id: 3, name: 'Kaspersky', description: 'Антивирусное ПО', icon: 'kaspersky.png' },
    { id: 4, name: 'Adobe Photoshop', description: 'Графический редактор', icon: 'photoshop.png' },
    { id: 5, name: 'Visual Studio Code', description: 'Редактор кода', icon: 'vscode.png' }
];

// Имитация базы данных пользователей
let users = [
    { id: 1, email: 'admin@example.com', password: 'admin123', name: 'Admin', isAdmin: true },
    { id: 2, email: 'user@example.com', password: 'user123', name: 'User', isAdmin: false }
];

// Имитация базы данных запросов
let requests = [];

// Проверка авторизации
async function checkAuth() {
    try {
        const response = await fetch('api/check_auth.php');
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateNavigation();
        }
    } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
    }
}

// Обновление навигации
function updateNavigation() {
    const authLink = document.getElementById('authLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const adminLink = document.getElementById('adminLink');

    if (currentUser) {
        if (authLink) authLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'inline';
        if (adminLink && currentUser.is_admin) adminLink.style.display = 'inline';
    } else {
        if (authLink) authLink.style.display = 'inline';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Обработка входа
async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateNavigation();
            window.location.href = data.user.is_admin ? 'admin.html' : 'dashboard.html';
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Ошибка при входе в систему');
    }
}

// Обработка регистрации
async function handleRegister(event) {
    event.preventDefault();
    const name = event.target.querySelector('input[type="text"]').value;
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = event.target.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        showError('Пароли не совпадают');
        return;
    }

    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateNavigation();
            window.location.href = 'dashboard.html';
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Ошибка при регистрации');
    }
}

// Получение списка программ
async function getPrograms() {
    try {
        const response = await fetch('api/get_programs.php');
        const data = await response.json();
        
        if (data.success) {
            return data.programs;
        } else {
            showError(data.error);
            return [];
        }
    } catch (error) {
        showError('Ошибка при получении списка программ');
        return [];
    }
}

// Отображение программ
async function displayPrograms() {
    const programsList = document.getElementById('programsList') || 
                        document.getElementById('availableProgramsList') ||
                        document.getElementById('adminProgramsList');

    if (!programsList) return;

    const programs = await getPrograms();
    
    if (!currentUser) {
        programsList.innerHTML = `
            <div class="auth-required">
                <h3>Для просмотра программ необходимо авторизоваться</h3>
                <a href="auth.html" class="btn">Войти</a>
            </div>
        `;
        return;
    }

    programsList.innerHTML = programs.map(program => `
        <div class="program-card">
            <h3>${program.name}</h3>
            <p>${program.description}</p>
            <button onclick="selectProgram(${program.id})" class="btn">Выбрать</button>
        </div>
    `).join('');
}

// Выбор программы
async function selectProgram(programId) {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    try {
        const response = await fetch('api/create_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ program_id: programId })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Программа добавлена в список запросов');
            if (window.location.pathname.includes('dashboard.html')) {
                displayRequests();
            }
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Ошибка при создании запроса');
    }
}

// Получение списка запросов
async function getRequests() {
    try {
        const response = await fetch('api/get_requests.php');
        const data = await response.json();
        
        if (data.success) {
            return data.requests;
        } else {
            showError(data.error);
            return [];
        }
    } catch (error) {
        showError('Ошибка при получении списка запросов');
        return [];
    }
}

// Отображение запросов
async function displayRequests() {
    const requestsList = document.getElementById('requestsList');
    if (!requestsList) return;

    const requests = await getRequests();
    
    requestsList.innerHTML = requests.map(request => `
        <div class="request-item">
            <h3>${request.program_name}</h3>
            ${currentUser.is_admin ? `<p>Пользователь: ${request.user_name}</p>` : ''}
            <p>Дата: ${new Date(request.created_at).toLocaleString()}</p>
            <p>Статус: ${getStatusText(request.status)}</p>
            ${currentUser.is_admin && request.status === 'pending' ? 
                `<button onclick="updateRequestStatus(${request.id}, 'completed')" class="btn">Отметить как выполненное</button>` : 
                ''}
        </div>
    `).join('');
}

// Получение текста статуса
function getStatusText(status) {
    const statuses = {
        'pending': 'Ожидает',
        'completed': 'Выполнено',
        'cancelled': 'Отменено'
    };
    return statuses[status] || status;
}

// Обновление статуса запроса
async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch('api/update_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request_id: requestId, status })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Статус запроса обновлен');
            displayRequests();
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Ошибка при обновлении статуса запроса');
    }
}

// Выход из системы
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Показ ошибки
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Показ успешного сообщения
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Обработчики форм
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Переключение вкладок на странице авторизации
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tab}Form`).classList.add('active');
        });
    });

    // Отображение программ и запросов
    displayPrograms();
    displayRequests();
}); 