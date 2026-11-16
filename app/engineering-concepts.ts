import type {Concept} from './concepts';
export const engineeringConcepts:Concept[] = [
  {
    "id": "requirements",
    "title": "Requirements، Constraints وProblem framing",
    "group": "Engineering",
    "intro": "أول شغل المهندس إنه يحدد المشكلة قبل اختيار الأدوات. Functional requirements بتوصف behavior مطلوب، وquality requirements بتوصف خصائص قابلة للقياس زي latency وavailability. Constraints زي budget وdata residency ووقت التسليم بتحدد مساحة الحلول الممكنة.",
    "how": "اسأل عن المستخدم والسيناريو وحدود النظام ومصدر الحقيقة. ميّز facts من assumptions ومن open questions، واكتب out-of-scope صريح. جملة زي السيستم سريع مش requirement قابلة للاختبار؛ لازم workload وpercentile وthreshold.",
    "when": "قبل feature جديدة أو system design interview، ابدأ بوصف outcomes والفشل والقيود. اكتشاف غموض دلوقتي أوفر من بناء implementation صحيحة لمشكلة مختلفة.",
    "code": "Feature: reserve a seat for checkout.\nFunctional: one active reservation per seat; explicit expiry.\nQuality: p95 response < 300 ms at the agreed test workload.\nConstraint: reuse the current relational DB; one small team.\nAssumption: payments can finish after reservation expiry.\nOpen question: refund or re-reserve after a late success?",
    "walkthrough": [
      "المثال بيحوّل كلمات عامة لقواعد وقرارات قابلة للمراجعة، ومش بيقفل قرار late payment من غير business input.",
      "الـlatency target مرتبط باختبار workload متفق عليه؛ الرقم هنا مثال requirement، مش وعد أداء جاهز."
    ],
    "trap": "اختيار Kafka أو microservices قبل تحديد volume وconsistency requirements ممكن يخلق تعقيد مش بيحل المشكلة.",
    "check": "إيه الأسئلة اللي هتسألها قبل تنفيذ طلب: عايزين تقارير لحظية؟"
  },
  {
    "id": "specification",
    "title": "Acceptance criteria، Invariants وState machines",
    "group": "Engineering",
    "intro": "Acceptance criteria بتقول إيه اللي يثبت إن feature حققت المطلوب. Invariant قاعدة لازم تفضل صحيحة في كل state مسموحة، زي confirmed bookings ما تتجاوزش capacity. State machine بتحدد الحالات والانتقالات بدل booleans متعارضة.",
    "how": "اكتب happy path والـnegative paths والـboundary cases. Given/When/Then طريقة مفيدة لتنظيم المثال، لكن لازم كمان تفكر في concurrent actions وunknown outcomes، مش request واحدة بس.",
    "when": "مناسب للحجز والدفع وطلبات الموافقة. اربط criteria بtests وdomain rules وdatabase constraints؛ ما تسيبش كل الحماية للواجهة أو validation منفصلة عن وقت الكتابة.",
    "code": "States: available -> reserved -> confirmed\nreserved -> expired\nInvariant: confirmed + active reservations <= capacity\nGiven one seat remains\nWhen two reservations race\nThen at most one becomes active\nAnd the loser receives a documented conflict response",
    "walkthrough": [
      "الـinvariant بتقول النتيجة اللي لازم تتصان مهما ترتيب requests اتغير.",
      "State machine بتظهر إن late payment محتاجة transition policy واضحة، مش set paid=true وخلاص."
    ],
    "trap": "اختبارات أمثلة قليلة مش proof عام للـinvariant؛ constraints وreasoning واختبارات التزامن بيكملوا بعض.",
    "check": "لو expired reservation وصلها payment success، أي transition مسموحة وإيه الأثر الخارجي المطلوب؟"
  },
  {
    "id": "correctness",
    "title": "Correctness، Preconditions وLoop invariants",
    "group": "Engineering",
    "intro": "حل المشكلة مش بس output صح على مثال واحد. Preconditions بتحدد assumptions على input، وpostconditions بتحدد نتيجة الدالة. Loop invariant عبارة صحيحة قبل وبعد كل iteration، وبتساعد تثبت ليه algorithm مش بتفوّت حالات.",
    "how": "ابدأ بحل بسيط صحيح، حدد invariant، وبعدها حسّن الأداء من غير فقد contract. عشان termination لازم فيه measure بتتقدم أو نطاق بيصغر. لو contract بتفترض sorted input أو bounded integers، اذكر ده واختبره عند boundary.",
    "when": "مفيد في problem solving ومراجعة business workflows. نفس التفكير يوضح ليه read ثم write منفصلين ممكن يكسروا invariant تحت concurrency.",
    "code": "Binary-search reasoning:\nPrecondition: dense sorted list.\nInvariant: every index before low has value < target;\n           every index at/after high has value >= target.\nProgress: high-low strictly shrinks.\nPostcondition: low is the first qualifying index, or n.",
    "walkthrough": [
      "الشرح بيحدد مش بس اتجاه الحركة، لكن معنى الجزء المستبعد من search space.",
      "اختبار empty وduplicates مفيد، لكن invariant بتشرح ليه نفس الكود صحيح لكل input تحقق assumptions."
    ],
    "trap": "Big O ممتازة لحل غلط مالهاش قيمة؛ correctness وcontract يسبقوا optimization.",
    "check": "إزاي تثبت إن two-pointer merge ما فقدتش عنصر أو غيّرت ترتيب sorted output؟"
  },
  {
    "id": "math-reasoning",
    "title": "Sets، Logic، Probability وEstimation",
    "group": "Engineering",
    "intro": "الرياضيات الأساسية للـbackend بتظهر في uniqueness والمجموعات والـpredicates واحتمالات collision وcapacity estimates. لازم تميّز average من percentile، وrate من count، وprobability من ضمان correctness.",
    "how": "اكتب units في كل حساب وراجع orders of magnitude. P(A and B) مش دايمًا P(A)×P(B) إلا لو independence assumption مناسبة. Uniqueness invariant مهمة ما تتسابش لاحتمال قليل بس من غير constraint أو collision policy.",
    "when": "مناسب لتقدير storage وtraffic وretention واختيار IDs وقراءة metrics. المطلوب تقريب مفيد مع assumptions وrange، مش رقم دقيق وهمي.",
    "code": "Assume 50 requests/second, payload retained = 2 KB.\nRaw/day = 50 * 86400 * 2 KB = 8.64 GB (decimal units).\nThen add indexes, replicas, metadata and retention policy.\nThis is an estimate, not a measured storage footprint.\nA p95 target is not the same as average latency.",
    "walkthrough": [
      "تحديد decimal أو binary units بيمنع اختلافات صامتة، والـraw payload مش إجمالي disk usage.",
      "ابدأ بالـestimate عشان تختار تجربة قياس، وبعدها حدّث assumptions ببيانات حقيقية."
    ],
    "trap": "لو accounts مستقلة نظريًا لكن كلها معتمدة على نفس DB، availability failures غالبًا correlated.",
    "check": "إزاي تقدّر queue backlog growth لو producer rate أكبر من consumer throughput؟"
  },
  {
    "id": "os-processes",
    "title": "Processes، Threads، Containers وScheduling",
    "group": "Engineering",
    "intro": "Process ليها address space وموارد، والـthreads عادة بتشارك memory داخل process. OS scheduler بيوزع CPU time؛ concurrency معناها شغل متداخل، وparallelism معناها تنفيذ متزامن فعلي على أكثر من execution resource.",
    "how": "CPU-bound work بتستفيد من compute capacity، أما I/O-bound work بتستنى شبكة أو disk. زيادة workers بتزوّد concurrency لكنها ممكن تزود DB connections وcontention وmemory وتقلّل الأداء. Containers بتعزل processes باستخدام آليات OS وبتشارك kernel المضيفة عادة، بينما VM بتشغّل guest kernel. Memory/CPU limits والـPID/file limits لسه مهمة، وcontainer مش security boundary كاملة لوحدها.",
    "when": "مهم لاختيار worker counts وفهم PHP-FPM مقابل queue processes أو thread-based runtimes. قِس نوع bottleneck قبل ما تزود concurrency أو تغير اللغة.",
    "code": "8 CPU cores, many workers:\nCPU-bound: more runnable tasks can add scheduling overhead.\nI/O-bound: some concurrency may hide waiting time.\nBut every worker may consume memory and a DB connection.\nMeasure CPU, wait time, active connections and throughput together.",
    "walkthrough": [
      "عدد الـworkers مش عدد cores، والـrequest rate مش دليل لوحده إن المشكلة CPU.",
      "Shared mutable state بين threads محتاجة synchronization؛ بين processes محتاجة IPC أو external coordination حسب الحالة.",
      "Image artifact مش VM كاملة؛ process جوه container ممكن تتقتل بسبب resource limits حتى لو host عندها RAM أكتر، وephemeral filesystem مش storage policy دائمة."
    ],
    "trap": "Async مش مرادف لـparallel، وprocess isolation مش بيخلي كل external side effect atomic.",
    "check": "ليه 100 worker ممكن يخلصوا أقل من 20 worker لنفس workload؟"
  },
  {
    "id": "memory-io",
    "title": "Memory، Virtual memory وI/O locality",
    "group": "Engineering",
    "intro": "RAM المستخدمة وvirtual address space وdisk I/O حاجات مرتبطة لكن مختلفة. Virtual memory بتعزل address spaces وتسمح للـOS بإدارة pages، لكن memory pressure وpage faults ممكن يزودوا latency جدًا؛ مش RAM مجانية بلا حدود.",
    "how": "Data representation وحجم objects وretained references بيأثروا على footprint. Sequential access وbatching مناسبين أحيانًا للـlocality، بينما eager loading ضخم أو buffering لكل file ممكن يستهلك الذاكرة رغم تقليل query count.",
    "when": "مهم في imports وlarge exports وworker leaks. تابع peak RSS والـmemory limit وallocation behavior، وخلي batches bounded وحرّر references الطويلة عند الحاجة.",
    "code": "Large CSV workflow:\nread one bounded batch -> validate -> persist -> release batch\nAvoid: read entire file -> decode entire graph -> retain all errors forever\nMeasure: peak RSS, batch duration, DB pressure, failure restart behavior\nA lazy producer cannot help if the consumer retains every result.",
    "walkthrough": [
      "تقليل query count ممكن يرفع memory؛ لازم تقيس resource tradeoff كله.",
      "OS OOM أو container limit ممكن ينهي process من غير cleanup عادي، فاعتمد على durable checkpoints."
    ],
    "trap": "Garbage collection مش بديل عن تصميم ownership وعمر references أو حدود payload.",
    "check": "لو memory بتزيد مع كل job ومبتقلش، إيه المراجع والـbuffers اللي هتراجعها؟"
  },
  {
    "id": "async-synchronization",
    "title": "Async I/O، Synchronization وCancellation",
    "group": "Engineering",
    "intro": "Async I/O بتسمح للـruntime يشتغل على work تانية أثناء انتظار I/O؛ مش بتحوّل CPU calculation تلقائيًا لشغل parallel. Mutex وsemaphore وqueue primitives بتنظم access أو عدد العمليات حسب runtime، لكن correctness لسه مرتبطة بالـshared state.",
    "how": "حط حدود للتوازي، وتعامل مع partial failure وcancellation وend-to-end deadline. Semaphore بتحد in-flight work، لكن distributed concurrency محتاجة coordinator مناسب؛ local lock مش بيحمي باقي servers.",
    "when": "مناسب لتجميع calls مستقلة أو background pipelines، مع explicit error policy. حافظ على critical sections قصيرة ومتستناش network جوه lock من غير سبب مدروس.",
    "code": "Fetch 3 independent summaries:\n- cap concurrency to protect downstream services\n- give all work a shared deadline budget\n- define whether one failure cancels all or yields partial results\n- do not assume cancellation reverses a request already processed\n- coordinate shared writes atomically after results arrive",
    "walkthrough": [
      "التوازي يقلل total waiting time في ظروف معينة، لكنه ممكن يضغط downstream أو يخلق race جديدة.",
      "Cancellation محلية مش proof إن remote side effect اتلغت؛ unknown outcomes محتاجة reconciliation."
    ],
    "trap": "اعتبار timeout أو cancellation rollback عالمية ممكن يضاعف charging أو mutation.",
    "check": "إمتى تختار queue ومتى تختار bounded async fan-out داخل request؟"
  },
  {
    "id": "network-transport",
    "title": "TCP، UDP، TLS وConnection reuse",
    "group": "Engineering",
    "intro": "TCP بيقدم reliable ordered byte stream داخل اتصال، مش حدود messages ولا exactly-once business requests. UDP datagrams ليها semantics مختلفة، وprotocol زي QUIC بيضيف guarantees فوق UDP. TLS بيضيف confidentiality وintegrity وpeer authentication حسب التحقق.",
    "how": "Application لازم تعمل framing وtimeouts وHTTP semantics فوق النقل. Connection reuse يقلل setup cost، لكن broken idle connections والـproxies وDNS changes يفضلوا احتمالات. Retry بعد disconnect محتاج فهم هل request اتنفذت.",
    "when": "مهم في connection pools وتشخيص latency وحماية transport. متستنتجش business success من وصول bytes أو إن TCP موثوق.",
    "code": "Connection failure timeline:\nclient sends request -> server commits -> response connection breaks\nClient sees an error, but the business effect already happened.\nUse request identity/idempotency and status reconciliation.\nValidate TLS certificates; do not fix failures by disabling verification.",
    "walkthrough": [
      "المثال بيفصل network acknowledgment عن durable application outcome.",
      "Connection pool بتقلل setup لكنها مورد bounded محتاج eviction وtimeouts ومراقبة."
    ],
    "trap": "TCP reliability مش exactly-once API behavior، وTLS encryption مش authorization.",
    "check": "ليه إعادة إرسال POST بعد connection reset ممكن تكون خطرة؟"
  },
  {
    "id": "dns-routing",
    "title": "DNS، Proxies، Load balancing وTrust",
    "group": "Engineering",
    "intro": "DNS بيربط names بrecords قابلة للـcaching، والـload balancer بيوزّع traffic على upstreams حسب health وسياسة routing. Reverse proxy ممكن ينهي TLS ويضيف forwarding headers؛ ده trust boundary لازم يتضبط.",
    "how": "TTL مش وعد إن كل clients هتغيّر الوجهة فورًا، وconnection reuse ممكن يحتفظ باتصال بعد DNS change. Trusted proxies تحدد مين له حق يعلن original IP/scheme؛ client-provided forwarded headers من غير تحقق ممكن تكسر rate limiting وURL generation.",
    "when": "مهم في deployments وmulti-instance routing وتشخيص host/IP issues وSSRF defenses. صمم health checks وconnection draining بدل افتراض switch لحظي.",
    "code": "Client -> trusted edge proxy -> application\nOnly the known proxy may supply trusted forwarding metadata.\nApp uses verified original scheme/IP for redirects and limits.\nDNS cutover requires planning for cached records and open connections.\nReadiness controls routing; liveness answers a different question.",
    "walkthrough": [
      "قائمة proxies موثوقة مش accept-all لمجرد إن التطبيق وراء proxy محلي.",
      "Readiness failure تستبعد instance من traffic، ومش لازم تنهي process زي liveness strategy."
    ],
    "trap": "تغيير DNS مش migration لكل active connections، وHost header غير موثوق ممكن يأثر على generated links.",
    "check": "إزاي تفرّق DNS issue من TLS issue من application timeout باستخدام أدلة؟"
  },
  {
    "id": "relational-model",
    "title": "Relational modeling، Keys وNormalization",
    "group": "Engineering",
    "intro": "Relational model بينظم facts في relations بقواعد على keys والارتباطات. Candidate key بتحدد row uniquely، وforeign key بتحمي association وفق policy. Normalization بتقلل update/insert/delete anomalies بناءً على dependencies، مش مجرد تصغير حجم البيانات.",
    "how": "حدد entities وcardinality والـfunctional dependencies قبل schema. افصل facts اللي بتتغيّر بشكل مستقل، واحتفظ بـhistorical snapshots لما الفاتورة لازم تعرض الماضي. Denormalization deliberate قرار له owner وrefresh/consistency policy.",
    "when": "مناسب لأي نظام shared persistent data. Constraints زي unique وcheck وnot null وforeign keys بتحمي كل write paths، مش endpoint واحدة بس.",
    "code": "Customer(id PK, current_name, ...)\nOrder(id PK, customer_id FK, accepted_billing_snapshot, ...)\nOrderLine(order_id FK, variant_id FK, quantity CHECK > 0, unit_price_snapshot)\nUnique line identity depends on the domain: variant/options may matter.\nDo not join current address to reconstruct an immutable past invoice.",
    "walkthrough": [
      "Current customer profile وhistorical invoice facts ليهم lifecycles مختلفة، فالتكرار هنا مقصود ومبرر.",
      "Schema لازم تحدد deletion/restore behavior؛ cascade لكل association ممكن يمسح تاريخ مطلوب."
    ],
    "trap": "ORM relation method مش DB constraint، وnormalization مش دعوة لتقسيم كل value في جدول مستقل.",
    "check": "إيه anomaly لو supplier_address متكررة في كل product row وبتتعدل جزئيًا؟"
  },
  {
    "id": "storage-indexes",
    "title": "B-trees، LSM، Query cost وStorage trade-offs",
    "group": "Engineering",
    "intro": "Database index مش سحر: structure بتنظم data لتقليل work على access pattern معين. B-tree family مناسبة للـordered/range lookups، وLSM-style engines بتوازن writes مع compaction وread amplification. الاختيار مرتبط بالـengine والـworkload.",
    "how": "Query optimizer بيقارن plans اعتمادًا على stats وتقديرات cost. Index ممكن يبقى مناسب لfilter لكنه مش للـsort، وإضافة index تستهلك disk وCPU وقت writes. Page/cache behavior وselectivity وcovering columns يدخلوا في التكلفة.",
    "when": "مهم لفهم why وراء EXPLAIN بدل حفظ قاعدة index لكل column. ابدأ بقياس query plan والـrows والـI/O على data ممثلة، وبعدها جرّب تغيير واحد.",
    "code": "Workload questions before adding an index:\n- equality, range, ordering, grouping or exact lookup?\n- selectivity and tenant skew?\n- write frequency and storage budget?\n- can the query use a useful left prefix of a composite index?\nCompare actual plan/latency and write cost before vs after.",
    "walkthrough": [
      "مفيش index واحدة أفضل لكل query، والـcache hit ممكن يخلي تجربة صغيرة تخبي disk cost.",
      "LSM وB-tree أوصاف لعائلات تصميم؛ product-specific implementation لازم يتراجع لو القرار معتمد عليه."
    ],
    "trap": "Index على عمود low-cardinality مش دايمًا useless ولا دايمًا مفيدة؛ shape والـselectivity والـcombination هم الأساس.",
    "check": "إمتى index تغطي query تفيد، وإيه تكلفة زيادة الأعمدة فيها؟"
  },
  {
    "id": "mvcc-recovery",
    "title": "MVCC، Write-ahead logging وRecovery",
    "group": "Engineering",
    "intro": "MVCC بتسمح لقراء وكتّاب يشوفوا versions حسب transaction semantics بدل إيقاف كل القراءات. WAL بيسجّل التغييرات المطلوبة للاسترجاع قبل تثبيتها حسب بروتوكول المحرك. Snapshot visibility وcrash durability مش نفس المشكلة.",
    "how": "Isolation level ونوع query بيحددوا النسخة المرئية، والـlocking والـconflict rules بتكمل التحكم. Long-running transactions ممكن تأخر cleanup وتزود storage pressure. Durability وreplication acknowledgment تعتمد على engine configuration.",
    "when": "مهم لتفسير stale reads وvacuum/cleanup pressure وrecovery behavior. Replica مش backup لأنها ممكن تنقل destructive changes؛ اختبر restore وRPO/RTO فعليًا.",
    "code": "Two different questions:\n1. Visibility: which committed row version may this SELECT observe?\n2. Durability: what survives a crash after a successful commit response?\nThen ask: what survives loss of the primary node?\nUse engine docs, explicit settings and crash/restore tests.",
    "walkthrough": [
      "قراءة snapshot قديمة مش بالضرورة bug؛ ممكن تكون العزل المختار.",
      "نجاح local commit مش بالضرورة ضمان zero data loss عند failover إذا replica lag/ack policy تسمح بفقد بيانات."
    ],
    "trap": "حفظ transaction مفتوحة أثناء user interaction أو network calls ممكن يزود locks وversion retention بشكل مؤذٍ.",
    "check": "إيه اللي لازم تختبره عشان تثبت RPO وRTO بدل الاعتماد على backup-success badge؟"
  },
  {
    "id": "coupling-cohesion",
    "title": "Cohesion، Coupling وInformation hiding",
    "group": "Engineering",
    "intro": "Cohesion معناها أجزاء module مترابطة حول مسؤولية مفهومة. Coupling حجم ونوع الاعتماد بين modules. المطلوب مش zero dependencies، لكن dependencies واضحة وثابتة تمنع تغيير تفصيلة من نشر تعديلات في النظام كله.",
    "how": "اجمع behavior اللي بيتغير لأسباب متقاربة، وخبّي decisions المتغيرة ورا boundaries مناسبة. Dependency direction وdata ownership أهم من عدد folders. DRY تخص تكرار knowledge، ومش لازم تجمع سطرين متشابهين لو معناهم وسبب تغيرهم مختلف.",
    "when": "مناسب لإعادة تنظيم services عملاقة أو monolith بتكبر. ابدأ بالـuse cases والـchange patterns، وابعد عن abstraction عامة قبل وجود evidence.",
    "code": "Billing owns: captured amounts, refund rules, provider reconciliation.\nOrders owns: accepted line items and order workflow.\nNotifications consumes committed facts.\nAllowed boundary: Billing API/contract.\nAvoid: every module directly edits every other module's tables.",
    "walkthrough": [
      "تحديد ownership بيقلل اختلاف تعريف paid أو refundable بين شاشات مختلفة.",
      "Contract صغيرة بمعنى واضح أقل coupling من generic interface ضخمة بتكشف كل internals."
    ],
    "trap": "نفس شكل code مش دليل إنه نفس concept، وshared utils ممكن تتحول لمكان coupling مخفي.",
    "check": "إزاي تختبر إن تعديل provider payload مش محتاج تعديلات في كل business services؟"
  },
  {
    "id": "domain-modeling",
    "title": "Domain language، Aggregates وConsistency boundaries",
    "group": "Engineering",
    "intro": "Domain modeling بيحوّل قواعد المجال لسلوك ومصطلحات واضحة. Entity لها identity عبر الوقت، وValue Object تُعرّف بقيمها. Aggregate بيجمع state لازم invariants محددة تتصان جواه، وله boundary للكتابة؛ مش مرادف لأي Eloquent model.",
    "how": "اتفق على لغة مع أصحاب المجال: authorized وcaptured وsettled حالات مختلفة. حدّد مين مصدر الحقيقة لكل fact، وأي قواعد لازم atomic محليًا وأيها ينفع eventual مع compensation. استخدم modular monolith لو ده يكفي بدل distributed transactions مبكرة.",
    "when": "مناسب للمجالات اللي فيها transitions وقواعد مركبة. CRUD البسيط مش لازم يتعمل له DDD بكامل terminology؛ استخدم القدر اللي يقلل الغموض.",
    "code": "Order aggregate:\n- accepts line-item snapshots under defined pricing policy\n- cannot confirm with an invalid reservation state\nPayment aggregate:\n- owns captured/refunded financial state\nCross-boundary workflow: explicit intent/result + reconciliation.\nDo not assume one giant transaction can include a remote provider.",
    "walkthrough": [
      "Boundary بتحدد invariants والـwrite authority، مش مجرد inheritance hierarchy.",
      "أحيانًا invariant مطلوبة هتجبرك تعدّل aggregate boundary أو تختار synchronous coordination؛ القرار حسب requirement."
    ],
    "trap": "Aggregate ضخمة تمسك كل النظام في lock واحدة بتقلل throughput؛ تقسيم زائد ممكن يفقد invariants مهمة.",
    "check": "إيه قاعدة لازم تفضل atomic في حجز مقعد، وإيه side effect ممكن يتأخر؟"
  },
  {
    "id": "message-semantics",
    "title": "Messaging، Delivery guarantees وPoison messages",
    "group": "Engineering",
    "intro": "Message broker بيفصل producer عن consumer، لكن delivery وprocessing guarantees ليهم scope محدد. At-least-once تسمح بالتكرار، وat-most-once قد تفقد رسائل. Exactly-once claim لازم تسأل جوه أي boundary وبتشمل أي state أو external effects.",
    "how": "Ack timing وconsumer crash بيخلقوا windows للتكرار أو الفقد. Consumer لازم dedup/idempotency وربط local state بـdurable message identity. Poison messages محتاجة bounded retries وquarantine/dead-letter مع طريقة replay واعية بالإصدار.",
    "when": "مفيد للـimports والـintegration events والـbackground workflows. حدد ordering per key وحدود retention والـbackpressure؛ partition ordering مش global completion ordering.",
    "code": "Consumer crashes after side effect, before ACK:\nredelivery -> possible duplicate processing\nCountermeasure: durable idempotency + atomic local transition\nMalformed message: bounded retries -> quarantine + alert\nReplay: verify schema version, authorization context and idempotency keys",
    "walkthrough": [
      "ACK بعد التنفيذ يسمح recovery لكنه يفتح duplicate window، فالمستهلك لازم يتحملها.",
      "Dead-letter queue مش trash؛ لازم owner ومراقبة وتصحيح وcontrolled replay."
    ],
    "trap": "ضمان broker transaction مش بالضرورة يشمل إرسال email أو charge عند provider.",
    "check": "إزاي تعالج backlog من messages قديمة بعد تغيير schema من غير فقد أو double effects؟"
  },
  {
    "id": "consistency-models",
    "title": "Consistency models، Replication وPartitions",
    "group": "Engineering",
    "intro": "Consistency model بيحدد القيم اللي clients ممكن يشوفوها وتوقيت ظهور writes. Linearizability بتتصرف كأن العمليات ليها ترتيب لحظي متوافق مع real time. Eventual consistency محتاجة convergence assumptions وسياسة conflict، مش أي stale data تبقى مقبولة.",
    "how": "Read-after-write وmonotonic reads ضمانات session مختلفة عن global linearizability. Replication lag ممكن يخلي order تختفي من read replica بعد إنشائها. أثناء network partition، tradeoff availability/consistency لازم يتحدد حسب كل operation.",
    "when": "مهم في multi-region والتخزين الموزع والـsearch indexes. اختار أضعف ضمان كافي للمجال، ووجّه critical reads لمصدر يحقق المطلوب بدل promise عامة بالنظام كله.",
    "code": "Catalog display: short staleness may be acceptable.\nCheckout availability: authoritative check before commit.\nNew order page: explicit read-after-write policy.\nAnalytics: delayed convergence with a visible freshness timestamp.\nState the guarantee and test its user-visible behavior.",
    "walkthrough": [
      "نفس التطبيق ممكن يحتاج guarantees مختلفة لكتالوج وحركة مالية، فلا تختار consistency slogan لكل حاجة.",
      "الـsticky reads في بعض frameworks جوه request مش ضمان تلقائي عبر requests تالية أو devices مختلفة."
    ],
    "trap": "CAP مش اختيار اتنين من تلاتة في أي وقت؛ موضوعه tradeoff محدد وقت partition.",
    "check": "إيه conflict rule لو اتنين users عدّلوا نفس field offline وبعدين اتصلوا؟"
  },
  {
    "id": "sagas",
    "title": "Sagas، Compensation وWorkflow recovery",
    "group": "Engineering",
    "intro": "Saga workflow بتنسق local steps متعددة ببدائل تعويض لما خطوة لاحقة تفشل. Compensation عملية business جديدة، مش rollback يعيد العالم كأن شيء محصلش؛ refund مثلًا ممكن تتأخر أو تفشل هي كمان.",
    "how": "خزن workflow state وstep identities بشكل durable، وخلي forward/compensating steps idempotent. orchestration بيجمع control flow في coordinator، وchoreography بتوزعه على events؛ الاتنين محتاجين observability وrecovery policy.",
    "when": "مناسب لعمليات عبر services أو provider خارجي، زي حجز/دفع/شحن. لو transaction محلية بسيطة تكفي، متضفش saga عشان الاسم.",
    "code": "reserve inventory -> request payment -> confirm order\nIf payment permanently fails: release reservation.\nIf confirmation fails after payment capture: reconcile, then refund if policy requires.\nPersist: workflow_id, current_step, attempt IDs, result, next action.\nTimeout is unknown until reconciled, not automatic failure.",
    "walkthrough": [
      "كل transition قابلة للاستكمال بعد crash، بدل الاعتماد على stack في process اختفت.",
      "Release reservation وrefund ليهم preconditions؛ لازم تتأكد إن compensation مش بتعكس خطوة نجحت في مسار تاني."
    ],
    "trap": "Compensation مش دايمًا متاحة، وemail اتبعتت مش هتتلغي؛ صمّم irreversible steps ومواعيدها بوعي.",
    "check": "إزاي توقف duplicate compensation لو job التعويض اتنفذت مرتين؟"
  },
  {
    "id": "slo-error-budgets",
    "title": "SLIs، SLOs وError budgets",
    "group": "Engineering",
    "intro": "Availability أو fast لازم تتقاس من منظور المستخدم. SLI metric محددة زي نسبة valid requests الناجحة، وSLO هدف داخل window زمنية، وSLA اتفاق خارجي له شروط. Error budget مقدار الفشل المقبول حسب الهدف، مش تصريح بترك العيوب.",
    "how": "حدد eligible events ومعنى good event وطريقة جمع data، وبعدها اختار target بناءً على احتياج حقيقي وتكلفة تحقيقه. احسب budget burn وalerts مرتبطة بالأثر، وافصل planned exclusions بوضوح بدل تجميل الأرقام.",
    "when": "مفيد لقرارات reliability مقابل سرعة delivery. اختر request-based أو time-based SLI مناسبة، ومتخلطش حساباتهم أو تستبدل end-to-end user view بـCPU uptime.",
    "code": "Request SLI = good eligible requests / all eligible requests\nExample SLO = 99.9% over a defined 30-day window\n1,000,000 eligible requests -> 1,000 non-good requests in this example budget\nDefine timeout, correctness, latency threshold and exclusions explicitly.\nTrack burn rate, not only the final monthly percentage.",
    "walkthrough": [
      "الـ1000 هنا request budget، مش دقائق downtime؛ ده مختلف عن time-based SLO.",
      "نجاح HTTP 200 ممكن ما يبقاش good event لو response غلط أو latency فوق الحد المتفق عليه."
    ],
    "trap": "100% target ممكن يخفي tradeoffs مكلفة، وSLA مش synonym تلقائية لـSLO داخلية.",
    "check": "إزاي alert تكتشف incident بدري من غير إزعاج on-call على كل spike صغيرة؟"
  },
  {
    "id": "capacity-planning",
    "title": "Capacity، Queueing وLoad testing",
    "group": "Engineering",
    "intro": "Capacity planning بتقدّر الطلب والموارد والحدود بدل إضافة servers عشوائيًا. Throughput عدد أعمال مكتملة لكل زمن، وlatency وقت العمل للمستخدم، وconcurrency عدد الأعمال الموجودة في النظام. قرب saturation، الانتظار ممكن يكبر بسرعة.",
    "how": "في نظام مستقر وبحدود متناسقة، Little’s Law: L=λW باستخدام متوسطات مناسبة. Queue producer rate أعلى من drain rate لفترة هيزود backlog. Load tests لازم تمثل shape والـskew والـbursts، وتقيس p95/p99 والأخطاء والـresource pressure.",
    "when": "مفيد قبل launch وعند اختيار worker counts أو DB connection caps. اكتب headroom وخطة degradation؛ benchmark صغير على data في cache مش توقع إنتاج.",
    "code": "Stable example: 100 completed requests/sec * 0.2 sec average in-system time\n=> about 20 average in-flight requests for that boundary.\nIf sustained arrivals exceed completion capacity, this stable estimate no longer holds.\nMeasure queue age, CPU, I/O, lock waits, connections and error rate together.",
    "walkthrough": [
      "الـunits والـsystem boundary لازم يكونوا متطابقين، وLittle’s Law هنا بتستخدم averages مش p95.",
      "Headroom مش رفاهية لو عندك bursts أو recovery replay بعد outage."
    ],
    "trap": "رفع concurrency من غير limit ممكن يقلل throughput بسبب contention أو يوقع downstream.",
    "check": "إيه اللي هتغيّره لو queue age بتزيد وDB saturated رغم workers idle جزء من الوقت؟"
  },
  {
    "id": "resilience",
    "title": "Resilience، Deadlines وGraceful degradation",
    "group": "Engineering",
    "intro": "Resilience معناها النظام يتصرف بشكل معروف تحت failures بدل cascade مفاجئة. Timeouts وbounded retries وjitter وcircuit breaker وbulkheads أدوات مختلفة؛ كل أداة لها failure model وتكلفة وبتحتاج قياس.",
    "how": "ابدأ deadline من caller ووزع budget على calls والمحاولات. Retry بس transient failures والـsafe/idempotent operations. Circuit breaker يمنع hammering لفترة، وbulkhead يعزل resource pools، وdegradation تقلل service بطريقة مفهومة من غير silent data corruption.",
    "when": "مناسب للـthird-party integrations والـcritical APIs. fallback قديمة تنفع catalog، لكنها ممكن تكون ممنوعة في authorization أو financial state.",
    "code": "Report endpoint under provider outage:\n- short connection/request budget\n- bounded retry with jitter only when appropriate\n- separate worker/resource pool from checkout\n- return documented pending/partial state if allowed\n- alert on user impact; recover with controlled replay",
    "walkthrough": [
      "فصل resources يمنع report integration المتعطلة من استهلاك كل capacity الخاصة بالـcheckout.",
      "Fallback لازم تمثل الحقيقة: pending مش success وهمية عشان نخبّي outage."
    ],
    "trap": "Retries في كل layer ممكن تتضاعف exponentially؛ cancellation مش proof إن remote effect اتلغت.",
    "check": "إمتى circuit breaker يبقى مفيد، وإمتى timeout وrate limit أبسط وكفاية؟"
  },
  {
    "id": "test-design",
    "title": "Test design، Properties وTest doubles",
    "group": "Engineering",
    "intro": "اختبار engineering مفيد محتاج oracle مستقلة: إزاي تعرف النتيجة الصح؟ Examples بتختبر حالات، وproperty-based tests بتولّد inputs وتتحقق من invariant زي إن sort تحفظ multiset وتطلع ترتيب صحيح. Coverage وحدها مش جودة assertions.",
    "how": "فرّق fake implementation وstub result وmock interaction expectations. Mock عند boundary اللي محتاج تعزله، مش subject نفسها. اختبر failures والـmetamorphic properties، وخلي randomized failures reproducible بـseed وshrinking لما الأداة تدعم.",
    "when": "مفيد للـparsers والـalgorithms والـbusiness invariants والـregression. Mutation testing ممكن يكشف tests بتعدي رغم تغيير behavior، لكنه تكلفة تُستخدم حيث مفيد.",
    "code": "Merge properties:\n1. output length = len(a) + len(b)\n2. output multiset equals combined input multisets\n3. output is nondecreasing for sorted inputs\n4. empty-list identity holds\nDo not test only one hard-coded example or only total length.",
    "walkthrough": [
      "كل property بتكشف عائلة مختلفة من العيوب، لكن assumptions زي sorted inputs لازم تبقى صريحة.",
      "Fake provider محتاج contract verification منفصلة عشان assumptions بتاعته ماتنفصلش عن الواقع."
    ],
    "trap": "Property tests مش formal proof، وmock-heavy suite ممكن تختبر setup بدل behavior.",
    "check": "إيه independent properties تقدر تختبرها على pagination أو idempotent webhook handler؟"
  },
  {
    "id": "ci-release",
    "title": "CI/CD، Artifacts وSafe changes",
    "group": "Engineering",
    "intro": "Continuous Integration تقلل integration risk بدمج صغير متكرر وchecks. Continuous Delivery بتخلي release قابلة للنشر، وContinuous Deployment ممكن تنشر تلقائيًا وفق policy. Pipeline مش مجرد build أخضر؛ لازم evidence وreproducibility وsafe rollout.",
    "how": "Build artifact من source محددة وlocked dependencies، اختبر قبل production، افصل secrets عن source، وخطط compatible migrations وfeature flags وrollback/forward recovery. Canary أو staged rollout محتاج signal واضح وقرار توقف. لو بتستخدم container image، ثبّت dependency/base-image provenance، قلّل privileges، وافصل runtime secrets وpersistent volumes عن image. إعداد resource limits وhealth behavior جزء من التشغيل مش مجرد Dockerfile بتبني.",
    "when": "مفيد حتى لفريق صغير: checks قليلة ذات قيمة أحسن من مراحل كتير بلا ضمان. Plan failures وworker/schema compatibility، واحتفظ بـrelease identity للتشخيص.",
    "code": "commit -> checks/tests -> immutable artifact -> staging verification\n-> compatible migration -> staged rollout -> health/SLO observation\n-> promote or stop/recover\nKeep provenance: source commit, dependency lock, artifact identity.\nFeature-flag removal and schema cleanup are planned follow-up work.",
    "walkthrough": [
      "نشر نفس artifact المختبرة يقلل اختلاف build بين البيئات، مع runtime config واضحة.",
      "Feature flag ممكن تخفي UI لكن data migration أو background job لسه ماشية؛ لازم تفهم الأثر كله."
    ],
    "trap": "Rollback code ما يرجّعش emails أو destructive data changes؛ CI success مش security proof.",
    "check": "إيه compatibility window اللازمة لو queued payload من release قديمة هيتنفذ بعد الجديدة؟"
  },
  {
    "id": "crypto-basics",
    "title": "Cryptography boundaries، Hashing وKey management",
    "group": "Engineering",
    "intro": "Hashing للـintegrity/fingerprints، password hashing متعمّد البطء ومملح، encryption قابلة للعكس بمفتاح، وMAC/signature لإثبات integrity/authenticity حسب النموذج. دول مش أدوات متبادلة لمجرد إن الناتج شكله unreadable.",
    "how": "استخدم primitives/libraries موثوقة بدل اختراع protocol. حدّد key ownership وrotation وrevocation وnonce requirements حسب scheme. Verification لازم تتم على bytes الصحيحة وبالـalgorithm والـkey الموثوقين، مش token يختار أي policy.",
    "when": "مفيد في password storage وwebhook verification وtoken trust. Encryption مش authorization ولا data minimization، وkey في نفس public repo بتلغي السرية مهما algorithm قوية.",
    "code": "Passwords: framework password hasher + verify + rehash policy.\nReversible sensitive fields: vetted authenticated encryption + managed keys.\nWebhook integrity: provider-documented signature verification over raw payload.\nSecrets exposure: revoke/rotate, update consumers, investigate misuse.\nNever invent a custom encryption or signing format for convenience.",
    "walkthrough": [
      "التقسيم بيحدد security goal قبل اختيار الأداة، وبيمنع خلط SHA-256 السريع بتخزين passwords.",
      "Raw payload مهمة لما provider signature محسوبة على original bytes؛ إعادة JSON encoding ممكن تغيّرها."
    ],
    "trap": "JWT base64url encoding مش encryption، وفك payload مش تحقق signature أو authorization.",
    "check": "إيه اللي لازم يحصل بعد تسريب key غير حذفها من آخر commit؟"
  },
  {
    "id": "privacy-retention",
    "title": "Data minimization، Retention وAudit design",
    "group": "Engineering",
    "intro": "كل data بتجمعها بتضيف مسؤولية تخزين ووصول وحذف ومراقبة. Data minimization معناها تجمع المطلوب لغرض محدد فقط. Retention policy بتحدد عمر أنواع البيانات وإزاي يتوقف الحذف لو فيه requirement استثنائية معتمدة.",
    "how": "افصل operational logs عن audit records وعن financial facts. قلل PII، حدّد access وredaction وbackup lifecycle، ووضح الفرق بين حذف وanonymization وpseudonymization. Requirements القانونية تُراجع حسب المجال، مش افتراض عام من code.",
    "when": "مفيد في logs وanalytics وexports وAI prompts. صمّم deletion/export workflows قابلة للاختبار، وفكّر في replicas/search indexes/backups بدل حذف row واحدة فقط.",
    "code": "Data inventory row:\npurpose | fields | owner | access roles | retention | deletion path\nExample: support diagnostics -> request ID + error category, not raw passwords/tokens.\nAudit record -> actor/action/resource/time/outcome with restricted access.\nDocument where copies exist and how the policy applies to them.",
    "walkthrough": [
      "المصفوفة بتمنع raw request dumps لمجرد الراحة وبتحدد owner لكل dataset.",
      "Audit مفيدة محتاجة integrity/access policy؛ مش كل debug log مناسبة كدليل دائم."
    ],
    "trap": "Hashing قيمة شخصية مش anonymization مضمونة، وsoft delete مش حذف فعلي للـPII.",
    "check": "لو user طلب حذف بياناته، إيه نسخ البيانات غير primary DB لازم تتراجع؟"
  },
  {
    "id": "data-contracts",
    "title": "Serialization، Schemas وCompatibility",
    "group": "Engineering",
    "intro": "عند كل boundary، bytes لازم تتحول لقيم لها schema ومعنى. JSON valid مش معناه payload تحقق required fields أو ranges أو semantics. Encoding وversioning وunknown-field policy بتأثر على compatibility بين clients وservices.",
    "how": "عرّف missing/null/empty semantics وinteger ID representation وtime/currency units. Additive changes غالبًا أسهل لكن مش دايمًا safe لو clients بتفترض exhaustive enum. Validate inbound shape وoutbound contract وحدد error mapping.",
    "when": "مفيد لـAPI/webhooks/messages/files. خلي canonicalization وsignature verification متوافقة مع protocol، ومتعملش deserialize objects غير موثوقة عشان تبادل plain data.",
    "code": "Order event v1:\n{ \"event_id\":\"...\", \"schema_version\":1,\n  \"amount_minor\":1250, \"currency\":\"USD\",\n  \"occurred_at\":\"2026-11-09T01:00:00Z\" }\nContract: integer bounds, required keys, unknown-field policy, valid states.\nA JSON parser succeeding does not validate those rules.",
    "walkthrough": [
      "الوحدات في field name تقلل غموض amount، والـtimestamp بتحدد instant واضح.",
      "Schema version محتاجة supported-version policy وtests/replay strategy، مش مجرد رقم بيتزاد."
    ],
    "trap": "Renaming أو changing meaning لنفس field ممكن يكسر clients حتى لو type ما اتغيرتش.",
    "check": "إزاي تضيف enum case جديدة من غير افتراض إن كل consumer هيتعامل معاها؟"
  },
  {
    "id": "time-numerics",
    "title": "Time، Clocks، Rounding وNumerical limits",
    "group": "Engineering",
    "intro": "Instant على timeline مختلف عن calendar date في timezone، وduration مختلفة عن إضافة شهر تقويمي. Wall clock ممكن تتعدل، بينما monotonic clock أنسب لقياس elapsed time محليًا. Floating-point تقريبية وinteger ليها bounds.",
    "how": "خزن instants باستراتيجية واضحة، واحتفظ بالـbusiness timezone لما rule تقويمية محتاجاها. عرّف rounding currency/scale وoverflow limits بدل casts صامتة. Clock skew وDST وleap dates لازم تدخل الاختبارات المناسبة.",
    "when": "مهم للـbilling والـexpiry والـschedulers والـmetrics. حدد هل expiry تعتمد على authoritative server time، وماتستخدمش local timestamp لوحده كglobal event ordering.",
    "code": "Billing rule: due at local midnight in a named business timezone.\nMeasurement rule: elapsed request duration uses a monotonic clock.\nMoney rule: exact representation + currency + explicit rounding boundary.\nExpiry rule: compare against authoritative clock; test exact boundary.\nDo not equate one calendar month with a fixed number of seconds.",
    "walkthrough": [
      "نفس timestamp format مش بيعني نفس business meaning؛ calendar deadlines لازم توثق timezone/policy.",
      "Minor units مناسبة لحالات كتير، لكن حساب ضرائب ونسب محتاج rounding policy وintermediate precision."
    ],
    "trap": "Timestamp وصول webhook عندك مش ترتيب حصول الأحداث عند provider، وclock synchronization مش ضمان strict total order.",
    "check": "إزاي تختبر expiry قبل وعند وبعد الحد من غير sleep حقيقية؟"
  },
  {
    "id": "adr-communication",
    "title": "ADRs، Technical writing وReview reasoning",
    "group": "Engineering",
    "intro": "قرار engineering محتاج context وبدائل وأسباب وحدود، مش اسم تقنية. ADR قصيرة بتحفظ القرار والتبعات والتاريخ عشان الفريق يقدر يفهم ليه الحل اتاخد، ويغيّره لما assumptions تتغير.",
    "how": "اكتب problem وconstraints والبدائل والقرار وconsequences وvalidation/revisit trigger. PR description تربط concrete behavior بالدليل والـrisks، وreview تفرق correctness blockers عن style preferences.",
    "when": "مفيد في database/cache/provider choices وmigration plans وsystem design interviews. وثّق ما يلزم لفهم القرار، مش transcript للمحادثات أو توثيق كل سطر.",
    "code": "ADR: keep a modular monolith for the next release.\nContext: small team; shared transactional inventory invariant.\nAlternatives: split services now / extract reporting only / stay modular.\nDecision: modular boundaries + explicit ownership; measure bottlenecks.\nConsequences: simpler operations, limited independent deployment.\nRevisit: measured scaling/ownership need that outweighs distribution cost.",
    "walkthrough": [
      "القرار مرتبط بconstraints قابلة للتغير، مش قاعدة إن monolith دائمًا أفضل.",
      "Revisit trigger تمنع بقاء workaround للأبد أو إعادة نفس النقاش من غير evidence جديدة."
    ],
    "trap": "تكرار best practice من غير ربطها بالـworkload والـteam مش reasoning هندسي.",
    "check": "إزاي تشرح tradeoff لغير متخصص من غير إغراقه بأسماء libraries؟"
  },
  {
    "id": "engineering-judgment",
    "title": "Engineering judgment، Ethics وResponsible ownership",
    "group": "Engineering",
    "intro": "Software Engineer مسؤوليته تتعدى كتابة الكود: يفهم أثر failure، يوضح uncertainty، ويحمي data وصلاحيات المستخدمين. لازم تعرف إمتى تجرب بسرعة وإمتى تحتاج review لأن التغيير irreversible أو يمس أموال وبيانات وحقوق.",
    "how": "اسأل عن blast radius وقابلية الرجوع وownership والمراقبة. بلّغ limitations بدقة، متختلقش test evidence أو performance claims، ومتسمحش AI أو docs غير موثوقة توسع permissions من نفسها.",
    "when": "مفيد في incidents والـdata migrations والـAI-assisted work. التعلم يتثبت بـartifacts وتجارب ومراجعة، مش badge أو نسبة أسئلة مكتملة.",
    "code": "Before a risky change:\nWhat is the user-visible benefit and failure impact?\nWhat evidence supports correctness?\nCan we stage, reverse or safely compensate?\nWho owns rollout, monitoring and incident response?\nWhat remains uncertain, and when should we stop?",
    "walkthrough": [
      "الأسئلة بتربط قرار التقنية بنتيجة مستخدم ومسؤولية تشغيلية؛ مش مجرد checklist شكلية.",
      "الـreview يتناسب مع أثر التغيير: تعديل copy يختلف عن حذف بيانات أو تغيير financial invariant."
    ],
    "trap": "الإفراط في الثقة أو إخفاء limitations أخطر من الاعتراف إن النتيجة محتاجة اختبار أو خبير مجال.",
    "check": "لو deadline قريب والاختبارات بتكشف race مالية، إزاي تعرض الخيارات والمخاطر بوضوح؟"
  }
];
