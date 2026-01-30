# دليل نشر موقع شفاء على Netlify مع قاعدة بيانات Supabase

## 📋 المحتويات
1. إعداد قاعدة البيانات في Supabase
2. إنشاء ملفات المشروع المحدّثة
3. نشر الموقع على Netlify
4. ربط الموقع بقاعدة البيانات
5. اختبار الموقع

---

## 1️⃣ إعداد قاعدة البيانات في Supabase

### الخطوة 1: إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. اضغط على "New Project"
4. املأ البيانات:
   - **Project Name**: shifaa-platform
   - **Database Password**: اختر كلمة مرور قوية واحفظها
   - **Region**: اختر أقرب منطقة جغرافية
5. انتظر حتى يتم إنشاء المشروع (حوالي دقيقة)

### الخطوة 2: إنشاء الجداول
1. من القائمة الجانبية، اختر "Table Editor"
2. اضغط على "New Table"
3. أنشئ الجداول التالية:

**جدول المرضى (patients)**:
```sql
create table patients (
  id bigint generated always as identity primary key,
  full_name text not null,
  phone text not null,
  birth_date date,
  national_id text,
  created_at timestamp default now()
);
```

**جدول الأطباء (doctors)**:
```sql
create table doctors (
  id bigint generated always as identity primary key,
  full_name text not null,
  specialty text not null,
  hospital text,
  created_at timestamp default now()
);
```

**جدول المواعيد (appointments)**:
```sql
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
```

**جدول طلبات الرعاية المنزلية (homecare_requests)**:
```sql
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
```

### الخطوة 3: إضافة بيانات أطباء تجريبية
```sql
INSERT INTO doctors (full_name, specialty, hospital) VALUES
  ('د. أحمد العلوي', 'طب عام', 'مستشفى مصطفى باشا'),
  ('د. سارة بن علي', 'أمراض القلب', 'مستشفى نفيسة حمود'),
  ('د. محمد الزهراني', 'الأطفال', 'مستشفى القبة المركزي'),
  ('د. ليلى المنصوري', 'العظام', 'عيادة الشفاء'),
  ('د. كمال السعيدي', 'الأسنان', 'مستشفى عين النعجة'),
  ('د. نور الدين حسن', 'العيون', 'مستشفى لمين دباغين');
```

### الخطوة 4: إعداد Row Level Security (RLS)
1. في Table Editor، اختر كل جدول
2. اضغط على "RLS" (Row Level Security)
3. فعّل RLS ثم أضف السياسات التالية:

**للقراءة (SELECT) - للجميع**:
```sql
CREATE POLICY "Enable read access for all users" ON patients
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON doctors
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON appointments
FOR SELECT USING (true);
```

**للإدراج (INSERT) - للجميع**:
```sql
CREATE POLICY "Enable insert for all users" ON patients
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON appointments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON homecare_requests
FOR INSERT WITH CHECK (true);
```

### الخطوة 5: الحصول على مفاتيح الاتصال
1. من القائمة الجانبية، اختر "Project Settings" (أيقونة الترس)
2. اختر "API"
3. احفظ المعلومات التالية:
   - **Project URL**: شيء مثل `https://xxxxxxxxxx.supabase.co`
   - **anon public key**: مفتاح طويل يبدأ بـ `eyJ...`

---

## 2️⃣ إنشاء ملفات المشروع المحدّثة

سأقوم بإنشاء الملفات المطلوبة في الخطوة التالية.

### البنية المطلوبة:
```
shifaa-platform/
├── index.html          (الصفحة الرئيسية المحدّثة)
├── results.html        (صفحة عرض النتائج)
├── js/
│   └── supabase-config.js
├── netlify.toml        (إعدادات Netlify)
└── photo_2026-01-25_20-35-42.jpg  (صورة الخلفية)
```

---

## 3️⃣ نشر الموقع على Netlify

### الطريقة الأولى: عبر GitHub (موصى بها)

