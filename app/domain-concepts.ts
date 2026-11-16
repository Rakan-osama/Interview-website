import type {Concept} from './concepts';
export const domainConcepts:Concept[] = [
  {
    "id": "booking-holds",
    "title": "Booking Holds وExpiry من غير Overselling",
    "group": "Booking",
    "simple": "عرض متاح مش وعد بالحجز. Hold معناها إنك حجزت سعة مؤقتًا لعملية معينة لحد وقت محدد. Confirmation محتاجة hold صالحة وقرار دفع موثوق، والإلغاء أو انتهاء المدة لازم يرجّع السعة مرة واحدة.",
    "scenario": "آخر مقعد، وعميلان فتحوا الصفحة مع بعض: الاتنين ممكن يشوفوا available، لكن واحدة بس تنجح في إنشاء hold. الدفع المتأخر ما يحجزش مقعد اتخصص بالفعل لحد تاني.",
    "intro": "افصل inventory availability وreservation وpayment كـstate machines مرتبطة، لأن كل واحدة لها عمر ومصدر حقيقة. العداد أو row الخاصة بالسعة هي نقطة تنسيق وقت الكتابة؛ cache والواجهة استرشاديين فقط.",
    "how": "احجز السعة ودوّن hold atomically في transaction قصيرة. خزّن expires_at وowner/quantity وoperation key. عند التأكيد أو التحرير، اقفل نفس records بترتيب ثابت وتحقق من current state والوقت؛ expiry worker والـcallback يتنافسوا على transition واحدة. التأخير في worker مش تصريح لاستخدام hold منتهية.",
    "when": "مناسب لمقاعد وتذاكر أو كمية محدودة. Appointment time ranges تحتاج overlap protection مختلفة، وbooking لأكثر من مورد تحتاج all-or-nothing reservation أو compensation صريحة.",
    "code": "BEGIN\n  claim operation key for this user + payload\n  lock capacity row\n  if available < quantity: reject\n  decrement available; insert hold(status=held, expires_at, owner)\nCOMMIT\nconfirm/release: lock same boundary, compare state+expiry, apply once\nNever hold the DB lock while waiting for a payment provider.",
    "walkthrough": [
      "لو transaction فشلت، السعة والـhold ما يثبتوش منفصلين. unique operation key تمنع retry من حجز كمية إضافية.",
      "انتهاء الوقت معناه transition policy، مش حذف record. احتفظ بالـhold القديمة عشان تربط بيها أي payment متأخرة وتتابع التعويض."
    ],
    "trap": "Redis TTL لوحدها مش booking correctness، وunique على resource_id تمنع كل الحجوزات المستقبلية بدل منع التداخل المحدد.",
    "check": "لو payment نجاح وصلت بعد expiry وعميل B حجز المقعد، هتعمل إيه بالفلوس وبالحجز؟"
  },
  {
    "id": "booking-overlap",
    "title": "Appointment Ranges، Timezones وRescheduling",
    "group": "Booking",
    "simple": "حجز موعد مش مجرد count. لازم تمنع فترتين متداخلتين لنفس المورد، وتحدد هل النهاية داخلة في الفترة ولا لأ. الوقت المحلي والـDST والـbuffer بين المواعيد جزء من المعنى.",
    "scenario": "موعد من 10 لـ11 وبعده من 11 لـ12 ممكن يبقوا مسموحين بـhalf-open ranges، لكن لو فيه cleanup buffer عشر دقايق لازم الحماية تشملها.",
    "intro": "استخدم interval [start,end) بعقد واضحة، واحتفظ بالـbusiness timezone مع instants المناسبة. شرط التداخل المعتاد هو existing.start < new.end وexisting.end > new.start. SELECT مش لاقية overlap ثم INSERT منفصلة لسه تسمح لطلبين يمروا.",
    "how": "اختَر engine-supported exclusion constraint للـactive ranges، أو serialize على resource/calendar row موثوقة مع query داخل transaction، أو slots preallocated لو domain تسمح. Reschedule لازم تحافظ على القديم لحد ما الجديد يثبت atomically أو workflow معلنة؛ current timestamp في partial index مش policy تلقائية للـexpiry.",
    "when": "مناسب لطبيب أو غرفة أو rental window. تأكد من resource capacity: منع أي overlap مناسب لمورد سعته واحد، مش مساحة بتستحمل خمس حجوزات.",
    "code": "Overlap for half-open intervals:\n  existing.start < requested.end AND existing.end > requested.start\nPortable coordination sketch:\nBEGIN -> lock resource row -> check protected active overlaps\n      -> create/move reservation -> COMMIT\nPostgreSQL can enforce suitable range exclusion rules;\nother engines need their own verified strategy.",
    "walkthrough": [
      "Lock على صف مورد موجود يحدد contested boundary؛ lock على empty overlap query وحدها قد لا تمنع phantom inserts حسب المحرك والعزل.",
      "تغيير الموعد يحمل version/operation key، ويتحقق من ownership والـcancel policy بدل delete القديم ثم محاولة إنشاء جديد خارج transaction."
    ],
    "trap": "تخزين وقت محلي من غير timezone/policy ممكن يعمل موعدين غامضين عند DST أو يغيّر أوقات العرض عند تغيير السيرفر.",
    "check": "إزاي تختبر adjacent intervals وbuffer وDST وreschedule متزامنة لنفس booking؟"
  },
  {
    "id": "payment-lifecycle",
    "title": "Payment Attempt، Authorization، Capture وSettlement",
    "group": "Payments",
    "simple": "Order تمثل اللي العميل اشتراه؛ payment attempt تمثل محاولة دفع. Authorization وcapture وsettlement مش نفس الحدث، وحالة تحتاج إجراء من العميل أو processing مش فشل نهائي.",
    "scenario": "عميل اشترى بـ100: issuer وافق على hold لكن capture لسه محصلتش. ما تعتبرش كل approved أو redirect success إثبات إن الفلوس متاحة للتاجر أو إن order اتنفذت.",
    "intro": "اعمل local business operation ومعاها attempts/provider references ومبلغ وعملة ثابتين. الحالة المحلية لازم تترجم معاني provider الفعلية من غير افتراض إن كل وسيلة دفع فورية أو لها نفس transitions.",
    "how": "كوّن attempt persisted قبل الاتصال، استخدم server-authoritative amount وsame idempotency key عند safe retry، وخزن unknown عند انقطاع لا يحسم النتيجة. Verified webhook أو reconciliation يثبتوا transition ويعملوا fulfillment business-once. Authorization expiry وcapture/refund support يختلفوا حسب provider/method.",
    "when": "مناسب للـcheckout والدفع للحجز. استخدم hosted/tokenized provider collection بحسب integration المختارة، وافصل أسرار السيرفر عن client-safe identifiers؛ بيانات البطاقة الحساسة لا تدخل logs أو storage عشوائية.",
    "code": "order: awaiting_payment -> paid -> fulfillment...\npayment operation: created -> action_required/processing/unknown\n                  -> captured or failed/cancelled\nattempts: provider_reference + request identity + outcome\ncapture evidence != settlement report\nredirect page -> display/poll status, never create financial truth",
    "walkthrough": [
      "الفشل المحلي بسبب network مش رفض من provider؛ المرجع والمفتاح يساعدوا في الوصول لنفس العملية بدل إنشاء واحدة جديدة.",
      "بعد confirmation، fulfillment تتربط بـorder/payment business identity عشان event مختلفة لنفس النجاح ما تعملش shipment مرتين."
    ],
    "trap": "حالة provider جديدة أو payment method async محتاجة mapping وtests، مش switch default يرجع success.",
    "check": "لو callback ظهرت قبل ما response ترجع من create payment، إزاي توصلها للـoperation الصحيحة من غير lost event؟"
  },
  {
    "id": "webhook-inbox",
    "title": "Webhook Inbox، Verification وBusiness Deduplication",
    "group": "Payments",
    "simple": "Webhook رسالة قد تتكرر أو تتأخر أو تتغير طريقة عرض payload حسب API version. استقبلها كinput غير موثوق، وثبّت receipt بشكل durable قبل اعتبارها مستلمة؛ تنفيذ الأثر له dedup أوسع من event ID فقط.",
    "scenario": "Provider بعت نفس event ثلاث مرات، أو eventين مختلفين يصفوا نفس captured payment. الأولى تحتاج receipt dedup، والتانية تحتاج transition/fulfillment identity تمنع نفس الأثر.",
    "intro": "Inbox table تحفظ provider/event key وoperation reference وprocessing state والحد الأدنى من البيانات الآمنة. Verify signature على bytes/format الصحيحين حسب provider، افحص account/currency/amount وربط الـresource، ثم ack بعد durable acceptance المناسبة.",
    "how": "عالج event داخل worker: احجز inbox work، اقرأ current state، طبّق allowed transition وoutbox intent atomically، وسجل النتيجة. Version checks أو provider retrieve تساعد في stale/out-of-order events. Queue down بعد inbox commit تعالجه publisher/sweeper؛ async queue بعد 2xx بلا durability ممكن تفقد event.",
    "when": "مناسب لكل incoming integration event. راقب oldest unprocessed age وfailure/quarantine وreplay version. Event ID uniqueness مش authorization ولا حماية من missing events.",
    "code": "verify raw body + signature -> durable inbox insert UNIQUE(provider,event_id)\n -> acknowledge receipt\nworker transaction:\n  lock inbox + business operation\n  validate mapping/state; apply business transition once\n  persist outbox/work intent; mark processed\nreplay -> same event/business identities, not fresh effects",
    "walkthrough": [
      "الـ2xx بتعني قبول موثوق حسب contract، مش إن كل side effects لازم تخلص في نفس request.",
      "لو crash حصلت بين inbox وqueue dispatch، تقدر تكتشف pending inbox وتعيد enqueue بدل انتظار provider بالصدفة."
    ],
    "trap": "الثقة في event name أو amount جاية من client، أو parsing يعيد encoding قبل التحقق، ممكن يكسر الأمان أو صحة المطابقة.",
    "check": "إزاي تمنع duplicate fulfillment لو اتنين provider events مختلفين يؤكدوا نفس payment؟"
  },
  {
    "id": "ledger-double-entry",
    "title": "Double-entry Ledger وAccount Normality",
    "group": "Wallet",
    "simple": "Ledger سجل منظم لحركات لها أطراف ومعنى، مش history نصي لتغييرات balance. Double-entry بتطلب إن مجموع debit يساوي credit داخل journal متوازنة لنفس العملة/سياسة التحويل. Debit مش معناها ناقص لكل الحسابات.",
    "scenario": "تمويل 100: Debit لحساب أصل cash/receivable وCredit لالتزام wallet A. تحويل 30 من A لـB: Debit لالتزام A وCredit لالتزام B؛ مفيش cash جديدة دخلت النظام.",
    "intro": "نوع الحساب وnormal side بيحددوا اتجاه زيادة رصيده. في المثال educational، wallet العميل liability credit-normal: credit تزوده وdebit تقلله. Cash asset debit-normal بالعكس. الـbalance المعروضة projection من قيود صحيحة، مش مصدر الحقيقة الوحيد.",
    "how": "Journal لها business reference وcurrency وentries بأ amounts موجبة واتجاه صريح. Posting تتحقق من الاتزان وaccounts والـpermissions والقيود في boundary atomic، وتمنع duplicate journal لنفس الأثر. Posted entries لا تتعدل؛ correction تربط reversal/adjustment جديدة بالأصل.",
    "when": "مناسب للـwallet والـfees والـseller payable والمطابقة. Chart of accounts وrecognition وتوقيت القيود تتراجع مع خبرة المجال؛ المثال مش chart جاهزة لكل منتج أو بلد.",
    "code": "Funding, USD 100:\n  Dr CashAsset 100      Cr WalletA_Liability 100\nP2P transfer, USD 30:\n  Dr WalletA_Liability 30   Cr WalletB_Liability 30\nEach journal: sum(debits) = sum(credits) per currency.\nNormality determines each account balance; do not use universal +/- rules.",
    "walkthrough": [
      "التحويل الداخلي قلل التزام الشركة تجاه A وزاد التزامها تجاه B؛ إجمالي customer liabilities وcash في المثال لم يتغيرا.",
      "اتزان القيود شرط محاسبي أساسي لكنه لا يمنع double-spend وحده؛ availability/concurrency وbusiness uniqueness checks لازمة كمان."
    ],
    "trap": "balanced journal ممكن تكون على حساب غلط أو مبلغ غلط؛ الاتزان لا يثبت صحة الغرض ولا توفر الأموال.",
    "check": "لو A رصيده 100 وعليه hold 60، هل journal تحويل 80 المتوازنة يجب أن تمر؟ وليه؟"
  },
  {
    "id": "wallet-balances",
    "title": "Posted، Available، Pending وHolds",
    "group": "Wallet",
    "simple": "الفلوس المسجلة ليست دائمًا كلها قابلة للصرف. Hold تمنع إنك تعد نفس المبلغ متاح لعملية تانية، وpending incoming ما ينفعش تدخل spending لمجرد إنها متوقعة. عرّف المعاني للمنتج صراحة.",
    "scenario": "Posted=100 وعليه active hold=60: available=40 في model المثال. تحويل 30 يترك posted=70 وhold=60 وavailable=10؛ الطلب التالي لصرف 30 يترفض.",
    "intro": "ممكن الحسابات تعرض posted/pending/available بصيغ مختلفة حسب ledger/provider؛ لا تفترض أسماء fields تعني نفس المعادلة عند الجميع. هنا holds مستقلة، وغير المسموح بالسحب لا يدخل available. projection/read cache لا تحسم critical spending decision.",
    "how": "إنشاء hold أو استهلاكها أو تحريرها يحصل atomically مع boundary الحساب والـposting المرتبطة. عند capture hold، لا تخصم المبلغ مرتين: اعمل journal المطلوبة وأزل encumbrance في نفس المعاملة. Expiry وتكرار release يستعملوا state/version identity.",
    "when": "مفيد لشراء أو سحب pending أو حجز مبلغ authorization. Account freezing والـlimits والـrisk reserves قد تضيف مكونات أخرى، لذلك اعرض formula موثقة واختبرها.",
    "code": "Educational balance model:\nposted(A)=100; active_holds(A)=60; available(A)=40\ntransfer 30 -> posted=70, holds=60, available=10\ncapture held 60 -> posted=10, holds=0, available=10\nrelease held 60 before capture -> posted unchanged, available increases\nNever decrement posted for BOTH hold creation and later capture.",
    "walkthrough": [
      "الـhold بتقلّل spending capacity من غير أن تؤكد خروج cash، وده مختلف عن journal posted نهائية.",
      "الـavailable اللي تستخدمها للتصرف لازم تتحدد وتتحقق داخل synchronization strategy، مش get من replica متأخرة ثم write."
    ],
    "trap": "إعادة إضافة مبلغ hold عند release مع إنك لم تخصمه من posted أصلًا ممكن تخلق رصيد وهمي.",
    "check": "إزاي تصمم state تمنع capture وrelease يتنفذوا معًا على نفس hold؟"
  },
  {
    "id": "ledger-posting",
    "title": "Atomic Posting، Balance Guards وImmutable Corrections",
    "group": "Wallet",
    "simple": "Posting خدمة مسؤولة عن قبول journal كاملة وحماية قواعدها كعملية واحدة. ما تسمحش لأي controller يضيف ledger entry أو يعدّل balance لوحده؛ جمع الصحة في write boundary واضحة.",
    "scenario": "تحويل 80 ورصيد A المتاح 100: طلبان يتنافسوا، أول واحدة تنجح والثانية تشوف current guarded state وترفض؛ journal ما تتكتبش نصفها ولا يتغيّر الرصيد من غير القيود.",
    "intro": "احمِ entries المتوازنة والعملات وaccount status وbusiness reference وavailable constraints في transaction مناسبة. اقفل accounts بترتيب ثابت أو استخدم conditional/version guards مثبتة على engine، مع bounded whole-transaction retry للـdeadlock. أي balances materialized تتحدث مع journal أو لها consistency design لا تُستخدم stale للصرف.",
    "how": "بعد commit، ارجع posting reference ثابتة. Retry بنفس intent تعيد نفس outcome، وreversal لها identity مستقلة وlink للأصل وحدود cumulative. امنع تعديل posted entries، وسجل maker/checker وأسباب adjustments ذات الأثر.",
    "when": "مناسب للـledger core؛ لو ledger خارجية، local order state مش معاها transaction واحدة: استخدم durable workflow وprovider guarantees/reconciliation بدل ادعاء atomicity موزعة.",
    "code": "post(intent):\n  begin; claim UNIQUE(operation_kind, business_reference)\n  lock all account guard rows in stable account-id order\n  verify currency, account status, balanced entries and availability\n  insert journal+entries; update guarded projections; write outbox\n  commit; return stable journal reference\nNo external network call inside these account locks.",
    "walkthrough": [
      "قفل balance guard row للـaccount مهم حتى لو ledger entries هتتضاف لأول مرة؛ query على entries غير موجودة مش boundary كافية دائمًا.",
      "مفتاح الـposting لازم يطابق الأثر business، مش UUID جديدة من كل worker تعيد نفس الأثر."
    ],
    "trap": "اختبار SQLite أو تنفيذ reducer في browser لا يثبت DB concurrency؛ لازم concurrent tests على engine المستهدفة.",
    "check": "لو local transaction نجحت والـresponse ضاعت، إزاي client تعرف journal السابقة بدل إنشاء تحويل جديد؟"
  },
  {
    "id": "wallet-transfer",
    "title": "P2P Transfer، Lock Ordering وReversals",
    "group": "Wallet",
    "simple": "التحويل بين محافظ داخل نفس ledger تغيير ملكية التزام، مش bank transfer ولا cash جديدة. لازم تحدد sender وrecipient والعملة والرسوم والحدود والـidempotency قبل كتابة قيد.",
    "scenario": "A يحوّل 30 لـB. اتنين taps أو retries من نفس العملية ما تعملش 60؛ وتحويل A→B مع B→A في نفس الوقت ما يسببش deadlock غير متعامل معاه.",
    "intro": "Authenticate sender، authorize wallet، افحص recipient status وsame-currency policy ومنع self-transfer حسب المنتج. ثبّت amount/fee quote وoperation identity. Journal تنفّذ atomic مع balance guard وكل accounts المطلوبة، مستخدمة lock order مستقل عن اتجاه التحويل.",
    "how": "Reversal مش delete الأصل: سجل operation جديدة تشير له، وتحدد هل الأموال لسه متاحة أو محتاجة receivable/risk workflow. الرسوم وقابلية الرجوع وحالة recipient تُحسم في policy، مش refund balance عشوائيًا.",
    "when": "مناسب closed-loop wallet transfers؛ cross-currency أو cross-ledger أو bank rails تحتاج legs/FX/reconciliation workflow أوسع.",
    "code": "transfer(A,B,30):\n  authorize A; validate B; claim stable transfer key + fingerprint\n  lock sort([A,B,fee_account]); check current available(A)\n  Dr WalletA 30  / Cr WalletB 30   (+ explicit fee entries if any)\n  persist transfer+journal+outbox atomically\nreversal: separate linked business operation, never overwrite this journal",
    "walkthrough": [
      "ترتيب IDs ثابت يقلل دورة locks في تحويلات عكسية؛ الـdeadlock retry لسه محتمل ويتصمم بأمان.",
      "A→B internal transfer نجاحها local journal commit في model واحد؛ bank payout مختلفة وليها unknown external outcome."
    ],
    "trap": "ثقة sender في client wallet_id أو السماح بالمبلغ من غير currency/limits checks يفتح access وفقد أموال.",
    "check": "لو B صرفت المبلغ قبل reversal request، إيه سياسة المنتج بدل mint credit من غير counterpart صحيحة؟"
  },
  {
    "id": "payout-reconciliation",
    "title": "Payouts، Unknown Outcomes وReconciliation",
    "group": "Fintech",
    "simple": "خروج الفلوس للبنك مش زي تحويل داخلي. قاعدة بياناتك والبنك مش بيعملوا commit واحدة، فممكن تبعت الطلب وتضيع الإجابة رغم إن البنك نفذه.",
    "scenario": "سحب 80 من wallet: حوّل الالتزام من Wallet Liability إلى Payout Payable، وابعت للبنك خارج transaction. لو timeout خليه unknown؛ متردش الـ80 تلقائيًا وتعمل payout تاني.",
    "intro": "Payout عملية طويلة لها business ID ثابت، external reference، حالات تشغيل وحالات مالية منفصلة. Reconciliation مقارنة سجلاتك بتقارير الطرف الخارجي لكشف النقص والزيادة والاختلاف، مش مجرد إعادة إرسال الطلب.",
    "how": "في نموذجنا بنحجز المبلغ ثم نعيد تصنيفه إلى payout payable عند قبول السحب. عند تأكيد التسوية نسجل Dr PayoutPayable / Cr CashAsset. failure مؤكدة قبل التسوية تسمح بقيد عكسي إلى wallet؛ timeout وحده لا يثبت الفشل. Bank return لاحقة عملية مستقلة.",
    "when": "تحتاجه في withdrawals، seller payouts، bank transfers وأي external payment بتمر بين نظامين مستقلين. حدد مصدر التقارير والـcutoff والـtimezone وطريقة تتبع المبالغ والرسوم قبل الإطلاق.",
    "code": "request -> reserved -> submitted -> unknown | processing\nconfirmed settlement: Dr PayoutPayable / Cr CashAsset\nconfirmed failure: Dr PayoutPayable / Cr WalletLiability\nunknown: query by SAME external reference; reconcile; no blind restore",
    "walkthrough": [
      "سجّل instruction محليًا قبل الإرسال، وخلي worker يعيد نفس العملية بالمفتاح المتفق عليه مع provider.",
      "Job دورية تلتقط العمليات المتأخرة وتطابق amount/currency/status/fees مع statement؛ exceptions تدخل queue للمراجعة بصلاحيات وأثر تدقيق."
    ],
    "trap": "نجاح HTTP أو قبول instruction مش دليل وصول الأموال، وغياب webhook مش دليل إن التحويل فشل.",
    "check": "Bank نفذ withdrawal لكن response ضاع. إيه اللي يمنع رد الرصيد ثم تكرار الصرف؟"
  },
  {
    "id": "topup-chargeback",
    "title": "Wallet Top-up وChargeback بعد الصرف",
    "group": "Fintech",
    "simple": "الـtop-up تمويل wallet من مصدر خارجي؛ لازم تفرق بين طلب الدفع وبين رصيد تسمح للعميل يصرفه. حتى payment ناجحة ممكن تتعمل عليها dispute لاحقًا.",
    "scenario": "عميل شحن 100 وصرفها كلها. بعد أسبوع حصل chargeback؛ مش صح تمسح قيد الشحن القديم ولا تخصم من عميل تاني عشان الحساب يظبط.",
    "intro": "اربط payment operation بعملية funding واحدة وبقيد ledger واحد. Pending funding ليست available تلقائيًا. سياسة إتاحة الأموال تعتمد على نوع المصدر وsettlement/fraud risk؛ ده قرار منتج ومخاطر موثق.",
    "how": "بعد تأكيد حدث موثوق، سجّل زيادة asset/receivable مناسب وزيادة wallet liability. عند settlement انقل receivable إلى cash وسجل الرسوم. لو chargeback وقعت بعد الإنفاق، تحتاج معالجة loss/receivable أو frozen/negative position حسب السياسة والصلاحيات، مع إبقاء التاريخ القديم.",
    "when": "استخدمه في card-funded wallets، refunds إلى wallet، bank top-ups وcredit adjustments. اسأل عن المصدر، التوقيت، الحدود، reversal policy والـproof المطلوب قبل فتح الرصيد.",
    "code": "funding_requested -> provider_processing -> credited -> settled\nUNIQUE(funding_operation_id, posting_type)\nchargeback -> separate case + linked correction journal\nnever DELETE original funding entries",
    "walkthrough": [
      "الـwebhook يثبت هوية المصدر والمبلغ والعملة وحساب المستفيد قبل credit. Duplicate success لا يعمل credit إضافية.",
      "KYC/AML، limits وrisk approvals متطلبات تتفق مع مزود الخدمة المختص؛ الكود وحده لا يحدد سياسة المخاطر."
    ],
    "trap": "Payment succeeded لا تعني أن الأموال غير قابلة للاسترجاع، وإتاحة الرصيد فورًا من غير سياسة قد تخلق exposure.",
    "check": "هتعرض إيه للمستخدم وإيه للعمليات لو funding disputed بعد صرف الرصيد؟"
  },
  {
    "id": "pricing-snapshot",
    "title": "Pricing Snapshot، Money وRounding",
    "group": "Commerce",
    "simple": "الـcart اقتراح قابل للتغيير؛ الـorder التزام بسعر محسوب من السيرفر ومحفوظ لحظة الشراء، مش رقم جاي من المتصفح.",
    "scenario": "منتج 100، خصم 10، شحن 20: payable 110. لو السعر بقى 120 بكرة، فاتورة الأوردر القديم تفضل 110 وتعرف سبب كل قرش.",
    "intro": "Pricing snapshot يحتوي item quantity، unit price، allocated discount، tax، shipping، currency، rounding ونسخة القواعد المطبقة. احتفظ بالمكونات بحيث refunds والتقارير تعيد تفسير القرار من غير الرجوع للسعر الحالي.",
    "how": "تحقق من صلاحية quote، أعد حساب totals على server، وثبت version عند قبول order. استخدم integer minor units لعملة واحدة إذا نموذج العمل يسمح؛ العملات تختلف في عدد المنازل. FX والضرائب وحساب النسب تحتاج precision وسياسة rounding صريحة قبل التحويل لقيمة قابلة للدفع.",
    "when": "عند checkout، invoices، subscriptions، marketplace fees وأي amount يؤثر على ledger. لا تستخدم float لإجماليات الفلوس ولا تقبل total أرسله العميل.",
    "code": "order_total = sum(line_net_minor + line_tax_minor)\n            + shipping_minor + shipping_tax_minor\nquote: {currency, expires_at, pricing_version, lines, total}\nassert charged_amount == accepted_order_snapshot.total",
    "walkthrough": [
      "وزع order discount على الأسطر بقاعدة deterministic؛ remainder البسيط يتوزع بترتيب ثابت عشان مجموع الأسطر يساوي الإجمالي.",
      "لو السعر اتغير قبل التأكيد، اعرض quote جديدة وخلي العميل يقبلها؛ متزودش المبلغ في الخفاء."
    ],
    "trap": "ضرب مبلغ float في 100 آخر خطوة لا يصلح أخطاء التقريب اللي حصلت قبلها، و2 decimal مش قاعدة لكل العملات.",
    "check": "إزاي تعمل partial refund لسطر عليه جزء من coupon عام وضريبة وتقريب؟"
  },
  {
    "id": "inventory-reservation",
    "title": "Inventory Reservation وStock Movements",
    "group": "Commerce",
    "simple": "وجود المنتج في cart مش حجز. Reservation وعد مؤقت بكمية لعملية معينة، ولازم كل اللي بيتنافسوا على آخر قطعة يعدوا من نفس نقطة الحماية.",
    "scenario": "المخزن فيه قطعة واحدة، واتنين ضغطوا Buy. لازم واحد بس يمسك reservation؛ التاني يشوف unavailable حتى لو الاتنين قرأوا stock=1 قبل الدفع.",
    "intro": "فرق بين on-hand، reserved، available وallocated/shipped. التعريف يختلف حسب النظام؛ في نموذج بسيط available = on_hand - active_reserved. الحجز لا يعني خصم المخزون مرتين عند الشحن.",
    "how": "استخدم guarded update أو locks على stock row حسب SKU/location مع quantity > 0 وunique reservation reference. Release وconsume حالات مشروطة لا تتكرر. Expiry job وcheckout completion يشتركان في guard عشان ما يحرروش نفس الحجز وهو بيتحول allocation.",
    "when": "مهم في flash sales، multi-warehouse، bundles وحجوزات الخدمات ذات السعة المحدودة. مع عدة SKUs اقفل بترتيب ثابت وخطط لإلغاء الكل لو واحد غير متاح.",
    "code": "UPDATE stock SET reserved = reserved + :q\nWHERE sku=:sku AND location=:loc\n  AND on_hand - reserved >= :q;\nassert affected_rows == 1;\ninsert reservation(unique checkout_line_id, qty, expires_at, state);",
    "walkthrough": [
      "الـupdate والحجز في transaction واحدة؛ لو insert فشل، ترجع زيادة reserved تلقائيًا.",
      "Paid بعد انتهاء reservation ليست إذنًا ببيع كمية غير موجودة؛ طبق refund/re-reserve policy معلنة."
    ],
    "trap": "Cache stock تعرض للمستخدم بسرعة لكنها مش مصدر قرار البيع النهائي، وjob expiry وحدها مش guard.",
    "check": "لو checkout فيه 3 منتجات والتالت خلص، إزاي تمنع حجز أول اتنين للأبد؟"
  },
  {
    "id": "coupon-contention",
    "title": "Coupons، Usage Limits وConcurrent Redemption",
    "group": "Commerce",
    "simple": "الكوبون rule لها شروط وحد استخدام، مش مجرد string تخصم بيه مبلغ. آخر استخدام للكوبون ممكن يتنافس عليه أكتر من order.",
    "scenario": "كوبون لأول 100 طلب، usage=99. اتنين قرأوا العدد؛ check ثم increment من غير guard ممكن يطلعوا 101.",
    "intro": "افصل eligibility calculation عن redemption المحفوظ. حدد هل الحد لكل عميل ولا household ولا globally، وهل failed/cancelled orders تستهلك الاستخدام، وكيف ترد حق الاستخدام من غير abuse.",
    "how": "احجز redemption بعملية ذرية عند مرحلة موثقة، مع unique coupon+customer إذا once-per-customer، وconditional increment للحد العام. اربط reservation بorder، وأكدها أو حررها مرة واحدة. لقيمة الخصم استخدم قواعد server مع snapshot.",
    "when": "مهم للـvouchers، first-order offers، referral rewards وwallet promo credit؛ الرصيد الترويجي قد تكون له قيود منفصلة عن cash balance.",
    "code": "claim coupon usage slot atomically\nUNIQUE(coupon_id, customer_id) -- only if policy is once per customer\nredemption: reserved -> consumed | released\nprice snapshot records discount allocation per line",
    "walkthrough": [
      "السماح بكوبون في cart مش ضمان أن الاستخدام متاح وقت الدفع؛ أعد التحقق مع حجز واضح.",
      "لو order اتلغى، release يكون transition مش decrement عشوائي من webhook مكرر."
    ],
    "trap": "منع الضغط مرتين في UI لا يحمي limits، وحذف redemption القديمة يضيع audit ويعيد استخدام العرض.",
    "check": "آخر coupon اتعلق في order فشل دفعها؛ إمتى ترجعه وإزاي تمنع return مرتين؟"
  },
  {
    "id": "refund-allocation",
    "title": "Partial Refunds وRefundable Amount Guards",
    "group": "Commerce",
    "simple": "الـrefund لها lifecycle ومبلغ متاح للرد، وموافقتك على طلب رد مش معناها إن فلوس العميل وصلت.",
    "scenario": "Paid 100، اترد 30، وفي refund pending بـ50: المتاح لطلب جديد 20 في نموذج حجز المبلغ، مش 70.",
    "intro": "حدد captured amount، refunds succeeded، refunds pending/reserved، disputed amounts وسياسة التعامل معها. احفظ allocation لكل line وشحن وضريبة ورسوم؛ سياسات المنتج والمزود تحدد إيه قابل للرد.",
    "how": "اقفل refund budget أو استخدم guarded reservation، وclaim refund operation مستقرة داخل transaction. بعد commit ابعت provider request بنفس key. Pending/unknown تستمر محجوزة لحد نتيجة مؤكدة أو reconciliation؛ duplicate events لا تكرر قيد ولا restock.",
    "when": "مطلوب في returns، cancellation، overpayment، failed booking بعد late payment، وكذلك split marketplace orders.",
    "code": "refundable = captured - succeeded_refunds - reserved_refunds\nreserve refund only if requested <= refundable\nrequest -> pending | unknown -> succeeded | confirmed_failed\nconfirmed_failed releases reservation; timeout does not",
    "walkthrough": [
      "رجوع منتج للمخزن عملية مستقلة عن refund؛ افحص حالة السلعة قبل زيادة sellable stock.",
      "سجّل external refund reference وسبب القرار والفاعل؛ لو buyer طلب مرتين نفس الإجراء تعيد نفس العملية."
    ],
    "trap": "جمع succeeded فقط يتجاهل refunds قيد التنفيذ ويسمح بتجاوز المبلغ؛ webhook delivered لا تعني refund succeeded.",
    "check": "عاملان ضغطوا refund 60 لنفس payment 100 في نفس الوقت. إيه invariant اللي لازم يفضل صحيح؟"
  },
  {
    "id": "fulfillment-returns",
    "title": "Fulfillment، Returns وReverse Logistics",
    "group": "Commerce",
    "simple": "حالة الدفع وحالة الشحن وحالة الإرجاع مش نفس الحاجة. Order ممكن تبقى paid ونصها shipped ونصها cancelled.",
    "scenario": "طلب فيه 3 قطع اتشحن منهم اتنين. لما واحدة ترجع، محتاج تعرف أي line وكمية اتسلمت واتردت وهل صالحة للبيع، مش تحول order كلها refunded.",
    "intro": "استخدم line-level quantities ومراحل fulfillment: allocated، picking، shipped، delivered، return_requested، received، inspected. روابط shipment/items وreturn/items تمنع تجاوز الكميات وتدعم partial operations.",
    "how": "كل transition له owner وguard وproof. Confirmation من carrier تدخل inbox وتُربط shipment الصحيحة. Restock فقط بعد استلام وفحص حسب السياسة؛ refund decision ممكن يعتمد على inspection أو سياسة مبكرة بمخاطر محسوبة.",
    "when": "تحتاجه في physical ecommerce، multiple warehouses، split shipments وmarketplaces. افصل customer-visible status المبسط عن الحالات الداخلية التفصيلية.",
    "code": "returnable_qty = delivered_qty - already_returned_or_reserved_qty\nRMA request -> approved -> received -> inspected\ninspection -> restock_sellable | quarantine | write_off\nrefund workflow references RMA, not generic order flag",
    "walkthrough": [
      "اعمل unique fulfillment action/reference عشان retry worker ما يطبعش شحنتين أو يخصم stock مرتين.",
      "احتفظ بتاريخ الحركة؛ تصحيح scan خاطئة يكون action موثقة بدل تعديل مجهول في الكمية."
    ],
    "trap": "عمل restock بمجرد refund ناجحة يخلي سلعة لسه مع العميل متاحة للبيع، والـcancel ما ينفعش يلغي shipped items بنفس flow.",
    "check": "هتلغي آخر line قبل الشحن إزاي لو warehouse worker بدأ picking بالفعل؟"
  },
  {
    "id": "subscription-entitlement",
    "title": "Subscriptions، Invoices وEntitlements",
    "group": "Billing",
    "simple": "الاشتراك عقد متجدد؛ الـinvoice مطالبة لفترة، والـentitlement حق استخدام feature. دول مرتبطين لكن مش نفس record ولا نفس status.",
    "scenario": "عميل دفع يناير وفشل تجديد فبراير: ممكن تمنحه grace period 3 أيام، وبعدها توقف الميزات المدفوعة؛ مجرد فتح صفحة success مش يمدد الاشتراك.",
    "intro": "اعمل subscription periods وplan version وinvoices ومحاولات تحصيل. Entitlements تتولد من سياسة موثقة للأحداث الموثوقة: paid period، trial، grace، cancellation at period end. Event قديمة لا ترجع الحالة للخلف.",
    "how": "في renewal احتفظ بـperiod identity مستقرة واعمل invoice واحدة. Process provider events مع dedupe وperiod/version checks، واعمل periodic sync. Upgrade/downgrade تحتاج effective date وproration/credit policy وعرض أثر السعر قبل التأكيد.",
    "when": "مهم في SaaS، memberships، recurring donations والخدمات ذات limits. اختبر timezone وmonth end وtrial conversion وcancel/reactivate.",
    "code": "UNIQUE(subscription_id, period_start, invoice_kind)\nentitlement.expires_at = paid_period_end (+ explicit grace policy)\ncancel_at_period_end != revoke_now\nnever extend access merely because payment request was created",
    "walkthrough": [
      "Dunning تعني retries وتواصل وسياسة grace، مش loop تحصيل لا نهائية؛ provider behavior مصدره docs.",
      "تغيير plan الآن مقابل التجديد قرار منتج؛ سجّل effective_at والـquote والفرق المالي بدل تغيير plan_id وخلاص."
    ],
    "trap": "Payment status واحدة لا تمثل الاشتراك كله، واستخدام last webhook arrival كترتيب زمني يفسد access.",
    "check": "لو renewal success وصلت بعد cancel-at-period-end، هتحدد فترة الاستحقاق إزاي؟"
  },
  {
    "id": "marketplace-settlement",
    "title": "Marketplace Split، Fees وSeller Payouts",
    "group": "Fintech",
    "simple": "فلوس المشتري مش كلها إيراد المنصة. جزء مستحق للبائع وجزء رسوم وجزء ممكن يكون محجوز لrefunds أو نزاعات.",
    "scenario": "المشتري دفع 100، platform fee=10، seller payable=90. قبل إرسال الـ90 لازم تعرف هل التوصيل اكتمل وهل reserve policy تسمح بالصرف.",
    "intro": "افصل order، payment، commission allocation، seller balance، settlement batch وpayout. Split calculation محفوظ بنسخة rule وقت البيع. Settlement هنا حساب مستحقات فترة؛ bank settlement الخارجية مرحلة أخرى.",
    "how": "الـledger يثبت receivable/cash مقابل seller payable وplatform revenue بما يناسب النموذج المحاسبي. Hold/release يؤثران availability حسب سياسة واضحة. Partial refund يعيد توزيع fee/seller amounts من allocation الأصلي، ولو البائع صرفها تحتاج recovery policy.",
    "when": "مطلوب في multi-vendor ecommerce، gig platforms، delivery aggregators وأي نظام يحصّل نيابة عن أطراف. Ownership of funds وmerchant-of-record وfees مسؤوليات لازم تحددها قبل schema.",
    "code": "gross = seller_allocation + platform_fee (+ other explicit allocations)\nsettlement batch claims eligible allocations once\npayout has its OWN stable operation ID and reconciliation\nrefund uses original split version, not today's commission rate",
    "walkthrough": [
      "مجموع allocations لازم يساوي gross بقاعدة rounding ثابتة؛ reconciler يراجع fees والـnet المختلف في تقارير المزود.",
      "Seller dashboard يعرض pending وavailable وpaid-out منفصلين؛ لا تجمعهم كأنهم cash في البنك."
    ],
    "trap": "إرسال payout عند payment succeeded فقط يتجاهل delivery/returns/reserves، وتعديل commission القديمة يغير حسابات مغلقة.",
    "check": "Refund بعد seller payout: مين يتحمل fee ومين مديون لمين وإزاي يبان ده في ledger؟"
  },
  {
    "id": "admin-approvals",
    "title": "Maker–Checker وSafe Admin Operations",
    "group": "Security",
    "simple": "الـadmin مش استثناء من قواعد الفلوس. تغيير حساس يحتاج صلاحية دقيقة وأثر تدقيق، وأحيانًا شخص يبدأ وشخص تاني يوافق.",
    "scenario": "موظف دعم عايز manual credit بـ5000. بدل UPDATE balance نعمل adjustment request بسبب ومستند، والموافقة تنتج journal مرتبطة مرة واحدة.",
    "intro": "Maker–checker يفصل الإنشاء عن الاعتماد. Scope يتحدد بالمخاطر: thresholds، beneficiary changes، payouts، balance adjustments. Authentication لا تكفي؛ authorization على action/object/amount مطلوبة داخل السيرفر.",
    "how": "خزّن request immutable parameters وfingerprint وversion وreason، ثم approval بهوية مختلفة إن السياسة تتطلب. Execute worker يتحقق من approval الحالية والحدود ويclaim business reference؛ تغيير المبلغ يبطل الموافقة السابقة.",
    "when": "مهم في fintech backoffice، refunds الكبيرة، تغيير الحساب البنكي وعمليات الصيانة المؤثرة. Audit يسجل actor وtime وbefore/after/reference مع حماية بيانات حساسة.",
    "code": "draft -> submitted -> approved -> executed\nreject if approver == maker (where policy requires)\nreject execute if approved_version != current_version\nUNIQUE(adjustment_request_id) on ledger operation",
    "walkthrough": [
      "الـapproval على بيانات محددة، مش permission مفتوحة لتغيير أي مبلغ بعد الموافقة.",
      "Runbook يشرح إزاي تتعامل مع unknown result؛ زر execute تاني يعيد نفس العملية ولا ينشئ credit ثانية."
    ],
    "trap": "زر مخفي أو role اسمها admin ليس ضمانًا؛ والـaudit log بدون reconciliation لا يثبت صحة الرصيد.",
    "check": "المبلغ اتغير بعد approval من 50 لـ5000. إيه اللي يمنع التنفيذ؟"
  },
  {
    "id": "workflow-state-contract",
    "title": "State Machines، Guards وTransition Contracts",
    "group": "Design",
    "simple": "بدل status string تتغير من أي مكان، اعتبر كل انتقال أمر له شروط ومنفذ ونتيجة. الحالة تقول وصلنا لفين، والـhistory تقول وصلنا إزاي.",
    "scenario": "Booking pending تتحول confirmed فقط لو الحجز لسه صالح والدفع موثوق. Webhook متأخرة بعد cancellation تدخل refund_required بدل confirmed.",
    "intro": "اعمل جدول current state + event + guard -> next state + side effects. افصل حالات domain المختلفة بدل status عملاقة تجمع payment/shipping/booking. Terminal state قد يتبعها business operation جديدة مثل reversal، مش إعادة كتابة الماضي.",
    "how": "طبق transition داخل transaction على row locked أو version check. Persistence وoutbox في commit واحدة. Duplicate command تعيد النتيجة المخزنة؛ invalid transition ترفض بسبب واضح. Async events تتحقق من business identity ونسخة/فترة الحدث.",
    "when": "استخدمه لما feature فيها retries، موافقات، توقيت، external systems أو أدوار مختلفة: payments، bookings، refunds، onboarding، jobs.",
    "code": "UPDATE bookings SET state='confirmed', version=version+1\nWHERE id=:id AND state='held' AND expires_at > DB_NOW();\nassert affected_rows == 1;\n-- under shared resource guard when capacity is involved",
    "walkthrough": [
      "ارسم حالات كل entity لوحدها ثم اكتب invariant بتربطهم؛ مثل confirmed booking لها allocation واحدة.",
      "الـtransition test يتحقق من الداتا والـside effect والـreplay، مش مجرد إن string اتغيرت."
    ],
    "trap": "if statements موزعة في controllers/jobs/listeners تسمح لمسارين ينفذوا side effect متعارضة.",
    "check": "مين له حق نقل refund من pending إلى succeeded؟ وإيه الدليل وإيه أثر إعادة الحدث؟"
  },
  {
    "id": "currency-fx-fees",
    "title": "Currencies، FX Quotes وFee Boundaries",
    "group": "Fintech",
    "simple": "100 EGP مش 100 USD، وحتى ledger متوازنة إجمالًا ممكن تكون غلط لو جمعت عملتين. كل مبلغ له currency، وكل تحويل FX له quote وصلاحية ورسوم.",
    "scenario": "عميل يرسل EGP ويستقبل USD: احفظ debit amount وcredit amount وrate/rounding/fees. لو الـquote انتهت قبل القبول اطلب quote جديدة، مش تعيد الحساب من غير ما يعرف.",
    "intro": "الحسابات عادة أحادية العملة؛ journal لازم تتوازن لكل currency عبر حسابات clearing/FX المناسبة، مش سطر EGP يقابل سطر USD مباشرة. Fees لها payer وcurrency وtiming وسياسة refund.",
    "how": "خزّن rate precision وquote ID وexpires_at وaccepted_at وsource amounts. افصل customer quote عن provider execution rate؛ فرق التنفيذ يتسجل في حسابات gain/loss أو policy متفق عليها. استخدم decimal/rational للـrate وinteger minor amounts عند boundary ملائم.",
    "when": "مهم للتحويلات الدولية، multi-currency checkout، payouts والـfees tiers. حدد supported currencies وminor units والـmaximums والـrounding policy.",
    "code": "Money = { amount_minor: integer, currency: ISO_code }\nreject addition when currencies differ\nFXQuote = {debit_money, credit_money, fee_money, rate, expires_at}\nledger balance validation groups entries BY currency",
    "walkthrough": [
      "Provider fee ليست بالضرورة platform fee؛ reconciliation تقارن gross وnet والرسوم كل واحدة بمصدرها.",
      "الأمثلة المحلية في المعمل عملة واحدة؛ تصميم FX محتاج حسابات وتسوية خاصة ولا يكفي تغيير currency field."
    ],
    "trap": "float rates وتقريب كل خطوة مستقلًا يخلق drift، وتثبيت سعر صرف إلى الأبد من غير expiry ينقل مخاطرة مالية للمنصة.",
    "check": "لو debit حصل وcredit الخارجي timeout، هتعالج العملية إزاي من غير تحويل تاني بسعر جديد؟"
  },
  {
    "id": "feature-template",
    "title": "Feature Design: من الـRequirement إلى الـRunbook",
    "group": "Design",
    "simple": "قبل controller اسأل إيه الوعد اللي بتقدمه للمستخدم، وإيه القاعدة اللي مينفعش تتكسر، ومين صاحب كل قرار. بعد كده اختار الجداول والـflow اللي تحافظ على الوعد.",
    "scenario": "في booking الوعد مش create row؛ الوعد إن confirmed seat لا تباع مرتين، وإن الدفع المتأخر له حل. في wallet الوعد إن available لا تتصرف مرتين وأن كل مبلغ له مصدر.",
    "intro": "ابدأ scope وactors وhappy path، ثم invariants، domain vocabulary، state machines، data ownership، atomic boundaries، API contract، async recovery، tests وoperations. حدد افتراضاتك لأن تصميم appointments مختلف عن hotel nights.",
    "how": "اكتب مثال أرقام أو timeline لفشل حقيقي. اسأل ماذا لو توقف السيرفر قبل/بعد كل commit أو call؟ لكل pending state owner وdeadline وrecovery job. اختار أبسط model يحقق هذه القواعد قبل توزيع الخدمات.",
    "when": "قبل بناء checkout أو transfers أو onboarding أو reports؛ وكذلك في interview system design. المخطط الجيد يشرح trade-offs والحدود ولا يكتفي بأسماء Redis وKafka.",
    "code": "Feature brief:\nActors / permissions / scope / assumptions\nInvariants -> data constraints + guarded transitions\nFailure timeline -> recovery + reconciliation\nAcceptance tests -> metrics + runbook + rollout",
    "walkthrough": [
      "كل invariant تتحول إلى enforcement واختبار: لا oversell -> guarded reservation -> concurrent requests test على DB حقيقية.",
      "كل external side effect له stable operation identity ومكان لتسجيل unknown ومصدر تأكيد؛ لا تعتمد على happy path."
    ],
    "trap": "حفظ patterns من غير ربطها بمشكلة يخلي التصميم معقد ومش مضمون، وكتابة API قبل تحديد invariant بتخبّي التناقضات.",
    "check": "اختار feature واكتب 3 قواعد، ثم أثبت لكل واحدة مين يفرضها وإزاي تختبر كسرها."
  },
  {
    "id": "business-idempotency",
    "title": "Business Identity قبل Request Deduplication",
    "group": "Reliability",
    "simple": "منع تكرار event مش هو منع تكرار أثرها. ممكن حدثين مختلفين يقولوا إن نفس الدفع نجح؛ المطلوب fulfillment واحدة لأن العملية التجارية واحدة.",
    "scenario": "Webhook event A وبعدها event B وكلهم لنفس payment. UNIQUE(event_id) تقبل الاتنين، لكن UNIQUE(payment_id, fulfillment_kind) تمنع شحن نفس الطلب مرتين.",
    "intro": "افصل request idempotency key، provider operation reference، event ID وbusiness effect ID. كل واحدة لها scope وretention ومعنى. Fingerprint يمنع نفس key من استخدامها لمبلغ أو مستفيد مختلف.",
    "how": "الـkey تتولد مرة عند نية المستخدم وتُحفظ قبل call، وتُعاد في retries لنفس العملية. DB unique على semantic reference تحمي الأثر، والمعالجة تعتمد transaction وoutbox. Provider key تساعد فقط ضمن عقد المزود، مش ضمانًا أبديًا لكل flow.",
    "when": "مهم في payment attempts، top-up credits، refunds، ledger posting، fulfillment وإرسال notifications ذات أثر. Local uniqueness لازمة حتى لو provider يدعم keys.",
    "code": "requests UNIQUE(actor_id, operation_kind, client_key) + fingerprint\ninbox UNIQUE(provider, account, event_id)\neffects UNIQUE(business_operation_id, effect_kind)\noutbox UNIQUE(effect_id, destination)",
    "walkthrough": [
      "الـinbox تسمح باستعادة event بعد crash؛ processed flag يتكتب في transaction مع domain effect مش قبلها.",
      "لو key موجودة ونفس fingerprint ارجع نتيجة العملية الحالية؛ لو fingerprint مختلفة ارفض conflict ولا تعيد تنفيذها."
    ],
    "trap": "توليد UUID جديد عند كل retry ينشئ عملية جديدة، والاعتماد على event ID وحدها لا يمنع semantic duplicate.",
    "check": "حدد أربع هويات مستقلة في checkout وأين تُخزن كل واحدة ولماذا لا تصلح واحدة بدل الباقي."
  }
];
