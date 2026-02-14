// القيم الصحيحة كما في صورتك
const SB_URL = "https://ughfltzaroqgqeipksb.supabase.co"; 
const SB_KEY = "sb_publishable_jjuVXyR7sfZhrwV7KippqA_IwM62X9659A1H5pAnG9n6LCHVjPjYn85mG8z2NfD697b0a70f3f2e"; 

let supabaseClient;

// تعريف العميل مباشرة عند تحميل الصفحة
function initSupabase() {
    try {
        // استخدام المنادي المباشر للمكتبة
        supabaseClient = supabase.createClient(SB_URL, SB_KEY);
        console.log("Supabase Connected!");
    } catch (e) {
        console.error("Connection Error:", e);
    }
}

// --- القواميس والبيانات ---
const translations = {
    ar: {
        title: "احجز مستقبلك الصحي اليوم",
        subtitle: "البوابة الوطنية الرقمية لربط المرضى بالمؤسسات الاستشفائية",
        selectHospital: "اختر المستشفى أو المركز الطبي:",
        searchPlaceholder: "ابحث باسم المستشفى أو الولاية...",
        or: "أو استعلم عن موعدك",
        trackPhone: "رقم الهاتف المسجل للحجز...",
        trackBtn: "استرجاع بيانات الحجز",
        clinicTitle: "موعد طبيب أخصائي",
        clinicDesc: "للمراجعات الدورية والفحوصات التخصصية",
        homeTitle: "الرعاية المنزلية",
        homeDesc: "طلب طاقم طبي لزيارة المريض في منزله",
        confirmBtn: "تثبيت الموعد",
        submitBtn: "إرسال الطلب",
        specialty: "-- اختر التخصص --",
        spec_gen: "طب عام", 
        spec_heart: "قلب", 
        spec_kids: "أطفال",
        firstName: "الاسم",
        lastName: "اللقب",
        nin: "رقم التعريف الوطني (NIN):",
        phone: "رقم هاتف المريض:",
        patientName: "الاسم الكامل للمريض",
        guardianPhone: "رقم هاتف ولي الأمر",
        caseDesc: "وصف موجز للحالة الصحية الحالية...",
        address: "العنوان السكني التفصيلي"
    },
    en: {
        title: "Book Your Health Today",
        subtitle: "The national digital portal connecting patients to hospitals",
        selectHospital: "Select Hospital or Medical Center:",
        searchPlaceholder: "Search by hospital name or state...",
        or: "Or check your appointment",
        trackPhone: "Registered phone number...",
        trackBtn: "Track Booking",
        clinicTitle: "Specialist Appointment",
        clinicDesc: "For routine checkups and specialty exams",
        homeTitle: "Home Care",
        homeDesc: "Request medical staff for a home visit",
        confirmBtn: "Confirm Appointment",
        submitBtn: "Submit Request",
        specialty: "-- Select Specialty --",
        spec_gen: "General Medicine", 
        spec_heart: "Cardiology", 
        spec_kids: "Pediatrics",
        firstName: "First Name",
        lastName: "Last Name",
        nin: "National ID (NIN):",
        phone: "Patient Phone:",
        patientName: "Full Patient Name",
        guardianPhone: "Guardian Phone",
        caseDesc: "Brief case description...",
        address: "Detailed Home Address"
    }
};

const HOSPITALS = ["مستشفى مصطفى باشا", "مستشفى بارني", "مستشفى القبة", "عيادة الشفاء"];
const TIPS = ["اشرب الماء بكثرة", "الرياضة تحمي القلب", "تجنب السكريات المضافة"];

let currentLang = 'ar';

