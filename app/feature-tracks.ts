import type {Track} from './content';
export const featureTracks:Track[] = [
  {
    "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟ · Case 1",
        "question": "Design a new paid booking feature. What do you write before the database schema?",
        "lesson": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.\n\nعميل بيقول «عايز booking system». ده لسه مش requirement كفاية. هل بنحجز كرسي لرحلة لها capacity، ولا ميعاد دكتور له مدة، ولا غرفة لكل ليلة؟ الاختلاف ده يغير invariant وطريقة منع التعارض. اكتب مثال مستخدم حقيقي بالأرقام، وحدد إيه داخل النسخة الأولى وإيه خارجها.",
        "model": "Define actors, scope and assumptions. State capacity and fulfillment invariants. Specify states, guards and ownership. Plan failures, recovery and tests.",
        "criteria": [
          {
            "label": "Define actors, scope and assumptions",
            "terms": [
              "actors",
              "scope",
              "assumptions"
            ]
          },
          {
            "label": "State capacity and fulfillment invariants",
            "terms": [
              "invariant",
              "capacity"
            ]
          },
          {
            "label": "Specify states, guards and ownership",
            "terms": [
              "state",
              "guard",
              "owner"
            ]
          },
          {
            "label": "Plan failures, recovery and tests",
            "terms": [
              "recovery",
              "failure",
              "test"
            ]
          }
        ],
        "pitfall": "افصل order/payment/fulfillment وحدد line-level cancellation وبدائل ما بعد الشحن.",
        "conceptIds": [
          "feature-template",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟ · Case 2",
        "question": "Why can a database transaction not make a payment gateway call atomic?",
        "lesson": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.\n\nInvariant قاعدة لازم تفضل صحيحة حتى لو طلبين اشتغلوا مع بعض أو server وقع. مثال: active holds + confirmed allocations لا تتجاوز capacity. مثال تاني: لكل payment operation fulfillment واحدة. كلمة «هنمنع التكرار» وحدها مش invariant واضحة؛ لازم تعرف تكرار إيه وبأي identity.",
        "model": "The provider is outside the local transaction. Avoid network calls while holding locks. Persist intent and outbox atomically. Resolve unknown outcomes through stable references.",
        "criteria": [
          {
            "label": "The provider is outside the local transaction",
            "terms": [
              "external",
              "provider",
              "local"
            ]
          },
          {
            "label": "Avoid network calls while holding locks",
            "terms": [
              "lock",
              "network"
            ]
          },
          {
            "label": "Persist intent and outbox atomically",
            "terms": [
              "outbox",
              "intent"
            ]
          },
          {
            "label": "Resolve unknown outcomes through stable references",
            "terms": [
              "unknown",
              "reconcile",
              "reference"
            ]
          }
        ],
        "pitfall": "أضف deadline وretry budget وstuck operation queue وrunbook للاستعلام الآمن.",
        "conceptIds": [
          "feature-template",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟ · Case 3",
        "question": "What must a paid-booking transition contract contain?",
        "lesson": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.\n\nDB transaction تضمن atomicity للداتا اللي تحت إدارتها، لكنها مش transaction مشتركة مع البنك أو بوابة الدفع. لذلك قصّر الـtransaction: احفظ intent وoutbox ثم commit، وبعدها worker يتصل بالمزود. النتيجة ترجع عبر response موثوق أو webhook أو reconciliation.",
        "model": "Allowed current state and command. Authorization and business guards. Atomic next state and effects. Duplicate and invalid transition behavior.",
        "criteria": [
          {
            "label": "Allowed current state and command",
            "terms": [
              "state",
              "command"
            ]
          },
          {
            "label": "Authorization and business guards",
            "terms": [
              "authorization",
              "guard"
            ]
          },
          {
            "label": "Atomic next state and effects",
            "terms": [
              "atomic",
              "effect"
            ]
          },
          {
            "label": "Duplicate and invalid transition behavior",
            "terms": [
              "duplicate",
              "invalid"
            ]
          }
        ],
        "pitfall": "اجمع القرار الذري حيث يلزم، وصمم cross-boundary workflow وتعويضاتها صراحة.",
        "conceptIds": [
          "feature-template",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟ · Case 4",
        "question": "How would you prove that a feature cannot oversell?",
        "lesson": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.\n\nكل pending state لها وقت متوقع وowner وrecovery action. اعرض pending للعميل بصدق، وحط alert لعمر العملية، وdashboard للاستثناءات. Log فيه correlation IDs من غير card data أو secrets. Reconciliation تلتقط الحالات اللي لم يصل لها event.",
        "model": "State the exact capacity invariant. Use a shared database guard. Run overlapping transactions on the target database. Test expiry, retry and late confirmation.",
        "criteria": [
          {
            "label": "State the exact capacity invariant",
            "terms": [
              "invariant",
              "capacity"
            ]
          },
          {
            "label": "Use a shared database guard",
            "terms": [
              "database",
              "guard",
              "lock"
            ]
          },
          {
            "label": "Run overlapping transactions on the target database",
            "terms": [
              "concurrent",
              "transaction"
            ]
          },
          {
            "label": "Test expiry, retry and late confirmation",
            "terms": [
              "expiry",
              "retry",
              "late"
            ]
          }
        ],
        "pitfall": "افصل order/payment/fulfillment وحدد line-level cancellation وبدائل ما بعد الشحن.",
        "conceptIds": [
          "feature-template",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟ · Case 5",
        "question": "What makes a pending workflow operable in production?",
        "lesson": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.\n\nكل pending state لها وقت متوقع وowner وrecovery action. اعرض pending للعميل بصدق، وحط alert لعمر العملية، وdashboard للاستثناءات. Log فيه correlation IDs من غير card data أو secrets. Reconciliation تلتقط الحالات اللي لم يصل لها event.",
        "model": "Owner and expected completion deadline. Age metrics and actionable alerts. Safe reconciliation and retry policy. Audit trail and exception runbook.",
        "criteria": [
          {
            "label": "Owner and expected completion deadline",
            "terms": [
              "owner",
              "deadline"
            ]
          },
          {
            "label": "Age metrics and actionable alerts",
            "terms": [
              "age",
              "alert",
              "metric"
            ]
          },
          {
            "label": "Safe reconciliation and retry policy",
            "terms": [
              "reconciliation",
              "retry"
            ]
          },
          {
            "label": "Audit trail and exception runbook",
            "terms": [
              "audit",
              "runbook"
            ]
          }
        ],
        "pitfall": "أضف deadline وretry budget وstuck operation queue وrunbook للاستعلام الآمن.",
        "conceptIds": [
          "feature-template",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Booking: آخر مكان، Expiry ودفعة متأخرة",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Booking · Case 1",
        "question": "Two customers reserve the last seat concurrently. Design the safe transaction.",
        "lesson": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.\n\nفي مثالنا session لها capacity=1. العميل يمسك hold لمدة 10 دقائق، يدفع، وبعد تأكيد موثوق نحول الـhold إلى allocation مؤكدة. الـhold مش confirmed booking، والـcountdown في المتصفح مجرد عرض؛ وقت السيرفر هو المرجع.",
        "model": "Lock a stable shared session guard. Validate current active holds and confirmed capacity. Persist hold and capacity effect atomically. Replay a stable client operation and test concurrency.",
        "criteria": [
          {
            "label": "Lock a stable shared session guard",
            "terms": [
              "lock",
              "guard",
              "session"
            ]
          },
          {
            "label": "Validate current active holds and confirmed capacity",
            "terms": [
              "capacity",
              "active",
              "hold"
            ]
          },
          {
            "label": "Persist hold and capacity effect atomically",
            "terms": [
              "atomic",
              "transaction"
            ]
          },
          {
            "label": "Replay a stable client operation and test concurrency",
            "terms": [
              "idempotency",
              "replay",
              "concurrent"
            ]
          }
        ],
        "pitfall": "Guard ذرية على نفس resource لكل مسارات الحجز والتأكيد والإلغاء.",
        "conceptIds": [
          "booking-holds",
          "booking-overlap",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Booking · Case 2",
        "question": "A hold expires, B reserves it, then A payment succeeds. What happens?",
        "lesson": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.\n\nكل reserve/confirm/release لنفس session يعدّي من resource guard واحدة. ممكن تقفل session row ثم تحسب active holds + confirmed داخل transaction، أو تستخدم counters محمية مع expiry cleanup متسق. لا تعتمد على query available ثم insert من غير guard.",
        "model": "Keep B allocation intact. Treat A as paid but unallocated. Start one linked refund or review workflow. Reconcile unknown refund outcomes.",
        "criteria": [
          {
            "label": "Keep B allocation intact",
            "terms": [
              "allocation",
              "ownership"
            ]
          },
          {
            "label": "Treat A as paid but unallocated",
            "terms": [
              "unallocated",
              "late"
            ]
          },
          {
            "label": "Start one linked refund or review workflow",
            "terms": [
              "refund",
              "review"
            ]
          },
          {
            "label": "Reconcile unknown refund outcomes",
            "terms": [
              "unknown",
              "reconciliation"
            ]
          }
        ],
        "pitfall": "تحقق من hold state/expiry تحت guard؛ late success تدخل refund_required.",
        "conceptIds": [
          "booking-holds",
          "booking-overlap",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Booking · Case 3",
        "question": "How do you prevent overlapping doctor appointments?",
        "lesson": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.\n\nاحفظ booking وpayment operation/attempt بروابط واضحة. خُد amount من quote محفوظة. لا تفتح DB transaction وتنتظر provider؛ احفظ intent وoutbox ثم اتصل خارجها. Success URL مش مصدر confirmation.",
        "model": "Use half-open intervals and explicit timezone policy. Enforce overlap at a shared resource boundary. Choose exclusion constraint or stable lock model. Test empty-result races and daylight-saving cases.",
        "criteria": [
          {
            "label": "Use half-open intervals and explicit timezone policy",
            "terms": [
              "interval",
              "timezone"
            ]
          },
          {
            "label": "Enforce overlap at a shared resource boundary",
            "terms": [
              "overlap",
              "guard"
            ]
          },
          {
            "label": "Choose exclusion constraint or stable lock model",
            "terms": [
              "exclusion",
              "lock"
            ]
          },
          {
            "label": "Test empty-result races and daylight-saving cases",
            "terms": [
              "phantom",
              "empty",
              "dst"
            ]
          }
        ],
        "pitfall": "Lock order ثابت وswap atomic؛ staged flow لو فرق مالي خارجي.",
        "conceptIds": [
          "booking-holds",
          "booking-overlap",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Booking · Case 4",
        "question": "How do you safely reschedule a confirmed booking?",
        "lesson": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.\n\nCancellation تحدد cutoff والرسوم وما إذا كانت هناك refund. Release مكان مؤكد وفتح refund operation لازم تكون خطوات موثقة؛ لا تخلط فشل refund مع رجوع المكان. ضع policies للـno-show والإلغاء من المنظم.",
        "model": "Authorize and validate target availability. Acquire old and new resource guards in stable order. Swap allocation atomically when local. Use a staged policy for external price differences.",
        "criteria": [
          {
            "label": "Authorize and validate target availability",
            "terms": [
              "authorize",
              "availability"
            ]
          },
          {
            "label": "Acquire old and new resource guards in stable order",
            "terms": [
              "lock",
              "order"
            ]
          },
          {
            "label": "Swap allocation atomically when local",
            "terms": [
              "atomic",
              "swap"
            ]
          },
          {
            "label": "Use a staged policy for external price differences",
            "terms": [
              "staged",
              "price",
              "workflow"
            ]
          }
        ],
        "pitfall": "Guard ذرية على نفس resource لكل مسارات الحجز والتأكيد والإلغاء.",
        "conceptIds": [
          "booking-holds",
          "booking-overlap",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Booking · Case 5",
        "question": "Which monitoring and recovery jobs does booking need?",
        "lesson": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.\n\nCancellation تحدد cutoff والرسوم وما إذا كانت هناك refund. Release مكان مؤكد وفتح refund operation لازم تكون خطوات موثقة؛ لا تخلط فشل refund مع رجوع المكان. ضع policies للـno-show والإلغاء من المنظم.",
        "model": "Track held and paid-unallocated age. Expire holds through the same guard. Reconcile unresolved payment operations. Audit changes and alert stuck refunds.",
        "criteria": [
          {
            "label": "Track held and paid-unallocated age",
            "terms": [
              "age",
              "unallocated"
            ]
          },
          {
            "label": "Expire holds through the same guard",
            "terms": [
              "expiry",
              "guard"
            ]
          },
          {
            "label": "Reconcile unresolved payment operations",
            "terms": [
              "reconcile",
              "payment"
            ]
          },
          {
            "label": "Audit changes and alert stuck refunds",
            "terms": [
              "audit",
              "refund",
              "alert"
            ]
          }
        ],
        "pitfall": "تحقق من hold state/expiry تحت guard؛ late success تدخل refund_required.",
        "conceptIds": [
          "booking-holds",
          "booking-overlap",
          "workflow-state-contract",
          "business-idempotency"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Payments: من Click لحد Settlement من غير Double Charge",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Payments · Case 1",
        "question": "The provider charged the card but your HTTP request timed out. What do you do?",
        "lesson": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.\n\nOrder هي التزام البيع، payment operation نية دفع مبلغ محدد، attempt محاولة تنفيذ، وprovider reference هو رابط الطرف الخارجي. ممكن order تفشل لها attempt ثم تنجح أخرى؛ لازم سياسة تمنع نجاح محاولتين من تكرار fulfillment أو زيادة غير معالجة.",
        "model": "Keep outcome unknown instead of failed. Reuse the persisted operation and provider key. Query or reconcile using stable references. Do not create another charge blindly.",
        "criteria": [
          {
            "label": "Keep outcome unknown instead of failed",
            "terms": [
              "unknown",
              "timeout"
            ]
          },
          {
            "label": "Reuse the persisted operation and provider key",
            "terms": [
              "key",
              "operation"
            ]
          },
          {
            "label": "Query or reconcile using stable references",
            "terms": [
              "query",
              "reconcile",
              "reference"
            ]
          },
          {
            "label": "Do not create another charge blindly",
            "terms": [
              "duplicate",
              "charge"
            ]
          }
        ],
        "pitfall": "Stable operation/key مع lookup/reconciliation قبل أي نية دفع بديلة.",
        "conceptIds": [
          "payment-lifecycle",
          "webhook-inbox",
          "business-idempotency",
          "refund-allocation"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Payments · Case 2",
        "question": "How do you secure and process payment webhooks?",
        "lesson": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.\n\nالعميل ينشئ key مرة عند نية دفع محددة ويعيدها عند timeout. السيرفر scope على actor+operation مع fingerprint يشمل order والمبلغ والعملة؛ نفس key ونفس payload تعيد العملية، ونفس key وpayload مختلفة conflict. احفظ operation قبل external call.",
        "model": "Verify raw-body signature and provider account. Validate business amount, currency and reference. Persist a durable unique inbox record before acknowledgment. Apply effect and processed status transactionally.",
        "criteria": [
          {
            "label": "Verify raw-body signature and provider account",
            "terms": [
              "signature",
              "raw",
              "account"
            ]
          },
          {
            "label": "Validate business amount, currency and reference",
            "terms": [
              "amount",
              "currency",
              "reference"
            ]
          },
          {
            "label": "Persist a durable unique inbox record before acknowledgment",
            "terms": [
              "inbox",
              "durable"
            ]
          },
          {
            "label": "Apply effect and processed status transactionally",
            "terms": [
              "effect",
              "transaction"
            ]
          }
        ],
        "pitfall": "Unique semantic fulfillment effect مع outbox transactional.",
        "conceptIds": [
          "payment-lifecycle",
          "webhook-inbox",
          "business-idempotency",
          "refund-allocation"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Payments · Case 3",
        "question": "Why is event ID deduplication insufficient for order fulfillment?",
        "lesson": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.\n\nممكن provider خصم والرد ضاع. خلي operation processing/unknown، واعرض الحالة للعميل بدل تشجيع محاولة جديدة تلقائيًا. Worker يستعلم بنفس reference، ويستقبل webhook، ويعمل reconcile. Confirmed failure مختلفة عن انقطاع الشبكة.",
        "model": "Different events can represent the same business outcome. Use a semantic operation-effect uniqueness constraint. Commit state and outbox atomically. Make consumers replay-safe.",
        "criteria": [
          {
            "label": "Different events can represent the same business outcome",
            "terms": [
              "different",
              "event",
              "business"
            ]
          },
          {
            "label": "Use a semantic operation-effect uniqueness constraint",
            "terms": [
              "unique",
              "effect"
            ]
          },
          {
            "label": "Commit state and outbox atomically",
            "terms": [
              "outbox",
              "atomic"
            ]
          },
          {
            "label": "Make consumers replay-safe",
            "terms": [
              "replay",
              "idempotent"
            ]
          }
        ],
        "pitfall": "Redirect تعرض pending؛ server evidence فقط تحدث حالة الدفع.",
        "conceptIds": [
          "payment-lifecycle",
          "webhook-inbox",
          "business-idempotency",
          "refund-allocation"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Payments · Case 4",
        "question": "Explain authorization, capture, settlement and refund.",
        "lesson": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.\n\nتحقق من signature على raw body بالطريقة الرسمية، ومن account/environment وbusiness reference والمبلغ والعملة. خزّن inbox بشكل durable قبل ACK؛ worker يعالج الحدث transactionally. event ID تمنع إعادة نفس event، وeffect business key تمنع حدثين مختلفين لنفس الدفع من عمل shipment مرتين.",
        "model": "Authorization approves or reserves subject to method rules. Capture initiates collection under provider rules. Settlement is a separate funds movement stage. Refund is a separate return workflow.",
        "criteria": [
          {
            "label": "Authorization approves or reserves subject to method rules",
            "terms": [
              "authorization",
              "reserve"
            ]
          },
          {
            "label": "Capture initiates collection under provider rules",
            "terms": [
              "capture",
              "collect"
            ]
          },
          {
            "label": "Settlement is a separate funds movement stage",
            "terms": [
              "settlement",
              "funds"
            ]
          },
          {
            "label": "Refund is a separate return workflow",
            "terms": [
              "refund",
              "workflow"
            ]
          }
        ],
        "pitfall": "Stable operation/key مع lookup/reconciliation قبل أي نية دفع بديلة.",
        "conceptIds": [
          "payment-lifecycle",
          "webhook-inbox",
          "business-idempotency",
          "refund-allocation"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Payments · Case 5",
        "question": "How should payment operation idempotency be scoped?",
        "lesson": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.\n\nاستخدم hosted/tokenized collection حسب integration، ولا تحفظ CVC بعد authorization حتى لو encrypted. قلل ما يمر بنظامك من card data، وسجل references لا secrets. تحديد PCI scope يتم على التكامل الفعلي وليس بوضع كلمة tokenization في التصميم.",
        "model": "Use actor and operation-scoped stable key. Bind the key to a payload fingerprint. Return current result on identical replay. Respect provider retention and keep business uniqueness.",
        "criteria": [
          {
            "label": "Use actor and operation-scoped stable key",
            "terms": [
              "actor",
              "scope",
              "key"
            ]
          },
          {
            "label": "Bind the key to a payload fingerprint",
            "terms": [
              "fingerprint",
              "payload"
            ]
          },
          {
            "label": "Return current result on identical replay",
            "terms": [
              "replay",
              "result"
            ]
          },
          {
            "label": "Respect provider retention and keep business uniqueness",
            "terms": [
              "retention",
              "unique"
            ]
          }
        ],
        "pitfall": "Unique semantic fulfillment effect مع outbox transactional.",
        "conceptIds": [
          "payment-lifecycle",
          "webhook-inbox",
          "business-idempotency",
          "refund-allocation"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Wallet & P2P: الـLedger أولًا، والـBalance نتيجة",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Wallet & P2P · Case 1",
        "question": "A wallet has posted 100 and holds 60. Two transfers of 30 arrive. Design the result.",
        "lesson": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.\n\nWallet balance رقم مشتق من سجل حركات له تفسير. في نموذج منصة تحتفظ بالتزام تجاه العميل، WalletA حساب liability credit-normal: credit تزوده وdebit ينقصه. CashAsset حساب asset debit-normal: debit يزوده. إذن debit مش معناها سحب في كل الحسابات.",
        "model": "Available is 40 before any transfer. Serialize or version-guard current source balance. One transfer succeeds and leaves available 10. Reject the second without partial entries.",
        "criteria": [
          {
            "label": "Available is 40 before any transfer",
            "terms": [
              "available",
              "40"
            ]
          },
          {
            "label": "Serialize or version-guard current source balance",
            "terms": [
              "lock",
              "version",
              "guard"
            ]
          },
          {
            "label": "One transfer succeeds and leaves available 10",
            "terms": [
              "10",
              "one"
            ]
          },
          {
            "label": "Reject the second without partial entries",
            "terms": [
              "reject",
              "atomic"
            ]
          }
        ],
        "pitfall": "Posting guard على source of truth تحت lock/version؛ holds ضمن calculation.",
        "conceptIds": [
          "ledger-double-entry",
          "wallet-balances",
          "ledger-posting",
          "wallet-transfer",
          "currency-fx-fees"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Wallet & P2P · Case 2",
        "question": "Explain the entries for funding A with 100 and transferring 30 to B.",
        "lesson": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.\n\nفي النموذج المختار الـhold حجز منفصل عن posted ledger: posted=100، holds=60، available=40. لو حوّلت 30 تصبح posted=70، holds=60، available=10. عند capture للـ60 تسجل Dr WalletA / Cr MerchantPayable وتزيل hold في نفس commit؛ posted=10 وholds=0 وavailable=10.",
        "model": "Funding debits cash asset by 100. Funding credits A wallet liability by 100. Transfer debits A liability and credits B liability by 30. Debit direction depends on account normality.",
        "criteria": [
          {
            "label": "Funding debits cash asset by 100",
            "terms": [
              "debit",
              "cash"
            ]
          },
          {
            "label": "Funding credits A wallet liability by 100",
            "terms": [
              "credit",
              "liability"
            ]
          },
          {
            "label": "Transfer debits A liability and credits B liability by 30",
            "terms": [
              "30",
              "liability"
            ]
          },
          {
            "label": "Debit direction depends on account normality",
            "terms": [
              "normal",
              "debit"
            ]
          }
        ],
        "pitfall": "اختار encumbrance model واضح؛ capture يرحل ويزيل hold atomic.",
        "conceptIds": [
          "ledger-double-entry",
          "wallet-balances",
          "ledger-posting",
          "wallet-transfer",
          "currency-fx-fees"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Wallet & P2P · Case 3",
        "question": "Why does balanced double-entry not prevent overspending?",
        "lesson": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.\n\nممكن قيد متوازن يكون ضارًا: Dr WalletA 500 / Cr WalletB 500 رغم أن A معها 100. التوازن يثبت أن debit=credit لكل currency، أما صلاحية الصرف فتحتاج guard على available ومصدر بيانات متسق.",
        "model": "Balance validates debit-credit equality per currency. It does not validate source funds or business intent. Guard available balance atomically. Validate authorization, amount and semantic uniqueness.",
        "criteria": [
          {
            "label": "Balance validates debit-credit equality per currency",
            "terms": [
              "balanced",
              "currency"
            ]
          },
          {
            "label": "It does not validate source funds or business intent",
            "terms": [
              "funds",
              "intent"
            ]
          },
          {
            "label": "Guard available balance atomically",
            "terms": [
              "available",
              "atomic"
            ]
          },
          {
            "label": "Validate authorization, amount and semantic uniqueness",
            "terms": [
              "authorization",
              "amount",
              "unique"
            ]
          }
        ],
        "pitfall": "اختبر business amount والـactor والـfingerprint إضافة للتوازن.",
        "conceptIds": [
          "ledger-double-entry",
          "wallet-balances",
          "ledger-posting",
          "wallet-transfer",
          "currency-fx-fees"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Wallet & P2P · Case 4",
        "question": "How does capture work with a separate wallet hold?",
        "lesson": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.\n\nكل transfer لها identity تجارية ثابتة وfingerprint. UNIQUE(reference, posting_kind) تمنع replay من إنشاء journal ثانية. Deadlock retry يعيد نفس العملية كاملة بنفس identity. تحويل A→B وB→A يقفلا الحسابين بنفس الترتيب لتقليل deadlocks.",
        "model": "The hold reduces available without changing posted. Capture posts a new balanced journal. Remove the hold in the same transaction. Replay cannot capture or release twice.",
        "criteria": [
          {
            "label": "The hold reduces available without changing posted",
            "terms": [
              "hold",
              "posted"
            ]
          },
          {
            "label": "Capture posts a new balanced journal",
            "terms": [
              "capture",
              "journal"
            ]
          },
          {
            "label": "Remove the hold in the same transaction",
            "terms": [
              "transaction",
              "remove"
            ]
          },
          {
            "label": "Replay cannot capture or release twice",
            "terms": [
              "replay",
              "twice"
            ]
          }
        ],
        "pitfall": "Posting guard على source of truth تحت lock/version؛ holds ضمن calculation.",
        "conceptIds": [
          "ledger-double-entry",
          "wallet-balances",
          "ledger-posting",
          "wallet-transfer",
          "currency-fx-fees"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Wallet & P2P · Case 5",
        "question": "How do you reverse a transfer after the receiver has spent the funds?",
        "lesson": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.\n\nTrial balance debit=credit لا يثبت أنك طبقت business amount صح. راجع ledger مقابل operational records، وbalance projection مقابل جمع entries، والـcash/receivable مقابل provider statements. لكل فرق exception لها owner.",
        "model": "Never edit or delete the original posted journal. Create a linked correction operation. Apply an explicit insufficient-funds recovery policy. Require authorization and preserve an audit trail.",
        "criteria": [
          {
            "label": "Never edit or delete the original posted journal",
            "terms": [
              "immutable",
              "original"
            ]
          },
          {
            "label": "Create a linked correction operation",
            "terms": [
              "linked",
              "reversal"
            ]
          },
          {
            "label": "Apply an explicit insufficient-funds recovery policy",
            "terms": [
              "policy",
              "insufficient"
            ]
          },
          {
            "label": "Require authorization and preserve an audit trail",
            "terms": [
              "authorization",
              "audit"
            ]
          }
        ],
        "pitfall": "اختار encumbrance model واضح؛ capture يرحل ويزيل hold atomic.",
        "conceptIds": [
          "ledger-double-entry",
          "wallet-balances",
          "ledger-posting",
          "wallet-transfer",
          "currency-fx-fees"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Top-up، Withdrawal وReconciliation عملي",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Top-up، Withdrawal وReconciliation عملي · Case 1",
        "question": "Model an 80 withdrawal before and after bank settlement.",
        "lesson": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.\n\nCard top-up تبدأ payment operation، لا balance update. هل تسمح بالصرف عند confirmation أم settlement أم بعد risk hold؟ ده قرار منتج/مخاطر يعتمد على المصدر، وحالات funding لازم تعكسه. Pending incoming في هذا المثال لا تدخل available.",
        "model": "Reserve available funds first. Reclassify wallet liability into payout payable. On settlement debit payable and credit cash asset. Use separate journals for failure or later return.",
        "criteria": [
          {
            "label": "Reserve available funds first",
            "terms": [
              "hold",
              "reserve"
            ]
          },
          {
            "label": "Reclassify wallet liability into payout payable",
            "terms": [
              "payable",
              "liability"
            ]
          },
          {
            "label": "On settlement debit payable and credit cash asset",
            "terms": [
              "settlement",
              "cash"
            ]
          },
          {
            "label": "Use separate journals for failure or later return",
            "terms": [
              "failure",
              "return",
              "journal"
            ]
          }
        ],
        "pitfall": "Unknown لا restore؛ نفس operation/query/reconcile ثم قرار موثوق.",
        "conceptIds": [
          "topup-chargeback",
          "payout-reconciliation",
          "ledger-posting",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Top-up، Withdrawal وReconciliation عملي · Case 2",
        "question": "Why must a withdrawal timeout not restore wallet funds immediately?",
        "lesson": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.\n\nالمثال: احجز 80 من wallet available. عند اعتماد instruction، في commit واحدة أزل hold وسجل Dr WalletLiability80 / Cr PayoutPayable80 واحفظ outbox. الأموال لم تخرج من cash بعد، لكن لم تعد متاحة للعميل.",
        "model": "The bank may already have executed the transfer. Restoration can enable double spending. Keep unknown funds unavailable. Query and reconcile the same reference.",
        "criteria": [
          {
            "label": "The bank may already have executed the transfer",
            "terms": [
              "executed",
              "bank"
            ]
          },
          {
            "label": "Restoration can enable double spending",
            "terms": [
              "double",
              "spend"
            ]
          },
          {
            "label": "Keep unknown funds unavailable",
            "terms": [
              "unknown",
              "unavailable"
            ]
          },
          {
            "label": "Query and reconcile the same reference",
            "terms": [
              "reference",
              "reconcile"
            ]
          }
        ],
        "pitfall": "Unique funding credit effect + balanced journal في transaction.",
        "conceptIds": [
          "topup-chargeback",
          "payout-reconciliation",
          "ledger-posting",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Top-up، Withdrawal وReconciliation عملي · Case 3",
        "question": "What should a daily withdrawal reconciliation process compare?",
        "lesson": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.\n\nطابق operation ID وexternal reference والمبلغ والعملة والحالة والرسوم والتواريخ. فرّق event time عن booking/value date وcutoff في التقرير. إجمالي net لا يكفي لإثبات صحة كل عملية؛ ممكن نقص وزيادة يعوضوا بعض.",
        "model": "Local and external operation identities. Amount and currency. State, fees and gross-net differences. Cutoff dates and unresolved exceptions.",
        "criteria": [
          {
            "label": "Local and external operation identities",
            "terms": [
              "identity",
              "reference"
            ]
          },
          {
            "label": "Amount and currency",
            "terms": [
              "amount",
              "currency"
            ]
          },
          {
            "label": "State, fees and gross-net differences",
            "terms": [
              "state",
              "fees",
              "net"
            ]
          },
          {
            "label": "Cutoff dates and unresolved exceptions",
            "terms": [
              "cutoff",
              "exception"
            ]
          }
        ],
        "pitfall": "Per-operation reconciliation مع gross/net/fees/date semantics.",
        "conceptIds": [
          "topup-chargeback",
          "payout-reconciliation",
          "ledger-posting",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Top-up، Withdrawal وReconciliation عملي · Case 4",
        "question": "How do you handle a top-up chargeback after the balance was spent?",
        "lesson": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.\n\nChargeback بعد صرف top-up يحتاج case مستقلة وسياسة recovery أو loss/receivable، وليس حذف قيد التمويل. Reconciliation لا تعني أن كل confirmation كانت final أو أن كل chargeback احتيال.",
        "model": "Preserve the original funding journal. Open a linked dispute or recovery case. Apply documented loss or receivable policy. Require authorized auditable corrections.",
        "criteria": [
          {
            "label": "Preserve the original funding journal",
            "terms": [
              "preserve",
              "original"
            ]
          },
          {
            "label": "Open a linked dispute or recovery case",
            "terms": [
              "case",
              "linked"
            ]
          },
          {
            "label": "Apply documented loss or receivable policy",
            "terms": [
              "loss",
              "receivable",
              "policy"
            ]
          },
          {
            "label": "Require authorized auditable corrections",
            "terms": [
              "audit",
              "authorized"
            ]
          }
        ],
        "pitfall": "Unknown لا restore؛ نفس operation/query/reconcile ثم قرار موثوق.",
        "conceptIds": [
          "topup-chargeback",
          "payout-reconciliation",
          "ledger-posting",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Top-up، Withdrawal وReconciliation عملي · Case 5",
        "question": "What controls should guard manual wallet adjustments?",
        "lesson": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.\n\nChargeback بعد صرف top-up يحتاج case مستقلة وسياسة recovery أو loss/receivable، وليس حذف قيد التمويل. Reconciliation لا تعني أن كل confirmation كانت final أو أن كل chargeback احتيال.",
        "model": "Object and amount-scoped authorization. Maker-checker when required by policy. Approval bound to immutable payload version. One semantic posting and audit evidence.",
        "criteria": [
          {
            "label": "Object and amount-scoped authorization",
            "terms": [
              "authorization",
              "amount"
            ]
          },
          {
            "label": "Maker-checker when required by policy",
            "terms": [
              "maker",
              "checker"
            ]
          },
          {
            "label": "Approval bound to immutable payload version",
            "terms": [
              "version",
              "payload"
            ]
          },
          {
            "label": "One semantic posting and audit evidence",
            "terms": [
              "unique",
              "posting",
              "audit"
            ]
          }
        ],
        "pitfall": "Unique funding credit effect + balanced journal في transaction.",
        "conceptIds": [
          "topup-chargeback",
          "payout-reconciliation",
          "ledger-posting",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Ecommerce Checkout: سعر ثابت وآخر قطعة وآخر Coupon",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Ecommerce Checkout · Case 1",
        "question": "Design a checkout for three SKUs when one becomes unavailable.",
        "lesson": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.\n\nCart قابلة لتغيير الكمية والسعر والعروض؛ totals فيها تقديرية. Quote على السيرفر تثبت نسخة pricing بصلاحية. عند تأكيد checkout احفظ snapshot: SKU/variant واسم وقت البيع والكمية والسعر والخصم والضريبة والشحن والعملة والتقريب. العميل لا يحدد unit price أو total.",
        "model": "Use server quote and immutable accepted snapshot. Guard all SKU reservations in stable order. Rollback local reservations if one SKU fails. Define partial fulfillment policy before payment.",
        "criteria": [
          {
            "label": "Use server quote and immutable accepted snapshot",
            "terms": [
              "quote",
              "snapshot"
            ]
          },
          {
            "label": "Guard all SKU reservations in stable order",
            "terms": [
              "guard",
              "order"
            ]
          },
          {
            "label": "Rollback local reservations if one SKU fails",
            "terms": [
              "rollback",
              "atomic"
            ]
          },
          {
            "label": "Define partial fulfillment policy before payment",
            "terms": [
              "partial",
              "policy"
            ]
          }
        ],
        "pitfall": "Reserve atomically وقت checkout مع expiry وownership.",
        "conceptIds": [
          "pricing-snapshot",
          "inventory-reservation",
          "coupon-contention",
          "payment-lifecycle"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Ecommerce Checkout · Case 2",
        "question": "Why should accepted order prices be immutable snapshots?",
        "lesson": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.\n\nاختار policy صريحة: في المثال reserve stock/coupon وقت checkout لمدة محدودة، وليس عند إضافة cart. Stock row لكل SKU/location تتحمى بـguarded update أو lock، والـreservation مرتبطة بـcheckout line. آخر coupon usage تتحجز ذرّيًا كذلك.",
        "model": "Catalog prices can change later. Charges must match the accepted server quote. Refunds need original discount and tax allocation. Store rounding and rule versions.",
        "criteria": [
          {
            "label": "Catalog prices can change later",
            "terms": [
              "price",
              "change"
            ]
          },
          {
            "label": "Charges must match the accepted server quote",
            "terms": [
              "amount",
              "quote"
            ]
          },
          {
            "label": "Refunds need original discount and tax allocation",
            "terms": [
              "refund",
              "allocation",
              "tax"
            ]
          },
          {
            "label": "Store rounding and rule versions",
            "terms": [
              "rounding",
              "version"
            ]
          }
        ],
        "pitfall": "Accepted snapshot + exact amount/currency match قبل effect.",
        "conceptIds": [
          "pricing-snapshot",
          "inventory-reservation",
          "coupon-contention",
          "payment-lifecycle"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Ecommerce Checkout · Case 3",
        "question": "How do you protect the final global coupon redemption?",
        "lesson": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.\n\nبعد snapshot وreservations احفظ order pending_payment وpayment intent/outbox. الاتصال الخارجي بعد commit. Confirmation صحيحة تحوّل reservations إلى allocations وتولد fulfillment effect واحدة. لا تعمل picking أو shipment من return URL.",
        "model": "Validate eligibility on the server. Claim the remaining global slot atomically. Enforce per-customer uniqueness when applicable. Release or consume exactly once through states.",
        "criteria": [
          {
            "label": "Validate eligibility on the server",
            "terms": [
              "eligibility",
              "server"
            ]
          },
          {
            "label": "Claim the remaining global slot atomically",
            "terms": [
              "atomic",
              "limit"
            ]
          },
          {
            "label": "Enforce per-customer uniqueness when applicable",
            "terms": [
              "unique",
              "customer"
            ]
          },
          {
            "label": "Release or consume exactly once through states",
            "terms": [
              "release",
              "state",
              "once"
            ]
          }
        ],
        "pitfall": "Atomic usage claim وحالات redemption محددة.",
        "conceptIds": [
          "pricing-snapshot",
          "inventory-reservation",
          "coupon-contention",
          "payment-lifecycle"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Ecommerce Checkout · Case 4",
        "question": "What if payment succeeds after stock reservations expire?",
        "lesson": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.\n\nBundles تحجز مكونات، وmulti-warehouse تحتاج قرار location قبل حساب الشحن والوعد. Coupon policy تحدد متى usage consumed ومتى تترد، وكذلك حدود per-customer وglobal. Shipping address لها snapshot وserviceability validation؛ تعديل عنوان بعد الشحن workflow مختلف.",
        "model": "Do not blindly fulfill without stock. Use a fresh guarded reservation only if policy allows. Otherwise mark paid-unallocated and request refund. Recover asynchronously with reconciliation.",
        "criteria": [
          {
            "label": "Do not blindly fulfill without stock",
            "terms": [
              "stock",
              "fulfill"
            ]
          },
          {
            "label": "Use a fresh guarded reservation only if policy allows",
            "terms": [
              "guard",
              "policy"
            ]
          },
          {
            "label": "Otherwise mark paid-unallocated and request refund",
            "terms": [
              "unallocated",
              "refund"
            ]
          },
          {
            "label": "Recover asynchronously with reconciliation",
            "terms": [
              "reconcile",
              "recovery"
            ]
          }
        ],
        "pitfall": "Reserve atomically وقت checkout مع expiry وownership.",
        "conceptIds": [
          "pricing-snapshot",
          "inventory-reservation",
          "coupon-contention",
          "payment-lifecycle"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Ecommerce Checkout · Case 5",
        "question": "Which boundaries should checkout keep separate?",
        "lesson": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.\n\nBundles تحجز مكونات، وmulti-warehouse تحتاج قرار location قبل حساب الشحن والوعد. Coupon policy تحدد متى usage consumed ومتى تترد، وكذلك حدود per-customer وglobal. Shipping address لها snapshot وserviceability validation؛ تعديل عنوان بعد الشحن workflow مختلف.",
        "model": "Cart and accepted order snapshot. Stock reservation and shipment movement. Payment and fulfillment outcomes. Coupon reservation and consumption policy.",
        "criteria": [
          {
            "label": "Cart and accepted order snapshot",
            "terms": [
              "cart",
              "snapshot"
            ]
          },
          {
            "label": "Stock reservation and shipment movement",
            "terms": [
              "reservation",
              "shipment"
            ]
          },
          {
            "label": "Payment and fulfillment outcomes",
            "terms": [
              "payment",
              "fulfillment"
            ]
          },
          {
            "label": "Coupon reservation and consumption policy",
            "terms": [
              "coupon",
              "policy"
            ]
          }
        ],
        "pitfall": "Accepted snapshot + exact amount/currency match قبل effect.",
        "conceptIds": [
          "pricing-snapshot",
          "inventory-reservation",
          "coupon-contention",
          "payment-lifecycle"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Refunds، Returns، Shipping وDisputes",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Refunds، Returns، Shipping وDisputes · Case 1",
        "question": "A payment captured 100, refunded 30 and has 50 pending. How much can be requested?",
        "lesson": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.\n\nRMA طلب إرجاع سلعة؛ Refund عملية إعادة أموال؛ Cancellation إيقاف جزء لم يتنفذ؛ Dispute نزاع عبر جهة الدفع. ممكن المنتج يرجع قبل refund أو العكس حسب السياسة. لا تجعل refunded flag تشحن أو ترجع stock تلقائيًا.",
        "model": "Only 20 remains under this reservation policy. Include pending reserved refunds in the budget. Claim the next amount atomically. Release only on confirmed failure.",
        "criteria": [
          {
            "label": "Only 20 remains under this reservation policy",
            "terms": [
              "20",
              "reservation"
            ]
          },
          {
            "label": "Include pending reserved refunds in the budget",
            "terms": [
              "pending",
              "budget"
            ]
          },
          {
            "label": "Claim the next amount atomically",
            "terms": [
              "atomic",
              "guard"
            ]
          },
          {
            "label": "Release only on confirmed failure",
            "terms": [
              "confirmed",
              "failure"
            ]
          }
        ],
        "pitfall": "Reserve under shared guard مع pending+successful totals.",
        "conceptIds": [
          "refund-allocation",
          "fulfillment-returns",
          "pricing-snapshot",
          "webhook-inbox"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Refunds، Returns، Shipping وDisputes · Case 2",
        "question": "Does a successful refund imply that inventory should be restocked?",
        "lesson": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.\n\nلو captured100 وsucceeded_refunds30 وreserved_refunds50 فالمتاح20. Pending reservation تمنع support agent تاني يطلب60 في نفس الوقت. Claim budget وrefund operation داخل transaction؛ ثم call provider خارجها بنفس identity.",
        "model": "No, funds and physical returns are separate. Require receipt and inspection evidence. Classify sellable versus quarantine or write-off. Make each stock movement replay-safe.",
        "criteria": [
          {
            "label": "No, funds and physical returns are separate",
            "terms": [
              "separate",
              "physical"
            ]
          },
          {
            "label": "Require receipt and inspection evidence",
            "terms": [
              "inspection",
              "receipt"
            ]
          },
          {
            "label": "Classify sellable versus quarantine or write-off",
            "terms": [
              "sellable",
              "quarantine"
            ]
          },
          {
            "label": "Make each stock movement replay-safe",
            "terms": [
              "movement",
              "replay"
            ]
          }
        ],
        "pitfall": "افصل RMA inspection وstock movement عن refund.",
        "conceptIds": [
          "refund-allocation",
          "fulfillment-returns",
          "pricing-snapshot",
          "webhook-inbox"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Refunds، Returns، Shipping وDisputes · Case 3",
        "question": "How do you compute a partial refund for a discounted line?",
        "lesson": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.\n\nProvider قد يقبل refund ثم تظل pending أو تفشل لاحقًا. Unknown لا تحرر budget، confirmed failure تحررها مرة، succeeded تثبت المبلغ النهائي. اعرض حالة واضحة للعميل ولا تعده بزمن غير مضمون من التكامل.",
        "model": "Use the original order snapshot. Use allocated line discounts and taxes. Apply explicit shipping and fee policy. Preserve deterministic rounding totals.",
        "criteria": [
          {
            "label": "Use the original order snapshot",
            "terms": [
              "original",
              "snapshot"
            ]
          },
          {
            "label": "Use allocated line discounts and taxes",
            "terms": [
              "discount",
              "tax",
              "allocation"
            ]
          },
          {
            "label": "Apply explicit shipping and fee policy",
            "terms": [
              "shipping",
              "fee",
              "policy"
            ]
          },
          {
            "label": "Preserve deterministic rounding totals",
            "terms": [
              "rounding",
              "total"
            ]
          }
        ],
        "pitfall": "Dispute-aware refund policy ومراجعة exception وتوثيق الأدلة.",
        "conceptIds": [
          "refund-allocation",
          "fulfillment-returns",
          "pricing-snapshot",
          "webhook-inbox"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Refunds، Returns، Shipping وDisputes · Case 4",
        "question": "How should a refund timeout after provider execution be handled?",
        "lesson": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.\n\nCarrier delivered لا تثبت أن المرتجع اتفحص. عند warehouse received ثم inspection تحدد sellable أو quarantine أو write-off. Restock action لها identity تمنع تكرار الزيادة. لو العميل لم يرجع المنتج، refund ناجحة لا تخلق stock.",
        "model": "Keep the operation unknown or pending. Retain the amount reservation. Reuse the same reference for query or retry. Reconcile before releasing or submitting a new refund.",
        "criteria": [
          {
            "label": "Keep the operation unknown or pending",
            "terms": [
              "unknown",
              "pending"
            ]
          },
          {
            "label": "Retain the amount reservation",
            "terms": [
              "retain",
              "reservation"
            ]
          },
          {
            "label": "Reuse the same reference for query or retry",
            "terms": [
              "reference",
              "key"
            ]
          },
          {
            "label": "Reconcile before releasing or submitting a new refund",
            "terms": [
              "reconcile",
              "new"
            ]
          }
        ],
        "pitfall": "Reserve under shared guard مع pending+successful totals.",
        "conceptIds": [
          "refund-allocation",
          "fulfillment-returns",
          "pricing-snapshot",
          "webhook-inbox"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Refunds، Returns، Shipping وDisputes · Case 5",
        "question": "What changes when a dispute overlaps a refund?",
        "lesson": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.\n\nCarrier delivered لا تثبت أن المرتجع اتفحص. عند warehouse received ثم inspection تحدد sellable أو quarantine أو write-off. Restock action لها identity تمنع تكرار الزيادة. لو العميل لم يرجع المنتج، refund ناجحة لا تخلق stock.",
        "model": "Treat dispute as an independent case. Prevent double compensation through explicit policy. Track deadlines and evidence securely. Reconcile all external and local money effects.",
        "criteria": [
          {
            "label": "Treat dispute as an independent case",
            "terms": [
              "dispute",
              "case"
            ]
          },
          {
            "label": "Prevent double compensation through explicit policy",
            "terms": [
              "double",
              "policy"
            ]
          },
          {
            "label": "Track deadlines and evidence securely",
            "terms": [
              "deadline",
              "evidence"
            ]
          },
          {
            "label": "Reconcile all external and local money effects",
            "terms": [
              "reconcile",
              "effect"
            ]
          }
        ],
        "pitfall": "افصل RMA inspection وstock movement عن refund.",
        "conceptIds": [
          "refund-allocation",
          "fulfillment-returns",
          "pricing-snapshot",
          "webhook-inbox"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "SaaS Billing: Renewal، Grace Period وEntitlements",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "SaaS Billing · Case 1",
        "question": "How do subscriptions, invoices and entitlements differ?",
        "lesson": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.\n\nSubscription تحدد plan والـcycle والـeffective dates. Invoice توثق مبلغ فترة محددة. Payment attempts تحاول تحصيلها. Entitlements تحدد features/limits المتاحة للـtenant حتى تاريخ. الفصل يسمح بفهم عميل paid ليناير لكن فبراير past_due.",
        "model": "Subscription defines the recurring contract. Invoice represents a billed period. Attempts collect payment for the invoice. Entitlements define access and limits.",
        "criteria": [
          {
            "label": "Subscription defines the recurring contract",
            "terms": [
              "contract",
              "subscription"
            ]
          },
          {
            "label": "Invoice represents a billed period",
            "terms": [
              "invoice",
              "period"
            ]
          },
          {
            "label": "Attempts collect payment for the invoice",
            "terms": [
              "attempt",
              "payment"
            ]
          },
          {
            "label": "Entitlements define access and limits",
            "terms": [
              "access",
              "limit"
            ]
          }
        ],
        "pitfall": "اربطها بالفترة المدفوعة وversion، لا arrival order.",
        "conceptIds": [
          "subscription-entitlement",
          "workflow-state-contract",
          "business-idempotency",
          "pricing-snapshot"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "SaaS Billing · Case 2",
        "question": "A renewal payment fails. Should access stop immediately?",
        "lesson": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.\n\nالفترة لها identity مستقرة مثل subscription+period_start+invoice_kind. Generate invoice مرة؛ retry collection لنفس invoice لا يخلق فترة جديدة. خزن pricing/plan version والعملة والضرائب وtime boundaries.",
        "model": "Apply the explicit product grace policy. Keep paid-period boundaries separate. Use dunning with bounded retries. Restrict features after the defined deadline.",
        "criteria": [
          {
            "label": "Apply the explicit product grace policy",
            "terms": [
              "grace",
              "policy"
            ]
          },
          {
            "label": "Keep paid-period boundaries separate",
            "terms": [
              "paid",
              "period"
            ]
          },
          {
            "label": "Use dunning with bounded retries",
            "terms": [
              "dunning",
              "retry"
            ]
          },
          {
            "label": "Restrict features after the defined deadline",
            "terms": [
              "deadline",
              "restrict"
            ]
          }
        ],
        "pitfall": "State منفصلة وتواريخ صريحة للـcancel/revoke.",
        "conceptIds": [
          "subscription-entitlement",
          "workflow-state-contract",
          "business-idempotency",
          "pricing-snapshot"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "SaaS Billing · Case 3",
        "question": "A January success event arrives in March. How should it affect access?",
        "lesson": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.\n\nUpgrade فورية قد تولد proration charge/credit؛ downgrade قد تتأجل للتجديد. احسب quote واشرح المبلغ والوقت قبل التأكيد، واحفظ النسخة المقبولة. لا تغير plan_id ثم تكتشف أن الفرق لم يُحصّل.",
        "model": "Validate the original billing period. Do not extend from event arrival time. Check subscription version and trusted state. Apply the source once and reconcile mismatches.",
        "criteria": [
          {
            "label": "Validate the original billing period",
            "terms": [
              "january",
              "period"
            ]
          },
          {
            "label": "Do not extend from event arrival time",
            "terms": [
              "arrival",
              "extend"
            ]
          },
          {
            "label": "Check subscription version and trusted state",
            "terms": [
              "version",
              "state"
            ]
          },
          {
            "label": "Apply the source once and reconcile mismatches",
            "terms": [
              "once",
              "reconcile"
            ]
          }
        ],
        "pitfall": "Server entitlement+tenant guards، tests لكل boundary.",
        "conceptIds": [
          "subscription-entitlement",
          "workflow-state-contract",
          "business-idempotency",
          "pricing-snapshot"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "SaaS Billing · Case 4",
        "question": "How do you implement a mid-cycle upgrade with proration and late payment?",
        "lesson": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.\n\nقياس usage يحتاج event identity وquota period وقاعدة احتساب معروفة. لو limit hard مثل 10 seats، race إضافة عضوين تتطلب guard على quota نفسها. Counter في cache قد يخدم العرض لكن منع تجاوز hard limit يحتاج enforcement مناسب.",
        "model": "Quote effective date and proration clearly. Store the accepted price and plan version. Coordinate collection and entitlement policy. Make retries and late results safe.",
        "criteria": [
          {
            "label": "Quote effective date and proration clearly",
            "terms": [
              "quote",
              "proration"
            ]
          },
          {
            "label": "Store the accepted price and plan version",
            "terms": [
              "snapshot",
              "version"
            ]
          },
          {
            "label": "Coordinate collection and entitlement policy",
            "terms": [
              "collection",
              "entitlement"
            ]
          },
          {
            "label": "Make retries and late results safe",
            "terms": [
              "retry",
              "late"
            ]
          }
        ],
        "pitfall": "اربطها بالفترة المدفوعة وversion، لا arrival order.",
        "conceptIds": [
          "subscription-entitlement",
          "workflow-state-contract",
          "business-idempotency",
          "pricing-snapshot"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "SaaS Billing · Case 5",
        "question": "How do you protect hard quotas and paid features?",
        "lesson": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.\n\nقياس usage يحتاج event identity وquota period وقاعدة احتساب معروفة. لو limit hard مثل 10 seats، race إضافة عضوين تتطلب guard على quota نفسها. Counter في cache قد يخدم العرض لكن منع تجاوز hard limit يحتاج enforcement مناسب.",
        "model": "Enforce tenant-scoped access on the server. Check current entitlement and expiration. Guard concurrent quota consumption. Audit temporary overrides with deadlines.",
        "criteria": [
          {
            "label": "Enforce tenant-scoped access on the server",
            "terms": [
              "tenant",
              "server"
            ]
          },
          {
            "label": "Check current entitlement and expiration",
            "terms": [
              "entitlement",
              "expiry"
            ]
          },
          {
            "label": "Guard concurrent quota consumption",
            "terms": [
              "concurrent",
              "quota"
            ]
          },
          {
            "label": "Audit temporary overrides with deadlines",
            "terms": [
              "audit",
              "deadline"
            ]
          }
        ],
        "pitfall": "State منفصلة وتواريخ صريحة للـcancel/revoke.",
        "conceptIds": [
          "subscription-entitlement",
          "workflow-state-contract",
          "business-idempotency",
          "pricing-snapshot"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Marketplace: Split، Commission وSeller Settlement",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Marketplace · Case 1",
        "question": "A buyer pays 100 with a platform fee of 10. How do you model the split?",
        "lesson": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.\n\nقبل schema حدد merchant-of-record ومين يتحمل refunds/disputes/fees ومتى يستحق البائع الدفع. النظام لا يقرر مسؤوليات مالية أو تنظيمية بمجرد تسمية account. اتفق على الأدوار مع provider/product/risk، وبعدها نمذجها.",
        "model": "Persist gross 100, seller allocation 90 and fee 10. Keep the commission rule snapshot. Record seller payable separately from platform revenue. Account for provider fees and settlement separately.",
        "criteria": [
          {
            "label": "Persist gross 100, seller allocation 90 and fee 10",
            "terms": [
              "100",
              "90",
              "10"
            ]
          },
          {
            "label": "Keep the commission rule snapshot",
            "terms": [
              "snapshot",
              "rule"
            ]
          },
          {
            "label": "Record seller payable separately from platform revenue",
            "terms": [
              "payable",
              "revenue"
            ]
          },
          {
            "label": "Account for provider fees and settlement separately",
            "terms": [
              "fee",
              "settlement"
            ]
          }
        ],
        "pitfall": "Unique settlement item على allocation مع guarded state.",
        "conceptIds": [
          "marketplace-settlement",
          "payout-reconciliation",
          "refund-allocation",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Marketplace · Case 2",
        "question": "Why should payment success not always trigger seller payout?",
        "lesson": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.\n\nPayment confirmed لا تكفي دائمًا لصرف90. قد يحتاج delivery confirmation وreturn window وrisk reserve وKYC status. اعرض pending/available/paid-out بأرقام منفصلة ومصدر يفسر كل مبلغ.",
        "model": "Delivery and return eligibility may not be complete. Risk reserve and onboarding policy can apply. Settlement calculation differs from external payout. Use explicit eligible amount guards.",
        "criteria": [
          {
            "label": "Delivery and return eligibility may not be complete",
            "terms": [
              "delivery",
              "return"
            ]
          },
          {
            "label": "Risk reserve and onboarding policy can apply",
            "terms": [
              "reserve",
              "risk"
            ]
          },
          {
            "label": "Settlement calculation differs from external payout",
            "terms": [
              "settlement",
              "payout"
            ]
          },
          {
            "label": "Use explicit eligible amount guards",
            "terms": [
              "eligible",
              "guard"
            ]
          }
        ],
        "pitfall": "Separate linked correction وreserve/recovery account وفق policy.",
        "conceptIds": [
          "marketplace-settlement",
          "payout-reconciliation",
          "refund-allocation",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Marketplace · Case 3",
        "question": "How do you stop two settlement workers including the same allocation?",
        "lesson": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.\n\nفي نموذج مبسط عند ثبوت receivable100 نسجل Dr ProviderReceivable100 / Cr SellerPayable90 / Cr PlatformRevenue10، مع ملاحظة أن النموذج الفعلي والضرائب والرسوم يتطلبان chart of accounts مناسبة. عند التسوية cash والرسوم تسجل منفصلة حسب تقرير provider.",
        "model": "Define allocation identity. Claim it with a database uniqueness constraint. Commit claim and batch item atomically. Make replay return the existing claim.",
        "criteria": [
          {
            "label": "Define allocation identity",
            "terms": [
              "allocation",
              "identity"
            ]
          },
          {
            "label": "Claim it with a database uniqueness constraint",
            "terms": [
              "unique",
              "database"
            ]
          },
          {
            "label": "Commit claim and batch item atomically",
            "terms": [
              "atomic",
              "batch"
            ]
          },
          {
            "label": "Make replay return the existing claim",
            "terms": [
              "replay",
              "existing"
            ]
          }
        ],
        "pitfall": "Fingerprint وversion validation؛ تغير البيانات يبطل الاعتماد.",
        "conceptIds": [
          "marketplace-settlement",
          "payout-reconciliation",
          "refund-allocation",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Marketplace · Case 4",
        "question": "What happens when a buyer refund arrives after the seller was paid?",
        "lesson": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.\n\nتغيير bank beneficiary خطير: verify + version + approval policy وربما cooling period حسب المتطلبات. Payout instruction تحمل snapshot للمستفيد المعتمد، ولا تقرأ بيانات معدلة بعد approval.",
        "model": "Use the original split allocation. Create linked refund and correction operations. Apply seller recovery or reserve policy. Reconcile and preserve the posted history.",
        "criteria": [
          {
            "label": "Use the original split allocation",
            "terms": [
              "original",
              "split"
            ]
          },
          {
            "label": "Create linked refund and correction operations",
            "terms": [
              "linked",
              "correction"
            ]
          },
          {
            "label": "Apply seller recovery or reserve policy",
            "terms": [
              "recovery",
              "reserve",
              "policy"
            ]
          },
          {
            "label": "Reconcile and preserve the posted history",
            "terms": [
              "reconcile",
              "history"
            ]
          }
        ],
        "pitfall": "Unique settlement item على allocation مع guarded state.",
        "conceptIds": [
          "marketplace-settlement",
          "payout-reconciliation",
          "refund-allocation",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Marketplace · Case 5",
        "question": "How should a payout approval bind its beneficiary?",
        "lesson": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.\n\nتغيير bank beneficiary خطير: verify + version + approval policy وربما cooling period حسب المتطلبات. Payout instruction تحمل snapshot للمستفيد المعتمد، ولا تقرأ بيانات معدلة بعد approval.",
        "model": "Snapshot the verified beneficiary version. Bind approval to amount and payload fingerprint. Reject execution after unapproved changes. Audit maker and checker identities.",
        "criteria": [
          {
            "label": "Snapshot the verified beneficiary version",
            "terms": [
              "snapshot",
              "version"
            ]
          },
          {
            "label": "Bind approval to amount and payload fingerprint",
            "terms": [
              "fingerprint",
              "amount"
            ]
          },
          {
            "label": "Reject execution after unapproved changes",
            "terms": [
              "reject",
              "change"
            ]
          },
          {
            "label": "Audit maker and checker identities",
            "terms": [
              "maker",
              "checker",
              "audit"
            ]
          }
        ],
        "pitfall": "Separate linked correction وreserve/recovery account وفق policy.",
        "conceptIds": [
          "marketplace-settlement",
          "payout-reconciliation",
          "refund-allocation",
          "admin-approvals"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Authentication & Access: من Login إلى Revocation",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Authentication & Access · Case 1",
        "question": "Design object authorization for an authenticated order API.",
        "lesson": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.\n\nتطبيق web first-party على نفس النطاق غالبًا يستفيد من framework session cookies وحماية CSRF المناسبة. Mobile أو third-party API قد تحتاج bearer tokens أو بروتوكول OAuth/OIDC حسب الحالة. JWT ليست تحسينًا تلقائيًا: طريقة التخزين والإلغاء وrotation والـaudience والـissuer أهم من اسم token.",
        "model": "Authentication does not imply ownership. Scope lookup to authorized tenant. Enforce action and state policy on server. Test cross-user and cross-tenant access.",
        "criteria": [
          {
            "label": "Authentication does not imply ownership",
            "terms": [
              "authentication",
              "ownership"
            ]
          },
          {
            "label": "Scope lookup to authorized tenant",
            "terms": [
              "tenant",
              "scope"
            ]
          },
          {
            "label": "Enforce action and state policy on server",
            "terms": [
              "policy",
              "server"
            ]
          },
          {
            "label": "Test cross-user and cross-tenant access",
            "terms": [
              "cross",
              "tenant",
              "test"
            ]
          }
        ],
        "pitfall": "Scope resource وpolicy على action، وإعادة التحقق داخل async work.",
        "conceptIds": [
          "auth-policy",
          "sessions",
          "security",
          "crypto-basics"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Authentication & Access · Case 2",
        "question": "What must happen after successful password authentication?",
        "lesson": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.\n\nاستخدم password hashing من framework وسياسة كلمات سر مناسبة، وقلل تسريب وجود الحساب في responses. Throttling يراعي account/IP/device والمخاطر مع عدم تحويل lockout لأداة تعطيل للمستخدمين. نجاح التحقق يستدعي session ID regeneration لمنع session fixation.",
        "model": "Rotate the session identifier. Apply MFA where required. Set appropriate cookie or token boundaries. Record safe audit context without secrets.",
        "criteria": [
          {
            "label": "Rotate the session identifier",
            "terms": [
              "rotate",
              "session"
            ]
          },
          {
            "label": "Apply MFA where required",
            "terms": [
              "mfa",
              "policy"
            ]
          },
          {
            "label": "Set appropriate cookie or token boundaries",
            "terms": [
              "cookie",
              "token"
            ]
          },
          {
            "label": "Record safe audit context without secrets",
            "terms": [
              "audit",
              "secret"
            ]
          }
        ],
        "pitfall": "Framework session regeneration وضبط cookie وCSRF.",
        "conceptIds": [
          "auth-policy",
          "sessions",
          "security",
          "crypto-basics"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Authentication & Access · Case 3",
        "question": "How do you implement a one-time password-reset flow?",
        "lesson": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.\n\nالـreset token سر قصير العمر، أحادي الاستخدام، مرتبط بحساب وpurpose، ومخزن بطريقة مناسبة تمنع استعمال database leak مباشرة. response لا تؤكد وجود email بلا داعٍ. لا تضع token في logs أو analytics، وحدد سياسة إبطال الجلسات بعد reset.",
        "model": "Use short-lived purpose-bound challenge. Store a protected token representation. Consume it atomically once. Apply session revocation and safe responses.",
        "criteria": [
          {
            "label": "Use short-lived purpose-bound challenge",
            "terms": [
              "expiry",
              "purpose"
            ]
          },
          {
            "label": "Store a protected token representation",
            "terms": [
              "hash",
              "token"
            ]
          },
          {
            "label": "Consume it atomically once",
            "terms": [
              "atomic",
              "once"
            ]
          },
          {
            "label": "Apply session revocation and safe responses",
            "terms": [
              "revoke",
              "response"
            ]
          }
        ],
        "pitfall": "Short expiry وatomic single-use consume قبل تغيير credential.",
        "conceptIds": [
          "auth-policy",
          "sessions",
          "security",
          "crypto-basics"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Authentication & Access · Case 4",
        "question": "When should you choose session cookies instead of bearer tokens?",
        "lesson": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.\n\nاجلب resource ضمن scope المسموح، ثم نفذ policy على action والـstate. لا تعتمد أن معرفة UUID دليل ملكية. Job مؤجلة تحتاج actor/tenant context موثوق وتحققًا من صلاحية التنفيذ الحالية حسب السياسة، خصوصًا لو المستخدم اتشال قبل تشغيلها.",
        "model": "Identify client and trust boundary. Compare CSRF and token storage threats. Define expiry and revocation needs. Prefer established framework flows.",
        "criteria": [
          {
            "label": "Identify client and trust boundary",
            "terms": [
              "client",
              "trust"
            ]
          },
          {
            "label": "Compare CSRF and token storage threats",
            "terms": [
              "csrf",
              "storage"
            ]
          },
          {
            "label": "Define expiry and revocation needs",
            "terms": [
              "expiry",
              "revocation"
            ]
          },
          {
            "label": "Prefer established framework flows",
            "terms": [
              "framework",
              "session"
            ]
          }
        ],
        "pitfall": "Scope resource وpolicy على action، وإعادة التحقق داخل async work.",
        "conceptIds": [
          "auth-policy",
          "sessions",
          "security",
          "crypto-basics"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Authentication & Access · Case 5",
        "question": "How do you test account and permission changes in queued work?",
        "lesson": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.\n\nاجلب resource ضمن scope المسموح، ثم نفذ policy على action والـstate. لا تعتمد أن معرفة UUID دليل ملكية. Job مؤجلة تحتاج actor/tenant context موثوق وتحققًا من صلاحية التنفيذ الحالية حسب السياسة، خصوصًا لو المستخدم اتشال قبل تشغيلها.",
        "model": "Preserve trusted actor and tenant context. Define current versus snapshot authority policy. Recheck sensitive access before effect. Test revoked membership and retry.",
        "criteria": [
          {
            "label": "Preserve trusted actor and tenant context",
            "terms": [
              "actor",
              "tenant"
            ]
          },
          {
            "label": "Define current versus snapshot authority policy",
            "terms": [
              "policy",
              "current"
            ]
          },
          {
            "label": "Recheck sensitive access before effect",
            "terms": [
              "recheck",
              "authorization"
            ]
          },
          {
            "label": "Test revoked membership and retry",
            "terms": [
              "revoked",
              "retry"
            ]
          }
        ],
        "pitfall": "Framework session regeneration وضبط cookie وCSRF.",
        "conceptIds": [
          "auth-policy",
          "sessions",
          "security",
          "crypto-basics"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Multi-tenant SaaS: عزل البيانات والـContext",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Multi-tenant SaaS · Case 1",
        "question": "How do you prevent cross-tenant access in a shared-table CRM?",
        "lesson": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.\n\nShared tables مع tenant_id أقل تكلفة تشغيل غالبًا، لكنها تجعل عزل كل query/write مسؤولية أساسية. Separate schema/database قد تعطي حدودًا مختلفة للنسخ الاحتياطي والتخصيص، مقابل migrations وتشغيل أصعب. الاختيار يعتمد على isolation/scale/restore/compliance requirements وليس عدد العملاء وحده.",
        "model": "Verify membership in a trusted request context. Scope every read and write to tenant. Enforce relationship and uniqueness boundaries. Test jobs, files, search and raw queries.",
        "criteria": [
          {
            "label": "Verify membership in a trusted request context",
            "terms": [
              "membership",
              "context"
            ]
          },
          {
            "label": "Scope every read and write to tenant",
            "terms": [
              "read",
              "write",
              "tenant"
            ]
          },
          {
            "label": "Enforce relationship and uniqueness boundaries",
            "terms": [
              "constraint",
              "unique"
            ]
          },
          {
            "label": "Test jobs, files, search and raw queries",
            "terms": [
              "job",
              "search",
              "test"
            ]
          }
        ],
        "pitfall": "Context lifecycle explicit وfinally cleanup وتجنب mutable singleton.",
        "conceptIds": [
          "domain-modeling",
          "auth-policy",
          "process-lifetimes",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Multi-tenant SaaS · Case 2",
        "question": "Why is accepting X-Tenant-ID without a membership check unsafe?",
        "lesson": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.\n\nالـrequest يحدد workspace المقصودة، والسيرفر يتحقق أن actor يملك membership صالحة فيها. لا تقبل X-Tenant-ID كدليل صلاحية. Global scopes تساعد لكن ليست دليلًا أن كل raw query/report/admin path معزولة؛ defense-in-depth واختبارات leakage لازمة.",
        "model": "The client controls the header. Authentication alone does not grant tenant access. Resolve and authorize membership server-side. Carry only validated context to downstream work.",
        "criteria": [
          {
            "label": "The client controls the header",
            "terms": [
              "client",
              "header"
            ]
          },
          {
            "label": "Authentication alone does not grant tenant access",
            "terms": [
              "authentication",
              "access"
            ]
          },
          {
            "label": "Resolve and authorize membership server-side",
            "terms": [
              "membership",
              "server"
            ]
          },
          {
            "label": "Carry only validated context to downstream work",
            "terms": [
              "validated",
              "context"
            ]
          }
        ],
        "pitfall": "Namespace tenant+query version+permissions الملائمة.",
        "conceptIds": [
          "domain-modeling",
          "auth-policy",
          "process-lifetimes",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Multi-tenant SaaS · Case 3",
        "question": "How can a queue worker leak tenant data between jobs?",
        "lesson": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.\n\nJob تحمل tenant reference موثوقة وoperation ID، وتعيد تهيئة scope بوضوح. Workers طويلة العمر قد تحتفظ بstatic/container state من job سابقة؛ ضع lifecycle لتعيين ومسح context في finally. اعمل test ينفذ tenant A ثم B على نفس worker.",
        "model": "Mutable long-lived state survives a job. Set trusted tenant context per job. Clear context on every success and failure. Test sequential jobs for different tenants.",
        "criteria": [
          {
            "label": "Mutable long-lived state survives a job",
            "terms": [
              "state",
              "worker"
            ]
          },
          {
            "label": "Set trusted tenant context per job",
            "terms": [
              "context",
              "tenant"
            ]
          },
          {
            "label": "Clear context on every success and failure",
            "terms": [
              "clear",
              "finally"
            ]
          },
          {
            "label": "Test sequential jobs for different tenants",
            "terms": [
              "sequential",
              "test"
            ]
          }
        ],
        "pitfall": "Validate relation ضمن نفس boundary وDB constraint مناسبة للنموذج.",
        "conceptIds": [
          "domain-modeling",
          "auth-policy",
          "process-lifetimes",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Multi-tenant SaaS · Case 4",
        "question": "What should tenant-aware cache and export design include?",
        "lesson": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.\n\nإنشاء tenant قد يتضمن owner membership وplan/default settings وstorage/search setup. احفظ provisioning state وsteps idempotent؛ لو external setup فشل لا تعرض tenant ready قبل جاهزية dependencies المطلوبة. Invitation token مرتبطة بالـtenant والدور والexpiry ولا تمنح role أعلى من دعوة المخول.",
        "model": "Namespace by tenant and relevant query policy. Authorize file download independently. Avoid shared fixed export object names. Test identical queries across tenants.",
        "criteria": [
          {
            "label": "Namespace by tenant and relevant query policy",
            "terms": [
              "namespace",
              "tenant"
            ]
          },
          {
            "label": "Authorize file download independently",
            "terms": [
              "download",
              "authorize"
            ]
          },
          {
            "label": "Avoid shared fixed export object names",
            "terms": [
              "object",
              "unique"
            ]
          },
          {
            "label": "Test identical queries across tenants",
            "terms": [
              "query",
              "test"
            ]
          }
        ],
        "pitfall": "Context lifecycle explicit وfinally cleanup وتجنب mutable singleton.",
        "conceptIds": [
          "domain-modeling",
          "auth-policy",
          "process-lifetimes",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Multi-tenant SaaS · Case 5",
        "question": "How do you make tenant onboarding recoverable?",
        "lesson": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.\n\nإنشاء tenant قد يتضمن owner membership وplan/default settings وstorage/search setup. احفظ provisioning state وsteps idempotent؛ لو external setup فشل لا تعرض tenant ready قبل جاهزية dependencies المطلوبة. Invitation token مرتبطة بالـtenant والدور والexpiry ولا تمنح role أعلى من دعوة المخول.",
        "model": "Persist provisioning operation and steps. Make each step replay-safe. Expose ready only after required evidence. Plan rollback, cleanup and operational recovery.",
        "criteria": [
          {
            "label": "Persist provisioning operation and steps",
            "terms": [
              "provision",
              "step"
            ]
          },
          {
            "label": "Make each step replay-safe",
            "terms": [
              "replay",
              "idempotent"
            ]
          },
          {
            "label": "Expose ready only after required evidence",
            "terms": [
              "ready",
              "evidence"
            ]
          },
          {
            "label": "Plan rollback, cleanup and operational recovery",
            "terms": [
              "cleanup",
              "recovery"
            ]
          }
        ],
        "pitfall": "Namespace tenant+query version+permissions الملائمة.",
        "conceptIds": [
          "domain-modeling",
          "auth-policy",
          "process-lifetimes",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Secure Uploads: Quarantine، Processing وPrivate Download",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Secure Uploads · Case 1",
        "question": "How do you design secure direct-to-storage uploads?",
        "lesson": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.\n\nحدد الأنواع والأحجام وعدد الملفات والـquota والـprivacy والـretention. صورة profile عامة تختلف عن identity document خاصة. اسم الملف والامتداد وContent-Type من العميل ليست proof للمحتوى. اختر allowlist وتحقق server-side بوسائل مناسبة لنوع المحتوى.",
        "model": "Create an authorized scoped upload intent. Use opaque keys and bounded policies. Verify the uploaded object server-side. Keep it private until processing approves.",
        "criteria": [
          {
            "label": "Create an authorized scoped upload intent",
            "terms": [
              "intent",
              "authorize"
            ]
          },
          {
            "label": "Use opaque keys and bounded policies",
            "terms": [
              "key",
              "limit"
            ]
          },
          {
            "label": "Verify the uploaded object server-side",
            "terms": [
              "verify",
              "object"
            ]
          },
          {
            "label": "Keep it private until processing approves",
            "terms": [
              "private",
              "quarantine"
            ]
          }
        ],
        "pitfall": "Private by default وdownload authorization قبل grant.",
        "conceptIds": [
          "storage",
          "security",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Secure Uploads · Case 2",
        "question": "Why is checking the filename extension insufficient?",
        "lesson": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.\n\nالملفات تبدأ private/quarantined. بعد evidence لوجود object وحجمه وخصائصه حسب التكامل، worker تفحص النوع/الحجم والمحتوى وتعمل malware scanning أو content processing الملائم. لا تعد المستخدم بأن scanner تثبت الأمان الكامل؛ التحكم في العرض والتنفيذ مهم أيضًا.",
        "model": "The client controls name and MIME. Inspect content under an allowlist policy. Limit parser and decompression resources. Serve content in a safe execution context.",
        "criteria": [
          {
            "label": "The client controls name and MIME",
            "terms": [
              "client",
              "mime"
            ]
          },
          {
            "label": "Inspect content under an allowlist policy",
            "terms": [
              "content",
              "allowlist"
            ]
          },
          {
            "label": "Limit parser and decompression resources",
            "terms": [
              "resource",
              "limit"
            ]
          },
          {
            "label": "Serve content in a safe execution context",
            "terms": [
              "serve",
              "execution"
            ]
          }
        ],
        "pitfall": "Allowlist ومحتوى حقيقي وsafe serving وquarantine.",
        "conceptIds": [
          "storage",
          "security",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Secure Uploads · Case 3",
        "question": "How do you recover a file processor that crashes after writing output?",
        "lesson": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.\n\nObject version/checksum وprocessing version يحددوا المدخل والمخرج. Duplicate storage event لا تنتج thumbnails مرتين. حجز processing state أو CAS يمنع workers متنافسة من اعتماد نتائج قديمة، والـoutput key ترتبط بالنسخة لتجنب overwrite غير مقصود.",
        "model": "Bind work to object and pipeline version. Use deterministic unique output identity. Make retries adopt or safely rebuild output. Sweep orphaned and stuck operations.",
        "criteria": [
          {
            "label": "Bind work to object and pipeline version",
            "terms": [
              "version",
              "pipeline"
            ]
          },
          {
            "label": "Use deterministic unique output identity",
            "terms": [
              "output",
              "unique"
            ]
          },
          {
            "label": "Make retries adopt or safely rebuild output",
            "terms": [
              "retry",
              "rebuild"
            ]
          },
          {
            "label": "Sweep orphaned and stuck operations",
            "terms": [
              "orphan",
              "sweep"
            ]
          }
        ],
        "pitfall": "Pipeline version وjob budget وdead-letter/recovery queue.",
        "conceptIds": [
          "storage",
          "security",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Secure Uploads · Case 4",
        "question": "Does a signed download URL replace authorization?",
        "lesson": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.\n\nاحفظ key لا public URL لمستند خاص. Download endpoint تعمل policy ثم signed URL قصيرة العمر أو stream controlled حسب الحاجة. Signed URL قابلة للاستخدام لمن يملكها حتى انتهاء الصلاحية ضمن عقد المزود؛ لا تسجلها في analytics ولا تعتبرها revoke فورية لمجرد حذف session.",
        "model": "Authorize before issuing the URL. Scope and expire the capability. Avoid leaking it in logs or analytics. Understand revocation limits of the provider.",
        "criteria": [
          {
            "label": "Authorize before issuing the URL",
            "terms": [
              "authorize",
              "before"
            ]
          },
          {
            "label": "Scope and expire the capability",
            "terms": [
              "scope",
              "expiry"
            ]
          },
          {
            "label": "Avoid leaking it in logs or analytics",
            "terms": [
              "log",
              "leak"
            ]
          },
          {
            "label": "Understand revocation limits of the provider",
            "terms": [
              "revocation",
              "provider"
            ]
          }
        ],
        "pitfall": "Private by default وdownload authorization قبل grant.",
        "conceptIds": [
          "storage",
          "security",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Secure Uploads · Case 5",
        "question": "How should deleting a private document and its derivatives work?",
        "lesson": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.\n\nاحفظ key لا public URL لمستند خاص. Download endpoint تعمل policy ثم signed URL قصيرة العمر أو stream controlled حسب الحاجة. Signed URL قابلة للاستخدام لمن يملكها حتى انتهاء الصلاحية ضمن عقد المزود؛ لا تسجلها في analytics ولا تعتبرها revoke فورية لمجرد حذف session.",
        "model": "Validate ownership and retention requirements. Track a deletion operation. Delete originals and derivatives safely. Audit results and reconcile storage metadata.",
        "criteria": [
          {
            "label": "Validate ownership and retention requirements",
            "terms": [
              "ownership",
              "retention"
            ]
          },
          {
            "label": "Track a deletion operation",
            "terms": [
              "deletion",
              "operation"
            ]
          },
          {
            "label": "Delete originals and derivatives safely",
            "terms": [
              "original",
              "derivative"
            ]
          },
          {
            "label": "Audit results and reconcile storage metadata",
            "terms": [
              "audit",
              "reconcile"
            ]
          }
        ],
        "pitfall": "Allowlist ومحتوى حقيقي وsafe serving وquarantine.",
        "conceptIds": [
          "storage",
          "security",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Notifications: Reliable Delivery من غير Spam",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Notifications · Case 1",
        "question": "How do you avoid sending order confirmation for rolled-back orders?",
        "lesson": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.\n\nOrder confirmed حدث domain؛ الإيميل أثر جانبي. احفظ event/outbox مع business transaction عشان لا يخرج تأكيد لطلب اتعمله rollback، ولا تضيع الرسالة لو commit نجحت والـprocess وقع قبل dispatch. afterCommit تمنع قراءة داتا قبلcommit لكنها وحدها لا تعطي durable outbox لكل failure window.",
        "model": "Commit domain state and durable outbox together. Do not send under the transaction lock. Create one semantic notification intent. Test rollback and post-commit crash windows.",
        "criteria": [
          {
            "label": "Commit domain state and durable outbox together",
            "terms": [
              "outbox",
              "commit"
            ]
          },
          {
            "label": "Do not send under the transaction lock",
            "terms": [
              "lock",
              "send"
            ]
          },
          {
            "label": "Create one semantic notification intent",
            "terms": [
              "intent",
              "unique"
            ]
          },
          {
            "label": "Test rollback and post-commit crash windows",
            "terms": [
              "rollback",
              "crash"
            ]
          }
        ],
        "pitfall": "Transactional outbox وworker بعد دليل success.",
        "conceptIds": [
          "outbox",
          "message-semantics",
          "queues",
          "observability"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Notifications · Case 2",
        "question": "Does provider accepted mean an email was delivered?",
        "lesson": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.\n\nDelivery intent واحدة لكل business event+recipient+channel+template purpose. Retry هي attempt جديدة لنفس intent، لا رسالة تجارية جديدة. احفظ template version والـlocale وrendered context الملائم للprivacy عشان تعرف ما الذي أرسلته.",
        "model": "Accepted and delivered are different stages. Track later bounce or complaint evidence. Handle verified callbacks idempotently. Do not resend solely because callback is missing.",
        "criteria": [
          {
            "label": "Accepted and delivered are different stages",
            "terms": [
              "accepted",
              "delivered"
            ]
          },
          {
            "label": "Track later bounce or complaint evidence",
            "terms": [
              "bounce",
              "evidence"
            ]
          },
          {
            "label": "Handle verified callbacks idempotently",
            "terms": [
              "callback",
              "idempotent"
            ]
          },
          {
            "label": "Do not resend solely because callback is missing",
            "terms": [
              "missing",
              "resend"
            ]
          }
        ],
        "pitfall": "Unique intent وprovider contract واضح للtimeout.",
        "conceptIds": [
          "outbox",
          "message-semantics",
          "queues",
          "observability"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Notifications · Case 3",
        "question": "How do you design notification retry policy for transient and permanent failures?",
        "lesson": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.\n\nصنّف permanent failure مثل invalid address مقابل transient rate limit/outage. استخدم backoff+jitter وmax attempts/time budget وdead-letter. لا تعيد spam على hard bounce؛ suppression policy تمنع الإرسال للعناوين المعطوبة أو الممنوعة وفق category.",
        "model": "Classify transient and permanent errors. Use bounded backoff and jitter. Apply suppression and rate budgets. Escalate exhausted or unknown outcomes.",
        "criteria": [
          {
            "label": "Classify transient and permanent errors",
            "terms": [
              "transient",
              "permanent"
            ]
          },
          {
            "label": "Use bounded backoff and jitter",
            "terms": [
              "backoff",
              "jitter"
            ]
          },
          {
            "label": "Apply suppression and rate budgets",
            "terms": [
              "suppression",
              "rate"
            ]
          },
          {
            "label": "Escalate exhausted or unknown outcomes",
            "terms": [
              "unknown",
              "exhausted"
            ]
          }
        ],
        "pitfall": "Allowed transitions/state evidence مع منع regression.",
        "conceptIds": [
          "outbox",
          "message-semantics",
          "queues",
          "observability"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Notifications · Case 4",
        "question": "Can you promise exactly-once external email delivery?",
        "lesson": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.\n\nافصل in-app inbox عن external delivery؛ read receipt للـin-app لا تثبت قراءةemail والعكس. Pagination والـmark-as-read لها object authorization وtenant scope. Bulk campaigns تتقسم batches وrate limits حسب provider والعميل.",
        "model": "A timeout can hide a completed send. Local uniqueness does not control provider behavior. Use provider dedupe or query guarantees when available. Document and test remaining duplicate risk.",
        "criteria": [
          {
            "label": "A timeout can hide a completed send",
            "terms": [
              "timeout",
              "send"
            ]
          },
          {
            "label": "Local uniqueness does not control provider behavior",
            "terms": [
              "local",
              "provider"
            ]
          },
          {
            "label": "Use provider dedupe or query guarantees when available",
            "terms": [
              "dedupe",
              "query"
            ]
          },
          {
            "label": "Document and test remaining duplicate risk",
            "terms": [
              "duplicate",
              "risk"
            ]
          }
        ],
        "pitfall": "Transactional outbox وworker بعد دليل success.",
        "conceptIds": [
          "outbox",
          "message-semantics",
          "queues",
          "observability"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Notifications · Case 5",
        "question": "How should transactional and marketing preferences differ?",
        "lesson": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.\n\nافصل in-app inbox عن external delivery؛ read receipt للـin-app لا تثبت قراءةemail والعكس. Pagination والـmark-as-read لها object authorization وtenant scope. Bulk campaigns تتقسم batches وrate limits حسب provider والعميل.",
        "model": "Classify notification purpose explicitly. Apply per-category channel preferences. Keep security policy distinct. Audit suppression without leaking message secrets.",
        "criteria": [
          {
            "label": "Classify notification purpose explicitly",
            "terms": [
              "category",
              "purpose"
            ]
          },
          {
            "label": "Apply per-category channel preferences",
            "terms": [
              "category",
              "preference"
            ]
          },
          {
            "label": "Keep security policy distinct",
            "terms": [
              "security",
              "policy"
            ]
          },
          {
            "label": "Audit suppression without leaking message secrets",
            "terms": [
              "audit",
              "secret"
            ]
          }
        ],
        "pitfall": "Unique intent وprovider contract واضح للtimeout.",
        "conceptIds": [
          "outbox",
          "message-semantics",
          "queues",
          "observability"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Search & Filtering: Query Contracts وStable Pagination",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Search & Filtering · Case 1",
        "question": "How do you make cursor pagination deterministic for created_at sorting?",
        "lesson": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.\n\nحدد fields قابلة للبحث، filters المدعومة، sort rules، pagination وحاجة exact totals. Search الاسم بالعربي قد يحتاج normalization/tokenization ومراعاة اللغة؛ LIKE wildcard لا تعطي تلقائيًا relevance أو typo tolerance. اكتب أمثلة متوقعة وقياس relevance قبل Elasticsearch.",
        "model": "Add a unique id tie-breaker. Seek using the complete sort tuple. Bind cursor to query and sort context. Explain that ordinary cursors do not guarantee a snapshot.",
        "criteria": [
          {
            "label": "Add a unique id tie-breaker",
            "terms": [
              "unique",
              "tie"
            ]
          },
          {
            "label": "Seek using the complete sort tuple",
            "terms": [
              "tuple",
              "seek"
            ]
          },
          {
            "label": "Bind cursor to query and sort context",
            "terms": [
              "cursor",
              "query"
            ]
          },
          {
            "label": "Explain that ordinary cursors do not guarantee a snapshot",
            "terms": [
              "snapshot",
              "mutable"
            ]
          }
        ],
        "pitfall": "Tie-breaker tuple وcursor query binding مع توثيق consistency.",
        "conceptIds": [
          "sql-indexes",
          "rest-api",
          "consistency-models",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Search & Filtering · Case 2",
        "question": "How do you safely expose arbitrary catalog filters?",
        "lesson": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.\n\nAllowlist لأسماء filter/sort والـoperators؛ values تستخدم parameter binding، وأسماء الأعمدة لا تأخذها خامًا من client. حدّد max page size وتعقيد filters ووقت التنفيذ. Tenant/visibility constraints تفرض server-side في query نفسها، لا بعد pagination حيث تتسرب counts أو تتفرغ الصفحات.",
        "model": "Allowlist fields and operators. Bind values instead of interpolating SQL. Bound complexity and page sizes. Enforce tenant visibility before pagination.",
        "criteria": [
          {
            "label": "Allowlist fields and operators",
            "terms": [
              "allowlist",
              "operator"
            ]
          },
          {
            "label": "Bind values instead of interpolating SQL",
            "terms": [
              "binding",
              "parameter"
            ]
          },
          {
            "label": "Bound complexity and page sizes",
            "terms": [
              "limit",
              "page"
            ]
          },
          {
            "label": "Enforce tenant visibility before pagination",
            "terms": [
              "tenant",
              "before"
            ]
          }
        ],
        "pitfall": "Tenant/visibility predicates داخل data access نفسها.",
        "conceptIds": [
          "sql-indexes",
          "rest-api",
          "consistency-models",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Search & Filtering · Case 3",
        "question": "What if search shows stock that checkout cannot sell?",
        "lesson": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.\n\nلو الترتيب created_at DESC أضف id DESC كـunique tie-breaker. Cursor تحمل آخر tuple وتربط بالـquery/sort/tenant المناسبة، وتتحقق من صحتها. Seek condition تطلب ما بعد tuple بدل skip ملايين الصفوف. Offset قد يكون كافيًا لصفحات صغيرة واحتياج page number.",
        "model": "Treat search as a lagging projection. Validate stock in the authoritative checkout guard. Return an explicit conflict or new quote. Monitor indexing lag and recovery.",
        "criteria": [
          {
            "label": "Treat search as a lagging projection",
            "terms": [
              "projection",
              "lag"
            ]
          },
          {
            "label": "Validate stock in the authoritative checkout guard",
            "terms": [
              "authoritative",
              "guard"
            ]
          },
          {
            "label": "Return an explicit conflict or new quote",
            "terms": [
              "conflict",
              "quote"
            ]
          },
          {
            "label": "Monitor indexing lag and recovery",
            "terms": [
              "lag",
              "recovery"
            ]
          }
        ],
        "pitfall": "Version-aware upsert/delete مع rebuild catch-up.",
        "conceptIds": [
          "sql-indexes",
          "rest-api",
          "consistency-models",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Search & Filtering · Case 4",
        "question": "How can an old search update resurrect a deleted record?",
        "lesson": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.\n\nبعد DB commit أنشئ index change عبر outbox أو CDC بidentity/version. Worker لا تسمح event أقدم تكتب فوق document أحدث. Delete تحتاج tombstone/version؛ تأخير delete لا يبيح إعادة بيانات خاصة من index.",
        "model": "Events can arrive out of order. Keep source versions and delete semantics. Reject stale updates against newer tombstones. Test rebuild catch-up with concurrent writes.",
        "criteria": [
          {
            "label": "Events can arrive out of order",
            "terms": [
              "order",
              "event"
            ]
          },
          {
            "label": "Keep source versions and delete semantics",
            "terms": [
              "version",
              "delete"
            ]
          },
          {
            "label": "Reject stale updates against newer tombstones",
            "terms": [
              "stale",
              "tombstone"
            ]
          },
          {
            "label": "Test rebuild catch-up with concurrent writes",
            "terms": [
              "rebuild",
              "concurrent"
            ]
          }
        ],
        "pitfall": "Tie-breaker tuple وcursor query binding مع توثيق consistency.",
        "conceptIds": [
          "sql-indexes",
          "rest-api",
          "consistency-models",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Search & Filtering · Case 5",
        "question": "When do you introduce a dedicated search engine?",
        "lesson": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.\n\nبعد DB commit أنشئ index change عبر outbox أو CDC بidentity/version. Worker لا تسمح event أقدم تكتب فوق document أحدث. Delete تحتاج tombstone/version؛ تأخير delete لا يبيح إعادة بيانات خاصة من index.",
        "model": "Define relevance and query requirements first. Measure SQL and index performance. Account for operational and consistency costs. Plan sync, rebuild and authorization.",
        "criteria": [
          {
            "label": "Define relevance and query requirements first",
            "terms": [
              "relevance",
              "requirement"
            ]
          },
          {
            "label": "Measure SQL and index performance",
            "terms": [
              "sql",
              "measure"
            ]
          },
          {
            "label": "Account for operational and consistency costs",
            "terms": [
              "consistency",
              "cost"
            ]
          },
          {
            "label": "Plan sync, rebuild and authorization",
            "terms": [
              "rebuild",
              "authorization"
            ]
          }
        ],
        "pitfall": "Tenant/visibility predicates داخل data access نفسها.",
        "conceptIds": [
          "sql-indexes",
          "rest-api",
          "consistency-models",
          "data-contracts"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Import & Export: ملايين الصفوف من غير Timeout",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Import & Export · Case 1",
        "question": "How do you import a large CSV without exhausting request memory?",
        "lesson": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.\n\nHTTP request تنشئ import/export operation وترد accepted مع status URL. الملف private ومعاه schema version وactor/tenant وparameters fingerprint. العملية نفسها لها key ثابتة؛ إعادة طلب المستخدم لا تبدأ bulk job ثانية لنفس النية.",
        "model": "Create an asynchronous operation. Stream parse and process bounded chunks. Persist per-row results and checkpoints. Limit concurrency and measure database impact.",
        "criteria": [
          {
            "label": "Create an asynchronous operation",
            "terms": [
              "async",
              "operation"
            ]
          },
          {
            "label": "Stream parse and process bounded chunks",
            "terms": [
              "stream",
              "chunk"
            ]
          },
          {
            "label": "Persist per-row results and checkpoints",
            "terms": [
              "checkpoint",
              "row"
            ]
          },
          {
            "label": "Limit concurrency and measure database impact",
            "terms": [
              "limit",
              "database"
            ]
          }
        ],
        "pitfall": "Unique source/business refs مع effects+checkpoint transaction.",
        "conceptIds": [
          "generators",
          "data-contracts",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Import & Export · Case 2",
        "question": "How do you make chunk retries safe after a crash?",
        "lesson": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.\n\nافحص format/encoding/headers/size ثم parse streaming. Normalize أنواع الأرقام والتواريخ وفق contract لا وفق locale عشوائية. Dry-run يفحص errors ويعطي preview، لكنه لا يضمن بقاء كل foreign keys/unique values متاحة وقت التنفيذ؛ DB guards تظل لازمة.",
        "model": "Assign stable source and business identities. Enforce row and domain uniqueness. Commit effects with consistent progress. Test crash before and after acknowledgment.",
        "criteria": [
          {
            "label": "Assign stable source and business identities",
            "terms": [
              "identity",
              "business"
            ]
          },
          {
            "label": "Enforce row and domain uniqueness",
            "terms": [
              "unique",
              "domain"
            ]
          },
          {
            "label": "Commit effects with consistent progress",
            "terms": [
              "commit",
              "checkpoint"
            ]
          },
          {
            "label": "Test crash before and after acknowledgment",
            "terms": [
              "crash",
              "ack"
            ]
          }
        ],
        "pitfall": "Bounded chunks ومعايير atomic visibility عبر staging إن لزم.",
        "conceptIds": [
          "generators",
          "data-contracts",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Import & Export · Case 3",
        "question": "Does cancelling an import automatically undo committed rows?",
        "lesson": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.\n\nاقرأ stream/chunks ولا تحمل CSV كلها في collection. Keyset pagination/chunkById في exports مناسب لحالات معينة، لكن لو الداتا تتغير تحتاج snapshot/watermark/consistent report policy. Progress total قد تكون تقديرية لو source live؛ سمها بوضوح.",
        "model": "Cancellation stops future work at a boundary. Committed effects remain unless compensated. Define provenance and undo conflict policy. Report partial completion accurately.",
        "criteria": [
          {
            "label": "Cancellation stops future work at a boundary",
            "terms": [
              "boundary",
              "stop"
            ]
          },
          {
            "label": "Committed effects remain unless compensated",
            "terms": [
              "commit",
              "compensate"
            ]
          },
          {
            "label": "Define provenance and undo conflict policy",
            "terms": [
              "provenance",
              "policy"
            ]
          },
          {
            "label": "Report partial completion accurately",
            "terms": [
              "partial",
              "report"
            ]
          }
        ],
        "pitfall": "Escape/encode cells وفق spreadsheet consumer contract وفحص input.",
        "conceptIds": [
          "generators",
          "data-contracts",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Import & Export · Case 4",
        "question": "How do you provide an all-or-nothing visible import at scale?",
        "lesson": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.\n\nExport private وexpiry/retention، ويعاد authorization وقت التنزيل حسب policy؛ user اتشالت صلاحيتها لا تستمر بقدرة download غير مقيدة. Error file لا تسرب PII غير لازمة، وكل row توضح السبب ورقم المصدر مع counts متسقة.",
        "model": "Define atomic visibility separately from processing. Load and validate into staging. Design controlled publish or cutover. Avoid one unbounded production transaction.",
        "criteria": [
          {
            "label": "Define atomic visibility separately from processing",
            "terms": [
              "visibility",
              "atomic"
            ]
          },
          {
            "label": "Load and validate into staging",
            "terms": [
              "staging",
              "validate"
            ]
          },
          {
            "label": "Design controlled publish or cutover",
            "terms": [
              "publish",
              "cutover"
            ]
          },
          {
            "label": "Avoid one unbounded production transaction",
            "terms": [
              "transaction",
              "unbounded"
            ]
          }
        ],
        "pitfall": "Unique source/business refs مع effects+checkpoint transaction.",
        "conceptIds": [
          "generators",
          "data-contracts",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Import & Export · Case 5",
        "question": "What should a secure export operation include?",
        "lesson": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.\n\nExport private وexpiry/retention، ويعاد authorization وقت التنزيل حسب policy؛ user اتشالت صلاحيتها لا تستمر بقدرة download غير مقيدة. Error file لا تسرب PII غير لازمة، وكل row توضح السبب ورقم المصدر مع counts متسقة.",
        "model": "Authorized tenant-scoped query and download. Explicit snapshot or live-data semantics. Private expiring artifacts and retention. Spreadsheet formula policy and safe error output.",
        "criteria": [
          {
            "label": "Authorized tenant-scoped query and download",
            "terms": [
              "authorize",
              "tenant"
            ]
          },
          {
            "label": "Explicit snapshot or live-data semantics",
            "terms": [
              "snapshot",
              "live"
            ]
          },
          {
            "label": "Private expiring artifacts and retention",
            "terms": [
              "private",
              "retention"
            ]
          },
          {
            "label": "Spreadsheet formula policy and safe error output",
            "terms": [
              "formula",
              "error"
            ]
          }
        ],
        "pitfall": "Bounded chunks ومعايير atomic visibility عبر staging إن لزم.",
        "conceptIds": [
          "generators",
          "data-contracts",
          "queues",
          "privacy-retention"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  },
  {
    "title": "Approval Workflows: Maker–Checker وAudit",
    "ar": "تصميم عملي خطوة بخطوة",
    "desc": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.",
    "color": "purple",
    "icon": "◇",
    "questions": [
      {
        "title": "Approval Workflows · Case 1",
        "question": "How do you prevent changing a refund amount after approval?",
        "lesson": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.\n\nالطلب مش approved Boolean. هو subject وaction وamount/currency/beneficiary أو parameters أخرى وversion وسبب ومستندات وpolicy version. Approver يوافق على النسخة المعروضة، لا على إذن مفتوح لتغيير كل البيانات بعدها.",
        "model": "Freeze or version the submitted payload. Bind decisions to fingerprint and version. Reject execution with mismatched approved version. Require a new review for changed parameters.",
        "criteria": [
          {
            "label": "Freeze or version the submitted payload",
            "terms": [
              "freeze",
              "version"
            ]
          },
          {
            "label": "Bind decisions to fingerprint and version",
            "terms": [
              "fingerprint",
              "decision"
            ]
          },
          {
            "label": "Reject execution with mismatched approved version",
            "terms": [
              "reject",
              "mismatch"
            ]
          },
          {
            "label": "Require a new review for changed parameters",
            "terms": [
              "review",
              "change"
            ]
          }
        ],
        "pitfall": "Approval bound to immutable fingerprint+version؛ change يحتاج مراجعة جديدة.",
        "conceptIds": [
          "admin-approvals",
          "workflow-state-contract",
          "business-idempotency",
          "adr-communication"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Approval Workflows · Case 2",
        "question": "How do you stop two approvals from executing the same action twice?",
        "lesson": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.\n\nحدد thresholds وعدد المراجعين وeligible roles وdelegation/absence وقواعد maker≠checker. زيادة role بعد submission لا تجعل موافقة سابقة تغطي نطاقًا جديدًا تلقائيًا. policy version توضح القرار الذي حكم الطلب في وقت التقديم أو التنفيذ حسب contract.",
        "model": "Separate decisions from execution intent. Guard quorum and allowed transitions. Enforce unique semantic execution identity. Commit local effect and outbox atomically.",
        "criteria": [
          {
            "label": "Separate decisions from execution intent",
            "terms": [
              "decision",
              "execution"
            ]
          },
          {
            "label": "Guard quorum and allowed transitions",
            "terms": [
              "quorum",
              "guard"
            ]
          },
          {
            "label": "Enforce unique semantic execution identity",
            "terms": [
              "unique",
              "identity"
            ]
          },
          {
            "label": "Commit local effect and outbox atomically",
            "terms": [
              "atomic",
              "outbox"
            ]
          }
        ],
        "pitfall": "Semantic execution unique والـquorum تحت guard.",
        "conceptIds": [
          "admin-approvals",
          "workflow-state-contract",
          "business-idempotency",
          "adr-communication"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Approval Workflows · Case 3",
        "question": "Should approved mean that a bank payout has completed?",
        "lesson": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.\n\napproved تعني allowed to execute؛ worker قد تتأخر أو تفشل. claim execution operation ثابتة في transaction، revalidate approved version والحدود الحالية المطلوبة ثم domain effect/outbox. لا تمسك locks عبر provider network call.",
        "model": "Approval only grants permission to execute. Track execution and provider evidence separately. Represent unknown external outcomes. Reconcile using the same operation reference.",
        "criteria": [
          {
            "label": "Approval only grants permission to execute",
            "terms": [
              "permission",
              "execute"
            ]
          },
          {
            "label": "Track execution and provider evidence separately",
            "terms": [
              "evidence",
              "separate"
            ]
          },
          {
            "label": "Represent unknown external outcomes",
            "terms": [
              "unknown",
              "external"
            ]
          },
          {
            "label": "Reconcile using the same operation reference",
            "terms": [
              "reconcile",
              "reference"
            ]
          }
        ],
        "pitfall": "Stable execution reference وreconciliation قبل بديل.",
        "conceptIds": [
          "admin-approvals",
          "workflow-state-contract",
          "business-idempotency",
          "adr-communication"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Approval Workflows · Case 4",
        "question": "What does a useful approval audit trail contain?",
        "lesson": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.\n\nAudit يسجل من طلب ومن وافق ومتى وعلى أي payload/version وسبب وأدلة وexecution reference، مع ضوابط الوصول والـretention. Append-only behavior وحماية ضد العبث تتناسب مع المخاطر؛ مجرد log text ليست ledger مالية.",
        "model": "Maker and checker identities. Exact subject payload and policy versions. Decision reasons and protected evidence references. Execution references and subsequent corrections.",
        "criteria": [
          {
            "label": "Maker and checker identities",
            "terms": [
              "maker",
              "checker"
            ]
          },
          {
            "label": "Exact subject payload and policy versions",
            "terms": [
              "payload",
              "version"
            ]
          },
          {
            "label": "Decision reasons and protected evidence references",
            "terms": [
              "reason",
              "evidence"
            ]
          },
          {
            "label": "Execution references and subsequent corrections",
            "terms": [
              "execution",
              "correction"
            ]
          }
        ],
        "pitfall": "Approval bound to immutable fingerprint+version؛ change يحتاج مراجعة جديدة.",
        "conceptIds": [
          "admin-approvals",
          "workflow-state-contract",
          "business-idempotency",
          "adr-communication"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      },
      {
        "title": "Approval Workflows · Case 5",
        "question": "How do you design maker-checker controls without a UI-only guard?",
        "lesson": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.\n\nAudit يسجل من طلب ومن وافق ومتى وعلى أي payload/version وسبب وأدلة وexecution reference، مع ضوابط الوصول والـretention. Append-only behavior وحماية ضد العبث تتناسب مع المخاطر؛ مجرد log text ليست ledger مالية.",
        "model": "Enforce eligibility on the server. Apply role, amount and separation rules. Check transition state and expiry. Test direct requests and concurrent decisions.",
        "criteria": [
          {
            "label": "Enforce eligibility on the server",
            "terms": [
              "server",
              "eligibility"
            ]
          },
          {
            "label": "Apply role, amount and separation rules",
            "terms": [
              "role",
              "separation"
            ]
          },
          {
            "label": "Check transition state and expiry",
            "terms": [
              "state",
              "expiry"
            ]
          },
          {
            "label": "Test direct requests and concurrent decisions",
            "terms": [
              "direct",
              "concurrent"
            ]
          }
        ],
        "pitfall": "Semantic execution unique والـquorum تحت guard.",
        "conceptIds": [
          "admin-approvals",
          "workflow-state-contract",
          "business-idempotency",
          "adr-communication"
        ],
        "deliverable": "اكتب invariant وflow وDB guard وfailure timeline واختبار recovery؛ اقرأ صفحة feature كاملة من المعمل للمثال والرسومات."
      }
    ]
  }
];
