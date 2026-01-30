// ملف إعدادات Supabase
// supabase-config.js

// استيراد مكتبة Supabase من CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// معلومات الاتصال بـ Supabase
// ملاحظة: هذه القيم يجب أن تُضاف في Netlify Environment Variables
const SUPABASE_URL = 'https://ughfltzaroqgqgeipksb.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // سيتم استبدالها بالمفتاح الحقيقي

// إنشاء عميل Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة لحفظ بيانات المريض
export async function savePatient(patientData) {
    try {
        const { data, error } = await supabase
            .from('patients')
            .insert([
                {
                    full_name: patientData.fullName,
                    phone: patientData.phone,
                    birth_date: patientData.birthDate,
                    national_id: patientData.nationalId
                }
            ])
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('خطأ في حفظ بيانات المريض:', error);
        return { success: false, error: error.message };
    }
}

// دالة لحفظ الموعد
export async function saveAppointment(appointmentData) {
    try {
        // أولاً: حفظ بيانات المريض
        const patientResult = await savePatient(appointmentData.patient);
        
        if (!patientResult.success) {
            throw new Error('فشل في حفظ بيانات المريض');
        }

        const patientId = patientResult.data.id;

        // ثانياً: إنشاء رمز الحجز الفريد
        const bookingCode = generateBookingCode();

        // ثالثاً: حفظ الموعد
        const { data, error } = await supabase
            .from('appointments')
            .insert([
                {
                    patient_id: patientId,
                    doctor_id: appointmentData.doctorId || null,
                    hospital_name: appointmentData.hospitalName,
                    service_type: appointmentData.serviceType,
                    appointment_date: appointmentData.appointmentDate,
                    specialty: appointmentData.specialty,
                    note: appointmentData.note || '',
                    booking_code: bookingCode,
                    status: 'pending'
                }
            ])
            .select();

        if (error) throw error;

        return { 
            success: true, 
            data: data[0],
            bookingCode: bookingCode
        };
    } catch (error) {
        console.error('خطأ في حفظ الموعد:', error);
        return { success: false, error: error.message };
    }
}

// دالة لحفظ طلب الرعاية المنزلية
export async function saveHomecareRequest(homecareData) {
    try {
        const { data, error } = await supabase
            .from('homecare_requests')
            .insert([
                {
                    patient_name: homecareData.patientName,
                    phone: homecareData.phone,
                    address: homecareData.address,
                    medical_condition: homecareData.medicalCondition,
                    request_date: homecareData.requestDate,
                    status: 'pending'
                }
            ])
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('خطأ في حفظ طلب الرعاية المنزلية:', error);
        return { success: false, error: error.message };
    }
}

// دالة للبحث عن المواعيد برقم الهاتف
export async function getAppointmentsByPhone(phone) {
    try {
        // البحث عن المريض أولاً
        const { data: patients, error: patientError } = await supabase
            .from('patients')
            .select('id, full_name')
            .eq('phone', phone);

        if (patientError) throw patientError;
        
        if (!patients || patients.length === 0) {
            return { success: true, data: [] };
        }

        const patientIds = patients.map(p => p.id);

        // البحث عن جميع المواعيد للمرضى
        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .in('patient_id', patientIds)
            .order('appointment_date', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        // دمج بيانات المريض مع المواعيد
        const enrichedAppointments = appointments.map(apt => ({
            ...apt,
            patient_name: patients.find(p => p.id === apt.patient_id)?.full_name
        }));

        return { success: true, data: enrichedAppointments };
    } catch (error) {
        console.error('خطأ في البحث عن المواعيد:', error);
        return { success: false, error: error.message };
    }
}

// دالة للحصول على جميع الأطباء
export async function getDoctors() {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .order('specialty');

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('خطأ في جلب بيانات الأطباء:', error);
        return { success: false, error: error.message };
    }
}

// دالة لتوليد رمز حجز فريد
function generateBookingCode() {
    const prefix = 'SHF';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// دالة للحصول على الأطباء حسب التخصص
export async function getDoctorsBySpecialty(specialty) {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('specialty', specialty);

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('خطأ في جلب الأطباء:', error);
        return { success: false, error: error.message };
    }
}

// دالة لتحديث حالة الموعد
export async function updateAppointmentStatus(appointmentId, status) {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: status })
            .eq('id', appointmentId)
            .select();

        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('خطأ في تحديث حالة الموعد:', error);
        return { success: false, error: error.message };
    }
}

// دالة للحصول على موعد برمز الحجز
export async function getAppointmentByCode(bookingCode) {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patients (
                    full_name,
                    phone,
                    birth_date,
                    national_id
                )
            `)
            .eq('booking_code', bookingCode)
            .single();

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('خطأ في البحث برمز الحجز:', error);
        return { success: false, error: error.message };
    }
}
