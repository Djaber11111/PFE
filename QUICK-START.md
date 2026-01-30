# 🚀 دليل النشر السريع - خطوة بخطوة

## ⚡ الخطوات المختصرة (15 دقيقة)

### 1️⃣ إعداد Supabase (5 دقائق)

1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط "New Project"
3. املأ:
   - اسم المشروع: `shifaa-platform`
   - كلمة مرور قوية
   - المنطقة: Europe West
4. انتظر دقيقة حتى ينتهي الإعداد

### 2️⃣ إنشاء قاعدة البيانات (3 دقائق)

1. من القائمة الجانبية → "SQL Editor"
2. اضغط "New query"
3. انسخ والصق هذا الكود:

```sql
-- جدول المرضى
create table patients (
  id bigint generated always as identity primary key,
  full_name text not null,
  phone text not null,
  birth_date date,
  national_id text,
  created_at timestamp default now()
);

-- جدول الأطباء
create table doctors (
  id bigint generated always as identity primary key,
  full_name text not null,
  specialty text not null,
  hospital text,
  created_at timestamp default now()
);

-- جدول المواعيد
create table appointments (
  id bigint generated always as identity primary key,
  patient_id bigint references patients(id),
  doctor_id bigint references doctors(id),
  hospital_name text not null,
  service_type text not null,
  appointment_date timestamp not null,
  specialty text not null,
  note text,
  booking_code text unique not null,
  status text default 'pending',
  created_at timestamp default now()
);

-- جدول الرعاية المنزلية
create table homecare_requests (
  id bigint generated always as identity primary key,
  patient_name text not null,
  phone text not null,
  address text not null,
  medical_condition text,
  request_date timestamp not null,
  status text default 'pending',
  created_at timestamp default now()
);

-- إدخال أطباء تجريبيين
INSERT INTO doctors (full_name, specialty, hospital) VALUES
  ('د. أحمد العلوي', 'طب عام', 'مستشفى مصطفى باشا'),
  ('د. سارة بن علي', 'أمراض القلب', 'مستشفى نفيسة حمود'),
  ('د. محمد الزهراني', 'الأطفال', 'مستشفى القبة المركزي'),
  ('د. ليلى المنصوري', 'العظام', 'عيادة الشفاء'),
  ('د. كمال السعيدي', 'الأسنان', 'مستشفى عين النعجة'),
  ('د. نور الدين حسن', 'العيون', 'مستشفى لمين دباغين');
```

4. اضغط "Run" (أو F5)

### 3️⃣ تفعيل Row Level Security (2 دقيقة)

انسخ والصق هذا الكود في SQL Editor:

```sql
-- تفعيل RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homecare_requests ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة للجميع
CREATE POLICY "Enable read access for all users" ON patients FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON doctors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON homecare_requests FOR SELECT USING (true);

-- سياسات الإدراج للجميع
CREATE POLICY "Enable insert for all users" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON homecare_requests FOR INSERT WITH CHECK (true);
```

### 4️⃣ الحصول على المفاتيح (1 دقيقة)

1. من القائمة الجانبية → "Project Settings" (⚙️)
2. → "API"
3. **احفظ هذه القيم**:
   - `URL`: سيكون شيء مثل `https://xxxxx.supabase.co`
   - `anon public`: مفتاح طويل يبدأ بـ `eyJ...`

### 5️⃣ تحديث الموقع (1 دقيقة)

1. افتح ملف `index.html`
2. ابحث عن السطر:
```javascript
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
```
3. استبدل `'YOUR_SUPABASE_ANON_KEY_HERE'` بالمفتاح الذي نسخته

### 6️⃣ النشر على Netlify (3 دقائق)

**الطريقة السريعة (Drag & Drop):**

1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل دخول (أو أنشئ حساب)
3. اسحب مجلد المشروع كاملاً إلى الصفحة
4. انتظر دقيقة واحدة
5. ✅ تم! موقعك جاهز

**الطريقة الاحترافية (عبر GitHub):**

1. ارفع المشروع على GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. في Netlify:
   - "Add new site" → "Import an existing project"
   - اختر GitHub
   - اختر المستودع
   - اضغط "Deploy"

---

## ✅ اختبار الموقع

1. افتح رابط موقعك من Netlify
2. اختر مستشفى
3. املأ نموذج الحجز
4. اضغط "تأكيد الحجز"
5. يجب أن يظهر رمز QR ورمز الحجز

6. اختبر التتبع:
   - أدخل رقم الهاتف
   - يجب أن تظهر قائمة الحجوزات

7. تحقق من قاعدة البيانات:
   - ارجع إلى Supabase
   - Table Editor → appointments
   - يجب أن ترى الحجز الجديد

---

## 🎉 تهانينا!

موقعك الآن جاهز وفعّال!

### الروابط المهمة:
- 🌐 موقعك: `https://your-site-name.netlify.app`
- 🗄️ قاعدة البيانات: [app.supabase.com](https://app.supabase.com)
- 🚀 لوحة Netlify: [app.netlify.com](https://app.netlify.com)

### خطوات إضافية (اختيارية):
1. ✨ أضف نطاق مخصص في Netlify
2. 📊 فعّل Google Analytics
3. 🔔 أضف إشعارات البريد الإلكتروني
4. 📱 شارك الموقع مع الأصدقاء

---

## ❓ حل المشاكل

### المشكلة: "لا يتم حفظ البيانات"
**الحل:**
- تأكد من تفعيل RLS والسياسات
- افتح Console في المتصفح (F12)
- ابحث عن رسائل الخطأ

### المشكلة: "CORS Error"
**الحل:**
1. في Supabase → Authentication → URL Configuration
2. أضف رابط موقعك في "Site URL"

### المشكلة: "البحث لا يعمل"
**الحل:**
- تأكد من إدخال رقم الهاتف بنفس الصيغة المستخدمة في الحجز
- تحقق من وجود بيانات في جدول patients

---

## 💡 نصيحة أخيرة

- احفظ مفاتيح Supabase في مكان آمن
- لا تشارك مفتاح `service_role` أبداً
- راجع الدليل الكامل في `netlify-supabase-guide.md` للتفاصيل

---

**هل واجهت مشكلة؟** افتح issue على GitHub أو راسلنا! 📧

🎊 بالتوفيق!
