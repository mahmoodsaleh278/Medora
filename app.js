/* =========================================================
   MEDORA — Single Page Application (v2)
   Vanilla JS hash router + window.storage persistence
   ========================================================= */

/* شعار مِدورا المصغّر (يُستخدم كعلامة موحّدة أعلى كل ملخّص) */
const MEDORA_LOGO_SM = 'https://mihbguavqplpwaabwbbu.supabase.co/storage/v1/object/public/assets/logo-medora-sm.jpg';

const UNIVERSITIES = [
  { id:'mutah', name:'جامعة مؤتة', loc:'الكرك', logo:'https://mihbguavqplpwaabwbbu.supabase.co/storage/v1/object/public/assets/logo-uni-mutah.jpg' },
  { id:'petra', name:'جامعة البترا', loc:'عمّان', logo:'https://mihbguavqplpwaabwbbu.supabase.co/storage/v1/object/public/assets/logo-uni-petra.jpg' },
  { id:'aspu', name:'جامعة العلوم التطبيقية الخاصة', loc:'عمّان', logo:'https://mihbguavqplpwaabwbbu.supabase.co/storage/v1/object/public/assets/logo-uni-aspu.jpg' },
  { id:'just', name:'جامعة العلوم والتكنولوجيا الأردنية', loc:'إربد', logo:'https://mihbguavqplpwaabwbbu.supabase.co/storage/v1/object/public/assets/logo-uni-just.png' },
];

const MAJORS = [
  { id:'nursing', name:'التمريض' },
  { id:'dentistry', name:'طب الأسنان' },
];

const SEED_COURSES = [
  { id:'c1', title:'أساسيات التمريض - فيرست', university:'عام', major:'التمريض', hours:4, description:'المفاهيم والمهارات الأساسية لممارسة التمريض الآمن والفعّال (الجزء الأول).', isFree:true },
  { id:'c1b', title:'أساسيات التمريض - ميد', university:'عام', major:'التمريض', hours:4, description:'المفاهيم والمهارات الأساسية لممارسة التمريض الآمن والفعّال (الجزء الثاني).', isFree:false },
  { id:'c1c', title:'أساسيات التمريض - فاينل', university:'عام', major:'التمريض', hours:4, description:'المفاهيم والمهارات الأساسية لممارسة التمريض الآمن والفعّال (الجزء الأخير).', isFree:false },
  { id:'c2', title:'تمريض صحة الأم والطفل', university:'جامعة مؤتة', major:'التمريض', hours:3, description:'رعاية الأمهات والأطفال حديثي الولادة خلال مراحل الحمل والولادة.', isFree:false },
  { id:'c3', title:'التمريض في الرعاية الحرجة', university:'جامعة العلوم التطبيقية الخاصة', major:'التمريض', hours:3, description:'أساليب المراقبة والتدخل في وحدات العناية المركزة.', isFree:false },
  { id:'c4', title:'الصحة النفسية والتمريض النفسي', university:'جامعة العلوم والتكنولوجيا الأردنية', major:'التمريض', hours:3, description:'التعامل مع الاضطرابات النفسية ومهارات التواصل العلاجي.', isFree:false },
  { id:'c5', title:'الصيدلة السريرية للتمريض', university:'عام', major:'التمريض', hours:2, description:'الأدوية الشائعة، الجرعات، والتفاعلات الدوائية المهمة للممرض.', isFree:false },
  { id:'c6', title:'تمريض المسنين', university:'جامعة مؤتة', major:'التمريض', hours:2, description:'احتياجات الرعاية الخاصة بكبار السن والأمراض المزمنة.', isFree:false },
  { id:'c7', title:'تمريض المجتمع والصحة العامة', university:'جامعة البترا', major:'التمريض', hours:3, description:'مبادئ الرعاية الصحية الأولية ودور الممرض في خدمة المجتمع.', isFree:false },
  { id:'d1', title:'أساسيات طب الأسنان', university:'عام', major:'طب الأسنان', hours:4, description:'المفاهيم والمهارات الأساسية في تشريح الفم والأسنان وممارسات العيادة الآمنة.', isFree:true },
  { id:'d2', title:'علاج جذور الأسنان', university:'جامعة مؤتة', major:'طب الأسنان', hours:3, description:'تشخيص وعلاج مشاكل لب السن وقنوات الجذور.', isFree:false },
  { id:'d3', title:'تقويم الأسنان', university:'جامعة العلوم التطبيقية الخاصة', major:'طب الأسنان', hours:3, description:'مبادئ تقويم الأسنان والفكين وخطط العلاج الشائعة.', isFree:false },
  { id:'d4', title:'جراحة الفم والفكين', university:'جامعة العلوم والتكنولوجيا الأردنية', major:'طب الأسنان', hours:3, description:'الإجراءات الجراحية الشائعة في الفم والفكين وطرق التخدير الموضعي.', isFree:false },
  { id:'d6', title:'تركيبات الأسنان', university:'جامعة البترا', major:'طب الأسنان', hours:3, description:'أساسيات التيجان والجسور والأطقم في علاج الأسنان التعويضي.', isFree:false },
  { id:'d5', title:'طب أسنان الأطفال', university:'عام', major:'طب الأسنان', hours:2, description:'التعامل مع أسنان الأطفال والوقاية من التسوس المبكر.', isFree:false },
];

/* ---------------- Course sections (فيرست / ميد / فاينال) ----------------
   كل محاضرة تنتمي لقسم واحد، وكل قسم له سعر واشتراك مستقل عن باقي الأقسام،
   بحيث يقدر الطالب يشترك بالفيرست فقط أو بالميد فقط... إلخ. */
const SECTIONS = ['first','mid','final'];
const SECTION_LABELS = { first:'الفيرست', mid:'الميد', final:'الفاينال' };
const SECTION_NUM = { first:'1', mid:'2', final:'3' };

const SEED_LECTURES = [
  { id:'l1', courseId:'c1', title:'مقدمة في مفاهيم التمريض', description:'نظرة عامة على أساسيات المهنة وأخلاقياتها.', videoUrl:'', fileUrl:'' },
  { id:'l2', courseId:'c1', title:'العلامات الحيوية', description:'قياس وتفسير العلامات الحيوية الأساسية.', videoUrl:'', fileUrl:'' },
  { id:'l3', courseId:'c2', title:'مراحل الحمل الطبيعي', description:'المتابعة الدورية للحامل خلال الثلاثيات الثلاث.', videoUrl:'', fileUrl:'' },
  { id:'l4', courseId:'c3', title:'أساسيات المراقبة في العناية المركزة', description:'قراءة المونيتور والتعامل مع الحالات الحرجة.', videoUrl:'', fileUrl:'' },
  { id:'l5', courseId:'c5', title:'حساب الجرعات الدوائية', description:'طرق حساب الجرعة بدقة لتفادي الأخطاء الدوائية.', videoUrl:'', fileUrl:'' },
  { id:'l6', courseId:'d1', title:'تشريح الفم والأسنان', description:'نظرة عامة على تركيب الأسنان والأنسجة المحيطة بها.', videoUrl:'', fileUrl:'' },
  { id:'l7', courseId:'d2', title:'خطوات علاج العصب', description:'الإجراء العملي لعلاج قنوات الجذور خطوة بخطوة.', videoUrl:'', fileUrl:'' },
];

const SEED_QUESTIONS = [
  { id:'q1', courseId:'c1', lectureId:'l2', nature:'past', question:'ما هو المعدل الطبيعي لضربات القلب لدى شخص بالغ في حالة الراحة؟', options:['40-60 نبضة/دقيقة','60-100 نبضة/دقيقة','100-140 نبضة/دقيقة','150-180 نبضة/دقيقة'], correctIndex:1, explanation:'المعدل الطبيعي لضربات القلب لدى البالغين في حالة الراحة يتراوح بين 60 و100 نبضة في الدقيقة.' },
  { id:'q2', courseId:'c1', lectureId:'l1', nature:'ref', question:'أي وضعية تُستخدم عادة لمريض يعاني من ضيق تنفس؟', options:['الوضعية الأفقية','وضعية فاولر (نصف جلوس)','وضعية الانبطاح','وضعية الجانب الأيسر'], correctIndex:1, explanation:'وضعية فاولر (نصف الجلوس) تساعد على توسّع الرئتين وتسهّل عملية التنفس.' },
  { id:'q3', courseId:'c2', lectureId:'l3', nature:'past', question:'ما هو أول انعكاس فطري يُتوقع ظهوره لدى المولود الجديد؟', options:['انعكاس مورو','انعكاس المشي','انعكاس بابنسكي','انعكاس القبض'], correctIndex:0, explanation:'انعكاس مورو هو من أوائل الانعكاسات الفطرية التي تُفحص لدى حديثي الولادة لتقييم سلامة الجهاز العصبي.' },
  { id:'q4', courseId:'c3', lectureId:'l4', nature:'ref', question:'ما هو أول إجراء عند اكتشاف توقف تنفس المريض في العناية الحرجة؟', options:['قياس الضغط','فتح مجرى الهواء والتنفس الاصطناعي','إعطاء الدواء المهدئ','الاتصال بالأهل'], correctIndex:1, explanation:'حسب بروتوكول الإنعاش، الأولوية القصوى هي فتح مجرى الهواء (Airway) قبل أي إجراء آخر.' },
  { id:'q5', courseId:'c4', lectureId:null, nature:'past', question:'أي من التالي يُعد من أعراض الاكتئاب الرئيسية؟', options:['فرط النشاط المستمر','فقدان الاهتمام بالأنشطة اليومية','تحسن الذاكرة قصيرة المدى','زيادة التركيز'], correctIndex:1, explanation:'فقدان الاهتمام أو المتعة بالأنشطة اليومية (Anhedonia) من الأعراض التشخيصية الأساسية للاكتئاب.' },
  { id:'q6', courseId:'c5', lectureId:'l5', nature:'ref', question:'أي فئة دوائية تُستخدم لعلاج ارتفاع ضغط الدم؟', options:['المضادات الحيوية','حاصرات بيتا (Beta Blockers)','مضادات الهيستامين','الفيتامينات'], correctIndex:1, explanation:'حاصرات بيتا تقلل من معدل ضربات القلب وقوة تقلص عضلة القلب، مما يخفض ضغط الدم.' },
  { id:'q7', courseId:'c1', lectureId:'l2', nature:'past', question:'ما الأداة المستخدمة لقياس درجة حرارة الجسم؟', options:['السماعة الطبية','مقياس الحرارة (الترمومتر)','جهاز قياس الضغط','منظار العين'], correctIndex:1, explanation:'الترمومتر هو الأداة المخصصة لقياس درجة حرارة الجسم بدقة.' },
  { id:'q8', courseId:'c1', lectureId:null, nature:'ref', question:'ما هو المعدل الطبيعي للتنفس لدى البالغين في الدقيقة؟', options:['4-8','12-20','30-40','45-60'], correctIndex:1, explanation:'المعدل الطبيعي لتنفس البالغين يتراوح بين 12 و20 نفسًا في الدقيقة.' },
  { id:'q9', courseId:'d1', lectureId:'l6', nature:'past', question:'كم عدد الأسنان الدائمة لدى الإنسان البالغ؟', options:['20 سنًا','28 سنًا','32 سنًا','36 سنًا'], correctIndex:2, explanation:'يمتلك الإنسان البالغ 32 سنًا دائمًا شاملةً أضراس العقل الأربعة.' },
  { id:'q10', courseId:'d1', lectureId:'l6', nature:'ref', question:'ما هي الطبقة الأكثر صلابة في السن؟', options:['اللب (Pulp)','العاج (Dentin)','الميناء (Enamel)','الملاط (Cementum)'], correctIndex:2, explanation:'الميناء هي أصلب طبقة في السن وتغطي التاج لحمايته من التآكل والتسوس.' },
  { id:'q11', courseId:'d2', lectureId:'l7', nature:'past', question:'ما هو الهدف الرئيسي من علاج قناة الجذر؟', options:['تبييض السن','إزالة اللب المصاب وتعقيم القناة','تقويم موضع السن','إزالة الجير'], correctIndex:1, explanation:'علاج قناة الجذر يهدف لإزالة اللب المصاب أو الملتهب وتنظيف وتعقيم القنوات لإنقاذ السن.' },
];

/* ---------------- Storage helpers (Supabase backend) ----------------
   شارِك هذين المتغيرين ببيانات مشروع Supabase الخاص فيك (URL + anon key).
   راجع الشرح المرفق لمعرفة كيف تحصل عليهم وتنشئ الجدول اللازم. */
const SUPABASE_URL = 'https://mihbguavqplpwaabwbbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paGJndWF2cXBscHdhYWJ3YmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTM0NTUsImV4cCI6MjEwMDM4OTQ1NX0.CIBfeqBIO7FHdNV79C4srs2Go5BbXMmUQhopsy-eUTI';
/* مفتاح Publishable من نظام مفاتيح Supabase الجديد — مطلوب كهيدر apikey عند
   استدعاء Edge Functions مباشرة عبر fetch (بوابة المشروع ما عادت تقبل مفتاح
   anon القديم بصيغة JWT لهذا الهيدر تحديدًا). */
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mqU4Pv057AylZ9kG81DMbA_BVYJ_WXo';
const supabaseClient = (SUPABASE_URL.startsWith('http'))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* shared=true  -> بيانات مشتركة بين كل الزوار، تُخزَّن في Supabase (جدول medora_data)
   shared=false -> بيانات خاصة بجهاز/متصفح المستخدم فقط (الجلسة، الوضع الليلي)، تُخزَّن محليًا */
async function getData(key, fallback, shared=true){
  try{
    if(!shared){
      const raw = localStorage.getItem('medora_local_'+key);
      return raw ? JSON.parse(raw) : fallback;
    }
    if(!supabaseClient) return fallback;
    const { data, error } = await supabaseClient.from('medora_data').select('value').eq('key', key).maybeSingle();
    if(error || !data) return fallback;
    return data.value;
  }catch(e){ console.error('getData failed', e); return fallback; }
}
async function setData(key, value, shared=true){
  try{
    if(!shared){
      localStorage.setItem('medora_local_'+key, JSON.stringify(value));
      return;
    }
    if(!supabaseClient) return;
    await supabaseClient.from('medora_data').upsert({ key, value, updated_at: new Date().toISOString() });
  }catch(e){ console.error('storage set failed', e); }
}
async function deleteData(key, shared=true){
  try{
    if(!shared){ localStorage.removeItem('medora_local_'+key); return; }
    if(!supabaseClient) return;
    await supabaseClient.from('medora_data').delete().eq('key', key);
  }catch(e){}
}

/* ---------------- قفل الجهاز الواحد للطالب (student_devices) ----------------
   نفّذ هذا مرة واحدة في Supabase SQL Editor لإنشاء الجدول والصلاحيات:

   create table if not exists public.student_devices (
     phone text primary key,
     user_id uuid not null,
     device_id text not null,
     device_label text,
     first_login_at timestamptz not null default now(),
     last_login_at timestamptz not null default now()
   );
   alter table public.student_devices enable row level security;

   -- الطالب يقرأ فقط صف جهازه الخاص
   create policy "student select own device" on public.student_devices
     for select using ( auth.uid() = user_id );
   -- الطالب يستطيع إنشاء صف جهازه أول مرة فقط (لا توجد سياسة UPDATE له عمدًا،
   -- حتى لا يقدر أي جهاز ثانٍ "يسرق" الصف بالكتابة فوقه بنفسه)
   create policy "student insert own device" on public.student_devices
     for insert with check ( auth.uid() = user_id );
   -- المشرف يقرأ كل الصفوف
   create policy "admin select all devices" on public.student_devices
     for select using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );
   -- المشرف فقط يملك صلاحية "إعادة تعيين الجهاز" (حذف الصف)
   create policy "admin delete any device" on public.student_devices
     for delete using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

   -- لتفعيل الإشعار الفوري (خروج تلقائي من الجهاز القديم فور إعادة التعيين
   -- دون انتظار تحديث الصفحة)، فعّل Realtime على الجدول:
   alter publication supabase_realtime add table public.student_devices;
*/

/* هوية ثابتة لهذا المتصفح/الجهاز، تُخزَّن محليًا ولا تُشارَك أبدًا */
function getDeviceId(){
  let id = localStorage.getItem('medora_device_id');
  if(!id){
    id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('dev-'+Date.now()+'-'+Math.random().toString(16).slice(2));
    localStorage.setItem('medora_device_id', id);
  }
  return id;
}

/* يتحقّق أن الجهاز الحالي هو الجهاز الوحيد المسموح له بهذا الحساب.
   - إن لم يوجد صف بعد: هذا أول دخول على الإطلاق، فيُسجَّل هذا الجهاز كجهازه الوحيد.
   - إن وُجد صف ويطابق جهازنا: الدخول مسموح.
   - إن وُجد صف ولا يطابق: يُسجَّل الخروج فورًا ويُمنع الدخول (بغض النظر عن الوقت،
     وليس فقط عند التزامن اللحظي)، إلى أن يعيد المشرف تعيين جهاز الحساب. */
async function enforceDeviceLock(phone, userId){
  if(!supabaseClient) return true;
  const deviceId = getDeviceId();
  try{
    const { data: existing, error } = await supabaseClient
      .from('student_devices').select('device_id').eq('phone', phone).maybeSingle();
    if(error) return true; // لا نمنع الدخول بسبب خطأ شبكة عابر
    if(existing){
      if(existing.device_id === deviceId) return true;
      await supabaseClient.auth.signOut();
      return false;
    }
    const { error: insErr } = await supabaseClient.from('student_devices').insert({
      phone, user_id: userId, device_id: deviceId, device_label: navigator.userAgent.slice(0,140)
    });
    if(insErr && insErr.code === '23505'){
      // جهاز آخر سبقنا بجزء من الثانية بالتسجيل لنفس الحساب - نعيد التحقق منه
      const { data: raceRow } = await supabaseClient.from('student_devices').select('device_id').eq('phone', phone).maybeSingle();
      if(raceRow && raceRow.device_id !== deviceId){
        await supabaseClient.auth.signOut();
        return false;
      }
    }
    return true;
  }catch(e){ return true; }
}

/* يراقب صف جهاز هذا الطالب دوريًا (Polling بدل Realtime channel دائم): إن غيّره/حذفه
   المشرف (إعادة تعيين) بينما الطالب لا يزال مسجّلاً بجهازه القديم، يُخرَج خلال دقيقة
   تقريبًا كحد أقصى دون انتظار تحديث الصفحة.
   لماذا Polling وليس Realtime؟ كل طالب متصل عبر Realtime channel يحجز اتصالًا دائمًا طوال
   مدة تواجده (قد تكون ساعة كاملة أثناء محاضرة) من حصة الاتصالات المتزامنة المحدودة لخطة
   Supabase. أما الـ Polling فيرسل طلبًا قصيرًا جدًا كل ~55-75 ثانية (فاصل عشوائي/Jitter
   لتفادي وصول كل الطلبات دفعة واحدة بنفس اللحظة)، فيحرر الاتصال فور انتهاء الطلب، ويرفع
   بذلك سقف عدد الطلاب المتزامنين بشكل كبير مقابل تأخير بسيط (ثوانٍ إلى دقيقة) في سرعة
   اكتشاف إعادة التعيين اليدوية من الأدمن — وهو سيناريو نادر أصلًا. */
let deviceLockPollTimer = null;
function stopDeviceLockWatch(){
  if(deviceLockPollTimer){ clearTimeout(deviceLockPollTimer); deviceLockPollTimer = null; }
}
function watchDeviceLock(phone){
  if(!supabaseClient || !phone) return;
  stopDeviceLockWatch();
  const deviceId = getDeviceId();
  const scheduleNext = ()=>{
    const jitterMs = 55000 + Math.floor(Math.random()*20000); // 55-75 ثانية
    deviceLockPollTimer = setTimeout(poll, jitterMs);
  };
  async function poll(){
    try{
      const { data, error } = await supabaseClient
        .from('student_devices').select('device_id').eq('phone', phone).maybeSingle();
      if(!error && (!data || data.device_id !== deviceId)){
        await supabaseClient.auth.signOut();
        state.session = null;
        stopDeviceLockWatch();
        navigate('login');
        render();
        alert('تم تسجيل خروجك: تم إعادة تعيين جهاز هذا الحساب من قِبل الإدارة.');
        return; // لا نجدول جولة جديدة بعد الخروج
      }
    }catch(e){ /* خطأ شبكة عابر - لا نطرد الطالب بسببه، نعيد المحاولة بالجولة الجاية */ }
    scheduleNext();
  }
  scheduleNext(); // أول فحص بعد فاصل عشوائي أيضًا، وليس فوريًا، لتفادي دفعة تسجيل دخول جماعية
}

/* ---------------- App state ---------------- */
let state = {
  courses: [], lectures: [], questions: [], students: [], messages: [], enrollments: [], summaries: [], lectureProgress: [], savedQuestions: [], coupons: [], notifications: [],
  session: null, loaded: false, courseFilter: 'الكل', majorFilter: 'الكل', courseSearch: '', coursePage: 1, bankAdminView: false, bankNotesView: false, content: {}, teachers: [],
  bankManageCourseId: null, bankManageLectureId: '',
};

/* =========================================================
   i18n — تبديل اللغة (عربي / إنجليزي) + انعكاس الاتجاه RTL/LTR
   يعمل عبر قاموس عبارات: نستبدل كل عبارة عربية موجودة بمقابلها
   الإنجليزي داخل عقد النص المعروضة فعليًا (وليس مصدر الكود)،
   لذلك يعمل تلقائيًا مع كل الصفحات دون الحاجة لتعديل كل دالة عرض. */
let LANG = 'ar';
const I18N_PAIRS = [
  ['الصفحة الرئيسية','Home'], ['بنك الأسئلة متاح فقط للطلاب المسجّلين.','The question bank is only available to registered students.'],
  ['بنك الأسئلة','Question Bank'], ['من نحن','About Us'], ['تواصل معنا','Contact Us'],
  ['دوراتي','My Courses'], ['مساحة الطالب متاحة فقط للطلاب المسجّلين.','Student space is only available to registered students.'],
  ['ملخصاتي','My Summaries'], ['إضافة ملخص','Add Summary'], ['لا توجد ملخصات بعد','No summaries yet'],
  ['ابدأ بإضافة أول ملخص خاص بك ليبقى محفوظًا في حسابك.','Add your first summary and keep it saved in your account.'],
  ['أضف ملخصاتك الخاصة واحتفظ بها في حسابك','Add your own summaries and keep them saved in your account'],
  ['مساحة الطالب','Student Space'], ['تسجيل الدخول','Login'], ['خروج','Logout'],
  ['→ العودة إلى مساحة الطالب','→ Back to Student Space'],
  ['تحميل التطبيق','Download App'], ['الوضع الليلي','Dark Mode'], ['فتح القائمة','Open Menu'],
  ['متوفر لأجهزة الأندرويد فقط','Available for Android devices only'],
  ['تحميل التطبيق للأندرويد','Download App for Android'],
  ['لأجهزة الأندرويد فقط، غير متاح حاليًا على iOS','For Android devices only, not currently available on iOS'],
  ['🛡️ أنت الآن في وضع المشرف — يمكنك إضافة أو حذف الدورات والمحاضرات والأسئلة مباشرة من الصفحات.','You are now in admin mode — you can add or delete courses, lectures, and questions directly from the pages.'],
  ['مشرف','Admin'], ['تسجيل الخروج','Sign Out'],
  ['روابط سريعة','Quick Links'], ['الجامعات المستهدفة','Target Universities'], ['التخصصات','Majors'],
  ['سياسة الخصوصية','Privacy Policy'], ['الشروط والأحكام','Terms & Conditions'],
  ['جامعة العلوم التطبيقية الخاصة','Applied Science Private University'],
  ['جامعة العلوم والتكنولوجيا الأردنية','Jordan University of Science & Technology'],
  ['جامعة مؤتة','Mutah University'], ['جامعة البترا','University of Petra'], ['التمريض','Nursing'], ['طب الأسنان','Dentistry'],
  ['الكرك','Karak'], ['عمّان','Amman'], ['إربد','Irbid'],
  ['الفيرست','First'], ['الميد','Mid'], ['الفاينال','Final'],
  ['تصفّح الدورات المتاحة، فلتر حسب تخصصك وجامعتك، أو ابحث مباشرة','Browse available courses, filter by your major and university, or search directly'],
  ['تصفّح الدورات والمحاضرات المفعّلة لديك','Browse your active courses and lectures'],
  ['تصفّح الدورات','Browse Courses'],
  ['إنشاء حساب / تسجيل الدخول','Create Account / Login'],
  ['كورس متاح','courses available'], ['سؤال في البنك','questions in the bank'],
  ['الدورات التعليمية','Educational Courses'],
  ['ابحث عن مادة أو جامعة...','Search for a course or university...'],
  ['إضافة كورس جديد','Add New Course'],
  ['لا توجد كورسات ضمن هذا التصنيف','No courses in this category'],
  ['جرّب تصنيفًا آخر، أو أضف كورسًا جديدًا.','Try another category, or add a new course.'],
  ['جرّب تصنيفًا آخر.','Try another category.'],
  ['الانتقال للدورة','Go to Course'], ['الدورات','Courses'],
  ['لا توجد كورسات مفعّلة بعد','No active courses yet'],
  ['تواصل مع الإدارة لتفعيل الدورات التي تحتاجها.','Contact administration to activate the courses you need.'],
  ['عرض المحاضرات','View Lectures'], ['الكورس بالكامل','Full Course'],
  ['سجّل الدخول أولًا','Please log in first'],
  ['ابدأ اختبارًا من بنك الأسئلة حسب دوراتك','Start a quiz from the question bank based on your courses'],
  ['إعدادات الحساب','Account Settings'],
  ['تحكّم بصورتك وبياناتك وطريقة عرض المنصة','Manage your photo, data, and how the platform is displayed'],
  ['الصورة الشخصية','Profile Photo'], ['تغيير الصورة','Change Photo'],
  ['إضافة صورة شخصية','Add Profile Photo'], ['إزالة الصورة','Remove Photo'],
  ['يفضّل صورة مربعة، الحجم الأقصى 2MB (JPG أو PNG)','A square photo is preferred, max size 2MB (JPG or PNG)'],
  ['بيانات الطالب','Student Information'], ['الاسم الكامل','Full Name'],
  ['إعدادات العرض','Display Settings'], ['اللغة','Language'], ['العربية','Arabic'],
  ['حجم الخط','Font Size'], ['صغير','Small'], ['متوسط','Medium'], ['كبير','Large'],
  ['بيانات الحساب','Account Data'], ['رقم الهاتف هو معرّف الدخول لحسابك ولا يمكن تعديله من هنا. للتغيير تواصل مع الدعم.','Your phone number is your login ID and cannot be changed here. Contact support to change it.'],
  ['رقم الهاتف','Phone Number'],
  ['الإعدادات متاحة فقط للطلاب المسجّلين.','Settings are only available to registered students.'],
  ['الإعدادات','Settings'], ['دورة مفعّلة','active course(s)'],
  ['إنشاء حساب جديد','Create New Account'],
  ['أدخل بياناتك للوصول إلى حسابك','Enter your details to access your account'],
  ['انضم إلى منصة MEDORA الآن','Join the MEDORA platform now'],
  ['— اختر تخصصك —','— Choose your major —'], ['— اختر جامعتك —','— Choose your university —'],
  ['كلمة المرور','Password'], ['إنشاء الحساب','Create Account'],
  ['ليس لديك حساب؟',"Don't have an account?"], ['أنشئ حسابًا جديدًا','Create a new account'],
  ['لديك حساب بالفعل؟','Already have an account?'], ['سجّل الدخول','Log in'],
  ['دخول المشرفين','Admin Login'], ['أنت مسجّل الدخول بالفعل','You are already logged in'],
  ['يمكنك تصفّح الدورات وبنك الأسئلة مباشرة.','You can browse courses and the question bank directly.'],
  ['أنت مسجّل الدخول كمشرف','You are logged in as admin'],
  ['يمكنك إدارة الدورات والمحاضرات وبنك الأسئلة من صفحاتها مباشرة.','You can manage courses, lectures, and the question bank directly from their pages.'],
  ['هذه الصفحة مخصّصة لفريق إدارة منصة MEDORA فقط','This page is for the MEDORA admin team only'],
  ['اسم المستخدم','Username'], ['دخول لوحة التحكم','Login to Dashboard'],
  ['الجامعات المشمولة حاليًا','Currently Covered Universities'],
  ['معلومات التواصل','Contact Information'], ['البريد الإلكتروني','Email'],
  ['الهاتف','Phone'], ['الموقع','Location'], ['لا توجد رسائل بعد.','No messages yet.'],
  ['أرسل رسالة','Send a Message'],
  ['سنقوم بالرد عليك عبر البريد الإلكتروني المُدخل','We will reply to you via the email you enter'],
  ['اسمك الكامل','Your full name'], ['اكتب رسالتك هنا...','Write your message here...'],
  ['إرسال الرسالة','Send Message'], ['الرسالة','Message'], ['الاسم','Name'],
  ['الكورس غير موجود','Course Not Found'], ['ربما تم حذفه.','It may have been deleted.'],
  ['عودة إلى الدورات','Back to Courses'],
  ['مشاهدة الفيديو','Watch Video'], ['تشغيل الفيديو','Play Video'],
  ['تحميل الملف','Download File'], ['نسخة PDF','PDF Copy'],
  ['لم تتم إضافة فيديو أو ملف لهذه المحاضرة بعد','No video or file has been added to this lecture yet'],
  ['حذف المحاضرة','Delete Lecture'], ['تعديل المحاضرة','Edit Lecture'],
  ['حذف السؤال','Delete Question'], ['تعديل السؤال','Edit Question'],
  ['تعديل بيانات الكورس','Edit Course Info'],
  ['إضافة سؤال جديد','Add New Question'], ['إضافة فيديو','Add Video'],
  ['إضافة محاضرة جديدة','Add New Lecture'], ['إضافة محاضرة','Add Lecture'], ['إضافة ملف','Add File'],
  ['تفعيل الكورس لطالب','Activate Course for a Student'], ['تفعيل للطلاب','Activate for Students'],
  ['اشترك مجانًا لفتح محاضرات','Subscribe for free to unlock lectures in'],
  ['اشترك مجانًا بقسم','Subscribe for free to'],
  ['سجّل الدخول للاشتراك المجاني بهذا القسم —','Log in to subscribe for free to this section —'],
  ['سجّل الدخول للاشتراك','Log in to subscribe'],
  ['مدفوع، يتم التفعيل من قبل الإدارة','paid, activated by administration'],
  ['قسم مدفوع','Paid section'],
  ['اشترك الآن','Subscribe Now'], ['مجاني','Free'], ['مدفوع','Paid'], ['مفعّل','Active'],
  ['هذا الحساب مسجَّل دخول بالفعل على جهاز آخر، ولا يمكن استخدام أكثر من جهاز واحد لنفس الحساب. للدخول من هذا الجهاز، تواصل مع الإدارة لإعادة تعيين جهاز حسابك.','This account is already logged in on another device, and only one device can be used per account. To log in from this device, contact administration to reset your account device.'],
  ['إدارة بنك الأسئلة (إضافة / تعديل / حذف)','Manage Question Bank (Add / Edit / Delete)'],
  ['ابدأ اختبارًا من بنك الأسئلة','Start a Quiz from the Question Bank'],
  ['تخصصك','your major'], ['جامعتك','your university'],
  ['— اختر التخصص —','— Choose Major —'], ['— اختر الجامعة —','— Choose University —'],
  ['— اختر المادة —','— Choose Course —'], ['المادة','Course'],
  ['طبيعة الأسئلة','Question Type'], ["أسئلة سنوات سابقة","Past Years' Questions"],
  ['أسئلة مراجع','Reference Questions'], ['كلاهما معًا','Both'],
  ['المحاضرات','Lectures'], ['تحديد / إلغاء الكل','Select / Deselect All'],
  ['لا توجد محاضرات مضافة لهذا الكورس بعد.','No lectures have been added to this course yet.'],
  ['سؤال عام غير مرتبط بمحاضرة محددة (يُضاف تلقائيًا)','general question not tied to a specific lecture (added automatically)'],
  ['عدد الأسئلة','Number of Questions'], ['المتاح:','Available:'],
  ['كل الأسئلة','All Questions'],
  ['يمكنك كتابة عدد مخصص للأسئلة (الحد الأقصى 50 سؤالًا)','You can enter a custom number of questions (max 50)'],
  ['طبيعة الاختبار','Quiz Mode'], ['نظام دراسي','Study Mode'],
  ['شاهد الإجابة الصحيحة والتفسير مباشرة بعد كل سؤال','See the correct answer and explanation right after each question'],
  ['نظام اختبار','Exam Mode'],
  ['أجب عن جميع الأسئلة، ثم شاهد نتيجتك النهائية','Answer all questions, then see your final score'],
  ['ابدأ الاختبار','Start Quiz'],
  ['لا توجد أسئلة مطابقة لهذا الاختيار حاليًا.','No questions currently match this selection.'],
  ['لا توجد لديك مواد مشترك بها ضمن هذا التخصص والجامعة. اشترك بكورس من صفحة الدورات أولًا.','You have no subscribed courses in this major and university. Subscribe to a course from the Courses page first.'],
  ['التفسير:','Explanation:'], ['إنهاء والخروج','Finish & Exit'],
  ['إنهاء وعرض النتيجة','Finish & Show Result'], ['السؤال التالي','Next Question'],
  ['نتيجة الاختبار','Quiz Result'],
  ['أداء ممتاز! استمر بالمراجعة 👏','Excellent performance! Keep reviewing 👏'],
  ['لا بأس، راجع الأسئلة أدناه وحاول مجددًا 💪','No worries, review the questions below and try again 💪'],
  ['بدء اختبار جديد','Start New Quiz'], ['صحيح','Correct'], ['خاطئ','Incorrect'],
  ['إجابتك:','Your answer:'], ['لم تُجب','Not answered'], ['الصحيحة:','Correct answer:'],
  ['حفظ','Save'], ['إلغاء','Cancel'], ['تأكيد الحذف','Confirm Delete'],
  ['التخصص','Major'], ['الجامعة','University'], ['ساعات','hours'], ['محاضرة','lecture'],
  ['تعديل','Edit'], ['حذف','Delete'], ['إضافة','Add'], ['عام','General'],
  ['تلخيص محاضرة Highyield','Lecture Highyield Summary'],
  ['ارفع ملف المحاضرة وسنحلل بنك الأسئلة لنبرز أكثر النقاط تكرارًا في الامتحانات','Upload the lecture file and we will analyze the question bank to highlight the most frequently tested points'],
  ['تلخيص محاضرة بالذكاء الاصطناعي','AI Lecture Summary'],
  ['توليد الملخص','Generate Summary'], ['اضغط لرفع ملف المحاضرة','Click to upload the lecture file'],
  ['المادة','Subject'], ['المحاضرة (اختياري — اتركها فارغة لملخص عام على مستوى المادة)','Lecture (optional — leave empty for a subject-level summary)'],
  ['حفظ في ملخصاتي','Save to My Summaries'],
];
const AR2EN_SORTED = I18N_PAIRS.slice().sort((a,b)=>b[0].length-a[0].length);
const EN2AR_SORTED = I18N_PAIRS.map(([ar,en])=>[en,ar]).sort((a,b)=>b[0].length-a[0].length);
function localize(str){
  if(!str) return str;
  const pairs = LANG === 'en' ? AR2EN_SORTED : EN2AR_SORTED;
  let out = str;
  for(const [from,to] of pairs){
    if(from && out.indexOf(from) !== -1) out = out.split(from).join(to);
  }
  return out;
}
function applyLangAttrs(){
  document.documentElement.setAttribute('lang', LANG === 'en' ? 'en' : 'ar');
  document.documentElement.setAttribute('dir', LANG === 'en' ? 'ltr' : 'rtl');
}
function translateSubtree(root){
  if(!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(node=>{
    const tag = node.parentElement ? node.parentElement.tagName : '';
    if(tag === 'SCRIPT' || tag === 'STYLE') return;
    if(node.parentElement && node.parentElement.closest('.i18n-skip')) return;
    if(!node.nodeValue || !node.nodeValue.trim()) return;
    const localized = localize(node.nodeValue);
    if(localized !== node.nodeValue) node.nodeValue = localized;
  });
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>{
    if(el.closest('.i18n-skip')) return;
    ['placeholder','aria-label','title'].forEach(attr=>{
      const v = el.getAttribute(attr);
      if(v){ const lv = localize(v); if(lv !== v) el.setAttribute(attr, lv); }
    });
  });
}
async function setLanguage(lang){
  LANG = (lang === 'en') ? 'en' : 'ar';
  applyLangAttrs();
  await setData('language', LANG, false);
  await render();
  translateSubtree(document.body);
}

async function syncSessionFromAuth(){
  if(!supabaseClient){ state.session = null; return; }
  try{
    const { data } = await supabaseClient.auth.getSession();
    const authUser = data && data.session ? data.session.user : null;
    if(!authUser){ state.session = null; return; }
    const meta = authUser.user_metadata || {};
    if(meta.role === 'admin'){
      state.session = {
        type: 'admin',
        username: meta.username || (authUser.email||'').split('@')[0],
        name: meta.fullName || 'مشرف المنصة',
      };
    } else if(meta.role === 'teacher'){
      state.session = {
        type: 'teacher',
        teacherId: authUser.id,
        username: meta.username || (authUser.email||'').split('@')[0],
        name: meta.fullName || 'مدرّس',
      };
    } else {
      const phone = meta.phone || (authUser.email||'').split('@')[0];
      const allowed = await enforceDeviceLock(phone, authUser.id);
      if(!allowed){ state.session = null; return; }
      state.session = {
        type: 'student',
        phone,
        name: meta.fullName || 'مستخدم',
        university: meta.university || null,
        major: meta.major || null,
        avatar: meta.avatar || null,
      };
      if(state.session.university) state.courseFilter = state.session.university;
      if(state.session.major) state.majorFilter = state.session.major;
      watchDeviceLock(phone);
    }
  }catch(e){ state.session = null; }
}

/* يدعم المحاضرات القديمة (رابط فيديو واحد + ملف واحد) ويحوّلها تلقائيًا
   لقوائم videos[] / files[] بحيث يقدر المشرف يضيف أكثر من فيديو أو ملف. */
function normalizeLecture(l){
  let videos = Array.isArray(l.videos) ? l.videos.filter(v=>v && v.url) : [];
  let files = Array.isArray(l.files) ? l.files.filter(f=>f && f.url) : [];
  if(!videos.length && l.videoUrl) videos = [{ label:'', url:l.videoUrl }];
  if(!files.length && l.fileUrl) files = [{ label:'', url:l.fileUrl }];
  const section = SECTIONS.includes(l.section) ? l.section : 'first';
  return Object.assign({}, l, { videos, files, section });
}

/* يبني خريطة أسعار لكل قسم (فيرست/ميد/فاينال) من بيانات الكورس، وقائمة الأقسام
   الفعلية المفعّلة لهذه المادة (بعض المواد فيها ميد وفاينال بس مثلًا بدون فيرست).
   للكورسات القديمة التي عندها isFree فقط أو بدون sections محفوظة، تُعتبر الأقسام الثلاثة كلها مفعّلة. */
function normalizeCourse(c){
  const legacy = !!c.isFree;
  const p = (c.pricing && typeof c.pricing === 'object') ? c.pricing : null;
  const pricing = {
    first: p ? !!p.first : legacy,
    mid:   p ? !!p.mid   : legacy,
    final: p ? !!p.final : legacy,
  };
  const sections = (Array.isArray(c.sections) && c.sections.length)
    ? c.sections.filter(s=>SECTIONS.includes(s))
    : SECTIONS.slice();
  return Object.assign({}, c, { pricing, sections: sections.length ? sections : SECTIONS.slice() });
}

/* الأقسام المفعّلة لهذه المادة بالتحديد (وليس كل الأقسام الثلاثة دائمًا) */
function courseSections(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  if(!course) return SECTIONS;
  return (Array.isArray(course.sections) && course.sections.length) ? course.sections : SECTIONS;
}

/* كل هذه المفاتيح مخزّنة كصفوف منفصلة بنفس جدول medora_data (key/value)،
   فبدل 14 استعلام select منفصل (واحد لكل مفتاح عبر getData)، نجيبهم كلهم
   بطلب واحد via `.in('key', [...])` ثم نوزّع النتائج محليًا. */
const INIT_DATA_KEYS = ['courses','lectures','questions','students','messages','enrollments',
  'summaries','lectureProgress','content','savedQuestions','design','coupons','notifications','teachers'];
async function fetchInitDataBulk(){
  if(!supabaseClient) return {};
  try{
    const { data, error } = await supabaseClient.from('medora_data').select('key,value').in('key', INIT_DATA_KEYS);
    if(error || !data) return {};
    const map = {};
    data.forEach(row=>{ map[row.key] = row.value; });
    return map;
  }catch(e){ console.error('fetchInitDataBulk failed', e); return {}; }
}
async function initData(){
  const FALLBACKS = {
    courses: SEED_COURSES, lectures: SEED_LECTURES, questions: SEED_QUESTIONS,
    students: [], messages: [], enrollments: [], summaries: [], lectureProgress: [],
    content: {}, savedQuestions: [], design: DESIGN_DEFAULTS, coupons: [], notifications: [], teachers: []
  };
  const [bulk] = await Promise.all([
    fetchInitDataBulk(),
    syncSessionFromAuth(),
  ]);
  const pick = k => Object.prototype.hasOwnProperty.call(bulk, k) ? bulk[k] : FALLBACKS[k];
  state.courses = pick('courses').map(normalizeCourse); state.lectures = pick('lectures').map(normalizeLecture); state.questions = pick('questions');
  state.students = pick('students'); state.messages = pick('messages'); state.enrollments = pick('enrollments'); state.summaries = pick('summaries');
  state.teachers = Array.isArray(pick('teachers')) ? pick('teachers') : [];
  state.lectureProgress = pick('lectureProgress');
  state.savedQuestions = Array.isArray(pick('savedQuestions')) ? pick('savedQuestions') : [];
  state.coupons = Array.isArray(pick('coupons')) ? pick('coupons') : [];
  state.notifications = Array.isArray(pick('notifications')) ? pick('notifications') : [];
  state.content = Object.assign({}, CONTENT_DEFAULTS, pick('content'));
  state.design = Object.assign({}, DESIGN_DEFAULTS, pick('design'));
  state.loaded = true;
}

/* =========================================================
   إشعارات المشرف للطلاب — تُخزَّن مشتركة (shared=true) في مفتاح 'notifications'.
   كل إشعار له هدف (target): all (كل الطلاب) / university / major / phones (أرقام محددة).
   حالة "مقروء" شخصية بحتة، فتُخزَّن محليًا على جهاز كل طالب فقط (shared=false). ========================================================= */
function notificationAppliesToStudent(n, session){
  if(!session || session.type !== 'student') return false;
  if(n.target === 'all') return true;
  if(n.target === 'university') return session.university && session.university === n.targetValue;
  if(n.target === 'major') return session.major && session.major === n.targetValue;
  if(n.target === 'phones') return Array.isArray(n.targetValue) && n.targetValue.includes(session.phone);
  if(n.target === 'course') return state.enrollments.some(e=> e.phone===session.phone && e.courseId===n.targetValue);
  return false;
}
function studentNotifications(){
  if(!state.session || state.session.type !== 'student') return [];
  return state.notifications
    .filter(n=> notificationAppliesToStudent(n, state.session))
    .slice().sort((a,b)=> b.createdAt - a.createdAt);
}
function readNotifIds(){
  if(!state.session || state.session.type !== 'student') return new Set();
  try{
    const raw = localStorage.getItem('medora_local_readNotifs_'+state.session.phone);
    return new Set(raw ? JSON.parse(raw) : []);
  }catch(e){ return new Set(); }
}
function markAllNotifsRead(ids){
  if(!state.session || state.session.type !== 'student' || !ids.length) return;
  const set = readNotifIds();
  ids.forEach(id=> set.add(id));
  localStorage.setItem('medora_local_readNotifs_'+state.session.phone, JSON.stringify([...set]));
}
function notifTargetLabel(n){
  if(n.target === 'all') return 'كل الطلاب';
  if(n.target === 'university') return `جامعة: ${n.targetValue}`;
  if(n.target === 'major') return `تخصص: ${n.targetValue}`;
  if(n.target === 'phones') return `${(n.targetValue||[]).length} رقم محدد`;
  if(n.target === 'course'){
    const c = state.courses.find(cc=>cc.id===n.targetValue);
    return `🎓 مشتركو مادة: ${c ? c.title : '(مادة محذوفة)'}`;
  }
  return '';
}
function renderNotifPanel(){
  const listEl = document.getElementById('notifDynamicList');
  const badgeEl = document.getElementById('notifBadge');
  if(!listEl) return;
  const isStudent = state.session && state.session.type === 'student';
  if(!isStudent){
    listEl.innerHTML = '';
    return;
  }
  const items = studentNotifications();
  const readSet = readNotifIds();
  const unread = items.filter(n=> !readSet.has(n.id));
  if(badgeEl) badgeEl.style.display = unread.length ? '' : 'none';
  listEl.innerHTML = items.length ? items.slice(0,20).map(n=> `
    <button class="notif-item" data-notif-id="${escapeHtml(n.id)}">
      <span class="notif-item-icon">${readSet.has(n.id) ? '🔔' : '🔴'}</span>
      <span class="notif-item-text">
        <span class="notif-item-title">${escapeHtml(n.title)}</span>
        <span class="notif-item-desc">${escapeHtml((n.body||'').slice(0,70))}${(n.body||'').length>70?'…':''}</span>
      </span>
    </button>`).join('') : '';
}
function openNotifItem(id){
  const n = state.notifications.find(x=>x.id===id);
  if(!n) return;
  markAllNotifsRead([id]);
  renderNotifPanel();
  openModal(`
    <h3>🔔 ${escapeHtml(n.title)}</h3>
    <p style="white-space:pre-wrap; color:var(--text); font-size:14.5px; margin:10px 0;">${escapeHtml(n.body)}</p>
    <p class="hint" style="font-size:12px;">${new Date(n.createdAt).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'})}</p>
    <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إغلاق</button></div>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
}
(function bindNotifDelegation(){
  const listEl = document.getElementById('notifDynamicList');
  if(listEl) listEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-notif-id]');
    if(btn) openNotifItem(btn.dataset.notifId);
  });
})();

/* ---------------- Enrollment helpers ----------------
   كل تفعيل (enrollment) مرتبط بكورس + قسم (section) محدد، بحيث يقدر الطالب
   يشترك بقسم الفيرست بس مثلًا. الاشتراكات القديمة (بدون section) تُعتبر
   تفعيلًا للكورس بالكامل حفاظًا على وصول الطلاب المفعّلين مسبقًا. */
function isEnrolledSection(courseId, section){
  if(!state.session || state.session.type !== 'student') return false;
  const phone = state.session.phone;
  return state.enrollments.some(e=> e.courseId===courseId && e.phone===phone && (!e.section || e.section===section));
}
function sectionUnlocked(courseId, section){
  const isAdmin = state.session && state.session.type === 'admin';
  if(isAdmin) return true;
  if(isTeacherSession() && isCourseOwnerTeacher(state.courses.find(c=>c.id===courseId))) return true;
  return isEnrolledSection(courseId, section);
}
function enrollmentsForSection(courseId, section){
  return state.enrollments.filter(e=> e.courseId===courseId && (e.section===section || !e.section));
}
async function selfEnrollSection(courseId, section){
  if(!state.session || state.session.type !== 'student') return;
  const phone = state.session.phone;
  if(isEnrolledSection(courseId, section)) return;
  state.enrollments.push({ courseId, phone, section });
  await setData('enrollments', state.enrollments, true);
  render();
}

/* ---------------- Coupons (كوبونات الخصم/الفتح المجاني) ----------------
   كل كوبون مرتبط بكورس، وإما بقسم محدد ضمنه (فيرست/ميد/فاينال) أو بكل أقسامه.
   نوعان: free (يفتح الوصول تلقائيًا فور إدخال الكود) أو discount (رسالة توضيحية
   بنسبة خصم، لأن المنصة ما فيها دفع إلكتروني والتفعيل يصير يدويًا من الإدارة).
   maxUses=null تعني بدون حد أقصى لعدد مرات الاستخدام. usedBy تتبع كل طالب استخدم
   الكوبون (رقم هاتفه ووقت الاستخدام) لمنع نفس الطالب من استخدامه أكثر من مرة. */
function generateCouponCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for(let i=0;i<8;i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}
function findCouponByCode(code){
  const norm = (code||'').trim().toUpperCase();
  return state.coupons.find(c=>c.code===norm);
}
function couponUsesLeft(coupon){
  if(coupon.maxUses==null) return Infinity;
  return Math.max(0, coupon.maxUses - (coupon.usedBy||[]).length);
}
function hasStudentUsedCoupon(coupon, phone){
  return (coupon.usedBy||[]).some(u=>u.phone===phone);
}
/* صلاحية الكوبون: expiresAt هو timestamp (مللي ثانية) أو null لكوبون بدون تاريخ انتهاء. */
function isCouponExpired(coupon){
  return coupon.expiresAt != null && Date.now() > coupon.expiresAt;
}
/* رقم تسلسلي فريد لبطاقة الخصم، مبني من كود الكوبون + رقم هاتف الطالب + لحظة
   الاستخدام بالضبط + "ملح" ثابت داخل الكود. لا يمكن لأحد توليد نفس الرقم بدون
   معرفة هذه القيم الثلاث، وأي رقم مزوَّر لن يطابق ما هو مخزَّن فعليًا ضمن سجل
   استخدامات الكوبون (usedBy) الذي يراه المشرف من لوحة التحكم — فتصبح عملية
   التحقق أن يقارن الدعم الفني الرقم الموجود على البطاقة المُرسلة مع الرقم
   المخزَّن في usedBy لنفس الكوبون. */
function computeCouponSerial(code, phone, usedAt){
  const raw = `${code}|${phone}|${usedAt}|MEDORA-CARD-SALT-v1`;
  let hash = 5381;
  for(let i=0;i<raw.length;i++){ hash = ((hash*33) ^ raw.charCodeAt(i)) >>> 0; }
  return 'MED-' + hash.toString(36).toUpperCase().padStart(7,'0');
}
async function redeemCoupon(rawCode, chosenCourseId){
  if(!state.session || state.session.type !== 'student') return { ok:false, msg:'سجّل الدخول كطالب أولًا لاستخدام كوبون.' };
  const code = (rawCode||'').trim().toUpperCase();
  if(!code) return { ok:false, msg:'أدخل كود الكوبون.' };
  const coupon = findCouponByCode(code);
  if(!coupon || !coupon.active) return { ok:false, msg:'كود الكوبون غير صحيح أو غير مفعّل.' };
  if(isCouponExpired(coupon)) return { ok:false, msg:'انتهت صلاحية هذا الكوبون ولم يعد قابلًا للاستخدام.' };
  if(couponUsesLeft(coupon) <= 0) return { ok:false, msg:'تم استنفاد عدد مرات استخدام هذا الكوبون.' };
  const phone = state.session.phone;
  if(hasStudentUsedCoupon(coupon, phone)) return { ok:false, msg:'لقد استخدمت هذا الكوبون مسبقًا.' };

  // كوبون "المادة من اختيار الطالب": ما فيه courseId مخزَّن على الكوبون نفسه،
  // فلازم الطالب يحدد المادة أولًا قبل ما نكمل التفعيل
  if(!coupon.courseId && !chosenCourseId){
    return { ok:false, needsCourseChoice:true, msg:'هذا الكوبون يتيح لك اختيار المادة بنفسك — اختر المادة أدناه ثم أكمل التفعيل.' };
  }
  const targetCourseId = coupon.courseId || chosenCourseId;
  const course = state.courses.find(c=>c.id===targetCourseId);
  if(!course) return { ok:false, msg:'المادة المطلوبة لم تعد متاحة، اختر مادة أخرى.' };
  if(!coupon.courseId){
    // كوبون اختيار الطالب: تأكد أن المادة المختارة تتبع جامعة/تخصص الطالب فعلًا
    const studentUni = state.session.university, studentMajor = state.session.major;
    const matches = (!studentUni || course.university === studentUni || course.university === 'عام')
      && (!studentMajor || (course.major || 'التمريض') === studentMajor);
    if(!matches) return { ok:false, msg:'هذه المادة ليست ضمن جامعتك أو تخصصك.' };
  }
  // إذا كان الكوبون محدَّدًا بقسم معيّن (فيرست/ميد/فاينال)، تأكد أن المادة
  // المستهدفة (سواء ثابتة أو من اختيار الطالب) فيها هذا القسم أصلًا
  if(coupon.section && !courseSections(targetCourseId).includes(coupon.section)){
    return { ok:false, msg:`قسم ${SECTION_LABELS[coupon.section]} غير متوفر في هذه المادة، جرّب مادة أخرى أو تواصل مع الإدارة.` };
  }
  const section = coupon.section || null;
  const targetLabel = section ? `قسم ${SECTION_LABELS[section]} من مادة "${course.title}"` : `مادة "${course.title}" بكل أقسامها`;
  let msg, card = null;
  const usedAt = Date.now();
  if(coupon.type === 'free'){
    const sections = section ? [section] : courseSections(targetCourseId);
    let addedAny = false;
    sections.forEach(s=>{
      if(!isEnrolledSection(targetCourseId, s)){
        state.enrollments.push({ courseId: targetCourseId, phone, section: s });
        addedAny = true;
      }
    });
    if(addedAny) await setData('enrollments', state.enrollments, true);
    msg = `🎉 تم فتح ${targetLabel} مجانًا في حسابك مباشرة!`;
  } else {
    msg = `🏷️ كوبونك يمنحك خصم ${coupon.discountPercent}% على ${targetLabel}. حمّل بطاقة الخصم أدناه وأرسلها للدعم الفني لإتمام تفعيل اشتراكك بالخصم.`;
    const serial = computeCouponSerial(coupon.code, phone, usedAt);
    card = {
      studentName: state.session.name || '',
      phone,
      discountPercent: coupon.discountPercent,
      courseTitle: course.title,
      targetLabel,
      serial,
      code: coupon.code,
      issuedAt: usedAt,
    };
  }
  coupon.usedBy = coupon.usedBy || [];
  const usedByEntry = { phone, usedAt, courseId: targetCourseId };
  if(card) usedByEntry.serial = card.serial;
  coupon.usedBy.push(usedByEntry);
  await setData('coupons', state.coupons, true);
  return { ok:true, msg, card };
}

/* يلفّ نصًا عربيًا داخل عرض أقصى معيّن على الكانفاس، سطرًا سطرًا (استخدام بسيط
   لكتابة الأسطر الطويلة مثل اسم المادة داخل بطاقة الخصم). */
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
  const words = (text||'').split(' ');
  let line = '', curY = y;
  words.forEach(word=>{
    const test = line ? line + ' ' + word : word;
    if(line && ctx.measureText(test).width > maxWidth){
      ctx.fillText(line, x, curY);
      line = word; curY += lineHeight;
    } else {
      line = test;
    }
  });
  if(line) ctx.fillText(line, x, curY);
  return curY;
}

/* يبني بطاقة الخصم كصورة PNG عبر canvas (اسم الطالب، رقمه، نسبة الخصم، اسم
   المادة، شعار MEDORA أسفل يمين البطاقة، ونقش أمان قطري متكرر بشفافية خفيفة
   جدًا في الخلفية) ويعيد رابط الصورة (data URL) بدل تحميلها مباشرة، حتى يقدر
   الطالب يشوف البطاقة على الشاشة أولًا قبل تحميلها. الرقم التسلسلي المطبوع
   على البطاقة (card.serial) محسوب مسبقًا في redeemCoupon من كود الكوبون +
   رقم الهاتف + لحظة الاستخدام، ومخزَّن أيضًا في usedBy؛ فالمشرف يقارنه مع
   القيمة المخزَّنة قبل قبول أي بطاقة، ما يمنع تزوير بطاقات مشابهة. */
async function buildCouponCardDataUrl(card){
  try{ if(document.fonts && document.fonts.ready) await document.fonts.ready; }catch(e){}
  const W = 1000, H = 620;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0,0,W,H);
  bgGrad.addColorStop(0,'#0f2745');
  bgGrad.addColorStop(1,'#177a8c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0,0,W,H);

  const pad = 30, radius = 24;
  const px=pad, py=pad, pw=W-pad*2, ph=H-pad*2;
  const roundRectPath = (x,y,w,h,r)=>{
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  };

  ctx.save();
  roundRectPath(px,py,pw,ph,radius);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();

  /* نقش أمان: كلمة MEDORA متكررة قطريًا بشفافية خفيفة جدًا فوق كامل البطاقة،
     نفس فكرة الهلامة المائية المستخدمة في حماية بنك الأسئلة داخل المنصة. */
  ctx.save();
  ctx.translate(px+pw/2, py+ph/2);
  ctx.rotate(-22*Math.PI/180);
  ctx.fillStyle = 'rgba(15,39,69,0.045)';
  ctx.font = '800 28px Cairo, sans-serif';
  ctx.textAlign = 'center';
  for(let yy=-ph; yy<=ph; yy+=58){
    for(let xx=-pw; xx<=pw; xx+=210){
      ctx.fillText('MEDORA', xx, yy);
    }
  }
  ctx.restore();

  ctx.fillStyle = '#177a8c';
  ctx.fillRect(px, py, pw, 64);
  ctx.direction = 'rtl'; ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px Cairo, sans-serif';
  ctx.fillText('🏷️ بطاقة خصم', px+pw-26, py+40);
  ctx.direction = 'ltr'; ctx.textAlign = 'left';
  ctx.font = '700 15px monospace';
  ctx.fillText(card.code, px+26, py+40);

  ctx.direction='rtl'; ctx.textAlign='right';
  ctx.fillStyle = '#0f2745';
  ctx.font = '800 30px Cairo, sans-serif';
  ctx.fillText(card.studentName || '—', px+pw-40, py+140);
  ctx.fillStyle = '#5c7185';
  ctx.font = '600 20px Cairo, sans-serif';
  ctx.direction='ltr'; ctx.textAlign='right';
  ctx.fillText(card.phone || '—', px+pw-40, py+175);

  const circR = 65, circX = px+125, circY = py+270;
  ctx.beginPath();
  ctx.arc(circX, circY, circR, 0, Math.PI*2);
  ctx.fillStyle = '#e6f4f6';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#177a8c';
  ctx.stroke();
  ctx.fillStyle = '#177a8c';
  ctx.textAlign = 'center'; ctx.direction='ltr';
  ctx.font = '800 32px Cairo, sans-serif';
  ctx.fillText(`${card.discountPercent}%`, circX, circY+2);
  ctx.font = '700 15px Cairo, sans-serif';
  ctx.direction='rtl';
  ctx.fillText('خصم', circX, circY+28);

  ctx.direction='rtl'; ctx.textAlign='right';
  ctx.fillStyle = '#16232f';
  ctx.font = '700 19px Cairo, sans-serif';
  wrapCanvasText(ctx, card.targetLabel, px+pw-40, py+250, pw-280, 26);

  ctx.fillStyle = '#5c7185';
  ctx.font = '600 15px Cairo, sans-serif';
  wrapCanvasText(ctx, 'حمّل هذه البطاقة وأرسلها إلى الدعم الفني لإتمام تفعيل اشتراكك بالخصم.', px+pw-40, py+400, pw-80, 22);

  ctx.strokeStyle = '#e1e8ee';
  ctx.beginPath();
  ctx.moveTo(px+26, py+ph-90);
  ctx.lineTo(px+pw-26, py+ph-90);
  ctx.stroke();

  ctx.direction='rtl'; ctx.textAlign='left';
  ctx.fillStyle = '#5c7185';
  ctx.font = '600 13px Cairo, sans-serif';
  ctx.fillText('الرقم التسلسلي للتحقق:', px+26, py+ph-56);
  ctx.fillStyle = '#0f2745';
  ctx.font = '800 20px monospace';
  ctx.direction='ltr'; ctx.textAlign='left';
  ctx.fillText(card.serial, px+26, py+ph-28);

  ctx.textAlign='right'; ctx.direction='ltr';
  ctx.fillStyle = '#177a8c';
  ctx.font = '800 24px "Playfair Display", serif';
  ctx.fillText('MEDORA', px+pw-26, py+ph-32);
  ctx.fillStyle = '#5c7185';
  ctx.font = '600 12px Cairo, sans-serif';
  ctx.direction='rtl';
  ctx.fillText('منصتك نحو التفوق', px+pw-26, py+ph-12);

  ctx.restore();

  roundRectPath(px,py,pw,ph,radius);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

/* يعرض بطاقة الخصم كصورة داخل صندوق الرسائل مباشرة بعد تفعيل الكوبون بنجاح،
   مع رابط تحميل حقيقي (a[download]) تحت الصورة كي يحفظها الطالب ويرسلها
   للدعم الفني. */
async function renderCouponCardPreview(card, container){
  if(!card || !container) return;
  container.insertAdjacentHTML('beforeend', `<div id="couponCardPreviewWrap" style="margin-top:14px; text-align:center;"><span class="loading-dot"></span> جارِ تجهيز البطاقة...</div>`);
  let dataUrl;
  try{
    dataUrl = await buildCouponCardDataUrl(card);
  }catch(err){
    const wrap = document.getElementById('couponCardPreviewWrap');
    if(wrap) wrap.innerHTML = `<div class="form-msg error">تعذّر إنشاء بطاقة الخصم. جرّب مرة أخرى.</div>`;
    return;
  }
  const wrap = document.getElementById('couponCardPreviewWrap');
  if(!wrap) return;
  wrap.innerHTML = `
    <img src="${dataUrl}" alt="بطاقة الخصم" style="max-width:100%; width:520px; border-radius:16px; box-shadow:0 8px 24px rgba(15,39,69,0.25);">
    <div style="margin-top:10px;">
      <a href="${dataUrl}" download="MEDORA-discount-card-${card.serial}.png" class="btn teal solid small">${ICONS.download} تحميل البطاقة</a>
    </div>`;
}
/* نسخة قديمة تبقى متاحة لأي استدعاء آخر يحتاج تحميلًا مباشرًا بدون معاينة. */
async function downloadCouponCard(card){
  if(!card) return;
  const dataUrl = await buildCouponCardDataUrl(card);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `MEDORA-discount-card-${card.serial}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------------- My Notes (الأسئلة المحفوظة) ----------------
   يقدر الطالب يحفظ أي سؤال أثناء حل الاختبار أو مراجعة النتيجة، وتنعرض له
   كل أسئلته المحفوظة في قسم "My Notes" بأعلى صفحة بنك الأسئلة. الحفظ مربوط
   برقم هاتف الطالب فقط، فكل طالب يشوف أسئلته المحفوظة هو بس. */
function isQuestionSaved(questionId){
  if(!state.session || state.session.type !== 'student') return false;
  const phone = state.session.phone;
  return state.savedQuestions.some(s=> s.phone===phone && s.questionId===questionId);
}
async function toggleSaveQuestion(questionId){
  if(!state.session || state.session.type !== 'student') return;
  const phone = state.session.phone;
  const idx = state.savedQuestions.findIndex(s=> s.phone===phone && s.questionId===questionId);
  if(idx > -1) state.savedQuestions.splice(idx, 1);
  else state.savedQuestions.push({ phone, questionId, savedAt: Date.now() });
  await setData('savedQuestions', state.savedQuestions, true);
}
function mySavedQuestions(){
  if(!state.session || state.session.type !== 'student') return [];
  const phone = state.session.phone;
  const ids = state.savedQuestions.filter(s=> s.phone===phone).map(s=> s.questionId);
  return ids.map(id => state.questions.find(q=> q.id===id)).filter(Boolean);
}

/* الكورس "مفعّل" (لغايات كرت القوائم) إذا كان للطالب أي تفعيل ضمنه، بغض النظر عن القسم */
function isEnrolled(courseId){
  if(!state.session || state.session.type !== 'student') return false;
  return state.enrollments.some(e=> e.courseId===courseId && e.phone===state.session.phone);
}
function courseUnlocked(courseId){
  const isAdmin = state.session && state.session.type === 'admin';
  if(isAdmin) return true;
  if(isTeacherSession() && isCourseOwnerTeacher(state.courses.find(c=>c.id===courseId))) return true;
  return isEnrolled(courseId);
}
function courseFullyUnlocked(courseId){
  const isAdmin = state.session && state.session.type === 'admin';
  if(isAdmin) return true;
  return courseSections(courseId).every(s=>sectionUnlocked(courseId, s));
}
function enrollmentsFor(courseId){
  return state.enrollments.filter(e=>e.courseId===courseId);
}
function courseIsAllFree(course){
  return courseSections(course.id).every(s=>course.pricing[s]);
}
function courseIsAllPaid(course){
  return courseSections(course.id).every(s=>!course.pricing[s]);
}

/* ---------------- تتبّع تقدّم الطالب (المحاضرات التي "شاهدها") ----------------
   كل سجل: { phone, lectureId }. يحدّده الطالب بنفسه بزر "تمت المشاهدة" داخل المحاضرة،
   ويُستخدم لحساب نسبة التقدم في كل دورة ضمن صفحة "دوراتي". */
function isLectureWatched(lectureId){
  if(!state.session || state.session.type !== 'student') return false;
  const phone = state.session.phone;
  return state.lectureProgress.some(p=> p.phone===phone && p.lectureId===lectureId);
}
async function toggleLectureWatched(lectureId){
  if(!state.session || state.session.type !== 'student') return;
  const phone = state.session.phone;
  const idx = state.lectureProgress.findIndex(p=> p.phone===phone && p.lectureId===lectureId);
  if(idx > -1) state.lectureProgress.splice(idx, 1);
  else state.lectureProgress.push({ phone, lectureId });
  await setData('lectureProgress', state.lectureProgress, true);
}
/* نسبة تقدّم الطالب الحالي بدورة معيّنة: عدد المحاضرات المشاهَدة من إجمالي محاضرات الدورة */
function courseProgress(courseId){
  if(!state.session || state.session.type !== 'student') return { watched:0, total:0, pct:0 };
  const phone = state.session.phone;
  const courseLectures = state.lectures.filter(l=>l.courseId===courseId);
  const total = courseLectures.length;
  const watched = courseLectures.filter(l=> state.lectureProgress.some(p=> p.phone===phone && p.lectureId===l.id)).length;
  const pct = total ? Math.round((watched/total)*100) : 0;
  return { watched, total, pct };
}

function majorEmblem(major){
  return major === 'طب الأسنان' ? '🦷' : '🩺';
}

function priceBadgeHtml(c, isAdmin){
  if(isAdmin){
    if(courseIsAllFree(c)) return `<span class="lecture-tier-tag">🆓 مجاني</span>`;
    if(courseIsAllPaid(c)) return `<span class="lecture-tier-tag locked">💳 مدفوع</span>`;
    return `<span class="lecture-tier-tag locked">🆓💳 أسعار متعددة حسب القسم</span>`;
  }
  if(courseFullyUnlocked(c.id)) return `<span class="lecture-tier-tag">✅ مفعّل بالكامل</span>`;
  if(courseUnlocked(c.id)) return `<span class="lecture-tier-tag">✅ مفعّل جزئيًا</span>`;
  if(courseIsAllFree(c)) return `<span class="lecture-tier-tag">🆓 مجاني</span>`;
  if(courseIsAllPaid(c)) return `<span class="lecture-tier-tag locked">💳 مدفوع</span>`;
  return `<span class="lecture-tier-tag locked">🆓💳 أسعار متعددة حسب القسم</span>`;
}

/* الاشتراك صار على مستوى كل قسم (فيرست/ميد/فاينال) وليس الكورس ككل،
   فزر الاشتراك بيوجّه الطالب لصفحة الكورس ليختار القسم المطلوب من هناك. */
function courseSubscribeActionHtml(c, isAdmin){
  if(isAdmin) return '';
  if(courseFullyUnlocked(c.id)) return '';
  if(!state.session || state.session.type !== 'student'){
    return `<a href="/login" class="btn small">سجّل الدخول للاشتراك</a>`;
  }
  return '';
}

/* ---------------- Quiz wizard state ---------------- */
let quiz = { step:'setup', university:null, major:null, courseId:null, selectedLectures:null, count:10, nature:'both', mode:'study', pool:[], idx:0, answers:{}, revealed:{}, revealedWritten:{} };
function resetQuiz(){ quiz = { step:'setup', university:null, major:null, courseId:null, selectedLectures:null, count:10, nature:'both', mode:'study', pool:[], idx:0, answers:{}, revealed:{}, revealedWritten:{} }; }

/* ---------------- Router ---------------- */
function currentRoute(){
  const path = location.pathname.replace(/^\/+/, '');
  return path || 'home';
}
function navigate(route){
  const target = '/' + route;
  if(location.pathname !== target){
    history.pushState(null, '', target);
  }
  render();
}
/* اعتراض كل نقرات الروابط الداخلية (href="/...") ومنع تحميل الصفحة بالكامل،
   لتبقى التنقلات سريعة عبر History API بدل ريلود من السيرفر في كل مرة.
   الروابط الخارجية، وروابط mailto/tel، والروابط التي فيها target="_blank"
   أو data-external أو Ctrl/Cmd/Shift/middle-click تُترك لسلوكها الطبيعي. */
document.addEventListener('click', function(e){
  const a = e.target.closest('a[href]');
  if(!a) return;
  if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if(a.target && a.target !== '' && a.target !== '_self') return;
  if(a.hasAttribute('download') || a.hasAttribute('data-external')) return;
  const href = a.getAttribute('href') || '';
  if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
  let url;
  try{ url = new URL(href, location.href); }catch(err){ return; }
  if(url.origin !== location.origin) return;
  e.preventDefault();
  navigate(url.pathname.replace(/^\/+/, '') + url.search);
});
window.addEventListener('popstate', render);
function scrollToCourseCanvas(){
  const el = document.getElementById('courseCanvas') || document.querySelector('.courses-hero');
  if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
}
function scrollToQuizTop(){
  const el = document.querySelector('.wizard-card') || document.querySelector('.wizard-wrap');
  if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  else window.scrollTo({top:0, behavior:'smooth'});
}
window.addEventListener('hashchange', render);

/* ---------------- Render: shell (nav state) ---------------- */
function renderNavState(){
  const route = currentRoute();
  const navRoute = route.startsWith('course/') ? 'courses' : route;
  document.querySelectorAll('nav.links a').forEach(a=> a.classList.remove('active'));
  const activeLink = document.querySelector(`nav.links a[data-route="${navRoute}"]`);
  if(activeLink) activeLink.classList.add('active');

  const userArea = document.getElementById('navUserArea');
  const loginLink = document.getElementById('navLoginLink');
  const myCoursesLink = document.getElementById('navMyCoursesLink');
  const myTeachCoursesLink = document.getElementById('navMyTeachCoursesLink');
  const bankLink = document.getElementById('navBankLink');
  const studentSpaceLink = document.getElementById('navStudentSpaceLink');
  const analyticsLink = document.getElementById('navAnalyticsLink');
  const couponsLink = document.getElementById('navCouponsLink');

  if(state.session && state.session.type === 'student'){
    loginLink.classList.add('hidden');
    myCoursesLink.classList.add('hidden');
    myTeachCoursesLink.classList.add('hidden');
    bankLink.classList.add('hidden');
    studentSpaceLink.classList.remove('hidden');
    analyticsLink.classList.add('hidden');
    couponsLink.classList.add('hidden');
    const uniSuffix = state.session.university ? ` — ${state.session.university}` : '';
    const avatarImg = state.session.avatar ? `<img src="${state.session.avatar}" class="user-pill-avatar" alt="">` : '👋';
    userArea.innerHTML = `<span class="user-pill">${avatarImg} <span>${escapeHtml(state.session.name + uniSuffix)}</span></span><button class="btn small" id="logoutBtn">خروج</button>`;
  } else if(state.session && state.session.type === 'admin'){
    loginLink.classList.add('hidden');
    myCoursesLink.classList.add('hidden');
    myTeachCoursesLink.classList.add('hidden');
    bankLink.classList.remove('hidden');
    studentSpaceLink.classList.add('hidden');
    analyticsLink.classList.remove('hidden');
    couponsLink.classList.remove('hidden');
    userArea.innerHTML = `<span class="user-pill"><span>🛡️ ${escapeHtml(state.session.name)}</span> <span class="admin-tag">مشرف</span></span><button class="btn small" id="logoutBtn">خروج</button>`;
  } else if(state.session && state.session.type === 'teacher'){
    loginLink.classList.add('hidden');
    myCoursesLink.classList.add('hidden');
    myTeachCoursesLink.classList.remove('hidden');
    bankLink.classList.remove('hidden');
    studentSpaceLink.classList.add('hidden');
    analyticsLink.classList.add('hidden');
    couponsLink.classList.add('hidden');
    userArea.innerHTML = `<span class="user-pill"><span>👨‍🏫 ${escapeHtml(state.session.name)}</span> <span class="admin-tag">مدرّس</span></span><button class="btn small" id="logoutBtn">خروج</button>`;
  } else {
    loginLink.classList.remove('hidden');
    myCoursesLink.classList.add('hidden');
    myTeachCoursesLink.classList.add('hidden');
    bankLink.classList.add('hidden');
    studentSpaceLink.classList.add('hidden');
    analyticsLink.classList.add('hidden');
    couponsLink.classList.add('hidden');
    userArea.innerHTML = '';
  }
  const lb = document.getElementById('logoutBtn');
  if(lb) lb.addEventListener('click', logout);

  // إخفاء روابط بنك الأسئلة في التذييل والصفحة الرئيسية للزوار غير المسجّلين
  const isLoggedIn = !!state.session;
  const footerBankLinkEl = document.getElementById('footerBankLink');
  if(footerBankLinkEl) footerBankLinkEl.classList.toggle('hidden', !isLoggedIn);
  const heroBankLinkEl = document.getElementById('heroBankLink');
  if(heroBankLinkEl) heroBankLinkEl.classList.toggle('hidden', !isLoggedIn);

  const footerDesc = document.getElementById('footerDescText');
  if(footerDesc) footerDesc.innerHTML = `${cval('footer_desc')}${editBtn('footer_desc')}`;
  const footerCopy = document.getElementById('footerCopyText');
  if(footerCopy) footerCopy.innerHTML = `${cval('footer_copy')}${editBtn('footer_copy')}`;

  const bannerWrap = document.getElementById('adminBannerWrap');
  if(state.session && state.session.type === 'admin'){
    bannerWrap.innerHTML = `<div class="admin-banner">
        <span>🛡️ أنت الآن في وضع المشرف — يمكنك إضافة أو حذف الدورات والمحاضرات والأسئلة مباشرة من الصفحات.</span>
        <a href="/admin-analytics" class="btn small" style="border-color:#fff;color:#fff;">📊 التحليلات</a>
        <a href="/admin-coupons" class="btn small" style="border-color:#fff;color:#fff;">🎟️ الكوبونات</a>
        <button class="btn small" style="border-color:#fff;color:#fff;" id="bannerDesignBtn">🎨 تصميم الموقع</button>
        <button class="btn small" style="border-color:#fff;color:#fff;" id="bannerLogout">تسجيل الخروج</button>
      </div>`;
    document.getElementById('bannerDesignBtn').addEventListener('click', modalEditDesign);
    document.getElementById('bannerLogout').addEventListener('click', logout);
  } else { bannerWrap.innerHTML = ''; }
}

async function logout(){
  stopDeviceLockWatch();
  if(supabaseClient) await supabaseClient.auth.signOut();
  state.session = null;
  navigate('home'); render();
}

function escapeHtml(str){ const d = document.createElement('div'); d.textContent = str ?? ''; return d.innerHTML; }
/* يعرض محتوى نص السؤال/التفسير: إن كان يحوي وسوم HTML فعليًا (من المحرر الغني، ومُطهَّر
   مسبقًا وقت الحفظ عبر sanitizeSummaryHtml) يُعرض كما هو، وإلا (نص قديم من قبل دعم
   المحرر الغني) يُعامل كنص عادي ويُهرَّب لمنع أي أحرف خاصة من كسر الصفحة */
function renderRichContent(str){
  const val = str ?? '';
  return /<[a-z][\s\S]*>/i.test(val) ? val : escapeHtml(val);
}
function shuffleArr(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

const ICONS = { book:'📘', quiz:'📝', users:'🎓', trash:'🗑️', plus:'➕', edit:'✏️', shield:'🛡️', play:'▶️', download:'⬇️', mail:'✉️', phone:'📞', pin:'📍',
  whatsapp:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.77.46 3.5 1.34 5.02L2.05 22l5.2-1.36a9.94 9.94 0 0 0 4.78 1.22h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.13-2.9-7C17.16 3.03 14.68 2 12.04 2m0 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.81c0 4.53-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.18-1.15l-.3-.17-3.09.81.82-3-.2-.32a8.15 8.15 0 0 1-1.25-4.4c0-4.53 3.7-8.23 8.21-8.23m-4.5 4.73c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.17 1.7 2.69 4.19 3.7 2.32.9 2.32.6 2.74.56.42-.04 1.36-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.1-.22-.15-.46-.27-.24-.12-1.4-.7-1.62-.77-.22-.08-.37-.12-.53.12s-.62.77-.75.93c-.14.15-.28.17-.52.05-.24-.12-1.01-.37-1.92-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.36.1-.48.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.73-1.78-.19-.46-.39-.4-.53-.41z"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.5 6.2s-.23-1.64-.94-2.36c-.9-.94-1.9-.95-2.36-1C16.9 2.5 12 2.5 12 2.5h-.01s-4.9 0-8.19.34c-.46.05-1.46.06-2.36 1C.73 4.56.5 6.2.5 6.2S.25 8.14.25 10.07v1.75c0 1.93.25 3.87.25 3.87s.23 1.64.94 2.36c.9.94 2.08.91 2.6 1.01 1.89.18 8.06.35 8.06.35s4.9-.01 8.19-.35c.46-.05 1.46-.07 2.36-1 .71-.72.94-2.36.94-2.36s.25-1.93.25-3.87v-1.75c0-1.93-.25-3.87-.25-3.87zM9.75 14.9V7.98l6.5 3.46-6.5 3.46z"/></svg>',
  lock:'🔒', gear:'⚙️', camera:'📷', note:'🗒️', magic:'✨' };

const SOCIAL_LINKS = [
  { key:'whatsapp', label:'واتساب', href:'https://wa.me/962781492144' },
  { key:'facebook', label:'فيسبوك', href:'https://web.facebook.com/profile.php?id=61591931514506&locale=ar_AR' },
  { key:'youtube', label:'يوتيوب', href:'https://www.youtube.com/@MEDORA_Academy' },
];
function socialIconsRow(){
  return `<div class="footer-social">${SOCIAL_LINKS.map(s=>`<a href="${s.href}" target="_blank" rel="noopener" class="social-ic ${s.key}" aria-label="${s.label}" title="${s.label}">${ICONS[s.key]}</a>`).join('')}</div>`;
}

function stethDivider(){
  return `<div class="steth-divider"><svg viewBox="0 0 340 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4 Q 60 20 120 4 T 240 4" stroke="#177a8c" stroke-width="2" stroke-linecap="round"/>
    <circle cx="240" cy="4" r="4" fill="#0f2745"/>
    <path d="M244 4 Q 300 4 330 11" stroke="#0f2745" stroke-width="2" stroke-linecap="round"/>
    <circle cx="330" cy="11" r="5" fill="#177a8c"/>
  </svg></div>`;
}

/* ---------------- Editable site content (admin can edit every field) ---------------- */
const CONTENT_DEFAULTS = {
  hero_title: 'رفيقك الأكاديمي في مسيرة <em>التمريض وطب الأسنان</em>',
  hero_lead: 'MEDORA منصة تعليمية موحّدة لطلاب التمريض وطب الأسنان من عدّة جامعات أردنية، تجمع الدورات والمحاضرات وبنك الأسئلة في تجربة واحدة سهلة ومنظّمة.',
  hero_card_title: 'الجامعات المشمولة بالمنصة',
  stat_partners_value: '3',
  stat_partners_label: 'جامعات شريكة',
  why_eyebrow: 'لماذا MEDORA',
  why_title: 'كل ما يحتاجه طالب التمريض وطب الأسنان في مكان واحد',
  why_desc: 'محتوى مركّز، منظّم حسب المقرر، ومحدّث باستمرار من قبل فريق المنصة.',
  feature1_title: 'كورسات ومحاضرات',
  feature1_desc: 'كل كورس يحتوي على محاضراته الخاصة، مع إمكانية المشاهدة والتحميل مباشرة.',
  feature2_title: 'بنك أسئلة تفاعلي',
  feature2_desc: 'اختبارات ذكية حسب الكورس، بنمط دراسي أو نمط اختبار حقيقي مع نتيجة نهائية.',
  feature3_title: 'لطلاب التمريض وطب الأسنان',
  feature3_desc: 'منصّة موحّدة تخدم طلاب مؤتة والعلوم التطبيقية الخاصة والعلوم والتكنولوجيا الأردنية، في تخصصي التمريض وطب الأسنان.',
  cta_eyebrow: 'جاهز تبدأ؟',
  cta_title: 'سجّل الدخول وابدأ رحلتك التعليمية',
  cta_desc: 'أنشئ حسابك الآن لتتابع الدورات وتحلّ أسئلة بنك المراجعة.',
  about_title: 'MEDORA — منصة طلاب التمريض وطب الأسنان',
  about_text: 'MEDORA منصة تعليمية إلكترونية متخصصة، صُممت خصيصًا لخدمة طلاب كليتي التمريض وطب الأسنان في أكثر من جامعة أردنية. تجمع المنصة بين المحتوى الدراسي المنظّم، المحاضرات المسجّلة والملفات القابلة للتحميل، وبنك أسئلة مراجعة شامل، بهدف تسهيل رحلة الطالب الأكاديمية وتوفير مصدر موحّد وموثوق للمراجعة والاستعداد للامتحانات.',
  mission1_title: '🎯 رسالتنا',
  mission1_desc: 'تمكين طلاب التمريض وطب الأسنان من الوصول لمحتوى تعليمي عالي الجودة ومنظّم، بغض النظر عن الجامعة أو التخصص الذي ينتمون إليه.',
  mission2_title: '👁️ رؤيتنا',
  mission2_desc: 'أن نكون المرجع الرقمي الأول لطلاب التمريض وطب الأسنان في الأردن، من خلال محتوى محدّث باستمرار ومبني على احتياجات الطلاب الفعلية.',
  mission3_title: '📚 المحتوى',
  mission3_desc: 'كورسات مصنّفة حسب المقرر والجامعة، مع محاضرات قابلة للمشاهدة والتحميل.',
  mission4_title: '❓ بنك الأسئلة',
  mission4_desc: 'اختبارات تفاعلية بنمط دراسي أو نمط اختبار حقيقي، لمساعدة الطالب على المراجعة الذاتية.',
  contact_eyebrow: 'تواصل معنا',
  contact_title: 'نسعد بتواصلك مع فريق MEDORA',
  contact_desc: 'لأي استفسار أو اقتراح أو مشكلة تقنية، راسلنا وسنعاود التواصل بأقرب وقت ممكن.',
  contact_email: 'medoraacademy2026@gmail.com',
  contact_phone: '+962 78 149 2144',
  contact_location: 'الأردن — عمّان',
  footer_desc: 'منصة تعليمية متخصصة لطلاب التمريض وطب الأسنان، تجمع الدورات، المحاضرات، وبنك الأسئلة في مكان واحد لدعم رحلتكم الأكاديمية.',
  footer_copy: '© 2026 MEDORA — جميع الحقوق محفوظة',
  app_title: 'حمّل تطبيق MEDORA',
  app_desc: 'تابع كورساتك وبنك الأسئلة من هاتفك في أي وقت.',
  app_ios_url: '#',
  app_android_url: 'https://drive.google.com/file/d/12SB2OeQ49irLS1H39WqxIZwpHg3JJHxx/view?usp=drive_link',
};
const CONTENT_LABELS = {
  hero_title: 'عنوان الصفحة الرئيسية', hero_lead: 'وصف الصفحة الرئيسية', hero_card_title: 'عنوان بطاقة الجامعات',
  stat_partners_value: 'رقم إحصائية الجامعات الشريكة', stat_partners_label: 'نص إحصائية الجامعات الشريكة',
  why_eyebrow: 'شارة قسم "لماذا MEDORA"', why_title: 'عنوان قسم "لماذا MEDORA"', why_desc: 'وصف قسم "لماذا MEDORA"',
  feature1_title: 'عنوان الميزة الأولى', feature1_desc: 'وصف الميزة الأولى',
  feature2_title: 'عنوان الميزة الثانية', feature2_desc: 'وصف الميزة الثانية',
  feature3_title: 'عنوان الميزة الثالثة', feature3_desc: 'وصف الميزة الثالثة',
  cta_eyebrow: 'شارة قسم الدعوة لإنشاء حساب', cta_title: 'عنوان قسم الدعوة لإنشاء حساب', cta_desc: 'وصف قسم الدعوة لإنشاء حساب',
  about_title: 'عنوان صفحة من نحن', about_text: 'نص صفحة من نحن',
  mission1_title: 'عنوان بطاقة الرسالة', mission1_desc: 'وصف بطاقة الرسالة',
  mission2_title: 'عنوان بطاقة الرؤية', mission2_desc: 'وصف بطاقة الرؤية',
  mission3_title: 'عنوان بطاقة المحتوى', mission3_desc: 'وصف بطاقة المحتوى',
  mission4_title: 'عنوان بطاقة بنك الأسئلة', mission4_desc: 'وصف بطاقة بنك الأسئلة',
  contact_eyebrow: 'شارة صفحة التواصل', contact_title: 'عنوان صفحة التواصل', contact_desc: 'وصف صفحة التواصل',
  contact_email: 'البريد الإلكتروني', contact_phone: 'رقم الهاتف', contact_location: 'الموقع',
  footer_desc: 'وصف الفوتر', footer_copy: 'نص حقوق النشر',
  app_title: 'عنوان نافذة تحميل التطبيق', app_desc: 'وصف نافذة تحميل التطبيق',
  app_ios_url: 'رابط App Store', app_android_url: 'رابط Google Play',
};
function cval(key){ return (state.content && state.content[key] !== undefined) ? state.content[key] : CONTENT_DEFAULTS[key]; }
function isAdminSession(){ return !!(state.session && state.session.type === 'admin'); }
/* حساب "مدرّس": صلاحيات محدودة بكورسه هو بس — إدارة واجهة فقط (متل الأدمن تمامًا)،
   وليست حماية حقيقية على مستوى قاعدة البيانات. */
function isTeacherSession(){ return !!(state.session && state.session.type === 'teacher'); }
function isCourseOwnerTeacher(course){ return isTeacherSession() && !!course && course.teacherId === state.session.teacherId; }
function editBtn(key){
  if(!isAdminSession()) return '';
  return `<button type="button" class="content-edit-btn" data-edit-content="${key}" title="تعديل هذا النص">${ICONS.edit}</button>`;
}

/* ---------------- إعدادات تصميم الموقع (يتحكم بها المشرف فقط) ----------------
   اللون الأساسي (وتُشتق منه درجاته الفاتحة/الغامقة تلقائيًا)، عرض المحتوى،
   وحجم الخط الافتراضي لكل زوار المنصة. تُخزَّن بشكل مشترك (Supabase) بحيث
   يراها كل مستخدم بنفس الشكل الذي يضبطه المشرف. */
const DESIGN_DEFAULTS = { color:'#177a8c', width:1180, fontScale:'medium' };
const DESIGN_FONT_SCALE_MAP = { small:0.92, medium:1, large:1.14 };
function clampNum(n, min, max){ return Math.min(max, Math.max(min, n)); }
function shadeHexColor(hex, percent){
  hex = (hex||'').replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  if(!/^[0-9a-fA-F]{6}$/.test(hex)) return '#177a8c';
  const num = parseInt(hex, 16);
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent);
  let b = (num & 0x0000FF) + Math.round(255 * percent);
  r = clampNum(r, 0, 255); g = clampNum(g, 0, 255); b = clampNum(b, 0, 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function designVal(key){ return (state.design && state.design[key] !== undefined) ? state.design[key] : DESIGN_DEFAULTS[key]; }
function applyDesignVars(design){
  const d = Object.assign({}, DESIGN_DEFAULTS, design||{});
  const root = document.documentElement.style;
  root.setProperty('--teal', d.color);
  root.setProperty('--teal-2', shadeHexColor(d.color, 0.12));
  root.setProperty('--teal-light', shadeHexColor(d.color, 0.85));
  root.setProperty('--content-width', clampNum(parseInt(d.width,10)||1180, 960, 1440) + 'px');
  document.body.style.zoom = DESIGN_FONT_SCALE_MAP[d.fontScale] || 1;
}
function modalEditDesign(){
  if(!isAdminSession()) return;
  const d = Object.assign({}, DESIGN_DEFAULTS, state.design||{});
  openModal(`
    <h3>🎨 تصميم الموقع</h3>
    <p style="color:var(--muted); font-size:13.5px; margin-bottom:16px;">هذه الإعدادات تنطبق على كل زوار المنصة.</p>
    <form id="designEditForm">
      <div class="field">
        <label>اللون الأساسي للمنصة</label>
        <input type="color" name="color" value="${escapeHtml(d.color)}" style="width:100%; height:44px; padding:4px; border:1.5px solid var(--border); border-radius:10px; cursor:pointer;">
      </div>
      <div class="field">
        <label>عرض المحتوى (<span id="widthPreview">${d.width}</span>px)</label>
        <input type="range" name="width" min="960" max="1440" step="20" value="${d.width}" style="width:100%;" oninput="document.getElementById('widthPreview').textContent=this.value">
      </div>
      <div class="field">
        <label>حجم الخط الافتراضي</label>
        <select name="fontScale">
          <option value="small" ${d.fontScale==='small'?'selected':''}>صغير</option>
          <option value="medium" ${d.fontScale==='medium'?'selected':''}>متوسط</option>
          <option value="large" ${d.fontScale==='large'?'selected':''}>كبير</option>
        </select>
      </div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('designEditForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    state.design = { color: fd.get('color'), width: parseInt(fd.get('width'),10) || 1180, fontScale: fd.get('fontScale') || 'medium' };
    await setData('design', state.design, true);
    applyDesignVars(state.design);
    closeModal(); render();
  });
}
/* الحقول التالية روابط (URL) وليست نصًا معروضًا، فتُحرَّر كحقل نص عادي بلا تلوين */
const CONTENT_URL_KEYS = new Set(['app_ios_url','app_android_url']);

/* يسمح فقط بعناصر <span style="color:..."> و<br>، ويحوّل أي وسم <font color> أو
   عناصر كتلة (div/p) من اللصق إلى نفس الصيغة الآمنة، ويتجاهل أي شيء آخر (بدون سكربتات
   أو وسوم غير متوقعة)، حفاظًا على أمان المحتوى المخزَّن. */
function sanitizeRichText(html){
  const isValidColor = c => /^(#[0-9a-fA-F]{3}$|#[0-9a-fA-F]{6}$|rgb\([\d\s,]+\)$)/.test((c||'').trim());
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const out = document.createElement('div');
  function walk(srcNode, destNode){
    srcNode.childNodes.forEach(child=>{
      if(child.nodeType === Node.TEXT_NODE){ destNode.appendChild(document.createTextNode(child.nodeValue)); return; }
      if(child.nodeType !== Node.ELEMENT_NODE) return;
      const tag = child.tagName.toLowerCase();
      if(tag === 'br'){ destNode.appendChild(document.createElement('br')); return; }
      if(tag === 'span' && child.style && child.style.color && isValidColor(child.style.color)){
        const span = document.createElement('span'); span.style.color = child.style.color;
        walk(child, span); destNode.appendChild(span); return;
      }
      if(tag === 'font' && child.color && isValidColor(child.color)){
        const span = document.createElement('span'); span.style.color = child.color;
        walk(child, span); destNode.appendChild(span); return;
      }
      if(tag === 'div' || tag === 'p'){
        if(destNode.lastChild) destNode.appendChild(document.createElement('br'));
        walk(child, destNode); return;
      }
      walk(child, destNode); // وسم غير معروف: يُفكّ ويُبقى نصّه فقط
    });
  }
  walk(tmp, out);
  while(out.firstChild && out.firstChild.nodeName === 'BR') out.removeChild(out.firstChild);
  while(out.lastChild && out.lastChild.nodeName === 'BR') out.removeChild(out.lastChild);
  return out.innerHTML.trim();
}
function applyColorToRange(range, color){
  if(!range || range.collapsed) return;
  const span = document.createElement('span'); span.style.color = color;
  try{ range.surroundContents(span); }
  catch(e){ const content = range.extractContents(); span.appendChild(content); range.insertNode(span); }
}
function clearColorsInEditor(editorEl){
  editorEl.querySelectorAll('span[style*="color"], font[color]').forEach(el=>{
    const parent = el.parentNode;
    while(el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });
}
function modalEditContent(key){
  const label = CONTENT_LABELS[key] || key;
  const current = cval(key);
  if(CONTENT_URL_KEYS.has(key)){
    openModal(`
      <h3>${ICONS.edit} تعديل: ${escapeHtml(label)}</h3>
      <form id="contentEditForm">
        <div class="field"><label>${escapeHtml(label)}</label><input type="text" name="val" required value="${escapeHtml(current)}"></div>
        <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ</button></div>
      </form>`);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('contentEditForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      state.content[key] = fd.get('val').trim();
      await setData('content', state.content, true);
      closeModal(); render();
    });
    return;
  }
  openModal(`
    <h3>${ICONS.edit} تعديل: ${escapeHtml(label)}</h3>
    <form id="contentEditForm">
      <div class="field">
        <label>${escapeHtml(label)}</label>
        <div class="rte-toolbar" style="border-radius:10px 10px 0 0; justify-content:flex-start;">
          <input type="color" id="contentColorPicker" title="لوّن الكلمات المحدَّدة" value="${escapeHtml(designVal('color'))}" style="width:32px;height:32px;padding:2px;border:1px solid var(--border);border-radius:8px;cursor:pointer;">
          <button type="button" class="rte-btn" id="clearColorsBtn" title="مسح كل الألوان من النص">⌫</button>
          <span style="font-size:11.5px; color:var(--muted); margin-inline-start:6px;">حدّد الكلمة بالماوس ثم اختر لونها</span>
        </div>
        <div class="rte-editor" id="contentEditorField" contenteditable="true">${current}</div>
      </div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ</button></div>
    </form>`);
  const editorEl = document.getElementById('contentEditorField');
  let savedRange = null;
  function captureRange(){
    const sel = window.getSelection();
    if(sel.rangeCount){
      const r = sel.getRangeAt(0);
      if(editorEl.contains(r.commonAncestorContainer) && !r.collapsed) savedRange = r.cloneRange();
    }
  }
  editorEl.addEventListener('mouseup', captureRange);
  editorEl.addEventListener('keyup', captureRange);
  document.getElementById('contentColorPicker').addEventListener('change', (e)=>{
    if(savedRange){ applyColorToRange(savedRange.cloneRange(), e.target.value); savedRange = null; }
  });
  document.getElementById('clearColorsBtn').addEventListener('click', ()=> clearColorsInEditor(editorEl));
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('contentEditForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    state.content[key] = sanitizeRichText(editorEl.innerHTML);
    await setData('content', state.content, true);
    closeModal(); render();
  });
}
function modalDownloadApp(){
  openModal(`
    <h3>📱 ${cval('app_title')}${editBtn('app_title')}</h3>
    <p style="color:var(--muted); margin-bottom:20px;">${cval('app_desc')}${editBtn('app_desc')}</p>
    <div class="modal-actions" style="justify-content:flex-start; flex-wrap:wrap;">
      <a href="${escapeHtml(cval('app_ios_url'))}" target="_blank" rel="noopener" class="btn teal solid small"> App Store</a>${editBtn('app_ios_url')}
      <a href="${escapeHtml(cval('app_android_url'))}" target="_blank" rel="noopener" class="btn solid small"> Google Play</a>${editBtn('app_android_url')}
    </div>
    <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إغلاق</button></div>
  `);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
}

/* =========================================================
   PAGE: HOME
   ========================================================= */
function pageHome(){
  const uniRows = UNIVERSITIES.map(u => `<div class="uni-row"><div class="uni-dot"></div><div><span class="uni-name">${u.name}</span><span class="uni-loc">${u.loc}</span></div></div>`).join('');
  return `
  <section class="hero">
    <div class="hero-inner">
      <div>
        <h1>${cval('hero_title')}${editBtn('hero_title')}</h1>
        <p class="lead">${cval('hero_lead')}${editBtn('hero_lead')}</p>
        <div class="hero-actions">
          <a href="/courses" class="btn solid">تصفّح الدورات</a>
          <a href="/bank" class="btn" id="heroBankLink">بنك الأسئلة</a>
        </div>
      </div>
      <div class="hero-card"><h3>${cval('hero_card_title')}${editBtn('hero_card_title')}</h3>${uniRows}</div>
    </div>
  </section>
  <div class="stats-strip">
    <div class="stat"><b>${state.courses.length}+</b><span>كورس متاح</span></div>
    <div class="stat"><b>${state.questions.length}+</b><span>سؤال في البنك</span></div>
    <div class="stat"><b>${cval('stat_partners_value')}${editBtn('stat_partners_value')}</b><span>${cval('stat_partners_label')}${editBtn('stat_partners_label')}</span></div>
  </div>
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${cval('why_eyebrow')}${editBtn('why_eyebrow')}</span>
        <h2>${cval('why_title')}${editBtn('why_title')}</h2>
        <p>${cval('why_desc')}${editBtn('why_desc')}</p>
      </div>
      <div class="grid-3">
        <div class="feature-card">
          <div class="feature-card-inner">
            <div class="feature-icon" style="background:#fdece1;"><svg viewBox="0 0 24 24" fill="none" stroke="#f2994a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 10v6"/></svg></div>
            <h3>${cval('feature1_title')}${editBtn('feature1_title')}</h3>
            <p>${cval('feature1_desc')}${editBtn('feature1_desc')}</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card-inner">
            <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--teal-2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
            <h3>${cval('feature2_title')}${editBtn('feature2_title')}</h3>
            <p>${cval('feature2_desc')}${editBtn('feature2_desc')}</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card-inner">
            <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--teal-2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
            <h3>${cval('feature3_title')}${editBtn('feature3_title')}</h3>
            <p>${cval('feature3_desc')}${editBtn('feature3_desc')}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="app-download-section">
    <div class="app-download-box">
      <div class="app-download-info">
        <div class="app-download-icon">📱</div>
        <div class="app-download-text">
          <span class="eyebrow">متوفر لأجهزة الأندرويد فقط</span>
          <h2>${cval('app_title')}${editBtn('app_title')}</h2>
          <p>${cval('app_desc')}${editBtn('app_desc')}</p>
        </div>
      </div>
      <div class="app-download-btn-wrap">
        <a href="${escapeHtml(cval('app_android_url'))}" target="_blank" rel="noopener" class="btn solid app-download-btn">
          <svg viewBox="0 0 24 24"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/></svg>
          تحميل التطبيق للأندرويد
        </a>${editBtn('app_android_url')}
        <span class="app-download-note">لأجهزة الأندرويد فقط، غير متاح حاليًا على iOS</span>
      </div>
    </div>
  </section>
  ${stethDivider()}
  <section class="section" style="padding-top:40px;">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${cval('cta_eyebrow')}${editBtn('cta_eyebrow')}</span>
        <h2>${cval('cta_title')}${editBtn('cta_title')}</h2>
        <p>${cval('cta_desc')}${editBtn('cta_desc')}</p>
      </div>
      <div style="text-align:center;"><a href="/login" class="btn teal solid">إنشاء حساب / تسجيل الدخول</a></div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: COURSES (list)
   ========================================================= */
function pageCourses(){
  const filters = ['الكل', ...UNIVERSITIES.map(u=>u.name), 'عام'];
  const majorFilters = ['الكل', ...MAJORS.map(m=>m.name)];
  const isAdmin = state.session && state.session.type === 'admin';
  let courses = state.courses;
  if(state.courseFilter !== 'الكل') courses = courses.filter(c => c.university === state.courseFilter);
  if(state.majorFilter !== 'الكل') courses = courses.filter(c => (c.major || 'التمريض') === state.majorFilter);
  const search = (state.courseSearch || '').trim().toLowerCase();
  if(search) courses = courses.filter(c => (c.title||'').toLowerCase().includes(search) || (c.university||'').toLowerCase().includes(search));

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  if(!state.coursePage || state.coursePage < 1) state.coursePage = 1;
  if(state.coursePage > totalPages) state.coursePage = totalPages;
  const currentPage = state.coursePage;
  const pageCourseList = courses.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

  const uniOptions = filters.map(f => `<option value="${escapeHtml(f)}" ${state.courseFilter===f?'selected':''}>${escapeHtml(f)}</option>`).join('');
  const majorOptions = majorFilters.map(f => `<option value="${escapeHtml(f)}" ${state.majorFilter===f?'selected':''}>${escapeHtml(f)}</option>`).join('');

  const cards = pageCourseList.map(c => {
    const lectureCount = state.lectures.filter(l=>l.courseId===c.id).length;
    return `
    <div class="course-card">
      <div class="course-top"></div>
      <div class="course-body">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
          <div class="course-emblem">${majorEmblem(c.major || 'التمريض')}</div>
          ${priceBadgeHtml(c, isAdmin)}
        </div>
        <div class="course-uni">${escapeHtml(c.university)}</div>
        <h3 class="i18n-skip">${escapeHtml(c.title)}</h3>
        <p class="i18n-skip">${escapeHtml(c.description || '')}</p>
        <div class="course-stats-row">
          <span class="course-stat-chip">⏱ ${c.hours} ساعات</span>
          <span class="course-stat-chip">🎬 ${lectureCount} محاضرة</span>
        </div>
        <div class="course-actions">
          <a href="/course/${c.id}" class="btn teal small">الانتقال للدورة</a>
          ${courseSubscribeActionHtml(c, isAdmin)}
          ${isAdmin ? `<button class="btn edit small" data-edit-course="${c.id}">${ICONS.edit} تعديل</button>` : ''}
          ${isAdmin ? `<button class="btn danger small" data-del-course="${c.id}">${ICONS.trash} حذف</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  const paginationHtml = courses.length ? `
    <div class="course-pagination">
      <button type="button" class="btn small" id="coursePagePrev" ${currentPage<=1?'disabled':''}>السابق</button>
      <span class="course-pagination-info">القسم ${currentPage} من ${totalPages}</span>
      ${currentPage < totalPages
        ? `<button type="button" class="btn teal solid small" id="coursePageNext">الانتقال للقسم التالي ${ICONS.play}</button>`
        : `<button type="button" class="btn small" id="coursePageNext" disabled>الانتقال للقسم التالي</button>`}
    </div>
  ` : '';

  const activeUni = state.courseFilter !== 'الكل' ? state.courseFilter : '';
  const activeMajor = state.majorFilter !== 'الكل' ? state.majorFilter : '';
  /* سطر سياقي يظهر بس لما يكون في فلتر جامعة/تخصص فعّال: مفيد للزائر (بيأكد له
     شو عم يتصفح) وبنفس الوقت بيحتوي عبارات بحث طويلة (long-tail) بمنافسة أقل
     زي "دورات تمريض جامعة مؤتة" بدل الاكتفاء بعبارة عامة "دورات". */
  const coverageLine = (activeUni || activeMajor)
    ? `<p class="courses-coverage-line">تغطية شاملة لدورات ${[activeMajor, activeUni].filter(Boolean).join(' في ')} على منصة MEDORA: محاضرات، ملخصات، وبنك أسئلة سنوات سابقة.</p>`
    : '';

  return `
  <section class="section">
    <div class="container">
      <div class="courses-hero">
        <div class="courses-hero-inner">
          <h2>الدورات التعليمية</h2>
          <p>تصفّح الدورات المتاحة، فلتر حسب تخصصك وجامعتك، أو ابحث مباشرة</p>
          <div class="courses-search">
            <span class="search-icon">🔍</span>
            <input type="text" id="courseSearchInput" placeholder="ابحث عن مادة أو جامعة..." value="${escapeHtml(state.courseSearch||'')}">
          </div>
        </div>
      </div>
      ${coverageLine}
      ${isAdmin ? `<div class="toolbar" style="justify-content:flex-end;"><button class="btn teal solid" id="addCourseBtn">${ICONS.plus} إضافة كورس جديد</button></div>` : ''}
      <div class="filter-dropdown-bar">
        <div class="filter-dropdown">
          <label>الجامعة</label>
          <select id="uniFilterSelect">${uniOptions}</select>
        </div>
        <div class="filter-dropdown">
          <label>التخصص</label>
          <select id="majorFilterSelect">${majorOptions}</select>
        </div>
      </div>
      ${courses.length ? `<div class="course-canvas" id="courseCanvas"><div class="course-grid">${cards}</div></div>${paginationHtml}` : `<div class="empty-state"><h3>لا توجد كورسات ضمن هذا التصنيف</h3><p>جرّب تصنيفًا آخر${isAdmin ? '، أو أضف كورسًا جديدًا.' : '.'}</p></div>`}
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: MY COURSES (enrolled courses for the logged-in student)
   ========================================================= */
/* =========================================================
   PAGE: STUDENT SPACE (hub shown after student login)
   ========================================================= */
function pageStudentSpace(){
  if(!state.session || state.session.type !== 'student'){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>مساحة الطالب متاحة فقط للطلاب المسجّلين. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  const uni = state.session.university || '—';
  const major = state.session.major || '—';
  const myEnrollments = state.enrollments.filter(e=>e.phone===state.session.phone);
  const myCourseCount = new Set(myEnrollments.map(e=>e.courseId)).size;

  return `
  <section class="section">
    <div class="container">
      <div class="course-hero-banner">
        <a href="/student-settings" class="hero-settings-btn">${ICONS.gear} الإعدادات</a>
        <div class="course-hero-banner-inner">
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            ${state.session.avatar
              ? `<img src="${state.session.avatar}" alt="الصورة الشخصية" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.4); flex-shrink:0;">`
              : `<div class="course-emblem" style="background:rgba(255,255,255,0.15); width:64px; height:64px; font-size:30px;">${majorEmblem(major)}</div>`}
            <div>
              <h1 style="margin-bottom:4px;">👋 ${escapeHtml(state.session.name)}</h1>
              <p style="margin-bottom:0;">${escapeHtml(uni)} — ${escapeHtml(major)}</p>
            </div>
          </div>
          <div style="margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;">
            <span class="chip" style="cursor:default;">🎓 ${escapeHtml(uni)}</span>
            <span class="chip" style="cursor:default;">📚 ${escapeHtml(major)}</span>
            <span class="chip" style="cursor:default;">✅ ${myCourseCount} دورة مفعّلة</span>
          </div>
        </div>
      </div>

      <div class="option-cards" style="margin-top:6px;">
        <a href="/my-courses" class="option-card" style="text-decoration:none; display:block;">
          <div style="font-size:30px; margin-bottom:10px;">📘</div>
          <b>دوراتي</b>
          <span>تصفّح الدورات والمحاضرات المفعّلة لديك</span>
        </a>
        <a href="/bank" class="option-card" style="text-decoration:none; display:block;">
          <div style="font-size:30px; margin-bottom:10px;">❓</div>
          <b>بنك الأسئلة</b>
          <span>ابدأ اختبارًا من بنك الأسئلة حسب دوراتك</span>
        </a>
        <a href="/my-summaries" class="option-card" style="text-decoration:none; display:block;">
          <div style="font-size:30px; margin-bottom:10px;">${ICONS.note}</div>
          <b>ملخصاتي</b>
          <span>أضف ملخصاتك الخاصة واحتفظ بها في حسابك</span>
        </a>
        <a href="/ai-summary" class="option-card" style="text-decoration:none; display:block; position:relative;">
          <span class="ai-summary-badge" style="position:absolute; top:14px; left:14px;">${ICONS.magic} AI</span>
          <div style="font-size:30px; margin-bottom:10px;">🎯</div>
          <b>تلخيص محاضرة Highyield</b>
          <span>ارفع ملف المحاضرة وسنحلل بنك الأسئلة لنبرز أكثر النقاط تكرارًا في الامتحانات</span>
        </a>
      </div>

      <div class="card-panel" style="margin-top:24px; padding:26px;">
        <h3 style="font-size:17px; margin-bottom:6px;">🎟️ عندك كود كوبون؟</h3>
        <p class="sub" style="margin-bottom:16px;">أدخل كود الكوبون هنا للحصول على فتح مجاني أو خصم على إحدى المواد.</p>
        <form id="couponRedeemForm" style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-start;">
          <input type="text" name="couponCode" required placeholder="مثال: ABC12345" style="flex:1; min-width:200px; direction:ltr; font-family:monospace; letter-spacing:1px; text-transform:uppercase; padding:12px 14px; border-radius:10px; border:1.5px solid var(--border); background:var(--card); color:var(--text); font-size:14px;">
          <button type="submit" class="btn teal solid">تفعيل الكوبون</button>
        </form>
        <div id="couponRedeemMsg" style="margin-top:12px;"></div>
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: STUDENT SETTINGS (edit profile photo)
   ========================================================= */
function pageStudentSettings(){
  if(!state.session || state.session.type !== 'student'){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>الإعدادات متاحة فقط للطلاب المسجّلين. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  const avatar = state.session.avatar || '';
  const uni = state.session.university || '—';
  const major = state.session.major || '—';
  const myEnrollments = state.enrollments.filter(e=>e.phone===state.session.phone);
  const myCourseTitles = [...new Set(myEnrollments.map(e=>e.courseId))]
    .map(id => state.courses.find(c=>c.id===id)?.title).filter(Boolean);
  const statusText = myCourseTitles.length
    ? `مفعّل — مشترك بمادة ${myCourseTitles.join('، ')}`
    : 'مفعّل — غير مشترك بأي مادة بعد';
  return `
  <section class="section">
    <div class="auth-wrap">
      <div class="card-panel">
        <h2>${ICONS.gear} إعدادات الحساب</h2>
        <p class="sub">تحكّم بصورتك وبياناتك وطريقة عرض المنصة</p>
        <div id="settingsMsg"></div>

        <h3 class="settings-section-title">الصورة الشخصية</h3>
        <div class="avatar-upload-wrap">
          <div class="avatar-preview" id="avatarPreview">${avatar ? `<img src="${avatar}" alt="الصورة الشخصية" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : majorEmblem(state.session.major)}</div>
          <div class="avatar-actions">
            <input type="file" id="avatarInput" accept="image/*" style="display:none;">
            <button type="button" class="btn teal small" id="chooseAvatarBtn">${ICONS.camera} ${avatar ? 'تغيير الصورة' : 'إضافة صورة شخصية'}</button>
            ${avatar ? `<button type="button" class="btn danger small" id="removeAvatarBtn">${ICONS.trash} إزالة الصورة</button>` : ''}
            <p class="hint">يفضّل صورة مربعة، الحجم الأقصى 2MB (JPG أو PNG)</p>
          </div>
        </div>

        <hr class="settings-divider">
        <h3 class="settings-section-title">بيانات الطالب</h3>
        <div class="field"><label>الاسم الكامل</label><input type="text" value="${escapeHtml(state.session.name)}" disabled></div>
        <div class="field"><label>الجامعة</label><input type="text" value="${escapeHtml(uni)}" disabled></div>
        <div class="field"><label>التخصص</label><input type="text" value="${escapeHtml(major)}" disabled></div>

        <hr class="settings-divider">
        <h3 class="settings-section-title">إعدادات العرض</h3>
        <div class="field">
          <label>اللغة</label>
          <select id="languageSelect">
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="field">
          <label>حجم الخط</label>
          <select id="fontSizeSelect">
            <option value="small">صغير</option>
            <option value="medium">متوسط</option>
            <option value="large">كبير</option>
          </select>
        </div>

        <hr class="settings-divider">
        <h3 class="settings-section-title">بيانات الحساب</h3>
        <div class="field">
          <label>حالة الحساب</label>
          <input type="text" value="${escapeHtml(statusText)}" disabled>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
          <button type="button" class="btn teal small" id="resetPasswordBtn">${ICONS.lock} إعادة تعيين كلمة المرور</button>
          <button type="button" class="btn danger small" id="deleteAccountBtn">${ICONS.trash} حذف الحساب</button>
        </div>

        <hr class="settings-divider">
        <button type="button" class="btn teal solid" id="saveSettingsBtn" style="width:100%; justify-content:center;">حفظ التعديلات</button>
      </div>
    </div>
  </section>`;
}

/* صفحة "موادي" لحساب المدرّس: تعرض فقط المواد التي هو مدرّسها (teacherId مطابق)،
   وكل بطاقة مادة تفتح على صفحة تفاصيل الكورس حيث يملك صلاحيات كاملة للتحكم بها
   (إضافة/تعديل/حذف محاضرات) ويشاهد جميع المحاضرات كأنه مشترك بالمادة كاملة. */
function pageMyTeachCourses(){
  if(!isTeacherSession()){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>هذه الصفحة مخصصة لحسابات المدرّسين. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  const myCourses = state.courses.filter(c=>c.teacherId===state.session.teacherId);
  const rows = myCourses.map(c => {
    const lectureCount = state.lectures.filter(l=>l.courseId===c.id).length;
    const studentCount = enrollmentsFor(c.id).length;
    return `
    <a href="/course/${c.id}" class="my-course-row">
      <div class="course-emblem">${majorEmblem(c.major || 'التمريض')}</div>
      <div class="my-course-info">
        <div class="my-course-row-top">
          <h3>${escapeHtml(c.title)}</h3>
          <span class="chip" style="cursor:default; padding:4px 10px; font-size:12px;">${escapeHtml(c.major || 'التمريض')}</span>
        </div>
        <div class="course-uni">${escapeHtml(c.university)}</div>
        <div class="course-stats-row" style="margin-bottom:0;">
          <span class="course-stat-chip">⏱ ${c.hours} ساعات</span>
          <span class="course-stat-chip">🎬 ${lectureCount} محاضرة</span>
          <span class="course-stat-chip">🎓 ${studentCount} طالب مشترك</span>
        </div>
      </div>
      <div class="my-course-actions">
        <span class="btn teal small">${ICONS.edit} إدارة المادة</span>
      </div>
    </a>`;
  }).join('');

  return `
  <section class="section">
    <div class="container">
      <div class="toolbar"><h2>👨‍🏫 موادي</h2></div>
      ${myCourses.length ? `<div class="my-course-list">${rows}</div>` : `<div class="empty-state"><h3>لا يوجد كورس مرتبط بحسابك بعد</h3><p>تواصل مع إدارة المنصة لربط حسابك بالمادة التي تدرّسها.</p></div>`}
    </div>
  </section>
  `;
}

function pageMyCourses(){
  if(isTeacherSession()) return pageMyTeachCourses();
  if(!state.session || state.session.type !== 'student'){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>هذه الصفحة مخصصة للطلاب لعرض الدورات المفعّلة لديهم. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  const myEnrollments = state.enrollments.filter(e=>e.phone===state.session.phone);
  const myCourseIds = myEnrollments.map(e=>e.courseId);
  const courses = state.courses.filter(c=>myCourseIds.includes(c.id));
  const rows = courses.map(c => {
    const lectureCount = state.lectures.filter(l=>l.courseId===c.id).length;
    const myEntries = myEnrollments.filter(e=>e.courseId===c.id);
    const sectionsLabel = myEntries.some(e=>!e.section) ? 'الكورس بالكامل' : myEntries.map(e=>SECTION_LABELS[e.section]).join(' + ');
    const { watched, total, pct } = courseProgress(c.id);
    return `
    <a href="/course/${c.id}" class="my-course-row">
      <div class="course-emblem">${majorEmblem(c.major || 'التمريض')}</div>
      <div class="my-course-info">
        <div class="my-course-row-top">
          <h3>${escapeHtml(c.title)}</h3>
          <span class="chip" style="cursor:default; padding:4px 10px; font-size:12px;">${escapeHtml(c.major || 'التمريض')}</span>
        </div>
        <div class="course-uni">${escapeHtml(c.university)}</div>
        <div class="course-stats-row" style="margin-bottom:0;">
          <span class="course-stat-chip">⏱ ${c.hours} ساعات</span>
          <span class="course-stat-chip">🎬 ${lectureCount} محاضرة</span>
          <span class="course-stat-chip">✅ ${escapeHtml(sectionsLabel)}</span>
        </div>
      </div>
      <div class="my-course-progress">
        <div class="my-course-progress-head"><span>مستوى التقدم</span><b>${pct}%</b></div>
        <div class="my-course-progress-track"><div class="my-course-progress-fill" style="width:${pct}%;"></div></div>
        <span class="my-course-progress-sub">${total ? `${watched} من ${total} محاضرة تمت مشاهدتها` : 'لا توجد محاضرات بعد'}</span>
      </div>
      <div class="my-course-actions">
        <span class="btn teal small">عرض المحاضرات</span>
      </div>
    </a>`;
  }).join('');

  return `
  <section class="section">
    <div class="container">
      <div style="margin-bottom:18px;"><a href="/student-space" class="btn small">→ العودة إلى مساحة الطالب</a></div>
      <div class="toolbar"><h2>دوراتي</h2></div>
      ${courses.length ? `<div class="my-course-list">${rows}</div>` : `<div class="empty-state"><h3>لا توجد كورسات مفعّلة بعد</h3><p>تواصل مع الإدارة لتفعيل الدورات التي تحتاجها.</p></div>`}
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: MY SUMMARIES (بطاقات ملخصات يضيفها الطالب بنفسه وتُحفظ في حسابه)
   ========================================================= */
function pageMySummaries(){
  if(!state.session || state.session.type !== 'student'){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>هذه الصفحة مخصصة للطلاب لإضافة ملخصاتهم الخاصة. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  const phone = state.session.phone;
  const mySummaries = state.summaries.filter(s=>s.phone===phone).sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
  const cards = mySummaries.map(s => `
    <div class="summary-card">
      <div class="summary-card-head">
        <h4><img class="summary-brand-mark" src="${MEDORA_LOGO_SM}" alt="MEDORA">${s.aiGenerated ? `<span class="ai-summary-badge" style="margin-inline-end:6px; vertical-align:middle;">${ICONS.magic} AI</span>` : ''}${escapeHtml(s.title)}</h4>
        <div class="summary-card-actions">
          <button type="button" class="content-edit-btn" data-pdf-summary="${s.id}" title="Download PDF">${ICONS.download}</button>
          <button type="button" class="content-edit-btn" data-edit-summary="${s.id}" title="تعديل">${ICONS.edit}</button>
          <button type="button" class="content-edit-btn" data-del-summary="${s.id}" title="حذف" style="border-color:var(--danger); background:transparent; color:var(--danger);">${ICONS.trash}</button>
        </div>
      </div>
      <div class="summary-card-body">${s.content}</div>
      <div class="summary-card-foot"><img src="${MEDORA_LOGO_SM}" alt=""> MEDORA</div>
    </div>
  `).join('');

  return `
  <section class="section">
    <div class="container">
      <div class="toolbar">
        <h2>${ICONS.note} ملخصاتي</h2>
        <div class="toolbar-actions">
          <a href="/ai-summary" class="btn small" style="background:linear-gradient(135deg, var(--teal), var(--navy)); color:#fff; border-color:transparent;">${ICONS.magic} تلخيص محاضرة بالذكاء الاصطناعي</a>
          <button type="button" class="btn teal solid small" id="addSummaryBtn">${ICONS.plus} إضافة ملخص</button>
        </div>
      </div>
      ${mySummaries.length ? `<div class="summary-grid">${cards}</div>` : `<div class="empty-state"><h3>لا توجد ملخصات بعد</h3><p>ابدأ بإضافة أول ملخص خاص بك ليبقى محفوظًا في حسابك.</p></div>`}
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: تلخيص محاضرة بالذكاء الاصطناعي (High-Yield)
   الطالب يختار المادة (ومحاضرة اختياريًا) ويرفع ملف المحاضرة (PDF/صورة).
   نجمع تلقائيًا أسئلة الامتحانات السابقة (nature:'past') من بنك الأسئلة
   الخاصة بنفس المادة/المحاضرة، ونرسلها مع الملف لطلب Anthropic API
   (عبر Supabase Edge Function آمنة تحمل مفتاح الـ API) لإنتاج ملخص
   High-Yield يركّز على النقاط الأكثر تكرارًا في الامتحانات.
   ========================================================= */
function pageAiSummary(){
  if(!state.session || state.session.type !== 'student'){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>هذه الميزة متاحة فقط للطلاب المسجّلين. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  const myEnrollments = state.enrollments.filter(e=>e.phone===state.session.phone);
  const myCourseIds = [...new Set(myEnrollments.map(e=>e.courseId))];
  const myCourses = state.courses.filter(c=>myCourseIds.includes(c.id));
  const courseOptions = myCourses.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');

  return `
  <section class="section">
    <div class="container" style="max-width:760px;">
      <div class="toolbar">
        <h2><span class="ai-summary-badge">${ICONS.magic} AI</span> تلخيص محاضرة Highyield</h2>
      </div>
      <div class="card-panel" style="padding:26px;">
        <p class="sub" style="margin-bottom:18px;">ارفع ملف المحاضرة (PDF أو صورة للشرائح)، اختر المادة والمحاضرة، وسنحلل تلقائيًا أسئلة الامتحانات السابقة الخاصة بها من بنك الأسئلة لنبني لك ملخصًا مركّزًا يبرز أكثر النقاط تكرارًا.</p>

        ${!myCourses.length ? `<div class="empty-state"><h3>لا توجد مواد مفعّلة بعد</h3><p>يجب أن تكون مشتركًا في مادة واحدة على الأقل لاستخدام هذه الميزة.</p></div>` : `
        <form id="aiSummaryForm">
          <div class="field">
            <label>المادة</label>
            <select name="courseId" id="aiCourseSelect" required>
              <option value="" disabled selected>اختر المادة</option>
              ${courseOptions}
            </select>
          </div>
          <div class="field">
            <label>المحاضرة (اختياري — اتركها فارغة لملخص عام على مستوى المادة)</label>
            <select name="lectureId" id="aiLectureSelect">
              <option value="">بدون تحديد (عام)</option>
            </select>
          </div>
          <div id="aiBankHint" class="ai-bank-hint" style="display:none;"></div>

          <div class="field" style="margin-top:16px;">
            <label>ملف المحاضرة (PDF أو صورة)</label>
            <div class="ai-upload-box" id="aiUploadBox">
              <div class="ai-upload-icon">📎</div>
              <div><b>اضغط لرفع ملف المحاضرة</b></div>
              <div class="hint" style="margin-top:4px;">PDF أو صورة (JPG/PNG) — بحد أقصى تقريبي 20MB</div>
              <div class="ai-upload-filename" id="aiUploadFilename"></div>
            </div>
            <input type="file" id="aiFileInput" accept=".pdf,image/*" style="display:none;">
          </div>

          <div id="aiSummaryMsg"></div>
          <div class="modal-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn teal solid" id="aiGenerateBtn">${ICONS.magic} توليد الملخص</button>
          </div>
        </form>

        <div id="aiLoadingBox" class="ai-loading-box" style="display:none;">
          <div class="ai-spinner"></div>
          <div><b>جارٍ تحليل الملف وبنك الأسئلة...</b></div>
          <p style="font-size:13px;">قد يستغرق هذا حتى دقيقة حسب حجم الملف</p>
        </div>

        <div id="aiResultBox" class="ai-result-box" style="display:none;">
          <h3 style="font-size:16px; margin-bottom:12px;">✅ راجع الملخص وعدّله ثم احفظه</h3>
          <form id="aiSaveForm">
            <div class="field"><label>عنوان الملخص</label><input type="text" name="title" id="aiResultTitle" required maxlength="80"></div>
            <div class="field"><label>محتوى الملخص</label>${rteToolbarHtml('aiResultEditor')}<div class="rte-editor" id="aiResultEditor" contenteditable="true"></div></div>
            <div id="aiSaveMsg"></div>
            <div class="modal-actions" style="justify-content:flex-start;">
              <button type="submit" class="btn teal solid">حفظ في ملخصاتي</button>
              <button type="button" class="btn" id="aiDownloadPdfBtn">${ICONS.download} Download PDF</button>
            </div>
          </form>
        </div>
        `}
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: COURSE DETAIL (lectures)
   ========================================================= */
function pageCourseDetail(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  const isAdmin = state.session && state.session.type === 'admin';
  const isOwnerTeacher = isCourseOwnerTeacher(course);
  const canManageLectures = isAdmin || isOwnerTeacher;
  if(!course){
    return `<section class="section"><div class="container"><div class="empty-state"><h3>الكورس غير موجود</h3><p>ربما تم حذفه. <a href="/courses" style="color:var(--teal); font-weight:800;">عودة إلى الدورات</a></p></div></div></section>`;
  }
  const lectures = state.lectures.filter(l=>l.courseId===courseId);
  /* الأدمن يشوف الأقسام المفعّلة لهذه المادة تحديدًا (بعض المواد فيها ميد وفاينال بس مثلًا)،
     والطالب يشوف بس الأقسام اللي فيها محاضرات فعليًا من ضمنها */
  const courseSecs = courseSections(courseId);
  const sectionsToShow = canManageLectures ? courseSecs : courseSecs.filter(s => lectures.some(l=>l.section===s));

  function lectureRowHtml(l, i, unlocked, lockMsg){
    const videos = l.videos || [];
    const files = l.files || [];
    const videoRowsHtml = videos.map((v,idx)=>{
      const label = v.label ? escapeHtml(v.label) : ('مشاهدة الفيديو' + (videos.length>1 ? ' '+(idx+1) : ''));
      if(v.bunnyGuid){
        // فيديو مرفوع على Bunny: يحتاج توكن مشاهدة، فبيفتح جوا الصفحة بدل رابط مباشر
        const libMatch = v.url.match(/\/embed\/(\d+)\//);
        const libraryId = libMatch ? libMatch[1] : '';
        return `
          <button type="button" class="lecture-action-btn watch watch-secure"
            data-library-id="${escapeHtml(libraryId)}" data-video-guid="${escapeHtml(v.bunnyGuid)}">
            <span class="action-icon">${ICONS.play}</span>
            <span><span class="label-main">${label}</span><span class="label-sub">تشغيل الفيديو</span></span>
          </button>
          <div class="video-player-slot" data-player-for="${escapeHtml(v.bunnyGuid)}"></div>`;
      }
      // رابط فيديو خارجي (مش Bunny): يفتح بنافذة جديدة زي ما كان
      return `
        <a class="lecture-action-btn watch" href="${escapeHtml(v.url)}" target="_blank" rel="noopener">
          <span class="action-icon">${ICONS.play}</span>
          <span><span class="label-main">${label}</span><span class="label-sub">تشغيل الفيديو</span></span>
        </a>`;
    }).join('');
    const fileRowsHtml = files.map((f,idx)=>`
      <a class="lecture-action-btn download" href="${escapeHtml(f.url)}" target="_blank" rel="noopener">
        <span class="action-icon">${ICONS.download}</span>
        <span><span class="label-main">${f.label ? escapeHtml(f.label) : ('تحميل الملف' + (files.length>1 ? ' '+(idx+1) : ''))}</span><span class="label-sub">نسخة PDF</span></span>
      </a>`).join('');
    const hasMedia = videos.length || files.length;
    const isStudent = state.session && state.session.type === 'student';
    const watched = isStudent && isLectureWatched(l.id);
    return `
    <details class="lecture-row ${unlocked?'':'locked'} ${watched?'watched':''}">
      <summary class="lecture-row-summary">
        <div class="lecture-num">${watched ? '✓' : (i+1)}</div>
        <div class="lecture-row-main">
          <h4>${escapeHtml(l.title)}</h4>
        </div>
        <span class="lecture-toggle-icon"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg></span>
      </summary>
      <div class="lecture-row-content">
        ${l.description ? `<p style="font-size:13.5px; color:var(--muted); margin-bottom:12px;">${escapeHtml(l.description)}</p>` : ''}
        ${unlocked && isStudent ? `
        <label class="watch-toggle">
          <input type="checkbox" data-watch-toggle="${l.id}" ${watched ? 'checked' : ''}>
          <span>${watched ? 'تمت مشاهدتها ✓' : 'وسمّها كمشاهَدة بعد الانتهاء'}</span>
        </label>` : ''}
        ${unlocked ? `
        <div class="lecture-actions">
          ${hasMedia ? (videoRowsHtml + fileRowsHtml) : `<div class="lecture-lock-msg">${ICONS.play} لم تتم إضافة فيديو أو ملف لهذه المحاضرة بعد</div>`}
        </div>` : `
        <div class="lecture-lock-msg">${ICONS.lock} ${lockMsg}</div>`}
        ${canManageLectures ? `<div class="lecture-row-admin"><button class="btn edit small" data-edit-lecture="${l.id}">${ICONS.edit} تعديل</button><button class="btn danger small" data-del-lecture="${l.id}">${ICONS.trash} حذف المحاضرة</button></div>` : ''}
      </div>
    </details>
  `;
  }

  const sectionGroupsHtml = sectionsToShow.map(section=>{
    const secLectures = lectures.filter(l=>l.section===section);
    const unlocked = sectionUnlocked(courseId, section);
    const isFree = !!course.pricing[section];

    let statusBadge, actionHtml = '';
    if(canManageLectures){
      statusBadge = `<span class="lecture-tier-tag ${isFree?'':'locked'}">${isFree ? '🆓 مجاني' : '💳 مدفوع'}</span>`;
    } else if(unlocked){
      statusBadge = `<span class="lecture-tier-tag">✅ مفعّل</span>`;
    } else if(isFree){
      statusBadge = `<span class="lecture-tier-tag">🆓 مجاني</span>`;
      actionHtml = state.session && state.session.type==='student'
        ? `<div class="lecture-lock-msg">${ICONS.lock} اشترك مجانًا لفتح محاضرات ${SECTION_LABELS[section]} <button class="btn teal solid small" data-self-enroll-section="${courseId}|${section}" style="margin-inline-start:8px;">${ICONS.plus} اشترك الآن</button></div>`
        : `<div class="lecture-lock-msg">${ICONS.lock} سجّل الدخول للاشتراك المجاني بهذا القسم — <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></div>`;
    } else {
      statusBadge = `<span class="lecture-tier-tag locked">💳 مدفوع</span>`;
      actionHtml = `<div class="lecture-lock-msg">${ICONS.lock} قسم ${SECTION_LABELS[section]} مدفوع، يتم التفعيل من قبل الإدارة</div>`;
    }

    const lockMsg = unlocked ? '' : (isFree ? `اشترك مجانًا بقسم ${SECTION_LABELS[section]} لفتح هذه المحاضرة` : 'قسم مدفوع');
    const rowsHtml = secLectures.length
      ? `${!canManageLectures && actionHtml ? actionHtml : ''}<div class="lecture-list">${secLectures.map((l,i)=>lectureRowHtml(l,i,unlocked,lockMsg)).join('')}</div>`
      : `<div class="section-group-empty">${canManageLectures ? 'لا توجد محاضرات بهذا القسم بعد.' : 'سيتم إضافة محاضرات هذا القسم قريبًا.'}</div>`;

    return `
    <details class="section-group">
      <summary class="section-group-summary">
        <div class="section-num-badge">${SECTION_NUM[section]}</div>
        <div class="section-group-title">
          <div>
            <h3>${SECTION_LABELS[section]}</h3>
            <p>${secLectures.length} محاضرة</p>
          </div>
        </div>
        <div class="section-group-status">${statusBadge}</div>
        <span class="lecture-toggle-icon"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg></span>
      </summary>
      <div class="section-group-content">${rowsHtml}</div>
    </details>`;
  }).join('');

  let sideAction = '';
  let sideStatus = '';
  if(isAdmin){
    sideStatus = priceBadgeHtml(course, true);
    sideAction = `
      <button class="btn edit small" id="editCourseBtn">${ICONS.edit} تعديل بيانات الكورس</button>
      <button class="btn teal solid small" id="enrollStudentBtn">${ICONS.plus} تفعيل للطلاب</button>
      <button class="btn small" id="exportEnrollBtn">📊 تحميل قائمة المسجلين (إكسيل)</button>
      <button class="btn small" id="importEnrollBtn">📥 استيراد / مزامنة من ملف إكسيل</button>
      <button class="btn danger small" id="resetDeviceBtn">${ICONS.lock} إعادة تعيين أجهزة الطالب</button>
    `;
  } else if(isOwnerTeacher){
    const teacherEnrolledCount = enrollmentsFor(courseId).length;
    sideStatus = `<span class="lecture-tier-tag">👨‍🏫 أنت مدرّس هذه المادة</span>`;
    sideAction = `
      <div class="hint" style="margin-top:2px;">عدد الطلاب المشتركين بهذه المادة: <b>${teacherEnrolledCount}</b></div>
      <button class="btn teal solid small" id="manageBankBtn">🛠 إدارة بنك أسئلة هذه المادة</button>
      <button class="btn small" id="sendCourseNotifBtn">📢 إرسال إشعار للمشتركين</button>
    `;
  } else if(courseFullyUnlocked(courseId)){
    sideStatus = `<span class="lecture-tier-tag">✅ الكورس مفعّل بالكامل لديك</span>`;
  } else if(courseUnlocked(courseId)){
    sideStatus = `<span class="lecture-tier-tag">✅ مفعّل جزئيًا — افتح الأقسام أدناه لمعرفة التفاصيل</span>`;
  } else {
    sideStatus = `<span class="lecture-tier-tag locked">🔒 غير مفعّل — الاشتراك يكون لكل قسم على حدة (فيرست/ميد/فاينال) من القائمة أدناه</span>`;
  }

  const enrollAdminBox = isAdmin ? `
    <div class="enroll-box">
      <h4>الطلاب المفعّلين حسب القسم</h4>
      ${courseSecs.map(section=>{
        const list = enrollmentsForSection(courseId, section);
        return `
        <p style="font-size:12.5px; font-weight:800; color:var(--navy-2); margin:10px 0 4px;">${SECTION_LABELS[section]}</p>
        ${list.length ? `<div class="enroll-list">${list.map(e=>`<span class="enroll-chip">🎓 ${escapeHtml(e.phone)}${!e.section ? ' (تفعيل كامل قديم)' : ''} <button data-unenroll="${escapeHtml(e.phone)}" data-unenroll-section="${section}" title="إلغاء التفعيل">✕</button></span>`).join('')}</div>` : `<p style="color:var(--muted); font-size:13px;">لا يوجد طلاب مفعّلين بعد.</p>`}
        `;
      }).join('')}
    </div>` : '';

  /* سجل الإشعارات المرسلة لمشتركي هذه المادة تحديدًا (المدرّس بس يشوف/يحذف إشعارات مادته) */
  const courseNotifBox = isOwnerTeacher ? (()=>{
    const sent = state.notifications.filter(n=>n.target==='course' && n.targetValue===courseId).sort((a,b)=>b.createdAt-a.createdAt);
    return `
    <div class="enroll-box">
      <h4>الإشعارات المرسلة لهذه المادة</h4>
      ${sent.length ? sent.map(n=>`
        <div class="message-card" style="margin-bottom:10px;">
          <div class="m-head">
            <b>${escapeHtml(n.title)}</b>
            <button class="btn danger small" data-del-course-notif="${escapeHtml(n.id)}">${ICONS.trash} حذف</button>
          </div>
          <p style="margin-top:4px; font-size:13.5px;">${escapeHtml(n.body)}</p>
          <p style="margin-top:6px; font-size:12px; color:var(--muted);">${new Date(n.createdAt).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'})}</p>
        </div>`).join('') : `<p style="color:var(--muted); font-size:13px;">لم تُرسِل أي إشعار لطلاب هذه المادة بعد.</p>`}
    </div>`;
  })() : '';

  return `
  <section class="section">
    <div class="container">
      <div class="breadcrumb"><a href="/courses">الدورات</a> / <span class="i18n-skip">${escapeHtml(course.title)}</span></div>

      <div class="course-hero-banner">
        <div class="course-hero-banner-inner">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <div class="course-uni">${escapeHtml(course.university)}</div>
            <span class="chip" style="cursor:default; padding:4px 10px; font-size:12px;">${escapeHtml(course.major || 'التمريض')}</span>
          </div>
          <h1 class="i18n-skip">${escapeHtml(course.title)}</h1>
          <p class="i18n-skip">${escapeHtml(course.description)}</p>
          <p class="course-coverage-line i18n-skip">تغطية شاملة لمادة ${escapeHtml(course.title)} لطلاب ${escapeHtml(course.major || 'التمريض')} في ${escapeHtml(course.university)}: محاضرات، ملخصات، وأسئلة سنوات سابقة على منصة MEDORA.</p>
          <div class="course-detail-meta">
            <span>⏱ <b>${course.hours}</b> ساعات معتمدة</span>
            <span>🎬 <b>${lectures.length}</b> محاضرة</span>
          </div>
        </div>
      </div>

      <div class="course-detail-layout">
        <div class="course-detail-main">
          <div class="toolbar">
            <h2 style="font-size:22px;">محاضرات الكورس</h2>
            ${canManageLectures ? `<button class="btn teal solid" id="addLectureBtn">${ICONS.plus} إضافة محاضرة</button>` : ''}
          </div>
          ${sectionsToShow.length ? `<div class="section-group-list">${sectionGroupsHtml}</div>` : `<div class="empty-state"><h3>لا توجد محاضرات بعد</h3><p>${canManageLectures ? 'أضف أول محاضرة لهذا الكورس.' : 'سيتم إضافة المحاضرات قريبًا.'}</p></div>`}
        </div>

        <div class="course-detail-side">
          <div class="course-side-card">
            <h4>حالة الاشتراك</h4>
            <div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
              ${sideStatus}
              ${sideAction}
            </div>
            ${enrollAdminBox}
            ${courseNotifBox}
          </div>
          <div class="course-side-card">
            <h4>مواصفات الدورة</h4>
            <div class="course-spec-row"><span>⏱ الساعات المعتمدة</span><b>${course.hours}</b></div>
            <div class="course-spec-row"><span>🎬 عدد المحاضرات</span><b>${lectures.length}</b></div>
            <div class="course-spec-row"><span>🏫 الجامعة</span><b>${escapeHtml(course.university)}</b></div>
            <div class="course-spec-row"><span>📚 التخصص</span><b>${escapeHtml(course.major || 'التمريض')}</b></div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: QUESTION BANK — admin management view
   ========================================================= */
function natureLabel(n){ return n === 'ref' ? 'أسئلة مراجع' : 'أسئلة سنوات سابقة'; }

/* واجهة توليد عشوائي مستقر (نفس السؤال يعطي نفس الترتيب دائمًا)، تُستخدم لخلط خيارات
   الطرف الأيمن في سؤال التوصيل بحيث ما تكون بنفس ترتيب اليسار */
function shuffledIndices(n, seed){
  const arr = Array.from({length:n}, (_,i)=>i);
  let s = 0; for(const ch of String(seed||'')) s = (s*31 + ch.charCodeAt(0)) % 233280;
  for(let i=arr.length-1;i>0;i--){
    s = (s*9301+49297) % 233280;
    const j = Math.floor((s/233280)*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

/* عرض محتوى السؤال (نص فقط، بدون تفاعل) حسب نمطه — تُستخدم في بطاقة إدارة بنك
   الأسئلة و My Notes، حيث الإجابة الصحيحة تظهر دائمًا */
function questionContentHtml(q){
  const type = q.type || 'mcq';
  if(type === 'written'){
    return `<div class="q-type-tag">✍️ سؤال كتابي</div>${q.modelAnswer ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left;"><b>Model Answer:</b> ${escapeHtml(q.modelAnswer)}</div>` : `<p class="hint" style="margin:0;">بدون نموذج إجابة محفوظ.</p>`}`;
  }
  if(type === 'matching'){
    const rows = (q.pairs||[]).map((p,i)=>`<div class="q-opt" style="display:flex; justify-content:space-between; gap:10px;"><span><b>${i+1}.</b> ${escapeHtml(p.left)}</span><span>↔ ${escapeHtml(p.right)}</span></div>`).join('');
    return `<div class="q-type-tag">🔗 سؤال توصيل</div><div class="q-options i18n-skip" dir="ltr" style="text-align:left; grid-template-columns:1fr;">${rows}</div>`;
  }
  return `<div class="q-options i18n-skip" dir="ltr" style="text-align:left;">${(q.options||[]).map((opt,i)=>`<div class="q-opt ${i===q.correctIndex?'correct':''}"><b>${String.fromCharCode(65+i)}.</b> ${escapeHtml(opt)}</div>`).join('')}</div>`;
}

function bankManageQuestionCard(q){
  const lec = q.lectureId ? state.lectures.find(l=>l.id===q.lectureId) : null;
  return `
  <div class="q-card">
    <span class="q-tag ${q.nature==='ref'?'ref':'past'}">${natureLabel(q.nature)}</span>
    ${lec ? `<span class="q-tag" style="background:var(--teal-light); color:var(--teal);">${escapeHtml(lec.title)}</span>` : `<span class="q-tag" style="background:var(--bg); color:var(--muted);">سؤال عام</span>`}
    <div class="q-text i18n-skip" dir="ltr" style="text-align:left;">${renderRichContent(q.question)}</div>
    ${questionContentHtml(q)}
    ${q.explanation ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left;"><b>Explanation:</b> ${renderRichContent(q.explanation)}</div>` : ''}
    <div class="q-card-foot"><button class="btn edit small" data-edit-question="${q.id}">${ICONS.edit} تعديل</button><button class="btn danger small" data-del-question="${q.id}">${ICONS.trash} حذف السؤال</button></div>
  </div>
`;
}

/* شريط الفلترة أعلى إدارة بنك الأسئلة: يختار المشرف المادة ثم المحاضرة من قائمتين
   منسدلتين، فتُعرض أسئلة تلك المحاضرة فقط بدل كل أسئلة المادة دفعة واحدة */
function bankManageFilteredQuestions(){
  const courseId = state.bankManageCourseId;
  if(!courseId) return [];
  let qs = state.questions.filter(q => q.courseId === courseId);
  const lecFilter = state.bankManageLectureId;
  if(lecFilter === '__none__') qs = qs.filter(q => !q.lectureId);
  else if(lecFilter) qs = qs.filter(q => q.lectureId === lecFilter);
  return qs;
}

function pageBankManage(){
  /* المدرّس يدير بنك أسئلة كورسه هو فقط — حماية واجهة، لا فرق DB بين الكورسات فعليًا */
  const manageableCourses = isTeacherSession()
    ? state.courses.filter(c=>c.teacherId===state.session.teacherId)
    : state.courses;
  if(!state.bankManageCourseId || !manageableCourses.some(c=>c.id===state.bankManageCourseId)){
    state.bankManageCourseId = manageableCourses[0] ? manageableCourses[0].id : null;
    state.bankManageLectureId = '';
  }
  const courseOptions = manageableCourses.map(c=>`<option class="i18n-skip" value="${c.id}" ${state.bankManageCourseId===c.id?'selected':''}>${escapeHtml(c.title)}</option>`).join('');
  const courseLectures = state.lectures.filter(l=>l.courseId===state.bankManageCourseId);
  const lectureOptions = `<option value="" ${!state.bankManageLectureId?'selected':''}>كل المحاضرات</option>`
    + `<option value="__none__" ${state.bankManageLectureId==='__none__'?'selected':''}>أسئلة عامة (غير مرتبطة بمحاضرة)</option>`
    + courseLectures.map(l=>`<option value="${l.id}" ${state.bankManageLectureId===l.id?'selected':''}>${escapeHtml(l.title)}</option>`).join('');

  const filterBar = `
    <div class="card-panel" style="padding:20px 22px; margin-bottom:20px;">
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <div class="field" style="flex:1; min-width:220px; margin-bottom:0;">
          <label>المادة</label>
          <select id="bankManageCourseSelect" class="bank-select">${courseOptions}</select>
        </div>
        <div class="field" style="flex:1; min-width:220px; margin-bottom:0;">
          <label>المحاضرة</label>
          <select id="bankManageLectureSelect" class="bank-select">${lectureOptions}</select>
        </div>
      </div>
    </div>`;

  let body;
  if(!manageableCourses.length){
    body = isTeacherSession()
      ? `<div class="empty-state"><h3>لا يوجد كورس مرتبط بحسابك بعد</h3><p>تواصل مع إدارة المنصة لربط حسابك بالمادة التي تدرّسها.</p></div>`
      : `<div class="empty-state"><h3>لا يوجد كورسات بعد</h3><p>أضف كورسات أولًا من صفحة الدورات.</p></div>`;
  } else {
    const qs = bankManageFilteredQuestions();
    const title = state.bankManageLectureId === '__none__' ? 'الأسئلة العامة'
      : state.bankManageLectureId ? (courseLectures.find(l=>l.id===state.bankManageLectureId)?.title || '')
      : 'كل أسئلة هذه المادة';
    body = `<div class="qbank-group"><div class="qbank-group-title"><span class="i18n-skip">${escapeHtml(title)}</span> <span class="count">${qs.length} سؤال</span></div>${qs.length ? qs.map(bankManageQuestionCard).join('') : `<div class="empty-state" style="padding:26px;"><p>لا توجد أسئلة هنا بعد.</p></div>`}</div>`;
  }

  return `
  <section class="section">
    <div class="container">
      <div class="toolbar">
        <h2>إدارة بنك الأسئلة</h2>
        <div class="toolbar-actions">
          <button class="btn small" id="toExamModeBtn">↩ الانتقال لواجهة الاختبار</button>
          <button class="btn small" id="importQuestionsBtn">📄 استيراد من ملف (PDF/Word)</button>
          <button class="btn teal solid" id="addQuestionBtn">${ICONS.plus} إضافة سؤال جديد</button>
        </div>
      </div>
      ${manageableCourses.length ? filterBar : ''}
      ${body}
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: QUESTION BANK — exam wizard + runner
   ========================================================= */
function isLectureIncluded(lid){
  if(quiz.selectedLectures === null) return true;
  return quiz.selectedLectures.includes(lid);
}
/* تتأكد أن محاضرة معيّنة تنتمي لقسم (فيرست/ميد/فاينال) مفعّل فعليًا لدى الطالب
   قبل حساب أو تضمين أسئلتها في بنك الأسئلة، حتى لا تظهر أسئلة أقسام غير مفتوحة. */
function isLectureAccessibleForBank(lid){
  const l = state.lectures.find(x=>x.id===lid);
  if(!l) return false;
  return sectionUnlocked(l.courseId, l.section);
}

function pageBankSetup(){
  const isAdmin = state.session && state.session.type === 'admin';
  const canManageBank = isAdmin || isTeacherSession();
  const adminToggle = canManageBank ? `<div style="text-align:center; margin-bottom:22px;"><button class="btn small" id="toManageBtn">🛠 إدارة بنك الأسئلة (إضافة / تعديل / حذف)</button></div>` : '';
  const isStudent = state.session && state.session.type === 'student';
  const notesCount = isStudent ? mySavedQuestions().length : 0;
  const notesToggle = isStudent ? `<div style="text-align:center; margin-bottom:22px;"><button class="btn teal small" id="toMyNotesBtn" dir="ltr">📌 My Notes${notesCount ? ` <span class="count" style="background:rgba(255,255,255,0.25); color:inherit; padding:2px 8px; border-radius:999px; margin-inline-start:4px;">${notesCount}</span>` : ''}</button></div>` : '';

  let universityBlock = '';
  let majorBlock = '';
  let eligibleCourses = state.courses;
  if(!isAdmin){
    const studentUni = (state.session && state.session.type === 'student') ? state.session.university : null;
    if(studentUni){
      quiz.university = studentUni;
      universityBlock = `
      <div class="bank-block">
        <div class="bank-block-label">الجامعة</div>
        <div class="bank-select" style="display:flex; align-items:center; justify-content:space-between; gap:10px; cursor:default;">
          <span>🎓 ${escapeHtml(studentUni)}</span>
          <span class="lecture-tier-tag">جامعتك</span>
        </div>
      </div>`;
    } else {
      const uniOptions = `<option value="">— اختر الجامعة —</option>` + UNIVERSITIES.map(u=>`<option value="${escapeHtml(u.name)}" ${quiz.university===u.name?'selected':''}>${escapeHtml(u.name)}</option>`).join('');
      universityBlock = `
      <div class="bank-block">
        <div class="bank-block-label">الجامعة</div>
        <select id="bankUniversitySelect" class="bank-select">${uniOptions}</select>
      </div>`;
    }

    const studentMajor = (state.session && state.session.type === 'student') ? state.session.major : null;
    if(studentMajor){
      quiz.major = studentMajor;
      majorBlock = `
      <div class="bank-block">
        <div class="bank-block-label">التخصص</div>
        <div class="bank-select" style="display:flex; align-items:center; justify-content:space-between; gap:10px; cursor:default;">
          <span>🦷 ${escapeHtml(studentMajor)}</span>
          <span class="lecture-tier-tag">تخصصك</span>
        </div>
      </div>`;
    } else {
      const majorOptions = `<option value="">— اختر التخصص —</option>` + MAJORS.map(m=>`<option value="${escapeHtml(m.name)}" ${quiz.major===m.name?'selected':''}>${escapeHtml(m.name)}</option>`).join('');
      majorBlock = `
      <div class="bank-block">
        <div class="bank-block-label">التخصص</div>
        <select id="bankMajorSelect" class="bank-select">${majorOptions}</select>
      </div>`;
    }
    eligibleCourses = (quiz.university && quiz.major)
      ? state.courses.filter(c => (c.university === quiz.university || c.university === 'عام') && (c.major || 'التمريض') === quiz.major && courseUnlocked(c.id))
      : [];
  }

  const courseSelectDisabled = (!isAdmin && !(quiz.university && quiz.major)) ? 'disabled' : '';
  const courseOptions = `<option value="">— اختر المادة —</option>` + eligibleCourses.map(c=>`<option value="${c.id}" ${quiz.courseId===c.id?'selected':''}>${escapeHtml(c.title)} — ${escapeHtml(c.university)} / ${escapeHtml(c.major || 'التمريض')}</option>`).join('');
  const courseCardsHtml = `<select id="bankCourseSelect" class="bank-select i18n-skip" ${courseSelectDisabled?'disabled':''}>${courseOptions}</select>`;
  const noEligibleHint = (!isAdmin && quiz.university && quiz.major && eligibleCourses.length===0)
    ? `<p class="hint" style="margin:10px 0 0;">لا توجد لديك مواد مشترك بها ضمن هذا التخصص والجامعة. اشترك بكورس من صفحة الدورات أولًا.</p>` : '';

  let natureBlock = '', lecturesBlock = '', countBlock = '', modeBlock = '', startBlock = '';

  if(quiz.courseId){
    const natureOptions = [
      {v:'past', label:'أسئلة سنوات سابقة'},
      {v:'ref', label:'أسئلة مراجع'},
      {v:'both', label:'كلاهما معًا'},
    ];
    natureBlock = `
    <div class="bank-block">
      <div class="bank-block-label">طبيعة الأسئلة</div>
      <div class="option-cards small">
        ${natureOptions.map(o=>`<div class="option-card ${quiz.nature===o.v?'selected':''}" data-nature="${o.v}" style="cursor:pointer;"><b>${o.label}</b></div>`).join('')}
      </div>
    </div>`;

    /* الطالب لا يرى إلا محاضرات الأقسام (فيرست/ميد/فاينال) المفعّلة لديه فعليًا لهذا الكورس؛
       الأدمن يرى الجميع لأن sectionUnlocked تعتبره مفعّلًا بكل الأقسام دائمًا. */
    const allCourseLectures = state.lectures.filter(l=>l.courseId===quiz.courseId);
    const lectures = allCourseLectures.filter(l=> sectionUnlocked(quiz.courseId, l.section));
    const lockedLecturesCount = allCourseLectures.length - lectures.length;
    const countFor = (lid) => state.questions.filter(q=>q.courseId===quiz.courseId && q.lectureId===lid && (quiz.nature==='both' || (q.nature||'past')===quiz.nature)).length;
    const generalCount = state.questions.filter(q=>q.courseId===quiz.courseId && !q.lectureId && (quiz.nature==='both' || (q.nature||'past')===quiz.nature)).length;

    const sectionsWithLectures = SECTIONS.filter(s=>lectures.some(l=>l.section===s));
    const lectureGroupsHtml = sectionsWithLectures.map(section=>{
      const secLectures = lectures.filter(l=>l.section===section);
      const rows = secLectures.map(l=>{
        const c = countFor(l.id);
        const included = isLectureIncluded(l.id);
        return `<label class="lecture-select-row ${c===0?'muted':''}">
          <span><input type="checkbox" data-lecture-toggle="${l.id}" ${included?'checked':''} ${c===0?'disabled':''}> ${escapeHtml(l.title)}</span>
          <span class="count-badge">${c} سؤال</span>
        </label>`;
      }).join('');
      return `
      <div class="bank-section-group">
        <div class="bank-section-group-head">
          <span class="section-num-badge">${SECTION_NUM[section]}</span>
          <b>${SECTION_LABELS[section]}</b>
          <span class="hint">(${secLectures.length} محاضرة)</span>
        </div>
        <div class="lecture-select-list">${rows}</div>
      </div>`;
    }).join('');

    lecturesBlock = `
    <div class="bank-block">
      <div class="bank-block-label">المحاضرات <button type="button" class="link-btn" id="toggleAllLectures">تحديد / إلغاء الكل</button></div>
      ${lectures.length ? lectureGroupsHtml : `<p class="hint" style="margin:0;">لا توجد محاضرات متاحة لك بعد ضمن الأقسام المفعّلة لهذا الكورس.</p>`}
      ${generalCount ? `<p class="hint" style="margin:12px 0 0; text-align:start;">+ ${generalCount} سؤال عام غير مرتبط بمحاضرة محددة (يُضاف تلقائيًا)</p>` : ''}
      ${!isAdmin && lockedLecturesCount ? `<p class="hint" style="margin:12px 0 0; text-align:start;">🔒 توجد ${lockedLecturesCount} محاضرة ضمن أقسام غير مفعّلة لديك، اشترك بقسمها من صفحة الكورس لتظهر أسئلتها هنا.</p>` : ''}
    </div>`;

    const available = state.questions.filter(q=>q.courseId===quiz.courseId)
      .filter(q=> quiz.nature==='both' || (q.nature||'past')===quiz.nature)
      .filter(q=> !q.lectureId || (isLectureIncluded(q.lectureId) && isLectureAccessibleForBank(q.lectureId)))
      .length;

    countBlock = `
    <div class="bank-block">
      <div class="bank-block-label">عدد الأسئلة <span style="font-weight:600; color:var(--muted); font-size:13px;">المتاح: ${available}</span></div>
      <div class="count-input-row"><input type="number" id="customCountInput" class="count-chip" style="width:120px; text-align:center;" min="1" max="50" placeholder="مثال: 10" value="${quiz.count || ''}"></div>
      <p class="hint" style="margin:8px 0 0; text-align:center;">اكتب عدد الأسئلة الذي تريده (الحد الأقصى 50 سؤالًا)</p>
    </div>`;

    modeBlock = `
    <div class="bank-block">
      <div class="bank-block-label">طبيعة الاختبار</div>
      <div class="option-cards">
        <div class="option-card ${quiz.mode==='study'?'selected':''}" data-mode="study" style="cursor:pointer;"><b>📖 نظام دراسي</b><span>شاهد الإجابة الصحيحة والتفسير مباشرة بعد كل سؤال</span></div>
        <div class="option-card ${quiz.mode==='exam'?'selected':''}" data-mode="exam" style="cursor:pointer;"><b>⏱ نظام اختبار</b><span>أجب عن جميع الأسئلة، ثم شاهد نتيجتك النهائية</span></div>
      </div>
    </div>`;

    startBlock = `
    <div style="text-align:center; margin-top:6px;">
      <button class="btn teal solid" id="startQuizBtn" ${available===0?'disabled':''}>ابدأ الاختبار</button>
      ${available===0 ? `<p class="hint" style="margin-top:10px;">لا توجد أسئلة مطابقة لهذا الاختيار حاليًا.</p>` : ''}
    </div>`;
  }

  return adminToggle + notesToggle + `
  <section class="section">
    <div class="wizard-wrap">
      ${isStudent ? `<div style="margin-bottom:18px;"><a href="/student-space" class="btn small">→ العودة إلى مساحة الطالب</a></div>` : ''}
      <div class="wizard-card">
        <h3>ابدأ اختبارًا من بنك الأسئلة</h3>
        <p class="hint">حدد ${(isAdmin || (state.session && state.session.type==='student' && state.session.university && state.session.major)) ? '' : 'الجامعة والتخصص ثم '}المادة، ثم طبيعة الأسئلة والمحاضرات، ونمط الاختبار، ثم ابدأ — كل ذلك في هذه الصفحة</p>
        ${universityBlock}
        ${majorBlock}
        <div class="bank-block">
          <div class="bank-block-label">المادة</div>
          <div style="display:flex; flex-direction:column; gap:8px;">${courseCardsHtml}</div>
          ${noEligibleHint}
        </div>
        ${natureBlock}
        ${lecturesBlock}
        ${countBlock}
        ${modeBlock}
        ${startBlock}
      </div>
    </div>
  </section>`;
}

/* ---------------- My Notes: صفحة مستقلة تظهر لما الطالب يضغط زر My Notes ----------------
   فيها كل الأسئلة اللي حفظها الطالب أثناء الاختبار أو مراجعة النتيجة. */
function pageMyNotes(){
  const savedQs = mySavedQuestions();
  const cards = savedQs.map(q=>{
    const course = state.courses.find(c=>c.id===q.courseId);
    return `
    <div class="q-card">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:4px;">
        ${course ? `<span class="q-tag i18n-skip" style="background:var(--teal-light); color:var(--teal);">${escapeHtml(course.title)}</span>` : '<span></span>'}
        <button type="button" class="btn danger small" data-toggle-save="${q.id}">${ICONS.trash} Remove</button>
      </div>
      <div class="q-text i18n-skip" dir="ltr" style="text-align:left;">${renderRichContent(q.question)}</div>
      ${questionContentHtml(q)}
      ${q.explanation ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left;"><b>Explanation:</b> ${renderRichContent(q.explanation)}</div>` : ''}
    </div>`;
  }).join('');

  return `
  <section class="section">
    <div class="wizard-wrap">
      <div style="margin-bottom:18px;"><button class="btn small" id="backFromNotesBtn">→ رجوع لبنك الأسئلة</button></div>
      <div class="section-head" style="margin-bottom:24px;">
        <div class="eyebrow">MY NOTES</div>
        <h2 dir="ltr">📌 My Notes</h2>
        <p>Questions you save while practicing show up here for quick review, in English.</p>
      </div>
      ${savedQs.length ? cards : `<div class="empty-state"><h3 dir="ltr">No saved questions yet</h3><p dir="ltr">Tap "Save to My Notes" on any question during a quiz or in your results to add it here.</p></div>`}
    </div>
  </section>`;
}

function pageBankNoQuestions(){
  return `<section class="section"><div class="wizard-wrap"><div class="empty-state">
    <h3>لا توجد أسئلة مطابقة</h3>
    <p>لا يوجد أسئلة كافية لهذا الاختيار. جرّب تغيير طبيعة الأسئلة أو المادة.</p>
    <div style="margin-top:18px;"><button class="btn teal solid small" id="backToCourseBtn">رجوع لإعدادات الاختبار</button></div>
  </div></div></section>`;
}

/* هل الطالب أجاب على هذا السؤال (بأي نمط كان)؟ تُستخدم لتفعيل زر "التالي" */
function isQuestionAnswered(q){
  const type = q.type || 'mcq';
  const a = quiz.answers[q.id];
  if(type === 'written') return typeof a === 'string' && a.trim().length > 0;
  if(type === 'matching') return !!a && (q.pairs||[]).length>0 && (q.pairs||[]).every((_,i)=> a[i] !== undefined);
  return a !== undefined;
}

function pageBankRunning(){
  const q = quiz.pool[quiz.idx];
  const total = quiz.pool.length;
  const type = q.type || 'mcq';
  const answered = quiz.answers[q.id];
  const canProceed = isQuestionAnswered(q);
  const pct = Math.round(((quiz.idx) / total) * 100);

  let bodyHtml = '';
  let revealed = false;

  if(type === 'mcq'){
    revealed = quiz.mode === 'study' && answered !== undefined;
    const optionsHtml = (q.options||[]).map((opt, i) => {
      let cls = 'q-opt clickable';
      if(revealed){
        cls = 'q-opt';
        if(i === q.correctIndex) cls += ' correct';
        else if(i === answered) cls += ' wrong';
      } else if(answered === i){
        cls += ' correct';
      }
      return `<button class="${cls} i18n-skip" data-answer="${i}" dir="ltr" style="text-align:left;" ${revealed ? 'disabled' : ''}><b>${String.fromCharCode(65+i)}.</b> ${escapeHtml(opt)}</button>`;
    }).join('');
    bodyHtml = `<div class="quiz-options i18n-skip" dir="ltr">${optionsHtml}</div>`;
  } else if(type === 'written'){
    const showModel = !!(quiz.revealedWritten && quiz.revealedWritten[q.id]);
    bodyHtml = `
      <div class="written-answer-box">
        <textarea id="writtenAnswerInput" class="i18n-skip" dir="ltr" style="text-align:left;" placeholder="Type your answer here...">${escapeHtml(typeof answered==='string' ? answered : '')}</textarea>
      </div>
      ${q.modelAnswer ? `<button type="button" class="btn small" id="revealWrittenBtn">${showModel ? '🙈 إخفاء نموذج الإجابة' : '👁 إظهار نموذج الإجابة'}</button>` : ''}
      ${showModel && q.modelAnswer ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left; margin-top:10px;"><b>Model Answer:</b> ${escapeHtml(q.modelAnswer)}</div>` : ''}
      <div style="margin-bottom:10px;"></div>
    `;
  } else if(type === 'matching'){
    const a = answered || {};
    revealed = quiz.mode === 'study' && canProceed;
    const rightOrder = shuffledIndices((q.pairs||[]).length, q.id);
    const rows = (q.pairs||[]).map((p,i)=>{
      const selVal = a[i];
      let rowCls = 'match-answer-row';
      if(revealed) rowCls += (selVal === i) ? ' correct' : ' wrong';
      const options = `<option value="">— اختر —</option>` + rightOrder.map(j=>`<option value="${j}" ${selVal===j?'selected':''}>${escapeHtml(q.pairs[j].right)}</option>`).join('');
      return `<div class="${rowCls}"><span style="min-width:140px; font-weight:700;">${i+1}. ${escapeHtml(p.left)}</span><select class="match-answer-select" data-left-index="${i}" ${revealed?'disabled':''}>${options}</select>${revealed ? (selVal===i ? ' ✅' : ' ❌') : ''}</div>`;
    }).join('');
    bodyHtml = `<div class="match-answer-list">${rows}</div>`;
  }

  const isLast = quiz.idx === total - 1;

  const isStudent = state.session && state.session.type === 'student';
  const saved = isStudent && isQuestionSaved(q.id);
  const saveBtnHtml = isStudent
    ? `<button type="button" class="btn small ${saved?'teal solid':''}" data-toggle-save="${q.id}" style="margin-inline-start:8px;">${saved ? '★ Saved to My Notes' : '☆ Save to My Notes'}</button>`
    : '';

  return `
  <section class="section">
    <div class="wizard-wrap">
      <div class="quiz-topline">
        <span>السؤال ${quiz.idx+1} من ${total}</span>
        <span class="quiz-mode-badge">${quiz.mode === 'study' ? '📖 نظام دراسي' : '⏱ نظام اختبار'}</span>
      </div>
      <div class="quiz-progress-bar"><div style="width:${pct}%;"></div></div>
      <div class="wizard-card">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <span class="q-tag ${q.nature==='ref'?'ref':'past'}">${natureLabel(q.nature)}</span>
          ${saveBtnHtml}
        </div>
        <div class="quiz-q-text i18n-skip" dir="ltr" style="text-align:left;">${renderRichContent(q.question)}</div>
        ${bodyHtml}
        ${revealed && q.explanation ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left;"><b>Explanation:</b> ${renderRichContent(q.explanation)}</div>` : ''}
        <div class="wizard-nav">
          <button class="btn small" id="quitQuizBtn">إنهاء والخروج</button>
          <button class="btn teal solid" id="quizNextBtn" ${canProceed ? '' : 'disabled'}>${isLast ? 'إنهاء وعرض النتيجة' : 'السؤال التالي'}</button>
        </div>
      </div>
    </div>
  </section>
  `;
}

/* تُرجع true/false للأسئلة القابلة للتصحيح التلقائي (اختيار متعدد/توصيل)، و null للأسئلة الكتابية
   التي تحتاج مراجعة ذاتية من الطالب نفسه */
function isQuestionCorrect(q){
  const type = q.type || 'mcq';
  const a = quiz.answers[q.id];
  if(type === 'written') return null;
  if(type === 'matching'){
    if(!a || !(q.pairs||[]).length) return false;
    return q.pairs.every((_,i)=> a[i] === i);
  }
  return a === q.correctIndex;
}

function pageBankResults(){
  const total = quiz.pool.length;
  const gradable = quiz.pool.filter(q => (q.type||'mcq') !== 'written');
  const writtenCount = total - gradable.length;
  const correct = gradable.filter(q => isQuestionCorrect(q) === true).length;
  const pctScore = gradable.length ? Math.round((correct/gradable.length)*100) : 0;
  const isStudent = state.session && state.session.type === 'student';

  const review = quiz.pool.map((q,i) => {
    const type = q.type || 'mcq';
    const saved = isStudent && isQuestionSaved(q.id);
    const saveBtnHtml = isStudent
      ? `<button type="button" class="btn small ${saved?'teal solid':''}" data-toggle-save="${q.id}">${saved ? '★ Saved' : '☆ Save'}</button>`
      : '';

    let statusTag = '', bodyHtml = '';
    if(type === 'written'){
      const a = quiz.answers[q.id];
      statusTag = `<span class="ans-tag review">مراجعة ذاتية</span>`;
      bodyHtml = `<div class="i18n-skip" style="font-size:13.5px; color:var(--muted); direction:ltr; text-align:left;">إجابتك: ${a && a.trim() ? escapeHtml(a) : 'لم تُجب'}</div>
        ${q.modelAnswer ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left;"><b>Model Answer:</b> ${escapeHtml(q.modelAnswer)}</div>` : ''}`;
    } else if(type === 'matching'){
      const a = quiz.answers[q.id] || {};
      const isRight = isQuestionCorrect(q);
      statusTag = `<span class="ans-tag ${isRight?'right':'wrong'}">${isRight ? 'صحيح' : 'خاطئ'}</span>`;
      bodyHtml = (q.pairs||[]).map((p,pi)=>{
        const chosenIdx = a[pi];
        const chosenText = (chosenIdx!==undefined && q.pairs[chosenIdx]) ? q.pairs[chosenIdx].right : 'لم تُجب';
        const rowRight = chosenIdx === pi;
        return `<div class="i18n-skip" style="font-size:13px; color:${rowRight?'var(--good)':'var(--danger-dark)'}; direction:ltr; text-align:left;">${escapeHtml(p.left)} → ${escapeHtml(chosenText)}${!rowRight ? ' (الصحيح: ' + escapeHtml(p.right) + ')' : ''}</div>`;
      }).join('');
    } else {
      const chosen = quiz.answers[q.id];
      const isRight = chosen === q.correctIndex;
      statusTag = `<span class="ans-tag ${isRight?'right':'wrong'}">${isRight ? 'صحيح' : 'خاطئ'}</span>`;
      bodyHtml = `<div class="i18n-skip" style="font-size:13.5px; color:var(--muted); direction:ltr; text-align:left;">إجابتك: ${chosen!==undefined ? escapeHtml(q.options[chosen]) : 'لم تُجب'} ${!isRight ? ' — الصحيحة: ' + escapeHtml(q.options[q.correctIndex]) : ''}</div>`;
    }

    return `
    <div class="review-item">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:10px;">
        <b class="i18n-skip" style="color:var(--ink); font-size:14px; direction:ltr; text-align:left;">${i+1}. ${renderRichContent(q.question)}</b>
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
          ${statusTag}
          ${saveBtnHtml}
        </div>
      </div>
      ${bodyHtml}
      ${q.explanation ? `<div class="q-explain i18n-skip" dir="ltr" style="text-align:left;"><b>Explanation:</b> ${renderRichContent(q.explanation)}</div>` : ''}
    </div>`;
  }).join('');

  return `
  <section class="section">
    <div class="wizard-wrap">
      <div class="wizard-card" style="text-align:center;">
        <h3>نتيجة الاختبار</h3>
        <div class="score-circle"><b>${pctScore}%</b><span>${correct} من ${gradable.length}</span></div>
        ${writtenCount ? `<p class="hint" style="margin-top:-14px; margin-bottom:14px;">+ ${writtenCount} سؤال كتابي يحتاج مراجعة ذاتية (غير محتسب ضمن النسبة)</p>` : ''}
        <p style="color:var(--muted); font-size:14.5px; margin-bottom:24px;">${pctScore>=70 ? 'أداء ممتاز! استمر بالمراجعة 👏' : 'لا بأس، راجع الأسئلة أدناه وحاول مجددًا 💪'}</p>
        <button class="btn teal solid small" id="newQuizBtn">بدء اختبار جديد</button>
      </div>
      <div style="margin-top:26px; text-align:start;">${review}</div>
    </div>
  </section>
  `;
}

function pageBank(){
  const isAdmin = state.session && state.session.type === 'admin';
  if((isAdmin || isTeacherSession()) && state.bankAdminView) return pageBankManage();
  if(!state.session){
    return `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>سجّل الدخول أولًا</h3><p>بنك الأسئلة متاح فقط للطلاب المسجّلين. <a href="/login" style="color:var(--teal); font-weight:800;">تسجيل الدخول</a></p></div></div></section>`;
  }
  if(state.session.type === 'student' && state.bankNotesView) return pageMyNotes();
  switch(quiz.step){
    case 'no-questions': return pageBankNoQuestions();
    case 'running': return pageBankRunning();
    case 'results': return pageBankResults();
    default: return pageBankSetup();
  }
}

/* =========================================================
   PAGE: ADMIN ANALYTICS — لوحة إحصائيات للمشرف فقط
   (عدد الطلاب/الكورسات، توزيعهم حسب الجامعة والتخصص، أكثر الكورسات
   تفعيلًا، وتركيبة المحتوى بين مجاني/مدفوع)
   ========================================================= */
function pageAdminAnalytics(){
  if(!isAdminSession()){
    return `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>غير مصرّح</h3><p>هذه الصفحة مخصّصة للمشرف فقط. <a href="/admin-login" style="color:var(--teal); font-weight:800;">تسجيل دخول المشرف</a></p></div></div></section>`;
  }

  const totalStudents = state.students.length;
  const totalCourses = state.courses.length;
  const totalLectures = state.lectures.length;
  const totalQuestions = state.questions.length;
  const totalEnrollments = state.enrollments.length;
  const totalSummaries = state.summaries.length;

  const engagedPhones = new Set(state.enrollments.map(e=>e.phone));
  const engagedCount = state.students.filter(s=>engagedPhones.has(s.phone)).length;
  const engagedPct = totalStudents ? Math.round((engagedCount/totalStudents)*100) : 0;

  const uniCounts = UNIVERSITIES.map(u => ({ name:u.name, count: state.students.filter(s=>s.university===u.name).length }));
  const knownUniTotal = uniCounts.reduce((a,b)=>a+b.count,0);
  const otherUniCount = totalStudents - knownUniTotal;
  if(otherUniCount > 0) uniCounts.push({ name:'أخرى/غير محدد', count: otherUniCount });
  const maxUni = Math.max(1, ...uniCounts.map(u=>u.count));

  const majorCounts = MAJORS.map(m => ({ name:m.name, count: state.students.filter(s=>s.major===m.name).length }));
  const maxMajor = Math.max(1, ...majorCounts.map(m=>m.count));

  const courseEnrollCounts = state.courses
    .map(c => ({ title:c.title, count: enrollmentsFor(c.id).length }))
    .sort((a,b)=>b.count-a.count)
    .slice(0,5);
  const maxCourseEnroll = Math.max(1, ...courseEnrollCounts.map(c=>c.count));

  const freeCourses = state.courses.filter(c=>courseIsAllFree(c)).length;
  const paidCourses = state.courses.filter(c=>courseIsAllPaid(c)).length;
  const mixedCourses = totalCourses - freeCourses - paidCourses;

  const refQuestions = state.questions.filter(q=>q.nature==='ref').length;
  const pastQuestions = totalQuestions - refQuestions;

  const barRow = (label, count, max) => `
    <div class="analytics-row">
      <div class="analytics-row-head"><span>${escapeHtml(label)}</span><b>${count}</b></div>
      <div class="analytics-bar"><div style="width:${max ? Math.round((count/max)*100) : 0}%;"></div></div>
    </div>`;

  return `
  <section class="section">
    <div class="container">
      <div class="toolbar">
        <h2>لوحة التحليلات</h2>
        <button class="btn small" id="addTeacherBtn">👨‍🏫 إنشاء حساب مدرّس</button>
      </div>
      ${state.teachers && state.teachers.length ? `
      <div class="card-panel" style="padding:18px 20px; margin-bottom:24px;">
        <h3 style="margin-bottom:10px;">المدرّسون المسجّلون</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${state.teachers.map(t=>{
            const myCourses = state.courses.filter(c=>c.teacherId===t.id);
            return `<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap; font-size:13.5px; padding-bottom:10px; border-bottom:1px solid var(--border);">
              <div>
                <div>👨‍🏫 <b>${escapeHtml(t.fullName||t.username)}</b> <span style="color:var(--muted);">(${escapeHtml(t.username)})</span></div>
                <div style="color:var(--muted); margin-top:4px;">${myCourses.length ? myCourses.map(c=>'📚 '+escapeHtml(c.title)).join(' • ') : 'غير مرتبط بأي مادة حاليًا'}</div>
              </div>
              <div style="display:flex; gap:8px; flex-shrink:0;">
                <button class="btn edit small" data-edit-teacher="${t.id}">${ICONS.edit} تعديل</button>
                <button class="btn danger small" data-del-teacher="${t.id}">${ICONS.trash} حذف</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <div class="card-panel" style="padding:18px 20px; margin-bottom:24px;">
        <div class="toolbar" style="margin-bottom:12px;">
          <h3 style="margin:0;">الطلاب المسجّلون (${totalStudents})</h3>
          <input type="text" id="studentSearchInput" placeholder="🔍 ابحث بالاسم أو رقم الهاتف..." style="max-width:260px;">
        </div>
        <div id="studentsListWrap" style="display:flex; flex-direction:column; gap:10px; max-height:420px; overflow-y:auto;">
          ${totalStudents ? state.students.slice().sort((a,b)=>(a.fullName||'').localeCompare(b.fullName||'','ar')).map(s=>`
            <div class="student-row" data-student-search="${escapeHtml((s.fullName||'')+' '+s.phone)}" style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; font-size:13.5px; padding-bottom:10px; border-bottom:1px solid var(--border);">
              <div>
                <div>🧑‍🎓 <b>${escapeHtml(s.fullName||'—')}</b> <span style="color:var(--muted);">(${escapeHtml(s.phone||'')})</span></div>
                <div style="color:var(--muted); margin-top:4px;">${escapeHtml(s.university||'جامعة غير محددة')} • ${escapeHtml(s.major||'تخصص غير محدد')}</div>
              </div>
              <button class="btn danger small" data-del-student="${escapeHtml(s.phone)}">${ICONS.trash} حذف</button>
            </div>`).join('') : `<p style="color:var(--muted); font-size:13.5px;">لا يوجد طلاب مسجّلون بعد.</p>`}
        </div>
      </div>

      <div class="analytics-grid">
        <div class="analytics-kpi"><b>${totalStudents}</b><span>طالب مسجّل</span></div>
        <div class="analytics-kpi"><b>${totalCourses}</b><span>كورس</span></div>
        <div class="analytics-kpi"><b>${totalLectures}</b><span>محاضرة</span></div>
        <div class="analytics-kpi"><b>${totalQuestions}</b><span>سؤال في البنك</span></div>
        <div class="analytics-kpi"><b>${totalEnrollments}</b><span>تفعيل/اشتراك</span></div>
        <div class="analytics-kpi"><b>${engagedPct}%</b><span>نسبة الطلاب المفعّلين</span></div>
        <div class="analytics-kpi"><b>${totalSummaries}</b><span>ملخص من الطلاب</span></div>
        <div class="analytics-kpi"><b>${state.messages.length}</b><span>رسالة واردة</span></div>
      </div>

      <div class="analytics-cols">
        <div class="analytics-card">
          <h3>الطلاب حسب الجامعة</h3>
          ${uniCounts.filter(u=>u.count>0).length
            ? uniCounts.filter(u=>u.count>0).sort((a,b)=>b.count-a.count).map(u=>barRow(u.name,u.count,maxUni)).join('')
            : `<p style="color:var(--muted); font-size:13.5px;">لا يوجد طلاب مسجّلون بعد.</p>`}
        </div>
        <div class="analytics-card">
          <h3>الطلاب حسب التخصص</h3>
          ${totalStudents
            ? majorCounts.map(m=>barRow(m.name,m.count,maxMajor)).join('')
            : `<p style="color:var(--muted); font-size:13.5px;">لا يوجد طلاب مسجّلون بعد.</p>`}
        </div>
      </div>

      <div class="analytics-cols">
        <div class="analytics-card">
          <h3>الأكثر تفعيلًا (Top 5 كورسات)</h3>
          ${courseEnrollCounts.filter(c=>c.count>0).length
            ? courseEnrollCounts.filter(c=>c.count>0).map(c=>barRow(c.title,c.count,maxCourseEnroll)).join('')
            : `<p style="color:var(--muted); font-size:13.5px;">لا توجد تفعيلات بعد.</p>`}
        </div>
        <div class="analytics-card">
          <h3>تركيبة المحتوى</h3>
          ${barRow('كورسات مجانية بالكامل', freeCourses, totalCourses || 1)}
          ${barRow('كورسات مدفوعة بالكامل', paidCourses, totalCourses || 1)}
          ${barRow('كورسات بأسعار متعددة حسب القسم', mixedCourses, totalCourses || 1)}
          ${totalQuestions ? barRow('أسئلة مراجع', refQuestions, totalQuestions) : ''}
          ${totalQuestions ? barRow('أسئلة سنوات سابقة', pastQuestions, totalQuestions) : ''}
        </div>
      </div>

      <div class="toolbar" style="margin-top:30px;">
        <h2>🔔 إشعارات الطلاب</h2>
        <button class="btn teal solid small" id="sendNotifBtn">${ICONS.plus} إرسال إشعار جديد</button>
      </div>
      <div class="messages-list">
        ${state.notifications.length ? state.notifications.slice().sort((a,b)=>b.createdAt-a.createdAt).map(n=>`
          <div class="message-card">
            <div class="m-head">
              <b>${escapeHtml(n.title)}</b>
              <button class="btn danger small" data-del-notif="${escapeHtml(n.id)}">${ICONS.trash} حذف</button>
            </div>
            <p style="margin-top:4px;">${escapeHtml(n.body)}</p>
            <p style="margin-top:6px; font-size:13px; color:var(--muted);">🎯 ${escapeHtml(notifTargetLabel(n))} • ${new Date(n.createdAt).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'})}</p>
          </div>`).join('') : `<p style="color:var(--muted); font-size:13.5px;">لم تُرسَل أي إشعارات بعد.</p>`}
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: ADMIN COUPONS (كوبونات الفتح المجاني والخصم)
   ========================================================= */
function couponTargetLabel(coupon){
  if(!coupon.courseId){
    return coupon.section ? `🧑‍🎓 من اختيار الطالب — قسم ${SECTION_LABELS[coupon.section]} فقط` : '🧑‍🎓 المادة من اختيار الطالب — كل الأقسام';
  }
  const course = state.courses.find(c=>c.id===coupon.courseId);
  const courseTitle = course ? course.title : 'كورس محذوف';
  return coupon.section ? `${courseTitle} — قسم ${SECTION_LABELS[coupon.section]}` : `${courseTitle} — كل الأقسام`;
}
function couponCardHtml(coupon){
  const usesLeft = couponUsesLeft(coupon);
  const usesText = coupon.maxUses==null ? `${(coupon.usedBy||[]).length} استخدام (بدون حد أقصى)` : `${(coupon.usedBy||[]).length} / ${coupon.maxUses} استخدام`;
  const typeTag = coupon.type==='free' ? `<span class="lecture-tier-tag">🆓 فتح مجاني</span>` : `<span class="lecture-tier-tag locked">🏷️ خصم ${coupon.discountPercent}%</span>`;
  const expired = isCouponExpired(coupon);
  const expiryTag = coupon.expiresAt ? (expired
      ? `<span class="lecture-tier-tag locked" style="background:var(--danger); color:#fff;">⏰ منتهي الصلاحية</span>`
      : `<span class="lecture-tier-tag" style="margin-inline-start:6px;">⏳ ينتهي: ${new Date(coupon.expiresAt).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'})}</span>`)
    : '';
  const serials = (coupon.usedBy||[]).filter(u=>u.serial);
  const serialsHtml = serials.length ? `
      <details style="margin-top:8px;">
        <summary style="cursor:pointer; font-size:13px; color:var(--teal); font-weight:700;">🔎 عرض الأرقام التسلسلية للبطاقات الصادرة (${serials.length})</summary>
        <div style="margin-top:8px; display:flex; flex-direction:column; gap:4px;">
          ${serials.map(u=>`<div style="font-size:12.5px; color:var(--muted); direction:ltr; text-align:right;">${escapeHtml(u.serial)} — ${escapeHtml(u.phone)} — ${new Date(u.usedAt).toLocaleDateString('ar-JO')}</div>`).join('')}
        </div>
        <p class="hint" style="margin-top:6px; font-size:12px;">قارن هذا الرقم مع الرقم المكتوب على بطاقة الخصم التي أرسلها الطالب؛ إن لم يتطابق فالبطاقة مزوَّرة.</p>
      </details>` : '';
  return `
    <div class="message-card">
      <div class="m-head">
        <b style="direction:ltr; font-family:monospace; letter-spacing:1px;">${escapeHtml(coupon.code)}</b>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn small ${coupon.active?'teal':''}" data-toggle-coupon="${coupon.id}">${coupon.active ? '✅ مفعّل' : '⏸️ متوقف'}</button>
          <button class="btn danger small" data-del-coupon="${coupon.id}">${ICONS.trash} حذف</button>
        </div>
      </div>
      <p style="margin-top:4px;">${typeTag}${expiryTag} <span class="m-email" style="margin-inline-start:8px;">${escapeHtml(couponTargetLabel(coupon))}</span></p>
      <p style="margin-top:6px; font-size:13px; color:var(--muted);">الاستخدام: ${usesText}${coupon.note ? ` • ${escapeHtml(coupon.note)}` : ''}</p>
      ${serialsHtml}
    </div>`;
}
function pageAdminCoupons(){
  if(!isAdminSession()){
    return `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>غير مصرّح</h3><p>هذه الصفحة مخصّصة للمشرف فقط. <a href="/admin-login" style="color:var(--teal); font-weight:800;">تسجيل دخول المشرف</a></p></div></div></section>`;
  }
  const coupons = state.coupons.slice().sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
  return `
  <section class="section">
    <div class="container">
      <div class="toolbar">
        <h2>🎟️ كوبونات الخصم والفتح المجاني</h2>
        <button class="btn teal solid" id="addCouponBtn">${ICONS.plus} إنشاء كوبون جديد</button>
      </div>
      <p class="hint" style="margin:-10px 0 20px;">كوبون "الفتح المجاني" يفعّل الوصول للطالب مباشرة عند إدخاله. كوبون "الخصم بنسبة" لا يخصم مبلغًا آليًا (لا يوجد دفع إلكتروني بالمنصة)، بل يولّد للطالب بطاقة خصم فيها اسمه ورقمه ونسبة الخصم ورقم تسلسلي فريد، ليحمّلها ويرسلها للدعم الفني فيتحقق المشرف من الرقم التسلسلي (من قائمة "الأرقام التسلسلية" أسفل كل كوبون) ويكمل التفعيل يدويًا. يمكن أيضًا ضبط تاريخ انتهاء صلاحية لأي كوبون.</p>
      ${coupons.length ? coupons.map(couponCardHtml).join('') : `<div class="empty-state" style="padding:26px;"><p>لا توجد كوبونات بعد.</p></div>`}
    </div>
  </section>`;
}

function modalCreateCoupon(){
  const courseOptions = state.courses.map(c=>`<option class="i18n-skip" value="${c.id}">${escapeHtml(c.title)} — ${escapeHtml(c.university)} / ${escapeHtml(c.major || 'التمريض')}</option>`).join('');
  const firstCourseId = state.courses[0] ? state.courses[0].id : '';
  const sectionOptionsFor = (courseId)=>{
    const secs = courseId ? courseSections(courseId) : SECTIONS;
    return `<option value="">كل الأقسام</option>` + secs.map(s=>`<option value="${s}">${SECTION_LABELS[s]}</option>`).join('');
  };
  openModal(`
    <h3>${ICONS.plus} إنشاء كوبون جديد</h3>
    <form id="couponForm">
      <div class="field">
        <label>كود الكوبون</label>
        <div style="display:flex; gap:8px;">
          <input type="text" name="code" id="couponCodeInput" required value="${generateCouponCode()}" style="direction:ltr; font-family:monospace; letter-spacing:1px; text-transform:uppercase;">
          <button type="button" class="btn small" id="regenCouponCodeBtn">🎲 توليد</button>
        </div>
      </div>
      <div class="field">
        <label>نوع الكوبون</label>
        <select name="type" id="couponTypeSelect">
          <option value="free">🆓 فتح مجاني (يفتح مباشرة عند الاستخدام)</option>
          <option value="discount">🏷️ خصم بنسبة (رسالة توضيحية فقط، التفعيل يدوي)</option>
        </select>
      </div>
      <div class="field" id="couponDiscountField" style="display:none;">
        <label>نسبة الخصم %</label>
        <input type="number" name="discountPercent" min="1" max="100" value="20">
      </div>
      <div class="field">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700;">
          <input type="checkbox" id="couponStudentChooseCourse" style="width:18px; height:18px; accent-color:var(--teal);">
          اترك المادة ليختارها الطالب بنفسه عند تفعيل الكوبون
        </label>
        <p class="hint" style="margin-top:6px;">بدل تحديد كورس معيّن الآن، يقدر أي طالب يستخدم هذا الكود على المادة التي يختارها هو وقت التفعيل.</p>
      </div>
      <div id="couponCourseFieldWrap" class="field">
        <label>الكورس</label>
        <select name="courseId" id="couponCourseSelect">${courseOptions}</select>
      </div>
      <div class="field">
        <label>النطاق (الأقسام المشمولة بالكوبون)</label>
        <select name="section" id="couponSectionSelect">${sectionOptionsFor(firstCourseId)}</select>
        <p class="hint" id="couponSectionHint" style="margin-top:6px; display:none;">بما أن المادة من اختيار الطالب، اختر هنا القسم (فيرست/ميد/فاينال) الذي عليه الخصم أو الفتح، وسيُطبَّق على أي مادة يختارها — بشرط أن يكون هذا القسم موجودًا فيها.</p>
      </div>
      <div class="field">
        <label>الحد الأقصى لعدد مرات الاستخدام (اتركه فارغًا لعدد غير محدود)</label>
        <input type="number" name="maxUses" min="1" placeholder="بدون حد أقصى">
      </div>
      <div class="field">
        <label>تاريخ ووقت انتهاء الصلاحية (اختياري — اتركه فارغًا لكوبون بدون تاريخ انتهاء)</label>
        <input type="datetime-local" name="expiresAt">
      </div>
      <div class="field"><label>ملاحظة داخلية (اختياري)</label><input type="text" name="note" placeholder="مثال: كوبون حملة سناب شات"></div>
      <div id="couponMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ الكوبون</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  const codeInput = document.getElementById('couponCodeInput');
  document.getElementById('regenCouponCodeBtn').addEventListener('click', ()=>{ codeInput.value = generateCouponCode(); });
  const typeSelect = document.getElementById('couponTypeSelect');
  const discountField = document.getElementById('couponDiscountField');
  typeSelect.addEventListener('change', ()=>{ discountField.style.display = typeSelect.value==='discount' ? '' : 'none'; });
  const courseSelect = document.getElementById('couponCourseSelect');
  const sectionSelect = document.getElementById('couponSectionSelect');
  courseSelect.addEventListener('change', ()=>{ sectionSelect.innerHTML = sectionOptionsFor(courseSelect.value); });
  const studentChooseCheckbox = document.getElementById('couponStudentChooseCourse');
  const courseFieldWrap = document.getElementById('couponCourseFieldWrap');
  const sectionHint = document.getElementById('couponSectionHint');
  studentChooseCheckbox.addEventListener('change', ()=>{
    const studentChooses = studentChooseCheckbox.checked;
    courseFieldWrap.style.display = studentChooses ? 'none' : '';
    courseSelect.required = !studentChooses;
    sectionHint.style.display = studentChooses ? '' : 'none';
    // في وضع اختيار الطالب، الأقسام المعروضة عامة (فيرست/ميد/فاينال) وليست تابعة لكورس محدد
    sectionSelect.innerHTML = studentChooses ? sectionOptionsFor(null) : sectionOptionsFor(courseSelect.value);
  });
  document.getElementById('couponForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('couponMsg');
    const code = (fd.get('code')||'').trim().toUpperCase();
    if(!code){ msgBox.innerHTML = `<div class="form-msg error">أدخل كود الكوبون.</div>`; return; }
    if(findCouponByCode(code)){ msgBox.innerHTML = `<div class="form-msg error">هذا الكود مستخدم مسبقًا لكوبون آخر، اختر كودًا مختلفًا.</div>`; return; }
    const studentChooses = studentChooseCheckbox.checked;
    let courseId = null;
    if(!studentChooses){
      courseId = fd.get('courseId');
      if(!courseId){ msgBox.innerHTML = `<div class="form-msg error">اختر الكورس المستهدف، أو فعّل خيار "اترك المادة ليختارها الطالب".</div>`; return; }
    }
    const section = fd.get('section') || null;
    const type = fd.get('type');
    const discountPercent = type==='discount' ? Number(fd.get('discountPercent')) : null;
    if(type==='discount' && (!discountPercent || discountPercent<1 || discountPercent>100)){
      msgBox.innerHTML = `<div class="form-msg error">أدخل نسبة خصم صحيحة بين 1 و100.</div>`; return;
    }
    const maxUsesRaw = fd.get('maxUses');
    const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
    const expiresAtRaw = fd.get('expiresAt');
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).getTime() : null;
    if(expiresAtRaw && expiresAt <= Date.now()){
      msgBox.innerHTML = `<div class="form-msg error">تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل.</div>`; return;
    }
    state.coupons.push({
      id:'cp'+Date.now(), code, type, discountPercent, courseId, section,
      maxUses, expiresAt, usedBy: [], active:true, note:(fd.get('note')||'').trim(), createdAt: Date.now(),
    });
    await setData('coupons', state.coupons, true);
    closeModal(); navigate('admin-coupons'); render();
  });
}

/* عميل Supabase مؤقّت ومستقل (بدون حفظ جلسة) لإنشاء حساب المدرّس دون التأثير على
   جلسة تسجيل دخول الأدمن الحالية — إنشاء مستخدم جديد عبر signUp بالعميل الرئيسي
   كان سيستبدل جلسة الأدمن بجلسة المدرّس الجديد، لذلك نستخدم عميلًا منفصلًا. */
function getTempAuthClient(){
  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
}

/* إنشاء حساب مدرّس جديد وربطه مباشرة بكورس محدد. صلاحيات المدرّس بعدها محدودة
   واجهيًا فقط (إضافة/تعديل/حذف محاضرات وبنك أسئلة كورسه، ورؤية عدد المشتركين)،
   دون أي حماية فعلية على مستوى قاعدة البيانات (نفس أسلوب حساب الأدمن الحالي). */
/* قائمة checkboxes لاختيار مادة واحدة أو أكثر يرتبط بها المدرّس. selectedIds تحدد
   أي المواد تكون محددة مسبقًا (تُستخدم في التعديل)، وexcludeTeacherId (إن وُجد) يوضّح
   بجانب أي مادة مرتبطة أصلًا بمدرّس آخر تحذيرًا بأن ربطها هون رح ينقلها له. */
function teacherCoursesCheckboxesHtml(selectedIds, excludeTeacherId){
  if(!state.courses.length) return `<p class="hint">لا توجد مواد بعد، أنشئ كورسًا أولًا.</p>`;
  return `<div style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow:auto; border:1px solid var(--border); border-radius:10px; padding:10px;">
    ${state.courses.map(c=>{
      const checked = selectedIds.includes(c.id) ? 'checked' : '';
      const takenByOther = c.teacherId && c.teacherId !== excludeTeacherId && !selectedIds.includes(c.id);
      const otherTeacherName = takenByOther ? (state.teachers.find(t=>t.id===c.teacherId)||{}).fullName : null;
      return `<label style="display:flex; align-items:center; gap:8px; font-size:13.5px; cursor:pointer;">
        <input type="checkbox" name="courseIds" value="${c.id}" ${checked}>
        <span>${escapeHtml(c.title)} — ${escapeHtml(c.university)} ${otherTeacherName ? `<span style="color:var(--muted);">(مرتبطة حاليًا بـ ${escapeHtml(otherTeacherName)}، رح تنتقل لهذا المدرّس)</span>` : ''}</span>
      </label>`;
    }).join('')}
  </div>`;
}

function modalCreateTeacher(){
  openModal(`
    <h3>${ICONS.plus} إنشاء حساب مدرّس</h3>
    <form id="teacherForm">
      <div class="field"><label>الاسم الكامل</label><input type="text" name="fullName" required></div>
      <div class="field"><label>اسم المستخدم (للدخول)</label><input type="text" name="username" required style="direction:ltr;"></div>
      <div class="field"><label>كلمة المرور</label><input type="password" name="password" required minlength="6" style="direction:ltr;"></div>
      <div class="field">
        <label>المواد المرتبطة بهذا المدرّس (يمكن اختيار أكثر من مادة)</label>
        ${teacherCoursesCheckboxesHtml([], null)}
        <p class="hint" style="margin-top:6px;">سيقدر المدرّس إدارة محاضرات وبنك أسئلة المواد المحددة فقط، ويشوف عدد المشتركين فيها.</p>
      </div>
      <div id="teacherMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">إنشاء الحساب والربط</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('teacherForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('teacherMsg');
    const fullName = (fd.get('fullName')||'').trim();
    const username = (fd.get('username')||'').trim();
    const password = fd.get('password');
    const courseIds = fd.getAll('courseIds');
    if(!fullName || !username || !password){
      msgBox.innerHTML = `<div class="form-msg error">عبّي كل الحقول أولًا.</div>`; return;
    }
    if(!supabaseClient){ msgBox.innerHTML = `<div class="form-msg error">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>`; return; }
    const pseudoEmail = username.toLowerCase()+'@medora.app';
    const tempClient = getTempAuthClient();
    const { data, error } = await tempClient.auth.signUp({
      email: pseudoEmail, password,
      options: { data: { role:'teacher', username, fullName } }
    });
    if(error){ msgBox.innerHTML = `<div class="form-msg error">تعذّر إنشاء الحساب: ${escapeHtml(error.message||'')}</div>`; return; }
    if(!data.user){ msgBox.innerHTML = `<div class="form-msg error">تعذّر إنشاء الحساب.</div>`; return; }
    state.teachers.push({ id: data.user.id, username, fullName });
    await setData('teachers', state.teachers, true);
    state.courses.forEach(c=>{ if(courseIds.includes(c.id)) c.teacherId = data.user.id; });
    await setData('courses', state.courses, true);
    closeModal(); navigate('admin-analytics'); render();
  });
}

/* تعديل بيانات مدرّس موجود: الاسم الظاهر + المواد المرتبطة به.
   ملاحظة: تغيير اسم المستخدم/كلمة المرور غير متاح من هون لأنه يتطلب مفتاح
   إداري (service role) على سيرفر خلفي، وهذا الملف لا يحتوي على مفتاح كهذا
   عمدًا حفاظًا على أمان قاعدة البيانات (أي زائر يقدر يشوف كود الصفحة). */
function modalEditTeacher(teacherId){
  const teacher = state.teachers.find(t=>t.id===teacherId);
  if(!teacher) return;
  const currentCourseIds = state.courses.filter(c=>c.teacherId===teacherId).map(c=>c.id);
  openModal(`
    <h3>${ICONS.edit} تعديل بيانات المدرّس</h3>
    <form id="editTeacherForm">
      <div class="field"><label>الاسم الكامل</label><input type="text" name="fullName" value="${escapeHtml(teacher.fullName||'')}" required></div>
      <p class="hint">اسم المستخدم: <b style="direction:ltr; display:inline-block;">${escapeHtml(teacher.username)}</b> — لتغيير اسم المستخدم أو كلمة المرور، احذف الحساب وأنشئ حسابًا جديدًا.</p>
      <div class="field">
        <label>المواد المرتبطة بهذا المدرّس</label>
        ${teacherCoursesCheckboxesHtml(currentCourseIds, teacherId)}
      </div>
      <div id="editTeacherMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ التعديلات</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('editTeacherForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('editTeacherMsg');
    const fullName = (fd.get('fullName')||'').trim();
    if(!fullName){ msgBox.innerHTML = `<div class="form-msg error">أدخل الاسم الكامل.</div>`; return; }
    const selectedCourseIds = fd.getAll('courseIds');
    teacher.fullName = fullName;
    await setData('teachers', state.teachers, true);
    state.courses.forEach(c=>{
      if(selectedCourseIds.includes(c.id)) c.teacherId = teacherId;
      else if(c.teacherId === teacherId) c.teacherId = null;
    });
    await setData('courses', state.courses, true);
    closeModal(); navigate('admin-analytics'); render();
  });
}

/* حذف حساب مدرّس: (1) إزالته من قائمة المدرّسين، (2) فك ربطه عن كل موادّه
   فورًا، (3) حذف حسابه الفعلي من نظام الدخول (Supabase Auth) عبر Edge
   Function خاصة (delete-teacher) تشتغل بمفتاح service role على السيرفر —
   هذا المفتاح لا يوضع أبدًا بهذا الملف الأمامي لأنه يعطي صلاحية كاملة على
   قاعدة البيانات، لهيك تم عزله بدالة سحابية منفصلة يتحقق فيها إنه المستخدم
   المتصل فعلًا هو admin قبل تنفيذ الحذف. بعد هذا الحذف الفعلي، يقدر أي حد
   يسجّل حساب مدرّس جديد بنفس اسم المستخدم من غير مشاكل "already registered". */
async function deleteTeacher(teacherId){
  state.teachers = state.teachers.filter(t=>t.id!==teacherId);
  await setData('teachers', state.teachers, true);
  let coursesChanged = false;
  state.courses.forEach(c=>{ if(c.teacherId===teacherId){ c.teacherId = null; coursesChanged = true; } });
  if(coursesChanged) await setData('courses', state.courses, true);
  try{
    const { error } = await supabaseClient.functions.invoke('delete-teacher', { body: { teacherId } });
    if(error) console.error('تعذّر حذف حساب الدخول فعليًا من Auth:', error);
  }catch(e){
    console.error('تعذّر حذف حساب الدخول فعليًا من Auth:', e);
  }
}

/* حذف حساب طالب من لوحة تحكم الأدمن: (1) إزالته فورًا من مصفوفة الطلاب
   (medora_data/students) — وهذا هو المصدر اللي تُبنى منه أعداد لوحة
   التحليلات، فالعدد بينحدّث فورًا بمجرد الحذف، (2) فك ربطه عن كل تفعيلاته
   وملخصاته المحفوظة محليًا حتى ما تضل بيانات يتيمة، (3) حذف حسابه الفعلي
   من نظام الدخول (Supabase Auth) عبر Edge Function خاصة (delete-student)
   تشتغل بمفتاح service role على السيرفر — نفس أسلوب حذف المدرّس تمامًا،
   لأن مفتاح service role لا يوضع أبدًا بهذا الملف الأمامي. */
async function deleteStudent(phone){
  state.students = state.students.filter(s=>s.phone!==phone);
  await setData('students', state.students, true);
  let enrollmentsChanged = false, summariesChanged = false, progressChanged = false, savedQChanged = false;
  if(state.enrollments.some(e=>e.phone===phone)){ state.enrollments = state.enrollments.filter(e=>e.phone!==phone); enrollmentsChanged = true; }
  if(state.summaries.some(s=>s.phone===phone)){ state.summaries = state.summaries.filter(s=>s.phone!==phone); summariesChanged = true; }
  if(state.lectureProgress.some(p=>p.phone===phone)){ state.lectureProgress = state.lectureProgress.filter(p=>p.phone!==phone); progressChanged = true; }
  if(state.savedQuestions.some(q=>q.phone===phone)){ state.savedQuestions = state.savedQuestions.filter(q=>q.phone!==phone); savedQChanged = true; }
  if(enrollmentsChanged) await setData('enrollments', state.enrollments, true);
  if(summariesChanged) await setData('summaries', state.summaries, true);
  if(progressChanged) await setData('lectureProgress', state.lectureProgress, true);
  if(savedQChanged) await setData('savedQuestions', state.savedQuestions, true);
  try{
    const { error } = await supabaseClient.functions.invoke('delete-student', { body: { phone } });
    if(error) console.error('تعذّر حذف حساب الدخول فعليًا من Auth:', error);
  }catch(e){
    console.error('تعذّر حذف حساب الدخول فعليًا من Auth:', e);
  }
}

/* =========================================================
   PAGE: ABOUT
   ========================================================= */
function pageAbout(){
  const uniCards = UNIVERSITIES.map((u) => `<div class="uni-card"><div class="badge"><img src="${escapeHtml(u.logo||'')}" alt="${escapeHtml(u.name)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'badge-fallback',textContent:'${escapeHtml((u.name||'').charAt(0))}'}))"></div><h4>${u.name}</h4><p>${u.loc} — الأردن</p></div>`).join('');
  return `
  <section class="section">
    <div class="container">
      <div class="about-hero">
        <span class="eyebrow">من نحن</span>
        <h2 style="font-size:30px; color:var(--ink); font-weight:800; margin-bottom:14px;">${cval('about_title')}${editBtn('about_title')}</h2>
        <p style="color:var(--muted); font-size:15.5px;">${cval('about_text')}${editBtn('about_text')}</p>
      </div>
      ${stethDivider()}
      <div style="margin-top:40px;">
        <div class="section-head" style="margin-bottom:20px;"><h2 style="font-size:24px;">الجامعات المشمولة حاليًا</h2></div>
        <div class="uni-cards">${uniCards}</div>
      </div>
      <div class="mission-grid">
        <div class="mission-card"><h4>${cval('mission1_title')}${editBtn('mission1_title')}</h4><p>${cval('mission1_desc')}${editBtn('mission1_desc')}</p></div>
        <div class="mission-card"><h4>${cval('mission2_title')}${editBtn('mission2_title')}</h4><p>${cval('mission2_desc')}${editBtn('mission2_desc')}</p></div>
        <div class="mission-card"><h4>${cval('mission3_title')}${editBtn('mission3_title')}</h4><p>${cval('mission3_desc')}${editBtn('mission3_desc')}</p></div>
        <div class="mission-card"><h4>${cval('mission4_title')}${editBtn('mission4_title')}</h4><p>${cval('mission4_desc')}${editBtn('mission4_desc')}</p></div>
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: CONTACT
   ========================================================= */
function pageContact(){
  const isAdmin = state.session && state.session.type === 'admin';
  const messagesHtml = isAdmin ? `
    <div class="messages-list">
      <h3 style="color:var(--ink); font-size:17px; font-weight:800; margin-bottom:14px;">الرسائل الواردة (${state.messages.length})</h3>
      ${state.messages.length ? state.messages.slice().reverse().map(m => `
        <div class="message-card">
          <div class="m-head"><b>${escapeHtml(m.name)}</b><button class="btn danger small" data-del-message="${m.id}">${ICONS.trash} حذف</button></div>
          <span class="m-email">${escapeHtml(m.email)}</span>
          <p style="margin-top:8px;">${escapeHtml(m.message)}</p>
        </div>
      `).join('') : `<div class="empty-state" style="padding:26px;"><p>لا توجد رسائل بعد.</p></div>`}
    </div>
  ` : '';

  return `
  <section class="section">
    <div class="container">
      <div class="section-head"><span class="eyebrow">${cval('contact_eyebrow')}${editBtn('contact_eyebrow')}</span><h2>${cval('contact_title')}${editBtn('contact_title')}</h2><p>${cval('contact_desc')}${editBtn('contact_desc')}</p></div>
      <div class="contact-grid">
        <div class="contact-info-card">
          <h3>معلومات التواصل</h3>
          <div class="contact-row"><div class="ic">${ICONS.mail}</div><div><b>البريد الإلكتروني</b><span>${cval('contact_email')}${editBtn('contact_email')}</span></div></div>
          <div class="contact-row"><div class="ic">${ICONS.phone}</div><div><b>الهاتف</b><span>${cval('contact_phone')}${editBtn('contact_phone')}</span></div></div>
          <div class="contact-row"><div class="ic">${ICONS.pin}</div><div><b>الموقع</b><span style="direction:rtl;">${cval('contact_location')}${editBtn('contact_location')}</span></div></div>
          ${messagesHtml}
        </div>
        <div class="card-panel" style="padding:30px;">
          <h2 style="text-align:start; font-size:20px;">أرسل رسالة</h2>
          <p class="sub" style="text-align:start; margin-bottom:20px;">سنقوم بالرد عليك عبر البريد الإلكتروني المُدخل</p>
          <div id="contactMsg"></div>
          <form id="contactForm">
            <div class="field"><label>الاسم</label><input type="text" name="name" required placeholder="اسمك الكامل"></div>
            <div class="field"><label>البريد الإلكتروني</label><input type="email" name="email" required placeholder="example@email.com" style="direction:ltr; text-align:start;"></div>
            <div class="field"><label>الرسالة</label><textarea name="message" required placeholder="اكتب رسالتك هنا..."></textarea></div>
            <button type="submit" class="btn teal solid" style="width:100%; justify-content:center;">إرسال الرسالة</button>
          </form>
        </div>
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: PRIVACY POLICY
   ========================================================= */
function pagePrivacy(){
  const sections = [
    {
      title: 'مقدمة',
      body: `تحترم منصة MEDORA خصوصية مستخدميها من طلاب التمريض وطب الأسنان، وتلتزم بحماية بياناتهم الشخصية. توضّح هذه السياسة نوع البيانات التي نجمعها، وكيفية استخدامها وتخزينها، وحقوقك المتعلقة بها. استخدامك للمنصة يعني موافقتك على ما ورد في هذه السياسة.`
    },
    {
      title: 'البيانات التي نجمعها',
      body: `عند إنشاء حساب طالب، نجمع: الاسم الكامل، رقم الهاتف (يُستخدم كمعرّف دخول)، الجامعة والتخصص، وكلمة المرور (تُخزَّن بشكل مشفّر عبر مزوّد المصادقة Supabase ولا يطّلع عليها أي موظف في المنصة). كما نسجّل معرّفًا تقنيًا للجهاز المستخدم عند تسجيل الدخول، لغايات نظام "الجهاز الواحد" الموضّح أدناه. أما عند إرسال رسالة عبر صفحة "تواصل معنا"، فنجمع الاسم والبريد الإلكتروني ونص الرسالة فقط.`
    },
    {
      title: 'كيف نستخدم بياناتك',
      body: `تُستخدم بياناتك حصرًا من أجل: إنشاء حسابك وتسجيل دخولك، تحديد الكورسات المتاحة لجامعتك وتخصصك، تفعيل اشتراكك في الكورسات المدفوعة، الرد على استفساراتك ورسائلك، والحفاظ على أمان الحسابات عبر نظام قفل الجهاز الواحد. لا نستخدم بياناتك لأي غرض تسويقي خارج المنصة، ولا نعرضها لأي طرف ثالث.`
    },
    {
      title: 'نظام "الجهاز الواحد" لكل حساب',
      body: `لحماية اشتراكات الطلاب من المشاركة غير المصرّح بها، يُربط حساب كل طالب بجهاز واحد فقط عند أول تسجيل دخول. إذا احتجت لاستخدام حساب على جهاز جديد، يمكن للإدارة إعادة تعيين الجهاز المرتبط بحسابك بعد التواصل معها من صفحة "تواصل معنا".`
    },
    {
      title: 'تخزين البيانات وحمايتها',
      body: `تُخزَّن بيانات المنصة على خوادم Supabase، وتُطبَّق عليها سياسات وصول (RLS) تحدّ من قدرة أي مستخدم على الاطّلاع على بيانات غيره. لا تُخزَّن كلمات المرور كنص صريح في أي مكان، وتُدار عملية المصادقة بالكامل عبر مزوّد خدمة موثوق.`
    },
    {
      title: 'مشاركة البيانات مع أطراف ثالثة',
      body: `لا تبيع منصة MEDORA بيانات مستخدميها ولا تشاركها مع أي جهة تسويقية أو إعلانية. تقتصر مشاركة البيانات على مزوّد الاستضافة والمصادقة (Supabase) اللازم لتشغيل المنصة فقط.`
    },
    {
      title: 'حقوقك',
      body: `يحق لك في أي وقت طلب الاطّلاع على بياناتك المخزّنة لدينا، أو طلب تصحيحها، أو طلب حذف حسابك وبياناته نهائيًا، وذلك بالتواصل معنا عبر صفحة "تواصل معنا" أو عبر البريد الإلكتروني الظاهر أدناه.`
    },
    {
      title: 'تعديلات على هذه السياسة',
      body: `قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة أي تغييرات على المنصة أو المتطلبات القانونية. سيتم نشر أي تحديث على هذه الصفحة مع تاريخ آخر تعديل.`
    },
    {
      title: 'تواصل معنا',
      body: `لأي استفسار يتعلق بخصوصية بياناتك، يمكنك مراسلتنا عبر صفحة "تواصل معنا" أو على البريد الإلكتروني الموضّح في صفحة التواصل.`
    },
  ];
  return `
  <section class="section">
    <div class="container" style="max-width:860px;">
      <div class="section-head" style="margin-bottom:30px;">
        <span class="eyebrow">حماية بياناتك</span>
        <h2>سياسة الخصوصية</h2>
        <p>آخر تحديث: يوليو 2026</p>
      </div>
      <div class="card-panel" style="padding:34px; text-align:start;">
        ${sections.map(s => `
          <div style="margin-bottom:26px;">
            <h4 style="font-size:16.5px; color:var(--ink); font-weight:800; margin-bottom:8px;">${escapeHtml(s.title)}</h4>
            <p style="color:var(--muted); font-size:14.5px; line-height:1.9;">${escapeHtml(s.body)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: TERMS & CONDITIONS
   ========================================================= */
function pageTerms(){
  const sections = [
    {
      title: 'قبول الشروط',
      body: `استخدامك لمنصة MEDORA، سواء كطالب مسجَّل أو زائر، يعني موافقتك على الشروط والأحكام الواردة هنا. إن لم توافق على أي بند منها، يُرجى التوقف عن استخدام المنصة.`
    },
    {
      title: 'الحساب والاستخدام المسموح',
      body: `الحساب مخصّص للاستخدام الشخصي لصاحبه فقط، ولا يجوز مشاركة بيانات الدخول (رقم الهاتف وكلمة المرور) مع أي شخص آخر. أنت مسؤول عن الحفاظ على سرّية بياناتك وعن أي نشاط يتم من خلال حسابك.`
    },
    {
      title: 'نظام "الجهاز الواحد"',
      body: `يُقيَّد كل حساب طالب بجهاز واحد فقط عند أول تسجيل دخول، وذلك للحدّ من مشاركة الحسابات بين عدّة أشخاص. محاولة الدخول من جهاز آخر تؤدي إلى منع الدخول تلقائيًا حتى تقوم الإدارة بإعادة تعيين الجهاز بناءً على طلبك.`
    },
    {
      title: 'الكورسات المدفوعة والاشتراكات',
      body: `تُفعَّل الكورسات المدفوعة من قِبل الإدارة بعد إتمام عملية الاشتراك المتفق عليها خارج المنصة. لا تضمن المنصة استرجاع قيمة الاشتراك بعد التفعيل، إلا في حالات يُقرّرها فريق الإدارة وفق تقديره.`
    },
    {
      title: 'المحتوى التعليمي وحقوق الملكية',
      body: `جميع المحاضرات والمواد وبنك الأسئلة المتاحة على المنصة مخصّصة للاستخدام الشخصي التعليمي فقط لطلاب المنصة. يُمنع نسخ المحتوى أو إعادة نشره أو توزيعه أو بيعه لأي طرف آخر دون إذن كتابي من إدارة المنصة.`
    },
    {
      title: 'سلوك المستخدم',
      body: `يُمنع استخدام المنصة بأي شكل يضرّ بها أو بمستخدميها الآخرين، بما يشمل محاولات اختراق الحسابات، أو انتحال هوية طالب آخر، أو إرسال محتوى مسيء عبر نموذج التواصل.`
    },
    {
      title: 'التعديلات على المنصة والشروط',
      body: `تحتفظ إدارة MEDORA بحقّ تعديل هذه الشروط، أو إضافة/إزالة كورسات ومحتوى، أو تعليق أي حساب يخالف هذه الشروط، دون إشعار مسبق في الحالات الضرورية.`
    },
    {
      title: 'إخلاء مسؤولية',
      body: `المحتوى التعليمي المقدَّم على المنصة أداة مساعدة للمراجعة والدراسة، ولا يُغني عن المقررات الرسمية والمراجع المعتمدة من الجامعة. لا تتحمّل المنصة مسؤولية أي قرار أكاديمي يُبنى حصرًا على محتواها.`
    },
    {
      title: 'التواصل معنا',
      body: `لأي استفسار حول هذه الشروط، يمكنك مراسلتنا عبر صفحة "تواصل معنا".`
    },
  ];
  return `
  <section class="section">
    <div class="container" style="max-width:860px;">
      <div class="section-head" style="margin-bottom:30px;">
        <span class="eyebrow">الشروط والأحكام</span>
        <h2>شروط استخدام منصة MEDORA</h2>
        <p>آخر تحديث: يوليو 2026</p>
      </div>
      <div class="card-panel" style="padding:34px; text-align:start;">
        ${sections.map(s => `
          <div style="margin-bottom:26px;">
            <h4 style="font-size:16.5px; color:var(--ink); font-weight:800; margin-bottom:8px;">${escapeHtml(s.title)}</h4>
            <p style="color:var(--muted); font-size:14.5px; line-height:1.9;">${escapeHtml(s.body)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
}

/* =========================================================
   PAGE: STUDENT LOGIN / REGISTER
   ========================================================= */
let authMode = 'login';
function pageLogin(){
  if(state.session) return `<section class="section"><div class="container"><div class="empty-state"><h3>أنت مسجّل الدخول بالفعل</h3><p>يمكنك تصفّح الدورات وبنك الأسئلة مباشرة.</p></div></div></section>`;
  return `
  <section class="section">
    <div class="auth-wrap">
      <div class="card-panel">
        <h2>${authMode==='login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
        <p class="sub">${authMode==='login' ? 'أدخل بياناتك للوصول إلى حسابك' : 'انضم إلى منصة MEDORA الآن'}</p>
        <div id="authMsg"></div>
        <form id="authForm">
          ${authMode==='register' ? `<div class="field"><label>الاسم الكامل</label><input type="text" name="fullName" placeholder="مثال: سارة أحمد" required></div>` : ''}
          ${authMode==='register' ? `<div class="field"><label>الجامعة</label><select name="university" required>
            <option value="" disabled selected>— اختر جامعتك —</option>
            ${UNIVERSITIES.map(u=>`<option value="${escapeHtml(u.name)}">${escapeHtml(u.name)}</option>`).join('')}
          </select></div>` : ''}
          ${authMode==='register' ? `<div class="field"><label>التخصص</label><select name="major" required>
            <option value="" disabled selected>— اختر تخصصك —</option>
            ${MAJORS.map(m=>`<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('')}
          </select></div>` : ''}
          <div class="field"><label>رقم الهاتف</label><input type="tel" name="phone" placeholder="مثال: 0791234567" style="direction:ltr; text-align:start;" required></div>
          <div class="field"><label>كلمة المرور</label><input type="password" name="password" placeholder="••••••••" required></div>
          <button type="submit" id="authSubmitBtn" class="btn solid" style="width:100%; justify-content:center;">${authMode==='login' ? 'دخول' : 'إنشاء الحساب'}</button>
        </form>
        ${authMode==='register' ? `<p style="font-size:12px; color:var(--muted); text-align:center; margin-top:12px;">بإنشائك حسابًا فإنك توافق على <a href="/privacy" style="color:var(--teal); font-weight:700;">سياسة الخصوصية</a> و<a href="/terms" style="color:var(--teal); font-weight:700;">الشروط والأحكام</a> الخاصة بمنصة MEDORA.</p>` : ''}
        <div class="switch-row">${authMode==='login' ? `ليس لديك حساب؟ <button id="switchAuth">أنشئ حسابًا جديدًا</button>` : `لديك حساب بالفعل؟ <button id="switchAuth">سجّل الدخول</button>`}</div>
        <div style="text-align:center; margin-top:16px;"><a href="/admin-login" style="font-size:12.5px; color:var(--muted);">${ICONS.shield} دخول المشرفين</a></div>
      </div>
    </div>
  </section>`;
}

/* =========================================================
   PAGE: ADMIN LOGIN
   ========================================================= */
function pageAdminLogin(){
  if(state.session && state.session.type === 'admin') return `<section class="section"><div class="container"><div class="empty-state"><h3>أنت مسجّل الدخول كمشرف</h3><p>يمكنك إدارة الدورات والمحاضرات وبنك الأسئلة من صفحاتها مباشرة.</p></div></div></section>`;
  if(state.session && state.session.type === 'teacher'){
    const myCourses = state.courses.filter(c=>c.teacherId===state.session.teacherId);
    const coursesLinks = myCourses.map(c=>`<a href="/course/${c.id}" style="color:var(--teal); font-weight:800;">${escapeHtml(c.title)}</a>`).join('، ');
    return `<section class="section"><div class="container"><div class="empty-state"><h3>أهلًا ${escapeHtml(state.session.name)} 👨‍🏫</h3><p>${myCourses.length ? `يمكنك إدارة محاضرات وبنك أسئلة موادّك (${coursesLinks}) من صفحة كل مادة، أو من <a href="/bank" style="color:var(--teal); font-weight:800;">بنك الأسئلة</a>.` : 'لم تُربط بأي مادة بعد، تواصل مع إدارة المنصة.'}</p></div></div></section>`;
  }
  return `
  <section class="section">
    <div class="auth-wrap">
      <div class="card-panel">
        <h2>${ICONS.shield} دخول المشرفين</h2>
        <p class="sub">هذه الصفحة مخصّصة لفريق إدارة منصة MEDORA فقط</p>
        <div id="adminMsg"></div>
        <form id="adminForm">
          <div class="field"><label>اسم المستخدم</label><input type="text" name="username" placeholder="admin" required></div>
          <div class="field"><label>كلمة المرور</label><input type="password" name="password" placeholder="••••••••" required></div>
          <button type="submit" class="btn teal solid" style="width:100%; justify-content:center;">دخول لوحة التحكم</button>
        </form>
      </div>
    </div>
  </section>`;
}

/* =========================================================
   Modal helpers
   ========================================================= */
function openModal(html, wide){
  document.getElementById('modalRoot').innerHTML = `<div class="modal-overlay" id="modalOverlay"><div class="modal-box${wide?' wide':''}">${html}</div></div>`;
  document.getElementById('modalOverlay').addEventListener('click', (e)=>{ if(e.target.id === 'modalOverlay') closeModal(); });
  translateSubtree(document.getElementById('modalRoot'));
}
function closeModal(){ document.getElementById('modalRoot').innerHTML = ''; }

function sectionPickerFieldsHtml(enabledSections, pricing){
  return `
    <div class="field"><label>أقسام هذه المادة (فعّل فقط الأقسام الموجودة فعلاً — مثلاً ميد وفاينال بدون فيرست)</label></div>
    ${SECTIONS.map(s=>{
      const on = enabledSections.includes(s);
      const free = pricing ? !!pricing[s] : false;
      return `
      <div class="section-picker-row">
        <label class="section-picker-check">
          <input type="checkbox" name="has_${s}" data-section-toggle="${s}" ${on?'checked':''}>
          ${SECTION_LABELS[s]}
        </label>
        <select name="pricing_${s}" data-section-price="${s}" ${on?'':'disabled'}>
          <option value="free" ${free?'selected':''}>🆓 مجاني (اشتراك ذاتي فوري)</option>
          <option value="paid" ${!free?'selected':''}>💳 مدفوع (تفعيل من الإدارة)</option>
        </select>
      </div>`;
    }).join('')}
    <p class="hint" style="margin:-4px 0 12px; font-size:12.5px; color:var(--muted);">إذا ألغيت تفعيل قسم فيه محاضرات مضافة مسبقًا، هذه المحاضرات بتختفي عن الطلاب لين تعيد تفعيل القسم.</p>
  `;
}
function bindSectionPicker(){
  document.querySelectorAll('[data-section-toggle]').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      const sel = document.querySelector(`[data-section-price="${cb.dataset.sectionToggle}"]`);
      if(sel) sel.disabled = !cb.checked;
    });
  });
}
function collectSectionPicker(fd, msgBox){
  const sections = SECTIONS.filter(s=>fd.get('has_'+s));
  if(!sections.length){
    if(msgBox) msgBox.innerHTML = `<div class="form-msg error">فعّل قسمًا واحدًا على الأقل لهذه المادة.</div>`;
    return null;
  }
  const pricing = {};
  SECTIONS.forEach(s=>{ pricing[s] = sections.includes(s) ? (fd.get('pricing_'+s)==='free') : false; });
  return { sections, pricing };
}

function modalAddCourse(){
  const uniOptions = ['عام', ...UNIVERSITIES.map(u=>u.name)].map(u=>`<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');
  const majorOptions = MAJORS.map(m=>`<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('');
  openModal(`
    <h3>${ICONS.plus} إضافة كورس جديد</h3>
    <form id="courseForm">
      <div class="field"><label>اسم الكورس</label><input type="text" name="title" required placeholder="مثال: تمريض الطوارئ أو جراحة الفم والفكين"></div>
      <div class="field"><label>الجامعة</label><select name="university">${uniOptions}</select></div>
      <div class="field"><label>التخصص</label><select name="major">${majorOptions}</select></div>
      <div class="field"><label>عدد الساعات المعتمدة</label><input type="number" name="hours" min="1" max="10" value="3" required></div>
      <div class="field"><label>وصف مختصر</label><textarea name="description" required placeholder="اكتب وصفًا مختصرًا عن محتوى الكورس"></textarea></div>
      ${sectionPickerFieldsHtml(SECTIONS, null)}
      <div id="courseMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ الكورس</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  bindSectionPicker();
  document.getElementById('courseForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const picked = collectSectionPicker(fd, document.getElementById('courseMsg'));
    if(!picked) return;
    state.courses.push({ id:'c'+Date.now(), title:fd.get('title').trim(), university:fd.get('university'), major:fd.get('major'), hours:Number(fd.get('hours')), description:fd.get('description').trim(), sections:picked.sections, pricing:picked.pricing });
    await setData('courses', state.courses, true);
    closeModal(); render();
  });
}

function modalEditCourse(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  if(!course) return;
  const uniOptions = ['عام', ...UNIVERSITIES.map(u=>u.name)].map(u=>`<option value="${escapeHtml(u)}" ${course.university===u?'selected':''}>${escapeHtml(u)}</option>`).join('');
  const majorOptions = MAJORS.map(m=>`<option value="${escapeHtml(m.name)}" ${course.major===m.name?'selected':''}>${escapeHtml(m.name)}</option>`).join('');
  openModal(`
    <h3>${ICONS.edit} تعديل بيانات الكورس</h3>
    <form id="courseEditForm">
      <div class="field"><label>اسم الكورس</label><input type="text" name="title" required value="${escapeHtml(course.title)}"></div>
      <div class="field"><label>الجامعة</label><select name="university">${uniOptions}</select></div>
      <div class="field"><label>التخصص</label><select name="major">${majorOptions}</select></div>
      <div class="field"><label>عدد الساعات المعتمدة</label><input type="number" name="hours" min="1" max="10" value="${course.hours}" required></div>
      <div class="field"><label>وصف مختصر</label><textarea name="description" required>${escapeHtml(course.description)}</textarea></div>
      ${sectionPickerFieldsHtml(courseSections(courseId), course.pricing)}
      <div id="courseMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ التعديلات</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  bindSectionPicker();
  document.getElementById('courseEditForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const picked = collectSectionPicker(fd, document.getElementById('courseMsg'));
    if(!picked) return;
    course.title = fd.get('title').trim(); course.university = fd.get('university'); course.major = fd.get('major');
    course.hours = Number(fd.get('hours')); course.description = fd.get('description').trim();
    course.sections = picked.sections; course.pricing = picked.pricing;
    delete course.isFree;
    await setData('courses', state.courses, true);
    closeModal(); render();
  });
}

/* تحلّل نص فيه عدة أرقام هواتف طلاب دفعة وحدة: تقبل الفصل بسطر/فاصلة/مسافة،
   وأيضًا الأرقام الملصوقة ورا بعض بدون أي فاصل (كل رقم ثابت 10 خانات ويبدأ بـ 07)
   فتفصلها تلقائيًا كل 10 خانات. ترجع { valid: [أرقام صحيحة بدون تكرار], invalid: [مقاطع ما قدرت تُقرأ] } */
function parsePhoneBatch(raw){
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let text = (raw||'').replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)));
  const tokens = text.split(/[\s,;،؛\/|]+/).map(t=>t.trim()).filter(Boolean);
  const valid = [];
  const seen = new Set();
  const invalid = [];
  tokens.forEach(tok=>{
    const digits = tok.replace(/\D/g,'');
    if(!digits) return;
    let chunks = null;
    if(digits.length===10 && isValidPhone(digits)){
      chunks = [digits];
    } else if(digits.length>10 && digits.length%10===0){
      const parts = [];
      let ok = true;
      for(let i=0;i<digits.length;i+=10){
        const part = digits.slice(i,i+10);
        if(!isValidPhone(part)){ ok=false; break; }
        parts.push(part);
      }
      if(ok) chunks = parts;
    }
    if(chunks){
      chunks.forEach(c=>{ if(!seen.has(c)){ seen.add(c); valid.push(c); } });
    } else {
      invalid.push(tok);
    }
  });
  return { valid, invalid };
}

function modalEnrollStudent(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  const secs = courseSections(courseId);
  openModal(`
    <h3>${ICONS.plus} تفعيل الكورس لعدة طلاب دفعة وحدة</h3>
    <form id="enrollForm">
      <div class="field">
        <label>أرقام هواتف الطلاب</label>
        <textarea name="phones" required rows="6" style="direction:ltr; font-family:monospace; resize:vertical;" placeholder="0791234567
0781234567
0771234567
...أو الصقهم متسلسلين بدون أي فواصل، بيتم فصلهم تلقائيًا كل 10 أرقام"></textarea>
        <p class="hint" style="margin-top:6px; font-size:12.5px; color:var(--muted);">حط رقم بكل سطر، أو مفصولين بفاصلة/مسافة، أو حتى ملصوقين ورا بعض بدون فواصل — كل رقم 10 خانات ويبدأ بـ 07.</p>
      </div>
      <div class="field">
        <label>الأقسام المطلوب تفعيلها</label>
        <div class="lecture-select-list">
          ${secs.map(s=>`<label class="lecture-select-row"><span>${SECTION_LABELS[s]}</span><input type="checkbox" name="section_${s}" checked></label>`).join('')}
        </div>
      </div>
      <div id="enrollMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">تفعيل الأقسام المحددة للجميع</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('enrollForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('enrollMsg');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const { valid: phones, invalid } = parsePhoneBatch(fd.get('phones'));
    if(!phones.length){ msgBox.innerHTML = `<div class="form-msg error">ما لقيت أي رقم هاتف صحيح (لازم يكون 10 خانات ويبدأ بـ 07).</div>`; return; }
    const sections = secs.filter(s=>fd.get('section_'+s));
    if(!sections.length){ msgBox.innerHTML = `<div class="form-msg error">اختر قسمًا واحدًا على الأقل.</div>`; return; }
    submitBtn.disabled = true;
    const success = [], notFound = [], already = [];
    phones.forEach(phone=>{
      const student = state.students.find(s=>s.phone===phone);
      if(!student){ notFound.push(phone); return; }
      let addedAny = false;
      sections.forEach(section=>{
        if(state.enrollments.some(en=>en.courseId===courseId && en.phone===phone && (en.section===section || !en.section))) return;
        state.enrollments.push({ courseId, phone, section });
        addedAny = true;
      });
      if(addedAny) success.push(phone); else already.push(phone);
    });
    if(success.length) await setData('enrollments', state.enrollments, true);
    submitBtn.disabled = false;
    let html = '';
    if(success.length) html += `<div class="form-msg ok">✅ تم تفعيل ${success.length} طالب بنجاح: ${success.map(escapeHtml).join('، ')}</div>`;
    if(already.length) html += `<div class="form-msg error">⚠️ ${already.length} طالب مفعّل مسبقًا لكل الأقسام المحددة: ${already.map(escapeHtml).join('، ')}</div>`;
    if(notFound.length) html += `<div class="form-msg error">❌ ${notFound.length} رقم غير مسجّل كطالب: ${notFound.map(escapeHtml).join('، ')}</div>`;
    if(invalid.length) html += `<div class="form-msg error">⚠️ مقاطع ما قدرت تُقرأ كأرقام صحيحة: ${invalid.map(escapeHtml).join('، ')}</div>`;
    msgBox.innerHTML = html;
    if(success.length) render();
  });
}

/* =========================================================
   تصدير قائمة المسجّلين بمادة معينة إلى ملف إكسيل
   (اسم الطالب / رقم الهاتف / اسم المادة / القسم)
   ========================================================= */
function exportEnrollmentsExcel(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  if(!course) return;
  if(typeof XLSX === 'undefined'){ alert('تعذّر تحميل مكتبة الإكسيل، تأكد من اتصالك بالإنترنت وحاول مجددًا.'); return; }
  const list = enrollmentsFor(courseId).slice().sort((a,b)=>{
    const sa = state.students.find(s=>s.phone===a.phone);
    const sb = state.students.find(s=>s.phone===b.phone);
    return (sa?.fullName || '').localeCompare(sb?.fullName || '', 'ar');
  });
  if(!list.length){ alert('لا يوجد طلاب مفعّلين بهذه المادة حاليًا.'); return; }
  const rows = list.map(e=>{
    const st = state.students.find(s=>s.phone===e.phone);
    return {
      'اسم الطالب': st ? st.fullName : '(غير مسجّل كطالب)',
      'رقم الهاتف': e.phone,
      'اسم المادة': course.title,
      'القسم': e.section ? SECTION_LABELS[e.section] : 'كل الأقسام'
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows, { header:['اسم الطالب','رقم الهاتف','اسم المادة','القسم'] });
  ws['!cols'] = [{ wch:24 }, { wch:14 }, { wch:28 }, { wch:12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المسجلين');
  const safeTitle = (course.title || 'course').replace(/[\\/:*?"<>|]/g,'').trim() || 'course';
  XLSX.writeFile(wb, `مسجلين-${safeTitle}.xlsx`);
}

/* =========================================================
   استيراد / مزامنة قائمة المسجّلين بمادة معينة من ملف إكسيل
   يقرأ الملف، يقارنه بالمسجّلين الحاليين بالأقسام المحددة،
   ثم يفعّل الأرقام الجديدة ويلغي تفعيل الأرقام غير الموجودة بالملف
   ========================================================= */
function modalImportEnrollments(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  const secs = courseSections(courseId);
  openModal(`
    <h3>${ICONS.plus} استيراد / مزامنة الطلاب من ملف إكسيل</h3>
    <p style="color:var(--muted); font-size:12.5px; margin-bottom:10px; line-height:1.7;">
      ارفع ملف إكسيل (أو CSV) فيه أرقام هواتف الطلاب — بأي عمود أو ترتيب، بيتم اكتشافها تلقائيًا.
      رح تتم مقارنة الأرقام بالملف مع قائمة المفعّلين الحاليين بالأقسام اللي تحددها بالأسفل:
      أي رقم جديد بالملف رح يُفعّل، وأي رقم كان مفعّلًا وما عاد موجود بالملف رح يُلغى تفعيله (لهذا القسم فقط).
      كل ما تعدّل على الملف (تضيف أو تحذف أرقام) وترفعه من جديد، رح تنعكس نفس التعديلات تلقائيًا.
    </p>
    <form id="importEnrollForm">
      <div class="field">
        <label>ملف الإكسيل</label>
        <input type="file" name="file" accept=".xlsx,.xls,.csv" required>
      </div>
      <div class="field">
        <label>الأقسام المطلوب مزامنتها</label>
        <div class="lecture-select-list">
          ${secs.map(s=>`<label class="lecture-select-row"><span>${SECTION_LABELS[s]}</span><input type="checkbox" name="section_${s}" checked></label>`).join('')}
        </div>
      </div>
      <div id="importEnrollMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">معاينة التغييرات</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('importEnrollForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(typeof XLSX === 'undefined'){ document.getElementById('importEnrollMsg').innerHTML = `<div class="form-msg error">تعذّر تحميل مكتبة الإكسيل، تأكد من اتصالك بالإنترنت وحاول مجددًا.</div>`; return; }
    const fd = new FormData(e.target);
    const file = fd.get('file');
    const msgBox = document.getElementById('importEnrollMsg');
    const sections = secs.filter(s=>fd.get('section_'+s));
    if(!file || !file.name){ msgBox.innerHTML = `<div class="form-msg error">اختر ملف إكسيل أولًا.</div>`; return; }
    if(!sections.length){ msgBox.innerHTML = `<div class="form-msg error">اختر قسمًا واحدًا على الأقل.</div>`; return; }
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    msgBox.innerHTML = `<p style="color:var(--muted); font-size:13px;">جارِ قراءة الملف...</p>`;
    try{
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type:'array' });
      const phones = new Set();
      wb.SheetNames.forEach(name=>{
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header:1, defval:'' });
        rows.forEach(row=>{
          row.forEach(cell=>{
            let norm = String(cell ?? '').trim().replace(/[\s\-()]/g,'');
            if(/^\+9627[0-9]{8}$/.test(norm)) norm = '0'+norm.slice(4);
            else if(/^009627[0-9]{8}$/.test(norm)) norm = '0'+norm.slice(5);
            else if(/^9627[0-9]{8}$/.test(norm)) norm = '0'+norm.slice(3);
            else if(/^7[0-9]{8}$/.test(norm)) norm = '0'+norm;
            if(isValidPhone(norm)) phones.add(norm);
          });
        });
      });
      const filePhones = Array.from(phones);
      if(!filePhones.length){ msgBox.innerHTML = `<div class="form-msg error">ما لقيت أي رقم هاتف صالح جوا الملف (لازم يكون 10 خانات ويبدأ بـ 07).</div>`; submitBtn.disabled=false; return; }
      const knownPhones = filePhones.filter(p=>state.students.some(s=>s.phone===p));
      const notFound = filePhones.filter(p=>!state.students.some(s=>s.phone===p));
      const toAdd = [], toRemove = [];
      sections.forEach(section=>{
        const current = state.enrollments.filter(en=>en.courseId===courseId && (en.section===section || !en.section)).map(en=>en.phone);
        knownPhones.forEach(p=>{ if(!current.includes(p)) toAdd.push({ phone:p, section }); });
        current.forEach(p=>{ if(!knownPhones.includes(p)) toRemove.push({ phone:p, section }); });
      });
      let html = `<div class="form-msg info">📄 لقيت ${filePhones.length} رقم صالح بالملف.</div>`;
      if(toAdd.length) html += `<div class="form-msg ok">➕ رح يتفعّل ${toAdd.length} تفعيل جديد.</div>`;
      if(toRemove.length) html += `<div class="form-msg error">➖ رح يُلغى ${toRemove.length} تفعيل غير موجود بالملف: ${toRemove.slice(0,15).map(x=>escapeHtml(x.phone)).join('، ')}${toRemove.length>15?'...':''}</div>`;
      if(notFound.length) html += `<div class="form-msg error">⚠️ ${notFound.length} رقم بالملف مش مسجّل كطالب أصلًا بالمنصة، رح يتم تجاهله: ${notFound.slice(0,15).map(escapeHtml).join('، ')}${notFound.length>15?'...':''}</div>`;
      if(!toAdd.length && !toRemove.length){
        html += `<div class="form-msg ok">✅ القائمة متطابقة أصلًا، ما في أي تغيير مطلوب.</div>`;
        msgBox.innerHTML = html;
        submitBtn.disabled = false;
        return;
      }
      html += `<button type="button" class="btn danger small" id="confirmSyncBtn" style="margin-top:6px;">تأكيد المزامنة الآن</button>`;
      msgBox.innerHTML = html;
      submitBtn.disabled = false;
      document.getElementById('confirmSyncBtn').addEventListener('click', async ()=>{
        const confirmBtn = document.getElementById('confirmSyncBtn');
        confirmBtn.disabled = true;
        toRemove.forEach(({ phone, section })=>{
          state.enrollments = state.enrollments.filter(en=> !(en.courseId===courseId && en.phone===phone && (en.section===section || !en.section)));
        });
        toAdd.forEach(({ phone, section })=>{
          if(!state.enrollments.some(en=>en.courseId===courseId && en.phone===phone && (en.section===section || !en.section))){
            state.enrollments.push({ courseId, phone, section });
          }
        });
        await setData('enrollments', state.enrollments, true);
        closeModal();
        render();
      });
    } catch(err){
      msgBox.innerHTML = `<div class="form-msg error">تعذّرت قراءة الملف. تأكد إنه ملف إكسيل صالح (.xlsx/.xls/.csv).</div>`;
      submitBtn.disabled = false;
    }
  });
}

function modalResetStudentDevice(){
  openModal(`
    <h3>${ICONS.lock} إعادة تعيين أجهزة عدة طلاب دفعة وحدة</h3>
    <p style="color:var(--muted); font-size:13.5px; margin-bottom:10px;">ألصق أرقام هواتف الطلاب لإلغاء ربط حساباتهم بأجهزتهم الحالية، ليتمكنوا من تسجيل الدخول من جهاز جديد.</p>
    <form id="resetDeviceForm">
      <div class="field">
        <label>أرقام هواتف الطلاب</label>
        <textarea name="phones" required rows="6" style="direction:ltr; font-family:monospace; resize:vertical;" placeholder="0791234567
0781234567
0771234567
...أو الصقهم متسلسلين بدون أي فواصل، بيتم فصلهم تلقائيًا كل 10 أرقام"></textarea>
        <p class="hint" style="margin-top:6px; font-size:12.5px; color:var(--muted);">حط رقم بكل سطر، أو مفصولين بفاصلة/مسافة، أو حتى ملصوقين ورا بعض بدون فواصل — كل رقم 10 خانات ويبدأ بـ 07.</p>
      </div>
      <div id="resetDeviceMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn danger small">إعادة تعيين الأجهزة للجميع</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('resetDeviceForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('resetDeviceMsg');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if(!supabaseClient){ msgBox.innerHTML = `<div class="form-msg error">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>`; return; }
    const { valid: phones, invalid } = parsePhoneBatch(fd.get('phones'));
    if(!phones.length){ msgBox.innerHTML = `<div class="form-msg error">ما لقيت أي رقم هاتف صحيح (لازم يكون 10 خانات ويبدأ بـ 07).</div>`; return; }
    submitBtn.disabled = true;
    msgBox.innerHTML = `<div class="form-msg">جاري إعادة تعيين ${phones.length} جهاز...</div>`;
    const success = [], notFound = [], failed = [];
    for(const phone of phones){
      const { error, count } = await supabaseClient.from('student_devices').delete({ count:'exact' }).eq('phone', phone);
      if(error){ failed.push(phone); continue; }
      if(!count){ notFound.push(phone); continue; }
      success.push(phone);
    }
    submitBtn.disabled = false;
    let html = '';
    if(success.length) html += `<div class="form-msg ok">✅ تم إلغاء ربط ${success.length} جهاز بنجاح: ${success.map(escapeHtml).join('، ')}</div>`;
    if(notFound.length) html += `<div class="form-msg error">⚠️ ${notFound.length} رقم ما إله جهاز مسجَّل أصلًا: ${notFound.map(escapeHtml).join('، ')}</div>`;
    if(failed.length) html += `<div class="form-msg error">❌ فشلت العملية لـ ${failed.length} رقم: ${failed.map(escapeHtml).join('، ')}</div>`;
    if(invalid.length) html += `<div class="form-msg error">⚠️ مقاطع ما قدرت تُقرأ كأرقام صحيحة: ${invalid.map(escapeHtml).join('، ')}</div>`;
    msgBox.innerHTML = html;
  });
}

function modalSendNotification(){
  const uniOptions = UNIVERSITIES.map(u=>`<option value="${escapeHtml(u.name)}">${escapeHtml(u.name)}</option>`).join('');
  const majorOptions = MAJORS.map(m=>`<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('');
  openModal(`
    <h3>${ICONS.plus} إرسال إشعار للطلاب</h3>
    <form id="notifForm">
      <div class="field"><label>عنوان الإشعار</label><input type="text" name="title" required placeholder="مثال: تحديث جديد في بنك الأسئلة"></div>
      <div class="field"><label>نص الإشعار</label><textarea name="body" required rows="4" placeholder="اكتب تفاصيل الإشعار هنا"></textarea></div>
      <div class="field">
        <label>الفئة المستهدفة</label>
        <select name="targetType" id="notifTargetType">
          <option value="all">كل الطلاب</option>
          <option value="university">طلاب جامعة معينة</option>
          <option value="major">طلاب تخصص معين</option>
          <option value="phones">أرقام هواتف محددة</option>
        </select>
      </div>
      <div class="field" id="notifUniField" style="display:none;"><label>الجامعة</label><select name="university">${uniOptions}</select></div>
      <div class="field" id="notifMajorField" style="display:none;"><label>التخصص</label><select name="major">${majorOptions}</select></div>
      <div class="field" id="notifPhonesField" style="display:none;">
        <label>أرقام هواتف الطلاب</label>
        <textarea name="phones" rows="5" style="direction:ltr; font-family:monospace; resize:vertical;" placeholder="0791234567
0781234567
...أو الصقهم متسلسلين بدون فواصل، بيتم فصلهم تلقائيًا كل 10 أرقام"></textarea>
      </div>
      <div id="notifMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">إرسال الإشعار</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  const targetSel = document.getElementById('notifTargetType');
  const uniField = document.getElementById('notifUniField');
  const majorField = document.getElementById('notifMajorField');
  const phonesField = document.getElementById('notifPhonesField');
  targetSel.addEventListener('change', ()=>{
    uniField.style.display = targetSel.value==='university' ? '' : 'none';
    majorField.style.display = targetSel.value==='major' ? '' : 'none';
    phonesField.style.display = targetSel.value==='phones' ? '' : 'none';
  });
  document.getElementById('notifForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('notifMsg');
    const title = fd.get('title').trim();
    const body = fd.get('body').trim();
    const targetType = fd.get('targetType');
    let targetValue = null;
    if(targetType === 'university') targetValue = fd.get('university');
    else if(targetType === 'major') targetValue = fd.get('major');
    else if(targetType === 'phones'){
      const { valid: phones, invalid } = parsePhoneBatch(fd.get('phones'));
      if(!phones.length){ msgBox.innerHTML = `<div class="form-msg error">ما لقيت أي رقم هاتف صحيح (لازم يكون 10 خانات ويبدأ بـ 07).</div>`; return; }
      if(invalid.length){ msgBox.innerHTML = `<div class="form-msg error">⚠️ مقاطع ما قدرت تُقرأ كأرقام صحيحة: ${invalid.map(escapeHtml).join('، ')}</div>`; return; }
      targetValue = phones;
    }
    state.notifications.push({ id:'n'+Date.now(), title, body, target: targetType, targetValue, createdAt: Date.now() });
    await setData('notifications', state.notifications, true);
    closeModal(); render();
  });
}

/* نسخة مبسّطة من مودال الإشعارات، خاصة بالمدرّس: يرسل بس لطلاب مادته المشتركين
   (target:'course')، بدون خيارات استهداف أوسع (جامعة/تخصص/كل الطلاب) محفوظة للأدمن فقط.
   نخزّن senderTeacherId لتسهيل عرض/حذف المدرّس لإشعاراته لاحقًا من صفحة مادته. */
function modalSendCourseNotification(courseId){
  const course = state.courses.find(c=>c.id===courseId);
  if(!course || !isCourseOwnerTeacher(course)) return;
  const enrolledCount = enrollmentsFor(courseId).length;
  openModal(`
    <h3>${ICONS.plus} إرسال إشعار لمشتركي ${escapeHtml(course.title)}</h3>
    <p class="hint" style="margin-bottom:14px;">سيصل هذا الإشعار لكل الطلاب المشتركين حاليًا بهذه المادة (${enrolledCount} طالب).</p>
    <form id="courseNotifForm">
      <div class="field"><label>عنوان الإشعار</label><input type="text" name="title" required placeholder="مثال: تم إضافة محاضرة جديدة"></div>
      <div class="field"><label>نص الإشعار</label><textarea name="body" required rows="4" placeholder="اكتب تفاصيل الإشعار هنا"></textarea></div>
      <div id="courseNotifMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">إرسال الإشعار</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('courseNotifForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title').trim();
    const body = fd.get('body').trim();
    state.notifications.push({ id:'n'+Date.now(), title, body, target:'course', targetValue:courseId, senderTeacherId: state.session.teacherId, createdAt: Date.now() });
    await setData('notifications', state.notifications, true);
    closeModal(); render();
  });
}

/* أدوات صفوف الفيديو/الملف الديناميكية داخل نموذج المحاضرة */
function linkRowHtml(labelVal, urlVal){
  return `<div class="link-row">
    <input type="text" class="link-label" placeholder="اسم (اختياري)" value="${escapeHtml(labelVal||'')}">
    <input type="url" class="link-url" placeholder="https://..." value="${escapeHtml(urlVal||'')}">
    <button type="button" class="link-remove" title="حذف">✕</button>
  </div>`;
}
function bindLinkRows(containerId, addBtnId){
  const container = document.getElementById(containerId);
  const addBtn = document.getElementById(addBtnId);
  container.addEventListener('click', (e)=>{
    const rm = e.target.closest('.link-remove');
    if(rm) rm.closest('.link-row').remove();
  });
  addBtn.addEventListener('click', ()=>{
    container.insertAdjacentHTML('beforeend', linkRowHtml());
  });
}
function collectLinkRows(containerId){
  return Array.from(document.querySelectorAll('#'+containerId+' .link-row')).map(row=>({
    label: row.querySelector('.link-label').value.trim(),
    url: row.querySelector('.link-url').value.trim()
  })).filter(r=>r.url);
}

/* =========================================================
   رفع فيديوهات المحاضرات مباشرة إلى Bunny Stream:
   - كل مادة (course) مرتبطة بـ Collection في مكتبة Bunny (course.collectionId)،
     تُنشأ تلقائيًا أول مرة يُرفع فيها فيديو لهذه المادة.
   - الرفع يتم من المتصفح مباشرة إلى Bunny عبر بروتوكول tus (قابل لاستئناف
     الرفع)، بدون ما يمرّ الفيديو عبر خادمنا — فقط "توقيع" رفع قصير الصلاحية
     نطلبه من Supabase Edge Function (bunny-upload) التي تحفظ مفتاح Bunny
     السري بأمان على الخادم. راجع ملف bunny-upload/index.ts المرفق للنشر.
   ========================================================= */
const BUNNY_FUNCTION_ENDPOINT = SUPABASE_URL.startsWith('http') ? (SUPABASE_URL + '/functions/v1/bunny-upload') : '';

async function callBunnyFunction(action, payload){
  if(!BUNNY_FUNCTION_ENDPOINT) throw new Error('لم يتم إعداد الاتصال بخدمة رفع الفيديو بعد.');
  const res = await fetch(BUNNY_FUNCTION_ENDPOINT, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+SUPABASE_ANON_KEY, 'apikey':SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify(Object.assign({ action }, payload))
  });
  if(!res.ok){
    let detail = '';
    try{
      const errJson = await res.json();
      detail = errJson.error || (errJson.details ? JSON.stringify(errJson.details) : '');
    }catch(e){}
    throw new Error(detail || ('فشل الطلب (رمز ' + res.status + ')'));
  }
  return res.json();
}

/* يجيب توكن مشاهدة صالح لمدة قصيرة (Embed View Token Authentication) ويبني رابط الـ embed الآمن.
   لازم يُستدعى من جديد كل مرة الطالب بدو يشاهد، لأن التوكن له صلاحية محدودة بالوقت. */
async function getSecureEmbedUrl(libraryId, videoGuid){
  const result = await callBunnyFunction('get-play-token', { videoGuid });
  return `https://iframe.mediadelivery.net/embed/${result.libraryId}/${result.videoGuid}?token=${result.token}&expires=${result.expires}`;
}

/* يفتح/يقفل مشغّل الفيديو جوا الصفحة عند الضغط على زر "مشاهدة" (بدل فتح رابط بنافذة جديدة) */
async function toggleSecurePlayer(btn){
  const libraryId = btn.dataset.libraryId;
  const videoGuid = btn.dataset.videoGuid;
  const slot = document.querySelector(`.video-player-slot[data-player-for="${CSS.escape(videoGuid)}"]`);
  if(!slot) return;

  // إذا مفتوح أصلًا، اقفله
  if(slot.dataset.open === '1'){
    slot.innerHTML = '';
    slot.dataset.open = '0';
    return;
  }

  slot.innerHTML = `<div class="video-player-loading">جاري تجهيز الفيديو...</div>`;
  try{
    const secureUrl = await getSecureEmbedUrl(libraryId, videoGuid);
    slot.innerHTML = `
      <div class="video-player-wrap">
        <iframe src="${secureUrl}" loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
      </div>`;
    slot.dataset.open = '1';
    // نخلي الفيديو كامل يظهر على الشاشة (بما فيه الجزء السفلي) بعد ما يفتح
    requestAnimationFrame(()=>{
      slot.scrollIntoView({ behavior:'smooth', block:'center' });
    });
  }catch(err){
    console.error('فشل تجهيز رابط المشاهدة', err);
    slot.innerHTML = `<div class="video-player-loading" style="color:var(--danger);">تعذّر تحميل الفيديو، حاول مرة أخرى.</div>`;
  }
}

/* ينشئ Collection في Bunny خاص بهذه المادة أول مرة فقط، ويحفظ رقمه على المادة نفسها.
   forceNew=true بتتجاهل أي collectionId محفوظ سابقًا وتنشئ وحدة جديدة من الصفر —
   بتستخدم لما يتضح إن الـ Collection المحفوظة صارت "يتيمة" (محذوفة يدويًا من Bunny،
   أو محفوظة من مكتبة فيديو (Library) قديمة اتغيّرت). */
async function ensureCourseCollection(course, forceNew){
  if(course.collectionId && !forceNew) return course.collectionId;
  const result = await callBunnyFunction('create-collection', { title: course.title });
  if(!result || !result.collectionId) throw new Error('تعذّر إنشاء مجلد الفيديو الخاص بهذه المادة على Bunny.');
  course.collectionId = result.collectionId;
  await setData('courses', state.courses, true);
  return course.collectionId;
}

/* بترجع true إذا رسالة الخطأ من Bunny بتدل إن الـ Collection المحفوظة مش موجودة فعليًا
   (مثلاً انحذفت يدويًا من لوحة Bunny، أو تغيّرت مكتبة الفيديو من بعد ما اتسوّت). */
function isMissingCollectionError(err){
  const msg = (err && err.message || '').toLowerCase();
  return msg.includes('collection') && (msg.includes('not exist') || msg.includes('not found'));
}

/* يرفع ملف فيديو من جهاز المستخدم مباشرة إلى Bunny Stream عبر tus، ويرجّع رابط
   المشاهدة (embed) بعد اكتمال الرفع. onProgress(percent) يُستدعى أثناء الرفع. */
function uploadVideoToBunny(file, { courseId, title }, onProgress){
  return new Promise((resolve, reject)=>{
    (async ()=>{
      try{
        if(typeof tus === 'undefined') throw new Error('مكتبة الرفع لم يتم تحميلها، تحقق من الاتصال بالإنترنت وأعد المحاولة.');
        const course = state.courses.find(c=>c.id===courseId);
        if(!course) throw new Error('لم يتم العثور على المادة المرتبطة بهذه المحاضرة.');
        let collectionId = await ensureCourseCollection(course);
        let created;
        try{
          created = await callBunnyFunction('create-video', { title: title || file.name, collectionId });
        }catch(err){
          // الـ collectionId المحفوظ صار "يتيم" (مش موجود فعليًا على Bunny) — ننشئ
          // Collection جديدة تلقائيًا، نحدّث المادة، ونعيد المحاولة مرة وحدة بس.
          if(isMissingCollectionError(err)){
            collectionId = await ensureCourseCollection(course, true);
            created = await callBunnyFunction('create-video', { title: title || file.name, collectionId });
          } else {
            throw err;
          }
        }
        const { videoGuid, libraryId, expire, signature } = created || {};
        if(!videoGuid || !libraryId || !expire || !signature) throw new Error('تعذّر تجهيز رفع الفيديو، حاول مرة أخرى.');
        const upload = new tus.Upload(file, {
          endpoint: 'https://video.bunnycdn.com/tusupload',
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: String(expire),
            VideoId: videoGuid,
            LibraryId: String(libraryId),
          },
          metadata: { filetype: file.type, title: title || file.name, collection: collectionId },
          onError: (err)=> reject(err),
          onProgress: (uploadedBytes, totalBytes)=>{
            if(onProgress) onProgress(Math.round((uploadedBytes/totalBytes)*100));
          },
          onSuccess: ()=>{
            resolve({ embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoGuid}`, videoGuid, libraryId });
          },
        });
        upload.start();
      }catch(e){ reject(e); }
    })();
  });
}

/* ===== صفوف الفيديو داخل نموذج المحاضرة: صف رفع من الجهاز / صف فيديو مرفوع مسبقًا / صف رابط يدوي (أدمن فقط) ===== */
function videoUploadRowHtml(){
  return `<div class="video-row video-row-uploading">
    <div class="video-row-main">
      <input type="text" class="link-label" placeholder="اسم الفيديو (اختياري)" value="">
      <input type="file" class="video-file-input" accept="video/*">
    </div>
    <div class="upload-progress"><div class="upload-progress-fill"></div></div>
    <div class="upload-status">اختر ملف الفيديو من جهازك لبدء الرفع</div>
    <button type="button" class="video-row-remove" title="حذف">✕</button>
  </div>`;
}
function videoExistingRowHtml(label, url, bunnyGuid){
  return `<div class="video-row video-row-done" data-url="${escapeHtml(url)}" ${bunnyGuid ? `data-bunny-guid="${escapeHtml(bunnyGuid)}"` : ''}>
    <div class="video-row-main">
      <input type="text" class="link-label" placeholder="اسم الفيديو (اختياري)" value="${escapeHtml(label||'')}">
      <span class="video-row-badge">${bunnyGuid ? (ICONS.play+' فيديو مرفوع على Bunny') : (ICONS.play+' رابط فيديو خارجي')}</span>
    </div>
    <button type="button" class="video-row-remove" title="حذف">✕</button>
  </div>`;
}
function videoManualRowHtml(label, url){
  return `<div class="video-row video-row-manual">
    <div class="video-row-main">
      <input type="text" class="link-label" placeholder="اسم (اختياري)" value="${escapeHtml(label||'')}">
      <input type="url" class="link-url" placeholder="https://..." value="${escapeHtml(url||'')}">
    </div>
    <button type="button" class="video-row-remove" title="حذف">✕</button>
  </div>`;
}
function bindVideoRowsContainer(containerId){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.addEventListener('click', (e)=>{
    const rm = e.target.closest('.video-row-remove');
    if(rm) rm.closest('.video-row').remove();
  });
}
/* يضيف صف "رفع فيديو من الجهاز" جديد ويربط رفعه التلقائي فور اختيار الملف */
function addVideoUploadRow(containerId, courseId){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.insertAdjacentHTML('beforeend', videoUploadRowHtml());
  const row = container.lastElementChild;
  const fileInput = row.querySelector('.video-file-input');
  const labelInput = row.querySelector('.link-label');
  const statusEl = row.querySelector('.upload-status');
  const fillEl = row.querySelector('.upload-progress-fill');
  fileInput.addEventListener('change', async ()=>{
    const file = fileInput.files[0];
    if(!file) return;
    fileInput.disabled = true;
    labelInput.disabled = true;
    statusEl.textContent = 'جاري التحضير للرفع...';
    try{
      const titleVal = labelInput.value.trim() || file.name;
      const result = await uploadVideoToBunny(file, { courseId, title: titleVal }, (pct)=>{
        fillEl.style.width = pct + '%';
        statusEl.textContent = 'جاري الرفع... ' + pct + '%';
      });
      statusEl.textContent = '✔ تم رفع الفيديو بنجاح';
      row.classList.remove('video-row-uploading');
      row.classList.add('video-row-done');
      row.dataset.url = result.embedUrl;
      row.dataset.bunnyGuid = result.videoGuid;
      fileInput.remove();
      const progressEl = row.querySelector('.upload-progress');
      if(progressEl) progressEl.remove();
      labelInput.disabled = false;
    }catch(err){
      console.error('Bunny upload failed', err);
      statusEl.textContent = '✕ فشل الرفع: ' + (err.message || 'خطأ غير معروف، حاول مرة أخرى');
      fileInput.disabled = false;
      labelInput.disabled = false;
    }
  });
}
/* يجمع كل صفوف الفيديو (مرفوعة + منتهية + روابط يدوية للأدمن) من الحاوية، ويتجاهل الرفوعات غير المكتملة */
function collectVideoRows(containerId){
  const rows = Array.from(document.querySelectorAll('#'+containerId+' .video-row'));
  const result = [];
  rows.forEach(row=>{
    const labelInput = row.querySelector('.link-label');
    const label = labelInput ? labelInput.value.trim() : '';
    if(row.classList.contains('video-row-manual')){
      const url = row.querySelector('.link-url').value.trim();
      if(url) result.push({ label, url });
    } else if(row.dataset.url){
      const item = { label, url: row.dataset.url };
      if(row.dataset.bunnyGuid) item.bunnyGuid = row.dataset.bunnyGuid;
      result.push(item);
    }
  });
  return result;
}

function sectionOptionsHtml(selected, allowed){
  const list = (allowed && allowed.length) ? allowed : SECTIONS;
  const opts = list.map(s=>`<option value="${s}" ${selected===s?'selected':''}>${SECTION_LABELS[s]}</option>`);
  /* لو المحاضرة محفوظة على قسم استُبعد لاحقًا من المادة، نبقيه بالقائمة حتى لا يضيع تصنيفها */
  if(selected && !list.includes(selected)) opts.push(`<option value="${selected}" selected>${SECTION_LABELS[selected]} (غير مفعّل حاليًا لهذه المادة)</option>`);
  return opts.join('');
}

function modalAddLecture(courseId){
  const admin = isAdminSession();
  openModal(`
    <h3>${ICONS.plus} إضافة محاضرة جديدة</h3>
    <form id="lectureForm">
      <div class="field"><label>عنوان المحاضرة</label><input type="text" name="title" required placeholder="مثال: مقدمة في..."></div>
      <div class="field"><label>القسم</label><select name="section">${sectionOptionsHtml(courseSections(courseId)[0], courseSections(courseId))}</select></div>
      <div class="field"><label>وصف مختصر (اختياري)</label><textarea name="description" placeholder="وصف مختصر لمحتوى المحاضرة"></textarea></div>
      <div class="field">
        <label>فيديو المحاضرة (يمكن رفع أكثر من فيديو لنفس المحاضرة)</label>
        <div class="link-rows" id="videoRows"></div>
        <button type="button" class="btn small teal solid" id="addVideoUploadRow">${ICONS.plus} رفع فيديو من الجهاز</button>
        ${admin ? `
        <details class="manual-link-details">
          <summary>إلصاق رابط فيديو يدويًا (اختياري)</summary>
          <div class="link-rows" id="videoManualRows"></div>
          <button type="button" class="btn small" id="addVideoManualRow">${ICONS.plus} إضافة رابط فيديو</button>
        </details>` : ''}
      </div>
      <div class="field">
        <label>ملفات المحاضرة (اختياري — يمكن إضافة أكثر من ملف)</label>
        <div class="link-rows" id="fileRows"></div>
        <button type="button" class="btn small" id="addFileRow">${ICONS.plus} إضافة ملف</button>
      </div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ المحاضرة</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  bindVideoRowsContainer('videoRows');
  document.getElementById('addVideoUploadRow').addEventListener('click', ()=> addVideoUploadRow('videoRows', courseId));
  bindLinkRows('fileRows', 'addFileRow');
  document.getElementById('addFileRow').click();
  if(admin){
    bindLinkRows('videoManualRows', 'addVideoManualRow');
  }
  document.getElementById('lectureForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const stillUploading = document.querySelector('#videoRows .video-row-uploading');
    if(stillUploading){ alert('في فيديو لسا قيد الرفع، انتظر يخلص أو احذفه قبل الحفظ.'); return; }
    const fd = new FormData(e.target);
    const manualVideos = admin ? collectLinkRows('videoManualRows') : [];
    state.lectures.push({
      id:'l'+Date.now(), courseId,
      title:fd.get('title').trim(),
      section: SECTIONS.includes(fd.get('section')) ? fd.get('section') : 'first',
      description:(fd.get('description')||'').trim(),
      videos: [...collectVideoRows('videoRows'), ...manualVideos],
      files: collectLinkRows('fileRows'),
    });
    await setData('lectures', state.lectures, true);
    closeModal(); render();
  });
}

function modalEditLecture(lectureId){
  const lecture = state.lectures.find(l=>l.id===lectureId);
  if(!lecture) return;
  const admin = isAdminSession();
  const existingVideos = lecture.videos || [];
  const files = (lecture.files && lecture.files.length) ? lecture.files : [{label:'',url:''}];
  openModal(`
    <h3>${ICONS.edit} تعديل المحاضرة</h3>
    <form id="lectureEditForm">
      <div class="field"><label>عنوان المحاضرة</label><input type="text" name="title" required value="${escapeHtml(lecture.title)}"></div>
      <div class="field"><label>القسم</label><select name="section">${sectionOptionsHtml(lecture.section, courseSections(lecture.courseId))}</select></div>
      <div class="field"><label>وصف مختصر (اختياري)</label><textarea name="description">${escapeHtml(lecture.description||'')}</textarea></div>
      <div class="field">
        <label>فيديو المحاضرة (يمكن رفع أكثر من فيديو لنفس المحاضرة)</label>
        <div class="link-rows" id="videoRows">${existingVideos.map(v=>videoExistingRowHtml(v.label, v.url, v.bunnyGuid)).join('')}</div>
        <button type="button" class="btn small teal solid" id="addVideoUploadRow">${ICONS.plus} رفع فيديو من الجهاز</button>
        ${admin ? `
        <details class="manual-link-details">
          <summary>إلصاق رابط فيديو يدويًا (اختياري)</summary>
          <div class="link-rows" id="videoManualRows"></div>
          <button type="button" class="btn small" id="addVideoManualRow">${ICONS.plus} إضافة رابط فيديو</button>
        </details>` : ''}
      </div>
      <div class="field">
        <label>ملفات المحاضرة (اختياري — يمكن إضافة أكثر من ملف)</label>
        <div class="link-rows" id="fileRows">${files.map(f=>linkRowHtml(f.label,f.url)).join('')}</div>
        <button type="button" class="btn small" id="addFileRow">${ICONS.plus} إضافة ملف</button>
      </div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ التعديلات</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  bindVideoRowsContainer('videoRows');
  document.getElementById('addVideoUploadRow').addEventListener('click', ()=> addVideoUploadRow('videoRows', lecture.courseId));
  bindLinkRows('fileRows', 'addFileRow');
  if(admin){
    bindLinkRows('videoManualRows', 'addVideoManualRow');
  }
  document.getElementById('lectureEditForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const stillUploading = document.querySelector('#videoRows .video-row-uploading');
    if(stillUploading){ alert('في فيديو لسا قيد الرفع، انتظر يخلص أو احذفه قبل الحفظ.'); return; }
    const fd = new FormData(e.target);
    const manualVideos = admin ? collectLinkRows('videoManualRows') : [];
    lecture.title = fd.get('title').trim(); lecture.description = (fd.get('description')||'').trim();
    lecture.section = SECTIONS.includes(fd.get('section')) ? fd.get('section') : 'first';
    lecture.videos = [...collectVideoRows('videoRows'), ...manualVideos];
    lecture.files = collectLinkRows('fileRows');
    delete lecture.videoUrl; delete lecture.fileUrl;
    await setData('lectures', state.lectures, true);
    closeModal(); render();
  });
}

function lectureOptionsFor(courseId, selectedLectureId){
  const opts = state.lectures.filter(l=>l.courseId===courseId).map(l=>`<option value="${l.id}" ${selectedLectureId===l.id?'selected':''}>${escapeHtml(l.title)}</option>`).join('');
  return `<option value="" ${!selectedLectureId?'selected':''}>— سؤال عام (غير مرتبط بمحاضرة) —</option>${opts}`;
}

/* أزواج التوصيل (matching) — صف واحد فيه عنصر يمين وعنصر يسار، بنفس نمط صفوف الروابط */
function matchPairRowHtml(leftVal, rightVal){
  return `<div class="link-row match-pair-row">
    <input type="text" class="match-left" dir="ltr" placeholder="العنصر الأول (مثال: مصطلح)" value="${escapeHtml(leftVal||'')}">
    <span class="match-pair-arrow">↔</span>
    <input type="text" class="match-right" dir="ltr" placeholder="ما يقابله (مثال: تعريف)" value="${escapeHtml(rightVal||'')}">
    <button type="button" class="link-remove match-remove" title="حذف">✕</button>
  </div>`;
}
function bindMatchPairRows(){
  const container = document.getElementById('matchPairRows');
  const addBtn = document.getElementById('addMatchPairRow');
  if(!container || !addBtn) return;
  container.addEventListener('click', (e)=>{
    const rm = e.target.closest('.match-remove');
    if(!rm) return;
    if(container.querySelectorAll('.match-pair-row').length <= 2) return; // أقل شي زوجين
    rm.closest('.match-pair-row').remove();
  });
  addBtn.addEventListener('click', ()=>{
    if(container.querySelectorAll('.match-pair-row').length >= 8) return; // أقصى شي 8 أزواج
    container.insertAdjacentHTML('beforeend', matchPairRowHtml('',''));
  });
}
function collectMatchPairsFromForm(){
  return Array.from(document.querySelectorAll('#matchPairRows .match-pair-row')).map(row=>({
    left: row.querySelector('.match-left').value.trim(),
    right: row.querySelector('.match-right').value.trim()
  })).filter(p=>p.left && p.right);
}

/* الحقول الخاصة بكل نمط سؤال (تُعاد رسمها ديناميكيًا عند تغيير نمط السؤال) */
function questionTypeFieldsHtml(type, d){
  d = d || {};
  if(type === 'written'){
    return `
    <div class="field"><label>نموذج الإجابة (Model Answer، اختياري — يظهر للطالب كمرجع للمراجعة الذاتية)</label><textarea name="modelAnswer" dir="ltr" style="text-align:left;" placeholder="Write a sample/model answer here">${escapeHtml(d.modelAnswer||'')}</textarea></div>`;
  }
  if(type === 'matching'){
    const pairs = (d.pairs && d.pairs.length) ? d.pairs : [{left:'',right:''},{left:'',right:''}];
    return `
    <div class="field">
      <label>أزواج التوصيل (اكتب كل عنصر وما يقابله — زوجين على الأقل، وحتى 8 أزواج)</label>
      <div class="link-rows" id="matchPairRows">${pairs.map(p=>matchPairRowHtml(p.left,p.right)).join('')}</div>
      <button type="button" class="btn small" id="addMatchPairRow">${ICONS.plus} إضافة زوج</button>
    </div>`;
  }
  /* mcq (الافتراضي) — حتى 5 خيارات، أول خيارين مطلوبين والباقي اختياري، مع تحديد الإجابة الصحيحة بزر راديو */
  const opts = d.options || [];
  const activeCorrect = d.correctIndex===undefined ? 0 : d.correctIndex;
  const rows = [0,1,2,3,4].map(i=>`
    <div class="opt-row">
      <input type="radio" name="correctIndex" value="${i}" ${activeCorrect===i?'checked':''}>
      <span class="opt-letter">${String.fromCharCode(65+i)}.</span>
      <input type="text" name="opt${i}" dir="ltr" placeholder="${i<2 ? 'مطلوب' : 'اختياري'}" value="${escapeHtml(opts[i]||'')}">
    </div>`).join('');
  return `
    <div class="field">
      <label>الخيارات (فعّل الدائرة بجانب الإجابة الصحيحة — أول خيارين مطلوبين، حتى 5 خيارات إجمالًا)</label>
      ${rows}
    </div>`;
}

/* المحرر المستخدم لنص السؤال والتفسير يدعم الآن: عريض/مائل/تسطير، نوع/حجم/لون الخط،
   إضافة صور، وإضافة جداول بعدد صفوف/أعمدة يحدّده الأدمن. idSuffix يميّز بين فورم
   الإضافة وفورم التعديل حتى لا يتعارض معرّف العنصر (id) لو فُتحا بنفس الاسم. */
function questionFormFields(defaults, idSuffix){
  const d = defaults || {};
  const suffix = idSuffix || '';
  const type = d.type || 'mcq';
  const courseOptions = state.courses.map(c=>`<option value="${c.id}" ${d.courseId===c.id?'selected':''}>${escapeHtml(c.title)}</option>`).join('');
  const questionEditorId = 'qQuestionEditor'+suffix;
  const explanationEditorId = 'qExplanationEditor'+suffix;
  return `
    <div class="field"><label>الكورس</label><select name="courseId" id="qCourseSelect">${courseOptions}</select></div>
    <div class="field"><label>المحاضرة (اختياري)</label><select name="lectureId" id="qLectureSelect">${lectureOptionsFor(d.courseId || state.courses[0]?.id, d.lectureId)}</select></div>
    <div class="field"><label>طبيعة السؤال</label><select name="nature"><option value="past" ${d.nature==='past'||!d.nature?'selected':''}>أسئلة سنوات سابقة</option><option value="ref" ${d.nature==='ref'?'selected':''}>أسئلة مراجع</option></select></div>
    <div class="field"><label>نمط السؤال</label><select name="type" id="qTypeSelect">
      <option value="mcq" ${type==='mcq'?'selected':''}>اختيار من متعدد (حتى 5 خيارات)</option>
      <option value="written" ${type==='written'?'selected':''}>سؤال كتابي (إجابة حرة)</option>
      <option value="matching" ${type==='matching'?'selected':''}>سؤال توصيل (Matching)</option>
    </select></div>
    <div class="field"><label>نص السؤال (بالإنجليزي) — يمكن إضافة صور وجداول وتنسيق الخط</label>
      ${rteToolbarHtml(questionEditorId)}
      <div class="rte-editor i18n-skip" id="${questionEditorId}" contenteditable="true" dir="ltr" style="text-align:left;" data-placeholder="Write the question here">${d.question||''}</div>
    </div>
    <div id="qTypeFields">${questionTypeFieldsHtml(type, d)}</div>
    <div class="field"><label>Explanation (تفسير الإجابة، اختياري) — يمكن إضافة صور وجداول وتنسيق الخط</label>
      ${rteToolbarHtml(explanationEditorId)}
      <div class="rte-editor i18n-skip" id="${explanationEditorId}" contenteditable="true" dir="ltr" style="text-align:left;" data-placeholder="Write an explanation shown to the student with the correct answer">${d.explanation||''}</div>
    </div>
    <div id="questionMsg"></div>
  `;
}

function bindQuestionFormDynamics(formEl){
  const courseSelect = document.getElementById('qCourseSelect');
  const lectureSelect = document.getElementById('qLectureSelect');
  if(courseSelect && lectureSelect){
    courseSelect.addEventListener('change', ()=>{
      lectureSelect.innerHTML = lectureOptionsFor(courseSelect.value, null);
    });
  }
  const typeSelect = document.getElementById('qTypeSelect');
  const typeFields = document.getElementById('qTypeFields');
  if(typeSelect && typeFields){
    typeSelect.addEventListener('change', ()=>{
      typeFields.innerHTML = questionTypeFieldsHtml(typeSelect.value, {});
      bindMatchPairRows();
    });
  }
  bindMatchPairRows();
  if(formEl) wireRteToolbar(formEl);
}
/* يقرأ محتوى محرِّر غني (نص السؤال/التفسير) بعد تطهيره، ويتحقّق هل يحوي نصًا
   ظاهرًا أو وسائط (صورة/جدول) حتى لا يُحفظ سؤال فارغ */
function readRichEditor(editorId){
  const el = document.getElementById(editorId);
  if(!el) return { html:'', hasContent:false };
  const html = sanitizeSummaryHtml(el.innerHTML);
  const hasText = el.textContent.trim().length > 0;
  const hasMedia = /<img|<table/i.test(html);
  return { html, hasContent: hasText || hasMedia };
}

/* تجميع بيانات النمط الحالي من الفورم مع تحقق بسيط، ترجع {ok:true, ...بيانات} أو {ok:false, error} */
function collectMcqFromForm(fd){
  const collected = [];
  [0,1,2,3,4].forEach(i=>{
    const v = (fd.get('opt'+i)||'').trim();
    if(v) collected.push({ originalIndex:i, value:v });
  });
  if(collected.length < 2) return { ok:false, error:'أدخل خيارين على الأقل.' };
  const checked = Number(fd.get('correctIndex'));
  const newIndex = collected.findIndex(o=>o.originalIndex===checked);
  if(newIndex === -1) return { ok:false, error:'حدد الإجابة الصحيحة من بين الخيارات المكتوبة فعليًا.' };
  return { ok:true, options: collected.map(o=>o.value), correctIndex: newIndex };
}
function collectMatchingFromForm(){
  const pairs = collectMatchPairsFromForm();
  if(pairs.length < 2) return { ok:false, error:'أضف زوجين على الأقل لسؤال التوصيل.' };
  return { ok:true, pairs };
}
function collectWrittenFromForm(fd){
  return { ok:true, modelAnswer: (fd.get('modelAnswer')||'').trim() };
}

function modalAddQuestion(defaults){
  if(state.courses.length === 0){
    openModal(`<h3>تنبيه</h3><p>أضف كورسًا أولًا قبل إضافة الأسئلة.</p><div class="modal-actions"><button class="btn small" id="cancelModal">إغلاق</button></div>`);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    return;
  }
  openModal(`
    <h3>${ICONS.plus} إضافة سؤال جديد</h3>
    <form id="questionForm">
      ${questionFormFields(defaults || {}, '')}
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ السؤال</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  bindQuestionFormDynamics(document.getElementById('questionForm'));
  document.getElementById('questionForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('questionMsg');
    const type = fd.get('type') || 'mcq';
    const questionContent = readRichEditor('qQuestionEditor');
    if(!questionContent.hasContent){ msgBox.innerHTML = `<div class="form-msg error">يرجى كتابة نص السؤال.</div>`; return; }
    const base = {
      id:'q'+Date.now(), courseId:fd.get('courseId'), lectureId: fd.get('lectureId') || null, nature:fd.get('nature'), question:questionContent.html,
      type, explanation: readRichEditor('qExplanationEditor').html,
    };
    if(type === 'matching'){
      const r = collectMatchingFromForm();
      if(!r.ok){ msgBox.innerHTML = `<div class="form-msg error">${r.error}</div>`; return; }
      base.pairs = r.pairs;
    } else if(type === 'written'){
      const r = collectWrittenFromForm(fd);
      base.modelAnswer = r.modelAnswer;
    } else {
      const r = collectMcqFromForm(fd);
      if(!r.ok){ msgBox.innerHTML = `<div class="form-msg error">${r.error}</div>`; return; }
      base.options = r.options; base.correctIndex = r.correctIndex;
    }
    state.questions.push(base);
    await setData('questions', state.questions, true);
    closeModal(); render();
  });
}

function modalEditQuestion(questionId){
  const q = state.questions.find(x=>x.id===questionId);
  if(!q) return;
  openModal(`
    <h3>${ICONS.edit} تعديل السؤال</h3>
    <form id="questionEditForm">
      ${questionFormFields(q, 'Edit')}
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ التعديلات</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  bindQuestionFormDynamics(document.getElementById('questionEditForm'));
  document.getElementById('questionEditForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('questionMsg');
    const type = fd.get('type') || 'mcq';
    const questionContent = readRichEditor('qQuestionEditorEdit');
    if(!questionContent.hasContent){ msgBox.innerHTML = `<div class="form-msg error">يرجى كتابة نص السؤال.</div>`; return; }
    let payload;
    if(type === 'matching'){
      const r = collectMatchingFromForm();
      if(!r.ok){ msgBox.innerHTML = `<div class="form-msg error">${r.error}</div>`; return; }
      payload = { pairs: r.pairs };
    } else if(type === 'written'){
      const r = collectWrittenFromForm(fd);
      payload = { modelAnswer: r.modelAnswer };
    } else {
      const r = collectMcqFromForm(fd);
      if(!r.ok){ msgBox.innerHTML = `<div class="form-msg error">${r.error}</div>`; return; }
      payload = { options: r.options, correctIndex: r.correctIndex };
    }
    q.courseId = fd.get('courseId'); q.lectureId = fd.get('lectureId') || null; q.nature = fd.get('nature');
    q.question = questionContent.html;
    q.explanation = readRichEditor('qExplanationEditorEdit').html;
    q.type = type;
    delete q.options; delete q.correctIndex; delete q.pairs; delete q.modelAnswer;
    Object.assign(q, payload);
    await setData('questions', state.questions, true);
    closeModal(); render();
  });
}

/* =========================================================
   استيراد أسئلة من ملف PDF أو Word
   يقرأ الأدمن ملفًا (أو يلصق نصًا)، ويحاول النظام تلقائيًا تقسيمه إلى
   أسئلة: نص السؤال، الخيارات، الإجابة الصحيحة، والتفسير — كل عنصر
   في مكانه — ثم يعرضها للمراجعة والتعديل قبل حفظها في بنك الأسئلة.
   ========================================================= */
function extOf(filename){
  const m = /\.([a-zA-Z0-9]+)$/.exec(filename || '');
  return m ? m[1].toLowerCase() : '';
}

function loadScriptOnce(src, isLoaded){
  return new Promise((resolve, reject)=>{
    if(isLoaded()) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if(existing){
      existing.addEventListener('load', ()=>resolve());
      existing.addEventListener('error', ()=>reject(new Error('تعذّر تحميل المكتبة اللازمة لقراءة الملف.')));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = ()=>resolve();
    s.onerror = ()=>reject(new Error('تعذّر تحميل المكتبة اللازمة لقراءة الملف، تحقق من اتصال الإنترنت.'));
    document.head.appendChild(s);
  });
}

async function ensureMammothLib(){
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/mammoth@1.7.2/mammoth.browser.min.js', ()=>!!window.mammoth);
}
async function ensurePdfJsLib(){
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', ()=>!!window.pdfjsLib);
  if(window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc){
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }
}

async function extractTextFromDocxFile(arrayBuffer){
  await ensureMammothLib();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

async function extractTextFromPdfFile(arrayBuffer){
  await ensurePdfJsLib();
  const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for(let i=1;i<=doc.numPages;i++){
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // إعادة بناء الأسطر تقريبيًا بتجميع العناصر المتقاربة في الموضع الرأسي
    const lines = [];
    let currentY = null, currentLine = [];
    content.items.forEach(item=>{
      const y = Math.round(item.transform[5]);
      if(currentY === null || Math.abs(y - currentY) > 2){
        if(currentLine.length) lines.push(currentLine.join(' '));
        currentLine = [item.str];
        currentY = y;
      } else {
        currentLine.push(item.str);
      }
    });
    if(currentLine.length) lines.push(currentLine.join(' '));
    fullText += lines.join('\n') + '\n\n';
  }
  return fullText;
}

/* خرائط ترميز الخيارات لحرف/رقم -> فهرس (A/أ = 0، B/ب = 1 ...) */
const AR_OPTION_LETTER_MAP = {'أ':0,'ا':0,'ب':1,'ج':2,'د':3,'ه':4,'و':5};
const EN_OPTION_LETTER_MAP = {A:0,B:1,C:2,D:3,E:4,F:5};
function letterToOptionIndex(raw){
  if(!raw) return null;
  const ch = raw.trim().charAt(0);
  const upper = ch.toUpperCase();
  if(EN_OPTION_LETTER_MAP.hasOwnProperty(upper)) return EN_OPTION_LETTER_MAP[upper];
  if(AR_OPTION_LETTER_MAP.hasOwnProperty(ch)) return AR_OPTION_LETTER_MAP[ch];
  if(/[1-6]/.test(ch)) return Number(ch) - 1;
  return null;
}

const IMPORT_QUESTION_START_RE = /^\(?\s*(?:[Qq](?:uestion)?\.?\s*|السؤال\s*)?(\d{1,3})\s*[\.\)\-:]\s*(.+)$/;
const IMPORT_OPTION_RE = /^\(?\s*([A-Da-dأبجده])\s*[\)\.\-:]\s+(.+)$/;
const IMPORT_OPTION_NUM_RE = /^\(?\s*([1-6])\s*\)\s+(.+)$/;
const IMPORT_ANSWER_RE = /^(?:Answer|Correct\s*Answer|الإجابة(?:\s*الصحيحة)?|الجواب(?:\s*الصحيح)?)\s*[:\-]?\s*(.+)$/i;
const IMPORT_EXPLAIN_RE = /^(?:Explanation|تفسير|توضيح|شرح)\s*[:\-]?\s*(.*)$/i;

/* يقسّم نصًا خامًا (مستخرجًا من PDF/Word أو ملصوقًا يدويًا) إلى مصفوفة أسئلة
   منظمة: {question, options[4], correctIndex, correctFound, explanation}.
   هذا استخراج تقريبي "أفضل جهد ممكن" — يُعرض بعده على الأدمن للمراجعة والتعديل. */
function parseQuestionsFromText(rawText){
  const allLines = (rawText || '').replace(/\r/g,'').split('\n').map(l=>l.trim());
  const hasNumbering = allLines.some(l=> l && IMPORT_QUESTION_START_RE.test(l) && l.length < 300);

  const blocks = [];
  if(hasNumbering){
    let current = [];
    allLines.forEach(line=>{
      if(!line) return;
      const m = IMPORT_QUESTION_START_RE.exec(line);
      const currentHasOptions = current.some(l=> IMPORT_OPTION_RE.test(l) || IMPORT_OPTION_NUM_RE.test(l));
      if(m && (current.length === 0 || currentHasOptions)){
        if(current.length) blocks.push(current);
        current = [m[2]];
      } else {
        current.push(line);
      }
    });
    if(current.length) blocks.push(current);
  } else {
    // لا يوجد ترقيم واضح للأسئلة، نفصل حسب الأسطر الفارغة (فقرات)
    let buff = [];
    allLines.forEach(line=>{
      if(!line){
        if(buff.length){ blocks.push(buff); buff = []; }
      } else buff.push(line);
    });
    if(buff.length) blocks.push(buff);
  }

  const results = [];
  blocks.forEach(blockLines=>{
    const questionParts = [];
    const options = [];
    let correctIndex = null;
    const explanationParts = [];
    let inExplanation = false;
    blockLines.forEach(line=>{
      if(!line) return;
      if(inExplanation){ explanationParts.push(line); return; }
      let m;
      if((m = IMPORT_OPTION_RE.exec(line))){ options.push(m[2].trim()); return; }
      if(options.length < 6 && (m = IMPORT_OPTION_NUM_RE.exec(line))){ options.push(m[2].trim()); return; }
      if((m = IMPORT_ANSWER_RE.exec(line))){
        const idx = letterToOptionIndex(m[1]);
        if(idx !== null) correctIndex = idx;
        return;
      }
      if((m = IMPORT_EXPLAIN_RE.exec(line))){
        inExplanation = true;
        if(m[1]) explanationParts.push(m[1].trim());
        return;
      }
      if(options.length === 0) questionParts.push(line);
    });
    const questionText = questionParts.join(' ').trim();
    if(!questionText || options.length < 2) return; // تجاهل أي كتلة غير صالحة كسؤال
    while(options.length < 4) options.push('');
    results.push({
      question: questionText,
      options: options.slice(0,4),
      correctIndex: (correctIndex !== null && correctIndex < 4) ? correctIndex : 0,
      correctFound: correctIndex !== null,
      explanation: explanationParts.join(' ').trim(),
    });
  });
  return results;
}

let importSession = { courseId:null, lectureId:null, nature:'past', parsed:[] };

function modalImportQuestions(){
  if(state.courses.length === 0){
    openModal(`<h3>تنبيه</h3><p>أضف كورسًا أولًا قبل استيراد الأسئلة.</p><div class="modal-actions"><button class="btn small" id="cancelModal">إغلاق</button></div>`);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    return;
  }
  renderImportStep1();
}

function renderImportStep1(statusHtml){
  const courseOptions = state.courses.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');
  openModal(`
    <h3>📄 استيراد أسئلة من ملف PDF أو Word</h3>
    <p style="color:var(--muted); font-size:13.5px; margin-bottom:16px;">اختر الكورس، ثم ارفع ملف PDF أو Word (.docx) يحتوي على الأسئلة، وسيقوم النظام تلقائيًا بترتيب كل عنصر في مكانه: نص السؤال، الخيارات، الإجابة الصحيحة، والتفسير. تقدر تراجع وتعدّل كل سؤال قبل الحفظ النهائي.</p>
    <form id="importSetupForm">
      <div class="field"><label>الكورس</label><select name="courseId" id="importCourseSelect">${courseOptions}</select></div>
      <div class="field"><label>المحاضرة (اختياري)</label><select name="lectureId" id="importLectureSelect">${lectureOptionsFor(state.courses[0]?.id, null)}</select></div>
      <div class="field"><label>طبيعة الأسئلة (تُطبّق على كل الأسئلة المستوردة)</label><select name="nature"><option value="past">أسئلة سنوات سابقة</option><option value="ref">أسئلة مراجع</option></select></div>
      <div class="field"><label>ملف الأسئلة (PDF أو Word .docx)</label><input type="file" name="file" id="importFileInput" accept=".pdf,.docx"></div>
      <p style="color:var(--muted); font-size:12.5px; margin:-8px 0 14px;">ملاحظة: يجب أن يكون كل خيار في سطر مستقل (مثال: A) ... أو أ) ...)، والإجابة بصيغة "Answer:" أو "الإجابة:"، والتفسير بصيغة "Explanation:" أو "تفسير:". صيغة .doc القديمة غير مدعومة، فقط .docx.</p>
      <div class="field"><label>أو الصق نص الأسئلة يدويًا بدل رفع ملف (اختياري)</label><textarea name="pasteText" rows="5" placeholder="الصق نص الأسئلة هنا إن لم ترفع ملفًا"></textarea></div>
      ${statusHtml || ''}
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">تحليل واستخراج الأسئلة</button></div>
    </form>`, true);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  const courseSelect = document.getElementById('importCourseSelect');
  const lectureSelect = document.getElementById('importLectureSelect');
  courseSelect.addEventListener('change', ()=>{ lectureSelect.innerHTML = lectureOptionsFor(courseSelect.value, null); });
  document.getElementById('importSetupForm').addEventListener('submit', handleImportAnalyze);
}

async function handleImportAnalyze(e){
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const courseId = fd.get('courseId');
  const lectureId = fd.get('lectureId') || null;
  const nature = fd.get('nature');
  const pasteText = (fd.get('pasteText') || '').trim();
  const fileInput = document.getElementById('importFileInput');
  const file = fileInput.files[0];
  const submitBtn = form.querySelector('button[type=submit]');

  if(!pasteText && !file){
    renderImportStep1(`<div class="form-msg error">يرجى رفع ملف أو لصق نص الأسئلة.</div>`);
    return;
  }
  submitBtn.disabled = true; submitBtn.textContent = 'جاري التحليل...';
  try{
    let text = pasteText;
    if(!text && file){
      const ext = extOf(file.name);
      const buffer = await file.arrayBuffer();
      if(ext === 'docx'){
        text = await extractTextFromDocxFile(buffer);
      } else if(ext === 'pdf'){
        text = await extractTextFromPdfFile(buffer);
      } else if(ext === 'doc'){
        throw new Error('صيغة .doc القديمة غير مدعومة، يرجى حفظ الملف بصيغة .docx ثم إعادة المحاولة.');
      } else {
        throw new Error('صيغة الملف غير مدعومة، يرجى رفع ملف PDF أو Word (.docx).');
      }
    }
    const parsed = parseQuestionsFromText(text);
    if(!parsed.length){
      renderImportStep1(`<div class="form-msg error">لم يتم العثور على أسئلة قابلة للاستخراج في هذا الملف. تأكد أن كل سؤال له خياران على الأقل في أسطر مستقلة، أو جرّب لصق النص يدويًا.</div>`);
      return;
    }
    importSession = { courseId, lectureId, nature, parsed };
    renderImportReview();
  } catch(err){
    renderImportStep1(`<div class="form-msg error">${escapeHtml(err.message || 'حدث خطأ أثناء تحليل الملف.')}</div>`);
  }
}

function renderImportReview(){
  const course = state.courses.find(c=>c.id===importSession.courseId);
  const lecture = importSession.lectureId ? state.lectures.find(l=>l.id===importSession.lectureId) : null;
  const cards = importSession.parsed.map((q,i)=>`
    <div class="import-q-card" data-idx="${i}" style="border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;"><input type="checkbox" class="imp-include" checked> إدراج هذا السؤال</label>
        <span style="font-size:12px; color:${q.correctFound ? 'var(--good)' : 'var(--danger)'};">${q.correctFound ? '✓ تم التعرف على الإجابة تلقائيًا' : '⚠️ لم يتم إيجاد الإجابة، اخترها يدويًا'}</span>
      </div>
      <div class="field"><label>نص السؤال</label><textarea class="imp-question" dir="ltr" style="text-align:left;">${escapeHtml(q.question)}</textarea></div>
      ${[0,1,2,3].map(oi=>`<div class="field"><label>الخيار ${String.fromCharCode(65+oi)}</label><input type="text" class="imp-opt" data-oi="${oi}" dir="ltr" style="text-align:left;" value="${escapeHtml(q.options[oi]||'')}"></div>`).join('')}
      <div class="field"><label>الإجابة الصحيحة</label><select class="imp-correct">${[0,1,2,3].map(oi=>`<option value="${oi}" ${q.correctIndex===oi?'selected':''}>${String.fromCharCode(65+oi)}</option>`).join('')}</select></div>
      <div class="field"><label>التفسير (اختياري)</label><textarea class="imp-explain" dir="ltr" style="text-align:left;">${escapeHtml(q.explanation||'')}</textarea></div>
    </div>
  `).join('');

  openModal(`
    <h3>📄 مراجعة الأسئلة المستخرجة (${importSession.parsed.length})</h3>
    <p style="color:var(--muted); font-size:13.5px; margin-bottom:14px;">سيتم إضافتها إلى: <b>${escapeHtml(course?.title || '')}</b>${lecture ? ` — ${escapeHtml(lecture.title)}` : ''} — ${natureLabel(importSession.nature)}. راجع كل سؤال وعدّل ما يلزم، ثم اضغط "حفظ الأسئلة المحددة".</p>
    <div id="importReviewList">${cards}</div>
    <div class="modal-actions"><button type="button" class="btn small" id="importBackBtn">⟲ رجوع</button><button type="button" class="btn teal solid small" id="importSaveBtn">💾 حفظ الأسئلة المحددة</button></div>
  `, true);
  document.getElementById('importBackBtn').addEventListener('click', ()=> renderImportStep1());
  document.getElementById('importSaveBtn').addEventListener('click', handleImportSave);
}

async function handleImportSave(){
  const cards = document.querySelectorAll('#importReviewList .import-q-card');
  const toAdd = [];
  cards.forEach(card=>{
    const include = card.querySelector('.imp-include').checked;
    if(!include) return;
    const questionText = card.querySelector('.imp-question').value.trim();
    const opts = Array.from(card.querySelectorAll('.imp-opt')).map(inp=>inp.value.trim());
    const correctIndex = Number(card.querySelector('.imp-correct').value);
    const explanation = card.querySelector('.imp-explain').value.trim();
    if(!questionText || opts.filter(o=>o).length < 2) return;
    toAdd.push({
      id:'q'+Date.now()+Math.random().toString(36).slice(2,7),
      courseId: importSession.courseId,
      lectureId: importSession.lectureId,
      nature: importSession.nature,
      question: questionText,
      options: opts,
      correctIndex,
      explanation,
    });
  });
  if(!toAdd.length){
    alert('لم يتم تحديد أي سؤال صالح للحفظ.');
    return;
  }
  state.questions.push(...toAdd);
  await setData('questions', state.questions, true);
  closeModal();
  render();
}

/* =========================================================
   تلخيص محاضرة بالذكاء الاصطناعي (High-Yield):
   - نجمع أسئلة الامتحانات السابقة (nature:'past') من بنك الأسئلة الخاصة
     بالمادة/المحاضرة المختارة لنبني منها سياق "الأولويات" للطلب.
   - نحوّل ملف المحاضرة إلى base64 ونرسله مع النص لدالة Supabase Edge
     Function (AI_SUMMARY_ENDPOINT) والتي تستدعي Gemini API بأمان
     (المفتاح السري محفوظ على الخادم وليس هنا). راجع ملف
     generate-summary/index.ts المرفق لطريقة النشر.
   ========================================================= */
const AI_SUMMARY_ENDPOINT = SUPABASE_URL.startsWith('http') ? (SUPABASE_URL + '/functions/v1/generate-summary') : '';

function fileToBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=> reject(new Error('تعذّرت قراءة الملف'));
    reader.onload = ()=>{
      const result = reader.result || '';
      const idx = result.indexOf(',');
      resolve(idx === -1 ? result : result.slice(idx+1));
    };
    reader.readAsDataURL(file);
  });
}

/* يجمع أسئلة الامتحانات السابقة (past) الخاصة بمادة/محاضرة معيّنة من بنك الأسئلة */
function pastExamQuestionsFor(courseId, lectureId){
  return state.questions.filter(q=>{
    if(q.courseId !== courseId) return false;
    if(q.nature !== 'past') return false;
    if(lectureId) return q.lectureId === lectureId;
    return true;
  });
}

function buildHighYieldPrompt({ courseTitle, lectureTitle, university, major, pastQuestions }){
  const qContext = pastQuestions.length
    ? 'فيما يلي أسئلة من امتحانات سابقة (بنك الأسئلة) متعلقة بهذه المادة، استخدمها لتحديد النقاط الأكثر تكرارًا وابنِ الملخص عليها فعليًا:\n'
      + pastQuestions.slice(0, 60).map((q,i)=> `${i+1}. ${q.question} — الإجابة الصحيحة: ${q.options?.[q.correctIndex] ?? ''}`).join('\n')
    : 'لا توجد أسئلة امتحانات سابقة مسجّلة لهذه المادة/المحاضرة في بنك الأسئلة حاليًا، فلخّص محتوى الملف مع إبراز أهم النقاط أكاديميًا وسريريًا.';

  return `أنت مساعد أكاديمي متخصص بإعداد ملخصات "High-Yield" لطلاب ${major || 'التمريض/طب الأسنان'}${university ? ' في ' + university : ''}.
المادة: ${courseTitle}.${lectureTitle ? ' المحاضرة: ' + lectureTitle + '.' : ''}

حلّل ملف المحاضرة المرفق (شرائح/PDF/صورة) واستخرج أهم المعلومات فيه، ثم أنتج ملخصًا مركّزًا بصيغة High-Yield.

${qContext}

قواعد صارمة للمخرجات:
- اكتب الملخص بالكامل باللغة الإنجليزية (English) فقط، بصرف النظر عن لغة الملف المرفق أو لغة أسئلة الامتحانات السابقة أعلاه — ترجم أي مصطلح أو نقطة من العربية إلى الإنجليزية قبل إدراجها في الملخص. لا تستخدم أي كلمة عربية في المخرجات.
- أخرج HTML فقط بدون أي markdown وبدون علامات \`\`\`، مستخدمًا فقط الوسوم التالية: <h3> لعنوان القسم الرئيسي، <h4> لعنوان فرعي، <p> للفقرات، <b> أو <strong> للتوكيد، <ul>/<ol>/<li> للنقاط، <table>/<tr>/<td>/<th> للجداول عند الحاجة.
- ابدأ الملخص بقسم بعنوان "🔥 High Yield" يجمع النقاط التي تتكرر في أسئلة الامتحانات السابقة أعلاه.
- بعده أضف بقية محتوى المحاضرة مبوّبًا ومختصرًا بالإنجليزية، وليس نسخًا حرفيًا من الملف.
- إذا كان الملف المرفق يحتوي على جداول (تصنيفات، مقارنات، جرعات، قيم...)، أعد إنتاجها كجداول HTML كاملة (<table>/<tr>/<td>/<th>) بنفس مكانها ضمن الملخص، ولا تحوّلها إلى نقاط نصية عادية.
- إذا كان الملف يحتوي على صور أو رسوم توضيحية أو مخططات أو أشكال تشريحية مهمة لفهم المحتوى، أضف لها إشارة ضمن قسم فرعي بعنوان "📊 Figures & Diagrams" يوضح ماذا تمثل هذه الصورة/الرسم ولماذا هي مهمة (بما أنه لا يمكن تضمين الصورة نفسها داخل الملخص، فقط وصفها ونقاطها الأساسية).
- لا تخترع معلومات غير موجودة في الملف المرفق أو في أسئلة الامتحانات السابقة.`;
}

async function generateAiSummary({ fileBase64, mimeType, prompt }){
  if(!AI_SUMMARY_ENDPOINT) throw new Error('لم يتم إعداد الاتصال بخدمة الذكاء الاصطناعي بعد.');
  const res = await fetch(AI_SUMMARY_ENDPOINT, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+SUPABASE_ANON_KEY, 'apikey':SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ fileBase64, mimeType, prompt })
  });
  if(!res.ok){
    let detail = '';
    try{
      const errJson = await res.json();
      const nested = errJson.details?.error?.message
        || errJson.details?.message
        || (typeof errJson.details === 'string' ? errJson.details : '')
        || (errJson.details ? JSON.stringify(errJson.details) : '');
      detail = [errJson.error, nested].filter(Boolean).join(' — ');
    }catch(e){}
    throw new Error(detail || ('فشل الطلب (رمز ' + res.status + ')'));
  }
  const data = await res.json();
  if(!data.html) throw new Error('لم يتم استلام محتوى من الخدمة.');
  return data.html;
}

/* =========================================================
   تحميل الملخص كملف PDF (دائمًا بالإنجليزية: اتجاه LTR وخط لاتيني،
   بصرف النظر عن لغة واجهة الموقع الحالية)
   ========================================================= */
async function downloadSummaryAsPdf(title, htmlContent, meta){
  if(typeof html2pdf === 'undefined'){
    alert('PDF export is not available right now. Please check your internet connection and try again.');
    return;
  }
  meta = meta || {};
  // العنوان المخزّن بيجي غالبًا بصيغة "اسم المحاضرة — Highyield Summary"،
  // فبنشيل هاي الزيادة من العنوان الرئيسي ونعرض "High Yield" كعنصر تصميم مستقل
  const cleanTitle = (title || 'Lecture Summary').replace(/\s*[—-]\s*High\s*[- ]?\s*yield\s*summary\s*$/i, '').trim();
  const courseTitle = meta.courseTitle || cleanTitle || 'Lecture Summary';
  const lectureTitle = meta.lectureTitle && meta.lectureTitle !== courseTitle ? meta.lectureTitle : '';

  // ملاحظة مهمة: html2canvas معروف أنه ما بيتعامل صح مع عناصر position:fixed
  // (ولا مع absolute مع ألاعيب opacity/z-index لإخفاء العنصر) — بيطلع التقاط
  // فاضي أو ناقص بدون أي خطأ ظاهر. الحل الموثوق: نضيف العنصر بشكل طبيعي 100%
  // ضمن تدفق المستند (بدون أي position خاص به إطلاقًا)، ونغطّي الشاشة بعنصر
  // تحميل منفصل تمامًا (overlay مستقل) فوقه لأجل شكل المستخدم بس، ثم نلتقط
  // العنصر الأصلي بعد اكتمال رسمه، ونشيل الاثنين بعدين.
  const wrap = document.createElement('div');
  wrap.setAttribute('dir','ltr');
  // box-sizing:border-box حتى الـ padding يدخل ضمن الـ 760px نفسها ولا يخلي
  // أي جزء من الهيدر (خصوصًا الطرف اليمين) يطلع خارج عرض الصفحة فيختفي من اللقطة
  wrap.style.cssText = 'box-sizing:border-box; width:760px; max-width:760px; background:#ffffff; padding:32px; font-family:Arial, Helvetica, sans-serif; color:#16232f; direction:ltr; text-align:left; position:relative; overflow:hidden;';

  const content = document.createElement('div');
  content.style.cssText = 'position:relative; z-index:1;';
  content.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:nowrap; gap:18px; border-bottom:2px solid #177a8c; padding-bottom:20px; margin-bottom:26px;">
      <div style="display:flex; align-items:center; gap:16px; min-width:0; flex-shrink:0;">
        <div style="width:78px; height:78px; flex-shrink:0; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle, rgba(23,122,140,0.22) 0%, rgba(23,122,140,0.10) 55%, rgba(23,122,140,0) 78%);">
          <img src="${MEDORA_LOGO_SM}" alt="MEDORA" style="width:58px; height:58px; object-fit:contain; border-radius:50%;">
        </div>
        <div style="font-family:'Playfair Display', Georgia, serif; font-weight:800; font-size:32px; letter-spacing:1.5px; color:#0f2745; white-space:nowrap;">MEDORA</div>
      </div>
      <div style="text-align:right; min-width:0; flex-shrink:1;">
        <div style="font-size:12px; font-weight:800; letter-spacing:2px; color:#177a8c; text-transform:uppercase; white-space:nowrap;">🔥 High Yield</div>
        <div style="font-size:18px; font-weight:800; color:#0f2745; margin-top:7px; line-height:1.4; word-break:break-word;">${escapeHtml(courseTitle)}</div>
        ${lectureTitle ? `<div style="font-size:12.5px; color:#5c7185; margin-top:5px; line-height:1.4; word-break:break-word;">${escapeHtml(lectureTitle)}</div>` : ''}
      </div>
    </div>
    <div class="pdf-body-content" style="font-size:13.5px; line-height:1.9;">${htmlContent}</div>
    <div style="margin-top:28px; padding-top:12px; border-top:1px dashed #e1e8ee; font-size:11px; color:#5c7185;">Generated with MEDORA</div>
  `;
  // مسافات أوسع بين الفقرات/العناوين/عناصر القوائم داخل محتوى الملخص نفسه
  const spacingStyle = document.createElement('style');
  spacingStyle.textContent = `
    .pdf-body-content p{ margin:0 0 14px; }
    .pdf-body-content ul, .pdf-body-content ol{ margin:0 0 14px; padding-inline-start:20px; }
    .pdf-body-content li{ margin-bottom:8px; }
    .pdf-body-content h1, .pdf-body-content h2, .pdf-body-content h3, .pdf-body-content h4{ margin:22px 0 12px; }
    .pdf-body-content table{ width:100%; border-collapse:collapse; margin:6px 0 14px; font-size:12.5px; }
    .pdf-body-content table th{ background:#0f2745; color:#ffffff; font-weight:700; }
    .pdf-body-content table td, .pdf-body-content table th{ border:1px solid #d7dee5; padding:6px 9px; text-align:left; }
    .pdf-body-content table tr:nth-child(even) td{ background:#f2f7f8; }
  `;
  wrap.appendChild(spacingStyle);
  // إجبار كل النصوص والجداول داخل الملخص على الاتجاه الإنجليزي عند التصدير
  content.querySelectorAll('*').forEach(el=>{ el.style.direction='ltr'; el.style.textAlign='left'; });
  wrap.appendChild(content);

  // شاشة تحميل منفصلة تمامًا عن العنصر المُلتقط — همّها الوحيد إخفاء "الوميض"
  // عن المستخدم بصريًا، وما إلها أي علاقة بمنطق html2canvas أو مكان العنصر
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; inset:0; z-index:99999; background:#ffffff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; font-family:Arial, Helvetica, sans-serif; color:#16232f;';
  overlay.innerHTML = `
    <img src="${MEDORA_LOGO_SM}" alt="MEDORA" style="width:44px; height:44px; object-fit:contain;">
    <div style="font-size:14px; color:#5c7185;">Preparing your PDF…</div>
  `;

  // نضيف الاثنين: overlay فوق كل شيء (يمنع المستخدم من رؤية أي شيء تحته)،
  // ثم wrap بشكل طبيعي في نهاية المستند (بدون أي إخفاء عبره نفسه)
  document.body.appendChild(overlay);
  document.body.appendChild(wrap);
  try{
    // ننتظر تحميل كل الصور (الشعار وأي صور داخل الملخص) قبل التقاط الصفحة،
    // وإلا يلتقط html2canvas العنصر قبل اكتمال الرسم فيطلع فارغ/ناقص
    const imgs = Array.from(wrap.querySelectorAll('img'));
    await Promise.all(imgs.map(img=> img.complete ? Promise.resolve() : new Promise(res=>{ img.onload = img.onerror = res; })));
    await new Promise(res=> requestAnimationFrame(()=> requestAnimationFrame(res)));

    // العلامة المائية: نص "MEDORA" باهت وكبير، مكرر كل ~420px طول الصفحة كلها
    // حتى يظهر على كل صفحة من صفحات الـ PDF مش بس بمكان واحد بأول الملف
    const totalHeight = wrap.scrollHeight;
    const spacing = 420;
    for(let y = spacing/2; y < totalHeight; y += spacing){
      const wm = document.createElement('div');
      wm.style.cssText = `position:absolute; top:${y}px; left:50%; transform:translate(-50%,-50%) rotate(-28deg); font-family:'Playfair Display', Georgia, serif; font-weight:800; font-size:120px; color:#0f2745; opacity:0.045; white-space:nowrap; pointer-events:none; z-index:0;`;
      wm.textContent = 'MEDORA';
      wrap.appendChild(wm);
    }
    await new Promise(res=> requestAnimationFrame(res));

    await html2pdf().set({
      margin: 10,
      filename: (title || 'lecture-summary').replace(/[^\w\-]+/g,'-').slice(0,60) + '.pdf',
      // ملاحظة: الصفحة كلها dir="rtl"، وهذا يخلي بعض المتصفحات تحسب
      // window.scrollX بشكل مختلف (بيبدأ من اليمين مش من الصفر)، فبيلتقط
      // html2canvas الصورة بإزاحة خاطئة وبيقص شوي من الطرف الأيسر. تثبيت
      // x/y/scrollX/scrollY على صفر صراحة، مع windowWidth مطابق لعرض العنصر
      // نفسه، بيمنع هالإزاحة ويضمن التقاط العنصر كامل من الطرفين.
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', x: 0, y: 0, scrollX: 0, scrollY: 0, windowWidth: wrap.scrollWidth, windowHeight: wrap.scrollHeight },
      jsPDF: { unit:'mm', format:'a4', orientation:'portrait' }
    }).from(wrap).save();
  }catch(err){
    console.error('PDF export failed', err);
    alert('Could not generate the PDF. Please try again.');
  }finally{
    wrap.remove();
    overlay.remove();
  }
}

function wireAiSummaryPage(){
  const form = document.getElementById('aiSummaryForm');
  if(!form) return; // ما في مواد مفعّلة، ما في نموذج لنربطه

  const courseSelect = document.getElementById('aiCourseSelect');
  const lectureSelect = document.getElementById('aiLectureSelect');
  const bankHint = document.getElementById('aiBankHint');
  const uploadBox = document.getElementById('aiUploadBox');
  const fileInput = document.getElementById('aiFileInput');
  const filenameEl = document.getElementById('aiUploadFilename');
  const msgBox = document.getElementById('aiSummaryMsg');
  const loadingBox = document.getElementById('aiLoadingBox');
  const resultBox = document.getElementById('aiResultBox');
  let selectedFile = null;

  function refreshLectures(){
    const courseId = courseSelect.value;
    const lectures = state.lectures.filter(l=>l.courseId===courseId);
    lectureSelect.innerHTML = `<option value="">بدون تحديد (عام)</option>` + lectures.map(l=>`<option value="${l.id}">${escapeHtml(l.title)}</option>`).join('');
    refreshBankHint();
  }
  function refreshBankHint(){
    const courseId = courseSelect.value;
    if(!courseId){ bankHint.style.display = 'none'; return; }
    const count = pastExamQuestionsFor(courseId, lectureSelect.value || null).length;
    bankHint.style.display = 'flex';
    bankHint.innerHTML = count
      ? `📊 تم العثور على <b>${count}</b> سؤال من امتحانات سابقة لهذا الاختيار في بنك الأسئلة — سنبني الملخص على أساسها.`
      : `ℹ️ لا توجد أسئلة امتحانات سابقة مسجّلة لهذا الاختيار بعد، سيتم عمل ملخص عام لمحتوى الملف.`;
  }

  courseSelect.addEventListener('change', refreshLectures);
  lectureSelect.addEventListener('change', refreshBankHint);
  if(courseSelect.value) refreshLectures();

  uploadBox.addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', ()=>{
    selectedFile = fileInput.files[0] || null;
    filenameEl.textContent = selectedFile ? ('📄 ' + selectedFile.name) : '';
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    msgBox.innerHTML = '';
    const courseId = courseSelect.value;
    const course = state.courses.find(c=>c.id===courseId);
    if(!course){ msgBox.innerHTML = `<div class="form-msg error">يرجى اختيار المادة.</div>`; return; }
    if(!selectedFile){ msgBox.innerHTML = `<div class="form-msg error">يرجى رفع ملف المحاضرة أولًا.</div>`; return; }
    if(selectedFile.size > 20*1024*1024){ msgBox.innerHTML = `<div class="form-msg error">حجم الملف كبير جدًا (الحد الأقصى تقريبًا 20MB).</div>`; return; }

    const lectureId = lectureSelect.value || null;
    const lecture = lectureId ? state.lectures.find(l=>l.id===lectureId) : null;
    const mimeType = selectedFile.type || (selectedFile.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
    if(mimeType !== 'application/pdf' && !mimeType.startsWith('image/')){
      msgBox.innerHTML = `<div class="form-msg error">الرجاء رفع ملف PDF أو صورة (JPG/PNG) فقط.</div>`; return;
    }

    form.style.display = 'none';
    loadingBox.style.display = 'flex';

    try{
      const fileBase64 = await fileToBase64(selectedFile);
      const pastQuestions = pastExamQuestionsFor(courseId, lectureId);
      const prompt = buildHighYieldPrompt({
        courseTitle: course.title, lectureTitle: lecture?.title,
        university: state.session.university, major: state.session.major,
        pastQuestions
      });
      const html = await generateAiSummary({ fileBase64, mimeType, prompt });
      const clean = sanitizeSummaryHtml(html);

      document.getElementById('aiResultTitle').value = (lecture?.title || course.title) + ' — Highyield Summary';
      document.getElementById('aiResultEditor').innerHTML = clean;
      wireRteToolbar(document.getElementById('aiSaveForm'));
      loadingBox.style.display = 'none';
      resultBox.style.display = 'block';

      const downloadPdfBtn = document.getElementById('aiDownloadPdfBtn');
      if(downloadPdfBtn){
        downloadPdfBtn.addEventListener('click', ()=>{
          const t = document.getElementById('aiResultTitle').value.trim();
          const c = document.getElementById('aiResultEditor').innerHTML;
          downloadSummaryAsPdf(t, c, { courseTitle: course.title, lectureTitle: lecture?.title });
        });
      }

      document.getElementById('aiSaveForm').addEventListener('submit', async (ev)=>{
        ev.preventDefault();
        const saveMsg = document.getElementById('aiSaveMsg');
        const title = document.getElementById('aiResultTitle').value.trim();
        const editorEl = document.getElementById('aiResultEditor');
        const content = sanitizeSummaryHtml(editorEl.innerHTML);
        if(!title || !editorEl.textContent.trim()){
          saveMsg.innerHTML = `<div class="form-msg error">يرجى تعبئة العنوان والمحتوى.</div>`; return;
        }
        state.summaries.push({ id:'sm'+Date.now(), phone: state.session.phone, title, content, createdAt: Date.now(), aiGenerated:true, courseId, lectureId });
        await setData('summaries', state.summaries, true);
        navigate('my-summaries');
      }, { once:true });
    }catch(err){
      console.error('AI summary failed', err);
      form.style.display = 'block';
      loadingBox.style.display = 'none';
      msgBox.innerHTML = `<div class="form-msg error">تعذّر توليد الملخص: ${escapeHtml(err.message || 'خطأ غير متوقع')}. حاول مجددًا.</div>`;
    }
  });
}

/* =========================================================
   ملخصات الطالب: إضافة/تعديل بطاقة ملخص خاصة به وحفظها في حسابه
   ========================================================= */
function modalAddSummary(){
  openModal(`
    <h3>${ICONS.note} إضافة ملخص جديد</h3>
    <form id="summaryForm">
      <div class="field"><label>عنوان الملخص</label><input type="text" name="title" required maxlength="80" placeholder="مثال: ملخص الدرس الأول"></div>
      <div class="field"><label>محتوى الملخص</label>${rteToolbarHtml('summaryEditor')}<div class="rte-editor" id="summaryEditor" contenteditable="true" data-placeholder="اكتب ملخصك هنا... يمكنك إضافة صور وجداول من شريط الأدوات"></div></div>
      <div id="summaryMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ الملخص</button></div>
    </form>`);
  wireRteToolbar(document.getElementById('summaryForm'));
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('summaryForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title').trim();
    const editorEl = document.getElementById('summaryEditor');
    const content = sanitizeSummaryHtml(editorEl.innerHTML);
    const hasText = editorEl.textContent.trim().length > 0;
    const hasMedia = /<img|<table/i.test(content);
    if(!title || !(hasText || hasMedia)){
      document.getElementById('summaryMsg').innerHTML = `<div class="form-msg error">يرجى تعبئة العنوان والمحتوى.</div>`; return;
    }
    state.summaries.push({ id:'sm'+Date.now(), phone: state.session.phone, title, content, createdAt: Date.now() });
    await setData('summaries', state.summaries, true);
    closeModal(); render();
  });
}

function modalEditSummary(summaryId){
  const s = state.summaries.find(x=>x.id===summaryId);
  if(!s) return;
  openModal(`
    <h3>${ICONS.edit} تعديل الملخص</h3>
    <form id="summaryEditForm">
      <div class="field"><label>عنوان الملخص</label><input type="text" name="title" required maxlength="80" value="${escapeHtml(s.title)}"></div>
      <div class="field"><label>محتوى الملخص</label>${rteToolbarHtml('summaryEditorEdit')}<div class="rte-editor" id="summaryEditorEdit" contenteditable="true">${s.content}</div></div>
      <div id="summaryMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ التعديلات</button></div>
    </form>`);
  wireRteToolbar(document.getElementById('summaryEditForm'));
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('summaryEditForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title').trim();
    const editorEl = document.getElementById('summaryEditorEdit');
    const content = sanitizeSummaryHtml(editorEl.innerHTML);
    const hasText = editorEl.textContent.trim().length > 0;
    const hasMedia = /<img|<table/i.test(content);
    if(!title || !(hasText || hasMedia)){
      document.getElementById('summaryMsg').innerHTML = `<div class="form-msg error">يرجى تعبئة العنوان والمحتوى.</div>`; return;
    }
    s.title = title; s.content = content;
    await setData('summaries', state.summaries, true);
    closeModal(); render();
  });
}

function confirmDelete(message, onConfirm){
  openModal(`
    <h3>تأكيد الحذف</h3>
    <p style="color:var(--muted); font-size:14.5px;">${escapeHtml(message)}</p>
    <div class="modal-actions"><button class="btn small" id="cancelModal">إلغاء</button><button class="btn danger small" id="confirmDelBtn">نعم، احذف</button></div>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('confirmDelBtn').addEventListener('click', async ()=>{ await onConfirm(); closeModal(); render(); });
}

/* =========================================================
   Main render + event binding
   ========================================================= */
/* =========================================================
   محرر نصوص مبسّط (Rich Text) لصفحة "ملخصاتي": يدعم عريض/مائل/قوائم
   إضافة إلى إدراج صور (تُحوَّل base64) وجداول داخل محتوى الملخص
   ========================================================= */
const RTE_FONT_FAMILIES = [
  ['', 'الخط الافتراضي'],
  ['Cairo, sans-serif', 'Cairo'],
  ['Arial, sans-serif', 'Arial'],
  ["'Times New Roman', serif", 'Times New Roman'],
  ["'Courier New', monospace", 'Courier New'],
  ['Georgia, serif', 'Georgia'],
  ['Tahoma, sans-serif', 'Tahoma']
];
const RTE_FONT_SIZES = [12,13,14,15,16,18,20,22,24,28,32];
function rteToolbarHtml(editorId){
  const familyOptions = RTE_FONT_FAMILIES.map(([val,label])=>`<option value="${escapeHtml(val)}">${escapeHtml(label)}</option>`).join('');
  const sizeOptions = RTE_FONT_SIZES.map(sz=>`<option value="${sz}" ${sz===15?'selected':''}>${sz}px</option>`).join('');
  return `
  <div class="rte-toolbar" data-target="${editorId}">
    <button type="button" class="rte-btn" data-cmd="bold" title="عريض"><b>B</b></button>
    <button type="button" class="rte-btn" data-cmd="italic" title="مائل"><i>I</i></button>
    <button type="button" class="rte-btn" data-cmd="underline" title="تسطير"><u>U</u></button>
    <button type="button" class="rte-btn" data-cmd="insertUnorderedList" title="قائمة نقطية">•≡</button>
    <select class="rte-select rte-font-family" title="نوع الخط">${familyOptions}</select>
    <select class="rte-select rte-font-size" title="حجم الخط">${sizeOptions}</select>
    <input type="color" class="rte-color-input rte-font-color" title="لون الخط للنص المحدَّد" value="#16232f">
    <button type="button" class="rte-btn rte-img-btn" title="إضافة صورة">🖼️</button>
    <button type="button" class="rte-btn rte-table-btn" title="إضافة جدول (تحديد عدد الصفوف والأعمدة)">▦</button>
    <input type="file" accept="image/*" class="rte-img-input" style="display:none;">
  </div>`;
}

function wireRteToolbar(scopeEl){
  scopeEl.querySelectorAll('.rte-toolbar').forEach(toolbar=>{
    const editor = document.getElementById(toolbar.dataset.target);
    if(!editor) return;
    let savedRange = null;
    const saveSelection = ()=>{
      const sel = window.getSelection();
      if(sel && sel.rangeCount && editor.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange();
    };
    const restoreSelection = ()=>{
      if(!savedRange) return;
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
    };
    editor.addEventListener('keyup', saveSelection);
    editor.addEventListener('mouseup', saveSelection);
    toolbar.querySelectorAll('.rte-btn[data-cmd]').forEach(btn=>{
      btn.addEventListener('mousedown', (e)=> e.preventDefault());
      btn.addEventListener('click', ()=>{
        editor.focus(); restoreSelection();
        document.execCommand(btn.dataset.cmd, false, null);
        saveSelection();
      });
    });
    const imgBtn = toolbar.querySelector('.rte-img-btn');
    const imgInput = toolbar.querySelector('.rte-img-input');
    if(imgBtn && imgInput){
      imgBtn.addEventListener('mousedown', (e)=>{ e.preventDefault(); saveSelection(); });
      imgBtn.addEventListener('click', ()=> imgInput.click());
      imgInput.addEventListener('change', async ()=>{
        const file = imgInput.files[0];
        imgInput.value = '';
        if(!file) return;
        try{
          const dataUrl = await resizeImageFile(file, 700);
          editor.focus(); restoreSelection();
          document.execCommand('insertHTML', false, `<img src="${dataUrl}">`);
          saveSelection();
        }catch(err){ /* تجاهل الصورة إن تعذّرت قراءتها */ }
      });
    }
    const tableBtn = toolbar.querySelector('.rte-table-btn');
    if(tableBtn){
      tableBtn.addEventListener('mousedown', (e)=>{ e.preventDefault(); saveSelection(); });
      tableBtn.addEventListener('click', ()=>{
        const rowsInput = prompt('كم عدد صفوف الجدول؟', '2');
        if(rowsInput === null) return;
        const colsInput = prompt('كم عدد أعمدة الجدول؟', '2');
        if(colsInput === null) return;
        const rows = Math.min(Math.max(parseInt(rowsInput, 10) || 0, 1), 20);
        const cols = Math.min(Math.max(parseInt(colsInput, 10) || 0, 1), 20);
        editor.focus(); restoreSelection();
        let rowsHtml = '';
        for(let r=0; r<rows; r++){
          let cellsHtml = '';
          for(let c=0; c<cols; c++) cellsHtml += '<td>&nbsp;</td>';
          rowsHtml += `<tr>${cellsHtml}</tr>`;
        }
        const tableHtml = `<table><tbody>${rowsHtml}</tbody></table><p><br></p>`;
        document.execCommand('insertHTML', false, tableHtml);
        saveSelection();
      });
    }
    const familySelect = toolbar.querySelector('.rte-font-family');
    if(familySelect){
      familySelect.addEventListener('mousedown', saveSelection);
      familySelect.addEventListener('change', ()=>{
        if(savedRange && !savedRange.collapsed && familySelect.value){
          applyStyleToRange(savedRange.cloneRange(), { fontFamily: familySelect.value });
        }
      });
    }
    const sizeSelect = toolbar.querySelector('.rte-font-size');
    if(sizeSelect){
      sizeSelect.addEventListener('mousedown', saveSelection);
      sizeSelect.addEventListener('change', ()=>{
        if(savedRange && !savedRange.collapsed){
          applyStyleToRange(savedRange.cloneRange(), { fontSize: sizeSelect.value+'px' });
        }
      });
    }
    const colorInput = toolbar.querySelector('.rte-font-color');
    if(colorInput){
      colorInput.addEventListener('mousedown', saveSelection);
      colorInput.addEventListener('input', ()=>{
        if(savedRange && !savedRange.collapsed){
          applyStyleToRange(savedRange.cloneRange(), { color: colorInput.value });
        }
      });
    }
  });
}
/* يطبّق مجموعة أنماط CSS (لون، نوع خط، حجم خط...) على نطاق نص محدَّد بتغليفه بوسم span؛
   نسخة معمَّمة من applyColorToRange تُستخدم في محرري الملخصات/الأسئلة ومحرر محتوى الموقع */
function applyStyleToRange(range, styles){
  if(!range || range.collapsed) return;
  const span = document.createElement('span');
  Object.keys(styles).forEach(prop=>{ span.style[prop] = styles[prop]; });
  try{ range.surroundContents(span); }
  catch(e){ const content = range.extractContents(); span.appendChild(content); range.insertNode(span); }
}

/* ينظّف الـ HTML القادم من المحرر قبل حفظه: يسمح فقط بوسوم آمنة (نص، صور،
   جداول، قوائم) ويحذف أي وسوم/خصائص أخرى (سكربتات، معالجات أحداث، روابط غريبة) */
const RTE_ALLOWED_STYLE_PROPS = new Set(['color', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-decoration']);
function sanitizeSummaryHtml(html){
  const ALLOWED = new Set(['P','DIV','BR','B','STRONG','I','EM','U','UL','OL','LI','IMG','TABLE','THEAD','TBODY','TR','TD','TH','SPAN','H3','H4','HR']);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const clean = (node)=>{
    Array.from(node.childNodes).forEach(child=>{
      if(child.nodeType === 1){
        if(!ALLOWED.has(child.tagName)){
          while(child.firstChild) node.insertBefore(child.firstChild, child);
          node.removeChild(child);
          return;
        }
        Array.from(child.attributes).forEach(attr=>{
          const name = attr.name.toLowerCase();
          if(name === 'src' && child.tagName === 'IMG'){
            if(!/^data:image\//i.test(attr.value)) child.removeAttribute(attr.name);
          } else if(name === 'style'){
            /* يُبقي فقط على خصائص التنسيق الآمنة (لون/نوع خط/حجم خط...) ويحذف أي قيمة
               تحتوي على url(/expression(/javascript: لمنع أي محاولة حقن عبر الأنماط */
            const kept = [];
            child.style.cssText.split(';').forEach(decl=>{
              const idx = decl.indexOf(':');
              if(idx === -1) return;
              const prop = decl.slice(0, idx).trim().toLowerCase();
              const val = decl.slice(idx+1).trim();
              if(RTE_ALLOWED_STYLE_PROPS.has(prop) && val && !/url\(|expression\(|javascript:/i.test(val)){
                kept.push(`${prop}: ${val}`);
              }
            });
            if(kept.length) child.setAttribute('style', kept.join('; '));
            else child.removeAttribute('style');
          } else {
            child.removeAttribute(attr.name);
          }
        });
        clean(child);
      } else if(child.nodeType !== 3){
        node.removeChild(child);
      }
    });
  };
  clean(doc.body);
  return doc.body.innerHTML.trim();
}

/* يصغّر صورة الملف المرفوع إلى صورة مربعة تقريبًا (JPEG) ويرجعها كـ Blob (لا كنص base64)
   تمهيدًا لرفعها إلى Supabase Storage بدل تخزينها داخل صف الطالب/بيانات الجلسة. */
function resizeImageFile(file, maxSize=400){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=> reject(new Error('read failed'));
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = ()=> reject(new Error('image load failed'));
      img.onload = ()=>{
        let { width, height } = img;
        if(width > height){ if(width > maxSize){ height = Math.round(height * maxSize/width); width = maxSize; } }
        else { if(height > maxSize){ width = Math.round(width * maxSize/height); height = maxSize; } }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob=> blob ? resolve(blob) : reject(new Error('encode failed')), 'image/jpeg', 0.82);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* يرفع صورة الطالب المصغّرة إلى Supabase Storage (bucket: avatars) تحت مسار فريد
   لكل طالب، ويرجّع رابط الصورة العام (URL قصير) بدل نص base64 ضخم.

   نفّذ هذا مرة واحدة في Supabase SQL Editor لإنشاء الـ bucket وصلاحياته
   (أو أنشئ الـ bucket من لوحة Storage مباشرة واختر public، ثم نفّذ السياسات فقط):

   insert into storage.buckets (id, name, public)
   values ('avatars', 'avatars', true)
   on conflict (id) do nothing;

   -- أي طالب مسجّل دخول يقدر يرفع/يحدّث صورة باسم ملف يبدأ برقم هاتفه فقط
   create policy "student upload own avatar" on storage.objects
     for insert to authenticated
     with check (bucket_id = 'avatars' and name = (auth.jwt()->'user_metadata'->>'phone') || '.jpg');
   create policy "student update own avatar" on storage.objects
     for update to authenticated
     using (bucket_id = 'avatars' and name = (auth.jwt()->'user_metadata'->>'phone') || '.jpg');
   -- القراءة عامة لأن الـ bucket public أصلاً (تُعرض الصور بروابط مباشرة)
   create policy "public read avatars" on storage.objects
     for select using (bucket_id = 'avatars');

   ---------------------------------------------------------------------------
   bucket ثانٍ منفصل (assets) للأصول الثابتة العامة (شعار المنصة، شعارات
   الجامعات...) التي يرفعها الأدمن يدويًا من لوحة تحكم Supabase فقط، بدل
   تضمينها base64 داخل ملف الكود مباشرة. لا حاجة لسياسات insert/update هنا
   لأن الطلاب لا يرفعون عليه شيئًا؛ فقط سياسة قراءة عامة:

   insert into storage.buckets (id, name, public)
   values ('assets', 'assets', true)
   on conflict (id) do nothing;

   create policy "public read assets" on storage.objects
     for select using (bucket_id = 'assets');
*/
async function uploadAvatarBlob(blob, phone){
  if(!supabaseClient) throw new Error('no supabase client');
  const path = `${phone}.jpg`;
  const { error } = await supabaseClient.storage.from('avatars').upload(path, blob, {
    contentType: 'image/jpeg', upsert: true, cacheControl: '3600'
  });
  if(error) throw error;
  const { data } = supabaseClient.storage.from('avatars').getPublicUrl(path);
  // كسر الكاش عند كل تحديث حتى تظهر الصورة الجديدة فورًا بدل نسخة مخزّنة قديمة بالمتصفح
  return `${data.publicUrl}?v=${Date.now()}`;
}

/* يحفظ رابط الصورة الشخصية (أو يزيلها إن كانت avatarUrl تساوي null) في بيانات حساب
   الطالب على Supabase Auth (metadata) وفي سجله ضمن جدول الطلاب المحلي.
   الرابط نص قصير (URL) وليس محتوى الصورة نفسه، فلا يُثقل حجم بيانات الطالب. */
async function saveAvatar(avatarUrl){
  const msgBox = document.getElementById('settingsMsg');
  if(!supabaseClient){ if(msgBox) msgBox.innerHTML = `<div class="form-msg error">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>`; return; }
  const { error } = await supabaseClient.auth.updateUser({ data: { avatar: avatarUrl } });
  if(error){ if(msgBox) msgBox.innerHTML = `<div class="form-msg error">تعذّر حفظ الصورة، حاول بصورة أصغر.</div>`; return; }
  state.session.avatar = avatarUrl || null;
  const student = state.students.find(s=>s.phone===state.session.phone);
  if(student){ student.avatar = avatarUrl || null; await setData('students', state.students, true); }
  render();
}

/* يفتح نافذة إعادة تعيين كلمة مرور الطالب الحالي عبر Supabase Auth */
function modalResetPassword(){
  openModal(`
    <h3>${ICONS.lock} إعادة تعيين كلمة المرور</h3>
    <p style="color:var(--muted); font-size:14.5px;">أدخل كلمة المرور الجديدة لحسابك.</p>
    <form id="resetPasswordForm">
      <div class="field"><label>كلمة المرور الجديدة</label><input type="password" name="newPassword" placeholder="••••••••" required></div>
      <div class="field"><label>تأكيد كلمة المرور</label><input type="password" name="confirmPassword" placeholder="••••••••" required></div>
      <div id="resetPasswordMsg"></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ كلمة المرور</button></div>
    </form>`);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('resetPasswordForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const msgBox = document.getElementById('resetPasswordMsg');
    const newPassword = fd.get('newPassword');
    const confirmPassword = fd.get('confirmPassword');
    if(newPassword.length < 6){ msgBox.innerHTML = `<div class="form-msg error">كلمة المرور يجب أن تكون 6 أحرف على الأقل.</div>`; return; }
    if(newPassword !== confirmPassword){ msgBox.innerHTML = `<div class="form-msg error">كلمتا المرور غير متطابقتين.</div>`; return; }
    if(!supabaseClient){ msgBox.innerHTML = `<div class="form-msg error">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>`; return; }
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if(error){ msgBox.innerHTML = `<div class="form-msg error">تعذّر تحديث كلمة المرور، حاول مرة أخرى.</div>`; return; }
    closeModal();
    const settingsMsg = document.getElementById('settingsMsg');
    if(settingsMsg) settingsMsg.innerHTML = `<div class="form-msg success">تم تحديث كلمة المرور بنجاح.</div>`;
  });
}

/* يحذف حساب الطالب: يوسم الحساب كمحذوف في Supabase Auth (metadata) لمنع الدخول لاحقًا،
   يزيله من سجل الطلاب المحلي، ثم يسجّل خروجه ويعيده للصفحة الرئيسية. */
function confirmDeleteAccount(){
  confirmDelete('سيتم حذف حسابك نهائيًا ولن تتمكن من الدخول به مرة أخرى. هل أنت متأكد؟', async ()=>{
    if(supabaseClient){
      await supabaseClient.auth.updateUser({ data: { accountDeleted: true } });
      await supabaseClient.auth.signOut();
    }
    state.students = state.students.filter(s=>s.phone !== state.session.phone);
    await setData('students', state.students, true);
    state.session = null;
    navigate('home');
  });
}

/* ملاحظة: render() ما عاد يصفّر مكان السكرول تلقائيًا في كل مرة.
   يصفّره فقط لما يكون هناك تنقّل فعلي بين صفحات مختلفة (تغيّر الـ route)،
   حتى لا يرجّع المستخدم لأعلى الصفحة بعد كل ضغطة داخل نفس الصفحة
   (مثل الإجابة على سؤال في بنك الأسئلة أو تعديل بيانات من نفس الصفحة). */
let lastRenderedRoute = null;
/* ================== إدارة العناوين ووصف الـ Meta برمجيًا ==================
   بديل React Helmet / @vueuse/head لمشروع بدون framework: بما إنه ما في
   Virtual DOM ولا مكتبة head-management، بنحدّث وسوم <head> يدويًا بأنفسنا
   بكل مرة يتغيّر فيها المسار (بدل ما تبقى العناوين ثابتة زي أي SPA بدائي). */

const SITE_NAME = 'MEDORA';
const DEFAULT_DESCRIPTION = 'منصة MEDORA لطلاب التمريض وطب الأسنان: دورات، محاضرات، ملخصات، وبنك أسئلة تفاعلي لكل الجامعات.';

/* يحدّث <title> ووسوم <meta> (description / robots / canonical / og / twitter)
   دفعة وحدة. أي وسم غير موجود بالـ head (مشروع قديم مثلًا) يتم تجاهله بأمان. */
function setPageMeta({ title, description, noindex } = {}){
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | منصة طلاب التمريض وطب الأسنان`;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = window.location.origin + window.location.pathname;

  document.title = fullTitle;

  const setContent = (id, value) => { const el = document.getElementById(id); if(el) el.setAttribute('content', value); };
  setContent('metaDescription', desc);
  setContent('metaRobots', noindex ? 'noindex,nofollow' : 'index,follow');
  setContent('metaOgTitle', fullTitle);
  setContent('metaOgDescription', desc);
  setContent('metaOgUrl', url);
  setContent('metaTwitterTitle', fullTitle);
  setContent('metaTwitterDescription', desc);

  const canonical = document.getElementById('metaCanonical');
  if(canonical) canonical.setAttribute('href', url);
}

/* يبني العنوان والوصف المناسبين حسب المسار الحالي (وأحيانًا حسب فلاتر
   الصفحة نفسها، متل جامعة/تخصص محددين بصفحة الدورات أو بنك الأسئلة)،
   ثم يستدعي setPageMeta(). صفحات لوحة التحكم والحساب الشخصي تتعلّم
   noindex عشان ما تنفهرس بمحركات البحث. */
function updateSeoMeta(route){
  if(route.startsWith('course/')){
    const course = state.courses.find(c => c.id === route.slice(7));
    if(course){
      setPageMeta({
        title: `${course.title} - ${course.university}`,
        description: (course.description && course.description.trim())
          ? course.description.trim().slice(0, 155)
          : `دورة ${course.title} لطلاب ${course.major || 'التمريض'} في ${course.university} على منصة MEDORA: محاضرات، ملخصات، وبنك أسئلة.`,
      });
    } else {
      setPageMeta({ title: 'الكورس غير موجود', noindex: true });
    }
    return;
  }

  switch(route){
    case 'home':
      setPageMeta({ description: DEFAULT_DESCRIPTION });
      break;

    case 'courses': {
      const uni = state.courseFilter && state.courseFilter !== 'الكل' ? state.courseFilter : '';
      const major = state.majorFilter && state.majorFilter !== 'الكل' ? state.majorFilter : '';
      const title = (major || uni) ? `دورات ${[major, uni].filter(Boolean).join(' ')}` : 'الدورات';
      const description = (major || uni)
        ? `تصفح دورات ${[major, uni].filter(Boolean).join(' في ')} على منصة MEDORA: محاضرات، ملخصات، وبنك أسئلة تفاعلي.`
        : 'تصفح جميع دورات التمريض وطب الأسنان لكل الجامعات على منصة MEDORA.';
      setPageMeta({ title, description });
      break;
    }

    case 'bank': {
      const uni = quiz.university && quiz.university !== 'عام' ? quiz.university : '';
      const major = quiz.major || '';
      const title = (major && uni) ? `بنك أسئلة ${major} - ${uni}` : 'بنك الأسئلة';
      const description = (major && uni)
        ? `تدرّب على بنك أسئلة ${major} لجامعة ${uni} بشكل تفاعلي على منصة MEDORA.`
        : 'بنك أسئلة تفاعلي لطلاب التمريض وطب الأسنان على منصة MEDORA.';
      /* بنك الأسئلة محمي بتسجيل دخول، فما في داعي يتفهرس بمحركات البحث */
      setPageMeta({ title, description, noindex: true });
      break;
    }

    case 'about':
      setPageMeta({ title: 'من نحن', description: 'تعرّف على منصة MEDORA ورسالتها بخدمة طلاب التمريض وطب الأسنان.' });
      break;
    case 'contact':
      setPageMeta({ title: 'تواصل معنا', description: 'تواصل مع فريق MEDORA لأي استفسار أو دعم فني.' });
      break;
    case 'privacy':
      setPageMeta({ title: 'سياسة الخصوصية', description: 'سياسة الخصوصية الخاصة بمنصة MEDORA وكيفية التعامل مع بياناتك.' });
      break;
    case 'terms':
      setPageMeta({ title: 'الشروط والأحكام', description: 'الشروط والأحكام الخاصة باستخدام منصة MEDORA.' });
      break;

    /* صفحات شخصية/إدارية: تحتاج تسجيل دخول أو خاصة بمستخدم واحد، فلا داعي لفهرستها */
    case 'login':
      setPageMeta({ title: 'تسجيل الدخول', noindex: true });
      break;
    case 'admin-login':
      setPageMeta({ title: 'دخول الإدارة', noindex: true });
      break;
    case 'my-courses':
      setPageMeta({ title: isTeacherSession() ? 'موادي' : 'دوراتي', noindex: true });
      break;
    case 'my-summaries':
      setPageMeta({ title: 'ملخصاتي', noindex: true });
      break;
    case 'ai-summary':
      setPageMeta({ title: 'الملخص الذكي', noindex: true });
      break;
    case 'student-space':
      setPageMeta({ title: 'مساحة الطالب', noindex: true });
      break;
    case 'student-settings':
      setPageMeta({ title: 'إعدادات الحساب', noindex: true });
      break;
    case 'admin-analytics':
      setPageMeta({ title: 'إحصائيات الإدارة', noindex: true });
      break;
    case 'admin-coupons':
      setPageMeta({ title: 'كوبونات الإدارة', noindex: true });
      break;

    default:
      setPageMeta({ description: DEFAULT_DESCRIPTION });
  }
}

async function render(){
  if(!state.loaded){
    document.getElementById('app').innerHTML = `<div style="min-height:80vh; display:flex; align-items:center; justify-content:center; text-align:center; padding:20px;"><span class="loading-dot"></span> جارِ التحميل...</div>`;
    return;
  }
  const route = currentRoute();
  let html = '';
  if(route.startsWith('course/')){
    html = pageCourseDetail(route.slice(7));
  } else {
    switch(route){
      case 'home': html = pageHome(); break;
      case 'courses': html = pageCourses(); break;
      case 'my-courses': html = pageMyCourses(); break;
      case 'my-summaries': html = pageMySummaries(); break;
      case 'ai-summary': html = pageAiSummary(); break;
      case 'student-space': html = pageStudentSpace(); break;
      case 'student-settings': html = pageStudentSettings(); break;
      case 'bank': html = pageBank(); break;
      case 'about': html = pageAbout(); break;
      case 'contact': html = pageContact(); break;
      case 'privacy': html = pagePrivacy(); break;
      case 'terms': html = pageTerms(); break;
      case 'login': html = pageLogin(); break;
      case 'admin-login': html = pageAdminLogin(); break;
      case 'admin-analytics': html = pageAdminAnalytics(); break;
      case 'admin-coupons': html = pageAdminCoupons(); break;
      default: html = pageHome();
    }
  }
  const isNewRoute = (route !== lastRenderedRoute);
  const scrollBefore = window.scrollY;
  document.getElementById('app').innerHTML = html;
  updateSeoMeta(route);
  renderNavState();
  renderNotifPanel();
  bindPageEvents(route);
  translateSubtree(document.body);
  if(isNewRoute){
    window.scrollTo({top:0, behavior:'instant'});
  } else {
    /* نفس الصفحة: نحافظ على مكان السكرول الحالي بدل الرجوع لأعلى الصفحة */
    window.scrollTo({top:scrollBefore, behavior:'instant'});
  }
  lastRenderedRoute = route;
  updateWatermark(route);
}

/* هلامة مائية باهتة جدًا داخل مربع السؤال (اسم الطالب + رقم هاتفه): وحدة بالمنتصف واثنتان بالأطراف،
   وتمنع تحديد/نسخ محتوى الأسئلة. تظهر فقط للطالب المسجّل دخوله وفقط في صفحة "bank". */
function updateWatermark(route){
  const isStudent = state.session && state.session.type === 'student';
  const shouldShow = isStudent && route === 'bank';
  document.body.classList.toggle('copy-protected', shouldShow);
  const label = shouldShow ? `${state.session.name || ''}  •  ${state.session.phone || ''}` : '';
  document.querySelectorAll('#app .wizard-card, #app .q-card').forEach(el=>{
    const existing = el.querySelector('.wm-wrap');
    if(existing) existing.remove();
    if(!shouldShow) return;
    const wrap = document.createElement('div');
    wrap.className = 'wm-wrap';
    const safeLabel = escapeHtml(label);
    wrap.innerHTML =
      `<span class="wm-item wm-center">${safeLabel}</span>` +
      `<span class="wm-item wm-top">${safeLabel}</span>` +
      `<span class="wm-item wm-bottom">${safeLabel}</span>`;
    el.appendChild(wrap);
  });
}

/* منع النسخ/القص/القائمة اليمنى/اختصارات النسخ وأدوات المطوّر أثناء عرض بنك الأسئلة فقط
   (حماية رادعة وليست مطلقة — لا يوجد حل يمنع لقطة الشاشة تمامًا). */
document.addEventListener('copy', (e)=>{ if(document.body.classList.contains('copy-protected')) e.preventDefault(); });
document.addEventListener('cut', (e)=>{ if(document.body.classList.contains('copy-protected')) e.preventDefault(); });
document.addEventListener('contextmenu', (e)=>{ if(document.body.classList.contains('copy-protected')) e.preventDefault(); });
document.addEventListener('selectstart', (e)=>{ if(document.body.classList.contains('copy-protected')) e.preventDefault(); });
document.addEventListener('dragstart', (e)=>{ if(document.body.classList.contains('copy-protected')) e.preventDefault(); });
document.addEventListener('keydown', (e)=>{
  if(!document.body.classList.contains('copy-protected')) return;
  const k = (e.key || '').toLowerCase();
  if((e.ctrlKey || e.metaKey) && ['c','x','u','s','p'].includes(k)) e.preventDefault();
  if(e.key === 'F12') e.preventDefault();
  if((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(k)) e.preventDefault();
});

function bindPageEvents(route){
  document.querySelectorAll('[data-self-enroll]').forEach(btn=>{
    btn.addEventListener('click', ()=> selfEnroll(btn.dataset.selfEnroll));
  });
  document.querySelectorAll('[data-self-enroll-section]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const [cId, section] = btn.dataset.selfEnrollSection.split('|');
      selfEnrollSection(cId, section);
    });
  });
  if(route === 'courses'){
    const majorSel = document.getElementById('majorFilterSelect');
    if(majorSel) majorSel.addEventListener('change', ()=>{ state.majorFilter = majorSel.value; state.coursePage = 1; render(); });
    const uniSel = document.getElementById('uniFilterSelect');
    if(uniSel) uniSel.addEventListener('change', ()=>{ state.courseFilter = uniSel.value; state.coursePage = 1; render(); });
    const searchInput = document.getElementById('courseSearchInput');
    if(searchInput){
      searchInput.addEventListener('input', ()=>{
        state.courseSearch = searchInput.value;
        state.coursePage = 1;
        render().then(()=>{
          const el = document.getElementById('courseSearchInput');
          if(el){ el.focus(); const pos = el.value.length; el.setSelectionRange(pos,pos); }
        });
      });
    }
    const pagePrevBtn = document.getElementById('coursePagePrev');
    if(pagePrevBtn) pagePrevBtn.addEventListener('click', ()=>{
      if(state.coursePage > 1){ state.coursePage -= 1; render().then(()=> scrollToCourseCanvas()); }
    });
    const pageNextBtn = document.getElementById('coursePageNext');
    if(pageNextBtn) pageNextBtn.addEventListener('click', ()=>{
      state.coursePage = (state.coursePage || 1) + 1; render().then(()=> scrollToCourseCanvas());
    });
    const addBtn = document.getElementById('addCourseBtn');
    if(addBtn) addBtn.addEventListener('click', modalAddCourse);
    document.querySelectorAll('[data-edit-course]').forEach(btn=>{
      btn.addEventListener('click', ()=> modalEditCourse(btn.dataset.editCourse));
    });
    document.querySelectorAll('[data-del-course]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delCourse;
        confirmDelete('سيتم حذف هذا الكورس ومحاضراته وأسئلته نهائيًا. هل أنت متأكد؟', async ()=>{
          state.courses = state.courses.filter(c=>c.id!==id);
          state.lectures = state.lectures.filter(l=>l.courseId!==id);
          state.questions = state.questions.filter(q=>q.courseId!==id);
          await setData('courses', state.courses, true);
          await setData('lectures', state.lectures, true);
          await setData('questions', state.questions, true);
        });
      });
    });
  }

  if(route === 'my-summaries'){
    const addSummaryBtn = document.getElementById('addSummaryBtn');
    if(addSummaryBtn) addSummaryBtn.addEventListener('click', modalAddSummary);
    document.querySelectorAll('[data-pdf-summary]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const s = state.summaries.find(x=>x.id===btn.dataset.pdfSummary);
        if(s){
          const sCourse = s.courseId ? state.courses.find(c=>c.id===s.courseId) : null;
          const sLecture = s.lectureId ? state.lectures.find(l=>l.id===s.lectureId) : null;
          downloadSummaryAsPdf(s.title, s.content, { courseTitle: sCourse?.title, lectureTitle: sLecture?.title });
        }
      });
    });
    document.querySelectorAll('[data-edit-summary]').forEach(btn=>{
      btn.addEventListener('click', ()=> modalEditSummary(btn.dataset.editSummary));
    });
    document.querySelectorAll('[data-del-summary]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delSummary;
        confirmDelete('سيتم حذف هذا الملخص نهائيًا. هل أنت متأكد؟', async ()=>{
          state.summaries = state.summaries.filter(s=>s.id!==id);
          await setData('summaries', state.summaries, true);
        });
      });
    });
  }

  if(route === 'ai-summary'){ wireAiSummaryPage(); }

  if(route.startsWith('course/')){
    const courseId = route.slice(7);
    const addLectureBtn = document.getElementById('addLectureBtn');
    if(addLectureBtn) addLectureBtn.addEventListener('click', ()=> modalAddLecture(courseId));
    const editCourseBtn = document.getElementById('editCourseBtn');
    if(editCourseBtn) editCourseBtn.addEventListener('click', ()=> modalEditCourse(courseId));
    const enrollBtn = document.getElementById('enrollStudentBtn');
    if(enrollBtn) enrollBtn.addEventListener('click', ()=> modalEnrollStudent(courseId));
    const exportEnrollBtn = document.getElementById('exportEnrollBtn');
    if(exportEnrollBtn) exportEnrollBtn.addEventListener('click', ()=> exportEnrollmentsExcel(courseId));
    const importEnrollBtn = document.getElementById('importEnrollBtn');
    if(importEnrollBtn) importEnrollBtn.addEventListener('click', ()=> modalImportEnrollments(courseId));
    const resetDeviceBtn = document.getElementById('resetDeviceBtn');
    if(resetDeviceBtn) resetDeviceBtn.addEventListener('click', modalResetStudentDevice);
    /* زر "إدارة بنك أسئلة هذه المادة" بصفحة تفاصيل الكورس (يظهر للمدرّس مالك المادة فقط):
       يوديه مباشرة لواجهة إدارة بنك الأسئلة مفلترة على هذا الكورس تحديدًا، بدل ما يروح
       لصفحة /bank ويختار الكورس يدويًا من القائمة المنسدلة */
    const manageBankBtn = document.getElementById('manageBankBtn');
    if(manageBankBtn) manageBankBtn.addEventListener('click', ()=>{
      state.bankAdminView = true;
      state.bankManageCourseId = courseId;
      state.bankManageLectureId = '';
      navigate('bank');
    });
    /* زر "إرسال إشعار للمشتركين" (يظهر للمدرّس مالك المادة فقط): يفتح مودال مبسّط
       يرسل إشعارًا مستهدَفًا فقط لطلاب هذه المادة المشتركين بها */
    const sendCourseNotifBtn = document.getElementById('sendCourseNotifBtn');
    if(sendCourseNotifBtn) sendCourseNotifBtn.addEventListener('click', ()=> modalSendCourseNotification(courseId));
    document.querySelectorAll('[data-del-course-notif]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delCourseNotif;
        confirmDelete('سيتم حذف هذا الإشعار نهائيًا. هل أنت متأكد؟', async ()=>{
          state.notifications = state.notifications.filter(n=>n.id!==id);
          await setData('notifications', state.notifications, true);
        });
      });
    });
    document.querySelectorAll('[data-unenroll]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const phone = btn.dataset.unenroll;
        const section = btn.dataset.unenrollSection;
        state.enrollments = state.enrollments.filter(e=> !(e.courseId===courseId && e.phone===phone && (e.section===section || !e.section)));
        await setData('enrollments', state.enrollments, true);
        render();
      });
    });
    document.querySelectorAll('[data-edit-lecture]').forEach(btn=>{
      btn.addEventListener('click', ()=> modalEditLecture(btn.dataset.editLecture));
    });
    document.querySelectorAll('[data-del-lecture]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delLecture;
        confirmDelete('سيتم حذف هذه المحاضرة نهائيًا. هل أنت متأكد؟', async ()=>{
          state.lectures = state.lectures.filter(l=>l.id!==id);
          await setData('lectures', state.lectures, true);
        });
      });
    });
    document.querySelectorAll('[data-watch-toggle]').forEach(cb=>{
      cb.addEventListener('click', (e)=> e.stopPropagation());
      cb.addEventListener('change', async ()=>{
        await toggleLectureWatched(cb.dataset.watchToggle);
        render();
      });
    });
  }

  if(route === 'bank'){
    const isAdmin = state.session && state.session.type === 'admin';
    if((isAdmin || isTeacherSession()) && state.bankAdminView){
      const toExam = document.getElementById('toExamModeBtn');
      if(toExam) toExam.addEventListener('click', ()=>{ state.bankAdminView = false; resetQuiz(); render(); });
      const addBtn = document.getElementById('addQuestionBtn');
      if(addBtn) addBtn.addEventListener('click', ()=> modalAddQuestion({
        courseId: state.bankManageCourseId,
        lectureId: (state.bankManageLectureId && state.bankManageLectureId !== '__none__') ? state.bankManageLectureId : null,
      }));
      const importBtn = document.getElementById('importQuestionsBtn');
      if(importBtn) importBtn.addEventListener('click', modalImportQuestions);
      const bankCourseSelect = document.getElementById('bankManageCourseSelect');
      if(bankCourseSelect) bankCourseSelect.addEventListener('change', ()=>{
        state.bankManageCourseId = bankCourseSelect.value;
        state.bankManageLectureId = '';
        render();
      });
      const bankLectureSelect = document.getElementById('bankManageLectureSelect');
      if(bankLectureSelect) bankLectureSelect.addEventListener('change', ()=>{
        state.bankManageLectureId = bankLectureSelect.value;
        render();
      });
      document.querySelectorAll('[data-edit-question]').forEach(btn=>{
        btn.addEventListener('click', ()=> modalEditQuestion(btn.dataset.editQuestion));
      });
      document.querySelectorAll('[data-del-question]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const id = btn.dataset.delQuestion;
          confirmDelete('سيتم حذف هذا السؤال نهائيًا. هل أنت متأكد؟', async ()=>{
            state.questions = state.questions.filter(q=>q.id!==id);
            await setData('questions', state.questions, true);
          });
        });
      });
      return;
    }

    // unified setup page
    const toManageBtn = document.getElementById('toManageBtn');
    if(toManageBtn) toManageBtn.addEventListener('click', ()=>{ state.bankAdminView = true; render(); });
    const toMyNotesBtn = document.getElementById('toMyNotesBtn');
    if(toMyNotesBtn) toMyNotesBtn.addEventListener('click', ()=>{ state.bankNotesView = true; render(); });
    const backFromNotesBtn = document.getElementById('backFromNotesBtn');
    if(backFromNotesBtn) backFromNotesBtn.addEventListener('click', ()=>{ state.bankNotesView = false; render(); });

    document.querySelectorAll('[data-toggle-save]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        await toggleSaveQuestion(btn.dataset.toggleSave);
        render();
      });
    });

    if(quiz.step === 'setup'){
      const majorSelect = document.getElementById('bankMajorSelect');
      if(majorSelect) majorSelect.addEventListener('change', ()=>{
        quiz.major = majorSelect.value || null;
        quiz.courseId = null; quiz.selectedLectures = null; quiz.nature = 'both'; quiz.count = 10; quiz.mode = 'study';
        render();
      });
      const universitySelect = document.getElementById('bankUniversitySelect');
      if(universitySelect) universitySelect.addEventListener('change', ()=>{
        quiz.university = universitySelect.value || null;
        quiz.courseId = null; quiz.selectedLectures = null; quiz.nature = 'both'; quiz.count = 10; quiz.mode = 'study';
        render();
      });
      const courseSelect = document.getElementById('bankCourseSelect');
      if(courseSelect) courseSelect.addEventListener('change', ()=>{
        quiz.courseId = courseSelect.value || null;
        quiz.selectedLectures = null; quiz.nature = 'both'; quiz.count = 10; quiz.mode = 'study';
        render();
      });
      document.querySelectorAll('[data-nature]').forEach(card=>{
        card.addEventListener('click', ()=>{ quiz.nature = card.dataset.nature; render(); });
      });
      document.querySelectorAll('[data-lecture-toggle]').forEach(cb=>{
        cb.addEventListener('change', ()=>{
          const lid = cb.dataset.lectureToggle;
          const allIds = state.lectures.filter(l=>l.courseId===quiz.courseId).map(l=>l.id);
          if(quiz.selectedLectures === null) quiz.selectedLectures = [...allIds];
          if(quiz.selectedLectures.includes(lid)) quiz.selectedLectures = quiz.selectedLectures.filter(x=>x!==lid);
          else quiz.selectedLectures.push(lid);
          render();
        });
      });
      const toggleAllBtn = document.getElementById('toggleAllLectures');
      if(toggleAllBtn) toggleAllBtn.addEventListener('click', ()=>{
        const allIds = state.lectures.filter(l=>l.courseId===quiz.courseId).map(l=>l.id);
        const allSelected = quiz.selectedLectures === null || allIds.every(id=>quiz.selectedLectures.includes(id));
        quiz.selectedLectures = allSelected ? [] : [...allIds];
        render();
      });
      const customCountInput = document.getElementById('customCountInput');
      if(customCountInput){
        customCountInput.addEventListener('change', ()=>{
          let val = Math.floor(Number(customCountInput.value));
          if(!val || val < 1) val = 1;
          if(val > 50) val = 50;
          quiz.count = val;
          render();
        });
        customCountInput.addEventListener('click', (e)=> e.stopPropagation());
      }
      document.querySelectorAll('[data-mode]').forEach(card=>{
        card.addEventListener('click', ()=>{ quiz.mode = card.dataset.mode; render(); });
      });
      const startBtn = document.getElementById('startQuizBtn');
      if(startBtn) startBtn.addEventListener('click', startQuiz);
    }
    if(quiz.step === 'no-questions'){
      const back = document.getElementById('backToCourseBtn'); if(back) back.addEventListener('click', ()=>{ quiz.step='setup'; render(); });
    }
    if(quiz.step === 'running'){
      const q = quiz.pool[quiz.idx];
      const type = q.type || 'mcq';
      const nextBtn = document.getElementById('quizNextBtn');
      if(type === 'mcq'){
        document.querySelectorAll('[data-answer]').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            if(quiz.answers[q.id] !== undefined && quiz.mode === 'study') return;
            quiz.answers[q.id] = Number(btn.dataset.answer);
            render();
          });
        });
      } else if(type === 'written'){
        const ta = document.getElementById('writtenAnswerInput');
        if(ta){
          ta.addEventListener('input', ()=>{
            quiz.answers[q.id] = ta.value;
            if(nextBtn) nextBtn.disabled = !ta.value.trim().length;
          });
        }
        const revealBtn = document.getElementById('revealWrittenBtn');
        if(revealBtn) revealBtn.addEventListener('click', ()=>{
          quiz.revealedWritten = quiz.revealedWritten || {};
          quiz.revealedWritten[q.id] = !quiz.revealedWritten[q.id];
          render();
        });
      } else if(type === 'matching'){
        document.querySelectorAll('.match-answer-select').forEach(sel=>{
          sel.addEventListener('change', ()=>{
            const li = Number(sel.dataset.leftIndex);
            quiz.answers[q.id] = quiz.answers[q.id] || {};
            if(sel.value === '') delete quiz.answers[q.id][li];
            else quiz.answers[q.id][li] = Number(sel.value);
            const allAnswered = (q.pairs||[]).every((_,i)=> quiz.answers[q.id][i] !== undefined);
            if(nextBtn) nextBtn.disabled = !allAnswered;
            if(quiz.mode === 'study' && allAnswered) render();
          });
        });
      }
      if(nextBtn) nextBtn.addEventListener('click', ()=>{
        if(quiz.idx < quiz.pool.length - 1){ quiz.idx++; render().then(()=> scrollToQuizTop()); }
        else { quiz.step = 'results'; render().then(()=> scrollToQuizTop()); }
      });
      const quitBtn = document.getElementById('quitQuizBtn');
      if(quitBtn) quitBtn.addEventListener('click', ()=>{ resetQuiz(); render().then(()=> scrollToQuizTop()); });
    }
    if(quiz.step === 'results'){
      const newBtn = document.getElementById('newQuizBtn'); if(newBtn) newBtn.addEventListener('click', ()=>{ resetQuiz(); render().then(()=> scrollToQuizTop()); });
    }
  }

  if(route === 'contact'){
    const form = document.getElementById('contactForm');
    if(form) form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      state.messages.push({ id:'m'+Date.now(), name:fd.get('name').trim(), email:fd.get('email').trim(), message:fd.get('message').trim() });
      await setData('messages', state.messages, true);
      document.getElementById('contactMsg').innerHTML = `<div class="form-msg ok">تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا.</div>`;
      e.target.reset();
    });
    document.querySelectorAll('[data-del-message]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delMessage;
        confirmDelete('سيتم حذف هذه الرسالة نهائيًا. هل أنت متأكد؟', async ()=>{
          state.messages = state.messages.filter(m=>m.id!==id);
          await setData('messages', state.messages, true);
        });
      });
    });
  }

  if(route === 'student-space'){
    const couponForm = document.getElementById('couponRedeemForm');
    /* يعرض داخل couponRedeemMsg نتيجة نهائية (نجاح/خطأ) لعملية تفعيل الكوبون */
    const showCouponResult = async (result)=>{
      const msgBox = document.getElementById('couponRedeemMsg');
      if(!msgBox) return;
      if(result.ok){
        await render(); // يعيد رسم الصفحة لتحديث عدّاد "دورة مفعّلة" والأقسام المفتوحة
        const freshMsgBox = document.getElementById('couponRedeemMsg');
        if(freshMsgBox){
          freshMsgBox.innerHTML = `<div class="form-msg ok">${result.msg}</div>`;
          if(result.card) await renderCouponCardPreview(result.card, freshMsgBox);
        }
      } else {
        msgBox.innerHTML = `<div class="form-msg error">${result.msg}</div>`;
      }
    };
    /* كوبون "المادة من اختيار الطالب": بدل رسالة الخطأ، نعرض قائمة مواد منسدلة
       ليختار الطالب منها ثم يؤكد، فنعيد استدعاء redeemCoupon بنفس الكود مع المادة المختارة */
    const showCourseChoiceStep = (code)=>{
      const msgBox = document.getElementById('couponRedeemMsg');
      if(!msgBox) return;
      const studentUni = state.session && state.session.type === 'student' ? state.session.university : null;
      const studentMajor = state.session && state.session.type === 'student' ? state.session.major : null;
      // إذا ما كانت جامعة/تخصص الطالب محفوظة في حسابه (حساب قديم أو بيانات ناقصة)،
      // لا نعرض كل المواد كبديل، بل نطلب منه استكمال بياناته أولًا
      if(!studentUni || !studentMajor){
        msgBox.innerHTML = `<div class="form-msg error">جامعتك أو تخصصك غير محدَّدين في حسابك، الرجاء تحديثهما من صفحة الملف الشخصي ثم إعادة المحاولة.</div>`;
        return;
      }
      const eligible = state.courses.filter(c => (c.university === studentUni || c.university === 'عام') && (c.major || 'التمريض') === studentMajor);
      if(!eligible.length){
        msgBox.innerHTML = `<div class="form-msg error">لا توجد مواد متاحة لجامعتك وتخصصك حاليًا لتفعيل هذا الكوبون عليها.</div>`;
        return;
      }
      const courseCardsHtml = eligible.map((c,i)=>`
        <label style="display:flex; align-items:center; justify-content:space-between; gap:10px; cursor:pointer; padding:12px 14px; border-radius:12px; border:2px solid var(--border); background:var(--card);">
          <span class="i18n-skip" style="display:flex; flex-direction:column; gap:3px;">
            <b style="font-size:15px;">${escapeHtml(c.title)}</b>
            <span style="font-size:12.5px; color:var(--muted); font-weight:400;">${escapeHtml(c.university)} — ${escapeHtml(c.major || 'التمريض')}</span>
          </span>
          <input type="radio" name="couponChooseCourse" value="${c.id}" ${i===0?'checked':''} style="width:18px; height:18px; accent-color:var(--teal); flex-shrink:0;">
        </label>
      `).join('');
      msgBox.innerHTML = `
        <div class="form-msg" style="background:var(--teal-light); color:var(--teal); border:1px solid var(--teal);">
          🧑‍🎓 هذا الكوبون يتيح لك اختيار المادة بنفسك (من مواد جامعتك وتخصصك).
        </div>
        <div class="field" style="margin-top:10px;">
          <label>اختر المادة</label>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">${courseCardsHtml}</div>
        </div>
        <button type="button" class="btn teal solid small" style="margin-top:14px;" id="confirmCouponCourseBtn">تأكيد وتفعيل الكوبون</button>
      `;
      const confirmBtn = document.getElementById('confirmCouponCourseBtn');
      if(confirmBtn) confirmBtn.addEventListener('click', async ()=>{
        confirmBtn.disabled = true;
        const checked = document.querySelector('input[name="couponChooseCourse"]:checked');
        const chosenCourseId = checked ? checked.value : '';
        const result = await redeemCoupon(code, chosenCourseId);
        confirmBtn.disabled = false;
        await showCouponResult(result);
      });
    };
    if(couponForm) couponForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const code = fd.get('couponCode');
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const result = await redeemCoupon(code);
      submitBtn.disabled = false;
      if(result.needsCourseChoice){ showCourseChoiceStep(code); return; }
      await showCouponResult(result);
    });
  }

  if(route === 'admin-coupons'){
    const addBtn = document.getElementById('addCouponBtn');
    if(addBtn) addBtn.addEventListener('click', modalCreateCoupon);
    document.querySelectorAll('[data-toggle-coupon]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const coupon = state.coupons.find(c=>c.id===btn.dataset.toggleCoupon);
        if(!coupon) return;
        coupon.active = !coupon.active;
        await setData('coupons', state.coupons, true);
        render();
      });
    });
    document.querySelectorAll('[data-del-coupon]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delCoupon;
        confirmDelete('سيتم حذف هذا الكوبون نهائيًا. هل أنت متأكد؟', async ()=>{
          state.coupons = state.coupons.filter(c=>c.id!==id);
          await setData('coupons', state.coupons, true);
        });
      });
    });
  }

  if(route === 'admin-analytics'){
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    if(addTeacherBtn) addTeacherBtn.addEventListener('click', modalCreateTeacher);
    const studentSearchInput = document.getElementById('studentSearchInput');
    if(studentSearchInput) studentSearchInput.addEventListener('input', ()=>{
      const q = studentSearchInput.value.trim().toLowerCase();
      document.querySelectorAll('.student-row').forEach(row=>{
        const hay = (row.dataset.studentSearch||'').toLowerCase();
        row.style.display = hay.includes(q) ? '' : 'none';
      });
    });
    document.querySelectorAll('[data-del-student]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const phone = btn.dataset.delStudent;
        const student = state.students.find(s=>s.phone===phone);
        confirmDelete(`سيتم حذف حساب "${student ? (student.fullName||phone) : phone}" نهائيًا مع كل تفعيلاته وملخصاته، ولن يقدر يدخل به مرة أخرى. هل أنت متأكد؟`, async ()=>{
          await deleteStudent(phone);
        });
      });
    });
    document.querySelectorAll('[data-edit-teacher]').forEach(btn=>{
      btn.addEventListener('click', ()=> modalEditTeacher(btn.dataset.editTeacher));
    });
    document.querySelectorAll('[data-del-teacher]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delTeacher;
        const teacher = state.teachers.find(t=>t.id===id);
        confirmDelete(`سيتم حذف حساب "${teacher ? (teacher.fullName||teacher.username) : ''}" وفك ربطه عن كل موادّه، ولن يقدر يدخل للوحة التحكم بعدها. هل أنت متأكد؟`, async ()=>{
          await deleteTeacher(id);
        });
      });
    });
    const sendNotifBtn = document.getElementById('sendNotifBtn');
    if(sendNotifBtn) sendNotifBtn.addEventListener('click', modalSendNotification);
    document.querySelectorAll('[data-del-notif]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.delNotif;
        confirmDelete('سيتم حذف هذا الإشعار نهائيًا. هل أنت متأكد؟', async ()=>{
          state.notifications = state.notifications.filter(n=>n.id!==id);
          await setData('notifications', state.notifications, true);
        });
      });
    });
  }

  if(route === 'student-settings'){
    const fileInput = document.getElementById('avatarInput');
    const chooseBtn = document.getElementById('chooseAvatarBtn');
    const removeBtn = document.getElementById('removeAvatarBtn');
    const avatarPreviewEl = document.getElementById('avatarPreview');
    const msgBox = document.getElementById('settingsMsg');
    // undefined = لا تغيير، null = إزالة، Blob = صورة جديدة (لم تُرفع/تُحفظ بعد)
    let pendingAvatarBlob;

    if(chooseBtn && fileInput) chooseBtn.addEventListener('click', ()=> fileInput.click());
    if(fileInput) fileInput.addEventListener('change', async ()=>{
      const file = fileInput.files[0];
      if(!file) return;
      if(file.size > 2*1024*1024){
        if(msgBox) msgBox.innerHTML = `<div class="form-msg error">حجم الصورة كبير جدًا، اختر صورة أقل من 2MB.</div>`;
        return;
      }
      try{
        const blob = await resizeImageFile(file);
        pendingAvatarBlob = blob;
        // معاينة محلية فورية عبر object URL (بلا أي رفع أو base64)، تُحرَّر لاحقًا بـ revokeObjectURL
        const previewUrl = URL.createObjectURL(blob);
        if(avatarPreviewEl) avatarPreviewEl.innerHTML = `<img src="${previewUrl}" alt="الصورة الشخصية" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        if(msgBox) msgBox.innerHTML = `<div class="form-msg info">تم اختيار الصورة، اضغط "حفظ التعديلات" لتثبيتها.</div>`;
      }catch(e){
        if(msgBox) msgBox.innerHTML = `<div class="form-msg error">تعذّرت معالجة الصورة، جرّب صورة أخرى.</div>`;
      }
    });
    if(removeBtn) removeBtn.addEventListener('click', ()=>{
      pendingAvatarBlob = null;
      if(avatarPreviewEl) avatarPreviewEl.innerHTML = majorEmblem(state.session.major);
      if(msgBox) msgBox.innerHTML = `<div class="form-msg info">تم اختيار إزالة الصورة، اضغط "حفظ التعديلات" لتثبيت ذلك.</div>`;
    });

    const fontSel = document.getElementById('fontSizeSelect');
    if(fontSel) getData('fontScale', 'medium', false).then(v => fontSel.value = v || 'medium');
    const langSel = document.getElementById('languageSelect');
    if(langSel) langSel.value = LANG;

    const resetPwBtn = document.getElementById('resetPasswordBtn');
    if(resetPwBtn) resetPwBtn.addEventListener('click', modalResetPassword);
    const deleteAccBtn = document.getElementById('deleteAccountBtn');
    if(deleteAccBtn) deleteAccBtn.addEventListener('click', confirmDeleteAccount);

    const saveBtn = document.getElementById('saveSettingsBtn');
    if(saveBtn) saveBtn.addEventListener('click', async ()=>{
      if(pendingAvatarBlob !== undefined){
        if(pendingAvatarBlob === null){
          await saveAvatar(null);
        } else {
          if(msgBox) msgBox.innerHTML = `<div class="form-msg info">جارِ رفع الصورة...</div>`;
          try{
            const url = await uploadAvatarBlob(pendingAvatarBlob, state.session.phone);
            await saveAvatar(url);
          }catch(e){
            if(msgBox) msgBox.innerHTML = `<div class="form-msg error">تعذّر رفع الصورة، حاول مجددًا.</div>`;
            return;
          }
        }
      }
      if(fontSel){ applyFontScale(fontSel.value); await setData('fontScale', fontSel.value, false); }
      if(langSel && langSel.value !== LANG) await setLanguage(langSel.value);
      const freshMsgBox = document.getElementById('settingsMsg');
      if(freshMsgBox) freshMsgBox.innerHTML = `<div class="form-msg success">تم حفظ التعديلات بنجاح.</div>`;
    });
  }
  if(route === 'login'){
    const switchBtn = document.getElementById('switchAuth');
    if(switchBtn) switchBtn.addEventListener('click', ()=>{ authMode = authMode==='login' ? 'register' : 'login'; render(); });
    const form = document.getElementById('authForm');
    if(form) form.addEventListener('submit', handleAuthSubmit);
  }
  if(route === 'admin-login'){
    const form = document.getElementById('adminForm');
    if(form) form.addEventListener('submit', handleAdminSubmit);
  }
}

function startQuiz(){
  let pool = state.questions.filter(q=>q.courseId===quiz.courseId);
  if(quiz.nature !== 'both') pool = pool.filter(q => (q.nature||'past') === quiz.nature);
  pool = pool.filter(q => !q.lectureId || (isLectureIncluded(q.lectureId) && isLectureAccessibleForBank(q.lectureId)));
  pool = shuffleArr(pool);
  if(quiz.count) pool = pool.slice(0, quiz.count);
  quiz.pool = pool; quiz.idx = 0; quiz.answers = {}; quiz.revealed = {}; quiz.revealedWritten = {};
  quiz.step = pool.length ? 'running' : 'no-questions';
  render().then(()=> scrollToQuizTop());
}

/* رقم الهاتف هو معرّف دخول الطالب. نطبّعه (نحذف المسافات والشرطات والأقواس)
   ثم نبني منه "بريد وهمي" ثابت يُستخدم فقط داخليًا مع Supabase Auth،
   فالمصادقة الفعلية (كلمة المرور، الجلسة، التوكن) تبقى بالكامل من Supabase. */
function normalizePhone(raw){
  return (raw||'').trim().replace(/[\s\-()]/g,'');
}
function isValidPhone(phone){
  return /^07[0-9]{8}$/.test(phone);
}
function phoneToPseudoEmail(phone){
  return 's'+phone.replace(/\D/g,'')+'@medora.app';
}

/* رسالة موحّدة لأخطاء الشبكة/الازدحام (Timeout، فشل الاتصال، إلخ) تُميَّز عن خطأ
   "بيانات دخول خاطئة" الحقيقي، حتى لا يظن الطالب أنه أخطأ برقمه أو كلمة سره بينما
   السبب الفعلي هو ازدحام مؤقت على السيرفر. */
function isNetworkOrServerError(error){
  if(!error) return false;
  const msg = (error.message || '').toLowerCase();
  return /fetch|network|timeout|timed out|failed to fetch|503|504|gateway|too many/i.test(msg);
}
const SERVER_BUSY_MSG = 'تعذّر الاتصال بالسيرفر (قد يكون هناك ازدحام مؤقت). يرجى الانتظار قليلًا والمحاولة مرة أخرى.';

async function handleAuthSubmit(e){
  e.preventDefault();
  const submitBtn = document.getElementById('authSubmitBtn');
  if(submitBtn && submitBtn.disabled) return; // يمنع الضغط المتكرر أثناء إرسال سابق لم ينتهِ بعد
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if(submitBtn){ submitBtn.disabled = true; submitBtn.innerHTML = `<span class="ai-spinner" style="width:16px;height:16px;border-width:2px;margin-left:8px;"></span> جارِ الإرسال...`; }
  try{
    const fd = new FormData(e.target);
    const phone = normalizePhone(fd.get('phone'));
    const password = fd.get('password');
    const msgBox = document.getElementById('authMsg');
    if(!supabaseClient){ msgBox.innerHTML = `<div class="form-msg error">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>`; return; }
    if(!isValidPhone(phone)){ msgBox.innerHTML = `<div class="form-msg error">الرجاء إدخال رقم الهاتف الأردني والذي يبدأ ب 07.</div>`; return; }
    const pseudoEmail = phoneToPseudoEmail(phone);
    if(authMode === 'register'){
      const fullName = fd.get('fullName').trim();
      const university = (fd.get('university') || '').trim();
      const major = (fd.get('major') || '').trim();
      if(!major){ msgBox.innerHTML = `<div class="form-msg error">يرجى اختيار التخصص.</div>`; return; }
      if(!university){ msgBox.innerHTML = `<div class="form-msg error">يرجى اختيار الجامعة.</div>`; return; }
      const { data, error } = await supabaseClient.auth.signUp({
        email: pseudoEmail,
        password,
        options: { data: { phone, fullName, university, major, role:'student' } }
      });
      if(error){
        const msg = isNetworkOrServerError(error) ? SERVER_BUSY_MSG
          : /registered|exists/i.test(error.message) ? 'رقم الهاتف هذا مسجّل بالفعل، جرّب تسجيل الدخول بدلًا من ذلك.'
          : 'تعذّر إنشاء الحساب، تأكد أن كلمة المرور 6 أحرف على الأقل.';
        msgBox.innerHTML = `<div class="form-msg error">${msg}</div>`; return;
      }
      if(!data.session){
        msgBox.innerHTML = `<div class="form-msg error">تم إنشاء الحساب، لكن يبدو أن تأكيد البريد مفعّل في إعدادات Supabase. عطّل خيار "Confirm email" من Authentication → Providers → Email ثم أعد المحاولة.</div>`; return;
      }
      await enforceDeviceLock(phone, data.user.id); // أول تسجيل للحساب، يربط هذا الجهاز به تلقائيًا
      state.students.push({ phone, fullName, university, major });
      await setData('students', state.students, true);
      state.session = { type:'student', phone, name: fullName, university, major, avatar: null };
      state.courseFilter = university;
      state.majorFilter = major;
      watchDeviceLock(phone);
      navigate('home'); render();
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password });
      if(error){
        msgBox.innerHTML = `<div class="form-msg error">${isNetworkOrServerError(error) ? SERVER_BUSY_MSG : 'رقم الهاتف أو كلمة المرور غير صحيحة.'}</div>`;
        return;
      }
      const meta = data.user.user_metadata || {};
      if(meta.accountDeleted){
        await supabaseClient.auth.signOut();
        msgBox.innerHTML = `<div class="form-msg error">هذا الحساب تم حذفه. يمكنك إنشاء حساب جديد من صفحة التسجيل.</div>`;
        return;
      }
      const finalPhone = meta.phone || phone;
      const allowed = await enforceDeviceLock(finalPhone, data.user.id);
      if(!allowed){
        msgBox.innerHTML = `<div class="form-msg error">${ICONS.lock} هذا الحساب مسجَّل دخول بالفعل على جهاز آخر، ولا يمكن استخدام أكثر من جهاز واحد لنفس الحساب. للدخول من هذا الجهاز، تواصل مع الإدارة لإعادة تعيين جهاز حسابك.</div>`;
        return;
      }
      state.session = { type:'student', phone: finalPhone, name: meta.fullName||phone, university: meta.university||null, major: meta.major||null, avatar: meta.avatar||null };
      if(state.session.university) state.courseFilter = state.session.university;
      if(state.session.major) state.majorFilter = state.session.major;
      watchDeviceLock(finalPhone);
      navigate('home'); render();
    }
  }catch(e){
    const msgBox = document.getElementById('authMsg');
    if(msgBox) msgBox.innerHTML = `<div class="form-msg error">${SERVER_BUSY_MSG}</div>`;
  }finally{
    if(submitBtn){ submitBtn.disabled = false; submitBtn.innerHTML = originalBtnHtml; }
  }
}

async function handleAdminSubmit(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const username = fd.get('username').trim();
  const password = fd.get('password');
  const msgBox = document.getElementById('adminMsg');
  if(!supabaseClient){ msgBox.innerHTML = `<div class="form-msg error">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>`; return; }
  const pseudoEmail = username.toLowerCase()+'@medora.app';
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: pseudoEmail, password });
  if(error){ msgBox.innerHTML = `<div class="form-msg error">بيانات دخول المشرف غير صحيحة.</div>`; return; }
  const meta = data.user.user_metadata || {};
  if(meta.role !== 'admin' && meta.role !== 'teacher'){
    await supabaseClient.auth.signOut();
    msgBox.innerHTML = `<div class="form-msg error">هذا الحساب لا يملك صلاحية دخول لوحة التحكم.</div>`; return;
  }
  if(meta.role === 'teacher'){
    const stillActive = state.teachers.some(t=>t.id===data.user.id);
    if(!stillActive){
      await supabaseClient.auth.signOut();
      msgBox.innerHTML = `<div class="form-msg error">تم حذف هذا الحساب من قبل إدارة المنصة، ولم يعد بإمكانك الدخول به.</div>`; return;
    }
    state.session = { type:'teacher', teacherId: data.user.id, username: meta.username||username, name: meta.fullName || 'مدرّس' };
  } else {
    state.session = { type:'admin', username: meta.username||username, name: meta.fullName || 'مشرف المنصة' };
  }
  navigate('home'); render();
}

document.getElementById('mobileToggle').addEventListener('click', ()=>{ document.getElementById('navLinks').classList.toggle('open'); });
document.getElementById('navLinks').addEventListener('click', (e)=>{ if(e.target.tagName === 'A') document.getElementById('navLinks').classList.remove('open'); });

document.body.addEventListener('click', (e)=>{
  const editBtnEl = e.target.closest('[data-edit-content]');
  if(editBtnEl){ modalEditContent(editBtnEl.dataset.editContent); }
});

document.body.addEventListener('click', (e)=>{
  const watchBtn = e.target.closest('.watch-secure');
  if(watchBtn){ toggleSecurePlayer(watchBtn); }
});

(function(){
  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  const notifBadge = document.getElementById('notifBadge');
  notifBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    notifPanel.classList.toggle('open');
    notifBadge.style.display = 'none';
  });
  document.addEventListener('click', (e)=>{
    if(!notifPanel.contains(e.target) && e.target!==notifBtn){
      notifPanel.classList.remove('open');
    }
  });
})();

/* Interactive glass tilt + spotlight effect for course cards */
(function(){
  const MAX_TILT = 10;
  document.body.addEventListener('mousemove', (e)=>{
    const card = e.target.closest && e.target.closest('.course-card');
    if(!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rx = ((y / rect.height) - 0.5) * -MAX_TILT;
    const ry = ((x / rect.width) - 0.5) * MAX_TILT;
    card.style.setProperty('--mx', px + '%');
    card.style.setProperty('--my', py + '%');
    card.style.transform = `translateY(-6px) scale(1.02) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  document.body.addEventListener('mouseleave', (e)=>{
    document.querySelectorAll('.course-card').forEach(c=>{ c.style.transform=''; });
  }, true);
  document.body.addEventListener('mouseout', (e)=>{
    const card = e.target.closest && e.target.closest('.course-card');
    if(!card) return;
    const related = e.relatedTarget;
    if(related && card.contains(related)) return;
    card.style.transform = '';
  });
})();

function applyTheme(dark){
  document.body.classList.toggle('dark', !!dark);
  const btn = document.getElementById('themeToggleBtn');
  if(btn) btn.textContent = dark ? '☀️' : '🌙';
}
document.getElementById('themeToggleBtn').addEventListener('click', async ()=>{
  const dark = !document.body.classList.contains('dark');
  applyTheme(dark);
  await setData('darkMode', dark, false);
});

const FONT_SCALE_MAP = { small:0.92, medium:1, large:1.14 };
function applyFontScale(size){
  document.body.style.zoom = FONT_SCALE_MAP[size] || 1;
}

(async function boot(){
  /* دعم الروابط القديمة من نوع #/route (مفضّلات محفوظة، روابط قديمة متداولة):
     إذا وصل المستخدم برابط فيه هاش، نحوّله لمسار عادي عبر History API فورًا. */
  if(location.hash && location.hash.startsWith('#/')){
    const legacyRoute = location.hash.replace('#/', '');
    history.replaceState(null, '', '/' + legacyRoute);
  } else if(!location.pathname || location.pathname === '' ){
    history.replaceState(null, '', '/home');
  }
  const savedLang = await getData('language', 'ar', false);
  LANG = (savedLang === 'en') ? 'en' : 'ar';
  applyLangAttrs();
  render(); // إظهار شاشة التحميل فورًا بدل ترك المحتوى فارغًا أثناء جلب البيانات
  translateSubtree(document.body);
  await initData();
  applyDesignVars(state.design);
  const savedTheme = await getData('darkMode', false, false);
  applyTheme(savedTheme);
  const personalFontScale = await getData('fontScale', null, false);
  if(personalFontScale) applyFontScale(personalFontScale);
  await render();
  window.__PRERENDER_READY__ = true; /* إشارة لسكربت الـ prerender إن الصفحة جاهزة */
})();