1. **إنشاء مستودع GitHub**:
   - اذهب إلى [github.com](https://github.com)
   - اضغط على "New repository"
   - سمّه `shifaa-platform`
   - اجعله Public
   - اضغط "Create repository"

2. **رفع الملفات**:
   - افتح Terminal أو CMD في مجلد المشروع
   - نفذ الأوامر:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/shifaa-platform.git
   git push -u origin main
   ```

3. **ربط Netlify بـ GitHub**:
   - اذهب إلى [netlify.com](https://netlify.com)
   - سجل دخول أو أنشئ حساب
   - اضغط "Add new site" > "Import an existing project"
   - اختر "GitHub"
   - ابحث عن مستودع `shifaa-platform`
   - الإعدادات ستكون تلقائية، اضغط "Deploy"

### الطريقة الثانية: رفع مباشر (أسرع للتجربة)

1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل دخول
3. اسحب مجلد المشروع كاملاً إلى صفحة Netlify
4. انتظر حتى ينتهي الرفع

---

## 4️⃣ ربط الموقع بقاعدة البيانات

### إضافة متغيرات البيئة في Netlify

1. في لوحة تحكم Netlify، اختر موقعك
2. اذهب إلى "Site settings" > "Environment variables"
3. اضغط "Add a variable"
4. أضف المتغيرات التالية:

   **المتغير الأول**:
   - Key: `SUPABASE_URL`
   - Value: `https://ughfltzaroqgqgeipksb.supabase.co`

   **المتغير الثاني**:
   - Key: `SUPABASE_ANON_KEY`
   - Value: (الصق المفتاح الطويل من Supabase)

5. احفظ التغييرات
6. اضغط "Trigger deploy" لإعادة النشر

---

## 5️⃣ اختبار الموقع

### بعد النشر:

1. **افتح الموقع**: اضغط على رابط الموقع من Netlify (مثل: `https://your-site.netlify.app`)

2. **اختبر حجز موعد**:
   - اختر مستشفى من القائمة
   - املأ بيانات المريض
   - اختر التخصص والتاريخ
   - اضغط "تأكيد الحجز"
   - يجب أن تظهر رسالة نجاح ورمز QR

3. **اختبر التتبع**:
   - اضغط "استعلم عن موعدك"
   - أدخل رقم الهاتف المستخدم في الحجز
   - يجب أن تظهر قائمة المواعيد

4. **تحقق من قاعدة البيانات**:
   - ارجع إلى Supabase
   - افتح Table Editor
   - تحقق من جدول `appointments` و `patients`
   - يجب أن ترى البيانات المدخلة

---

## 🔧 حل المشاكل الشائعة

### المشكلة 1: لا يتم حفظ البيانات
**الحل**: 
- تأكد من أن RLS مفعل والسياسات صحيحة
- تحقق من Console في المتصفح (F12) لرؤية الأخطاء

### المشكلة 2: خطأ CORS
**الحل**:
- في Supabase > Authentication > URL Configuration
- أضف رابط موقعك على Netlify في "Site URL" و "Redirect URLs"

### المشكلة 3: لا تظهر البيانات في صفحة النتائج
**الحل**:
- تأكد من أن رقم الهاتف مدخل بنفس الصيغة (مع أو بدون مسافات)
- تحقق من وجود البيانات في قاعدة البيانات

---

## 📱 تخصيص النطاق (Domain)

### في Netlify:
1. اذهب إلى "Domain settings"
2. اضغط "Add custom domain"
3. أدخل النطاق المطلوب (مثل: `shifaa.com`)
4. اتبع التعليمات لربط النطاق

---

## 🎉 تهانينا!

موقعك الآن منشور ومتصل بقاعدة بيانات حقيقية!

### الروابط المهمة:
- موقعك: `https://your-site.netlify.app`
- لوحة Netlify: [app.netlify.com](https://app.netlify.com)
- لوحة Supabase: [app.supabase.com](https://app.supabase.com)

### خطوات إضافية موصى بها:
1. فعّل HTTPS (تلقائي في Netlify)
2. أضف Google Analytics للإحصائيات
3. اختبر الموقع على أجهزة مختلفة
4. شارك الرابط مع الأصدقاء للتجربة

---

## 💡 نصائح مهمة

1. **النسخ الاحتياطي**: Supabase تحتفظ بنسخ احتياطية تلقائية، لكن يُفضل تصدير البيانات دورياً
2. **الأمان**: لا تشارك مفتاح `service_role` أبداً - استخدم فقط `anon public key`
3. **الحدود**: الخطة المجانية تدعم:
   - 500 MB قاعدة بيانات
   - 1 GB نقل بيانات
   - 50,000 مستخدم نشط شهرياً
4. **التحديثات**: يمكنك تحديث الملفات في GitHub وسيتم النشر تلقائياً

---

هل تحتاج مساعدة في أي خطوة؟ 😊
