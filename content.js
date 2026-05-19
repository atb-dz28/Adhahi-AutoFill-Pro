// ============================================
// الملء التلقائي لموقع Adhahi - مع تفعيل checkbox القانون
// ============================================

let autoFilled = false;
let retryCount = 0;
const MAX_RETRIES = 5;

function waitForElement(selector, timeout = 5000) {
    return new Promise(resolve => {
        const start = Date.now();
        const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                resolve(el);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                resolve(null);
            }
        }, 200);
    });
}

function setInputValue(input, value) {
    if (!input || !value) return false;
    if (input.value === value) return true;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (setter) {
        setter.call(input, value);
    } else {
        input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log(`✅ تم تعبئة: ${input.placeholder || input.id || input.name} = ${value}`);
    return true;
}

async function fillCombobox(input, value) {
    if (!input || !value) return false;
    if (input.value === value) return true;
    input.focus();
    input.click();
    await new Promise(r => setTimeout(r, 200));
    setInputValue(input, value);
    await new Promise(r => setTimeout(r, 500));
    const selectors = [
        '[role="listbox"] [role="option"]',
        'ul[role="listbox"] li',
        'div[role="option"]',
        '.autocomplete-item'
    ];
    for (const selector of selectors) {
        const option = document.querySelector(selector);
        if (option) {
            option.click();
            console.log(`✅ تم اختيار: ${value}`);
            return true;
        }
    }
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    console.log(`✅ تم تعبئة combobox بـ: ${value}`);
    return true;
}

async function selectPaymentMethod(method) {
    const radios = document.querySelectorAll('[role="radio"]');
    for (let radio of radios) {
        const textElem = radio.querySelector('p:first-of-type');
        if (textElem && textElem.innerText.trim() === method) {
            radio.click();
            radio.dispatchEvent(new Event('click', { bubbles: true }));
            console.log(`✅ تم اختيار طريقة الدفع: ${method}`);
            return true;
        }
    }
    return false;
}

async function fillStandardFields(client) {
    const inputs = document.querySelectorAll('input');
    for (const inp of inputs) {
        const ph = (inp.placeholder || '').toLowerCase();
        const type = inp.type;
        const name = (inp.name || '').toLowerCase();
        if (ph.includes('18') || name.includes('nin') || inp.id === 'nin') {
            if (client.nin) setInputValue(inp, client.nin);
        }
        else if (ph.includes('9') || name.includes('id') || inp.id === 'idCard') {
            if (client.idCard) setInputValue(inp, client.idCard);
        }
        else if (type === 'tel' || ph.includes('05') || name.includes('phone')) {
            if (client.phone) setInputValue(inp, client.phone);
        }
        else if (type === 'email') {
            if (client.email) setInputValue(inp, client.email);
        }
        else if (type === 'password') {
            if (client.pass) setInputValue(inp, client.pass);
        }
    }
}

async function autoFill() {
    if (autoFilled) return;
    if (typeof wilayasCommunes === 'undefined') {
        console.log('⚠️ بيانات الولايات غير محملة بعد، انتظار...');
        setTimeout(autoFill, 500);
        return;
    }
	  
    // تفعيل checkbox الموافقة على القانون 18-07
    const lawCheckbox = document.getElementById('reg-law-1807-checkbox');
    if (lawCheckbox && !lawCheckbox.checked) {
        lawCheckbox.click();
        lawCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ تم تفعيل الموافقة على القانون 18-07');
    } else if (lawCheckbox && lawCheckbox.checked) {
        console.log('ℹ️ الموافقة على القانون 18-07 مفعلة مسبقاً');
    } else {
        console.log('⚠️ لم يتم العثور على checkbox القانون 18-07');
    }
    const client = await new Promise(resolve => chrome.storage.local.get(['lastClient'], resolve)).then(r => r.lastClient);
    if (!client || !client.wilayaId) return;
    const wilayaIdStr = String(client.wilayaId);
    const wilayaInfo = wilayasCommunes[wilayaIdStr];
    if (!wilayaInfo) {
        console.error(`❌ لا توجد بيانات للولاية رقم ${wilayaIdStr}`);
        return;
    }
    const wilayaNameFr = wilayaInfo.nameFr;
    console.log(`🚀 بدء التعبئة: ${client.name} - ${wilayaNameFr}`);
    
    await fillStandardFields(client);
    const wilayaField = await waitForElement('#reg-wilaya', 5000);
    if (wilayaField && wilayaNameFr) await fillCombobox(wilayaField, wilayaNameFr);
    else return;
    
    await new Promise(r => setTimeout(r, 1500));
    const communeField = await waitForElement('#reg-commune', 5000);
    if (communeField && client.commune) {
        await fillCombobox(communeField, client.commune);
        await new Promise(r => setTimeout(r, 1000));
        if (client.paymentMethod) await selectPaymentMethod(client.paymentMethod);
    } else {
        console.log('ℹ️ حقل البلدية لم يظهر (قد تكون الولاية غير متوفرة)');
    }
  
    
    // ملاحظة: الكابتشا لم ولن تُعبأ تلقائياً. المستخدم يجب أن يدخلها يدوياً.
    const captchaField = document.getElementById('reg-captcha-answer');
    if (captchaField) {
        console.log('🔐 حقل الكابتشا موجود. الرجاء إدخال الأحرف الظاهرة في الصورة يدوياً.');
        captchaField.focus();
        captchaField.style.border = '2px solid #f59e0b';
        setTimeout(() => { captchaField.style.border = ''; }, 3000);
    }
    
    autoFilled = true;
    console.log('🎉 اكتملت التعبئة (باستثناء الكابتشا). الرجاء إدخال الكابتشا ثم الإرسال.');
}

const observer = new MutationObserver(() => {
    if (!autoFilled && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`🔄 محاولة إعادة الفحص #${retryCount}`);
        autoFill();
    }
});
observer.observe(document.body, { childList: true, subtree: true });

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(autoFill, 1000));
} else {
    setTimeout(autoFill, 1000);
}
setTimeout(() => { if (!autoFilled) autoFill(); }, 6000);