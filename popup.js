let currentEditId = null;
let displayInterval = null;

// ========== دوال التحقق من صحة البيانات ==========
function validateNin(nin) { return /^\d{18}$/.test(nin); }
function validateIdCard(idCard) { return /^\d{9}$/.test(idCard); }
function validatePhone(phone) { return /^(05|06|07)\d{8}$/.test(phone); }
function validateEmail(email) { if (email === "") return true; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePassword(password) {
    return {
        length: password.length >= 8,
        lower: /[a-z]/.test(password),
        upper: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[@#$%^&+=]/.test(password),
        isValid: password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@#$%^&+=]/.test(password)
    };
}

// ========== عرض الأخطاء ==========
function showInlineError(elementId, message) {
    let errorSpan = document.getElementById(elementId + '-error');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.id = elementId + '-error';
        errorSpan.style.display = 'block';
        errorSpan.style.fontSize = '10px';
        errorSpan.style.color = '#dc2626';
        errorSpan.style.marginTop = '3px';
        const inputElement = document.getElementById(elementId);
        inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
    }
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
}

function hideInlineError(elementId) {
    const errorSpan = document.getElementById(elementId + '-error');
    if (errorSpan) errorSpan.style.display = 'none';
}

// ========== تحديث كلمة المرور ==========
function updatePasswordReqs(password) {
    const checks = validatePassword(password);
    const ids = ['req-length', 'req-lower', 'req-upper', 'req-number', 'req-special'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const key = id.replace('req-', '');
            checks[key] ? el.classList.add('met') : el.classList.remove('met');
        }
    });
    const passInput = document.getElementById('pass');
    if (password === '') {
        passInput.classList.remove('input-error', 'input-valid');
        hideInlineError('pass');
        return false;
    } else if (checks.isValid) {
        passInput.classList.add('input-valid');
        passInput.classList.remove('input-error');
        hideInlineError('pass');
        return true;
    } else {
        passInput.classList.add('input-error');
        passInput.classList.remove('input-valid'); 
        return false;
    }
}

// ========== تحديث حالة الحقل ==========
function updateFieldStatus(inputId, isValidFunc, allowEmpty = false) {
    const input = document.getElementById(inputId);
    const value = input.value;
    if (value === '' && allowEmpty) {
        input.classList.remove('input-error', 'input-valid');
        hideInlineError(inputId);
        return false;
    }
    if (isValidFunc(value)) {
        input.classList.add('input-valid');
        input.classList.remove('input-error');
        hideInlineError(inputId);
        return true;
    } else {
        input.classList.add('input-error');
        input.classList.remove('input-valid');
        if (value !== '' || !allowEmpty) {
            if (inputId === 'nin') showInlineError('nin', 'NIN يجب أن يكون 18 رقمًا بالضبط');
            if (inputId === 'idCard') showInlineError('idCard', 'رقم بطاقة التعريف يجب أن يكون 9 أرقام بالضبط');
            if (inputId === 'phone') showInlineError('phone', 'رقم الهاتف يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام');
            if (inputId === 'email') showInlineError('email', 'صيغة البريد الإلكتروني غير صحيحة');
            if (inputId === 'clientName') showInlineError('clientName', 'الرجاء إدخال اسم الزبون');
            if (inputId === 'communeSelect') showInlineError('communeSelect', 'الرجاء اختيار البلدية');
            if (inputId === 'paymentMethod') showInlineError('paymentMethod', 'الرجاء اختيار طريقة الدفع');
            if (inputId === 'wilayaSelect') showInlineError('wilayaSelect', 'الرجاء اختيار ولاية');
        }
        return false;
    }
}

function updateCommuneStatus() {
    const communeSelect = document.getElementById('communeSelect');
    const value = communeSelect.value;
    if (!value || value === '') {
        communeSelect.classList.add('input-error');
        communeSelect.classList.remove('input-valid');
        showInlineError('communeSelect', 'الرجاء اختيار البلدية');
        return false;
    } else {
        communeSelect.classList.add('input-valid');
        communeSelect.classList.remove('input-error');
        hideInlineError('communeSelect');
        return true;
    }
}

function updatePaymentMethodStatus() {
    const paymentSelect = document.getElementById('paymentMethod');
    const value = paymentSelect.value;
    if (!value || value === '') {
        paymentSelect.classList.add('input-error');
        paymentSelect.classList.remove('input-valid');
        showInlineError('paymentMethod', 'الرجاء اختيار طريقة الدفع');
        return false;
    } else {
        paymentSelect.classList.add('input-valid');
        paymentSelect.classList.remove('input-error');
        hideInlineError('paymentMethod');
        return true;
    }
}

