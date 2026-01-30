-- ملف SQL لإعداد قاعدة بيانات منصة شِفاء في Supabase
-- قم بتنفيذ هذا الملف كاملاً في SQL Editor في Supabase

-- =================================================================
-- الخطوة 1: إنشاء الجداول
-- =================================================================

-- جدول المرضى
CREATE TABLE patients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE,
  national_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الأطباء
CREATE TABLE doctors (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول المواعيد
CREATE TABLE appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id),
  doctor_id BIGINT REFERENCES doctors(id),
  hospital_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  specialty TEXT NOT NULL,
  note TEXT,
  booking_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول طلبات الرعاية المنزلية
CREATE TABLE homecare_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  medical_condition TEXT,
  request_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =================================================================
-- الخطوة 2: إضافة Indexes لتحسين الأداء
-- =================================================================

CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_booking_code ON appointments(booking_code);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);

-- =================================================================
-- الخطوة 3: إدخال بيانات أطباء تجريبية
-- =================================================================

INSERT INTO doctors (full_name, specialty, hospital) VALUES
  ('د. أحمد العلوي', 'طب عام', 'مستشفى مصطفى باشا الجامعي'),
  ('د. سارة بن علي', 'أمراض القلب', 'مستشفى نفيسة حمود (بارني)'),
  ('د. محمد الزهراني', 'الأطفال', 'مستشفى القبة المركزي'),
  ('د. ليلى المنصوري', 'العظام', 'عيادة الشفاء المركزية'),
  ('د. كمال السعيدي', 'الأسنان', 'مستشفى عين النعجة العسكري'),
  ('د. نور الدين حسن', 'العيون', 'مستشفى لمين دباغين'),
  ('د. فاطمة الزهراء', 'طب عام', 'مستشفى مصطفى باشا الجامعي'),
  ('د. يوسف بوعزيز', 'أمراض القلب', 'مستشفى القبة المركزي'),
  ('د. هدى السعدي', 'الأطفال', 'عيادة الشفاء المركزية'),
  ('د. خالد منصور', 'العظام', 'مستشفى نفيسة حمود (بارني)');

-- =================================================================
-- الخطوة 4: تفعيل Row Level Security (RLS)
-- =================================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homecare_requests ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- الخطوة 5: إنشاء سياسات الأمان (Policies)
-- =================================================================

-- سياسات القراءة (SELECT) - السماح للجميع
CREATE POLICY "Enable read access for all users" 
  ON patients FOR SELECT 
  USING (true);

CREATE POLICY "Enable read access for all users" 
  ON doctors FOR SELECT 
  USING (true);

CREATE POLICY "Enable read access for all users" 
  ON appointments FOR SELECT 
  USING (true);

CREATE POLICY "Enable read access for all users" 
  ON homecare_requests FOR SELECT 
  USING (true);

-- سياسات الإدراج (INSERT) - السماح للجميع
CREATE POLICY "Enable insert for all users" 
  ON patients FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable insert for all users" 
  ON appointments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable insert for all users" 
  ON homecare_requests FOR INSERT 
  WITH CHECK (true);

-- سياسات التحديث (UPDATE) - السماح للجميع لتحديث حالة المواعيد
CREATE POLICY "Enable update for all users" 
  ON appointments FOR UPDATE 
  USING (true);

CREATE POLICY "Enable update for all users" 
  ON homecare_requests FOR UPDATE 
  USING (true);

-- =================================================================
-- الخطوة 6: إنشاء Views مفيدة (اختياري)
-- =================================================================

-- عرض المواعيد مع تفاصيل المريض والطبيب
CREATE OR REPLACE VIEW appointments_details AS
SELECT 
  a.id,
  a.booking_code,
  a.appointment_date,
  a.hospital_name,
  a.service_type,
  a.specialty,
  a.status,
  a.note,
  p.full_name AS patient_name,
  p.phone AS patient_phone,
  p.national_id,
  d.full_name AS doctor_name,
  a.created_at
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN doctors d ON a.doctor_id = d.id
ORDER BY a.appointment_date DESC;

-- عرض إحصائيات الحجوزات
CREATE OR REPLACE VIEW booking_statistics AS
SELECT 
  hospital_name,
  specialty,
  status,
  COUNT(*) AS total_bookings,
  DATE(appointment_date) AS booking_date
FROM appointments
GROUP BY hospital_name, specialty, status, DATE(appointment_date)
ORDER BY booking_date DESC;

-- =================================================================
-- الخطوة 7: إنشاء Functions مفيدة (اختياري)
-- =================================================================

-- دالة للحصول على المواعيد القادمة
CREATE OR REPLACE FUNCTION get_upcoming_appointments(days_ahead INT DEFAULT 7)
RETURNS TABLE (
  booking_code TEXT,
  patient_name TEXT,
  hospital_name TEXT,
  specialty TEXT,
  appointment_date TIMESTAMP,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.booking_code,
    p.full_name,
    a.hospital_name,
    a.specialty,
    a.appointment_date,
    a.status
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  WHERE a.appointment_date BETWEEN NOW() AND NOW() + (days_ahead || ' days')::INTERVAL
    AND a.status = 'pending'
  ORDER BY a.appointment_date;
END;
$$ LANGUAGE plpgsql;

-- دالة لإحصاء المواعيد حسب الحالة
CREATE OR REPLACE FUNCTION count_appointments_by_status()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.status,
    COUNT(*) AS count
  FROM appointments a
  GROUP BY a.status;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- تم! قاعدة البيانات جاهزة للاستخدام
-- =================================================================

-- للتحقق من نجاح الإعداد، قم بتشغيل:
SELECT 'patients' AS table_name, COUNT(*) AS rows FROM patients
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'homecare_requests', COUNT(*) FROM homecare_requests;

-- يجب أن ترى:
-- patients: 0
-- doctors: 10
-- appointments: 0
-- homecare_requests: 0
