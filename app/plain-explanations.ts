export type PlainExplanation={simple:string;example:string};
export const plainExplanations:Record<string,PlainExplanation> = {
  "php-types": {
    "simple": "الـtype بيقول للدالة نوع القيمة اللي تستقبلها، لكن مش بيقول إن القيمة مناسبة للشغل. رقم صحيح ممكن يبقى سعر سالب أو كمية غلط. عشان كده type checking وvalidation ليهم دورين مختلفين.",
    "example": "في سلة شراء: quantity لازم تكون integer، وكمان أكبر من صفر وأقل من الحد المسموح. تحويل النص بالقوة لرقم مش بديل عن التحقق من المدخل."
  },
  "arrays-values": {
    "simple": "الـarray صندوق مرتب من مفاتيح وقيم. لما تنسخ array، تعديل النسخة ما يغيرش الأصل عادة. لما تسند object لمتغير تاني، الاتنين بيشاوروا على نفس الـobject، فالتعديل ممكن يظهر للاتنين.",
    "example": "لو فاتورتين بيستخدموا نفس object للعنوان واتعدل بعد الشراء، التاريخ ممكن يتغير بالغلط. اعمل snapshot مستقلة للقيم اللي لازم تفضل ثابتة."
  },
  "closures": {
    "simple": "تقدر تتعامل مع function كأنها قيمة: تخزنها أو تبعتها لدالة تانية. Closure ممكن تفتكر قيم من المكان اللي اتعملت فيه؛ لازم تعرف هل هي افتكرت قيمة قديمة ولا reference بتتغير.",
    "example": "حساب خصم اتعمل بنسبة 10% داخل closure. لو النسبة اتغيرت بعد تعريفها، النتيجة تعتمد على طريقة capture؛ اختبر ده بدل افتراض إنها هتقرا آخر قيمة."
  },
  "generators": {
    "simple": "بدل ما تجهّز مليون row في الذاكرة، جهّز واحدة وخلّي اللي بيستخدمها يطلب التالية. ده مفيد لو الطرفين بيشتغلوا تدريجيًا، مش لو رجعت جمعت كل النتائج في array كبيرة.",
    "example": "Import لمنتجات متجر: اقرأ batch صغيرة، تحقق منها واحفظها، ثم كمل. حفظ كل errors بكل payloads في memory ممكن يضيّع ميزة القراءة التدريجية."
  },
  "enums": {
    "simple": "بدل حالات مكتوبة كنصوص عشوائية، حدّد قائمة قيم مسموحة. لكن القائمة مش بتقول كل انتقال مسموح: إن order لها حالة refunded مش معناه ينفع ننقلها ليها قبل الدفع.",
    "example": "Order فيها pending وpaid وcancelled. Enum تمنع typo؛ rule منفصلة تمنع إلغاء order اتشحنت إلا من خلال return flow."
  },
  "errors": {
    "simple": "لما حاجة تفشل، اختار المكان اللي يقدر يتعامل مع الفشل بمعنى مفيد. مش كل error ترجع success، ومش كل error تتعاد بنفس الطريقة. لازم تميّز رفض مؤكد عن نتيجة لسه مجهولة.",
    "example": "Provider الدفع عمل timeout. ممكن يكون خصم فعلًا والرد ضاع؛ سجّل pending/unknown وتابع status بدل إنشاء خصم جديد بمفتاح جديد."
  },
  "immutability": {
    "simple": "القيمة الثابتة ما بتتعدلش من أي مكان؛ لو احتجت تغيير، ترجع قيمة جديدة. ده بيقلل مفاجآت مشاركة نفس object، وبيخلي قواعد زي العملة والسعر واضحة.",
    "example": "سعر المنتج وقت الشراء يتحفظ كقيمة ثابتة في order line. تغيير سعر الكتالوج بكرة ما يغيّرش فاتورة امبارح."
  },
  "unicode": {
    "simple": "النص اللي شايفه مش بالضرورة عدد bytes بسيط. حرف عربي أو emoji ممكن ياخد أكتر من byte، وأحيانًا الشكل الواحد بيتكوّن من أكتر من code point.",
    "example": "لما تقص اسم عميل إلى 20 حرف، حدّد معنى حرف: byte ولا code point ولا grapheme. جرّب العربي والـemoji، مش English بس."
  },
  "composer": {
    "simple": "Composer بتجيب الحزم وبتربط أسماء classes بملفاتها. الـlockfile زي قائمة مقفولة بالنسخ اللي اتجربت؛ استخدامها في النشر يقلل اختلاف سيرفر عن التاني.",
    "example": "Dependency update يتعمل في branch ويتراجع ويتختبر؛ production تنشر النسخ المتفق عليها بدل ما تعيد اختيار versions أثناء إطلاق payment feature."
  },
  "abstraction": {
    "simple": "Abstraction معناها اللي بيستخدم الجزء يعرف يعمل إيه بيه، من غير ما يعرف كل تفاصيل تنفيذه. الفكرة موجودة حتى لو ما كتبتش interface في اللغة.",
    "example": "Checkout يقول لخدمة الدفع ادفع المبلغ ده ويستقبل نتيجة مفهومة. مش مطلوب منه يعرف header التوقيع أو اسم field عند كل provider."
  },
  "interfaces": {
    "simple": "Interface اتفاق بين اللي بيستخدم الخدمة واللي بينفذها. بيقول العمليات وشكل المدخلات والنتائج، لكن معنى النجاح والفشل والـretry لازم يتوضح ويتختبر كمان.",
    "example": "FakeGateway في الاختبار وGateway حقيقية ينفع يدخلوا لنفس Checkout. الاتنين لازم يتفقوا هل النتيجة pending ولا captured، مش بس يرجعوا نفس نوع object."
  },
  "abstract-class": {
    "simple": "Abstract class أب فيه جزء تنفيذ مشترك وجزء لازم الأبناء تكمله. اختارها لما فيه workflow واحد فعلًا؛ لو behavior بتتغير مستقلة عن الأب، تركيب objects غالبًا أوضح.",
    "example": "Export CSV وJSON يشتركوا في validation ثم formatting. الأب يحمي الترتيب، وكل ابن ينفّذ formatting؛ ده مختلف عن مجرد تحديد interface للمستهلك."
  },
  "encapsulation": {
    "simple": "Encapsulation معناها حالة الجزء ما تتغيرش إلا بعمليات تحمي قواعده. مش مجرد private مع setter يقبل أي حاجة. اسأل: إيه التغييرات المسموحة وإيه اللي لازم أرفضه؟",
    "example": "بدل setStatus(\"paid\") من أي controller، order.confirmPayment تتحقق من المرجع والحالة والمبلغ. القواعد المهمة تتراجع وقت الكتابة كمان ضد التزامن."
  },
  "solid": {
    "simple": "SOLID أسئلة تساعدك تكتشف مشاكل التصميم: هل كل جزء له سبب واضح للتغيير؟ هل أقدر أبدّل تنفيذ من غير كسر السلوك؟ هل الـcontract أكبر من احتياجي؟ مش مسابقة لزيادة classes.",
    "example": "Service بتعمل خصومات ودفع وإيميلات في نفس المكان؛ افصل أسباب التغيير، لكن بلاش interface لكل سطر أو نقل الزحمة لخدمة عملاقة باسم جديد."
  },
  "polymorphism": {
    "simple": "تقدر تنادي نفس العملية على objects مختلفة وتاخد behavior مناسب لكل object، من غير ما الـcaller يفحص نوعها كل مرة. ده محتاج اتفاق سلوكي حقيقي، مش أسماء methods متشابهة بس.",
    "example": "Checkout تستخدم PaymentGateway واحدة في constructor. Provider تتحدد عند تركيب التطبيق، بدل if Stripe/if Adyen جوه كل خطوة business."
  },
  "lifecycle": {
    "simple": "Request بتمر على خطوات قبل ما توصل للـcontroller وبعد ما response ترجع. فهم الرحلة بيساعدك تحط authentication وtenant context وlogging في مكانهم الصحيح.",
    "example": "لو invoice binding حصلت قبل تحديد tenant، ممكن query تتعمل في scope غلط. ترتيب middleware جزء من صحة الطلب، مش تجميل للكود."
  },
  "container": {
    "simple": "الـContainer بيركّب objects واعتمادها بدل ما كل class تنشئ collaborators بنفسها. DI هي إنك تمرّر الاعتماد؛ اختيار عمره مهم عشان state ما تفضلش بين requests بالغلط.",
    "example": "Checkout تستقبل Gateway وClock. في الاختبار تبعت fake ووقت ثابت؛ وفي worker طويل العمر ما تخزّنش current tenant في singleton مشتركة."
  },
  "validation": {
    "simple": "Validation بتتأكد إن المدخلات صالحة حسب contract. Authorization بتحدد مين مسموح له يستخدمها، وDB constraints بتحمي قواعد مشتركة وقت الكتابة. كل واحدة بتحل مشكلة مختلفة.",
    "example": "product_id موجود مش كفاية: لازم المنتج تابع للمتجر ومتاح، والكمية سليمة، والمخزون يتراجع atomically لما تعمل reservation."
  },
  "relationships": {
    "simple": "Relations بتوصف ارتباطات الداتا: عميل عنده orders، وorder فيها lines. هي بتسهّل queries، لكن ما تمنعش duplicates أو وصول غير مصرح لوحدها.",
    "example": "hasOne profile ما تمنعش وجود صفين لنفس العميل من غير unique constraint. وقراءة customer لكل order جوه loop ممكن تعمل N+1 queries."
  },
  "scopes-casts": {
    "simple": "Scope فلتر query متكرر؛ Cast تحويل تمثيل قيمة من التخزين لشكل مناسب في الكود. دول تسهيلات، مش سور حماية شامل لكل database access.",
    "example": "Global tenant scope مش بالضرورة يتطبق على raw SQL أو job ناقصة context. Enum cast للحالة مش قاعدة تمنع paid من الرجوع لـpending."
  },
  "auth-policy": {
    "simple": "Authentication تعرفنا مين المستخدم. Authorization تحدد إيه اللي يحق له يعمل على record معينة دلوقتي. Role أو token وحدهم مش تصريح يفتحوا بيانات كل الشركات.",
    "example": "مستخدم authenticated طلب فاتورة لشركة تانية: query scoped وpolicy لازم يرفضوا. UUID صعبة التخمين ما تعوّضش ownership check."
  },
  "queues": {
    "simple": "Queue بتأجل الشغل لworker. ده يسمح للطلب يرد بسرعة، لكن الشغل لسه ممكن يفشل أو يتكرر. صمّم job تقدر تستكملها بأمان وتعرف حالتها.",
    "example": "إنشاء export يرجع pending وID للمتابعة. Worker تعالج batches، ومع retry ما تكررش نفس rows أو تبعت نفس الإيميل بلا ضابط."
  },
  "events": {
    "simple": "Event خبر إن حاجة حصلت؛ Job طلب تنفيذ شغل. لما event مرتبطة بـDB write، لازم تكون الحقيقة اتثبتت قبل ما أجزاء تانية تتصرف بناءً عليها.",
    "example": "بلاش تبعت OrderConfirmed قبل commit. لو rollback حصلت، ما ينفعش العميل يستلم receipt عن order مش موجودة؛ durability الأعلى قد تحتاج outbox."
  },
  "cache": {
    "simple": "Cache نسخة أسرع من data، لكنها ممكن تتأخر عن المصدر. قبل استخدامها اسأل: قد إيه stale مسموح؟ إمتى أمسحها؟ وهل مفتاحها يفرق بين tenants والصلاحيات؟",
    "example": "عرض سعر cached في الكتالوج ممكن يبقى مقبول دقائق. مبلغ الدفع النهائي لازم يتحسب من مصدر موثوق ويتثبت في quote/order حسب policy."
  },
  "sessions": {
    "simple": "Session تربط عدة requests بنفس المستخدم. وجود shared store ما يخليش كل تعديل عليها atomic، ومدة حياتها لازم تتدار عند login/logout وتغيّر الصلاحيات.",
    "example": "طلبان عدّلوا cart في session بنفس الوقت؛ واحد ممكن يكتب فوق التاني. اختار blocking مناسبة أو cart persist/version policy بدل افتراض إن session تحمي السباق."
  },
  "storage": {
    "simple": "File upload مش مجرد احفظ الملف: لازم تحدد الحجم والنوع والاسم والمالك ومين يقدر ينزله وإمتى يتمسح. File URL صعبة التخمين مش permission.",
    "example": "فاتورة PDF تتخزن private ويتراجع access عند التنزيل. لو job فشلت بعد حفظ ملف مؤقت، cleanup لاحقة لازم تلمّه."
  },
  "localization": {
    "simple": "Localization تشمل اللغة والاتجاه وتنسيق التاريخ والعملة. اللغة وقت إرسال job مش بالضرورة نفس لغة request القديمة، فاحملها أو حددها صراحة.",
    "example": "Receipt عربي لعميل في مصر لازم يستخدم locale/timezone المتفق عليهم، ويعرض اسم العميل escaped بدل raw HTML."
  },
  "artisan": {
    "simple": "Command طريق تاني لتنفيذ نفس قواعد التطبيق، والـScheduler يحدد موعده. المهمة ممكن تتكرر أو تشتغل على أكتر من server، فلازم تنسيق ومراقبة واستكمال آمن.",
    "example": "تجديد الاشتراكات كل يوم ما ينشئش فاتورة جديدة لنفس period لو command اتشغلت مرتين. DB uniqueness تحمي rule، مش cron schedule وحدها."
  },
  "deploy": {
    "simple": "النشر بيغيّر code وconfig وschema وworkers مع بعض. القديم والجديد ممكن يشتغلوا في نفس الوقت، فلازم انتقال متوافق وخطة رجوع أو إصلاح قدّام.",
    "example": "أضف column متوافقة، انشر code تتقبل القديم والجديد، اعمل backfill وتحقق، وبعدها شدّد constraint. ما تمسحش القديم بينما jobs لسه بتستخدمه."
  },
  "http": {
    "simple": "طلب الشبكة مش business transaction مضمونة. لازم تفهم مين اتصل بمين، والـtimeout حصل فين، وهل الطرف التاني ممكن يكون نفّذ رغم إنك ما استلمتش رد.",
    "example": "Request سحب فلوس وصلت واتنفذت ثم الاتصال انقطع. العميل شايف error، لكن لازم يتابع نفس operation بدل إرسال سحب جديد."
  },
  "rest-api": {
    "simple": "API contract اتفاق على معنى المدخلات والنتائج والأخطاء، مش JSON شكلها حلو بس. خلّي الحالات والـretry والـpagination والتوافق واضحة للمستهلك.",
    "example": "POST /withdrawals يرجع operation ID وحالة pending لو النتيجة لسه مش نهائية؛ 200 على redirect ما تعتبرش إثبات وصول فلوس للحساب البنكي."
  },
  "sql-indexes": {
    "simple": "Index بتقلل شغل query معينة مقابل تكلفة تخزين وكتابة. وN+1 مشكلة عدد queries، ممكن ما تتحلش بإضافة index أصلًا. قِس الـplan والنتيجة بدل التخمين.",
    "example": "قائمة 100 order بتقرأ customer لكل واحدة: ابدأ eager loading وpagination. لو query واحدة لسه بطيئة، راجع scans وsort وlocks."
  },
  "transactions": {
    "simple": "Transaction تجمع writes محلية عشان يتثبتوا مع بعض أو يتلغوا مع بعض. مش بتلغي network call حصلت بره الـDB، ومش بتحمي كل race تلقائيًا.",
    "example": "خصم رصيد A وزيادة رصيد B وقيد journal لازم يتثبتوا كوحدة محلية. إرسال payout لبنك خطوة خارجية لها حالة ومتابعة منفصلة."
  },
  "race": {
    "simple": "Race بتحصل لما نتيجة الشغل تعتمد على ترتيب requests المتزامنة. افحص rule في نفس خطوة التعديل أو احمِ القراءة والكتابة باستراتيجية مناسبة.",
    "example": "رصيد 100 وطلبان كل واحد يصرف 80: قراءة balance مرتين ثم طرح منفصل ممكن تمرر الاتنين. لازم conditional write أو lock/version وقت commit."
  },
  "idempotency": {
    "simple": "نفس العملية المنطقية لما تتكرر ما تعملش نفس الأثر مرة تانية. لازم تعرف العملية بهوية محفوظة، وتتحقق إن إعادة استخدام الهوية جاية بنفس المعنى والمدخلات.",
    "example": "Retry لنفس charge تستخدم نفس key؛ key جديدة تعني محاولة منطقية جديدة. Duplicate webhook ما تطلعش shipment أو wallet credit إضافية."
  },
  "outbox": {
    "simple": "عايز DB commit ونشر message ما ينفصلوش؟ اكتب النية بتاعة الرسالة في نفس DB transaction، وبعدها publisher يرسلها ويعيد المحاولة. المستهلك لسه لازم يتحمل التكرار.",
    "example": "Order ثبتت لكن queue كانت واقعة. Outbox تحفظ إن فيه receipt/fulfillment مستني، فيتبعث بعد recovery بدل ما يضيع بين commit وenqueue."
  },
  "security": {
    "simple": "اسأل مين موثوق، وإيه اللي ممكن يدخل أو يتسرّب أو يتنفّذ. الحماية طبقات: permissions، validation، safe output، limits، secrets lifecycle واختبارات للرفض.",
    "example": "Endpoint بتقبل URL لصورة ممكن تطلب internal metadata من السيرفر لو ما فيش SSRF policy. وجود login مش بيصلّح ده."
  },
  "testing": {
    "simple": "Test مفيدة لو هتكشف defect حقيقية. اختَر expected behavior مستقل، وجرب الرفض والفشل والتزامن، مش happy path بس أو mock بيرجع اللي انت طلبته.",
    "example": "اختبر إن مستخدم tenant تانية مش بس بياخد 403/404؛ كمان ما حصلش mutation ولا اتسرّبت fields قبل الرفض."
  },
  "observability": {
    "simple": "لازم تعرف النظام بيعمل إيه من الأدلة: metrics للاتجاهات، logs للأحداث، traces لرحلة العملية. سجل context مفيد من غير secrets.",
    "example": "طلب payout معلق: operation ID تربط request والـjob والـprovider reference، وage metric تنبه قبل ما support تكتشف المشكلة من العميل."
  },
  "architecture": {
    "simple": "Architecture اختيار حدود ومسؤوليات وملكية بيانات وطريقة تعامل مع الفشل. مش لازم خدمات كتير؛ أبسط تصميم يحافظ على rules المطلوبة غالبًا نقطة بداية أحسن.",
    "example": "فريق صغير ممكن يبني modular monolith للحجز والدفع، ويعزل provider وراء contract بدل إنشاء microservice لكل table."
  },
  "ai": {
    "simple": "اعتبر AI مساعد يقترح، وأنت مسؤول عن التحقق. وضّح المطلوب والـconstraints، وراجع code والـAPIs والـtests، وما تبعتش secrets أو بيانات عملاء بلا حاجة.",
    "example": "AI كتبت refund handler بيثق في client amount: ارفض الافتراض، احسب المسموح من server records واختبر concurrent partial refunds."
  },
  "big-o": {
    "simple": "Big O بتقارن نمو الشغل مع حجم input، مش بتضمن عدد ثواني ثابت. وضّح n ووقت تجهيز structures والـmemory، وبعدها قِس على data ممثلة.",
    "example": "Loop فيها in_array على list بتكبر ممكن تبقى O(n²). Hash set تقلل الوقت غالبًا، لكنها بتاخد memory ولا تحل distributed duplicate writes."
  },
  "hash-maps": {
    "simple": "Map تربط مفتاح بقيمة عشان lookup سريع في المتوسط؛ Set تستخدمها لمعرفة هل حاجة ظهرت. أهم حاجة تعريف equality والـscope، مش اختيار structure بس.",
    "example": "في Two Sum خزّن العناصر السابقة ودوّر على complement قبل إضافة الحالي. في webhook حقيقية، set في process واحدة مش كفاية؛ محتاج durable dedup."
  },
  "two-pointers": {
    "simple": "لو فيه ترتيب أو شرط يسمح، امشِ بمؤشرين بدل إعادة scan من الأول. لازم تشرح ليه الحركة ما تفوّتش إجابة وليه كل عنصر يتعالج عدد مرات محدود.",
    "example": "ادمج قائمتين مرتبتين: خد الأصغر من current elements، حرّك مؤشره، وبعد انتهاء واحدة ضيف الباقي من التانية."
  },
  "sliding-window": {
    "simple": "احتفظ بنطاق متصل وملخص لحالته، وكبّره أو صغّره بدل تجربة كل النطاقات. التقنية تنفع لما شروط المشكلة تسمح بتحريك الحدود بأمان.",
    "example": "أطول نص بلا تكرار: حرّك left بعد آخر ظهور للحرف بس ما ترجعهاش لورا. وجود أرقام سالبة يكسر بعض حلول sum-window."
  },
  "stack-queue": {
    "simple": "Stack تطلع آخر حاجة دخلت أولًا؛ Queue تطلع أول حاجة دخلت أولًا. الترتيب ده سبب صحة الحل، مش تفصيلة نختارها عشوائيًا.",
    "example": "قوس closing لازم يقابل آخر opening في stack. BFS تستخدم queue عشان تزور المسافات الأقرب قبل الأبعد في graph غير موزونة."
  },
  "binary-search": {
    "simple": "لو العناصر مرتبة أو فيه شرط monotonic، تقدر تستبعد نص الاحتمالات كل مرة. حدّد معنى النطاق وحركة الحدود وحالة عدم وجود نتيجة.",
    "example": "lower bound بتجيب أول سعر أكبر من أو يساوي target، حتى مع duplicates. لو رتّبت كل input عشان lookup واحدة، احسب تكلفة الفرز كمان."
  },
  "graphs": {
    "simple": "Graph بتوصف حاجات وعلاقات بينها. قبل traversal، حدّد اتجاه العلاقة وهل وزنها مهم وهل ممكن يكون فيه cycle أو أجزاء منفصلة.",
    "example": "في dependencies، السهم من dependency إلى اللي معتمد عليها لو عايز build order. عدد orders الصحيحة ممكن يبقى أكتر من ترتيب واحد."
  },
  "dynamic-programming": {
    "simple": "لو حلول أصغر بتتكرر وبتبني الحل الأكبر، خزّنها في state معناها واضح. حدد base cases والانتقالات قبل كتابة loops.",
    "example": "أقل عدد عملات لمبلغ معين: أفضل حل للمبلغ الحالي ممكن يبنى على أفضل حلول مبالغ أصغر. اختيار أكبر عملة greedy مش صحيح لكل denominations."
  },
  "strategy-adapter": {
    "simple": "Strategy تبدّل طريقة الحساب، Adapter يترجم نظام خارجي لعقد محلي، وFactory تختار أو تنشئ object. كل pattern بتحل سؤال مختلف؛ الاسم مش هدف لوحده.",
    "example": "ShippingQuote تختار strategy، وCourierAdapter تترجم payload/errors لمورد الشحن، وresolver تحدد المورد من allowlist."
  },
  "observer-decorator": {
    "simple": "Observer يشغّل ردود فعل على event، وDecorator يلف نفس service contract بسلوك إضافي. فرق وقت التنفيذ والـerror guarantees مهم.",
    "example": "Metrics wrapper حول pricing تختلف حسب هل هي خارج cache ولا داخلها. Email listener ما تتبعتش قبل ثبات order في DB."
  },
  "process-lifetimes": {
    "simple": "حاجة بتعيش request واحدة تختلف عن process شغالة ساعات. أي mutable state طويلة العمر ممكن تفضل لمستخدم تاني أو تكمّل بكود قديم بعد deployment.",
    "example": "Worker singleton خزّنت tenant A، وبعدها خدمت job لـB. اختبر isolation وreset الصحيحين بدل الاعتماد على إن process هتتقفل بعد كل طلب."
  },
  "requirements": {
    "simple": "قبل ما تسأل أبني بإيه، اسأل المستخدم محتاج يحقق إيه وتحت أي قيود. فرّق behavior مطلوب عن quality target وعن assumption لسه محتاجة تأكيد.",
    "example": "طلب عايز booking سريع مش كفاية. اسأل عن capacity والـhold time والـrefund policy والـtraffic، وبعدها اختار flow وتقنية مناسبة."
  },
  "specification": {
    "simple": "حوّل المطلوب لقواعد وأمثلة قابلة للاختبار. Invariant قاعدة لازم تفضل صحيحة دائمًا، وstate machine بتقول الانتقالات المسموحة بدل booleans ممكن تتناقض.",
    "example": "confirmed seats ما تتجاوزش capacity. لو payment وصلت بعد expiry، لازم قرار مكتوب: re-reserve لو متاح أو refund/review، مش تأكيد تلقائي."
  },
  "correctness": {
    "simple": "الحل الصح محتاج assumptions واضحة ونتيجة متفق عليها وسبب إن الخطوات بتحافظ عليها. النجاح على مثالين لا يثبت إن كل الحالات متغطية.",
    "example": "Binary search على unsorted input مش contract صحيحة. اشرح invariant وحركة بتقلل النطاق، واختبر empty وduplicates وحدود القيم."
  },
  "math-reasoning": {
    "simple": "الأرقام مفيدة لما تكتب وحداتها وافتراضاتها. تقدير تقريبي صريح أحسن من رقم دقيق ظاهريًا مبني على assumptions مخفية.",
    "example": "احسب raw storage من events/sec×seconds×bytes، ثم أضف retention والـindexes والنسخ. ما تخلطش average latency بـp95 أو rarity بضمان correctness."
  },
  "os-processes": {
    "simple": "Process وحدة تشغيل بموارد وعنوان ذاكرة؛ threads عادة بتشارك memory داخلها. Concurrency تداخل أعمال، وparallelism تنفيذ فعلي مع بعض. Containers ليها حدود عزل وموارد، ومش VM كاملة.",
    "example": "زيادة workers ممكن تزود انتظار locks وconnections وتقلل throughput. وcontainer ممكن تتقتل عند memory cap رغم وجود RAM حرة على host."
  },
  "memory-io": {
    "simple": "طريقة حفظ ومعالجة الداتا بتحدد memory وI/O، مش حجم input بس. القراءة التدريجية لا تنقذك لو كل results بتفضل متعلقة في الذاكرة.",
    "example": "Import CSV streaming لكن list بكل errors والـpayloads بتكبر لحد OOM. قِس RSS وحدّ buffers والبatches وخزّن checkpoints للاستكمال."
  },
  "async-synchronization": {
    "simple": "Async تسمح بعمل آخر أثناء انتظار I/O؛ مش معناها حساب CPU بقى parallel. لازم تحد in-flight work وتحدد ماذا يحدث لو جزء فشل أو اتلغى.",
    "example": "500 provider calls ما تتطلقش كلها مرة واحدة. استخدم cap/deadline وpartial-failure policy، واعرف إن إلغاء الانتظار لا يثبت إن remote call اتلغت."
  },
  "network-transport": {
    "simple": "TCP يوصل bytes بالترتيب داخل اتصال، لكن مش بيثبت إن business operation حصلت مرة واحدة. TLS يحمي النقل والهوية عند التحقق، مش صلاحيات كل record.",
    "example": "Server ثبتت payout ثم الاتصال انقطع قبل الرد. نفس المفتاح والمتابعة هما الحل، مش الثقة في إن reliable transport يمنع تكرار العملية."
  },
  "dns-routing": {
    "simple": "DNS والـproxies والـload balancer كل واحد له دور وعمر caching مختلف. حدّد مين موثوق يعلن original IP أو scheme عشان client ما يزوّرش حدود الشبكة.",
    "example": "تغيير DNS ممكن يسيب clients على old IP أو connections مفتوحة. خطط overlap/draining، وما تثقش في X-Forwarded-For من أي مصدر."
  },
  "relational-model": {
    "simple": "صمّم facts ومفاتيح وعلاقات قبل الـORM. Normalization تمنع تكرار معرفة يتعدل جزء منها وينسى جزء؛ snapshots تحفظ التاريخ لما ده معنى المجال.",
    "example": "عنوان المورد الحالي في مكان واحد، لكن عنوان الفاتورة وقت إصدارها snapshot. الاتنين شبه بعض في fields لكن ownership وlifecycle مختلفة."
  },
  "storage-indexes": {
    "simple": "Index طريقة تنظيم للبيانات عشان query تعمل شغل أقل. مكسب القراءة له تكلفة في writes والمساحة؛ لازم تعرف workload والـplan بدل إضافة index عشوائي.",
    "example": "Filter بـtenant وstatus ثم ترتيب created_at قد يستفيد من composite index، لكن query مختلفة أو tenant كبيرة جدًا ممكن تحتاج قياس واختيار تاني."
  },
  "mvcc-recovery": {
    "simple": "مين يشوف أي نسخة من الصف سؤال، وإيه اللي ينجو من crash سؤال تاني. Snapshot وWAL وreplication ليهم ضمانات مختلفة حسب المحرك والإعدادات.",
    "example": "Report transaction طويلة ممكن تشوف بيانات أقدم عمدًا، وتضغط cleanup. Replica متأخرة ممكن ما تحتويش آخر commit لو primary ضاعت؛ اختبر recovery."
  },
  "coupling-cohesion": {
    "simple": "جمع الشغل اللي له معنى وسبب تغيير متقارب، وخلي اعتماد الأجزاء على بعض واضح. تشابه سطرين لا يعني إنهم نفس القاعدة ولا لازم يتجمعوا.",
    "example": "Billing تملك refund rules؛ ما تخليش كل controllers تكتب payment tables بطريقتها. Contract واضحة أسهل من shared helper ضخمة بعشرات flags."
  },
  "domain-modeling": {
    "simple": "استخدم لغة المجال عشان تحدد الهوية والقيم والحالات وحدود التغيير. Aggregate مش مجرد model؛ هي مجموعة state لازم قواعد محددة تتصان فيها معًا.",
    "example": "Booking hold غير payment authorization غير confirmed booking. التفريق بينهم يمنع paid=true تبقى تصريح مبهم لتأكيد مورد اتحجز لحد تاني."
  },
  "message-semantics": {
    "simple": "الرسالة ممكن تتكرر أو تتأخر أو يتوقف المستهلك بعد ما ينفّذها. عشان كده حدد هوية العمل ووقت ACK وسلوك الـretry والـquarantine.",
    "example": "Worker عمل wallet credit وماتت قبل ACK. الرسالة هتتكرر؛ unique business posting لازم تمنع credit تانية، مش مجرد set في memory."
  },
  "consistency-models": {
    "simple": "مش كل جزء من النظام لازم يشوف آخر write في نفس اللحظة. حدد مقدار التأخر المسموح لكل use case، بدل وصف النظام كله قوي أو eventual وخلاص.",
    "example": "كتالوج الأسعار ممكن يعرض نسخة قديمة شوية؛ تأكيد الدفع أو spend balance لازم يتراجع في source يحقق invariant المطلوبة وقت العملية."
  },
  "sagas": {
    "simple": "لما العملية تمشي بين أنظمة، الفشل ممكن يحصل بعد نجاح خطوة. Compensation خطوة business جديدة تعالج الأثر، مش time machine ترجع كل شيء.",
    "example": "احجز مخزون ثم ادفع؛ لو تأكيد الطلب فشل بعد capture، اعمل reconciliation ثم refund حسب policy. refund نفسها ممكن تكون pending وتحتاج متابعة."
  },
  "slo-error-budgets": {
    "simple": "بدل السيستم شغال، عرّف طلبات المستخدم الناجحة وإزاي تقيسها، وحدد هدفًا خلال مدة. Error budget يحوّل الاعتمادية لقرار مبني على أثر حقيقي.",
    "example": "HTTP 200 لcheckout غلط أو بطيئة مش بالضرورة good event. Request-based budget تحسب طلبات، مش دقائق downtime تلقائيًا."
  },
  "capacity-planning": {
    "simple": "فرّق عدد الطلبات المكتملة في الثانية عن وقت الطلب وعن عدد الطلبات الموجودة في النظام. قرب saturation، queue والانتظار ممكن يزيدوا بسرعة.",
    "example": "Producer تضيف 100 job/sec والـworkers تخلص 80: backlog هتكبر. زيادة workers من غير DB headroom ممكن تزود المشكلة، فقِس النظام كله."
  },
  "resilience": {
    "simple": "صمّم تصرفًا مفهومًا وقت العطل: حدود انتظار ومحاولات وتوازي وعزل resources. Fallback لازم تحافظ على الحقيقة، مش ترجع success عشان تخبي outage.",
    "example": "تعطّل مزود reports ما يستهلكش كل workers الخاصة بالدفع. رجّع pending/unavailable أو stale معروفة حسب policy وراقب الأثر."
  },
  "test-design": {
    "simple": "اختَر قواعد مستقلة تثبت النتيجة، مش assertions بتكرر implementation. Examples وproperties وfakes واختبارات التكامل كل واحدة تشوف جزء مختلف من المخاطرة.",
    "example": "Merge صحيحة تحافظ على multiset وتطلع sorted output وطول صحيح. طول الناتج لوحده ممكن يعدي حل بيضيع عنصر ويكرر غيره."
  },
  "ci-release": {
    "simple": "Pipeline مفيدة لما تنتج release معروفة ومختبرة وتسمح بنشر ورجوع مدروسين. Green build مش إثبات لكل security أو business behavior.",
    "example": "انشر نفس artifact من commit وlock محددين، مع secrets runtime، وschema متوافقة وworker restart ومراقبة بعد rollout."
  },
  "crypto-basics": {
    "simple": "حدد عايز سرية ولا إثبات إن الرسالة لم تتغير ولا تخزين password بأمان؛ دي أهداف مختلفة. استخدم أدوات موثوقة وkey management بدل ابتكار crypto خاصة.",
    "example": "Password لها slow salted hasher؛ webhook لها signature verification على raw bytes؛ بيانات قابلة للاسترجاع تحتاج authenticated encryption ومفاتيح محمية."
  },
  "privacy-retention": {
    "simple": "أي data بتجمعها لازم تعرف غرضها ومين له حق الوصول وإمتى تتمسح وأين توجد نسخ منها. تقليل جمع البيانات بيقلل exposure وتعقيد الحذف.",
    "example": "Support log تحتاج operation ID وerror category، مش card data أو reset token. Soft delete وhashing مش anonymization أو deletion كاملين تلقائيًا."
  },
  "data-contracts": {
    "simple": "اتفق على معنى كل field ووحداتها وحدودها وحالات غيابها، مش مجرد JSON بتتparse. تغيير نوع ID أو enum ممكن يكسر consumer حتى لو payload صالحة.",
    "example": "amount_minor مع currency أوضح من amount مبهمة. Event قديمة في queue لازم تكون لها compatibility/replay policy لما schema تتغير."
  },
  "time-numerics": {
    "simple": "تاريخ تقويمي في timezone مش مدة ثابتة، وقياس elapsed time مختلف عن ساعة الحائط. الأموال والأعداد لها دقة وحدود وrounding policy لازم تتكتب.",
    "example": "اشتراك يجدد عند منتصف الليل المحلي، بينما timeout خمس ثواني تقاس بـmonotonic clock. شهر واحد مش عدد ثواني ثابت لكل الشهور."
  },
  "adr-communication": {
    "simple": "اكتب ليه اتاخد القرار، والبدائل والقيود والتبعات، وإمتى تعيد مراجعته. الهدف إن حد تاني يفهم reasoning، مش يشوف أسماء تقنيات بس.",
    "example": "ADR لاختيار modular monolith توضح team size وtransaction needs ومتى measured bottleneck يبرر فصل service، بدل كلمة قابل للتوسع فقط."
  },
  "engineering-judgment": {
    "simple": "امتلك أثر الشغل: اعرف المخاطرة والدليل وحدود اليقين وإمكانية الرجوع. قل ما اتختبر فعلًا، وما تخليش deadline أو AI confidence يخلوك تتجاهل data loss.",
    "example": "Feature wallet جديدة قرب موعد التسليم لكن race لسه موجودة: اعرض safe slice أو تأجيل أو rollout محدود مع stop criteria، بدل وعد عام إن كله تمام."
  }
};
