// ========== Service Worker للإحصائيات الدقيقة ==========

let previousAvailabilityData = null;

async function fetchAvailabilityData() {
    try {
        const response = await fetch(`https://adhahi.dz/api/v1/public/wilaya-quotas?nocache=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * @param {Array} newWilayas - الولايات التي ظهرت في هذا الفحص فقط
 * @param {number} totalCount - إجمالي كل الولايات المتاحة (قديمة + جديدة)
 */
function sendGroupedNotification(newWilayas, totalCount) {
    const notificationId = `group_${Date.now()}`;
    
    // تنسيق قائمة الولايات الجديدة
    const list = newWilayas.map(w => `🔹 ${w.wilayaNameAr}`).join('\n');
    
    const title = newWilayas.length === 1 
        ? `🔔 ولاية جديدة متاحة` 
        : `🔔 ${newWilayas.length} ولايات جديدة`;

    chrome.notifications.create(notificationId, {
        type: "basic",
        iconUrl: "favicon.png",
        title: title,
        // هنا ندمج القائمة الجديدة مع إحصائية الإجمالي الكلي
        message: `تم رصد فتح:\n${list}\n\n━━━━━━━━━━━━━━━\n📊 الإجمالي المتوفر الآن: ${totalCount} ولاية`,
        priority: 1,
        requireInteraction: false,
        buttons: [{ title: "🚀 اذهب للحجز الآن" }],
        silent: false
    });

    // حذف الإشعار تلقائياً بعد 10 ثوانٍ
    setTimeout(() => {
        chrome.notifications.clear(notificationId);
    }, 10000);
}

async function checkAvailability() {
    const newData = await fetchAvailabilityData();
    if (!newData || !Array.isArray(newData)) return;
    
    // 1. حساب كل الولايات المتاحة حالياً (للإحصائية)
    const allAvailableNow = newData.filter(w => w.available === true);
    const totalCount = allAvailableNow.length;
    
    if (previousAvailabilityData) {
        const previousAvailableCodes = previousAvailabilityData
            .filter(w => w.available === true)
            .map(w => w.wilayaCode);
        
        // 2. تحديد الولايات "الجديدة فقط" لإرسال الإشعار
        const newWilayas = allAvailableNow.filter(w => !previousAvailableCodes.includes(w.wilayaCode));
        
        // إرسال الإشعار فقط إذا كان هناك "جديد"
        if (newWilayas.length > 0) {
            sendGroupedNotification(newWilayas, totalCount);
        }
    } else {
        // في أول تشغيل للإضافة، نعتبر كل المتاح "جديد" أو نخزنه فقط (حسب رغبتك)
        // هنا سنكتفي بتخزينه لبدء المقارنة من الدورة القادمة
        console.log(`[Background] تم بدء المراقبة. المتوفر حالياً: ${totalCount}`);
    }
    
    previousAvailabilityData = JSON.parse(JSON.stringify(newData));
}

// --- باقي الأكواد الأساسية (Alarms & Listeners) ---

function startMonitoring() {
    chrome.alarms.clear("checkAvailability", () => {
        chrome.alarms.create("checkAvailability", { periodInMinutes: 0.05 });
    });
    checkAvailability();
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkAvailability") checkAvailability();
});

chrome.notifications.onButtonClicked.addListener((id) => {
    chrome.tabs.create({ url: "https://adhahi.dz/register" });
    chrome.notifications.clear(id);
});

chrome.notifications.onClicked.addListener((id) => {
    chrome.tabs.create({ url: "https://adhahi.dz/register" });
    chrome.notifications.clear(id);
});

chrome.runtime.onInstalled.addListener(() => startMonitoring());
chrome.runtime.onStartup.addListener(() => startMonitoring());