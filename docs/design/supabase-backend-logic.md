<div dir="rtl" align="right">

# FlexiSpace - ملف لوجك الباكند النهائي

المشروع: FlexiSpace - Smart Office Booking Platform with IoT Integration  
المعمارية المعتمدة: Supabase Backend  
المرحلة: قبل التكويد  
القرار النهائي: لا يوجد تحويل إلى Node أو Nest أو Prisma أو Redis. كل الباكند سيكون مبنيًا على Supabase.

---

## ١. القرار المعماري النهائي

الباكند سيتم بناؤه بالكامل على Supabase.

المكونات الأساسية:

- Supabase Auth لإدارة المستخدمين وتسجيل الدخول.
- Supabase PostgreSQL كمصدر الحقيقة الوحيد.
- Supabase Edge Functions كطبقة API وتنفيذ العمليات.
- PostgreSQL RPC للعمليات الحساسة مثل إنشاء الحجز وتغيير حالة الحجز.
- PostgreSQL Triggers لفرض audit logging و state machine.
- PostgreSQL Constraints لمنع تداخل الحجوزات.
- Supabase Realtime لتحديث الواجهة لحظيًا.
- pg_cron و jobs table للمهام المؤجلة.
- IoT في البداية سيكون وهميًا للعرض أمام اللجنة.
- MQTT يمكن إضافته لاحقًا عبر EMQX، لكن ليس مطلوبًا في النسخة الأولى.

قاعدة مهمة:

النظام لا يعتمد على منطق الواجهة لحماية البيانات.  
المنطق الحرج يجب أن يكون داخل PostgreSQL.

---

## ٢. الأدوار في النظام

الأدوار المعتمدة:

- مستخدم عادي.
- مشغل.
- مالك.
- مدير نظام.

</div>

```text
USER
OPERATOR
OWNER
ADMIN
```

<div dir="rtl" align="right">

صلاحيات مختصرة:

| الدور | الصلاحيات |
|---|---|
| USER | إنشاء حجز، دفع وهمي، استخدام QR، رؤية حجوزاته |
| OPERATOR | قبول أو رفض الحجوزات، متابعة الأجهزة، فتح يدوي، معالجة المشاكل |
| OWNER | إدارة المكاتب، قبول أو رفض الحجوزات، رؤية التقارير |
| ADMIN | صلاحيات كاملة للنظام |

---

## ٣. قرار الحجز النهائي

كل حجز يجب أن يحتاج موافقة.

لا يوجد حجز مباشر بدون موافقة.

أي حجز جديد يبدأ دائمًا بالحالة:

</div>

```text
PENDING_APPROVAL
```

<div dir="rtl" align="right">

بعد ذلك يمكن أن يتم قبوله أو رفضه بواسطة:

- المالك.
- أو المشغل.

إذا تم قبول الحجز، ينتقل إلى:

</div>

```text
APPROVED
PAYMENT_PENDING
CONFIRMED
```

<div dir="rtl" align="right">

إذا تم رفض الحجز، ينتقل إلى:

</div>

```text
REJECTED
```

<div dir="rtl" align="right">

قرار نهائي:

- لا نستخدم حجز فوري.
- لا نستخدم `requires_approval = false`.
- كل الحجز يحتاج موافقة مالك أو مشغل.

---

## ٤. Booking State Machine

حالات الحجز:

</div>

```text
PENDING_APPROVAL
APPROVED
PAYMENT_PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
COMPLETED
REJECTED
CANCELLED
EXPIRED
NO_SHOW
OVERSTAY
REFUNDED
```

<div dir="rtl" align="right">

المسار الطبيعي:

</div>

```text
PENDING_APPROVAL
-> APPROVED
-> PAYMENT_PENDING
-> CONFIRMED
-> CHECKED_IN
-> CHECKED_OUT
-> COMPLETED
```

<div dir="rtl" align="right">

مسار الرفض:

</div>

```text
PENDING_APPROVAL
-> REJECTED
```

<div dir="rtl" align="right">

مسار الإلغاء:

</div>

```text
PENDING_APPROVAL -> CANCELLED
APPROVED -> CANCELLED
PAYMENT_PENDING -> CANCELLED
CONFIRMED -> CANCELLED
```

<div dir="rtl" align="right">

مسار انتهاء الدفع:

</div>

```text
PAYMENT_PENDING
-> EXPIRED
```

<div dir="rtl" align="right">

مسار عدم الحضور:

</div>

