const API_BASE_URL = 'http://127.0.0.1:8000/api';
const INITIAL_SERVERS = [
  { id: 1, hostname: 'web-server-01', ip_address: '192.168.1.10', os_version: 'Ubuntu 22.04 LTS', status: 'Online' },
  { id: 2, hostname: 'db-server-01', ip_address: '192.168.1.20', os_version: 'CentOS 8', status: 'Online' },
  { id: 3, hostname: 'mail-server-01', ip_address: '192.168.1.30', os_version: 'Windows Server 2019', status: 'Maintenance' },
  { id: 4, hostname: 'backup-01', ip_address: '192.168.1.40', os_version: 'Debian 12', status: 'Online' }
];
const state = {
  servers: [],
  filteredServers: [],
  isApiOnline: false,
  currentUser: null,
  pendingDeleteId: null
};
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initSearchAndFilters();
  initModals();
  checkBackendAndLoadData();
  handleUrlParams();
});
function handleUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const modal = urlParams.get('modal');
  const toast = urlParams.get('toast');
  if (page || modal || toast) {
    state.currentUser = { name: 'Administrator', email: 'admin@example.com', role: 'Администратор' };
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('userNameLabel').textContent = state.currentUser.name;
    document.getElementById('userRoleLabel').textContent = state.currentUser.role;
    const targetPage = page || (modal ? 'servers' : 'dashboard');
    const navItem = document.querySelector(`.nav-item[data-page="${targetPage}"]`);
    if (navItem) navItem.click();
    setTimeout(() => {
      if (modal === 'add') openAddModal();
      else if (modal === 'edit') handleEditServer(1);
      else if (modal === 'view') handleViewServer(1);
      else if (modal === 'delete') handleDeletePrompt(3);
      if (toast === 'success') {
        showToast('Сервер "backup-02" успешно добавлен в систему мониторинга (ID: 5)', 'success');
      } else if (toast === 'error') {
        showToast('Ошибка: заполните обязательное поле "Имя хоста"', 'error');
      }
    }, 150);
  }
}
function initAuth() {
  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');
  const loginForm = document.getElementById('loginForm');
  const btnLogout = document.getElementById('btnLogout');
  const authAlert = document.getElementById('authAlert');
  const savedUser = sessionStorage.getItem('server_monitor_user');
  if (savedUser) {
    state.currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showAuth();
  }
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    emailError.textContent = '';
    passwordError.textContent = '';
    authAlert.style.display = 'none';
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let isValid = true;
    if (!email) {
      emailError.textContent = 'Поле email обязательно для заполнения';
      isValid = false;
    } else if (!validateEmail(email)) {
      emailError.textContent = 'Введите корректный адрес электронной почты';
      isValid = false;
    }
    if (!password) {
      passwordError.textContent = 'Поле пароля обязательно для заполнения';
      isValid = false;
    } else if (password.length < 4) {
      passwordError.textContent = 'Пароль должен содержать не менее 4 символов';
      isValid = false;
    }
    if (!isValid) return;
    if (email === 'admin@example.com' && password === 'admin123') {
      const user = {
        name: 'Administrator',
        email: email,
        role: 'Администратор'
      };
      state.currentUser = user;
      sessionStorage.setItem('server_monitor_user', JSON.stringify(user));
      showApp();
      showToast('Успешный вход в систему!', 'success');
    } else {
      authAlert.textContent = 'Неверный логин или пароль. Тестовый вход: admin@example.com / admin123';
      authAlert.style.display = 'block';
      showToast('Ошибка авторизации: неверные данные', 'error');
    }
  });
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('server_monitor_user');
    state.currentUser = null;
    showAuth();
    showToast('Вы вышли из системы', 'success');
  });
  function showAuth() {
    authScreen.style.display = 'flex';
    appContainer.style.display = 'none';
  }
  function showApp() {
    authScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    if (state.currentUser) {
      document.getElementById('userNameLabel').textContent = state.currentUser.name;
      document.getElementById('userRoleLabel').textContent = state.currentUser.role;
    }
  }
}
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pageSections = document.querySelectorAll('.page-section');
  const pageTitle = document.getElementById('pageTitle');
  const titles = {
    dashboard: 'Главная страница (Сводка)',
    servers: 'Управление серверами (CRUD)',
    metrics: 'Телеметрия и метрики серверов',
    incidents: 'Журнал аварийных инцидентов',
    about: 'О системе мониторинга'
  };
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      pageSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `page-${pageId}`) {
          section.classList.add('active');
        }
      });
      if (titles[pageId]) {
        pageTitle.textContent = titles[pageId];
      }
      if (pageId === 'servers') {
        renderServersTable();
      }
    });
  });
  document.getElementById('btnQuickViewServers')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-page="servers"]')?.click();
  });
  document.getElementById('btnQuickRefresh')?.addEventListener('click', () => {
    checkBackendAndLoadData();
    showToast('Данные обновлены', 'success');
  });
  document.getElementById('btnQuickAddServer')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-page="servers"]')?.click();
    openAddModal();
  });
}
async function checkBackendAndLoadData() {
  const statusDot = document.getElementById('backendStatusDot');
  const statusText = document.getElementById('backendStatusText');
  try {
    const res = await fetch(`${API_BASE_URL}/servers/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      state.servers = data;
      state.isApiOnline = true;
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Backend: Подключен (Online)';
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    state.isApiOnline = false;
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Автономный режим (Демо)';
    if (!state.servers || state.servers.length === 0) {
      state.servers = JSON.parse(localStorage.getItem('cached_servers')) || [...INITIAL_SERVERS];
    }
  }
  applyFilters();
  updateDashboardStats();
}
function initSearchAndFilters() {
  const searchInput = document.getElementById('serverSearchInput');
  const statusFilter = document.getElementById('serverStatusFilter');
  const btnRefresh = document.getElementById('btnRefreshServers');
  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  btnRefresh.addEventListener('click', () => {
    checkBackendAndLoadData();
    showToast('Таблица серверов обновлена', 'success');
  });
}
function applyFilters() {
  const query = (document.getElementById('serverSearchInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('serverStatusFilter')?.value || 'ALL';
  state.filteredServers = state.servers.filter(s => {
    const matchesSearch = !query ||
      s.hostname.toLowerCase().includes(query) ||
      s.ip_address.toLowerCase().includes(query) ||
      (s.os_version && s.os_version.toLowerCase().includes(query));
    const matchesStatus = status === 'ALL' || s.status === status;
    return matchesSearch && matchesStatus;
  });
  renderServersTable();
}
function renderServersTable() {
  const tbody = document.getElementById('serversTableBody');
  const countBadge = document.getElementById('serversCountBadge');
  const recordCountText = document.getElementById('tableRecordCount');
  if (countBadge) countBadge.textContent = state.servers.length;
  if (recordCountText) recordCountText.textContent = `Показано записей: ${state.filteredServers.length} из ${state.servers.length}`;
  if (!state.filteredServers || state.filteredServers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted" style="padding: 24px;">
          🔍 Записи не найдены. Попробуйте изменить параметры поиска или добавьте новый сервер.
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = state.filteredServers.map(s => {
    let statusBadgeClass = 'badge-green';
    if (s.status === 'Maintenance') statusBadgeClass = 'badge-amber';
    if (s.status === 'Offline') statusBadgeClass = 'badge-red';
    return `
      <tr data-id="${s.id}">
        <td><strong>#${s.id}</strong></td>
        <td><strong>${escapeHtml(s.hostname)}</strong></td>
        <td><code>${escapeHtml(s.ip_address)}</code></td>
        <td>${escapeHtml(s.os_version || 'Не указана')}</td>
        <td><span class="badge ${statusBadgeClass}">${escapeHtml(s.status)}</span></td>
        <td style="text-align: center;">
          <div class="btn-group">
            <button class="btn btn-outline btn-sm" onclick="handleViewServer(${s.id})" title="Подробная информация">
              👁️ Просмотр
            </button>
            <button class="btn btn-outline btn-sm" onclick="handleEditServer(${s.id})" title="Редактировать">
              ✏️ Изменить
            </button>
            <button class="btn btn-danger-outline btn-sm" onclick="handleDeletePrompt(${s.id})" title="Удалить">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
function updateDashboardStats() {
  const total = state.servers.length;
  const online = state.servers.filter(s => s.status === 'Online').length;
  const maint = state.servers.filter(s => s.status === 'Maintenance').length;
  document.getElementById('statTotalServers').textContent = total;
  document.getElementById('statOnlineServers').textContent = online;
  document.getElementById('statMaintServers').textContent = maint;
}
function initModals() {
  const btnOpenAdd = document.getElementById('btnOpenAddServerModal');
  const modalAdd = document.getElementById('modalAddServer');
  const btnCloseAdd = document.getElementById('btnCloseAddModal');
  const btnCancelAdd = document.getElementById('btnCancelAdd');
  const formAdd = document.getElementById('formAddServer');
  btnOpenAdd.addEventListener('click', openAddModal);
  btnCloseAdd.addEventListener('click', () => modalAdd.style.display = 'none');
  btnCancelAdd.addEventListener('click', () => modalAdd.style.display = 'none');
  formAdd.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hostnameInput = document.getElementById('addHostname');
    const ipInput = document.getElementById('addIp');
    const osInput = document.getElementById('addOs');
    const statusSelect = document.getElementById('addStatus');
    const hostErr = document.getElementById('addHostnameError');
    const ipErr = document.getElementById('addIpError');
    hostErr.textContent = '';
    ipErr.textContent = '';
    const hostname = hostnameInput.value.trim();
    const ip_address = ipInput.value.trim();
    const os_version = osInput.value.trim();
    const status = statusSelect.value;
    let valid = true;
    if (!hostname) {
      hostErr.textContent = 'Укажите имя хоста';
      valid = false;
    }
    if (!ip_address) {
      ipErr.textContent = 'Укажите IP-адрес';
      valid = false;
    }
    if (!valid) return;
    const payload = { hostname, ip_address, os_version, status };
    if (state.isApiOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/servers/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const created = await res.json();
        state.servers.push(created);
        showToast(`Сервер "${hostname}" успешно добавлен (ID: ${created.id})`, 'success');
      } catch (err) {
        showToast('Ошибка при отправке на бэкенд: ' + err.message, 'error');
        return;
      }
    } else {
      const newId = state.servers.length > 0 ? Math.max(...state.servers.map(s => s.id)) + 1 : 1;
      const created = { id: newId, ...payload };
      state.servers.push(created);
      localStorage.setItem('cached_servers', JSON.stringify(state.servers));
      showToast(`Сервер "${hostname}" успешно добавлен (ID: ${newId})`, 'success');
    }
    modalAdd.style.display = 'none';
    formAdd.reset();
    applyFilters();
    updateDashboardStats();
  });
  const modalEdit = document.getElementById('modalEditServer');
  const btnCloseEdit = document.getElementById('btnCloseEditModal');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const formEdit = document.getElementById('formEditServer');
  btnCloseEdit.addEventListener('click', () => modalEdit.style.display = 'none');
  btnCancelEdit.addEventListener('click', () => modalEdit.style.display = 'none');
  formEdit.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('editServerId').value, 10);
    const hostname = document.getElementById('editHostname').value.trim();
    const ip_address = document.getElementById('editIp').value.trim();
    const os_version = document.getElementById('editOs').value.trim();
    const status = document.getElementById('editStatus').value;
    const hostErr = document.getElementById('editHostnameError');
    const ipErr = document.getElementById('editIpError');
    hostErr.textContent = '';
    ipErr.textContent = '';
    let valid = true;
    if (!hostname) {
      hostErr.textContent = 'Укажите имя хоста';
      valid = false;
    }
    if (!ip_address) {
      ipErr.textContent = 'Укажите IP-адрес';
      valid = false;
    }
    if (!valid) return;
    const payload = { hostname, ip_address, os_version, status };
    if (state.isApiOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/servers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();
        const idx = state.servers.findIndex(s => s.id === id);
        if (idx !== -1) state.servers[idx] = updated;
        showToast(`Параметры сервера #${id} успешно обновлены`, 'success');
      } catch (err) {
        showToast('Ошибка при обновлении на сервере: ' + err.message, 'error');
        return;
      }
    } else {
      const idx = state.servers.findIndex(s => s.id === id);
      if (idx !== -1) {
        state.servers[idx] = { id, ...payload };
        localStorage.setItem('cached_servers', JSON.stringify(state.servers));
        showToast(`Параметры сервера #${id} успешно обновлены`, 'success');
      }
    }
    modalEdit.style.display = 'none';
    applyFilters();
    updateDashboardStats();
  });
  const modalView = document.getElementById('modalViewServer');
  const btnCloseViewModal = document.getElementById('btnCloseViewModal');
  const btnCloseView = document.getElementById('btnCloseView');
  const btnEditFromView = document.getElementById('btnEditFromView');
  btnCloseViewModal.addEventListener('click', () => modalView.style.display = 'none');
  btnCloseView.addEventListener('click', () => modalView.style.display = 'none');
  btnEditFromView.addEventListener('click', () => {
    const id = parseInt(document.getElementById('viewId').textContent, 10);
    modalView.style.display = 'none';
    handleEditServer(id);
  });
  const modalDelete = document.getElementById('modalDeleteConfirm');
  const btnCloseDelete = document.getElementById('btnCloseDeleteModal');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  btnCloseDelete.addEventListener('click', () => modalDelete.style.display = 'none');
  btnCancelDelete.addEventListener('click', () => modalDelete.style.display = 'none');
  btnConfirmDelete.addEventListener('click', async () => {
    const id = state.pendingDeleteId;
    if (!id) return;
    if (state.isApiOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/servers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        state.servers = state.servers.filter(s => s.id !== id);
        showToast(`Сервер #${id} успешно удалён из БД`, 'success');
      } catch (err) {
        showToast('Ошибка при удалении: ' + err.message, 'error');
      }
    } else {
      state.servers = state.servers.filter(s => s.id !== id);
      localStorage.setItem('cached_servers', JSON.stringify(state.servers));
      showToast(`Сервер #${id} успешно удалён`, 'success');
    }
    modalDelete.style.display = 'none';
    state.pendingDeleteId = null;
    applyFilters();
    updateDashboardStats();
  });
}
function openAddModal() {
  document.getElementById('formAddServer').reset();
  document.getElementById('addHostnameError').textContent = '';
  document.getElementById('addIpError').textContent = '';
  document.getElementById('modalAddServer').style.display = 'flex';
}
window.handleViewServer = function(id) {
  const server = state.servers.find(s => s.id === id);
  if (!server) return;
  document.getElementById('viewId').textContent = server.id;
  document.getElementById('viewHostname').textContent = server.hostname;
  document.getElementById('viewIp').textContent = server.ip_address;
  document.getElementById('viewOs').textContent = server.os_version || 'Не указана';
  document.getElementById('viewStatusText').textContent = server.status;
  const badge = document.getElementById('viewStatusBadge');
  badge.textContent = server.status;
  badge.className = 'badge ' + (server.status === 'Online' ? 'badge-green' : (server.status === 'Maintenance' ? 'badge-amber' : 'badge-red'));
  const cpuVal = server.id === 2 ? 92 : (server.id === 3 ? 15 : 22);
  const ramVal = server.id === 2 ? 78 : (server.id === 3 ? 38 : 55);
  const diskVal = server.id === 4 ? 84 : 41;
  document.getElementById('viewCpu').textContent = `${cpuVal}%`;
  document.getElementById('viewRam').textContent = `${ramVal}%`;
  document.getElementById('viewDisk').textContent = `${diskVal}%`;
  document.getElementById('modalViewServer').style.display = 'flex';
};
window.handleEditServer = function(id) {
  const server = state.servers.find(s => s.id === id);
  if (!server) return;
  document.getElementById('editServerId').value = server.id;
  document.getElementById('editDisplayId').value = `#${server.id}`;
  document.getElementById('editHostname').value = server.hostname;
  document.getElementById('editIp').value = server.ip_address;
  document.getElementById('editOs').value = server.os_version || '';
  document.getElementById('editStatus').value = server.status;
  document.getElementById('editHostnameError').textContent = '';
  document.getElementById('editIpError').textContent = '';
  document.getElementById('modalEditServer').style.display = 'flex';
};
window.handleDeletePrompt = function(id) {
  const server = state.servers.find(s => s.id === id);
  if (!server) return;
  state.pendingDeleteId = id;
  document.getElementById('deleteServerId').textContent = server.id;
  document.getElementById('deleteServerHostname').textContent = server.hostname;
  document.getElementById('modalDeleteConfirm').style.display = 'flex';
};
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button style="background:none;border:none;cursor:pointer;font-size:16px;color:#94a3b8;margin-left:8px;" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