function updateWilayaStatus() {
    const wilayaSelect = document.getElementById('wilayaSelect');
    const value = wilayaSelect.value;
    if (!value || value === '') {
        wilayaSelect.classList.add('input-error');
        wilayaSelect.classList.remove('input-valid');
        showInlineError('wilayaSelect', 'الرجاء اختيار ولاية');
        return false;
    } else {
        wilayaSelect.classList.add('input-valid');
        wilayaSelect.classList.remove('input-error');
        hideInlineError('wilayaSelect');
        return true;
    }
}

function clearAllErrors() {
    const ids = ['clientName', 'nin', 'idCard', 'phone', 'email', 'wilayaSelect', 'communeSelect', 'paymentMethod', 'pass'];
    ids.forEach(id => hideInlineError(id));
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('input-error', 'input-valid');
    });
}

// ========== وظائف الولايات والعملاء ==========
function populateWilayas() {
    const select = document.getElementById('wilayaSelect');
    select.innerHTML = '<option value="">-- اختر ولاية --</option>';
    const sortedKeys = Object.keys(wilayasCommunes).sort((a, b) => Number(a) - Number(b));
    for (const id of sortedKeys) {
        const info = wilayasCommunes[id];
        const option = document.createElement('option');
        option.value = id;
        const numberFormatted = id.padStart(2, '0');
        option.textContent = `${numberFormatted} - ${info.nameAr}`;
        select.appendChild(option);
    }
}

function populateCommunes(wilayaId) {
    const communeSelect = document.getElementById('communeSelect');
    if (!wilayaId || !wilayasCommunes[wilayaId]) {
        communeSelect.disabled = true;
        communeSelect.innerHTML = '<option value="">-- اختر البلدية --</option>';
        communeSelect.classList.remove('input-valid', 'input-error');
        return;
    }
    const communes = wilayasCommunes[wilayaId].communes;
    communeSelect.disabled = false;
    communeSelect.innerHTML = '<option value="">-- اختر البلدية --</option>';
    communes.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        communeSelect.appendChild(option);
    });
    communeSelect.classList.remove('input-valid', 'input-error');
    hideInlineError('communeSelect');
}

function loadClientToForm(client) {
    document.getElementById('clientName').value = client.name || '';
    document.getElementById('nin').value = client.nin || '';
    document.getElementById('idCard').value = client.idCard || '';
    document.getElementById('phone').value = client.phone || '';
    document.getElementById('email').value = client.email || '';
    document.getElementById('pass').value = client.pass || '';
    document.getElementById('wilayaSelect').value = client.wilayaId || '';
    populateCommunes(client.wilayaId);
    document.getElementById('communeSelect').value = client.commune || '';
    document.getElementById('paymentMethod').value = client.paymentMethod || '';
    currentEditId = client.id;
    
    updateFieldStatus('clientName', (v) => v.trim() !== '', false);
    updateFieldStatus('nin', validateNin, false);
    updateFieldStatus('idCard', validateIdCard, false);
    updateFieldStatus('phone', validatePhone, false);
    updateFieldStatus('email', validateEmail, true);
    updatePasswordReqs(client.pass || '');
    if (client.wilayaId) updateWilayaStatus();
    if (client.commune) updateCommuneStatus();
    if (client.paymentMethod) updatePaymentMethodStatus();
    
    chrome.storage.local.set({ lastClient: client });
    
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('updateBtn').style.display = 'block';
    document.getElementById('cancelBtn').style.display = 'block';
    
    switchToInput();
    showStatus(`📌 تم تحميل بيانات "${client.name}"`, '#e0f2e9', '#065f46');
    clearAllErrors();
}

function saveClient(clientData) {
    chrome.storage.local.get(['clients'], (res) => {
        let clients = res.clients || [];
        if (currentEditId) {
            const index = clients.findIndex(c => c.id === currentEditId);
            if (index !== -1) {
                clientData.id = currentEditId;
                clients[index] = clientData;
            }
            showStatus(`✏️ تم تحديث "${clientData.name}"`, '#d1fae5', '#065f46');
        } else {
            clientData.id = Date.now().toString();
            clients.push(clientData);
            showStatus(`✅ تم حفظ "${clientData.name}"`, '#d1fae5', '#065f46');
        }
        chrome.storage.local.set({ clients, lastClient: clientData }, () => {
            clearForm();
            renderClientsList();
        });
    });
}

function clearForm() {
    document.getElementById('clientName').value = '';
    document.getElementById('nin').value = '';
    document.getElementById('idCard').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('pass').value = '';
    document.getElementById('wilayaSelect').value = '';
    document.getElementById('communeSelect').innerHTML = '<option value="">-- اختر البلدية --</option>';
    document.getElementById('communeSelect').disabled = true;
    document.getElementById('paymentMethod').value = '';
    currentEditId = null;
    document.getElementById('saveBtn').style.display = 'block';
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
    clearAllErrors();
    updatePasswordReqs('');
}