function toggleLangMenu() {
    const m = document.getElementById('lang-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.getElementById('lang-menu').style.display = 'none';
    updateSpecs();
}

function updateSpecs() {
    const s = document.getElementById('p-spec');
    if(!s) return;
    s.innerHTML = `
        <option value="">${translations[currentLang].specialty}</option>
        <option value="1">${translations[currentLang].spec_gen}</option>
        <option value="2">${translations[currentLang].spec_heart}</option>
        <option value="3">${translations[currentLang].spec_kids}</option>
    `;
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function filterHosp() {
    const v = document.getElementById('h-input').value.toLowerCase();
    const res = document.getElementById('h-results');
    res.innerHTML = '';
    if(!v) return;
    const filtered = HOSPITALS.filter(h => h.includes(v));
    filtered.forEach(h => {
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
        gsap.fromTo("#book-sec", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    }});
}

function expandForm(type) {
    const c = document.getElementById('c-clinic');
    const h = document.getElementById('c-home');
    if(type === 'clinic') {
        h.style.display = 'none';
        c.style.width = '100%';
        c.style.maxWidth = '600px';
        c.style.cursor = 'default';
        document.getElementById('form-clinic').style.display = 'block';
    } else {
        c.style.display = 'none';
        h.style.width = '100%';
        h.style.maxWidth = '600px';
        h.style.cursor = 'default';
        document.getElementById('form-home').style.display = 'block';
    }
}

function resetView() {
    document.getElementById('form-clinic').style.display = 'none';
    document.getElementById('form-home').style.display = 'none';
    const cards = [document.getElementById('c-clinic'), document.getElementById('c-home')];
    cards.forEach(card => {
        card.style.display = 'block';
        card.style.width = '350px';
        card.style.cursor = 'pointer';
    });
}

// --- الحجز والطوارئ مع التحقق من الاتصال ---
async function confirmFinal(type) {
    const code = "SHIFA-" + Math.floor(Math.random()*9000 + 1000);
    let dataToSave = {};

    if(type === 'clinic') {
        dataToSave = {
            first_name: document.getElementById('p-fn').value,
            last_name: document.getElementById('p-ln').value,
            nin: document.getElementById('p-nin').value,
            phone: document.getElementById('p-tel').value,
            specialty: document.getElementById('p-spec').options[document.getElementById('p-spec').selectedIndex]?.text || "",
            appointment_date: document.getElementById('p-date').value,
            hospital_name: document.getElementById('current-hosp').innerText,
            type: 'clinic',
            ref_code: code
        };
    } else {
        dataToSave = {
            full_name: document.getElementById('h-name').value,
            phone: document.getElementById('h-tel').value,
            case_desc: document.getElementById('h-case').value,
            address: document.getElementById('h-addr').value,
            hospital_name: document.getElementById('current-hosp').innerText,
            type: 'home',
            ref_code: code
        };
    }

    // التنفيذ الفعلي للإرسال
    if (supabaseClient) {
        const { error } = await supabaseClient.from('appointments').insert([dataToSave]);
        if (error) {
            console.error("Supabase Insert Error:", error);
            alert("فشل الحفظ في القاعدة: " + error.message);
        }
    } else {
        console.warn("Supabase not connected. QR will show but data not saved.");
    }

    // إظهار النتائج (دائماً تظهر لضمان تجربة مستخدم مستقرة)
    document.getElementById('m-qr').style.display = 'flex';
    document.getElementById('ref-num').textContent = code;
    const qrContainer = document.getElementById('qr-target');
    qrContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, { text: code, width: 150, height: 150, colorDark : "#00897b", colorLight : "#ffffff" });
    }
}

async function trackBooking() {
    const phone = document.getElementById('track-id').value;
    if(!phone) {
        alert(currentLang === 'ar' ? "يرجى إدخال رقم الهاتف أولاً" : "Please enter phone number first");
        return;
    }

    if(supabaseClient) {
        const { data, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('phone', phone)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            alert(currentLang === 'ar' ? "لم يتم العثور على حجوزات" : "No bookings found");
        } else {
            const last = data[0];
            alert(`${currentLang === 'ar' ? 'آخر حجز لك في' : 'Last booking at'}: ${last.hospital_name}\nCode: ${last.ref_code}`);
        }
    }
}

// --- مساعد الذكاء الاصطناعي ---
function toggleAI() {
    const w = document.getElementById('ai-win');
    w.style.display = (w.style.display === 'flex') ? 'none' : 'flex';
}

function askAI() {
    const inp = document.getElementById('ai-input');
    const log = document.getElementById('chat-logs');
    if(!inp.value.trim()) return;
    const u = document.createElement('div');
    u.className = 'bubble b-user';
    u.textContent = inp.value;
    log.appendChild(u);
    const userMsg = inp.value;
    inp.value = '';
    setTimeout(() => {
        const b = document.createElement('div');
        b.className = 'bubble b-bot';
        b.textContent = currentLang === 'ar' ? `أنا مساعد شفاء، بخصوص سؤالك عن (${userMsg})، أنصحك باستشارة الطبيب.` : `I advise consulting a doctor regarding (${userMsg}).`;
        log.appendChild(b);
        log.scrollTop = log.scrollHeight;
    }, 800);
}

function toggleEM() {
    const m = document.getElementById('m-em');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
    if(m.style.display === 'flex') {
        document.getElementById('tip-display').textContent = TIPS[Math.floor(Math.random()*TIPS.length)];
    }
}

// --- التشغيل عند التحميل ---
window.addEventListener('load', () => {
    initSupabase();
    updateSpecs();
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'none';
    }, 600);
});
