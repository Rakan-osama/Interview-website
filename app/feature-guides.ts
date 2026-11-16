export type FeatureGuide={id:string;title:string;domain:string;summary:string;concepts:string[];chapters:{title:string;body:string[]}[];entities:{name:string;fields:string;purpose:string;guard:string}[];states:string[];flow:{title:string;detail:string;atomic:string}[];failures:{symptom:string;cause:string;fix:string;test:string}[];api:{method:string;path:string;purpose:string}[];tests:string[];workshop:{question:string;points:{label:string;terms:string[]}[]}[];sources:{title:string;url:string;note:string}[];sim:string|null};
export const featureGuides:FeatureGuide[] = [
  {
    "id": "blueprint",
    "title": "إزاي تصمّم أي Feature قبل ما تكتب Controller؟",
    "domain": "Design",
    "summary": "طريقة تمشي بيها من طلب مبهم لتصميم تقدر تنفذه وتختبره وتشغّله: هنبدأ بحجز آخر مكان، ونثبت نفس الأسئلة على payment وwallet وcheckout.",
    "concepts": [
      "feature-template",
      "workflow-state-contract",
      "business-idempotency"
    ],
    "chapters": [
      {
        "title": "ابدأ بالوعد، مش أسماء الـTables",
        "body": [
          "عميل بيقول «عايز booking system». ده لسه مش requirement كفاية. هل بنحجز كرسي لرحلة لها capacity، ولا ميعاد دكتور له مدة، ولا غرفة لكل ليلة؟ الاختلاف ده يغير invariant وطريقة منع التعارض. اكتب مثال مستخدم حقيقي بالأرقام، وحدد إيه داخل النسخة الأولى وإيه خارجها.",
          "اكتب actors: customer يعمل لنفسه، staff يعمل نيابة عن عميل بصلاحية، provider يبلغ بنتيجة دفع، وworker يصلح العمليات المتأخرة. لكل action حدد object ownership وحدود المبلغ/الوقت، بدل الاكتفاء إن المستخدم logged in."
        ]
      },
      {
        "title": "حوّل الكلام لقواعد قابلة للإثبات",
        "body": [
          "Invariant قاعدة لازم تفضل صحيحة حتى لو طلبين اشتغلوا مع بعض أو server وقع. مثال: active holds + confirmed allocations لا تتجاوز capacity. مثال تاني: لكل payment operation fulfillment واحدة. كلمة «هنمنع التكرار» وحدها مش invariant واضحة؛ لازم تعرف تكرار إيه وبأي identity.",
          "بعد كل قاعدة اكتب enforcement: DB constraint أو guarded update أو lock على row معروفة أو authorization. بعده اختبار يحاول يكسرها. Validation تحسّن الخطأ للمستخدم، لكن لا تحمي وحدها من concurrent requests."
        ]
      },
      {
        "title": "افصل الزمن المحلي عن العالم الخارجي",
        "body": [
          "DB transaction تضمن atomicity للداتا اللي تحت إدارتها، لكنها مش transaction مشتركة مع البنك أو بوابة الدفع. لذلك قصّر الـtransaction: احفظ intent وoutbox ثم commit، وبعدها worker يتصل بالمزود. النتيجة ترجع عبر response موثوق أو webhook أو reconciliation.",
          "بين كل خطوتين اسأل «لو وقعنا هنا؟». قبل call: outbox تعيد الإرسال. بعد تنفيذ provider وقبل حفظ النتيجة: outcome unknown وتستعلم بنفس reference. بعد commit وقبل ACK: الحدث يتكرر ومعالجة idempotent تعيد نفس النتيجة."
        ]
      },
      {
        "title": "التصميم لازم يشرح التشغيل كمان",
        "body": [
          "كل pending state لها وقت متوقع وowner وrecovery action. اعرض pending للعميل بصدق، وحط alert لعمر العملية، وdashboard للاستثناءات. Log فيه correlation IDs من غير card data أو secrets. Reconciliation تلتقط الحالات اللي لم يصل لها event.",
          "ابدأ modular monolith بحدود واضحة لو هو كفاية، واكتب سبب أي queue/cache/service إضافية. اعمل rollout محدود وfeature flag وخطة تصحيح الداتا. Rollback code لا يعكس تلقائيًا الأموال أو الحجوزات التي تمت بالفعل."
        ]
      }
    ],
    "entities": [
      {
        "name": "operations",
        "fields": "id, actor_id, kind, client_key, fingerprint, state, version",
        "purpose": "تمثل نية تجارية ثابتة لكل retry.",
        "guard": "UNIQUE(actor_id, kind, client_key)"
      },
      {
        "name": "inbox / outbox",
        "fields": "source, event_id, business_ref, payload_ref, processed_at, attempts",
        "purpose": "تسليم واستعادة العمل غير المتزامن.",
        "guard": "حدث unique؛ effect له business uniqueness مستقلة"
      },
      {
        "name": "audit / exceptions",
        "fields": "actor, action, object_ref, reason, state, assigned_to",
        "purpose": "تفسير القرارات ومعالجة الحالات المتوقفة.",
        "guard": "Append history؛ صلاحيات ومراجعة للتغييرات الحساسة"
      }
    ],
    "states": [
      "كل entity لها حالات خاصة؛ لا تجمع payment وbooking وshipment في status واحدة.",
      "pending -> processing -> succeeded | confirmed_failed؛ unknown نتيجة اتصال وليست إثبات فشل تجاري.",
      "التصحيح بعد نجاح مالي عملية جديدة مرتبطة بالأصل، وليس حذف التاريخ."
    ],
    "flow": [
      {
        "title": "اكتب Feature Brief",
        "detail": "عرّف actors والـscope والـassumptions ومثال نجاح ومثال فشل. حدد source of truth لكل قيمة مثل amount وcapacity.",
        "atomic": "قرار منتج قبل التنفيذ."
      },
      {
        "title": "اكتب Invariants وState Table",
        "detail": "لكل event: current state، guard، next state، effect، owner، evidence. اربط القواعد بالجداول.",
        "atomic": "كل انتقال حساس يُفرض في transaction قصيرة."
      },
      {
        "title": "حدد الـBoundary",
        "detail": "صمم API وإعادة الطلب، ثم outbox/provider/inbox/reconciliation. اجعل unknown حالة ظاهرة.",
        "atomic": "مفيش network call تحت locks طويلة."
      },
      {
        "title": "اثبت وراقب",
        "detail": "نفذ concurrent DB tests وفشل قبل/بعد call وduplicate/out-of-order events، ثم metrics وrunbook.",
        "atomic": "اختبارات integration + rollout تدريجي."
      }
    ],
    "failures": [
      {
        "symptom": "الـschema جاهزة لكن مش عارف ألغي order بعد الشحن",
        "cause": "بدأنا بأسماء الجداول من غير state transitions.",
        "fix": "افصل order/payment/fulfillment وحدد line-level cancellation وبدائل ما بعد الشحن.",
        "test": "حاول cancel في كل مرحلة وتحقق من الداتا والأثر الخارجي."
      },
      {
        "symptom": "كل حاجة pending بعد تعطل worker",
        "cause": "لا يوجد عمر للعملية أو sweep job أو مسؤول.",
        "fix": "أضف deadline وretry budget وstuck operation queue وrunbook للاستعلام الآمن.",
        "test": "اقفل worker ثم شغله وتحقق من استرداد العمل دون duplicates."
      },
      {
        "symptom": "الـmicroservices زودت inconsistency",
        "cause": "وزعنا حدود البيانات قبل فهم invariant المحلية.",
        "fix": "اجمع القرار الذري حيث يلزم، وصمم cross-boundary workflow وتعويضاتها صراحة.",
        "test": "اقطع شبكة service بعد تنفيذ الخطوة وقبل وصول response."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/operations",
        "purpose": "Create/replay بنفس client key؛ تغيير payload مع نفس key = conflict."
      },
      {
        "method": "GET",
        "path": "/operations/{id}",
        "purpose": "Object authorization وحالة مفهومة، لا يطلق side effect."
      },
      {
        "method": "POST",
        "path": "/operations/{id}/commands",
        "purpose": "أمر محدد مثل cancel، وليس PATCH status مفتوحًا."
      }
    ],
    "tests": [
      "اربط كل invariant باختبار يحاول كسرها بطلبين على DB حقيقية.",
      "اجعل crash injection قبل وبعد كل commit وexternal call.",
      "اختبر replay والـauthorization والتوقيت وretention وexport/restore إن وُجدا.",
      "قِس unknown age، retry count، conflict rate وexception backlog."
    ],
    "workshop": [
      {
        "question": "Design a new paid booking feature. What do you write before the database schema?",
        "points": [
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
        ]
      },
      {
        "question": "Why can a database transaction not make a payment gateway call atomic?",
        "points": [
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
        ]
      },
      {
        "question": "What must a paid-booking transition contract contain?",
        "points": [
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
        ]
      },
      {
        "question": "How would you prove that a feature cannot oversell?",
        "points": [
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
        ]
      },
      {
        "question": "What makes a pending workflow operable in production?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Laravel Transactions",
        "url": "https://laravel.com/docs/12.x/database#database-transactions",
        "note": "Local database boundary؛ version حسب مشروعك."
      },
      {
        "title": "PostgreSQL Locks",
        "url": "https://www.postgresql.org/docs/current/explicit-locking.html",
        "note": "Lock behavior يعتمد على DB وisolation؛ اختبر البيئة الفعلية."
      }
    ],
    "sim": null
  },
  {
    "id": "booking",
    "title": "Booking: آخر مكان، Expiry ودفعة متأخرة",
    "domain": "Booking",
    "summary": "نبني حجز capacity محدودة مع hold مؤقت ودفع خارجي، ونفصل عنه appointments ذات time ranges. هنشوف مين يكسب لو expiry وpayment callback حصلوا مع بعض.",
    "concepts": [
      "booking-holds",
      "booking-overlap",
      "workflow-state-contract",
      "business-idempotency"
    ],
    "chapters": [
      {
        "title": "اختار نوع الحجز الأول",
        "body": [
          "في مثالنا session لها capacity=1. العميل يمسك hold لمدة 10 دقائق، يدفع، وبعد تأكيد موثوق نحول الـhold إلى allocation مؤكدة. الـhold مش confirmed booking، والـcountdown في المتصفح مجرد عرض؛ وقت السيرفر هو المرجع.",
          "Appointments مش مجرد capacity counter: طبيب من 10:00 إلى 10:30 يتعارض مع 10:15 إلى 10:45. استخدم interval [start,end) عشان 10:30 تقدر تبدأ بعدها appointment تانية، وخزن instant بـUTC مع IANA timezone لحساب المواعيد المحلية وDST."
        ]
      },
      {
        "title": "مين يملك آخر مكان؟",
        "body": [
          "كل reserve/confirm/release لنفس session يعدّي من resource guard واحدة. ممكن تقفل session row ثم تحسب active holds + confirmed داخل transaction، أو تستخدم counters محمية مع expiry cleanup متسق. لا تعتمد على query available ثم insert من غير guard.",
          "في appointment range، SELECT FOR UPDATE على rows متداخلة فقط قد لا يقفل أي row لو النتيجة فارغة؛ ده لا يضمن منع phantom insert على كل المحركات. اختار PostgreSQL exclusion constraint للـranges الملائمة، أو resource/day guard مستقرة يلتزم بها كل كاتب، أو slot model مناسب."
        ]
      },
      {
        "title": "افصل محاولة الدفع عن الحجز",
        "body": [
          "احفظ booking وpayment operation/attempt بروابط واضحة. خُد amount من quote محفوظة. لا تفتح DB transaction وتنتظر provider؛ احفظ intent وoutbox ثم اتصل خارجها. Success URL مش مصدر confirmation.",
          "لو الدفع تأخر لحد hold انتهت واتحجز المكان لعميل B، نجاح دفع A لا يديه حق سحب مكان B. سياسة المثال: mark paid_unallocated + refund_required وتابع refund/reconciliation. ممكن سياسة مختلفة تعيد الحجز لو متاح، لكن لازم check ذرية جديدة وموافقة واضحة على البديل."
        ]
      },
      {
        "title": "الإلغاء والتعديل مش Update تاريخ وخلاص",
        "body": [
          "Cancellation تحدد cutoff والرسوم وما إذا كانت هناك refund. Release مكان مؤكد وفتح refund operation لازم تكون خطوات موثقة؛ لا تخلط فشل refund مع رجوع المكان. ضع policies للـno-show والإلغاء من المنظم.",
          "Reschedule في نفس DB: امسك guards القديمة والجديدة بترتيب ثابت، تحقق من target ثم بدّل allocations في transaction واحدة. لو محتاج فرق دفع خارجي، اعمل workflow staged ولا تفقد old booking قبل تحديد السياسة. احتفظ بتاريخ التغيير والسبب."
        ]
      }
    ],
    "entities": [
      {
        "name": "sessions / resources",
        "fields": "id, capacity, starts_at, timezone, version",
        "purpose": "النقطة المشتركة لحماية capacity أو نطاق المواعيد.",
        "guard": "capacity>=0؛ writers تستخدم نفس guard"
      },
      {
        "name": "bookings",
        "fields": "id, customer_id, resource_id, state, expires_at, quote_id",
        "purpose": "الطلب والـhold والـconfirmation مع ownership.",
        "guard": "client key scoped؛ guarded transitions"
      },
      {
        "name": "allocations / holds",
        "fields": "booking_id, resource_id, qty, start_at, end_at, state",
        "purpose": "من يستهلك السعة الآن وبأي مدة.",
        "guard": "UNIQUE(booking_id)؛ range conflict strategy واضحة"
      },
      {
        "name": "payment_operations",
        "fields": "booking_id, amount_minor, currency, external_ref, state",
        "purpose": "النتيجة المالية منفصلة عن صلاحية المكان.",
        "guard": "unique semantic payment fulfillment"
      }
    ],
    "states": [
      "held -> confirmed | expired | cancelled",
      "expired + verified payment -> paid_unallocated / refund_required؛ لا confirmed تلقائية.",
      "confirmed -> cancelled وفق policy؛ refund لها state machine مستقلة."
    ],
    "flow": [
      {
        "title": "احسب quote",
        "detail": "تحقق من actor ووقت الخدمة والسعر، وخزّن quote لها صلاحية ومبلغ/عملة.",
        "atomic": "Server pricing؛ لا تقبل amount من client."
      },
      {
        "title": "اعمل Hold",
        "detail": "claim client key؛ اقفل resource guard؛ تحقّق من active capacity والوقت؛ احفظ hold بexpiry.",
        "atomic": "نفس transaction للحجز واستهلاك السعة."
      },
      {
        "title": "ابدأ الدفع",
        "detail": "احفظ operation وoutbox؛ worker يرسل بمفتاح ثابت. return booking pending للعميل.",
        "atomic": "External call بعد commit."
      },
      {
        "title": "عالج النتيجة",
        "detail": "تحقق من webhook والـamount/currency/business ref؛ اقفل نفس guard وحدّث allocation مرة واحدة.",
        "atomic": "Domain effect + processed inbox + outbox commit واحدة."
      },
      {
        "title": "عالج Expiry والتأخير",
        "detail": "expiry job لا تحرر confirmed booking. callback متأخرة تتبع refund/review policy. راقب paid_unallocated.",
        "atomic": "تسابق job/callback يتحسم تحت نفس guard."
      }
    ],
    "failures": [
      {
        "symptom": "عميلان confirmed لآخر مكان",
        "cause": "Read ثم insert منفصلان أو cache كمرجع للبيع.",
        "fix": "Guard ذرية على نفس resource لكل مسارات الحجز والتأكيد والإلغاء.",
        "test": "أرسل 20 reserve متزامنة لسعة 1؛ active+confirmed<=1 دائمًا."
      },
      {
        "symptom": "Callback رجعت مكانًا تم بيعه",
        "cause": "لم نربط confirmation بصلاحية hold وownership.",
        "fix": "تحقق من hold state/expiry تحت guard؛ late success تدخل refund_required.",
        "test": "انتهت A، حجزت B، وصلت success A؛ B تظل مالكة."
      },
      {
        "symptom": "Reschedule ضيعت الحجزين",
        "cause": "حررنا القديم قبل ضمان الجديد.",
        "fix": "Lock order ثابت وswap atomic؛ staged flow لو فرق مالي خارجي.",
        "test": "نفذ reschedule A↔B مع deadlock retry وحدود واضحة."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/bookings/holds",
        "purpose": "resource+qty+quote+client key؛ تعيد نفس hold عند replay."
      },
      {
        "method": "POST",
        "path": "/bookings/{id}/payment",
        "purpose": "تنشئ/replay operation مرتبطة، لا تؤكد booking من client."
      },
      {
        "method": "POST",
        "path": "/bookings/{id}/cancel",
        "purpose": "Authorization+policy+guard؛ يرجع وضع booking وrefund منفصلين."
      },
      {
        "method": "POST",
        "path": "/bookings/{id}/reschedule",
        "purpose": "target+version؛ conflict واضح لو المكان غير متاح."
      }
    ],
    "tests": [
      "سعة 1 وطلبات متداخلة على DB الفعلية.",
      "انقضاء hold قبل/أثناء callback، وفشل worker وإعادة events.",
      "مواعيد متجاورة مقابل متداخلة وDST boundaries.",
      "إلغاء من customer غير مالك، reschedule concurrent وno-show policy."
    ],
    "workshop": [
      {
        "question": "Two customers reserve the last seat concurrently. Design the safe transaction.",
        "points": [
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
        ]
      },
      {
        "question": "A hold expires, B reserves it, then A payment succeeds. What happens?",
        "points": [
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
        ]
      },
      {
        "question": "How do you prevent overlapping doctor appointments?",
        "points": [
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
        ]
      },
      {
        "question": "How do you safely reschedule a confirmed booking?",
        "points": [
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
        ]
      },
      {
        "question": "Which monitoring and recovery jobs does booking need?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "PostgreSQL Range Types",
        "url": "https://www.postgresql.org/docs/current/rangetypes.html",
        "note": "أمثلة range وexclusion؛ ليست ميزة مماثلة تلقائيًا في MySQL."
      },
      {
        "title": "Laravel Pessimistic Locking",
        "url": "https://laravel.com/docs/12.x/queries#pessimistic-locking",
        "note": "lockForUpdate داخل transaction مع فهم DB engine."
      }
    ],
    "sim": "booking"
  },
  {
    "id": "payments",
    "title": "Payments: من Click لحد Settlement من غير Double Charge",
    "domain": "Payments",
    "summary": "هنصمم payment operation قابلة لإعادة الطلب، ونفهم الفرق بين authorization وcapture وsettlement، ونعالج timeout وduplicate/out-of-order webhooks.",
    "concepts": [
      "payment-lifecycle",
      "webhook-inbox",
      "business-idempotency",
      "refund-allocation"
    ],
    "chapters": [
      {
        "title": "ارسم الكيانات بدل paid Boolean",
        "body": [
          "Order هي التزام البيع، payment operation نية دفع مبلغ محدد، attempt محاولة تنفيذ، وprovider reference هو رابط الطرف الخارجي. ممكن order تفشل لها attempt ثم تنجح أخرى؛ لازم سياسة تمنع نجاح محاولتين من تكرار fulfillment أو زيادة غير معالجة.",
          "Authorization موافقة/حجز لدى جهة الدفع، capture تحصيل ضمن تدفق المزود، settlement انتقال وتسوية الأموال، refund إعادة مبلغ، dispute اعتراض له lifecycle مستقل. التفاصيل ومدد الصلاحية والمفردات تختلف حسب payment method/provider؛ لا تفترض كل طريقة تدعم separate capture."
        ]
      },
      {
        "title": "إعادة الطلب جزء من التصميم",
        "body": [
          "العميل ينشئ key مرة عند نية دفع محددة ويعيدها عند timeout. السيرفر scope على actor+operation مع fingerprint يشمل order والمبلغ والعملة؛ نفس key ونفس payload تعيد العملية، ونفس key وpayload مختلفة conflict. احفظ operation قبل external call.",
          "استخدم provider idempotency حسب عقده ومدة retention. لو المفتاح خرج عن window المضمونة، لا تعيد charge عميانيًا؛ استعلم بـreference أو انتقل للمراجعة. Local business uniqueness لا تختفي بانتهاء provider key."
        ]
      },
      {
        "title": "Timeout يعني مش عارف، مش فشل",
        "body": [
          "ممكن provider خصم والرد ضاع. خلي operation processing/unknown، واعرض الحالة للعميل بدل تشجيع محاولة جديدة تلقائيًا. Worker يستعلم بنفس reference، ويستقبل webhook، ويعمل reconcile. Confirmed failure مختلفة عن انقطاع الشبكة.",
          "لا تمسك row locks وانت مستني network. استخدم transaction قصيرة تحفظ intent وoutbox، ثم worker. قبل كل side effect حدّد لو crash حصل بعدها هتلاقي الدليل فين وإزاي هتعيد المحاولة بأمان."
        ]
      },
      {
        "title": "Webhook آمنة وFulfillment مرة واحدة",
        "body": [
          "تحقق من signature على raw body بالطريقة الرسمية، ومن account/environment وbusiness reference والمبلغ والعملة. خزّن inbox بشكل durable قبل ACK؛ worker يعالج الحدث transactionally. event ID تمنع إعادة نفس event، وeffect business key تمنع حدثين مختلفين لنفس الدفع من عمل shipment مرتين.",
          "لا تثق بترتيب وصول events؛ event قديمة لا تعيد successful operation إلى processing. لو event مش كفاية، اجلب الحالة الموثوقة من provider. بعد commit أرسل notification/fulfillment عبر outbox. HTTP 200 من endpoint معناها استلام event، مش إثبات settlement مالي."
        ]
      },
      {
        "title": "الأمان والتشغيل",
        "body": [
          "استخدم hosted/tokenized collection حسب integration، ولا تحفظ CVC بعد authorization حتى لو encrypted. قلل ما يمر بنظامك من card data، وسجل references لا secrets. تحديد PCI scope يتم على التكامل الفعلي وليس بوضع كلمة tokenization في التصميم.",
          "اعمل dashboard لـunknown age، duplicate effects blocked، signature failures، amount mismatch وreconciliation exceptions. فريق التشغيل يحتاج طريقة lookup وربط العملية، لا زر retry ينشئ charge جديدة."
        ]
      }
    ],
    "entities": [
      {
        "name": "orders",
        "fields": "id, customer_id, snapshot_total, currency, state",
        "purpose": "بيع مستقل عن تفاصيل provider.",
        "guard": "Amount مصدره snapshot immutable"
      },
      {
        "name": "payment_operations / attempts",
        "fields": "id, order_id, client_key, fingerprint, provider_ref, state, version",
        "purpose": "Recoverable identity ونتيجة كل attempt.",
        "guard": "key unique scoped؛ provider reference unique scoped"
      },
      {
        "name": "webhook_inbox",
        "fields": "provider, account, event_id, received_at, processed_at",
        "purpose": "Durable intake وإعادة معالجة.",
        "guard": "UNIQUE(provider, account, event_id)"
      },
      {
        "name": "business_effects / outbox",
        "fields": "operation_id, effect_kind, destination, payload_ref",
        "purpose": "Fulfillment/credit/notification محفوظة.",
        "guard": "UNIQUE(operation_id, effect_kind)"
      }
    ],
    "states": [
      "created -> processing -> requires_action | authorized | succeeded | confirmed_failed",
      "authorized -> captured وفق method؛ settlement وrefund/dispute كيانات/أحداث منفصلة.",
      "unknown تُحل باستعلام/حدث موثوق؛ لا تتراجع succeeded بسبب event أقدم."
    ],
    "flow": [
      {
        "title": "Create Operation",
        "detail": "Authorize order ownership؛ احسب amount من snapshot؛ claim key وfingerprint؛ احفظ intent.",
        "atomic": "transaction local قصيرة."
      },
      {
        "title": "Call Provider",
        "detail": "worker يرسل نفس العملية خارج transaction؛ يحفظ provider reference مبكرًا إن متاح.",
        "atomic": "لا provider call تحت order lock."
      },
      {
        "title": "Receive Evidence",
        "detail": "Raw-body verification ثم durable inbox؛ استعلام إضافي لو تفاصيل الحدث غير كافية.",
        "atomic": "ACK بعد durable write؛ worker قابل للتكرار."
      },
      {
        "title": "Apply Business Effect",
        "detail": "guard الحالة والمبلغ والعملة؛ سجّل succeeded + business effect + outbox.",
        "atomic": "مرة واحدة محليًا لكل business effect."
      },
      {
        "title": "Reconcile",
        "detail": "sweep unknown والمتأخرة وقارن تقارير provider؛ escalation لو تضارب.",
        "atomic": "لا charge ثانية لحل غياب رد."
      }
    ],
    "failures": [
      {
        "symptom": "Double charge بعد timeout",
        "cause": "UUID جديدة لكل retry أو عدم تسجيل العملية قبل call.",
        "fix": "Stable operation/key مع lookup/reconciliation قبل أي نية دفع بديلة.",
        "test": "Provider ينفذ ثم throw timeout؛ retries لا تزود charge."
      },
      {
        "symptom": "طلب اتشحن مرتين رغم event dedupe",
        "cause": "eventان مختلفتان يمثلان نجاح نفس payment.",
        "fix": "Unique semantic fulfillment effect مع outbox transactional.",
        "test": "أرسل success بevent IDs مختلفة؛ fulfillment count=1."
      },
      {
        "symptom": "تم وضع paid من success URL",
        "cause": "المتصفح قابل للتعديل والزيارة لا تثبت الدفع.",
        "fix": "Redirect تعرض pending؛ server evidence فقط تحدث حالة الدفع.",
        "test": "افتح return URL يدويًا؛ لا حالة ولا شحن تتغير."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/orders/{id}/payment-operations",
        "purpose": "client key ثابتة؛ server amount، fingerprint conflict."
      },
      {
        "method": "GET",
        "path": "/payment-operations/{id}",
        "purpose": "حالة مستقرة مع object authorization."
      },
      {
        "method": "POST",
        "path": "/webhooks/payments",
        "purpose": "Provider verification؛ durable intake؛ لا تعتمد session auth."
      },
      {
        "method": "POST",
        "path": "/payments/{id}/refunds",
        "purpose": "Refund operation مستقلة وbudget guard."
      }
    ],
    "tests": [
      "Timeout بعد التنفيذ وقبل الرد، crash قبل/بعد commit.",
      "Duplicate event نفسها ثم different event لنفس business effect.",
      "Wrong amount/currency/account وinvalid signature.",
      "Old event بعد success، delayed confirmation وprovider outage."
    ],
    "workshop": [
      {
        "question": "The provider charged the card but your HTTP request timed out. What do you do?",
        "points": [
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
        ]
      },
      {
        "question": "How do you secure and process payment webhooks?",
        "points": [
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
        ]
      },
      {
        "question": "Why is event ID deduplication insufficient for order fulfillment?",
        "points": [
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
        ]
      },
      {
        "question": "Explain authorization, capture, settlement and refund.",
        "points": [
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
        ]
      },
      {
        "question": "How should payment operation idempotency be scoped?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Stripe Idempotent Requests",
        "url": "https://docs.stripe.com/api/idempotent_requests",
        "note": "Provider-specific contract؛ API v1/v2 behavior يختلف."
      },
      {
        "title": "Stripe Webhooks",
        "url": "https://docs.stripe.com/webhooks",
        "note": "Raw body، signature، duplicates وdelivery behavior."
      },
      {
        "title": "Stripe Payment Lifecycle",
        "url": "https://docs.stripe.com/payments/paymentintents/lifecycle",
        "note": "مثال provider واحد؛ ليست state machine لكل طرق الدفع."
      },
      {
        "title": "PCI SSC: CVC Storage",
        "url": "https://www.pcisecuritystandards.org/faqs/1280/",
        "note": "عدم تخزين card verification codes بعد authorization."
      }
    ],
    "sim": "payment"
  },
  {
    "id": "wallet",
    "title": "Wallet & P2P: الـLedger أولًا، والـBalance نتيجة",
    "domain": "Wallet",
    "summary": "نبني wallet بعملة واحدة ونموذج double-entry مبسط، ونحسب posted/held/available، ونمنع صرف الرصيد مرتين مع قفل ثابت وترحيل ذري.",
    "concepts": [
      "ledger-double-entry",
      "wallet-balances",
      "ledger-posting",
      "wallet-transfer",
      "currency-fx-fees"
    ],
    "chapters": [
      {
        "title": "الرصيد مش عمود نعدله وخلاص",
        "body": [
          "Wallet balance رقم مشتق من سجل حركات له تفسير. في نموذج منصة تحتفظ بالتزام تجاه العميل، WalletA حساب liability credit-normal: credit تزوده وdebit ينقصه. CashAsset حساب asset debit-normal: debit يزوده. إذن debit مش معناها سحب في كل الحسابات.",
          "تمويل A بـ100: Dr CashAsset 100 / Cr WalletA 100. تحويل داخلي 30 من A إلى B: Dr WalletA 30 / Cr WalletB 30. النقد عند المنصة لم يتحرك في التحويل الداخلي، لكن توزيع التزامها بين العميلين تغير. دي أمثلة بعملة واحدة؛ الإنتاج يحتاج chart of accounts يراجع حسب business model."
        ]
      },
      {
        "title": "ثلاثة أرقام لازم تفرق بينهم",
        "body": [
          "في النموذج المختار الـhold حجز منفصل عن posted ledger: posted=100، holds=60، available=40. لو حوّلت 30 تصبح posted=70، holds=60، available=10. عند capture للـ60 تسجل Dr WalletA / Cr MerchantPayable وتزيل hold في نفس commit؛ posted=10 وholds=0 وavailable=10.",
          "لا تخصم posted وقت إنشاء hold ثم تخصمها مرة ثانية عند capture. Pending incoming هنا غير قابلة للصرف افتراضيًا. منصات أخرى تعرف pending/available بشكل مختلف؛ سمِّ حساباتك واعرض القاعدة صراحة بدل نقل formula من provider بلا فهم."
        ]
      },
      {
        "title": "Double-entry لا تمنع Overdraft وحدها",
        "body": [
          "ممكن قيد متوازن يكون ضارًا: Dr WalletA 500 / Cr WalletB 500 رغم أن A معها 100. التوازن يثبت أن debit=credit لكل currency، أما صلاحية الصرف فتحتاج guard على available ومصدر بيانات متسق.",
          "Posting service واحدة تتحقق من amounts>0 وcurrency وaccount status وownership/limits، وتclaim business reference ثم تقفل حسابات متأثرة بترتيب IDs ثابت. تقرأ current balance projection المتزامنة داخل transaction وتعمل guard، وتحفظ journal/entries وتحدث projection وoutbox في commit واحدة. لا تعتمد على cache متأخرة."
        ]
      },
      {
        "title": "Retry وReversal مش تعديل تاريخ",
        "body": [
          "كل transfer لها identity تجارية ثابتة وfingerprint. UNIQUE(reference, posting_kind) تمنع replay من إنشاء journal ثانية. Deadlock retry يعيد نفس العملية كاملة بنفس identity. تحويل A→B وB→A يقفلا الحسابين بنفس الترتيب لتقليل deadlocks.",
          "لو عايز تعكس transfer، اعمل reversal جديدة تشير للأصل وتحمل عكس entries. إذا B صرفت الفلوس، السياسة قد ترفض automatic reversal أو تفتح recovery/receivable case بصلاحيات. لا تخلق قيمة من لا شيء ولا تمسح القيد القديم."
        ]
      },
      {
        "title": "وازن الحسابات وفسر كل اختلاف",
        "body": [
          "Trial balance debit=credit لا يثبت أنك طبقت business amount صح. راجع ledger مقابل operational records، وbalance projection مقابل جمع entries، والـcash/receivable مقابل provider statements. لكل فرق exception لها owner.",
          "اعمل money values بالـminor units الصحيحة للعملة، ولا تجمع عملات. Multi-currency تحتاج FX/clearing accounts وتصميم per-currency balance؛ المحاكاة هنا بعملة تعليمية واحدة ولا تنفذ أموالًا حقيقية."
        ]
      }
    ],
    "entities": [
      {
        "name": "ledger_accounts",
        "fields": "id, owner_ref, type, normal_balance, currency, status",
        "purpose": "Chart of accounts منفصل عن users.",
        "guard": "حساب أحادي العملة؛ account type ثابت واضح"
      },
      {
        "name": "journals / entries",
        "fields": "journal_id, business_ref, posting_kind, account_id, debit, credit, currency",
        "purpose": "Posted history غير قابل للمسح أو التعديل.",
        "guard": "Balanced per currency؛ unique semantic posting"
      },
      {
        "name": "balance_projection",
        "fields": "account_id, posted_minor, version",
        "purpose": "قراءة سريعة متزامنة مع posting.",
        "guard": "تتغير داخل نفس commit؛ قابلة لإعادة البناء"
      },
      {
        "name": "holds",
        "fields": "operation_id, account_id, amount_minor, state, expires_at",
        "purpose": "Encumbrance على available دون debit للـposted.",
        "guard": "Unique operation؛ capture/release مشروط مرة واحدة"
      },
      {
        "name": "transfers",
        "fields": "id, sender, recipient, amount, currency, state, reversal_of",
        "purpose": "نية تجارية وصلاحيات وربط التصحيح.",
        "guard": "Stable client key+fingerprint؛ حدود وسياسات"
      }
    ],
    "states": [
      "transfer requested -> posted | rejected؛ local commit هي نقطة نجاح التحويل الداخلي.",
      "hold active -> captured | released | expired؛ لا capture وrelease لنفس hold.",
      "posted journal immutable؛ reversal journal جديدة وقد تحتاج approval."
    ],
    "flow": [
      {
        "title": "Validate Intent",
        "detail": "تأكد من actor/sender والمستفيد والعملة والمبلغ والحدود؛ claim stable transfer key.",
        "atomic": "لا تثق في sender_id من client."
      },
      {
        "title": "Lock & Guard",
        "detail": "قفل الحسابات بترتيب ثابت؛ اقرأ posted والـactive holds من model متسق؛ available>=amount+fees.",
        "atomic": "DB transaction؛ no external call."
      },
      {
        "title": "Build Journal",
        "detail": "Dr sender liability / Cr recipient liability؛ fees entries صريحة لو موجودة؛ تحقق per-currency balance.",
        "atomic": "كل entries والمبلغ business-validated."
      },
      {
        "title": "Commit Posting",
        "detail": "احفظ journal والـentries وprojection وtransfer state وoutbox معًا.",
        "atomic": "إما كله وإما لا شيء."
      },
      {
        "title": "Recover & Reverse",
        "detail": "replay يرجع journal الأصلية؛ التصحيح journal مرتبطة وتطبق checks جديدة.",
        "atomic": "Reconciliation وaudit خارج hot transaction."
      }
    ],
    "failures": [
      {
        "symptom": "طلبا صرف استهلكا نفس الرصيد",
        "cause": "قرأوا balance قديمة قبل قفل مشترك.",
        "fix": "Posting guard على source of truth تحت lock/version؛ holds ضمن calculation.",
        "test": "posted100،hold60؛ تحويل30 ينجح والثاني30 يرفض."
      },
      {
        "symptom": "الرصيد اتخصم مرتين عند capture",
        "cause": "خلطنا hold reservation مع posted debit.",
        "fix": "اختار encumbrance model واضح؛ capture يرحل ويزيل hold atomic.",
        "test": "قبل/بعد capture available تظل متسقة ولا double debit."
      },
      {
        "symptom": "الرصيد متوازن لكن عميل خسر مبلغ غلط",
        "cause": "وازنّا entries من غير amount/ownership/idempotency checks.",
        "fix": "اختبر business amount والـactor والـfingerprint إضافة للتوازن.",
        "test": "نفس key بمبلغ مختلف conflict، وreplay بلا journal جديدة."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/wallet/transfers",
        "purpose": "Recipient+amount+currency+client key؛ sender من authenticated context."
      },
      {
        "method": "GET",
        "path": "/wallet/balance",
        "purpose": "posted،held،available ووقت/نسخة projection حسب السياسة."
      },
      {
        "method": "GET",
        "path": "/wallet/transactions",
        "purpose": "Authorized journal view مبسطة؛ لا تسرب accounts داخلية."
      },
      {
        "method": "POST",
        "path": "/transfers/{id}/reversal-requests",
        "purpose": "طلب تصحيح بصلاحية وسبب؛ لا PATCH entries."
      }
    ],
    "tests": [
      "Balanced per currency، positive amounts وحسابات صحيحة.",
      "Concurrent debit، hold/capture/release races وdeadlock retry.",
      "Replay وfingerprint mismatch؛ لا negative available حسب السياسة.",
      "Rebuild projection من immutable entries ومقارنة كل balance.",
      "Reversal بعد صرف المستفيد تتبع policy ولا تمسح التاريخ."
    ],
    "workshop": [
      {
        "question": "A wallet has posted 100 and holds 60. Two transfers of 30 arrive. Design the result.",
        "points": [
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
        ]
      },
      {
        "question": "Explain the entries for funding A with 100 and transferring 30 to B.",
        "points": [
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
        ]
      },
      {
        "question": "Why does balanced double-entry not prevent overspending?",
        "points": [
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
        ]
      },
      {
        "question": "How does capture work with a separate wallet hold?",
        "points": [
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
        ]
      },
      {
        "question": "How do you reverse a transfer after the receiver has spent the funds?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Modern Treasury Transactions",
        "url": "https://docs.moderntreasury.com/ledgers/docs/ledger-transactions-overview",
        "note": "Double-entry transaction model؛ terminology vendor-specific."
      },
      {
        "title": "Modern Treasury Status & Balances",
        "url": "https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances",
        "note": "Posted immutability ومراحل balance؛ formula المعمل مختارة صراحة."
      },
      {
        "title": "Modern Treasury Concurrency",
        "url": "https://docs.moderntreasury.com/ledgers/docs/handle-concurrency",
        "note": "لماذا balance checks لازم تتزامن مع posting."
      }
    ],
    "sim": "wallet"
  },
  {
    "id": "funding",
    "title": "Top-up، Withdrawal وReconciliation عملي",
    "domain": "Fintech",
    "summary": "نفصل دخول الفلوس وخروجها عن internal wallet transfer، ونبني cash/receivable/payable model بسيط مع unknown outcomes وchargebacks وmanual review.",
    "concepts": [
      "topup-chargeback",
      "payout-reconciliation",
      "ledger-posting",
      "admin-approvals"
    ],
    "chapters": [
      {
        "title": "حدد معنى الرصيد الذي تسمح بصرفه",
        "body": [
          "Card top-up تبدأ payment operation، لا balance update. هل تسمح بالصرف عند confirmation أم settlement أم بعد risk hold؟ ده قرار منتج/مخاطر يعتمد على المصدر، وحالات funding لازم تعكسه. Pending incoming في هذا المثال لا تدخل available.",
          "لو اخترت credit بعد confirmation قبل settlement، قد تسجل Dr ProviderReceivable / Cr WalletLiability. بعد statement settlement: Dr Cash + Dr FeeExpense / Cr ProviderReceivable بالمقادير الصحيحة. لو credit بعد settlement، يتغير توقيت القيد؛ لا تجمع النموذجين لنفس الشحنة."
        ]
      },
      {
        "title": "Withdrawal لها جسر واضح للـBank",
        "body": [
          "المثال: احجز 80 من wallet available. عند اعتماد instruction، في commit واحدة أزل hold وسجل Dr WalletLiability80 / Cr PayoutPayable80 واحفظ outbox. الأموال لم تخرج من cash بعد، لكن لم تعد متاحة للعميل.",
          "Worker يرسل payout خارج transaction بمفتاح ثابت. عند confirmed settlement: Dr PayoutPayable / Cr CashAsset. فشل مؤكد قبل التسوية: Dr PayoutPayable / Cr WalletLiability. Timeout لا يبرر إعادة الرصيد؛ خليه unknown واستعلم. Bank return بعد settlement قيد وعملية مستقلة."
        ]
      },
      {
        "title": "Reconciliation يومية وتحت الطلب",
        "body": [
          "طابق operation ID وexternal reference والمبلغ والعملة والحالة والرسوم والتواريخ. فرّق event time عن booking/value date وcutoff في التقرير. إجمالي net لا يكفي لإثبات صحة كل عملية؛ ممكن نقص وزيادة يعوضوا بعض.",
          "الأمثلة: provider عنده transfer مش عندك، عندك succeeded ومش في التقرير، مبلغ fee مختلف، pending أطول من المتوقع. كل mismatch تدخل exception queue بowner ودليل وخطوة آمنة؛ لا تعمل auto-fix يخلق journal من غير business approval."
        ]
      },
      {
        "title": "المخاطر بعد النجاح",
        "body": [
          "Chargeback بعد صرف top-up يحتاج case مستقلة وسياسة recovery أو loss/receivable، وليس حذف قيد التمويل. Reconciliation لا تعني أن كل confirmation كانت final أو أن كل chargeback احتيال.",
          "Limits وbeneficiary verification وKYC/AML وفصل الصلاحيات تُحدد مع product/risk/provider المختص حسب السوق. تقنيًا ابنِ checks قابلة للتدقيق ونسخة policy وmaker-checker للعمليات الحساسة، ولا تعتبر نموذج التدريب نظامًا مرخصًا جاهزًا."
        ]
      }
    ],
    "entities": [
      {
        "name": "funding_operations",
        "fields": "payment_ref, wallet_account, amount, currency, availability_policy, state",
        "purpose": "هوية credit واحدة وتمييز receivable عن settled cash.",
        "guard": "Unique credit posting لكل funding"
      },
      {
        "name": "payout_instructions",
        "fields": "wallet_ref, beneficiary_version, amount, external_ref, state",
        "purpose": "تعليمات سحب ثابتة قابلة للاستعلام.",
        "guard": "key+fingerprint؛ beneficiary snapshot"
      },
      {
        "name": "payout_payable / receivable",
        "fields": "account_ref, currency, journal_ref",
        "purpose": "تفسير مكان الأموال قبل وبعد التسوية.",
        "guard": "Balanced postings ومطابقة reports"
      },
      {
        "name": "reconciliation_runs / exceptions",
        "fields": "source_file_ref, cutoff, matched_refs, discrepancy, owner, resolution_ref",
        "purpose": "تشغيل المقارنة وحفظ سبب الحل.",
        "guard": "Idempotent import؛ لا حذف للدليل الأصلي"
      }
    ],
    "states": [
      "funding pending -> confirmed -> credited -> settled؛ توقيت credited حسب availability policy.",
      "withdrawal held -> submitted -> processing | unknown -> settled | confirmed_failed.",
      "settled -> bank_return case مستقلة؛ credited -> chargeback case مستقلة."
    ],
    "flow": [
      {
        "title": "Onboard & Quote",
        "detail": "تحقق من account state والحدود والمستفيد ورسوم المبلغ. احفظ accepted beneficiary/fee versions.",
        "atomic": "Authorization + immutable instruction parameters."
      },
      {
        "title": "Reserve & Reclassify",
        "detail": "احجز available ثم، عند الاعتماد، رحّل إلى payable وأنشئ outbox.",
        "atomic": "Ledger+hold+instruction commit واحدة."
      },
      {
        "title": "Submit Externally",
        "detail": "worker يستخدم stable reference وprovider contract؛ يسجل evidence دون تخمين failure.",
        "atomic": "لا network تحت posting locks."
      },
      {
        "title": "Confirm & Reconcile",
        "detail": "Settlement evidence تولد قيد cash؛ unknown تُستعلم وتطابق statements.",
        "atomic": "Unique semantic posting لكل stage."
      },
      {
        "title": "Handle Exceptions",
        "detail": "Failure مؤكدة ترجع liability مرة؛ return/chargeback عملية جديدة بمراجعة مناسبة.",
        "atomic": "Maker-checker للتصحيحات الحساسة."
      }
    ],
    "failures": [
      {
        "symptom": "سحب خرج مرتين بعد timeout",
        "cause": "أعدنا رصيد العميل وأرسلنا instruction جديدة.",
        "fix": "Unknown لا restore؛ نفس operation/query/reconcile ثم قرار موثوق.",
        "test": "Provider ينفذ ثم connection reset؛ payout count تبقى1."
      },
      {
        "symptom": "Top-up مكرر من حدثين مختلفين",
        "cause": "الـinbox فقط عليها unique event.",
        "fix": "Unique funding credit effect + balanced journal في transaction.",
        "test": "event IDs مختلفة لنفس funding => credit واحدة."
      },
      {
        "symptom": "الرصيد المحلي صح لكن البنك ناقص",
        "cause": "لم نسجل fees/returns أو نعتمد cutoffs مختلفة.",
        "fix": "Per-operation reconciliation مع gross/net/fees/date semantics.",
        "test": "Report بfee مختلفة وreturn متأخرة يولد exception موثقة."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/wallet/topups",
        "purpose": "Operation بسعر وعملة وسياسة إتاحة؛ لا client credit."
      },
      {
        "method": "POST",
        "path": "/wallet/withdrawals",
        "purpose": "Beneficiary version+amount+client key مع limits."
      },
      {
        "method": "GET",
        "path": "/withdrawals/{id}",
        "purpose": "Unknown/processing واضحة بلا وعد زائف."
      },
      {
        "method": "POST",
        "path": "/admin/exceptions/{id}/resolution-requests",
        "purpose": "اقتراح حل مدعوم بدليل وموافقة، لا تعديل balance مباشر."
      }
    ],
    "tests": [
      "Chargeback بعد spend، topup duplicate، pending incoming غير قابلة للصرف.",
      "Withdrawal timeout وsettlement/return متأخرة، failure confirmed مرة واحدة.",
      "Import نفس statement مرتين؛ لا double journal.",
      "Beneficiary اتغيرت بعد approval؛ version mismatch يمنع التنفيذ."
    ],
    "workshop": [
      {
        "question": "Model an 80 withdrawal before and after bank settlement.",
        "points": [
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
        ]
      },
      {
        "question": "Why must a withdrawal timeout not restore wallet funds immediately?",
        "points": [
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
        ]
      },
      {
        "question": "What should a daily withdrawal reconciliation process compare?",
        "points": [
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
        ]
      },
      {
        "question": "How do you handle a top-up chargeback after the balance was spent?",
        "points": [
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
        ]
      },
      {
        "question": "What controls should guard manual wallet adjustments?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Adyen Reconcile Transfers",
        "url": "https://docs.adyen.com/marketplaces/reconciliation-use-cases/reconcile-transfers/",
        "note": "مثال لمطابقة transfer مع reporting، لا بديل عن عقد مزودك."
      },
      {
        "title": "Modern Treasury Status",
        "url": "https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances",
        "note": "نمذجة pending/posted والتصحيح بقيود جديدة."
      }
    ],
    "sim": null
  },
  {
    "id": "checkout",
    "title": "Ecommerce Checkout: سعر ثابت وآخر قطعة وآخر Coupon",
    "domain": "Commerce",
    "summary": "نبني checkout متعدد المنتجات من cart متغيرة إلى order لها price snapshot، مع stock/coupon reservations ودفع asynchronous من غير overselling ولا خصم مكرر.",
    "concepts": [
      "pricing-snapshot",
      "inventory-reservation",
      "coupon-contention",
      "payment-lifecycle"
    ],
    "chapters": [
      {
        "title": "Cart مش Order",
        "body": [
          "Cart قابلة لتغيير الكمية والسعر والعروض؛ totals فيها تقديرية. Quote على السيرفر تثبت نسخة pricing بصلاحية. عند تأكيد checkout احفظ snapshot: SKU/variant واسم وقت البيع والكمية والسعر والخصم والضريبة والشحن والعملة والتقريب. العميل لا يحدد unit price أو total.",
          "لو السعر اتغير أو coupon بقت غير صالحة، اعرض quote جديدة قبل التأكيد. في مثال 2 items مجموعهم100 وخصم10 وشحن20، الـpayable110؛ توزيع الخصم على الأسطر لازم يساوي10 بالضبط عشان partial refund تكون قابلة للحساب."
        ]
      },
      {
        "title": "احجز الموارد قبل الوعد النهائي",
        "body": [
          "اختار policy صريحة: في المثال reserve stock/coupon وقت checkout لمدة محدودة، وليس عند إضافة cart. Stock row لكل SKU/location تتحمى بـguarded update أو lock، والـreservation مرتبطة بـcheckout line. آخر coupon usage تتحجز ذرّيًا كذلك.",
          "لو عدة SKUs في نفس DB، عالجهم بترتيب ثابت وفي transaction واحدة مناسبة؛ فشل واحدة يرجع باقي الحجوزات. لو المخازن خدمات مستقلة، ده workflow به compensations، ولا يصح ادعاء atomicity موزعة. Cache تحسّن عرض التوفر لكنها لا تمنح حق البيع."
        ]
      },
      {
        "title": "Order ثم Payment، وبعدها Fulfillment",
        "body": [
          "بعد snapshot وreservations احفظ order pending_payment وpayment intent/outbox. الاتصال الخارجي بعد commit. Confirmation صحيحة تحوّل reservations إلى allocations وتولد fulfillment effect واحدة. لا تعمل picking أو shipment من return URL.",
          "Late payment بعد expiry تحتاج سياسة محددة: إعادة حجز ذرية لو مسموح ومتاحة، أو paid_unallocated + refund. لو order فيها item واحد انتهى، لازم تقول هل partial fulfillment مسموح مع موافقة ولا all-or-nothing؛ لا تشحن جزءًا في صمت."
        ]
      },
      {
        "title": "الحاجات اللي بتظهر مع شغل حقيقي",
        "body": [
          "Bundles تحجز مكونات، وmulti-warehouse تحتاج قرار location قبل حساب الشحن والوعد. Coupon policy تحدد متى usage consumed ومتى تترد، وكذلك حدود per-customer وglobal. Shipping address لها snapshot وserviceability validation؛ تعديل عنوان بعد الشحن workflow مختلف.",
          "Guest checkout تحتاج طريقة آمنة للوصول للطلب من غير تسريب PII أو الاعتماد على order ID متسلسل. Backorders وpreorders قرار منتج صريح، مش fallback لما stock تطلع سالبة. قِس checkout abandonment وexpired holds وpaid_unallocated وpricing conflicts."
        ]
      }
    ],
    "entities": [
      {
        "name": "quotes / order_lines",
        "fields": "price_version, expires_at, sku_snapshot, qty, net, tax, discount, currency",
        "purpose": "تثبيت قرار السعر وأساس refund.",
        "guard": "Server-calculated totals؛ deterministic rounding"
      },
      {
        "name": "stock / reservations",
        "fields": "sku, location, on_hand, reserved, checkout_line, expiry, state",
        "purpose": "حماية التوفر لكل موقع.",
        "guard": "available>=0؛ reservation unique"
      },
      {
        "name": "coupon_redemptions",
        "fields": "coupon, customer, order, state, reserved_until",
        "purpose": "Eligibility وحدود الاستخدام والتاريخ.",
        "guard": "Guard global limit؛ scoped uniqueness حسب policy"
      },
      {
        "name": "orders / fulfillments",
        "fields": "customer_ref, address_snapshot, state, payment_ref, effect_ref",
        "purpose": "بيع مستقل عن الدفع والشحن.",
        "guard": "One business fulfillment per accepted paid order"
      }
    ],
    "states": [
      "checkout quoted -> reserved -> pending_payment -> accepted | expired",
      "stock reservation active -> allocated | released؛ الشحن حركة مختلفة موثقة.",
      "coupon reserved -> consumed | released وفق policy؛ لا decrement عشوائي."
    ],
    "flow": [
      {
        "title": "Quote على Server",
        "detail": "Validate quantities/variants/address؛ احسب totals والعروض والضرائب والرسوم؛ quote version وexpiry.",
        "atomic": "لا amount من client."
      },
      {
        "title": "Reserve Resources",
        "detail": "Claim checkout key؛ lock SKUs/coupon guards بترتيب ثابت؛ validate ثم create reservations/snapshot/order.",
        "atomic": "كل الموارد المحلية تتراجع عند فشل واحدة."
      },
      {
        "title": "Pay",
        "detail": "Persist payment operation+outbox؛ نفذ خارج DB transaction.",
        "atomic": "Timeout = unknown، وليس cart جديدة تلقائيًا."
      },
      {
        "title": "Accept Order",
        "detail": "تحقق من payment والموارد؛ consume reservations مرة واحدة؛ fulfillment outbox.",
        "atomic": "نفس transaction لربط القرار المحلي."
      },
      {
        "title": "Recover",
        "detail": "Release expired reservations safely؛ reconcile paid_unallocated؛ اعرض قرار واضح للعميل.",
        "atomic": "Expiry وcallback يشتركان في guards."
      }
    ],
    "failures": [
      {
        "symptom": "آخر قطعة اتباعت مرتين",
        "cause": "Cart stock check فقط.",
        "fix": "Reserve atomically وقت checkout مع expiry وownership.",
        "test": "20 checkout لسعة1، والـstock لا تتجاوز الوعد."
      },
      {
        "symptom": "Order total مختلفة عن charged amount",
        "cause": "أعدنا pricing بعد الدفع أو وثقنا client total.",
        "fix": "Accepted snapshot + exact amount/currency match قبل effect.",
        "test": "غيّر سعر المنتج أثناء checkout؛ order القديمة ثابتة."
      },
      {
        "symptom": "Coupon تعدت limit أو اتردت مرتين",
        "cause": "Check usage ثم increment، أو release غير مشروط.",
        "fix": "Atomic usage claim وحالات redemption محددة.",
        "test": "usage99 من100 مع طلبين؛ واحد فقط يكسب."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/checkout/quotes",
        "purpose": "Cart version وaddress؛ server totals وصلاحية."
      },
      {
        "method": "POST",
        "path": "/checkouts",
        "purpose": "quote ID+key؛ يعيد نفس order عند replay."
      },
      {
        "method": "POST",
        "path": "/orders/{id}/payment-operations",
        "purpose": "Amount من order؛ ownership وstate guard."
      },
      {
        "method": "GET",
        "path": "/orders/{id}",
        "purpose": "Customer-safe status للدفع والتجهيز كل على حدة."
      }
    ],
    "tests": [
      "Concurrent last-stock وlast-coupon على DB المستهدفة.",
      "Multi-SKU failure يرجع كل reservations المحلية.",
      "Price/currency mismatch، rounding allocation وquote expiry.",
      "Late payment وduplicate fulfillment؛ guest authorization."
    ],
    "workshop": [
      {
        "question": "Design a checkout for three SKUs when one becomes unavailable.",
        "points": [
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
        ]
      },
      {
        "question": "Why should accepted order prices be immutable snapshots?",
        "points": [
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
        ]
      },
      {
        "question": "How do you protect the final global coupon redemption?",
        "points": [
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
        ]
      },
      {
        "question": "What if payment succeeds after stock reservations expire?",
        "points": [
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
        ]
      },
      {
        "question": "Which boundaries should checkout keep separate?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Commercetools Inventory",
        "url": "https://docs.commercetools.com/api/inventory-overview",
        "note": "مثال distinctions بين inventory modes؛ اختيار المعمل policy تعليمية."
      },
      {
        "title": "Commercetools Reservations",
        "url": "https://docs.commercetools.com/guides/reserve-stock-on-cart",
        "note": "Expiry وreservation lifecycle؛ لا نفترض مزايا vendor في Laravel تلقائيًا."
      }
    ],
    "sim": null
  },
  {
    "id": "returns",
    "title": "Refunds، Returns، Shipping وDisputes",
    "domain": "Commerce",
    "summary": "نتعامل مع order جزئيًا: line اتشحنت وline اتلغت وrefund لسه pending. نفصل حركة السلعة عن حركة الفلوس ونحسب ما يمكن رده بأمان.",
    "concepts": [
      "refund-allocation",
      "fulfillment-returns",
      "pricing-snapshot",
      "webhook-inbox"
    ],
    "chapters": [
      {
        "title": "رد السلعة ورد المال مساران",
        "body": [
          "RMA طلب إرجاع سلعة؛ Refund عملية إعادة أموال؛ Cancellation إيقاف جزء لم يتنفذ؛ Dispute نزاع عبر جهة الدفع. ممكن المنتج يرجع قبل refund أو العكس حسب السياسة. لا تجعل refunded flag تشحن أو ترجع stock تلقائيًا.",
          "تتبع quantities على line: ordered، allocated، shipped، delivered، return_reserved، returned وinspected. cancellation قبل الشحن تختلف عن return بعد الاستلام، وreturnable quantity تتحمى من طلبين متزامنين لنفس القطعة."
        ]
      },
      {
        "title": "احسب Refund Budget بما فيه Pending",
        "body": [
          "لو captured100 وsucceeded_refunds30 وreserved_refunds50 فالمتاح20. Pending reservation تمنع support agent تاني يطلب60 في نفس الوقت. Claim budget وrefund operation داخل transaction؛ ثم call provider خارجها بنفس identity.",
          "احسب amount من snapshot الأصلية: net line بعد allocated discount والضريبة والشحن حسب policy. رسوم الشحن قد تكون non-refundable أو جزء منها؛ لا تفترض قاعدة قانونية واحدة لكل منتج/سوق. خزن القرار ومكوناته وموافقته."
        ]
      },
      {
        "title": "تأكيد النتيجة مش قبول الطلب",
        "body": [
          "Provider قد يقبل refund ثم تظل pending أو تفشل لاحقًا. Unknown لا تحرر budget، confirmed failure تحررها مرة، succeeded تثبت المبلغ النهائي. اعرض حالة واضحة للعميل ولا تعده بزمن غير مضمون من التكامل.",
          "لو فيه dispute على نفس payment، guard policy تحدد هل refund مسموح لتجنب تعويض مزدوج. لا تخلط refund من المنصة مع chargeback من البنك؛ اربط كل case والأدلة والمبلغ والموعد النهائي."
        ]
      },
      {
        "title": "Restock بعد Evidence مناسبة",
        "body": [
          "Carrier delivered لا تثبت أن المرتجع اتفحص. عند warehouse received ثم inspection تحدد sellable أو quarantine أو write-off. Restock action لها identity تمنع تكرار الزيادة. لو العميل لم يرجع المنتج، refund ناجحة لا تخلق stock.",
          "راقب عمر RMA وrefund unknown وreceived-not-inspected، ونسبة refund حسب سببها. Backoffice يحتاج maker-checker فوق thresholds، ومستندات آمنة وaudit، وليس زر يغير paid إلى false."
        ]
      }
    ],
    "entities": [
      {
        "name": "return_requests / items",
        "fields": "order_line, qty, reason, state, inspection_result",
        "purpose": "حركة السلع ودليل الاستلام.",
        "guard": "returned+reserved<=eligible delivered quantity"
      },
      {
        "name": "refund_operations / allocations",
        "fields": "payment_ref, request_key, amount, currency, line_allocations, state",
        "purpose": "نية مالية وتوزيع قابل للمراجعة.",
        "guard": "Guard cumulative succeeded+reserved<=captured"
      },
      {
        "name": "shipments / movements",
        "fields": "carrier_ref, line, qty, scan_event, location",
        "purpose": "دليل مستقل للشحن والمخزون.",
        "guard": "Unique business movement؛ scoped carrier event"
      },
      {
        "name": "dispute_cases",
        "fields": "payment_ref, external_case, amount, deadline, evidence_ref",
        "purpose": "نزاع وتواريخ وقرارات مستقلة.",
        "guard": "Authorization؛ secure evidence؛ auditable transitions"
      }
    ],
    "states": [
      "RMA requested -> approved -> received -> inspected -> closed",
      "refund reserved -> submitted -> pending | unknown -> succeeded | confirmed_failed",
      "inventory return received -> sellable | quarantine | write_off؛ ليس كل return restock."
    ],
    "flow": [
      {
        "title": "Check Eligibility",
        "detail": "Authorize order line وpolicy/cutoff/quantities؛ snapshot refund allocation.",
        "atomic": "اقفل quantity/refund guards المناسبة."
      },
      {
        "title": "Reserve Budget",
        "detail": "احفظ refund operation+amount reservation+outbox بkey ثابتة.",
        "atomic": "حد المبلغ يشمل refunds pending."
      },
      {
        "title": "Submit & Confirm",
        "detail": "Call provider خارج transaction؛ evidence موثوقة تؤكد/refail دون تكرار.",
        "atomic": "Processed inbox+state+ledger effect atomic."
      },
      {
        "title": "Receive & Inspect",
        "detail": "Warehouse workflow منفصلة؛ movement واحدة إلى sellable بعد الفحص فقط.",
        "atomic": "Unique inventory action."
      },
      {
        "title": "Reconcile & Escalate",
        "detail": "طابق provider refunds/disputes مع local totals؛ unknown age ومراجعة thresholds.",
        "atomic": "لا auto-fix يرد مبلغ مرتين."
      }
    ],
    "failures": [
      {
        "symptom": "Refunds مجتمعة أكبر من captured",
        "cause": "Check succeeded فقط أو requestان قبل تحديث budget.",
        "fix": "Reserve under shared guard مع pending+successful totals.",
        "test": "طلبان60 على captured100؛ واحد يرفض/ينتظر حسب السياسة."
      },
      {
        "symptom": "رجع stock لمنتج لسه مع العميل",
        "cause": "Refund event استُخدمت كدليل warehouse receipt.",
        "fix": "افصل RMA inspection وstock movement عن refund.",
        "test": "Refund succeeded من غير received => stock ثابت."
      },
      {
        "symptom": "Client استلم refund وchargeback معًا",
        "cause": "الحالات المالية مستقلة بلا coordination.",
        "fix": "Dispute-aware refund policy ومراجعة exception وتوثيق الأدلة.",
        "test": "Dispute active مع refund request تمنع/تراجع حسب policy."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/order-lines/{id}/return-requests",
        "purpose": "quantity+reason+key، eligibility وownership."
      },
      {
        "method": "POST",
        "path": "/payments/{id}/refund-requests",
        "purpose": "Amount محسوبة وallocation؛ صلاحيات وربط case."
      },
      {
        "method": "POST",
        "path": "/returns/{id}/inspection",
        "purpose": "Warehouse role وversion؛ لا credit مباشرة."
      },
      {
        "method": "GET",
        "path": "/refunds/{id}",
        "purpose": "تمييز requested/pending/succeeded/failed للعميل."
      }
    ],
    "tests": [
      "Cumulative refund guard مع concurrency وpending outcomes.",
      "Partial discounts/tax/shipping allocation وrounding remainder.",
      "Duplicate restock/receive، return أكثر من delivered.",
      "Delayed/failed refunds، dispute overlap وapproval payload changes."
    ],
    "workshop": [
      {
        "question": "A payment captured 100, refunded 30 and has 50 pending. How much can be requested?",
        "points": [
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
        ]
      },
      {
        "question": "Does a successful refund imply that inventory should be restocked?",
        "points": [
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
        ]
      },
      {
        "question": "How do you compute a partial refund for a discounted line?",
        "points": [
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
        ]
      },
      {
        "question": "How should a refund timeout after provider execution be handled?",
        "points": [
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
        ]
      },
      {
        "question": "What changes when a dispute overlaps a refund?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Stripe Refunds",
        "url": "https://docs.stripe.com/refunds",
        "note": "Partial refunds وحالات pending/failed حسب provider/payment method."
      }
    ],
    "sim": null
  },
  {
    "id": "subscriptions",
    "title": "SaaS Billing: Renewal، Grace Period وEntitlements",
    "domain": "Billing",
    "summary": "اشتراك متجدد وفشل تحصيل وتغيير plan: نربط فترة مدفوعة بحق الاستخدام بدل الاعتماد على subscription active أو success URL.",
    "concepts": [
      "subscription-entitlement",
      "workflow-state-contract",
      "business-idempotency",
      "pricing-snapshot"
    ],
    "chapters": [
      {
        "title": "افصل العقد عن الفاتورة عن الصلاحية",
        "body": [
          "Subscription تحدد plan والـcycle والـeffective dates. Invoice توثق مبلغ فترة محددة. Payment attempts تحاول تحصيلها. Entitlements تحدد features/limits المتاحة للـtenant حتى تاريخ. الفصل يسمح بفهم عميل paid ليناير لكن فبراير past_due.",
          "في المثال العميل له access حتى paid_period_end. لو renewal فشلت نمنحه grace3days حسب policy ثم نقيد الميزات. Grace اختيار منتج وليس ضمان provider. Trial وfree plan والـmanual contract لهم مصادر entitlement موثقة، لا نحتاج payment زائفة."
        ]
      },
      {
        "title": "Renewal واحدة لكل فترة",
        "body": [
          "الفترة لها identity مستقرة مثل subscription+period_start+invoice_kind. Generate invoice مرة؛ retry collection لنفس invoice لا يخلق فترة جديدة. خزن pricing/plan version والعملة والضرائب وtime boundaries.",
          "Events قد تصل out of order: نجاح payment لفترة قديمة لا يمتد access شهرًا من وقت وصولها. طبق فترة الحدث ونسخة subscription الموثوقة، وsync دورية مع provider. تحديد الشهر وتواريخ النهاية يحتاج قواعد calendar/timezone واضحة."
        ]
      },
      {
        "title": "تغيير Plan والإلغاء محتاجين Effective Date",
        "body": [
          "Upgrade فورية قد تولد proration charge/credit؛ downgrade قد تتأجل للتجديد. احسب quote واشرح المبلغ والوقت قبل التأكيد، واحفظ النسخة المقبولة. لا تغير plan_id ثم تكتشف أن الفرق لم يُحصّل.",
          "Cancel at period end يوقف التجديد ويحافظ على الحق المدفوع حتى النهاية؛ revoke now قرار مختلف وربما له refund. لو payment pending وقت التغيير، state table تحدد ماذا يحدث لو نجحت بعد الإلغاء."
        ]
      },
      {
        "title": "Usage Limits وTenant Isolation",
        "body": [
          "قياس usage يحتاج event identity وquota period وقاعدة احتساب معروفة. لو limit hard مثل 10 seats، race إضافة عضوين تتطلب guard على quota نفسها. Counter في cache قد يخدم العرض لكن منع تجاوز hard limit يحتاج enforcement مناسب.",
          "كل endpoint لميزات مدفوعة يطبق entitlement وtenant authorization على السيرفر؛ اخفاء الزر مش كفاية. راقب renewal failures وgrace expiry وbilling-access mismatches، واجعل support override لها reason وexpiry وaudit."
        ]
      }
    ],
    "entities": [
      {
        "name": "subscriptions / plan_versions",
        "fields": "tenant, plan_version, billing_anchor, state, effective_at, cancel_at",
        "purpose": "العقد والتغييرات الزمنية.",
        "guard": "Object/tenant authorization؛ version guard"
      },
      {
        "name": "invoices / periods",
        "fields": "subscription, period_start/end, snapshot_amount, currency, state",
        "purpose": "مطالبة واحدة لفترة معلومة.",
        "guard": "UNIQUE(subscription, period_start, invoice_kind)"
      },
      {
        "name": "entitlements / usage",
        "fields": "tenant, feature, limit, valid_until, source_ref, quota_period",
        "purpose": "حق استخدام مفسر وقابل للتدقيق.",
        "guard": "Unique source؛ guarded hard quotas"
      },
      {
        "name": "plan_changes",
        "fields": "accepted_quote, effective_at, proration_ref, state",
        "purpose": "تغيير قابل للاسترداد وله أثر مالي واضح.",
        "guard": "Replay-safe operation؛ approved price snapshot"
      }
    ],
    "states": [
      "subscription trialing -> active -> past_due -> restricted وفق policy",
      "invoice open -> paid | void | uncollectible؛ payment attempts منفصلة.",
      "cancel_at_period_end flag لا تعني revoke_now؛ entitlement expiry مستقلة."
    ],
    "flow": [
      {
        "title": "Accept Plan",
        "detail": "Validate tenant role؛ اعرض quote للفترة والسعر والحدود والتجديد.",
        "atomic": "احفظ accepted plan version."
      },
      {
        "title": "Bill Period",
        "detail": "أنشئ invoice واحدة وحاول collection بهوية ثابتة.",
        "atomic": "Invoice uniqueness + outbox."
      },
      {
        "title": "Apply Evidence",
        "detail": "Payment موثوقة للفترة الصحيحة تمنح/تمد حق نفس الفترة.",
        "atomic": "Unique entitlement source + inbox atomic."
      },
      {
        "title": "Dunning & Grace",
        "detail": "retry budget وتنبيه؛ عند grace deadline طبّق restriction محددة بدون حذف بيانات العميل.",
        "atomic": "Job idempotent تعتمد clock/server state."
      },
      {
        "title": "Change/Cancel",
        "detail": "Quote+effective date وproration policy؛ reconcile provider وحالة access.",
        "atomic": "لا تغيير مالي في الخفاء."
      }
    ],
    "failures": [
      {
        "symptom": "Webhook قديمة مدت access شهر زيادة",
        "cause": "حسبنا نهاية الحق من وقت وصول event.",
        "fix": "اربطها بالفترة المدفوعة وversion، لا arrival order.",
        "test": "Event يناير تصل في مارس؛ لا تمد مارس."
      },
      {
        "symptom": "Customer Cancel بس access اتقفل فورًا",
        "cause": "خلطنا cancel renewal مع revoke entitlement.",
        "fix": "State منفصلة وتواريخ صريحة للـcancel/revoke.",
        "test": "Paid حتى31 الشهر، cancel يوم10؛ access مستمر حسب policy."
      },
      {
        "symptom": "Tenant دخل feature من API رغم الخطة",
        "cause": "الـcheck في UI بس.",
        "fix": "Server entitlement+tenant guards، tests لكل boundary.",
        "test": "Direct request بtenant تاني أو expired entitlement يرفض."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/billing/subscription-quotes",
        "purpose": "Plan+effective date؛ quote للمبلغ والـproration."
      },
      {
        "method": "POST",
        "path": "/billing/plan-changes",
        "purpose": "Accept quote+key؛ لا plan_id patch مفتوحة."
      },
      {
        "method": "POST",
        "path": "/billing/cancellation",
        "purpose": "now/end-of-period حسب policy والصلاحيات."
      },
      {
        "method": "GET",
        "path": "/entitlements",
        "purpose": "Features وlimits الحالية والـexpiry؛ server enforcement مستمر."
      }
    ],
    "tests": [
      "Renewal invoice dedupe، old/new events وlate success.",
      "Month end، leap year، timezone وtrial conversion.",
      "Grace deadline وcancel/reactivate وتغيير plan أثناء processing.",
      "Hard quota race وtenant isolation وexpired support override."
    ],
    "workshop": [
      {
        "question": "How do subscriptions, invoices and entitlements differ?",
        "points": [
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
        ]
      },
      {
        "question": "A renewal payment fails. Should access stop immediately?",
        "points": [
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
        ]
      },
      {
        "question": "A January success event arrives in March. How should it affect access?",
        "points": [
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
        ]
      },
      {
        "question": "How do you implement a mid-cycle upgrade with proration and late payment?",
        "points": [
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
        ]
      },
      {
        "question": "How do you protect hard quotas and paid features?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Stripe Subscription Webhooks",
        "url": "https://docs.stripe.com/billing/subscriptions/webhooks",
        "note": "أحداث provider؛ سياسة entitlements في المعمل قرار منتج مستقل."
      }
    ],
    "sim": null
  },
  {
    "id": "marketplace",
    "title": "Marketplace: Split، Commission وSeller Settlement",
    "domain": "Fintech",
    "summary": "نقسم إجمالي المشتري بين seller payable ورسوم المنصة، ثم نبني settlement batch وpayout منفصلتين، ونعالج refund بعد خروج فلوس البائع.",
    "concepts": [
      "marketplace-settlement",
      "payout-reconciliation",
      "refund-allocation",
      "admin-approvals"
    ],
    "chapters": [
      {
        "title": "حدد مين يملك الفلوس ومين مسؤول",
        "body": [
          "قبل schema حدد merchant-of-record ومين يتحمل refunds/disputes/fees ومتى يستحق البائع الدفع. النظام لا يقرر مسؤوليات مالية أو تنظيمية بمجرد تسمية account. اتفق على الأدوار مع provider/product/risk، وبعدها نمذجها.",
          "مثال تعليمي بدون ضرائب: buyer paid100، seller allocation90، platform fee10. خزّن split وcommission version لحظة البيع. لا تعتبر100 كلها revenue ولا تعيد حساب commission للأوردر القديم من rule الحالية."
        ]
      },
      {
        "title": "من Pending إلى Available للبائع",
        "body": [
          "Payment confirmed لا تكفي دائمًا لصرف90. قد يحتاج delivery confirmation وreturn window وrisk reserve وKYC status. اعرض pending/available/paid-out بأرقام منفصلة ومصدر يفسر كل مبلغ.",
          "Eligibility وrelease عملية محلية محمية؛ settlement batch تجمع allocations eligible لم تُضم سابقًا بunique claims. مراجعة batch تعتمد snapshot، وأي تغيير مؤثر يبطل approval. Payout نفسها external workflow مستقلة unknown/reconcile."
        ]
      },
      {
        "title": "Ledger وتوزيع مبالغ الرد",
        "body": [
          "في نموذج مبسط عند ثبوت receivable100 نسجل Dr ProviderReceivable100 / Cr SellerPayable90 / Cr PlatformRevenue10، مع ملاحظة أن النموذج الفعلي والضرائب والرسوم يتطلبان chart of accounts مناسبة. عند التسوية cash والرسوم تسجل منفصلة حسب تقرير provider.",
          "Refund جزئية تستعمل split allocation الأصلية وقاعدة التقريب. هل platform fee تترد؟ قرار policy. لو البائع صرف مستحقاته، قد ينشأ seller receivable أو reserve recovery أو loss حسب العقد؛ لا تسحب من حساب بائع آخر ولا تمسح journal الأصلية."
        ]
      },
      {
        "title": "التشغيل والصلاحيات جزء من المنتج",
        "body": [
          "تغيير bank beneficiary خطير: verify + version + approval policy وربما cooling period حسب المتطلبات. Payout instruction تحمل snapshot للمستفيد المعتمد، ولا تقرأ بيانات معدلة بعد approval.",
          "راقب payable aging وnegative seller position وunreconciled payouts والـfees drift. Seller statement يشرح gross/discount/refund/fees/reserve/net مع references. Backoffice تعديلات مالية تكون operations موثقة وmaker-checker حيث يلزم."
        ]
      }
    ],
    "entities": [
      {
        "name": "seller_allocations",
        "fields": "order_line, seller, gross, fee, net, rule_version, eligibility_state",
        "purpose": "تفسير split لحظة البيع.",
        "guard": "sum allocations=gross؛ immutable pricing version"
      },
      {
        "name": "settlement_batches / items",
        "fields": "seller, currency, cutoff, allocation_ref, approval_version",
        "purpose": "جمع المستحق مرة واحدة.",
        "guard": "Allocation claimed once؛ batch approval bound to version"
      },
      {
        "name": "seller_accounts / reserves",
        "fields": "payable_account, reserve_ref, receivable_account, currency",
        "purpose": "التمييز بين المستحق والمتاح والخسائر/الديون.",
        "guard": "Balanced ledger؛ guarded release"
      },
      {
        "name": "payouts / beneficiary_versions",
        "fields": "batch, amount, beneficiary_snapshot, provider_ref, state",
        "purpose": "تنفيذ خارجي مستقل عن حساب المستحق.",
        "guard": "Stable semantic payout ID؛ approval checks"
      }
    ],
    "states": [
      "allocation pending -> eligible -> batched؛ reversals عمليات مرتبطة.",
      "batch draft -> reviewed -> approved -> submitted؛ parameters لا تتغير بعد approval.",
      "payout processing | unknown -> settled | confirmed_failed؛ return لاحقة case منفصلة."
    ],
    "flow": [
      {
        "title": "Snapshot Split",
        "detail": "احسب seller allocation/fee/discount/tax وفق accepted rule؛ validate rounding sum.",
        "atomic": "لا تعتمد على commission الحالية لاحقًا."
      },
      {
        "title": "Post Receivable & Payables",
        "detail": "Evidence موثوقة تنشئ journal وpending seller amount.",
        "atomic": "One posting effect لكل payment allocation."
      },
      {
        "title": "Release Eligibility",
        "detail": "تحقق من delivery/returns/risk requirements؛ اجعل الجزء eligible حسب policy.",
        "atomic": "Guard source quantities and prior release."
      },
      {
        "title": "Build & Approve Batch",
        "detail": "Claim eligible allocations مرة؛ راجع amount/currency/beneficiary version.",
        "atomic": "Maker-checker وimmutable approved version."
      },
      {
        "title": "Payout & Reconcile",
        "detail": "Same external reference عند retry؛ reports تكشف net/fees/returns؛ recovery case عند الحاجة.",
        "atomic": "Network خارج ledger locks."
      }
    ],
    "failures": [
      {
        "symptom": "نفس allocation دخلت batchين",
        "cause": "query eligible ثم insert بلا unique claim.",
        "fix": "Unique settlement item على allocation مع guarded state.",
        "test": "شغل batch workers متزامنة؛ لا duplicate payable consumption."
      },
      {
        "symptom": "Refund بعد payout عملت seller balance سالب بلا تفسير",
        "cause": "لا يوجد recovery/receivable policy.",
        "fix": "Separate linked correction وreserve/recovery account وفق policy.",
        "test": "Refund بعدsettled payout يولد case وقيود متوازنة."
      },
      {
        "symptom": "حساب البنك اتغير بعد اعتماد batch",
        "cause": "approval غير مربوطة بنسخة beneficiary/payload.",
        "fix": "Fingerprint وversion validation؛ تغير البيانات يبطل الاعتماد.",
        "test": "غير beneficiary بين approve/execute؛ التنفيذ يرفض."
      }
    ],
    "api": [
      {
        "method": "GET",
        "path": "/seller/statements",
        "purpose": "Authorized breakdown لمستحقات بائع واحد فقط."
      },
      {
        "method": "POST",
        "path": "/admin/settlement-batches",
        "purpose": "Currency+cutoff+stable key؛ claims transactional."
      },
      {
        "method": "POST",
        "path": "/admin/batches/{id}/approvals",
        "purpose": "Version-bound approval من شخص مسموح."
      },
      {
        "method": "POST",
        "path": "/seller/beneficiary-change-requests",
        "purpose": "Verified staged change، لا update مباشر لتعليمات approved."
      }
    ],
    "tests": [
      "Gross equals allocations بعد rounding، commission version ثابتة.",
      "Concurrent batch claims وapproval payload changes.",
      "Partial refund قبل وبعد payout، reserve releases وbank returns.",
      "Seller isolation، exact beneficiary version وreconciliation gross/net."
    ],
    "workshop": [
      {
        "question": "A buyer pays 100 with a platform fee of 10. How do you model the split?",
        "points": [
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
        ]
      },
      {
        "question": "Why should payment success not always trigger seller payout?",
        "points": [
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
        ]
      },
      {
        "question": "How do you stop two settlement workers including the same allocation?",
        "points": [
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
        ]
      },
      {
        "question": "What happens when a buyer refund arrives after the seller was paid?",
        "points": [
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
        ]
      },
      {
        "question": "How should a payout approval bind its beneficiary?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Adyen Accounting Report",
        "url": "https://docs.adyen.com/marketplaces/reports-and-fees/balance-platform-accounting-report",
        "note": "مثال لتقارير balance platform؛ حقول وتقسيمات provider-specific."
      },
      {
        "title": "Adyen Reconciliation",
        "url": "https://docs.adyen.com/marketplaces/reconciliation-use-cases/reconcile-transfers/",
        "note": "ربط instruction والنتيجة والتقرير، لا الاعتماد على dashboard total."
      }
    ],
    "sim": null
  },
  {
    "id": "identity",
    "title": "Authentication & Access: من Login إلى Revocation",
    "domain": "Security",
    "summary": "ابني تسجيل دخول واستعادة حساب وصلاحيات على الـobjects؛ وافهم الفرق بين session/token وهوية المستخدم وحقه في تنفيذ action.",
    "concepts": [
      "auth-policy",
      "sessions",
      "security",
      "crypto-basics"
    ],
    "chapters": [
      {
        "title": "حدد نوع العميل والـTrust Boundary",
        "body": [
          "تطبيق web first-party على نفس النطاق غالبًا يستفيد من framework session cookies وحماية CSRF المناسبة. Mobile أو third-party API قد تحتاج bearer tokens أو بروتوكول OAuth/OIDC حسب الحالة. JWT ليست تحسينًا تلقائيًا: طريقة التخزين والإلغاء وrotation والـaudience والـissuer أهم من اسم token.",
          "Authentication تجيب مين المستخدم؛ Authorization تجيب هل يقدر ينفذ الأمر على الـobject ده دلوقتي. موظف support يمكنه قراءة order ولا يقدر يعمل refund. اختفاء زر في UI لا يمنع direct API call، وrole admin لا تعني وصولًا مطلقًا لكل tenants."
        ]
      },
      {
        "title": "Login ناجح، لكن الـSession ممكن تكون مسروقة",
        "body": [
          "استخدم password hashing من framework وسياسة كلمات سر مناسبة، وقلل تسريب وجود الحساب في responses. Throttling يراعي account/IP/device والمخاطر مع عدم تحويل lockout لأداة تعطيل للمستخدمين. نجاح التحقق يستدعي session ID regeneration لمنع session fixation.",
          "Cookie controls مثل Secure وHttpOnly وSameSite تُضبط حسب integration. CSRF protection مهمة لتدفقات cookie-auth التي تعتمد إرسال المتصفح للcookie تلقائيًا؛ CORS وحده ليس authorization ولا بديلًا عنها. جلسات لها expiry وidle timeout وإمكانية revoke عند حدث خطر."
        ]
      },
      {
        "title": "Reset Password عملية حساسة مستقلة",
        "body": [
          "الـreset token سر قصير العمر، أحادي الاستخدام، مرتبط بحساب وpurpose، ومخزن بطريقة مناسبة تمنع استعمال database leak مباشرة. response لا تؤكد وجود email بلا داعٍ. لا تضع token في logs أو analytics، وحدد سياسة إبطال الجلسات بعد reset.",
          "MFA وstep-up authentication للعمليات الحساسة مثل تغيير beneficiary أو البريد. Recovery codes وإعادة ضبط MFA قد تكون أضعف نقطة؛ عامل recovery كfeature فيها evidence وrate limits وaudit، وليس bypass للدخول."
        ]
      },
      {
        "title": "Object Authorization من Query لحد Job",
        "body": [
          "اجلب resource ضمن scope المسموح، ثم نفذ policy على action والـstate. لا تعتمد أن معرفة UUID دليل ملكية. Job مؤجلة تحتاج actor/tenant context موثوق وتحققًا من صلاحية التنفيذ الحالية حسب السياسة، خصوصًا لو المستخدم اتشال قبل تشغيلها.",
          "اختبر access matrix: owner، عضو بدور محدود، مستخدم tenant أخرى، blocked account، token منتهي أو revoked. راقب failed login trends وprivilege changes وrecovery events من غير تخزين كلمات سر أو bearer tokens."
        ]
      }
    ],
    "entities": [
      {
        "name": "users / credentials",
        "fields": "id, normalized_identifier, password_hash, status, verified_at",
        "purpose": "هوية منفصلة عن صلاحيات كل workspace.",
        "guard": "Unique identifier وفق سياسة normalization"
      },
      {
        "name": "sessions / access_tokens",
        "fields": "user, token_hash, device_ref, expires_at, revoked_at, scopes",
        "purpose": "تتبع الدخول والإلغاء.",
        "guard": "Secret لا يكتب في logs؛ expiry checks"
      },
      {
        "name": "memberships / roles",
        "fields": "tenant, user, role, status, version",
        "purpose": "Authorization داخل سياق tenant.",
        "guard": "Unique tenant-user؛ server policy لكل action"
      },
      {
        "name": "recovery_challenges",
        "fields": "user, purpose, token_hash, expiry, consumed_at, attempts",
        "purpose": "استعادة محدودة بزمن واستخدام.",
        "guard": "Consume atomic مرة واحدة"
      }
    ],
    "states": [
      "account invited -> verified -> active -> suspended وفق سياسة المنتج.",
      "session issued -> active -> expired | revoked؛ logout الحالية تختلف عن revoke-all.",
      "recovery issued -> consumed | expired؛ لا إعادة استعمال للسر."
    ],
    "flow": [
      {
        "title": "Receive & Throttle",
        "detail": "Validate input وتطبيق rate/risk controls من غير تسريب الأسرار أو وجود الحساب في الخطأ.",
        "atomic": "الـrate limits لا تمنح أي permission."
      },
      {
        "title": "Verify Identity",
        "detail": "Framework hash verification وMFA عند الطلب؛ لا compare لكلمات السر ولا custom crypto.",
        "atomic": "Identity evidence قبل إنشاء session."
      },
      {
        "title": "Issue Session",
        "detail": "Rotate session ID أو issue token بالـscope/expiry المناسبين؛ سجل device context المسموح.",
        "atomic": "لا session fixation؛ secret يظهر في boundary المطلوبة فقط."
      },
      {
        "title": "Authorize Action",
        "detail": "Tenant membership+object ownership+policy+state قبل القراءة أو التعديل.",
        "atomic": "Guard الحساسة قريب من write."
      },
      {
        "title": "Revoke & Audit",
        "detail": "Logout أو risk/recovery event تلغي الـsessions حسب policy؛ سجل evidence من غير tokens.",
        "atomic": "Revocation تُفحص في نقطة الثقة المناسبة."
      }
    ],
    "failures": [
      {
        "symptom": "User من tenant أخرى فتح order بالـID",
        "cause": "Authentication حصلت لكن object policy غائبة.",
        "fix": "Scope resource وpolicy على action، وإعادة التحقق داخل async work.",
        "test": "اطلب ID صحيح من tenant أخرى؛ لا data ولا side effect."
      },
      {
        "symptom": "مهاجم احتفظ بجلسة قبل Login الضحية",
        "cause": "لم نغير session ID بعد authentication.",
        "fix": "Framework session regeneration وضبط cookie وCSRF.",
        "test": "سجل session ID قبل/بعد login وتحقق من إبطال القديمة."
      },
      {
        "symptom": "Reset link استُخدمت مرتين",
        "cause": "Check token ثم consume بشكل غير ذري.",
        "fix": "Short expiry وatomic single-use consume قبل تغيير credential.",
        "test": "طلبا reset بنفس token؛ واحد فقط ينفذ."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/auth/login",
        "purpose": "Validation+throttle+identity verification؛ cookie/token حسب العميل."
      },
      {
        "method": "POST",
        "path": "/auth/recovery-requests",
        "purpose": "Uniform response وسياسة إرسال محدودة."
      },
      {
        "method": "POST",
        "path": "/auth/password-resets",
        "purpose": "Consume challenge آمن وrevocation policy."
      },
      {
        "method": "DELETE",
        "path": "/auth/sessions/{id}",
        "purpose": "Own-session أو privileged policy؛ revoke-all action منفصلة."
      }
    ],
    "tests": [
      "Access matrix تشمل كل roles وtenants والـstates.",
      "Session fixation وCSRF والتوكن المنتهي/revoked.",
      "Reset replay، user enumeration وMFA recovery limits.",
      "Log redaction وstep-up على تغييرات حساسة."
    ],
    "workshop": [
      {
        "question": "Design object authorization for an authenticated order API.",
        "points": [
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
        ]
      },
      {
        "question": "What must happen after successful password authentication?",
        "points": [
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
        ]
      },
      {
        "question": "How do you implement a one-time password-reset flow?",
        "points": [
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
        ]
      },
      {
        "question": "When should you choose session cookies instead of bearer tokens?",
        "points": [
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
        ]
      },
      {
        "question": "How do you test account and permission changes in queued work?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "OWASP Authentication",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
        "note": "مخاطر الدخول والاستعادة؛ المعمل يجمعها مع domain policy."
      },
      {
        "title": "Laravel Authentication",
        "url": "https://laravel.com/docs/12.x/authentication",
        "note": "راجع guard/session behavior في نسخة مشروعك."
      }
    ],
    "sim": null
  },
  {
    "id": "tenancy",
    "title": "Multi-tenant SaaS: عزل البيانات والـContext",
    "domain": "Architecture",
    "summary": "منصة شركات متعددة: بيانات الشركة A لا تظهر للشركة B في query ولا cache ولا job ولا export، مع onboarding واستضافة تناسب متطلباتك.",
    "concepts": [
      "domain-modeling",
      "auth-policy",
      "process-lifetimes",
      "data-contracts"
    ],
    "chapters": [
      {
        "title": "اختار Isolation Model بمتطلبات صريحة",
        "body": [
          "Shared tables مع tenant_id أقل تكلفة تشغيل غالبًا، لكنها تجعل عزل كل query/write مسؤولية أساسية. Separate schema/database قد تعطي حدودًا مختلفة للنسخ الاحتياطي والتخصيص، مقابل migrations وتشغيل أصعب. الاختيار يعتمد على isolation/scale/restore/compliance requirements وليس عدد العملاء وحده.",
          "في المثال CRM مشتركة: كل contact وinvoice لها tenant_id، وmemberships تحدد صلة المستخدم بالشركة. المستخدم ممكن يكون عضوًا في شركتين، فلا تجعل user_id مساوية tenant_id. تغيير workspace في المتصفح لا يمنح membership تلقائيًا."
        ]
      },
      {
        "title": "Tenant Context موثوق مش مجرد Header",
        "body": [
          "الـrequest يحدد workspace المقصودة، والسيرفر يتحقق أن actor يملك membership صالحة فيها. لا تقبل X-Tenant-ID كدليل صلاحية. Global scopes تساعد لكن ليست دليلًا أن كل raw query/report/admin path معزولة؛ defense-in-depth واختبارات leakage لازمة.",
          "Foreign keys وunique constraints لازم تعكس الحدود: رقم invoice قد يكون unique داخل tenant فقط، وعلاقة child-parent يجب ألا تشير عبر tenants. بعض DB توفر RLS؛ إعدادها واستخدام connection role/context الصحيحين جزء من التصميم، وليست حماية سحرية لكل app."
        ]
      },
      {
        "title": "الـContext يمشي مع الشغل الخلفي",
        "body": [
          "Job تحمل tenant reference موثوقة وoperation ID، وتعيد تهيئة scope بوضوح. Workers طويلة العمر قد تحتفظ بstatic/container state من job سابقة؛ ضع lifecycle لتعيين ومسح context في finally. اعمل test ينفذ tenant A ثم B على نفس worker.",
          "Cache keys وobject storage prefixes وsearch documents وlocks وexports لازم تكون tenant-scoped. Shared signed URL لا تُبنى قبل policy؛ لو تقرير اتخزن تحت اسم ثابت sales.csv ممكن tenant تفتح تقرير غيرها رغم أن query الأصلية كانت صحيحة."
        ]
      },
      {
        "title": "Onboarding وOffboarding عمليات قابلة للاستعادة",
        "body": [
          "إنشاء tenant قد يتضمن owner membership وplan/default settings وstorage/search setup. احفظ provisioning state وsteps idempotent؛ لو external setup فشل لا تعرض tenant ready قبل جاهزية dependencies المطلوبة. Invitation token مرتبطة بالـtenant والدور والexpiry ولا تمنح role أعلى من دعوة المخول.",
          "Offboarding تتبع retention/backup requirements المتفق عليها: revoke access أولًا، أوقف jobs والـexports وتابع deletion/tombstones في search/storage/replicas حسب policy. Restore لعميل واحد أصعب في shared DB؛ خطط له واختبره بدل الاكتشاف يوم الحادث."
        ]
      }
    ],
    "entities": [
      {
        "name": "tenants",
        "fields": "id, slug, state, plan_ref, provision_version",
        "purpose": "حدود الشركة ودورة حياتها.",
        "guard": "Slug فريد؛ ready بعد اكتمال required steps"
      },
      {
        "name": "memberships",
        "fields": "tenant_id, user_id, role, status",
        "purpose": "حق المستخدم في سياق معين.",
        "guard": "Unique tenant-user؛ role grants ضمن سياسة"
      },
      {
        "name": "tenant-owned entities",
        "fields": "tenant_id, local_id, parent_ref, version",
        "purpose": "داتا كل feature داخل boundary واضحة.",
        "guard": "Tenant-scoped unique وعلاقات لا تعبر الحدود"
      },
      {
        "name": "provisioning / deletion_jobs",
        "fields": "tenant_ref, step_key, state, evidence_ref",
        "purpose": "Recovery وإنهاء الخدمة.",
        "guard": "Stable operation identity لكل step"
      }
    ],
    "states": [
      "tenant provisioning -> ready | provisioning_failed -> retry.",
      "membership invited -> active -> revoked؛ context لا يبقى صالحًا بعد revoke حسب السياسة.",
      "tenant suspended -> closing -> retained/deleted طبق policy موثقة."
    ],
    "flow": [
      {
        "title": "Resolve Context",
        "detail": "حدد tenant من route/host/request ثم تحقق من membership server-side.",
        "atomic": "No trust in tenant header alone."
      },
      {
        "title": "Scope & Authorize",
        "detail": "Query/write/policy داخل tenant؛ enforce parent-child boundaries وunique scope.",
        "atomic": "Read/write isolation واحدة."
      },
      {
        "title": "Propagate Work",
        "detail": "Persist trusted tenant+operation IDs في outbox/job؛ namespace cache/search/files.",
        "atomic": "الـworker تهيئ وتمسح context لكل job."
      },
      {
        "title": "Provision Safely",
        "detail": "Steps قابلة للتكرار؛ كل required dependency لها evidence قبل ready.",
        "atomic": "Local writes atomic؛ external recovery منفصل."
      },
      {
        "title": "Operate Lifecycle",
        "detail": "Suspend/revoke/retention/restore لها jobs وaudit وrunbooks واختبارات leakage.",
        "atomic": "No blanket cross-tenant admin bypass."
      }
    ],
    "failures": [
      {
        "symptom": "Job B كتبت داخل شركة A",
        "cause": "Worker احتفظت بـcontext من job سابقة.",
        "fix": "Context lifecycle explicit وfinally cleanup وتجنب mutable singleton.",
        "test": "نفذ A ثم B وفشل A في نفس worker process."
      },
      {
        "symptom": "Cache رجعت تقرير شركة أخرى",
        "cause": "المفتاح report:monthly من غير tenant.",
        "fix": "Namespace tenant+query version+permissions الملائمة.",
        "test": "نفس filters في A/B يجب أن تنتج keys ونتائج معزولة."
      },
      {
        "symptom": "Invoice مرتبطة بcontact من tenant أخرى",
        "cause": "Foreign key تحققت من ID فقط.",
        "fix": "Validate relation ضمن نفس boundary وDB constraint مناسبة للنموذج.",
        "test": "أدخل parent ID من tenant ثانية؛ write ترفض."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/tenants",
        "purpose": "Owner onboarding operation مع key وحالة provisioning."
      },
      {
        "method": "POST",
        "path": "/tenants/{id}/invitations",
        "purpose": "Grant role ضمن صلاحيات inviter وبـexpiry."
      },
      {
        "method": "GET",
        "path": "/tenants/{id}/contacts",
        "purpose": "Membership+policy+tenant query scope."
      },
      {
        "method": "POST",
        "path": "/tenants/{id}/closure-requests",
        "purpose": "Authorization وretention workflow؛ لا حذف عشوائي."
      }
    ],
    "tests": [
      "Leakage tests لكل query/report/file/search/job path.",
      "Long-running worker context cleanup بعد success/failure.",
      "Tenant-scoped unique وparent-child guards.",
      "Provision retry وmembership revoke وper-tenant restore drill."
    ],
    "workshop": [
      {
        "question": "How do you prevent cross-tenant access in a shared-table CRM?",
        "points": [
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
        ]
      },
      {
        "question": "Why is accepting X-Tenant-ID without a membership check unsafe?",
        "points": [
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
        ]
      },
      {
        "question": "How can a queue worker leak tenant data between jobs?",
        "points": [
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
        ]
      },
      {
        "question": "What should tenant-aware cache and export design include?",
        "points": [
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
        ]
      },
      {
        "question": "How do you make tenant onboarding recoverable?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "OWASP Authorization",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
        "note": "Object/action authorization وعزل الصلاحيات."
      },
      {
        "title": "Laravel Lifecycle",
        "url": "https://laravel.com/docs/12.x/lifecycle",
        "note": "اقرأ كمان lifecycle الـruntime والـworkers اللي تستخدمها."
      }
    ],
    "sim": null
  },
  {
    "id": "uploads",
    "title": "Secure Uploads: Quarantine، Processing وPrivate Download",
    "domain": "Storage",
    "summary": "رفع مستندات وصور بملفات كبيرة أو محتوى خطر: نمنع public exposure قبل الفحص، ونفصل upload completion عن readiness ونستعيد الـprocessing بعد الفشل.",
    "concepts": [
      "storage",
      "security",
      "queues",
      "privacy-retention"
    ],
    "chapters": [
      {
        "title": "Upload مش مجرد Store File",
        "body": [
          "حدد الأنواع والأحجام وعدد الملفات والـquota والـprivacy والـretention. صورة profile عامة تختلف عن identity document خاصة. اسم الملف والامتداد وContent-Type من العميل ليست proof للمحتوى. اختر allowlist وتحقق server-side بوسائل مناسبة لنوع المحتوى.",
          "اعمل upload intent مرتبطة actor/tenant وrandom object key بدل استخدام path أرسله العميل. يمكن direct-to-storage URL قصيرة العمر ومحددة النطاق حسب capabilities المزود. اكتمال الرفع ليس إعلانًا أن الملف آمن للعرض."
        ]
      },
      {
        "title": "خلي الملف في Quarantine لحد القرار",
        "body": [
          "الملفات تبدأ private/quarantined. بعد evidence لوجود object وحجمه وخصائصه حسب التكامل، worker تفحص النوع/الحجم والمحتوى وتعمل malware scanning أو content processing الملائم. لا تعد المستخدم بأن scanner تثبت الأمان الكامل؛ التحكم في العرض والتنفيذ مهم أيضًا.",
          "بالصور يمكن decode/re-encode في بيئة محدودة resources وفق libraries موثوقة، مع حد للأبعاد/decompression. ملفات SVG/HTML قد تحمل active content؛ السماح بها يتطلب serving policy وسياق مناسبين. لا تجعل executable uploads تتخزن في web root وتُنفذ."
        ]
      },
      {
        "title": "Processing قابلة للتكرار والتصحيح",
        "body": [
          "Object version/checksum وprocessing version يحددوا المدخل والمخرج. Duplicate storage event لا تنتج thumbnails مرتين. حجز processing state أو CAS يمنع workers متنافسة من اعتماد نتائج قديمة، والـoutput key ترتبط بالنسخة لتجنب overwrite غير مقصود.",
          "لو worker وقع بعد رفع المشتق قبل تحديث DB، retry تبحث عن output المحددة أو تعيد بناءها بأمان. Object storage وDB ليست transaction واحدة؛ يلزم orphan sweeper وstuck-processing job، مع عدم حذف object مستخدمة بناء على مجرد تأخير response."
        ]
      },
      {
        "title": "تحميل الملف نفسه Feature فيها Authorization",
        "body": [
          "احفظ key لا public URL لمستند خاص. Download endpoint تعمل policy ثم signed URL قصيرة العمر أو stream controlled حسب الحاجة. Signed URL قابلة للاستخدام لمن يملكها حتى انتهاء الصلاحية ضمن عقد المزود؛ لا تسجلها في analytics ولا تعتبرها revoke فورية لمجرد حذف session.",
          "اختبر tenant isolation وattachment disposition وsafe content type عند العرض. حذف الملف يمشي مع retention والتبعيات والنسخ والمشتقات؛ اجعل request والـdeletion job واضحة وقابلة للمراجعة بدل حذف metadata فقط وترك الأصل العام."
        ]
      }
    ],
    "entities": [
      {
        "name": "upload_intents",
        "fields": "actor, tenant, key, type_policy, max_size, expires_at",
        "purpose": "صلاحية رفع محددة.",
        "guard": "Opaque key؛ expiry وquota server-side"
      },
      {
        "name": "files",
        "fields": "intent_ref, object_version, size, digest, state, visibility",
        "purpose": "حقيقة الملف وحالته قبل الإتاحة.",
        "guard": "No public availability before ready"
      },
      {
        "name": "processing_runs / derivatives",
        "fields": "file_version, pipeline_version, output_key, state",
        "purpose": "تكرار processing لنفس المدخل آمن.",
        "guard": "Unique input+pipeline+variant"
      },
      {
        "name": "deletion_requests",
        "fields": "file_ref, policy_ref, requested_by, state",
        "purpose": "Retention وcleanup.",
        "guard": "Authorized lifecycle؛ orphan grace window"
      }
    ],
    "states": [
      "intent created -> uploaded -> quarantined -> scanning -> ready | rejected.",
      "processing failed قابلة للretry على نفس version؛ outcome القديمة لا تعتمد ملفًا جديدًا.",
      "ready -> deletion_requested -> deleted وفق retention؛ download permission مستقلة."
    ],
    "flow": [
      {
        "title": "Authorize Intent",
        "detail": "تحقق من actor/tenant والـquota والأنواع؛ اصدر object key وصلاحية رفع محدودة.",
        "atomic": "لا arbitrary storage path من العميل."
      },
      {
        "title": "Verify Arrival",
        "detail": "استقبل completion/event موثوقة ثم تحقق من object metadata المطلوبة.",
        "atomic": "لا ready من client callback فقط."
      },
      {
        "title": "Inspect & Transform",
        "detail": "Quarantine+scanner+type/size/decode checks؛ حد CPU/memory/time للـprocessing.",
        "atomic": "Workers خارج request؛ no serving while pending."
      },
      {
        "title": "Publish Ready",
        "detail": "اعتمد output لنفس object/pipeline version مع metadata atomically.",
        "atomic": "Stale processor لا يكتب فوق نسخة جديدة."
      },
      {
        "title": "Download & Cleanup",
        "detail": "Authorize كل access؛ signed URL/stream حسب السياسة؛ sweeper للأيتام والمتأخرة.",
        "atomic": "Storage cleanup ليست DB transaction تلقائية."
      }
    ],
    "failures": [
      {
        "symptom": "مستند خاص ظهر برابط عام",
        "cause": "Bucket/visibility أصبحت public قبل policy.",
        "fix": "Private by default وdownload authorization قبل grant.",
        "test": "Anonymous وtenant أخرى لا تقرأ الملف أو derivative."
      },
      {
        "symptom": "امتداد jpg لكن المحتوى executable",
        "cause": "وثقنا extension وMIME من request.",
        "fix": "Allowlist ومحتوى حقيقي وsafe serving وquarantine.",
        "test": "اختبر MIME mismatch وpolyglot/active content حسب نطاقك."
      },
      {
        "symptom": "الفيديو processing لا نهائية",
        "cause": "لا timeout/resource budget ولا sweeper.",
        "fix": "Pipeline version وjob budget وdead-letter/recovery queue.",
        "test": "اقتل worker بعد output write؛ retry لا تكرر النشر."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/uploads/intents",
        "purpose": "Type/size declaration+key؛ السيرفر يطبق policy."
      },
      {
        "method": "POST",
        "path": "/uploads/{id}/complete",
        "purpose": "لا يعلن ready؛ يتحقق ويبدأ pipeline."
      },
      {
        "method": "GET",
        "path": "/files/{id}/download",
        "purpose": "Object/tenant authorization ثم access قصير العمر."
      },
      {
        "method": "DELETE",
        "path": "/files/{id}",
        "purpose": "Deletion request وفق policy؛ lifecycle واضحة."
      }
    ],
    "tests": [
      "Oversize، wrong MIME، active content وdecompression limits.",
      "Duplicate completion وold version processing وcrash recovery.",
      "Download access matrix ومشتقات private كذلك.",
      "Quota race وorphan cleanup وretention dependencies."
    ],
    "workshop": [
      {
        "question": "How do you design secure direct-to-storage uploads?",
        "points": [
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
        ]
      },
      {
        "question": "Why is checking the filename extension insufficient?",
        "points": [
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
        ]
      },
      {
        "question": "How do you recover a file processor that crashes after writing output?",
        "points": [
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
        ]
      },
      {
        "question": "Does a signed download URL replace authorization?",
        "points": [
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
        ]
      },
      {
        "question": "How should deleting a private document and its derivatives work?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "OWASP File Upload",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
        "note": "دفاع متعدد الطبقات؛ نوع الـscanner/processor يعتمد على الملفات."
      },
      {
        "title": "Laravel Filesystem",
        "url": "https://laravel.com/docs/12.x/filesystem",
        "note": "Private disks وURLs وstorage operations حسب adapter."
      }
    ],
    "sim": null
  },
  {
    "id": "notifications",
    "title": "Notifications: Reliable Delivery من غير Spam",
    "domain": "Messaging",
    "summary": "نبني email/SMS/push مع outbox وpreferences وretry budget، ونفهم ليه provider accepted مش دليل delivered، وليه exactly-once إرسال ليست وعدًا سهلًا.",
    "concepts": [
      "outbox",
      "message-semantics",
      "queues",
      "observability"
    ],
    "chapters": [
      {
        "title": "ابدأ من Business Event لا Mail::send",
        "body": [
          "Order confirmed حدث domain؛ الإيميل أثر جانبي. احفظ event/outbox مع business transaction عشان لا يخرج تأكيد لطلب اتعمله rollback، ولا تضيع الرسالة لو commit نجحت والـprocess وقع قبل dispatch. afterCommit تمنع قراءة داتا قبلcommit لكنها وحدها لا تعطي durable outbox لكل failure window.",
          "حدد message category: transactional مثل receipt، security مثل login alert، marketing مثل offer. Preferences والـunsubscribe والـquiet hours تختلف حسب category ومتطلبات المنتج/السوق. لا تجعل opting out of marketing يلغي security communications تلقائيًا."
        ]
      },
      {
        "title": "هوية للرسالة وهوية للمحاولة",
        "body": [
          "Delivery intent واحدة لكل business event+recipient+channel+template purpose. Retry هي attempt جديدة لنفس intent، لا رسالة تجارية جديدة. احفظ template version والـlocale وrendered context الملائم للprivacy عشان تعرف ما الذي أرسلته.",
          "Provider accepted تعني أنه قبل الطلب حسب عقده، وقد يأتي delivered/bounced/complained لاحقًا. لو send نفذت والرد ضاع، duplicate ممكنة بدون provider dedupe/query contract؛ كن صريحًا بحدود الضمان ولا تكتب exactly-once في README بلا proof."
        ]
      },
      {
        "title": "Retries بضوابط وChannels منفصلة",
        "body": [
          "صنّف permanent failure مثل invalid address مقابل transient rate limit/outage. استخدم backoff+jitter وmax attempts/time budget وdead-letter. لا تعيد spam على hard bounce؛ suppression policy تمنع الإرسال للعناوين المعطوبة أو الممنوعة وفق category.",
          "اختيار fallback SMS بعدemail timeout يحتاج policy تمنع الإزعاج والتكلفة الزائدة؛ missing receipt لا تعني failed delivery. Security OTP لها TTL/attempt policy ولا يجوز retry قديمة بعد انتهاء challenge، ولا تضع OTP كاملة في logs."
        ]
      },
      {
        "title": "التشغيل وتجربة المستخدم",
        "body": [
          "افصل in-app inbox عن external delivery؛ read receipt للـin-app لا تثبت قراءةemail والعكس. Pagination والـmark-as-read لها object authorization وtenant scope. Bulk campaigns تتقسم batches وrate limits حسب provider والعميل.",
          "راقب enqueue-to-send latency وbounce/complaint/rate-limit والـunknown age. Audit لسبب suppression ونسخة template بدون secrets. Webhooks تحتاج verification وdurable inbox وbusiness state guards كذلك."
        ]
      }
    ],
    "entities": [
      {
        "name": "notification_intents",
        "fields": "business_event, recipient, category, channel, template_version, locale",
        "purpose": "رسالة تجارية واحدة بقرار موثق.",
        "guard": "Unique event+recipient+channel+purpose"
      },
      {
        "name": "delivery_attempts",
        "fields": "intent, provider_ref, attempt_no, state, error_class",
        "purpose": "تتبع المحاولات من غير خلط outcomes.",
        "guard": "Bounded retry؛ stable provider key إن مدعومة"
      },
      {
        "name": "preferences / suppression",
        "fields": "recipient, category, channel, status, reason",
        "purpose": "حق المستخدم وسياسة منع spam.",
        "guard": "Server category policy؛ auditable changes"
      },
      {
        "name": "in_app_inbox",
        "fields": "recipient, tenant, intent_ref, read_at",
        "purpose": "تجربة قراءة مستقلة عن تسليم خارجي.",
        "guard": "Recipient authorization؛ stable pagination"
      }
    ],
    "states": [
      "intent pending -> queued -> submitted -> delivered | bounced | suppressed | unknown.",
      "accepted != delivered؛ callback متأخرة لا تستدعي رسالة جديدة تلقائيًا.",
      "attempt transient_failed -> retry_scheduled؛ permanent_failed -> stopped/review."
    ],
    "flow": [
      {
        "title": "Commit Event",
        "detail": "Domain state وoutbox في transaction واحدة.",
        "atomic": "No email داخل DB lock."
      },
      {
        "title": "Decide Delivery",
        "detail": "طبّق category/preferences/suppression والـlocale/template version؛ claim intent.",
        "atomic": "Unique semantic notification."
      },
      {
        "title": "Render & Submit",
        "detail": "Redact context؛ worker يرسل وفق rate budget وprovider contract.",
        "atomic": "External call قابل للـunknown."
      },
      {
        "title": "Apply Evidence",
        "detail": "Verified delivery callbacks تعالج idempotently ولا تعيد الحالة للخلف.",
        "atomic": "Durable inbox وguarded state."
      },
      {
        "title": "Recover & Observe",
        "detail": "Retry transient فقط؛ dead-letter وsuppression وmetrics لفترة الانتظار.",
        "atomic": "لا إرسال عشوائي لكل webhook مفقودة."
      }
    ],
    "failures": [
      {
        "symptom": "عميل وصله email تأكيد لطلب فشل",
        "cause": "أرسلناه قبل domain commit.",
        "fix": "Transactional outbox وworker بعد دليل success.",
        "test": "Rollback order؛ لا intent قابلة للإرسال."
      },
      {
        "symptom": "عشرات رسائل لنفس الطلب",
        "cause": "Job retries تنشئ intents جديدة بلا business identity.",
        "fix": "Unique intent وprovider contract واضح للtimeout.",
        "test": "Duplicate event+worker crash؛ راقب bounds الممكنة للتكرار."
      },
      {
        "symptom": "Delivered اتغيرت إلى queued",
        "cause": "وثقنا arrival order لwebhooks.",
        "fix": "Allowed transitions/state evidence مع منع regression.",
        "test": "delivered ثم queued قديمة؛ لا regression ولا resend."
      }
    ],
    "api": [
      {
        "method": "GET",
        "path": "/notifications",
        "purpose": "Recipient-scoped in-app inbox."
      },
      {
        "method": "PUT",
        "path": "/notification-preferences",
        "purpose": "Category/channel validation؛ لا إسقاط security category بلا policy."
      },
      {
        "method": "POST",
        "path": "/notifications/{id}/read",
        "purpose": "Authorized idempotent read receipt."
      },
      {
        "method": "POST",
        "path": "/webhooks/notification-providers",
        "purpose": "Verification+durable intake؛ accepted/delivery distinction."
      }
    ],
    "tests": [
      "Commit/dispatch crash windows، duplicate domain event.",
      "Provider timeout و429 وhard bounce وlate callbacks.",
      "Preferences حسب category وlocale/template escaping.",
      "Recipient isolation، TTL للOTP وعدم تسريب secrets."
    ],
    "workshop": [
      {
        "question": "How do you avoid sending order confirmation for rolled-back orders?",
        "points": [
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
        ]
      },
      {
        "question": "Does provider accepted mean an email was delivered?",
        "points": [
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
        ]
      },
      {
        "question": "How do you design notification retry policy for transient and permanent failures?",
        "points": [
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
        ]
      },
      {
        "question": "Can you promise exactly-once external email delivery?",
        "points": [
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
        ]
      },
      {
        "question": "How should transactional and marketing preferences differ?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Laravel Queues",
        "url": "https://laravel.com/docs/12.x/queues",
        "note": "Retries، failed jobs وafter-commit behavior؛ outbox قرار معماري إضافي."
      },
      {
        "title": "Laravel Notifications",
        "url": "https://laravel.com/docs/12.x/notifications",
        "note": "Channels وdatabase notifications حسب framework version."
      }
    ],
    "sim": null
  },
  {
    "id": "search",
    "title": "Search & Filtering: Query Contracts وStable Pagination",
    "domain": "Data",
    "summary": "Catalog أو CRM ببحث وفلاتر وترتيب وصفحات: نبدأ بـSQL مقاسة، ونضيف search index لما يلزم مع إدراك eventual consistency وtenant authorization.",
    "concepts": [
      "sql-indexes",
      "rest-api",
      "consistency-models",
      "data-contracts"
    ],
    "chapters": [
      {
        "title": "تعريف نتيجة البحث قبل اختيار المحرك",
        "body": [
          "حدد fields قابلة للبحث، filters المدعومة، sort rules، pagination وحاجة exact totals. Search الاسم بالعربي قد يحتاج normalization/tokenization ومراعاة اللغة؛ LIKE wildcard لا تعطي تلقائيًا relevance أو typo tolerance. اكتب أمثلة متوقعة وقياس relevance قبل Elasticsearch.",
          "ابدأ من حجم الداتا وquery latency المطلوبة. SQL indexes وfull-text قد تكفي. Search engine يضيف ranking وتوسعًا لكنه يضيف index pipeline وتكلفة وتباينًا مؤقتًا بين DB والـindex؛ الـDB تظل source of truth لقرارات حساسة مثل السعر والتوفر."
        ]
      },
      {
        "title": "Query Contract آمنة ومحدودة",
        "body": [
          "Allowlist لأسماء filter/sort والـoperators؛ values تستخدم parameter binding، وأسماء الأعمدة لا تأخذها خامًا من client. حدّد max page size وتعقيد filters ووقت التنفيذ. Tenant/visibility constraints تفرض server-side في query نفسها، لا بعد pagination حيث تتسرب counts أو تتفرغ الصفحات.",
          "اختار composite index بناءً على WHERE وORDER BY والـselectivity وخطة التنفيذ. لا تضف index لكل field عشوائيًا؛ read gains مقابل write/storage cost. قِس EXPLAIN/actual workload وslow query budget."
        ]
      },
      {
        "title": "Stable Cursor لا يساوي Snapshot تلقائيًا",
        "body": [
          "لو الترتيب created_at DESC أضف id DESC كـunique tie-breaker. Cursor تحمل آخر tuple وتربط بالـquery/sort/tenant المناسبة، وتتحقق من صحتها. Seek condition تطلب ما بعد tuple بدل skip ملايين الصفوف. Offset قد يكون كافيًا لصفحات صغيرة واحتياج page number.",
          "Cursor العادية لا تثبّت dataset لو records تتعدل بين requests؛ sort field mutable قد يعيد أو يخفي نتائج. لو تحتاج export ثابتة أو session search متسقة، حدد snapshot/watermark أو آلية point-in-time حسب المحرك. Cursor ليست permission ولا بديل policy."
        ]
      },
      {
        "title": "Index Pipeline وRebuild من غير Data Loss",
        "body": [
          "بعد DB commit أنشئ index change عبر outbox أو CDC بidentity/version. Worker لا تسمح event أقدم تكتب فوق document أحدث. Delete تحتاج tombstone/version؛ تأخير delete لا يبيح إعادة بيانات خاصة من index.",
          "Rebuild تستخدم versioned index مع catch-up وخطة cutover/rollback، وتراقب lag وmismatches. لو search lagت، اعرض حالة مناسبة، وأعد validation في checkout بدل الوعد بسعر/stock من نتيجة قديمة. اختبر اللغات وstop words والـzero-result وlatency."
        ]
      }
    ],
    "entities": [
      {
        "name": "query_contract",
        "fields": "allowed_filters, allowed_sorts, limits, cursor_version",
        "purpose": "API ثابتة قابلة للتوثيق.",
        "guard": "Allowlist+parameterized values؛ server visibility"
      },
      {
        "name": "search_documents",
        "fields": "entity_id, tenant_id, source_version, indexed_fields, deleted",
        "purpose": "Projection مشتقة لا source of truth.",
        "guard": "Version guard؛ tenant constraints"
      },
      {
        "name": "index_outbox / checkpoints",
        "fields": "entity_ref, version, operation, offset",
        "purpose": "Recovery وrebuild catch-up.",
        "guard": "Replay-safe وdelete semantics"
      },
      {
        "name": "cursor / snapshot",
        "fields": "sort_tuple, query_fingerprint, expiry, snapshot_ref",
        "purpose": "تفسير الصفحة التالية.",
        "guard": "Bound to intended query؛ no authorization bypass"
      }
    ],
    "states": [
      "source committed -> change queued -> indexed؛ lag متوقع ومقاس.",
      "document version n لا تُستبدل بn-1؛ delete/tombstone لها ordering.",
      "rebuild building -> catching_up -> active؛ rollback محفوظ ضمن policy."
    ],
    "flow": [
      {
        "title": "Validate Query",
        "detail": "Resolve tenant+visibility؛ allowlist filters/sorts وlimits.",
        "atomic": "No raw column names from client."
      },
      {
        "title": "Plan Access",
        "detail": "Choose SQL/index plan وفق workload؛ include unique sort tie-breaker.",
        "atomic": "قِس الخطة بدل التخمين."
      },
      {
        "title": "Fetch Page",
        "detail": "Use seek tuple/cursor أو offset المناسب؛ enforce auth before counts/results.",
        "atomic": "Cursor لا تثبت snapshot تلقائيًا."
      },
      {
        "title": "Validate Sensitive Action",
        "detail": "عند buy/edit اقرأ source of truth وتحقق price/stock/permissions الحالية.",
        "atomic": "Search result ليست final business evidence."
      },
      {
        "title": "Sync & Rebuild",
        "detail": "Versioned index updates وtombstones وlag alerts؛ safe cutover عند rebuild.",
        "atomic": "External projection recovery منفصلة."
      }
    ],
    "failures": [
      {
        "symptom": "Records بتتكرر بين الصفحات",
        "cause": "Sort غير unique أو field تتغير بلا snapshot policy.",
        "fix": "Tie-breaker tuple وcursor query binding مع توثيق consistency.",
        "test": "عدة records بنفس timestamp وإضافات/updates بين requests."
      },
      {
        "symptom": "بيانات tenant أخرى ظهرت في counts",
        "cause": "Filter authorization بعد query/pagination.",
        "fix": "Tenant/visibility predicates داخل data access نفسها.",
        "test": "استعلام tenants بنفس filter؛ لا تسريب rows أوcounts."
      },
      {
        "symptom": "منتج اتمسح لكنه رجع بعد reindex",
        "cause": "Old event كتبت فوق tombstone.",
        "fix": "Version-aware upsert/delete مع rebuild catch-up.",
        "test": "أرسل update n-1 بعد delete n؛ لا resurrection."
      }
    ],
    "api": [
      {
        "method": "GET",
        "path": "/catalog/search",
        "purpose": "Bounded filters/sort/cursor؛ visibility enforced."
      },
      {
        "method": "GET",
        "path": "/products/{id}",
        "purpose": "Current authorized detail من source of truth."
      },
      {
        "method": "POST",
        "path": "/admin/search-rebuilds",
        "purpose": "Versioned controlled job؛ لا إيقاف index الحالية فجأة."
      }
    ],
    "tests": [
      "Equal sort values، mutable sort fields وquery/cursor mismatch.",
      "Injection في sort/filter وoversized page limits.",
      "Old update after delete وrebuild أثناء writes.",
      "Tenant visibility وindex lag وArabic relevance examples."
    ],
    "workshop": [
      {
        "question": "How do you make cursor pagination deterministic for created_at sorting?",
        "points": [
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
        ]
      },
      {
        "question": "How do you safely expose arbitrary catalog filters?",
        "points": [
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
        ]
      },
      {
        "question": "What if search shows stock that checkout cannot sell?",
        "points": [
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
        ]
      },
      {
        "question": "How can an old search update resurrect a deleted record?",
        "points": [
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
        ]
      },
      {
        "question": "When do you introduce a dedicated search engine?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Elasticsearch Pagination",
        "url": "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results",
        "note": "search_after وtie-breakers وPIT تخص هذا المحرك."
      },
      {
        "title": "Laravel Query Builder",
        "url": "https://laravel.com/docs/12.x/queries",
        "note": "Binding وquery construction؛ افهم حدود raw expressions."
      }
    ],
    "sim": null
  },
  {
    "id": "bulk-data",
    "title": "Import & Export: ملايين الصفوف من غير Timeout",
    "domain": "Data",
    "summary": "رفع CSV أو تصدير تقرير كبير كـworkflow قابلة للتتبع والاستكمال، مع validation وpartial failure policy وmemory budget وملفات خاصة.",
    "concepts": [
      "generators",
      "data-contracts",
      "queues",
      "privacy-retention"
    ],
    "chapters": [
      {
        "title": "حول الطلب الكبير إلى Operation",
        "body": [
          "HTTP request تنشئ import/export operation وترد accepted مع status URL. الملف private ومعاه schema version وactor/tenant وparameters fingerprint. العملية نفسها لها key ثابتة؛ إعادة طلب المستخدم لا تبدأ bulk job ثانية لنفس النية.",
          "حدد import semantics: all-or-nothing ولا partial success، هل upsert حسب external ID، وما قواعد duplicate rows والتحديثات. ملف100ألف صف لا يتحول transaction طويلة بقفل النظام؛ لو atomic visibility مطلوبة استخدم staging ثم publish/cutover مصمم، مش وهم transaction موزعة على chunks."
        ]
      },
      {
        "title": "Validation قبل الكتابة وبعدها",
        "body": [
          "افحص format/encoding/headers/size ثم parse streaming. Normalize أنواع الأرقام والتواريخ وفق contract لا وفق locale عشوائية. Dry-run يفحص errors ويعطي preview، لكنه لا يضمن بقاء كل foreign keys/unique values متاحة وقت التنفيذ؛ DB guards تظل لازمة.",
          "كل row لها stable source identity داخل operation، وbusiness key لا تتبدل مع retry. Chunk transaction تحفظ effects/checkpoint بصورة تسمح بالاستعادة؛ لو checkpoint اتقدم قبل commit تضيع rows، ولو بعد commit من غير row dedupe قد تتكرر effects."
        ]
      },
      {
        "title": "Memory والـOrdering والتوقف",
        "body": [
          "اقرأ stream/chunks ولا تحمل CSV كلها في collection. Keyset pagination/chunkById في exports مناسب لحالات معينة، لكن لو الداتا تتغير تحتاج snapshot/watermark/consistent report policy. Progress total قد تكون تقديرية لو source live؛ سمها بوضوح.",
          "Cancel طلب توقف تعاوني عند safe boundary؛ ما تم commit لا يرجع تلقائيًا. لو محتاج undo سجل provenance وversion conflict policy وخطة تعويض. Limits على parallel chunks تحمي DB والـqueue من مهمة عميل واحد."
        ]
      },
      {
        "title": "النتيجة ملف آمن ومفهوم",
        "body": [
          "Export private وexpiry/retention، ويعاد authorization وقت التنزيل حسب policy؛ user اتشالت صلاحيتها لا تستمر بقدرة download غير مقيدة. Error file لا تسرب PII غير لازمة، وكل row توضح السبب ورقم المصدر مع counts متسقة.",
          "CSV cells التي تُفتح في spreadsheet قد تُفسّر كformula؛ طبّق export policy مناسبة للـconsumer وميز text fields، ولا تغيّر أرقام business بصمت. راقب rows/sec وfailure ratio وqueue age ومساحةstorage؛ reconcile checkpoints مع النتائج."
        ]
      }
    ],
    "entities": [
      {
        "name": "bulk_operations",
        "fields": "kind, tenant, actor, key, fingerprint, schema_version, state",
        "purpose": "هوية العملية وحالة متابعتها.",
        "guard": "Scoped idempotency؛ parameters immutable"
      },
      {
        "name": "staging_rows / row_results",
        "fields": "operation, source_row, business_key, validation, target_ref",
        "purpose": "دليل التنفيذ لكل row.",
        "guard": "Unique operation+source identity؛ domain uniqueness"
      },
      {
        "name": "chunk_checkpoints",
        "fields": "operation, chunk_ref, cursor, committed_count",
        "purpose": "استكمال بعد crash.",
        "guard": "Checkpoint متسقة مع committed effects"
      },
      {
        "name": "export_artifacts",
        "fields": "operation, key, snapshot_ref, expires_at, visibility",
        "purpose": "نتيجة خاصة وسياسة زمنية.",
        "guard": "Authorization عند download؛ bounded retention"
      }
    ],
    "states": [
      "operation accepted -> validating -> running -> completed | completed_with_errors | failed.",
      "cancel_requested -> cancelled عند safe boundary؛ لا promise undo لكل committed rows.",
      "artifact building -> ready -> expired/deleted؛ progress مستقل عن availability."
    ],
    "flow": [
      {
        "title": "Accept Operation",
        "detail": "Authorize scope وformat/limits؛ احفظ source reference وschema/fingerprint.",
        "atomic": "HTTP قصيرة، work خارج request."
      },
      {
        "title": "Stage & Validate",
        "detail": "Stream parse إلى staging/results؛ dry-run errors مع row identities.",
        "atomic": "حد memory/time؛ no giant transaction."
      },
      {
        "title": "Process Chunks",
        "detail": "Guard/upsert domain rows وrow-result/checkpoint في transaction متسقة.",
        "atomic": "Replay لا يكرر business effect."
      },
      {
        "title": "Publish Result",
        "detail": "Counts من committed results؛ artifact private أو visibility cutover حسب policy.",
        "atomic": "Completion evidence لا enqueue فقط."
      },
      {
        "title": "Recover & Retain",
        "detail": "Retry safe chunks، cancel عند boundary، cleanup ملفات وrunbook للexception.",
        "atomic": "Undo لها operation وسياسة مختلفة."
      }
    ],
    "failures": [
      {
        "symptom": "Worker وقع فأول chunk اتكررت",
        "cause": "لا row identity/checkpoint atomicity.",
        "fix": "Unique source/business refs مع effects+checkpoint transaction.",
        "test": "اقتل worker بعد write قبل acknowledgment؛ لا duplicate rows."
      },
      {
        "symptom": "Import عطلت قاعدة البيانات",
        "cause": "كل الملف transaction واحدة أو parallelism بلا حدود.",
        "fix": "Bounded chunks ومعايير atomic visibility عبر staging إن لزم.",
        "test": "Load test مع traffic عادية وقياس locks/latency."
      },
      {
        "symptom": "CSV شغّلت formulas عند الفتح",
        "cause": "اعتبرنا كل export text بلا consumer policy.",
        "fix": "Escape/encode cells وفق spreadsheet consumer contract وفحص input.",
        "test": "قيم تبدأ characters خاصة لا تتحول formulas حسب سياسة التصدير."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/imports",
        "purpose": "Source file+schema+mode+key؛ returns operation status."
      },
      {
        "method": "POST",
        "path": "/exports",
        "purpose": "Authorized query+snapshot policy؛ no sync huge download."
      },
      {
        "method": "GET",
        "path": "/bulk-operations/{id}",
        "purpose": "Committed counts وerrors state بشكل صادق."
      },
      {
        "method": "POST",
        "path": "/bulk-operations/{id}/cancel",
        "purpose": "Cooperative cancellation؛ no automatic undo."
      }
    ],
    "tests": [
      "Crash في كل موضع checkpoint وreplay لchunk.",
      "Malformed encoding/headers/dates وduplicate business keys.",
      "Partial success وcancel-after-commit وdry-run drift.",
      "Memory bound، tenant isolation، CSV formula policy وprivate downloads."
    ],
    "workshop": [
      {
        "question": "How do you import a large CSV without exhausting request memory?",
        "points": [
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
        ]
      },
      {
        "question": "How do you make chunk retries safe after a crash?",
        "points": [
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
        ]
      },
      {
        "question": "Does cancelling an import automatically undo committed rows?",
        "points": [
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
        ]
      },
      {
        "question": "How do you provide an all-or-nothing visible import at scale?",
        "points": [
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
        ]
      },
      {
        "question": "What should a secure export operation include?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "Laravel Queues",
        "url": "https://laravel.com/docs/12.x/queues",
        "note": "Batching/retries؛ checkpoint correctness من تصميمك."
      },
      {
        "title": "Laravel Query Chunking",
        "url": "https://laravel.com/docs/12.x/queries#chunking-results",
        "note": "اختيار chunking يتأثر بالتعديلات والترتيب أثناء القراءة."
      }
    ],
    "sim": null
  },
  {
    "id": "approvals",
    "title": "Approval Workflows: Maker–Checker وAudit",
    "domain": "Workflow",
    "summary": "طلبات موافقات على مبالغ وتغييرات حساسة: نثبت النسخة المعتمدة، ونمنع self-approval أو تنفيذ مرتين، ونعالج تغيير البيانات بعد الاعتماد.",
    "concepts": [
      "admin-approvals",
      "workflow-state-contract",
      "business-idempotency",
      "adr-communication"
    ],
    "chapters": [
      {
        "title": "موافقة على Payload محددة",
        "body": [
          "الطلب مش approved Boolean. هو subject وaction وamount/currency/beneficiary أو parameters أخرى وversion وسبب ومستندات وpolicy version. Approver يوافق على النسخة المعروضة، لا على إذن مفتوح لتغيير كل البيانات بعدها.",
          "مثال: maker طلب refund500 لorder77، checker وافق version3. لو amount اتغيرت5000، الطلب يرجع للمراجعة أو version جديدة، والتنفيذ يرفض approval القديمة. استعمل fingerprint وimmutable submitted payload أو concurrency version guards."
        ]
      },
      {
        "title": "سلسلة الموافقات وسياسة فصل الأدوار",
        "body": [
          "حدد thresholds وعدد المراجعين وeligible roles وdelegation/absence وقواعد maker≠checker. زيادة role بعد submission لا تجعل موافقة سابقة تغطي نطاقًا جديدًا تلقائيًا. policy version توضح القرار الذي حكم الطلب في وقت التقديم أو التنفيذ حسب contract.",
          "Permissions تتحقق داخل السيرفر، لا في task UI. Transition approve/reject/cancel/expire تحدد allowed current state وactor والوقت. طلبا approve متزامنان لا ينفذا effect مالية مرتين، والـquorum إن وجد لازم يحسب تحت guard."
        ]
      },
      {
        "title": "اعتماد الطلب غير تنفيذ الأثر",
        "body": [
          "approved تعني allowed to execute؛ worker قد تتأخر أو تفشل. claim execution operation ثابتة في transaction، revalidate approved version والحدود الحالية المطلوبة ثم domain effect/outbox. لا تمسك locks عبر provider network call.",
          "لو التنفيذ الخارجي timeout، request قد تظل execution_unknown بدل failed قابلة لإعادة تشغيل جديدة. Resolve بنفس reference ثم reconcile؛ زر retry يعيد نفس operation. لو حدثت نتيجة ناجحة، rollback approval لا يمسح الأثر، بل correction workflow منفصلة."
        ]
      },
      {
        "title": "Audit له معنى تشغيلي",
        "body": [
          "Audit يسجل من طلب ومن وافق ومتى وعلى أي payload/version وسبب وأدلة وexecution reference، مع ضوابط الوصول والـretention. Append-only behavior وحماية ضد العبث تتناسب مع المخاطر؛ مجرد log text ليست ledger مالية.",
          "راقب pending approvals age وapproval-to-execution latency وunknown outcomes، واعمل escalation بدون منح صلاحيات تلقائية. Support view تشرح state الحالية وما ينقص القرار بدل زر Force success يخفي الاختلاف."
        ]
      }
    ],
    "entities": [
      {
        "name": "approval_requests",
        "fields": "subject, action, payload, fingerprint, version, policy_version, state",
        "purpose": "الوعد المحدد المطلوب اعتماده.",
        "guard": "Submitted payload محمية من التعديل غير المعتمد"
      },
      {
        "name": "approval_decisions",
        "fields": "request, version, reviewer, decision, reason, at",
        "purpose": "دليل من اعتمد النسخة.",
        "guard": "Unique eligible decision؛ separation rules"
      },
      {
        "name": "executions",
        "fields": "request_version, business_operation, external_ref, state",
        "purpose": "مرة واحدة لتنفيذ approved action.",
        "guard": "Unique semantic execution؛ guarded version"
      },
      {
        "name": "audit_events",
        "fields": "actor, action, subject_version, evidence_ref, timestamp",
        "purpose": "تفسير ومراجعة lifecycle.",
        "guard": "Protected append history؛ no secrets"
      }
    ],
    "states": [
      "draft -> submitted -> approved | rejected | expired | cancelled.",
      "approved -> executing -> succeeded | execution_unknown | confirmed_failed.",
      "تغيير parameters يبطل النسخة المعتمدة؛ correction بعد success طلب جديد مرتبط."
    ],
    "flow": [
      {
        "title": "Submit Version",
        "detail": "Validate scope+threshold وfreeze payload/version/fingerprint وreason.",
        "atomic": "Maker permissions server-side."
      },
      {
        "title": "Review & Decide",
        "detail": "Checker يشوف نفس النسخة؛ يتحقق role/quorum/separation ويعتمد تحت guard.",
        "atomic": "لا self-approval حيث policy تمنعها."
      },
      {
        "title": "Claim Execution",
        "detail": "Verify approved/current version وقيود domain؛ أنشئ stable execution key.",
        "atomic": "Only one execution intent."
      },
      {
        "title": "Execute & Confirm",
        "detail": "Local effect/outbox ثم provider خارج locks؛ success evidence أوunknown recovery.",
        "atomic": "Approval لا تساوي provider success."
      },
      {
        "title": "Audit & Correct",
        "detail": "احتفظ بتاريخ decisions وexecution؛ correction جديدة للحركة المنفذة فعليًا.",
        "atomic": "لا إعادة كتابة نتيجة مالية ناجحة."
      }
    ],
    "failures": [
      {
        "symptom": "المدير وافق500 واتنفذ5000",
        "cause": "التنفيذ قرأ payload المعدلة بلا version check.",
        "fix": "Approval bound to immutable fingerprint+version؛ change يحتاج مراجعة جديدة.",
        "test": "عدّل amount/beneficiary بعد approve؛ execute يرفض."
      },
      {
        "symptom": "اتنفذت مرتين مع approve مزدوجة",
        "cause": "ربطنا كل decision بeffect بدلexecution واحدة.",
        "fix": "Semantic execution unique والـquorum تحت guard.",
        "test": "Reviewerان يوافقان معretryworker؛ effect count1."
      },
      {
        "symptom": "Timeout اعتُبرت فشل واتعملت payment جديدة",
        "cause": "لا فصل بين approved/executing/unknown.",
        "fix": "Stable execution reference وreconciliation قبل بديل.",
        "test": "Provider ينفذ ثم timeout؛ لا إعادة أثر جديد."
      }
    ],
    "api": [
      {
        "method": "POST",
        "path": "/approval-requests",
        "purpose": "Create subject payload+policy context+key."
      },
      {
        "method": "POST",
        "path": "/approval-requests/{id}/submit",
        "purpose": "Freeze current version؛ reject stale client version."
      },
      {
        "method": "POST",
        "path": "/approval-requests/{id}/decisions",
        "purpose": "Reviewer authorization+approved_version+reason."
      },
      {
        "method": "GET",
        "path": "/approval-requests/{id}",
        "purpose": "State وhistory authorized؛ no secret evidence URLs."
      }
    ],
    "tests": [
      "Self-approval، wrong role، threshold والـquorum races.",
      "Payload mutation بعد approval وstale version attempts.",
      "Double execute وprovider unknown/reconcile.",
      "Audit permissions وexpiry/cancel أثناءreview والتنفيذ."
    ],
    "workshop": [
      {
        "question": "How do you prevent changing a refund amount after approval?",
        "points": [
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
        ]
      },
      {
        "question": "How do you stop two approvals from executing the same action twice?",
        "points": [
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
        ]
      },
      {
        "question": "Should approved mean that a bank payout has completed?",
        "points": [
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
        ]
      },
      {
        "question": "What does a useful approval audit trail contain?",
        "points": [
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
        ]
      },
      {
        "question": "How do you design maker-checker controls without a UI-only guard?",
        "points": [
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
        ]
      }
    ],
    "sources": [
      {
        "title": "OWASP Authorization",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
        "note": "Authorization checks مستقلة عن شكل صفحة الموافقات."
      },
      {
        "title": "Laravel Database Transactions",
        "url": "https://laravel.com/docs/12.x/database#database-transactions",
        "note": "Local state guards؛ external outcome مستقلة."
      }
    ],
    "sim": null
  }
];