function showStatus(msg, bg, color) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = bg;
    el.style.color = color;
    setTimeout(() => el.style.display = 'none', 2500);
}

function renderClientsList(searchTerm = '') {
    chrome.storage.local.get(['clients'], (res) => {
        let clients = res.clients || [];
        if (searchTerm) {
            clients = clients.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.phone && c.phone.includes(searchTerm)) ||
                (c.nin && c.nin.includes(searchTerm))
            );
        }
        const container = document.getElementById('clientsList');
        const countSpan = document.getElementById('clientsCount');
        countSpan.textContent = clients.length;
        if (!clients.length) {
            container.innerHTML = '<div class="empty-state">📭 لا يوجد عملاء. أضف زبوناً جديداً</div>';
            return;
        }
        container.innerHTML = clients.map(c => `
            <div class="client-card" data-id="${c.id}">
                <div>
                    <div class="client-name">👤 ${escapeHtml(c.name)}</div>
                    <div class="client-details">🆔 ${c.nin || '—'} | 📱 ${c.phone || '—'} | 📍 ${wilayasCommunes[c.wilayaId]?.nameAr || '—'}</div>
                </div>
                <button class="delete-client" data-id="${c.id}" data-name="${escapeHtml(c.name)}">✖️</button>
            </div>
        `).join('');
        attachClientCardEvents(clients);
    });
}

function attachClientCardEvents(clients) {
    document.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-client')) return;
            const id = card.dataset.id;
            const client = clients.find(c => c.id === id);
            if (client) loadClientToForm(client);
        });
    });
    document.querySelectorAll('.delete-client').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            deleteClient(id, name);
        });
    });
}

function deleteClient(id, name) {
    if (confirm(`هل تريد حذف "${name}"؟`)) {
        chrome.storage.local.get(['clients'], (res) => {
            let clients = res.clients || [];
            const newClients = clients.filter(c => c.id !== id);
            chrome.storage.local.set({ clients: newClients }, () => {
                showStatus(`✖️ تم حذف "${name}"`, '#fee2e2', '#b91c1c');
                renderClientsList();
            });
        });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function switchToInput() {
    document.getElementById('inputScreen').classList.add('active');
    document.getElementById('clientsScreen').classList.remove('active');
    document.getElementById('tabInputBtn').classList.add('active');
    document.getElementById('tabClientsBtn').classList.remove('active');
}

function switchToClients() {
    document.getElementById('clientsScreen').classList.add('active');
    document.getElementById('inputScreen').classList.remove('active');
    document.getElementById('tabClientsBtn').classList.add('active');
    document.getElementById('tabInputBtn').classList.remove('active');
    renderClientsList();
}

function validateAllFields() {
    let isValid = true;
    const fields = [
        { id: 'clientName', func: (v) => v.trim() !== '', errorMsg: 'الرجاء إدخال اسم الزبون' },
        { id: 'nin', func: validateNin, errorMsg: 'NIN يجب أن يكون 18 رقمًا بالضبط' },
        { id: 'idCard', func: validateIdCard, errorMsg: 'رقم بطاقة التعريف يجب أن يكون 9 أرقام بالضبط' },
        { id: 'phone', func: validatePhone, errorMsg: 'رقم الهاتف يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام' },
        { id: 'email', func: validateEmail, errorMsg: 'صيغة البريد الإلكتروني غير صحيحة' },
        { id: 'wilayaSelect', func: (v) => v !== '', errorMsg: 'الرجاء اختيار ولاية' },
        { id: 'communeSelect', func: (v) => v !== '', errorMsg: 'الرجاء اختيار بلدية' },
        { id: 'paymentMethod', func: (v) => v !== '', errorMsg: 'الرجاء اختيار طريقة الدفع' }
    ];
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        const value = input.value;
        if (!field.func(value)) {
            input.classList.add('input-error');
            input.classList.remove('input-valid');
            showInlineError(field.id, field.errorMsg);
            isValid = false;
        } else {
            input.classList.add('input-valid');
            input.classList.remove('input-error');
            hideInlineError(field.id);
        }
    });
    const passValue = document.getElementById('pass').value;
    if (!updatePasswordReqs(passValue)) isValid = false;
    return isValid;
}

