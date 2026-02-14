// --- 1. إعدادات الاتصال بـ Supabase ---
const SUPABASE_URL = 'https://ughfltzaroqgqgeipksb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaGZsdHphcm9xZ3FnZWlwa3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzI3MzMsImV4cCI6MjA4NTM0ODczM30.TZvvGWPab7GM1G2ObIsiBoPUNs0KBFdkkUtIug8NJyE';

// تعريف العميل للتعامل مع قاعدة البيانات
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// --- 2. القواميس والبيانات ---
const translations = {
    ar: {
        title: "احجز مستقبلك الصحي اليوم",
        clinicTitle: "موعد طبيب أخصائي",
        homeTitle: "الرعاية المنزلية",
        confirmBtn: "تثبيت الموعد",
        submitBtn: "إرسال الطلب",
        specialty: "-- اختر التخصص --",
        spec_gen: "طب عام", spec_heart: "قلب", spec_kids: "أطفال"
    },
    en: {
        title: "Book Your Health Today",
        clinicTitle: "Specialist Appointment",
        homeTitle: "Home Care",
        confirmBtn: "Confirm",
        submitBtn: "Submit",
        specialty: "-- Select Specialty --",
        spec_gen: "General", spec_heart: "Cardiology", spec_kids: "Pediatrics"
    }
};

const HOSPITALS = ["مستشفى مصطفى باشا", "مستشفى بارني", "مستشفى القبة", "عيادة الشفاء"];
const TIPS = ["اشرب الماء بكثرة", "الرياضة تحمي القلب", "تجنب السكريات"];

let currentLang = 'ar';

// --- 3. وظائف اللغة والتنسيق ---
function toggleLangMenu() {
    const m = document.getElementById('lang-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('[data-i18n="title"]').textContent = translations[lang].title;
    document.getElementById('lang-menu').style.display = 'none';
    updateSpecs();
}

function updateSpecs() {
    const s = document.getElementById('p-spec');
    if(!s) return;
    s.innerHTML = `<option value="">${translations[currentLang].specialty}</option>
                   <option value="general">${translations[currentLang].spec_gen}</option>
                   <option value="heart">${translations[currentLang].spec_heart}</option>`;
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// --- 4. وظائف البحث والاختيار ---
function filterHosp() {
    const v = document.getElementById('h-input').value;
    const res = document.getElementById('h-results');
    res.innerHTML = '';
    if(!v) return;
    HOSPITALS.filter(h => h.includes(v)).forEach(h => {
        const d = document.createElement('div');
        d.className = 'hosp-item';
        d.textContent = h;
        d.onclick = () => selectHosp(h);
        res.appendChild(d);
    });
}

function selectHosp(name) {
    document.getElementById('current-hosp').innerText = name;
    gsap.to("#home-sec", { opacity: 0, duration: 0.3, onComplete: () => {
        document.getElementById('home-sec').style.display = 'none';
        document.getElementById('book-sec').style.display = 'flex';
        gsap.from("#book-sec", { opacity: 0, y: 20 });
    }});
}

// --- 5. التوسيع والإلغاء ---
function expandForm(type) {
    const c = document.getElementById('c-clinic');
    const h = document.getElementById('c-home');
    if(type === 'clinic') {
        h.style.display = 'none';
        c.style.width = '100%';
        c.style.maxWidth = '600px';
        document.getElementById('form-clinic').style.display = 'block';
    } else {
        c.style.display = 'none';
        h.style.width = '100%';
        h.style.maxWidth = '600px';
        document.getElementById('form-home').style.display = 'block';
    }
}

// --- 6. منطق الحجز والاتصال بقاعدة البيانات ---
async function confirmFinal(type) {
    if (!supabaseClient) {
        alert("خطأ: لم يتم تهيئة الاتصال بقاعدة البيانات.");
        return;
    }

    const hospitalName = document.getElementById('current-hosp').innerText;
    const bookingCode = "SHIFA-" + Math.floor(Math.random() * 9000 + 1000);

    try {
        if (type === 'clinic') {
            // إرسال بيانات الموعد إلى جدول appointments
            const { error } = await supabaseClient
                .from('appointments')
                .insert([{
                    hospital_name: hospitalName,
                    specialty: document.getElementById('p-spec').value,
                    appointment_date: document.getElementById('p-date').value || new Date().toISOString(),
                    booking_code: bookingCode,
                    status: 'pending'
                }]);

            if (error) throw error;
        } else {
            // إرسال طلب الرعاية المنزلية إلى جدول homecare_requests
            const { error } = await supabaseClient
                .from('homecare_requests')
                .insert([{
                    patient_name: document.getElementById('h-name').value,
                    phone: document.getElementById('h-tel').value,
                    address: document.getElementById('h-addr').value,
                    medical_condition: document.getElementById('h-case').value,
                    status: 'pending'
                }]);

            if (error) throw error;
        }

        // عرض نافذة النجاح مع رمز QR
        showSuccessModal(bookingCode);
    } catch (err) {
        console.error("خطأ أثناء الحجز:", err);
        alert("فشل الحجز: " + err.message);
    }
}

function showSuccessModal(code) {
    document.getElementById('m-qr').style.display = 'flex';
    document.getElementById('ref-num').textContent = code;
    document.getElementById('qr-target').innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById("qr-target"), { text: code, width: 150, height: 150 });
    }
}

// --- 7. وظائف المساعد الذكي والطوارئ ---
function toggleAI() {
    const w = document.getElementById('ai-win');
    w.style.display = w.style.display === 'flex' ? 'none' : 'flex';
}

function askAI() {
    const inp = document.getElementById('ai-input');
    if(!inp.value) return;
    const log = document.getElementById('chat-logs');
    
    const u = document.createElement('div');
    u.className = 'bubble b-user';
    u.textContent = inp.value;
    log.appendChild(u);
    
    const userQuery = inp.value;
    inp.value = '';
    
    setTimeout(() => {
        const b = document.createElement('div');
        b.className = 'bubble b-bot';
        b.textContent = "أنا معك، كيف يمكنني مساعدتك طبياً؟";
        log.appendChild(b);
        log.scrollTop = log.scrollHeight;
    }, 600);
}

function toggleEM() {
    const m = document.getElementById('m-em');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
    if(m.style.display === 'flex') {
        document.getElementById('tip-display').textContent = TIPS[Math.floor(Math.random()*TIPS.length)];
    }
}

// --- 8. عند تحميل الصفحة ---
window.onload = () => {
    updateSpecs();
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }, 600);
};
