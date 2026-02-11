// --- القواميس والبيانات ---
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

// --- وظائف اللغة والتنسيق ---
function toggleLangMenu() {
    const m = document.getElementById('lang-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // تحديث النصوص (بشكل مبسط للعرض)
    document.querySelector('[data-i18n="title"]').textContent = translations[lang].title;
    document.getElementById('lang-menu').style.display = 'none';
    updateSpecs();
}

function updateSpecs() {
    const s = document.getElementById('p-spec');
    if(!s) return;
    s.innerHTML = `<option value="">${translations[currentLang].specialty}</option>
                   <option value="1">${translations[currentLang].spec_gen}</option>
                   <option value="2">${translations[currentLang].spec_heart}</option>`;
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// --- وظائف البحث والاختيار ---
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

// --- التوسيع والإلغاء ---
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

function resetView() {
    // إخفاء النماذج
    document.getElementById('form-clinic').style.display = 'none';
    document.getElementById('form-home').style.display = 'none';
    
    // إعادة عرض البطاقات بشكلها الأصلي
    const cards = [document.getElementById('c-clinic'), document.getElementById('c-home')];
    cards.forEach(card => {
        card.style.display = 'block';
        card.style.width = '350px';
    });
}

// --- الحجز والطوارئ ---
function confirmFinal(type) {
    const code = "SHIFA-" + Math.floor(Math.random()*9000 + 1000);
    document.getElementById('m-qr').style.display = 'flex';
    document.getElementById('ref-num').textContent = code;
    document.getElementById('qr-target').innerHTML = '';
    new QRCode(document.getElementById("qr-target"), { text: code, width: 150, height: 150 });
}

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

// --- عند التحميل ---
window.onload = () => {
    updateSpecs();
    setTimeout(() => document.getElementById('loader').style.display = 'none', 600);
};