// ========== تحديث واجهة حالة الحجز فقط (بدون إشعارات) ==========
async function updateDisplayOnly() {
    try {
        const response = await fetch("https://adhahi.dz/api/v1/public/wilaya-quotas?_=" + Date.now());
        if (!response.ok) throw new Error();
        const data = await response.json();
        const container = document.getElementById('availabilityStatus');
        if (!container) return;
        const availableCount = data.filter(w => w.available === true).length;
        const totalCount = data.length;
        if (availableCount === 0) {
            container.className = 'availability-status unavailable';
            container.querySelector('.status-icon').textContent = '🔴';
            container.querySelector('.status-text').innerHTML = `لا توجد ولايات متاحة للحجز <small>جميع الولايات ${totalCount} غير متوفرة حالياً</small>`;
        } else if (availableCount === totalCount) {
            container.className = 'availability-status available';
            container.querySelector('.status-icon').textContent = '🟢';
            container.querySelector('.status-text').innerHTML = `جميع الولايات متاحة للحجز <small>${availableCount} ولاية متوفرة</small>`;
        } else {
            container.className = 'availability-status available';
            container.querySelector('.status-icon').textContent = '🟡';
            container.querySelector('.status-text').innerHTML = `${availableCount} ولاية متاحة للحجز <small>من أصل ${totalCount} ولاية</small>`;
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const badge = container.querySelector('.status-badge');
        if (badge) badge.textContent = `آخر تحديث ${timeStr}`;
    } catch (error) {
        console.error("خطأ في تحديث الواجهة:", error);
    }
}

function startDisplayUpdate() {
    updateDisplayOnly();
    if (displayInterval) clearInterval(displayInterval);
    displayInterval = setInterval(updateDisplayOnly, 1000);
}

function stopDisplayUpdate() {
    if (displayInterval) {
        clearInterval(displayInterval);
        displayInterval = null;
    }
}

// ========== تهيئة الصفحة ==========
document.addEventListener('DOMContentLoaded', () => {
    populateWilayas();
    
    const togglePassword = document.getElementById('togglePassword');
    const passInput = document.getElementById('pass');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '🙈' : '🙊';
        });
    }
    
    document.getElementById('clientName').addEventListener('input', () => updateFieldStatus('clientName', (v) => v.trim() !== '', false));
    document.getElementById('nin').addEventListener('input', () => updateFieldStatus('nin', validateNin, false));
    document.getElementById('idCard').addEventListener('input', () => updateFieldStatus('idCard', validateIdCard, false));
    document.getElementById('phone').addEventListener('input', () => updateFieldStatus('phone', validatePhone, false));
    document.getElementById('email').addEventListener('input', () => updateFieldStatus('email', validateEmail, true));
    document.getElementById('pass').addEventListener('input', (e) => updatePasswordReqs(e.target.value));
    document.getElementById('wilayaSelect').addEventListener('change', (e) => {
        const wilayaId = e.target.value;
        if (wilayaId) updateWilayaStatus();
        else document.getElementById('wilayaSelect').classList.remove('input-valid');
        populateCommunes(wilayaId);
    });
    document.getElementById('communeSelect').addEventListener('change', () => { if (document.getElementById('communeSelect').value) updateCommuneStatus(); });
    document.getElementById('paymentMethod').addEventListener('change', () => { if (document.getElementById('paymentMethod').value) updatePaymentMethodStatus(); });
    
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (!validateAllFields()) {
            showStatus('⚠️ الرجاء تعبئة جميع الحقول المطلوبة بشكل صحيح', '#fee2e2', '#b91c1c');
            return;
        }
        saveClient({
            id: null,
            name: document.getElementById('clientName').value.trim(),
            nin: document.getElementById('nin').value,
            idCard: document.getElementById('idCard').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            pass: document.getElementById('pass').value,
            wilayaId: document.getElementById('wilayaSelect').value,
            commune: document.getElementById('communeSelect').value,
            paymentMethod: document.getElementById('paymentMethod').value
        });
    });
    
    document.getElementById('updateBtn').addEventListener('click', () => {
        if (!currentEditId) return;
        if (!validateAllFields()) {
            showStatus('⚠️ الرجاء تعبئة جميع الحقول المطلوبة بشكل صحيح', '#fee2e2', '#b91c1c');
            return;
        }
        saveClient({
            id: currentEditId,
            name: document.getElementById('clientName').value.trim(),
            nin: document.getElementById('nin').value,
            idCard: document.getElementById('idCard').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            pass: document.getElementById('pass').value,
            wilayaId: document.getElementById('wilayaSelect').value,
            commune: document.getElementById('communeSelect').value,
            paymentMethod: document.getElementById('paymentMethod').value
        });
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => clearForm());
    document.getElementById('tabInputBtn').addEventListener('click', switchToInput);
    document.getElementById('tabClientsBtn').addEventListener('click', switchToClients);
    document.getElementById('searchInput').addEventListener('input', (e) => renderClientsList(e.target.value));
    
    startDisplayUpdate();
    switchToInput();
});

window.addEventListener('beforeunload', () => stopDisplayUpdate());