```text
CONFIRMED
-> NO_SHOW
```

<div dir="rtl" align="right">

مسار تجاوز الوقت:

</div>

```text
CHECKED_IN
-> OVERSTAY
-> CHECKED_OUT
-> COMPLETED
```

<div dir="rtl" align="right">

قاعدة مهمة:

أي تغيير حالة يجب أن يمر عبر RPC أو trigger.  
لا نسمح بتحديث حالة الحجز مباشرة من الواجهة.

---

## ٥. منع تداخل الحجوزات

PostgreSQL هو المسؤول عن منع تداخل الحجوزات.

لا نعتمد فقط على فحص من التطبيق.

الحجز ممنوع أن يتداخل مع حجز آخر لنفس المكتب إذا كان الحجز في حالة غير نهائية.

الحالات التي لا تمنع الحجز الجديد:

</div>

```text
REJECTED
CANCELLED
EXPIRED
NO_SHOW
COMPLETED
REFUNDED
```

<div dir="rtl" align="right">

يتم تطبيق ذلك عبر PostgreSQL Exclusion Constraint باستخدام:

</div>

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING GIST (
  office_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (
  deleted_at IS NULL
  AND status NOT IN (
    'REJECTED',
    'CANCELLED',
    'EXPIRED',
    'NO_SHOW',
    'COMPLETED',
    'REFUNDED'
  )
);
```

<div dir="rtl" align="right">

هذا يضمن أنه حتى لو وصل طلبان في نفس اللحظة، قاعدة البيانات تمنع التداخل.

---

## ٦. الدفع

الدفع أمام اللجنة سيكون وهميًا.

سنستخدم:

</div>

```text
MOCK_PAYMENT
```

<div dir="rtl" align="right">

لا يوجد Stripe.  
لا يوجد PayTabs.  
لا يوجد إدخال بيانات بطاقة.  
لا توجد أسرار دفع حقيقية.

لكن سنبقي تصميم الدفع production-ready.

الجداول ستبقى موجودة:

</div>

```text
payments
webhook_events
```

<div dir="rtl" align="right">

السبب:

نريد أن يكون النظام قابلًا لاحقًا لاستبدال الدفع الوهمي بمزود حقيقي بدون تغيير منطق الحجز.

---

## ٧. مسار الدفع الوهمي

بعد قبول الحجز:

</div>

```text
PENDING_APPROVAL
-> APPROVED
-> PAYMENT_PENDING
```

<div dir="rtl" align="right">

بعد ذلك تظهر للمستخدم صفحة دفع وهمية.

عند الضغط على تأكيد الدفع:

- يتم إنشاء حدث دفع وهمي.
- يتم تسجيله في `webhook_events`.
- يتم تحديث `payments`.
- يتم تحويل الحجز إلى `CONFIRMED`.

المسار:

</div>

```text
PAYMENT_PENDING
-> CONFIRMED
```

<div dir="rtl" align="right">

قاعدة مهمة:

حتى الدفع الوهمي يجب أن يمر عبر نفس منطق الدفع الحقيقي:

- idempotency.
- webhook event.
- audit log.
- state machine.

هذا يجعل المشروع قويًا أمام اللجنة.

---

## ٨. QR Token

رمز QR سيكون قابلًا للاستخدام أكثر من مرة خلال مدة الحجز.

يعني:

</div>

```text
Reusable during booking window
```

<div dir="rtl" align="right">

وليس:

</div>

```text
Single-use
```

<div dir="rtl" align="right">

السبب:

المستخدم قد يخرج ويدخل أكثر من مرة خلال مدة الحجز.

لكن كل عملية مسح QR يتم تسجيلها في:

</div>

```text
access_events
```

<div dir="rtl" align="right">

شروط صلاحية QR:

- الحجز يجب أن يكون مؤكدًا.
- الوقت الحالي داخل مدة السماح.
- الرمز غير منتهي.
- الرمز غير ملغي.
- الحجز غير ملغي أو منتهي أو مرفوض.

يتم تخزين hash للرمز فقط، وليس الرمز نفسه.

---

## ٩. فتح الباب

ندعم طريقتين لفتح الباب.

الطريقة الأولى والأساسية:

- مسح QR.

الطريقة الثانية:

- زر فتح الباب داخل التطبيق.

زر فتح الباب داخل التطبيق يعمل فقط إذا:

- المستخدم هو صاحب الحجز.
- الحجز مؤكد.
- الوقت الحالي داخل مدة السماح.
- المكتب مرتبط بجهاز باب.

المشغل والمالك لديهم:

</div>

```text
Manual Override
```

<div dir="rtl" align="right">

لكن بشروط:

- يجب إدخال سبب.
- يتم تسجيل العملية في audit log.
- يتم إنشاء access event.

---

## ١٠. IoT

الأجهزة المطلوبة في المشروع:

- باب ذكي.
- عداد كهرباء.
- حساس جودة الهواء.

في النسخة الأولى أمام اللجنة سنستخدم:

</div>

```text
MOCK_IOT
```

<div dir="rtl" align="right">

يعني لا نحتاج جهاز فعلي في البداية.

النظام سيولد بيانات واقعية وهمية.

مثال بيانات جودة الهواء:

- CO2.
- PM2.5.
- درجة الحرارة.
- الرطوبة.

مثال بيانات الكهرباء:

- استهلاك kWh.
- الجهد.
- القدرة الحالية.
- تكلفة تقديرية.

مثال حالة الباب:

- مغلق.
- مفتوح.
- فشل في الاستجابة.
- تم الفتح يدويًا.

---

## ١١. MQTT لاحقًا

كل الباكند سيبقى Supabase.

لكن إذا استخدمنا MQTT لاحقًا، لا نجعل Supabase Edge Function تعمل كمستمع دائم.

السبب:

Supabase Edge Functions مناسبة لطلبات قصيرة:

</div>

```text
Request -> Execute -> Response
```

<div dir="rtl" align="right">

وليست مناسبة كـ MQTT listener يعمل دائمًا.

الحل الصحيح لاحقًا:

</div>

```text
IoT Device
-> EMQX MQTT Broker
-> HTTP Webhook
-> Supabase Edge Function
-> PostgreSQL
```

<div dir="rtl" align="right">

بمعنى:

- الجهاز يرسل الرسالة إلى EMQX.
- EMQX يستقبل MQTT.
- EMQX يرسل HTTP request إلى Supabase Edge Function.
- Edge Function تحفظ البيانات في PostgreSQL.

أما عند إرسال أمر فتح الباب:

</div>

```text
Supabase Edge Function
-> EMQX HTTP API
-> Smart Door
```

<div dir="rtl" align="right">

إذن القرار:

- الآن نستخدم MOCK_IOT.
- لاحقًا يمكن ربط EMQX.
- الباكند يبقى Supabase.

---

## ١٢. مدد السماح

القيم المعتمدة:

| الحالة | المدة |
|---|---:|
| السماح بالدخول قبل بداية الحجز | ١٠ دقائق |
| السماح بالخروج بعد نهاية الحجز | ٥ دقائق |
| تحذير تأخر الوصول | بعد ١٥ دقيقة |
| اعتبار المستخدم لم يحضر | بعد ٣٠ دقيقة |
| تحرير المكتب نهائيًا | بعد ٦٠ دقيقة |
| بداية حالة تجاوز الوقت | بعد ٥ دقائق من نهاية الحجز |
| تنبيه المشغل عن تجاوز الوقت | بعد ٣٠ دقيقة من نهاية الحجز |

---

## ١٣. الجداول الأساسية

الجداول المطلوبة:

</div>

```text
profiles
offices
operator_offices
office_availability_rules
bookings
booking_status_transitions
payments
webhook_events
qr_tokens
iot_devices
access_events
telemetry_events
device_state_snapshots
jobs
audit_log
outbox_events
notifications
incidents
```

<div dir="rtl" align="right">

---

## ١٤. جدول profiles

يمثل بيانات المستخدم المرتبطة بـ Supabase Auth.

الحقول:

</div>

```text
id
email
full_name
role
is_active
created_at
updated_at
deleted_at
```

<div dir="rtl" align="right">

---

## ١٥. جدول offices

يمثل المكاتب التي يمكن حجزها.

الحقول:

</div>

```text
id
owner_id
name
description
building
floor
room
capacity
hourly_rate_cents
currency
is_active
created_at
updated_at
deleted_at
```

<div dir="rtl" align="right">

ملاحظة:

لا نحتاج حقل `requires_approval` لأن كل الحجوزات تحتاج موافقة دائمًا.

---

## ١٦. جدول bookings

يمثل الحجز.

الحقول:

</div>

```text
id
user_id
office_id
status
start_time
end_time
amount_cents
currency
idempotency_key
degraded_mode
checked_in_at
checked_out_at
created_at
updated_at
deleted_at
```

<div dir="rtl" align="right">

قواعد مهمة:

- `start_time` و `end_time` من نوع timestamptz.
- كل الأوقات UTC.
- لا يوجد hard delete.
- تداخل الحجوزات ممنوع بواسطة قاعدة البيانات.

---

## ١٧. جدول payments

يمثل حالة الدفع.

في نسخة اللجنة:

</div>

```text
gateway = MOCK
```

<div dir="rtl" align="right">

الحقول:

</div>

```text
id
booking_id
gateway
gateway_payment_id
status
amount_cents
currency
paid_at
refunded_at
metadata
created_at
updated_at
```

<div dir="rtl" align="right">

---

## ١٨. جدول webhook_events

حتى في الدفع الوهمي سنستخدم هذا الجدول.

الهدف:

- منع تكرار نفس حدث الدفع.
- إثبات أن النظام idempotent.
- تسهيل استبدال الدفع الوهمي بدفع حقيقي لاحقًا.

الحقول:

</div>

```text
id
gateway
event_id
event_type
event_created_at
payload
signature_verified
received_at
processed_at
processing_error
```

<div dir="rtl" align="right">

---

## ١٩. جدول qr_tokens

يمثل رموز الدخول.

الحقول:

</div>

```text
id
booking_id
jti
token_hash
expires_at
used_at
revoked_at
created_at
```

<div dir="rtl" align="right">

ملاحظة:

لأن QR قابل للاستخدام أكثر من مرة خلال مدة الحجز، فإن `used_at` لا يعني إلغاء الرمز.  
بل يعني آخر استخدام أو أول استخدام حسب قرار التنفيذ.

الأفضل:

- نسجل كل scan في `access_events`.
- نترك QR فعالًا حتى نهاية مدة الحجز أو الإلغاء.

---

## ٢٠. جدول iot_devices

الأجهزة المعتمدة:

</div>

```text
SMART_LOCK
AIR_QUALITY_SENSOR
ELECTRICITY_METER
```

<div dir="rtl" align="right">

الحقول:

</div>

```text
id
office_id
device_key
device_type
name
status
firmware_version
last_seen_at
created_at
updated_at
deleted_at
```

<div dir="rtl" align="right">

---

## ٢١. جدول access_events

يسجل كل محاولة دخول أو فتح باب.

الحقول:

</div>

```text
id
booking_id
device_id
actor_id
command_id
status
attempt
reason
requested_at
acknowledged_at
metadata
```

<div dir="rtl" align="right">

أمثلة للحالات:

</div>

```text
PENDING_ACK
ACKED
FAILED_NO_ACK
DENIED
MANUAL_OVERRIDE
REVOKED
```

<div dir="rtl" align="right">

---

## ٢٢. جدول telemetry_events

يسجل بيانات الكهرباء والهواء.

أمثلة:

- قراءة جودة الهواء.
- قراءة استهلاك الكهرباء.
- حالة جهاز.

الحقول:

</div>

```text
id
device_id
event_type
payload
observed_at
received_at
```

<div dir="rtl" align="right">

---

## ٢٣. جدول jobs

يمثل المهام المؤجلة.

لا نستخدم Redis أو BullMQ.

نستخدم:

</div>

```text
jobs table + pg_cron
```

<div dir="rtl" align="right">

أنواع jobs:

</div>

```text
EXPIRE_BOOKING
PAYMENT_RECONCILIATION
NO_SHOW_SCAN
OVERSTAY_SCAN
DEVICE_OFFLINE_SCAN
IOT_UNLOCK_RETRY
SEND_NOTIFICATION
```

<div dir="rtl" align="right">

---

## ٢٤. Audit Logging

أي تغيير مهم يجب أن يتم تسجيله.

الجداول التي عليها audit:

</div>

```text
profiles
offices
bookings
payments
webhook_events
iot_devices
access_events
jobs
qr_tokens
```

<div dir="rtl" align="right">

كل سجل audit يحتوي:

</div>

```text
actor_id
actor_type
entity_type
entity_id
action
before_state
after_state
metadata
occurred_at
```

<div dir="rtl" align="right">

لا يسمح بتعديل أو حذف audit log.

---

## ٢٥. RLS

يجب تفعيل Row Level Security على الجداول المهمة.

قواعد عامة:

- المستخدم يرى بياناته فقط.
- المالك يرى مكاتبه وحجوزات مكاتبه.
- المشغل يرى المكاتب المعيّن عليها.
- المدير يرى كل شيء.
- العمليات الحساسة تتم عبر RPC وليس تحديث مباشر للجداول.

---

## ٢٦. RPC المطلوبة

الدوال المطلوبة في PostgreSQL:

</div>

```text
create_booking_v1
approve_booking_v1
reject_booking_v1
cancel_booking_v1
create_mock_payment_session_v1
confirm_mock_payment_v1
generate_qr_token_v1
verify_qr_and_create_access_event_v1
mock_unlock_door_v1
mock_generate_telemetry_v1
record_mqtt_ack_v1
dispatch_due_jobs
```

<div dir="rtl" align="right">

---

## ٢٧. Edge Functions المطلوبة

الدوال المطلوبة في Supabase Edge Functions:

</div>

```text
GET  /auth/profile
POST /bookings
POST /bookings/:id/approve
POST /bookings/:id/reject
POST /bookings/:id/cancel
POST /payments/mock/create-session
POST /payments/mock/confirm
POST /qr/generate
POST /qr/verify
POST /iot/mock/door/unlock
POST /iot/mock/telemetry
POST /devices/mqtt-ack
```

<div dir="rtl" align="right">

ملاحظة:

`/devices/mqtt-ack` ليس مطلوبًا في النسخة الأولى إذا كان IoT وهميًا بالكامل.  
لكنه يبقى موجودًا في التصميم حتى نضيف MQTT لاحقًا.

---

## ٢٨. Realtime

Supabase Realtime يستخدم لتحديث الواجهة.

الأحداث المهمة:

</div>

```text
booking.created
booking.approved
booking.rejected
booking.confirmed
booking.cancelled
payment.succeeded
access.unlock_requested
access.unlock_acknowledged
device.telemetry_received
device.offline
incident.created
```

<div dir="rtl" align="right">

Realtime ليس مصدر الحقيقة.  
مصدر الحقيقة هو PostgreSQL.

---

## ٢٩. الاختبارات المطلوبة

اختبارات قاعدة البيانات:

- حجزان متداخلان لنفس المكتب: واحد فقط ينجح.
- حجزان متتاليان بدون تداخل: كلاهما ينجح.
- تغيير حالة غير مسموح: يفشل.
- تغيير حالة مسموح: ينجح.
- audit log يتم إنشاؤه.
- RLS يمنع الوصول غير المصرح.

اختبارات الدفع:

- إنشاء جلسة دفع وهمية.
- تأكيد الدفع الوهمي.
- منع تكرار نفس event.
- تحويل الحجز إلى confirmed بعد الدفع.

اختبارات QR:

- توليد QR لحجز مؤكد.
- رفض QR لحجز غير مؤكد.
- رفض QR خارج الوقت.
- تسجيل كل scan في access_events.

اختبارات IoT:

- فتح باب وهمي ناجح.
- فشل فتح الباب.
- توليد بيانات كهرباء.
- توليد بيانات جودة هواء.
- تحديث realtime.

---

## ٣٠. ترتيب التنفيذ

الترتيب الصحيح للتكويد:

1. إنشاء enums.
2. إنشاء الجداول.
3. إنشاء constraints.
4. إنشاء state machine table.
5. إنشاء triggers.
6. إنشاء audit logging.
7. إنشاء RLS policies.
8. إنشاء RPC الخاصة بالحجز.
9. إنشاء RPC الخاصة بالدفع الوهمي.
10. إنشاء RPC الخاصة بـ QR.
11. إنشاء RPC الخاصة بـ Mock IoT.
12. إنشاء jobs dispatcher.
13. إنشاء Edge Functions.
14. ربط Supabase Realtime.
15. اختبار النظام كاملًا.

---

## ٣١. القرار النهائي المختصر

- الباكند كله Supabase.
- لا يوجد Node backend مستقل.
- لا يوجد Redis.
- لا يوجد Prisma.
- لا يوجد BullMQ.
- كل حجز يحتاج موافقة مالك أو مشغل.
- لا يوجد حجز فوري.
- الدفع وهمي أمام اللجنة.
- QR قابل للاستخدام خلال مدة الحجز.
- فتح الباب عبر QR أو زر داخل التطبيق.
- IoT وهمي أولًا للباب والكهرباء والهواء.
- MQTT لاحقًا عبر EMQX Webhook إلى Supabase.
- PostgreSQL هو مصدر الحقيقة.
- كل العمليات المهمة مسجلة في audit log.

</div>
