import type {Track} from './content';
export const engineeringTracks:Track[] = [
  {
    "title": "Requirements & Problem Definition",
    "ar": "افهم المشكلة قبل ما تختار الحل",
    "desc": "Functional requirements، Quality attributes وAcceptance criteria",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Ambiguous realtime requirements",
        "question": "A client asks for a realtime sales dashboard. What must you clarify before selecting WebSockets, queues or a database?",
        "lesson": "كلمة realtime مش specification. اسأل عن freshness والـvolume والصلاحيات والـfailure behavior، وافصل المطلوب دلوقتي عن assumptions.",
        "model": "Clarify users, decisions supported, freshness tolerance, workload, data ownership, authorization and outage behavior. Write measurable quality targets and explicit scope, compare polling or event-driven options afterward, and record unresolved assumptions. Validate acceptance examples with the stakeholder before committing to technology.",
        "criteria": [
          {
            "label": "users and outcome",
            "terms": [
              "user",
              "outcome"
            ]
          },
          {
            "label": "measurable freshness",
            "terms": [
              "freshness",
              "latency"
            ]
          },
          {
            "label": "constraints",
            "terms": [
              "constraint",
              "volume"
            ]
          },
          {
            "label": "acceptance",
            "terms": [
              "acceptance",
              "example"
            ]
          }
        ],
        "pitfall": "اختيار transport قبل تعريف freshness ممكن يحل latency مش مطلوبة ويترك correctness ناقصة.",
        "deliverable": "اكتب صفحة requirements فيها 3 functional و3 quality requirements وopen questions.",
        "conceptIds": [
          "requirements",
          "specification"
        ]
      },
      {
        "title": "Measurable quality attributes",
        "question": "Turn \"the booking API must be fast and reliable\" into testable requirements. State workload and measurement boundaries.",
        "lesson": "اربط target بالـpercentile والـworkload والـwindow وتعريف success؛ الرقم من غير context ممكن يدي نتيجة مضللة.",
        "model": "Specify a percentile latency threshold at a defined request mix and concurrency, and define successful eligible requests over a measurement window. Include correctness, timeout and overload behavior, environment and data size. Explain how load tests and production SLIs validate the targets.",
        "criteria": [
          {
            "label": "latency percentile",
            "terms": [
              "p95",
              "p99",
              "percentile"
            ]
          },
          {
            "label": "workload",
            "terms": [
              "workload",
              "concurrency"
            ]
          },
          {
            "label": "success definition",
            "terms": [
              "success",
              "eligible"
            ]
          },
          {
            "label": "validation",
            "terms": [
              "load test",
              "sli"
            ]
          }
        ],
        "pitfall": "متخلطش متوسط latency بهدف p95، ولا successful HTTP response بصحة business outcome.",
        "deliverable": "اكتب 4 acceptance checks ومعاهم طريقة القياس والـenvironment.",
        "conceptIds": [
          "requirements",
          "specification"
        ]
      },
      {
        "title": "State transition specification",
        "question": "Specify seat reservation, expiry and payment confirmation when a payment may succeed after expiry.",
        "lesson": "الحالات والانتقالات لازم تتحدد قبل implementation، خصوصًا الأحداث المتأخرة اللي مفيش rollback عالمي ليها.",
        "model": "Define explicit reservation/payment states, ownership and invariants. Specify atomic transitions, event identities and the late-success policy: safely re-reserve, compensate or escalate. Include duplicate/concurrent events and an audit trail. Derive tests from the transition table rather than independent booleans.",
        "criteria": [
          {
            "label": "states invariants",
            "terms": [
              "state",
              "invariant"
            ]
          },
          {
            "label": "atomic transition",
            "terms": [
              "atomic"
            ]
          },
          {
            "label": "late policy",
            "terms": [
              "late",
              "refund"
            ]
          },
          {
            "label": "tests audit",
            "terms": [
              "test",
              "audit"
            ]
          }
        ],
        "pitfall": "paid=true وexpired=true من غير policy مش state model مفهومة.",
        "deliverable": "ارسم transition table فيها allowed/denied transitions وأثر كل انتقال.",
        "conceptIds": [
          "requirements",
          "specification"
        ]
      },
      {
        "title": "Scope and delivery slices",
        "question": "You have two weeks to deliver reporting, export, dashboards and realtime alerts. How do you define a safe first slice?",
        "lesson": "قسّم الشغل حسب user value وقابلية التحقق، مش حسب backend أسبوع وfrontend أسبوع من غير vertical outcome.",
        "model": "Rank user outcomes and dependencies, agree a minimal vertical slice and explicit non-goals, and document quality/security constraints that cannot be deferred. Deliver observable behavior with tests, collect feedback and use controlled rollout. Track assumptions and risks instead of promising the entire wishlist.",
        "criteria": [
          {
            "label": "prioritize value",
            "terms": [
              "value",
              "priorit"
            ]
          },
          {
            "label": "vertical slice",
            "terms": [
              "slice"
            ]
          },
          {
            "label": "nonnegotiable constraints",
            "terms": [
              "security",
              "constraint"
            ]
          },
          {
            "label": "feedback rollout",
            "terms": [
              "feedback",
              "rollout"
            ]
          }
        ],
        "pitfall": "MVP مش تصريح بتجاهل authorization أو data integrity عشان الوقت قصير.",
        "deliverable": "اكتب خطة 3 slices: value، acceptance، risk، وما هو خارج النطاق.",
        "conceptIds": [
          "requirements",
          "specification"
        ]
      },
      {
        "title": "Traceability and change impact",
        "question": "A requirement changes from one active subscription per user to one per organization. What artifacts and code paths do you inspect?",
        "lesson": "تغيير الجملة ممكن يغيّر keys والـauthorization والـbilling والمigrations والـAPI contracts. تتبّع invariant عبر النظام بدل تعديل validation فقط.",
        "model": "Trace the invariant through schema uniqueness, ownership/policies, APIs, billing workflows, jobs and tests. Plan data migration and duplicate resolution, assess old/new client compatibility and rollout, and update acceptance criteria and documentation. Confirm the changed domain meaning before rewriting implementation.",
        "criteria": [
          {
            "label": "invariant tracing",
            "terms": [
              "invariant",
              "schema"
            ]
          },
          {
            "label": "ownership",
            "terms": [
              "policy",
              "ownership"
            ]
          },
          {
            "label": "migration compatibility",
            "terms": [
              "migrat",
              "compatib"
            ]
          },
          {
            "label": "tests docs",
            "terms": [
              "test",
              "document"
            ]
          }
        ],
        "pitfall": "تغيير unique validation من غير DB constraint أو backfill policy يسيب inconsistency.",
        "deliverable": "اعمل impact checklist وmigration decision ومثالين regression tests.",
        "conceptIds": [
          "requirements",
          "specification"
        ]
      }
    ]
  },
  {
    "title": "Correctness, Logic & Estimation",
    "ar": "اثبت الفكرة واحسب حدودها",
    "desc": "Contracts، Invariants، Sets، Probability وUnits",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Prove lower-bound search",
        "question": "State preconditions, a loop invariant, a progress measure and a postcondition for lower-bound binary search.",
        "lesson": "إثبات الصحة محتاج تحدد معنى النطاق المستبعد وتوضح ليه كل iteration تقلله، مش شرح حركة low/high بس.",
        "model": "Assume a sorted dense list. Maintain that values before low are below target and values at/after high qualify. Shrink high-low each iteration with the appropriate mid branch. At convergence low is the first qualifying index or n. Test empty input, duplicates and extremes.",
        "criteria": [
          {
            "label": "precondition",
            "terms": [
              "sorted"
            ]
          },
          {
            "label": "invariant",
            "terms": [
              "invariant"
            ]
          },
          {
            "label": "termination",
            "terms": [
              "shrink",
              "high-low"
            ]
          },
          {
            "label": "postcondition",
            "terms": [
              "first",
              "n"
            ]
          }
        ],
        "pitfall": "O(log n) مش دليل صحة لو boundaries بتستبعد إجابة صحيحة.",
        "deliverable": "اكتب proof مختصرة و4 boundary examples من غير تغيير implementation.",
        "conceptIds": [
          "correctness",
          "math-reasoning"
        ]
      },
      {
        "title": "Set identity and uniqueness",
        "question": "You deduplicate customer IDs from multiple systems. Are \"01\", 1 and \"1\" the same identity? What must the algorithm know?",
        "lesson": "Identity domain rule مش قرار تلقائي من hash map أو loose equality. عرّف canonicalization قبل dedup وحدد مصدر الـID.",
        "model": "Define identity with source/tenant scope and an explicit representation/canonicalization policy. Preserve distinct identifiers where required and avoid implicit key coercion. Use a set only after specifying equality, test collisions and malformed input, and use durable uniqueness when multiple processes write shared data.",
        "criteria": [
          {
            "label": "identity policy",
            "terms": [
              "identity",
              "equality"
            ]
          },
          {
            "label": "source scope",
            "terms": [
              "source",
              "tenant"
            ]
          },
          {
            "label": "coercion",
            "terms": [
              "coercion"
            ]
          },
          {
            "label": "string durable tests",
            "terms": [
              "test",
              "unique"
            ]
          }
        ],
        "pitfall": "Normalization عمياء ممكن تدمج حسابين مختلفين؛ والعكس ممكن يسمح duplicates.",
        "deliverable": "اكتب equality rules وtable فيها IDs لازم تتساوى وأخرى لازم تختلف.",
        "conceptIds": [
          "correctness",
          "math-reasoning"
        ]
      },
      {
        "title": "Capacity estimate with units",
        "question": "Estimate raw daily storage for 80 events/sec at 1.5 KB per event, then explain why disk usage will differ.",
        "lesson": "الـunits والـretention والـoverhead جزء من التقدير؛ ابدأ raw size وبعدها اعرض range بدل precision زائفة.",
        "model": "Raw payload is 80×86400×1.5 KB = 10.368 GB/day using decimal units. Add indexes, metadata, replication, compression and retention assumptions. Model peak versus average rate and validate with representative data measurements. State uncertainty and headroom rather than treating raw size as allocated disk.",
        "criteria": [
          {
            "label": "units calculation",
            "terms": [
              "10.368",
              "10368000"
            ]
          },
          {
            "label": "overhead",
            "terms": [
              "index",
              "metadata"
            ]
          },
          {
            "label": "workload retention",
            "terms": [
              "retention",
              "peak"
            ]
          },
          {
            "label": "measurement",
            "terms": [
              "measure"
            ]
          }
        ],
        "pitfall": "KB/KiB وتكرار copies ممكن يغيّروا النتيجة؛ لازم الوحدات تكون صريحة.",
        "deliverable": "اكتب estimate sheet صغيرة فيها assumptions وrange وvalidation experiment.",
        "conceptIds": [
          "correctness",
          "math-reasoning"
        ]
      },
      {
        "title": "Probability versus guarantee",
        "question": "A teammate says random IDs make duplicate handling unnecessary because collisions are unlikely. Evaluate the claim.",
        "lesson": "احتمال منخفض مش invariant مضمونة. الأهمية مرتبطة بالأثر ونوع generators والـscope وسياسة conflict، مش رقم probability لوحده.",
        "model": "Evaluate collision probability under generation and volume assumptions, including implementation faults and retries. Keep a matching uniqueness constraint or collision handling when identity correctness matters. Distinguish accidental identifier collision from duplicate business requests; probabilistic rarity does not eliminate idempotency requirements.",
        "criteria": [
          {
            "label": "assumptions",
            "terms": [
              "probability",
              "volume"
            ]
          },
          {
            "label": "constraint",
            "terms": [
              "unique",
              "constraint"
            ]
          },
          {
            "label": "business duplicate",
            "terms": [
              "idempot",
              "duplicate"
            ]
          },
          {
            "label": "failure impact",
            "terms": [
              "fault",
              "impact"
            ]
          }
        ],
        "pitfall": "نفس request ممكن تتكرر بنفس أو ID مختلف؛ randomness مش webhook deduplication strategy.",
        "deliverable": "اكتب failure model يفرق ID collision وduplicate request وreplayed event.",
        "conceptIds": [
          "correctness",
          "math-reasoning"
        ]
      },
      {
        "title": "Correctness before optimization",
        "question": "An O(n) algorithm fails on negative inputs while an O(n²) reference works. How do you diagnose and improve safely?",
        "lesson": "الـoptimized solution غالبًا مبنية على assumption مش في contract. احتفظ بreference صحيحة للمقارنة واختبر properties قبل benchmark.",
        "model": "Inspect the invalid assumption and define the input contract. Differential-test against the simple reference on bounded generated cases, include negative/edge inputs and identify the broken invariant. Repair or replace the algorithm, prove its reasoning, then measure complexity and practical resource use.",
        "criteria": [
          {
            "label": "assumption",
            "terms": [
              "assumption",
              "contract"
            ]
          },
          {
            "label": "reference test",
            "terms": [
              "differential",
              "reference"
            ]
          },
          {
            "label": "invariant",
            "terms": [
              "invariant"
            ]
          },
          {
            "label": "optimize after",
            "terms": [
              "measure",
              "prove"
            ]
          }
        ],
        "pitfall": "سرعة الحل الغلط مش improvement، وrandom tests وحدها مش proof عام.",
        "deliverable": "قدّم counterexample وinvariant مصححة وخطة differential tests.",
        "conceptIds": [
          "correctness",
          "math-reasoning"
        ]
      }
    ]
  },
  {
    "title": "Operating Systems & Concurrency",
    "ar": "اعرف الكود بيتنفّذ إزاي",
    "desc": "Processes، Threads، Memory، Async I/O وSynchronization",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Worker count and saturation",
        "question": "A service has 8 cores and 100 workers. Throughput falls after increasing from 20 workers. What would you investigate?",
        "lesson": "عدد workers الأعلى ممكن يزود scheduling وmemory وconnections وlock contention بدل capacity مفيدة.",
        "model": "Classify CPU versus I/O work and measure CPU runnable tasks, memory, database connections, lock waits and downstream limits. Reduce or bound concurrency, profile the saturated resource and load-test alternatives. More workers do not imply more useful parallelism and can amplify contention.",
        "criteria": [
          {
            "label": "CPU IO",
            "terms": [
              "cpu",
              "i",
              "o",
              "io-bound"
            ]
          },
          {
            "label": "resource metrics",
            "terms": [
              "memory",
              "connection"
            ]
          },
          {
            "label": "bounded concurrency",
            "terms": [
              "bound",
              "concurrency"
            ]
          },
          {
            "label": "measure test",
            "terms": [
              "profile",
              "test"
            ]
          }
        ],
        "pitfall": "متستنتجش من CPU منخفضة إن النظام عنده capacity؛ ممكن workers مستنية lock أو provider.",
        "deliverable": "اكتب 5 metrics وفرضيتين وتجربة تفرق بينهم.",
        "conceptIds": [
          "os-processes",
          "memory-io",
          "async-synchronization"
        ]
      },
      {
        "title": "Containers, VMs and resource limits",
        "question": "Compare processes inside a container with a virtual machine. Why can a containerized worker be killed despite free host RAM, and where should durable state live?",
        "lesson": "Container isolation مش VM كاملة، والـCPU/memory/file limits ممكن تحكم process قبل host capacity. افصل ephemeral runtime state عن persistent data.",
        "model": "Containers commonly share the host kernel while isolating processes; VMs run a guest kernel. Inspect cgroup/runtime memory limits and actual process usage for OOM termination. Bound concurrency and payloads, minimize privileges and keep durable state in deliberate volumes or external stores. Test restart and resource-pressure behavior.",
        "criteria": [
          {
            "label": "container vs VM",
            "terms": [
              "kernel",
              "vm"
            ]
          },
          {
            "label": "resource limits",
            "terms": [
              "cgroup",
              "limit",
              "oom"
            ]
          },
          {
            "label": "persistent state",
            "terms": [
              "volume",
              "durable",
              "external"
            ]
          },
          {
            "label": "bounded safe runtime",
            "terms": [
              "privilege",
              "bound",
              "test"
            ]
          }
        ],
        "pitfall": "تشغيل process جوه container مش ضمان أمان كامل، ووجود file داخل writable layer مش durability policy.",
        "deliverable": "اكتب runtime diagram وresource/privilege/storage policy، وtest آمنة لـrestart وmemory pressure في بيئة تجريبية.",
        "conceptIds": [
          "os-processes",
          "memory-io",
          "async-synchronization"
        ]
      },
      {
        "title": "CPU-bound versus asynchronous work",
        "question": "Should an expensive image transformation become faster merely by making the API async? Explain the system-level change.",
        "lesson": "Async بتغيّر وقت الانتظار والتنسيق، مش كمية CPU work نفسها. Queue تحسن response experience لو فيه pending contract ومتابعة.",
        "model": "Async I/O hides waiting; CPU transformation still needs compute. A queue can return a pending resource quickly, process work with bounded workers and expose status/results. Measure CPU/memory, set quotas and cancellation semantics, and scale compute only with evidence; do not label enqueue latency as job completion latency.",
        "criteria": [
          {
            "label": "async distinction",
            "terms": [
              "cpu",
              "async"
            ]
          },
          {
            "label": "pending workflow",
            "terms": [
              "pending",
              "queue"
            ]
          },
          {
            "label": "bounds",
            "terms": [
              "quota",
              "bound"
            ]
          },
          {
            "label": "end-to-end metrics",
            "terms": [
              "completion",
              "measure"
            ]
          }
        ],
        "pitfall": "سرعة response اللي بتقول accepted مش دليل إن الشغل النهائي أسرع.",
        "deliverable": "صمّم accepted/status/result contract مع failure وresource limits.",
        "conceptIds": [
          "os-processes",
          "memory-io",
          "async-synchronization"
        ]
      },
      {
        "title": "Memory pressure during import",
        "question": "An importer streams input but memory still grows until the process is killed. What can invalidate the streaming assumption?",
        "lesson": "Lazy input مش كفاية لو consumer بيخزن results أو errors أو ORM graph كلها. OOM ممكن يمنع cleanup العادي.",
        "model": "Inspect retained arrays, error buffers, ORM identity/relationship state, caches and large batches. Measure peak RSS per batch, bound retained state and persist checkpoints. Release unnecessary references and test long runs and restart recovery. Streaming at the producer does not guarantee bounded consumer memory.",
        "criteria": [
          {
            "label": "retained state",
            "terms": [
              "retain",
              "buffer"
            ]
          },
          {
            "label": "measure memory",
            "terms": [
              "rss",
              "memory"
            ]
          },
          {
            "label": "bounded batch",
            "terms": [
              "batch",
              "bound"
            ]
          },
          {
            "label": "restart",
            "terms": [
              "checkpoint",
              "restart"
            ]
          }
        ],
        "pitfall": "رفع memory_limit ممكن يأجل الفشل من غير علاج leak أو unbounded retention.",
        "deliverable": "قدّم memory hypothesis وbatch/checkpoint policy وlong-run verification.",
        "conceptIds": [
          "os-processes",
          "memory-io",
          "async-synchronization"
        ]
      },
      {
        "title": "Semaphore, mutex and cancellation",
        "question": "You call a provider for 500 items. Explain a concurrency cap, mutual exclusion and what cancellation cannot undo.",
        "lesson": "Semaphore بتحد in-flight work، mutex بتحمي critical section، ومش كل واحدة منهم موزعة بين servers. Cancellation مش عكس external side effect.",
        "model": "Use a bounded concurrency mechanism for provider calls, a mutex only for appropriate shared local critical state, and a shared coordinator when multiple processes must coordinate. Apply a deadline and explicit partial-failure policy. Cancellation stops or abandons local work but cannot guarantee reversal of a request already processed remotely.",
        "criteria": [
          {
            "label": "cap vs mutex",
            "terms": [
              "semaphore",
              "mutex"
            ]
          },
          {
            "label": "scope",
            "terms": [
              "process",
              "shared"
            ]
          },
          {
            "label": "deadline failure",
            "terms": [
              "deadline",
              "failure"
            ]
          },
          {
            "label": "unknown effects",
            "terms": [
              "remote",
              "undo"
            ]
          }
        ],
        "pitfall": "Lock طويل حوالين network call ممكن يحوّل انتظار provider لتوقف باقي النظام.",
        "deliverable": "اكتب concurrency/failure policy وحدد إيه اللي يتعمل reconcile بعد cancellation.",
        "conceptIds": [
          "os-processes",
          "memory-io",
          "async-synchronization"
        ]
      }
    ]
  },
  {
    "title": "Networking & Protocol Reasoning",
    "ar": "افهم النقل والـboundaries",
    "desc": "TCP، TLS، DNS، Proxies وFailure semantics",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Reliable transport is not exactly-once",
        "question": "TCP delivered a request, then the response connection broke after the server committed. What should a client do?",
        "lesson": "الـtransport reliable جوه connection، لكن client لسه ممكن يجهل outcome. business retry محتاجة identity ومتابعة status.",
        "model": "Treat the business outcome as unknown. Retry only with a supported idempotency strategy or query operation status, retain request identity and reconcile. TCP ordering/reliability does not create exactly-once application effects. Set deadlines and distinguish transport failure from a confirmed business rejection.",
        "criteria": [
          {
            "label": "unknown outcome",
            "terms": [
              "unknown"
            ]
          },
          {
            "label": "request identity",
            "terms": [
              "idempot",
              "identity"
            ]
          },
          {
            "label": "reconciliation",
            "terms": [
              "reconcil",
              "status"
            ]
          },
          {
            "label": "transport scope",
            "terms": [
              "tcp",
              "transport"
            ]
          }
        ],
        "pitfall": "إعادة POST بمفتاح جديد بعد connection reset ممكن تكرر الـeffect.",
        "deliverable": "ارسم failure timeline وحدد نقطة الفشل اللي client ما يقدرش يحسمها.",
        "conceptIds": [
          "network-transport",
          "dns-routing"
        ]
      },
      {
        "title": "DNS cutover and old connections",
        "question": "After a DNS cutover, some clients still reach the old server. Why and how do you plan migration?",
        "lesson": "DNS caches وconnection reuse وresolver behavior بتخلي cutover مش لحظي. لازم compatibility/draining plan بدل إطفاء القديم فورًا.",
        "model": "Account for cached records, resolver behavior and long-lived connections. Plan overlap, compatible state and connection draining, validate health on both destinations and monitor traffic during transition. Lowering TTL ahead can help some caches but is not an immediate universal invalidation mechanism.",
        "criteria": [
          {
            "label": "DNS cache",
            "terms": [
              "cache",
              "ttl"
            ]
          },
          {
            "label": "connection reuse",
            "terms": [
              "connection"
            ]
          },
          {
            "label": "overlap draining",
            "terms": [
              "drain",
              "overlap"
            ]
          },
          {
            "label": "monitor",
            "terms": [
              "monitor"
            ]
          }
        ],
        "pitfall": "TTL قيمة policy مش أمر لكل client ينسى old destination فورًا.",
        "deliverable": "اكتب cutover checklist وfallback وخطة التعامل مع clients القديمة.",
        "conceptIds": [
          "network-transport",
          "dns-routing"
        ]
      },
      {
        "title": "Forwarded headers trust",
        "question": "A client changes X-Forwarded-For to evade rate limits. What is wrong with the trust boundary?",
        "lesson": "Original IP metadata موثوقة بس لو جاية من proxy متحقق منها. قبول أي forwarded headers بيفوض client يحدد identity للشبكة.",
        "model": "Trust forwarding headers only from configured known proxies and define sanitization at the edge. Use the verified client address/scheme, account for proxy chains and test spoofed headers. Combine source limits with actor/account limits where appropriate; CORS and TLS do not fix this trust mistake.",
        "criteria": [
          {
            "label": "trusted proxies",
            "terms": [
              "trusted",
              "proxy"
            ]
          },
          {
            "label": "edge sanitization",
            "terms": [
              "sanitiz",
              "edge"
            ]
          },
          {
            "label": "test spoof",
            "terms": [
              "test",
              "spoof"
            ]
          },
          {
            "label": "layered limiting",
            "terms": [
              "account",
              "actor"
            ]
          }
        ],
        "pitfall": "متضبطش trust-all من غير فهم architecture والـingress paths المتاحة.",
        "deliverable": "اكتب diagram للـtrusted hops واختبار forged header.",
        "conceptIds": [
          "network-transport",
          "dns-routing"
        ]
      },
      {
        "title": "TLS verification and credentials",
        "question": "An integration works only when certificate verification is disabled. How do you diagnose it safely?",
        "lesson": "تعطيل verification بيزيل ضمان peer identity؛ اصلح chain/hostname/time/trust configuration بدل تحويل الفشل لconnection غير موثوقة.",
        "model": "Inspect hostname, certificate chain, validity period, system time and trust store in the actual runtime. Fix the provider or trusted CA configuration through approved means, keep verification enabled and protect credentials. Test from the deployment environment and distinguish TLS setup failures from HTTP/application failures.",
        "criteria": [
          {
            "label": "certificate checks",
            "terms": [
              "certificate",
              "hostname"
            ]
          },
          {
            "label": "trust time",
            "terms": [
              "trust",
              "time"
            ]
          },
          {
            "label": "keep verification",
            "terms": [
              "verification",
              "enabled"
            ]
          },
          {
            "label": "runtime diagnosis",
            "terms": [
              "runtime",
              "environment"
            ]
          }
        ],
        "pitfall": "نجاح request مع verify=false مش إثبات إنك كلمت provider المقصودة بأمان.",
        "deliverable": "اكتب diagnostic checklist من غير تجاوز TLS verification.",
        "conceptIds": [
          "network-transport",
          "dns-routing"
        ]
      },
      {
        "title": "Message framing and protocol contracts",
        "question": "Why can a TCP read return only part of your application message or multiple messages together?",
        "lesson": "TCP byte stream من غير application message boundaries. protocol محتاجة framing وlimits وpartial-read handling بدل افتراض كل read = message.",
        "model": "Define framing using a validated length prefix or delimiter/format, buffer bounded partial data and parse multiple complete messages per read. Handle EOF, malformed lengths and timeouts, protect against oversized input and test fragmented/coalesced reads. TCP byte order does not preserve write-call boundaries as messages.",
        "criteria": [
          {
            "label": "byte stream",
            "terms": [
              "stream"
            ]
          },
          {
            "label": "framing",
            "terms": [
              "prefix",
              "delimiter",
              "framing"
            ]
          },
          {
            "label": "bounded parsing",
            "terms": [
              "bound",
              "length"
            ]
          },
          {
            "label": "fragment tests",
            "terms": [
              "test",
              "fragment"
            ]
          }
        ],
        "pitfall": "Allocating memory based on untrusted length قبل bounds check ممكن يعمل resource exhaustion.",
        "deliverable": "اكتب parser state machine و3 tests للـpartial/combined/malformed messages.",
        "conceptIds": [
          "network-transport",
          "dns-routing"
        ]
      }
    ]
  },
  {
    "title": "Data Modeling & Database Internals",
    "ar": "فكّر في الداتا قبل الـORM",
    "desc": "Relational theory، Storage، MVCC وRecovery",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Functional dependencies and anomalies",
        "question": "A products table repeats supplier address in every row. What anomalies can occur and how would you redesign it?",
        "lesson": "Normalization بتعالج dependencies ومعنى facts، مش مجرد تقليل bytes. فصل current supplier data يختلف عن historical snapshots المطلوبة.",
        "model": "Identify the product and supplier keys and functional dependencies. Separate supplier facts to avoid inconsistent updates, insertion constraints and deletion anomalies. Preserve intentional historical snapshots where required, enforce foreign keys and evaluate query trade-offs. Explain ownership and update policy before denormalizing for measured performance.",
        "criteria": [
          {
            "label": "dependencies",
            "terms": [
              "dependen",
              "key"
            ]
          },
          {
            "label": "anomalies",
            "terms": [
              "anomal",
              "update"
            ]
          },
          {
            "label": "normalized design",
            "terms": [
              "supplier",
              "foreign"
            ]
          },
          {
            "label": "snapshot tradeoff",
            "terms": [
              "snapshot",
              "denormal"
            ]
          }
        ],
        "pitfall": "نقل data لجدول منفصل من غير قواعد ownership أو history ممكن يغيّر معنى التقارير القديمة.",
        "deliverable": "ارسم before/after schema واكتب update وdelete anomaly بأمثلة.",
        "conceptIds": [
          "relational-model",
          "storage-indexes",
          "mvcc-recovery"
        ]
      },
      {
        "title": "Choose an index from a workload",
        "question": "A query filters organization and state, sorts by time and reads only a few columns. Explain how you evaluate an index without assuming it will help.",
        "lesson": "الـplan والـstats والـskew والـwrite cost هم اللي يحسموا، مش قاعدة index كل filter column.",
        "model": "Use representative data and EXPLAIN with actual runtime information where safe. Evaluate composite key order, equality/range predicates, selectivity, sorting and covering trade-offs. Compare rows scanned, I/O and latency plus insert/update cost, and test skewed tenants and changing statistics before keeping the index.",
        "criteria": [
          {
            "label": "plan",
            "terms": [
              "explain",
              "plan"
            ]
          },
          {
            "label": "composite tradeoff",
            "terms": [
              "composite",
              "order"
            ]
          },
          {
            "label": "read write cost",
            "terms": [
              "write",
              "io"
            ]
          },
          {
            "label": "representative data",
            "terms": [
              "skew",
              "representative"
            ]
          }
        ],
        "pitfall": "Warm-cache benchmark صغير ممكن يخفي I/O أو sort costs في production.",
        "deliverable": "قدّم candidate index وقياسات قبل/بعد وحدود الاستنتاج.",
        "conceptIds": [
          "relational-model",
          "storage-indexes",
          "mvcc-recovery"
        ]
      },
      {
        "title": "Snapshot visibility and long transactions",
        "question": "A long report transaction keeps seeing old values while new writes commit. Is this necessarily a bug and what costs may appear?",
        "lesson": "Snapshot behavior ممكن يكون isolation semantics مقصودة؛ long transactions بتأثر على cleanup والـlocks والـversion retention حسب engine.",
        "model": "Inspect database engine, isolation level and query type before judging correctness. Snapshot reads may legitimately see an older committed view; locking reads can differ. Measure version cleanup/storage pressure and locks from long transactions, choose the needed consistency and test on the production engine.",
        "criteria": [
          {
            "label": "isolation semantics",
            "terms": [
              "isolation",
              "snapshot"
            ]
          },
          {
            "label": "read type",
            "terms": [
              "locking",
              "query"
            ]
          },
          {
            "label": "cleanup cost",
            "terms": [
              "cleanup",
              "version"
            ]
          },
          {
            "label": "engine test",
            "terms": [
              "engine",
              "test"
            ]
          }
        ],
        "pitfall": "متفترضش إن كل SELECT جوه transaction في كل engine ليها نفس visibility أو lock behavior.",
        "deliverable": "اكتب experiment باتصالين وتوقعات تحت isolation المختارة.",
        "conceptIds": [
          "relational-model",
          "storage-indexes",
          "mvcc-recovery"
        ]
      },
      {
        "title": "Crash recovery and durability",
        "question": "A database acknowledges commit, then the primary machine fails. Which guarantees must you verify before claiming zero data loss?",
        "lesson": "Local WAL durability وreplication acknowledgments وfailover policy ضمانات مختلفة؛ كلمة ACID وحدها مش جواب كافي.",
        "model": "Verify log flushing/durability settings, storage assumptions, replication acknowledgment and failover behavior. Define acceptable RPO and RTO, test restore and controlled failover, and confirm what a successful commit acknowledgment covers. A lagging asynchronous replica may not contain every acknowledged primary write.",
        "criteria": [
          {
            "label": "durability settings",
            "terms": [
              "wal",
              "flush"
            ]
          },
          {
            "label": "replication policy",
            "terms": [
              "replica",
              "ack"
            ]
          },
          {
            "label": "RPO RTO",
            "terms": [
              "rpo",
              "rto"
            ]
          },
          {
            "label": "recovery test",
            "terms": [
              "test",
              "restore"
            ]
          }
        ],
        "pitfall": "Replica ممكن تنقل accidental deletes؛ لازم independent backup/restore strategy.",
        "deliverable": "صمّم recovery drill وevidence تثبت data loss/recovery window.",
        "conceptIds": [
          "relational-model",
          "storage-indexes",
          "mvcc-recovery"
        ]
      },
      {
        "title": "SQL NULL and join cardinality",
        "question": "A report uses LEFT JOIN plus a WHERE on the right table and produces wrong totals. How do you reason about both NULL and row multiplication?",
        "lesson": "SQL logic مع NULL وjoin cardinalities ممكن يغيّروا rows والـaggregates؛ لازم تحدد intended grain وتختبر unmatched/multiple matches.",
        "model": "Check three-valued NULL predicates and whether WHERE rejects unmatched rows. Define the result grain and inspect one-to-many fan-out before aggregating. Move intended match filters to ON when appropriate and pre-aggregate independent children. Test unmatched, null-valued and multiple-child fixtures; DISTINCT is not a general correction.",
        "criteria": [
          {
            "label": "NULL predicate",
            "terms": [
              "null",
              "where"
            ]
          },
          {
            "label": "grain cardinality",
            "terms": [
              "grain",
              "cardinal"
            ]
          },
          {
            "label": "preaggregate",
            "terms": [
              "aggregate",
              "subquery"
            ]
          },
          {
            "label": "fixture cases",
            "terms": [
              "test",
              "unmatched"
            ]
          }
        ],
        "pitfall": "SUM(DISTINCT amount) ممكن يمسح transactions صحيحة قيمتها متساوية.",
        "deliverable": "اعمل fixture صغيرة توضح bug واكتب expected totals مستقلة عن query.",
        "conceptIds": [
          "relational-model",
          "storage-indexes",
          "mvcc-recovery"
        ]
      }
    ]
  },
  {
    "title": "Architecture & Domain Boundaries",
    "ar": "صمّم حدود تخلي التغيير مفهوم",
    "desc": "Cohesion، Coupling، Domain language وConsistency boundaries",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "A services folder is not architecture",
        "question": "A monolith has fifty services that all edit each other’s tables. What boundaries would you establish first?",
        "lesson": "Architecture معناها ownership واتجاه dependencies وinvariants، مش مجرد نقل classes لفولدرات جديدة.",
        "model": "Map business capabilities, data ownership and critical invariants. Define explicit application contracts and restrict cross-module writes, keep cohesive rules together and remove dependency cycles incrementally. Start with a modular monolith and integration tests; extract services only when ownership/scaling/deployment evidence justifies distribution.",
        "criteria": [
          {
            "label": "capability ownership",
            "terms": [
              "ownership",
              "capabil"
            ]
          },
          {
            "label": "explicit boundary",
            "terms": [
              "contract",
              "boundar"
            ]
          },
          {
            "label": "invariants tests",
            "terms": [
              "invariant",
              "test"
            ]
          },
          {
            "label": "incremental choice",
            "terms": [
              "increment",
              "modular"
            ]
          }
        ],
        "pitfall": "Microservices مع shared writes عشوائية ممكن تزود network failures من غير تحسين boundaries.",
        "deliverable": "ارسم 4 modules مع owns/reads/contracts واذكر invariant لكل واحدة.",
        "conceptIds": [
          "coupling-cohesion",
          "domain-modeling"
        ]
      },
      {
        "title": "Entity versus value object",
        "question": "An address can be a mutable customer profile field or an immutable invoice snapshot. How do identity and lifecycle change the design?",
        "lesson": "نفس fields ممكن يمثلوا roles مختلفة: current entity state أو historical value. اختار على معنى المجال، مش شكل JSON بس.",
        "model": "Distinguish customer identity and current address lifecycle from the accepted invoice address value. Validate value invariants, snapshot historical facts and make correction policy explicit. Keep ownership and serialization clear, and test that later profile edits do not change prior invoices. Avoid deriving immutable history from mutable joins.",
        "criteria": [
          {
            "label": "identity lifecycle",
            "terms": [
              "identity",
              "lifecycle"
            ]
          },
          {
            "label": "snapshot",
            "terms": [
              "snapshot"
            ]
          },
          {
            "label": "invariant ownership",
            "terms": [
              "invariant",
              "owner"
            ]
          },
          {
            "label": "history test",
            "terms": [
              "test",
              "history"
            ]
          }
        ],
        "pitfall": "إعادة استخدام نفس mutable object في الدورين ممكن تعيد كتابة تاريخ الفاتورة من غير قصد.",
        "deliverable": "اكتب model/DTO/value responsibilities و3 tests لتغيّر العنوان.",
        "conceptIds": [
          "coupling-cohesion",
          "domain-modeling"
        ]
      },
      {
        "title": "Aggregate boundary under contention",
        "question": "All orders and inventory are placed in one giant aggregate to guarantee consistency. What trade-offs and alternatives do you evaluate?",
        "lesson": "Aggregate boundary بتحمي invariants محددة، لكن تجميع النظام كله ممكن يعمل lock contention وtransactions ضخمة.",
        "model": "Identify the exact invariant and minimum atomic state needed, measure contention and split independent consistency boundaries. Use conditional reservations or short locking transactions where appropriate, with explicit cross-boundary workflow and compensation. Do not sacrifice required correctness for throughput or create one global serialization point unnecessarily.",
        "criteria": [
          {
            "label": "exact invariant",
            "terms": [
              "invariant"
            ]
          },
          {
            "label": "minimum boundary",
            "terms": [
              "boundary",
              "atomic"
            ]
          },
          {
            "label": "contention",
            "terms": [
              "contention",
              "lock"
            ]
          },
          {
            "label": "workflow tradeoff",
            "terms": [
              "compensat",
              "workflow"
            ]
          }
        ],
        "pitfall": "تقسيم aggregate زيادة ممكن يفقد invariant، وتجميعها زيادة ممكن يخنق throughput؛ القرار له قياس.",
        "deliverable": "قدّم بديلين مع invariant وطريقة الحفاظ عليها وcost لكل بديل.",
        "conceptIds": [
          "coupling-cohesion",
          "domain-modeling"
        ]
      },
      {
        "title": "DRY versus wrong abstraction",
        "question": "Two tax rules look similar but change for different regulatory reasons. Should they be merged into one configurable function?",
        "lesson": "DRY تخص تكرار knowledge موحدة، مش أي تشابه شكلي. Wrong abstraction بتربط rules مستقلة وتزود conditionals متشابكة.",
        "model": "Compare domain meaning and reasons to change before merging. Share stable primitives if useful while keeping independently governed rules separate, name them explicitly and test each policy. Refactor once a coherent abstraction emerges; avoid a boolean-flag matrix that couples unrelated lifecycles.",
        "criteria": [
          {
            "label": "domain meaning",
            "terms": [
              "meaning",
              "domain"
            ]
          },
          {
            "label": "change reasons",
            "terms": [
              "change",
              "lifecycle"
            ]
          },
          {
            "label": "small shared primitive",
            "terms": [
              "primitive",
              "stable"
            ]
          },
          {
            "label": "tests tradeoff",
            "terms": [
              "test",
              "flag"
            ]
          }
        ],
        "pitfall": "تكرار بسيط مؤقت ممكن يكون أوضح وأقل coupling من generic engine قبل فهم variation.",
        "deliverable": "اعمل decision note توضح ما يتشارك وما يفضل منفصل وليه.",
        "conceptIds": [
          "coupling-cohesion",
          "domain-modeling"
        ]
      },
      {
        "title": "Architecture decision with evidence",
        "question": "Choose between a modular monolith and extracting a reporting service for a small team. What evidence belongs in the decision?",
        "lesson": "مفيش architecture اختيارها صحيح في المطلق. وثّق constraints والبدائل وoperational consequences وrevisit trigger.",
        "model": "Document workload, team ownership, deployment needs and data consistency constraints. Compare operational complexity and isolation benefits, propose a reversible step and measure bottlenecks. Record an ADR with consequences and revisit triggers, and define service/data contracts before extraction instead of choosing by popularity.",
        "criteria": [
          {
            "label": "context constraints",
            "terms": [
              "constraint",
              "team"
            ]
          },
          {
            "label": "tradeoffs",
            "terms": [
              "complex",
              "cost"
            ]
          },
          {
            "label": "reversible evidence",
            "terms": [
              "measure",
              "revers"
            ]
          },
          {
            "label": "ADR revisit",
            "terms": [
              "adr",
              "revisit"
            ]
          }
        ],
        "pitfall": "حجة قابل للتوسع من غير workload أو bottleneck أو ownership evidence عامة جدًا.",
        "deliverable": "اكتب ADR صفحة واحدة وثلاثة measurable revisit triggers.",
        "conceptIds": [
          "coupling-cohesion",
          "domain-modeling"
        ]
      }
    ]
  },
  {
    "title": "Distributed Systems & Messaging",
    "ar": "صمّم مع الفشل والتأخير والتكرار",
    "desc": "Delivery semantics، Consistency، Ordering وSagas",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Consumer crash before acknowledgment",
        "question": "A consumer completes an external side effect then crashes before ACK. What guarantees remain and how do you recover?",
        "lesson": "الـbroker ممكن تعيد الرسالة، والمستهلك لازم يتحمل duplicate processing بدل افتراض إن ACK timing يحل كل شيء.",
        "model": "Expect redelivery and deduplicate with durable operation identity and atomic local state. Use provider idempotency or reconciliation for external effects, and record pending/final outcomes. Define retry and quarantine policy and test the crash window; broker delivery guarantees alone do not ensure exactly-once external execution.",
        "criteria": [
          {
            "label": "redelivery",
            "terms": [
              "redeliv",
              "duplicate"
            ]
          },
          {
            "label": "durable identity",
            "terms": [
              "durable",
              "idempot"
            ]
          },
          {
            "label": "reconcile external",
            "terms": [
              "reconcil",
              "provider"
            ]
          },
          {
            "label": "crash tests",
            "terms": [
              "test",
              "crash"
            ]
          }
        ],
        "pitfall": "علامة processed قبل external call ممكن تمنع retry لعملية لم تحدث؛ وبعدها قد تسمح duplication.",
        "deliverable": "ارسم crash windows وبيّن state التي تسمح بالاستكمال الآمن.",
        "conceptIds": [
          "message-semantics",
          "consistency-models",
          "sagas"
        ]
      },
      {
        "title": "Read-your-writes across replicas",
        "question": "A user creates an order then reads from a replica and sees nothing. What consistency contract should the system expose?",
        "lesson": "Replica lag ممكن يكون متوقع؛ حدد read-after-write للسياق ده بدل إرجاع not found مضللة أو الادعاء strong consistency للجميع.",
        "model": "Define required read-after-write behavior and route critical reads to a sufficiently up-to-date authoritative path, or use an explicit consistency token/session policy supported by the system. Monitor lag and test subsequent requests and failover. Document tolerated staleness elsewhere; same-request stickiness is not a universal guarantee.",
        "criteria": [
          {
            "label": "read after write",
            "terms": [
              "read-after-write",
              "consistency"
            ]
          },
          {
            "label": "authoritative route",
            "terms": [
              "primary",
              "authoritative"
            ]
          },
          {
            "label": "lag monitoring",
            "terms": [
              "lag",
              "monitor"
            ]
          },
          {
            "label": "cross request tests",
            "terms": [
              "test",
              "request"
            ]
          }
        ],
        "pitfall": "Sticky reads جوه request واحدة مش promise لكل requests أو devices التالية.",
        "deliverable": "اكتب consistency policy للكتالوج وصفحة order الجديدة والتقارير.",
        "conceptIds": [
          "message-semantics",
          "consistency-models",
          "sagas"
        ]
      },
      {
        "title": "Ordering and entity partition keys",
        "question": "Events for one order must be applied in sequence while unrelated orders can run concurrently. How do you design keys and validation?",
        "lesson": "Global ordering مكلفة ومش مطلوبة غالبًا؛ per-entity ordering محتاجة key وsequence/version checks حتى مع retries وreplays.",
        "model": "Partition by a stable order/aggregate key where the broker supports scoped ordering. Carry event identity and version/sequence, validate allowed state transitions atomically and handle duplicates/gaps explicitly. Define replay and hot-key behavior; dequeue order does not guarantee completion order with arbitrary parallel workers.",
        "criteria": [
          {
            "label": "partition key",
            "terms": [
              "partition",
              "order"
            ]
          },
          {
            "label": "version identity",
            "terms": [
              "version",
              "sequence"
            ]
          },
          {
            "label": "atomic transition",
            "terms": [
              "atomic"
            ]
          },
          {
            "label": "gaps replay",
            "terms": [
              "gap",
              "replay"
            ]
          }
        ],
        "pitfall": "Timestamp arrival عند consumer مش دليل ترتيب حدوث الأحداث في المصدر.",
        "deliverable": "حدّد message envelope وقواعد duplicate/out-of-order/missing event.",
        "conceptIds": [
          "message-semantics",
          "consistency-models",
          "sagas"
        ]
      },
      {
        "title": "Saga compensation failure",
        "question": "Payment capture succeeds, inventory confirmation fails, and the refund request times out. What state and actions should you persist?",
        "lesson": "تعويض فاشل أو unknown outcome مش معناه workflow انتهت. خزن حالة قابلة للمتابعة وretry/reconciliation آمنين.",
        "model": "Persist workflow/step identities and payment, inventory and compensation outcomes separately. Treat refund timeout as unknown, reconcile with the same idempotency identity and retry only safe transient failures. Escalate aged unresolved states, retain an audit trail and test duplicated compensation as well as irreversible actions.",
        "criteria": [
          {
            "label": "durable step state",
            "terms": [
              "state",
              "step"
            ]
          },
          {
            "label": "unknown refund",
            "terms": [
              "unknown",
              "reconcil"
            ]
          },
          {
            "label": "idempotent compensation",
            "terms": [
              "idempot"
            ]
          },
          {
            "label": "monitor escalation",
            "terms": [
              "alert",
              "escalat"
            ]
          }
        ],
        "pitfall": "إطلاق refund جديدة بكل retry ممكن يعوض العميل أكتر من مرة.",
        "deliverable": "اكتب transition table للـworkflow ومعايير متى تدخل manual review.",
        "conceptIds": [
          "message-semantics",
          "consistency-models",
          "sagas"
        ]
      },
      {
        "title": "Network partition and availability",
        "question": "During a partition, should every endpoint remain writable? Compare a catalog preference update with a financial invariant.",
        "lesson": "CAP مش slogan اختيار اتنين؛ لازم تحدد real-time ordering المطلوب وسلوك كل operation تحت partition حسب أثر التعارض.",
        "model": "State the consistency guarantee and partition model per operation. A preference may accept conflict-resolved eventual updates, while a financial invariant may reject or defer writes without sufficient coordination. Explain availability loss, conflict resolution and recovery behavior, and test user-visible outcomes rather than assigning one label to the entire application.",
        "criteria": [
          {
            "label": "specific guarantee",
            "terms": [
              "lineariz",
              "consistency"
            ]
          },
          {
            "label": "operation tradeoff",
            "terms": [
              "financial",
              "preference"
            ]
          },
          {
            "label": "conflict recovery",
            "terms": [
              "conflict",
              "recover"
            ]
          },
          {
            "label": "user tests",
            "terms": [
              "test",
              "user"
            ]
          }
        ],
        "pitfall": "Eventual consistency محتاجة convergence policy، مش وعد إن التعارضات هتختفي من نفسها.",
        "deliverable": "اكتب جدول operation/guarantee/partition behavior/recovery.",
        "conceptIds": [
          "message-semantics",
          "consistency-models",
          "sagas"
        ]
      }
    ]
  },
  {
    "title": "Reliability & Capacity Engineering",
    "ar": "قِس تجربة المستخدم وخطّط للفشل",
    "desc": "SLIs، SLOs، Error budgets، Queueing وResilience",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Define a useful SLO",
        "question": "Define a request-based SLI and SLO for checkout. Explain the difference from an SLA and CPU uptime.",
        "lesson": "Good request لازم تتحدد correctness والـlatency والـeligibility بتاعتها. Availability infrastructure مش دايمًا user success.",
        "model": "Define eligible checkout attempts and a good event including correct outcome and latency policy. Set a justified target over a window, calculate error budget and monitor burn rate. Distinguish internal SLO from external SLA obligations and report exclusions transparently; CPU uptime alone cannot measure checkout success.",
        "criteria": [
          {
            "label": "eligible good",
            "terms": [
              "eligible",
              "good"
            ]
          },
          {
            "label": "target window",
            "terms": [
              "window",
              "target"
            ]
          },
          {
            "label": "budget burn",
            "terms": [
              "budget",
              "burn"
            ]
          },
          {
            "label": "SLA distinction",
            "terms": [
              "sla"
            ]
          }
        ],
        "pitfall": "متستبعدش كل requests الفاشلة من denominator عشان النسبة تتحسن.",
        "deliverable": "اكتب SLI specification وbudget example وalerting signal.",
        "conceptIds": [
          "slo-error-budgets",
          "capacity-planning",
          "resilience"
        ]
      },
      {
        "title": "Little’s Law with assumptions",
        "question": "A stable system completes 120 requests/sec with 250 ms average time inside the measured boundary. Estimate average in-flight requests and state limitations.",
        "lesson": "Little’s Law بتستخدم averages وحدود system متطابقة واستقرار. متستبدلش average time بـp95 ولا تطبقها كforecast لنظام backlog بتنفجر.",
        "model": "L=λW gives about 30 average in-flight requests for the stated stable boundary. Check units, steady-state assumptions and request population consistency. It does not directly give p95 concurrency or capacity during sustained overload; validate with metrics and model queue growth separately when arrivals exceed completions.",
        "criteria": [
          {
            "label": "calculation",
            "terms": [
              "30"
            ]
          },
          {
            "label": "units stability",
            "terms": [
              "stable",
              "second"
            ]
          },
          {
            "label": "average boundary",
            "terms": [
              "average",
              "boundary"
            ]
          },
          {
            "label": "limitations",
            "terms": [
              "overload",
              "p95"
            ]
          }
        ],
        "pitfall": "القانون علاقة متوسطات، مش معادلة لتحديد worker count المثالي مباشرة.",
        "deliverable": "اعمل حساب مع units وتجربة metrics تتأكد من حدود القياس.",
        "conceptIds": [
          "slo-error-budgets",
          "capacity-planning",
          "resilience"
        ]
      },
      {
        "title": "Retry amplification",
        "question": "Three service layers each retry a failing request three times. Why can this make an outage worse?",
        "lesson": "Retries المتداخلة بتضاعف الحمل على dependency المتعطلة. لازم retry ownership وbudget وjitter وidempotency حسب الأثر.",
        "model": "Count attempts across layers and establish an end-to-end retry/deadline budget with clear ownership. Retry only appropriate transient failures, add jitter and backpressure, and protect dependencies with limits or isolation. Ensure writes are safe to retry and monitor amplification; blindly increasing timeouts or retries worsens saturation.",
        "criteria": [
          {
            "label": "amplification",
            "terms": [
              "amplif",
              "attempt"
            ]
          },
          {
            "label": "shared budget",
            "terms": [
              "budget",
              "deadline"
            ]
          },
          {
            "label": "safe retry",
            "terms": [
              "idempot",
              "transient"
            ]
          },
          {
            "label": "jitter limits",
            "terms": [
              "jitter",
              "backpressure"
            ]
          }
        ],
        "pitfall": "ثلاث retries قد تعني 4 attempts في أداة معينة؛ عرّف terminology قبل الحساب.",
        "deliverable": "ارسم attempt tree واقترح budget ومسؤولية retry واضحة.",
        "conceptIds": [
          "slo-error-budgets",
          "capacity-planning",
          "resilience"
        ]
      },
      {
        "title": "Load test beyond the average",
        "question": "A benchmark at average traffic passes, but launch fails under bursts and a hot tenant. How do you redesign the test?",
        "lesson": "Workload shape والـskew والـdataset والـdownstream behavior لازم يتشابهوا مع المتوقع؛ throughput وحدها مش كفاية.",
        "model": "Include burst, sustained, hot-key/tenant and recovery workloads with representative data and dependencies. Measure tail latency, errors, queue age and resource saturation, define stop conditions and headroom, and compare arrival versus completion rates. Test graceful degradation and validate bottleneck hypotheses before changing capacity.",
        "criteria": [
          {
            "label": "real workload",
            "terms": [
              "burst",
              "skew"
            ]
          },
          {
            "label": "tail metrics",
            "terms": [
              "p95",
              "p99",
              "tail"
            ]
          },
          {
            "label": "saturation queue",
            "terms": [
              "queue",
              "saturat"
            ]
          },
          {
            "label": "stop degradation",
            "terms": [
              "stop",
              "degrad"
            ]
          }
        ],
        "pitfall": "Unbounded load test على production من غير scope وlimits ممكن تبقى incident بدل verification.",
        "deliverable": "اكتب load-test plan فيها scenarios وsuccess/stop criteria والـmetrics.",
        "conceptIds": [
          "slo-error-budgets",
          "capacity-planning",
          "resilience"
        ]
      },
      {
        "title": "Graceful degradation and bulkheads",
        "question": "A reports provider is down. How do you keep checkout healthy without returning fabricated report success?",
        "lesson": "Resource isolation وpending/partial contract أحسن من استهلاك كل workers أو عرض نتيجة ناجحة مش حقيقية.",
        "model": "Isolate report resources, cap concurrency and enforce short deadlines with bounded safe retries. Return a documented pending/partial/unavailable outcome or approved stale result, protect checkout capacity and alert on user impact. Plan controlled recovery/replay and test the outage path; fallback must preserve domain truth.",
        "criteria": [
          {
            "label": "isolation",
            "terms": [
              "bulkhead",
              "isola"
            ]
          },
          {
            "label": "bounds",
            "terms": [
              "deadline",
              "concurrency"
            ]
          },
          {
            "label": "truthful fallback",
            "terms": [
              "pending",
              "partial"
            ]
          },
          {
            "label": "recovery tests",
            "terms": [
              "test",
              "replay"
            ]
          }
        ],
        "pitfall": "Stale fallback ممكن تنفع عرض تقارير، لكنها مش آمنة تلقائيًا في authorization أو financial decisions.",
        "deliverable": "صمّم degradation policy وfault-injection test داخل بيئة اختبار.",
        "conceptIds": [
          "slo-error-budgets",
          "capacity-planning",
          "resilience"
        ]
      }
    ]
  },
  {
    "title": "Quality, Testing & Delivery",
    "ar": "حوّل الجودة لدليل قابل للمراجعة",
    "desc": "Property tests، Test doubles، CI/CD وSafe releases",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Properties for a merge algorithm",
        "question": "Design tests for merging sorted lists that do not depend only on a few expected examples.",
        "lesson": "Property tests بتختبر invariants عامة مع inputs مختلفة، وreference oracle لازم تكون مستقلة عن implementation.",
        "model": "Assert sorted output, preserved combined multiset and length, empty-list identity and input-contract handling. Use generated bounded cases with reproducible seeds and a simple independent reference where useful. Include duplicates and negative values; properties complement examples and reasoning but are not a formal proof.",
        "criteria": [
          {
            "label": "sorted property",
            "terms": [
              "sort"
            ]
          },
          {
            "label": "multiset",
            "terms": [
              "multiset",
              "frequency"
            ]
          },
          {
            "label": "generated reproducible",
            "terms": [
              "seed",
              "generat"
            ]
          },
          {
            "label": "limitations",
            "terms": [
              "proof",
              "example"
            ]
          }
        ],
        "pitfall": "Length صحيحة لوحدها ممكن تعدي حل بيكرر element ويضيع التاني.",
        "deliverable": "اكتب 4 properties وcounterexample يكشف ضعف length-only assertion.",
        "conceptIds": [
          "test-design",
          "ci-release"
        ]
      },
      {
        "title": "Test doubles at the right boundary",
        "question": "A payment test mocks CheckoutService::pay to return success. What has it actually verified and how do you improve it?",
        "lesson": "Mock للـsubject نفسه بيتخطى rules اللي المفروض تثبتها. Fake provider عند boundary يسمح باختبار workflow الحقيقي.",
        "model": "Exercise the real checkout action, replace the external gateway boundary and assert business state, request identity and error handling. Add failure, duplicate and authorization cases, and keep separate adapter contract/sandbox checks. Do not mistake mocked return values or dispatch assertions for end-to-end provider correctness.",
        "criteria": [
          {
            "label": "real subject",
            "terms": [
              "real",
              "subject"
            ]
          },
          {
            "label": "external boundary",
            "terms": [
              "gateway",
              "boundary"
            ]
          },
          {
            "label": "state failures",
            "terms": [
              "state",
              "failure"
            ]
          },
          {
            "label": "contract integration",
            "terms": [
              "contract",
              "integration"
            ]
          }
        ],
        "pitfall": "اختبار بيأكد mock رجّعت اللي طلبت منها ترجعه مش دليل صحة الشغل الحقيقي.",
        "deliverable": "ارسم test boundaries وحدد 3 tests لاختبار use case و2 للـadapter.",
        "conceptIds": [
          "test-design",
          "ci-release"
        ]
      },
      {
        "title": "Reproducible release artifact",
        "question": "Why build one immutable artifact and promote it instead of running dependency updates separately on each production node?",
        "lesson": "Artifact identity وlockfiles وprovenance بتقلل drift. Runtime config/secrets تتدار بوضوح من غير إعادة حل dependencies وقت deploy.",
        "model": "Build from a reviewed commit and locked dependency graph, run checks once on the resulting artifact and promote the same identity. Verify platform compatibility, separate secrets/config and record provenance. Use staged rollout and health signals; unreviewed dependency resolution per node can produce inconsistent releases.",
        "criteria": [
          {
            "label": "locked provenance",
            "terms": [
              "lock",
              "commit"
            ]
          },
          {
            "label": "same artifact",
            "terms": [
              "artifact",
              "immutable"
            ]
          },
          {
            "label": "runtime config",
            "terms": [
              "secret",
              "config"
            ]
          },
          {
            "label": "rollout signals",
            "terms": [
              "rollout",
              "health"
            ]
          }
        ],
        "pitfall": "Build ناجح في بيئة مختلفة مش ضمان extensions أو runtime configuration مناسبة للإنتاج.",
        "deliverable": "صمّم pipeline وartifact manifest مختصرة فيها evidence وروابط release identity.",
        "conceptIds": [
          "test-design",
          "ci-release"
        ]
      },
      {
        "title": "Schema evolution during rollout",
        "question": "Old and new application versions run together while a required column is added. Outline an expand–contract release.",
        "lesson": "التوافق لازم يشمل running code والـjobs والـDB، وبعدها backfill ثم tighten constraints لما الحالة مستقرة.",
        "model": "Add a compatible schema first, deploy code tolerant of old/new data, backfill in bounded idempotent batches and verify completeness. Enforce constraints and remove old paths only after compatibility windows close. Assess DDL locks, queued payloads and rollback/forward recovery before release.",
        "criteria": [
          {
            "label": "expand compatible",
            "terms": [
              "compatib",
              "expand"
            ]
          },
          {
            "label": "bounded backfill",
            "terms": [
              "backfill",
              "batch"
            ]
          },
          {
            "label": "verify tighten",
            "terms": [
              "verify",
              "constraint"
            ]
          },
          {
            "label": "recovery workers",
            "terms": [
              "rollback",
              "worker"
            ]
          }
        ],
        "pitfall": "حذف العمود القديم في نفس rolling release ممكن يكسر instances أو jobs لسه بتستخدمه.",
        "deliverable": "اكتب release sequence وrollback decision وverification لكل مرحلة.",
        "conceptIds": [
          "test-design",
          "ci-release"
        ]
      },
      {
        "title": "Mutation and false confidence",
        "question": "A suite has 95% line coverage but replacing a permission check with true does not fail any test. What is missing?",
        "lesson": "Coverage بتقيس تنفيذ lines، مش assertions اللي بتحمي behavior. Negative paths وmutation evidence يوضحوا gaps فعلية.",
        "model": "Add independent denied-actor/resource cases that assert both response and absence of mutation/leakage. Check mocks and fixtures actually exercise authorization. Use targeted mutation testing or a known defect to validate test strength, then keep coverage as a signal rather than a correctness certificate.",
        "criteria": [
          {
            "label": "negative matrix",
            "terms": [
              "deny",
              "denied",
              "negative"
            ]
          },
          {
            "label": "side effects",
            "terms": [
              "mutation",
              "leak"
            ]
          },
          {
            "label": "real path",
            "terms": [
              "mock",
              "fixture"
            ]
          },
          {
            "label": "mutation strength",
            "terms": [
              "mutation",
              "defect"
            ]
          }
        ],
        "pitfall": "النسبة العالية ممكن تيجي من happy paths بتعدي على code من غير ما تفحص invariant المهمة.",
        "deliverable": "قدّم testين يفشلوا لو permission check اتشالت، مع سبب assertion كل واحدة.",
        "conceptIds": [
          "test-design",
          "ci-release"
        ]
      }
    ]
  },
  {
    "title": "Security Engineering & Privacy",
    "ar": "احمِ الصلاحيات والبيانات طول عمرها",
    "desc": "Trust models، Crypto boundaries، Retention وAudit",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Choose the cryptographic goal",
        "question": "Compare password storage, a webhook signature and reversible customer data protection. Why is one hash function not sufficient for all three?",
        "lesson": "ابدأ security goal قبل primitive؛ password hashing والتوقيع والـencryption ليهم guarantees ومتطلبات keys مختلفة.",
        "model": "Use a vetted password hasher with salts/work factors and verification/rehash policy, provider-specified authenticity verification for raw webhook bytes, and authenticated encryption for reversible sensitive data. Manage keys and rotation separately, minimize stored data and avoid custom cryptographic formats. A fast plain hash is not a universal security tool.",
        "criteria": [
          {
            "label": "password scheme",
            "terms": [
              "password",
              "rehash"
            ]
          },
          {
            "label": "signature bytes",
            "terms": [
              "signature",
              "raw"
            ]
          },
          {
            "label": "authenticated encryption",
            "terms": [
              "encrypt",
              "authentic"
            ]
          },
          {
            "label": "key lifecycle",
            "terms": [
              "key",
              "rotat"
            ]
          }
        ],
        "pitfall": "عدم القدرة على قراءة ciphertext بعينك مش إثبات إن scheme آمنة أو keys متحمية.",
        "deliverable": "اكتب data/security-goal/primitive/key-owner table لثلاثة سيناريوهات.",
        "conceptIds": [
          "crypto-basics",
          "privacy-retention"
        ]
      },
      {
        "title": "Leaked secret response",
        "question": "A production credential was committed and used by multiple workers. What is the response beyond deleting the file?",
        "lesson": "اعتبر السر compromised، ودوّره أو ابطله وحدّث consumers وراجع misuse. history cleanup مش revocation.",
        "model": "Revoke/rotate the credential, update approved secret management and all consuming processes, and inspect audit/provider logs for misuse. Remove exposure appropriately, preserve incident evidence without reproducing the secret, and add least privilege/scanning plus a tested rotation procedure. Verify old credentials no longer work.",
        "criteria": [
          {
            "label": "revoke rotate",
            "terms": [
              "revok",
              "rotat"
            ]
          },
          {
            "label": "consumer update",
            "terms": [
              "worker",
              "consumer"
            ]
          },
          {
            "label": "audit misuse",
            "terms": [
              "audit",
              "misuse"
            ]
          },
          {
            "label": "verification prevention",
            "terms": [
              "verify",
              "scan"
            ]
          }
        ],
        "pitfall": "نسخ الـkey في ticket أو log أثناء التحقيق بيخلق exposure جديدة.",
        "deliverable": "اكتب incident checklist فيها containment وrecovery وverification وfollow-up.",
        "conceptIds": [
          "crypto-basics",
          "privacy-retention"
        ]
      },
      {
        "title": "Data inventory and retention",
        "question": "Design a retention policy for support logs, customer exports and financial audit records without treating them as one dataset.",
        "lesson": "Purpose وaccess وretention تختلف حسب نوع البيانات. حدّد copies والـbackups والـlegal/business requirements بدل مدة واحدة للجميع.",
        "model": "Inventory purpose, fields, owner, access, retention and deletion/anonymization path for each dataset. Minimize PII and secrets, restrict audit integrity/access and include replicas/search/backups in lifecycle planning. Validate requirements with the appropriate domain owners and test cleanup/export paths rather than inventing universal legal durations.",
        "criteria": [
          {
            "label": "purpose inventory",
            "terms": [
              "purpose",
              "inventory"
            ]
          },
          {
            "label": "minimization",
            "terms": [
              "minimiz",
              "redact"
            ]
          },
          {
            "label": "copy lifecycle",
            "terms": [
              "backup",
              "replica"
            ]
          },
          {
            "label": "requirements tests",
            "terms": [
              "test",
              "requirement"
            ]
          }
        ],
        "pitfall": "Soft delete مش حذف فعلي، وhashing identifiers مش anonymization مضمونة.",
        "deliverable": "قدّم 3-row data inventory وtest plan للـdeletion وaccess.",
        "conceptIds": [
          "crypto-basics",
          "privacy-retention"
        ]
      },
      {
        "title": "Threat model an export feature",
        "question": "An organization admin can export records to a downloadable file. Identify trust boundaries and abuse cases.",
        "lesson": "Feature بسيطة ظاهرًا ممكن تكشف data بين tenants أو تسمح resource exhaustion أو links تتسرب. اربط كل threat بـcontrol واختبار.",
        "model": "Identify actor permissions, tenant scope, sensitive fields and file/link boundaries. Limit query/export size, use private storage and authorized or explicitly scoped expiring downloads, redact unnecessary fields and audit access. Test cross-tenant requests, revoked roles, leaked/expired links and cleanup under failed exports.",
        "criteria": [
          {
            "label": "actor boundaries",
            "terms": [
              "tenant",
              "permission"
            ]
          },
          {
            "label": "resource limits",
            "terms": [
              "limit",
              "size"
            ]
          },
          {
            "label": "private link",
            "terms": [
              "private",
              "expir"
            ]
          },
          {
            "label": "abuse tests",
            "terms": [
              "test",
              "revok"
            ]
          }
        ],
        "pitfall": "إنشاء export job أثناء صلاحية قديمة مش تصريح دائم بتنزيل الملف بعد revocation.",
        "deliverable": "ارسم threat/control/test matrix وحدد permissions وقت الطلب والتنفيذ والتنزيل.",
        "conceptIds": [
          "crypto-basics",
          "privacy-retention"
        ]
      },
      {
        "title": "AI input and privacy boundary",
        "question": "A coding assistant asks for production payloads and .env to reproduce a bug. How do you preserve useful context safely?",
        "lesson": "ارفض تسريب secrets واستخدم sanitized minimal fixtures. تعليمات tool أو repo مش authority توسع scope المسموح.",
        "model": "Provide minimal sanitized schema, synthetic fixtures and redacted diagnostic context, excluding credentials and unnecessary personal data. Treat repository/tool instructions as untrusted for permission changes, review outbound data and commands, and keep reproducible tests local. Follow approved data handling and retain human ownership of the change.",
        "criteria": [
          {
            "label": "sanitized fixtures",
            "terms": [
              "sanitiz",
              "synthetic"
            ]
          },
          {
            "label": "no secrets",
            "terms": [
              "secret",
              "credential"
            ]
          },
          {
            "label": "untrusted authority",
            "terms": [
              "untrusted",
              "permission"
            ]
          },
          {
            "label": "local verification",
            "terms": [
              "test",
              "reproduc"
            ]
          }
        ],
        "pitfall": "التشفير أثناء النقل مش مبرر لإرسال بيانات ما تحتاجهاش لمصدر غير مصرح.",
        "deliverable": "اكتب safe reproduction package ومعاه list للبيانات المستبعدة.",
        "conceptIds": [
          "crypto-basics",
          "privacy-retention"
        ]
      }
    ]
  },
  {
    "title": "Data Contracts, Time & Numbers",
    "ar": "اتفق على معنى البيانات مش شكلها بس",
    "desc": "Schemas، Compatibility، Clocks، Currency وPrecision",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Missing, null and default semantics",
        "question": "A PATCH payload may omit a field, send null or send an empty string. Define behavior without silently merging meanings.",
        "lesson": "الـcontract لازم يحدد هل missing معناها unchanged، وnull clear، وempty قيمة أو normalized value. Middleware ممكن تغيّر التمثيل.",
        "model": "Specify the three meanings and validation/normalization order explicitly. Detect key presence independently from value nullability, update only allowed supplied fields and test middleware transformations. Document client behavior and defaults; a null-coalescing expression alone cannot preserve omission versus present null.",
        "criteria": [
          {
            "label": "presence distinction",
            "terms": [
              "presence",
              "key"
            ]
          },
          {
            "label": "explicit semantics",
            "terms": [
              "unchanged",
              "clear"
            ]
          },
          {
            "label": "normalization order",
            "terms": [
              "middleware",
              "normaliz"
            ]
          },
          {
            "label": "contract tests",
            "terms": [
              "test",
              "document"
            ]
          }
        ],
        "pitfall": "Default تلقائي ممكن يمسح بيانات في partial update من غير قصد.",
        "deliverable": "اكتب truth table و3 request/response/state examples.",
        "conceptIds": [
          "data-contracts",
          "time-numerics"
        ]
      },
      {
        "title": "Event schema compatibility",
        "question": "A producer adds a new enum value and changes a numeric ID to a string. Why might additive-looking changes break consumers?",
        "lesson": "Compatibility معناها consumers تقدر تفسر المعنى، مش JSON لسه بتparse. Exhaustive switches وtype assumptions وold queued payloads محتاجة سياسة.",
        "model": "Assess consumer enum exhaustiveness and ID parsing/type assumptions, version the contract where semantics break and define unknown-value handling. Use contract tests and staged migration, support old payload replay and measure consumer adoption. Do not assume all additions are safe or that a schema_version field alone supplies migration logic.",
        "criteria": [
          {
            "label": "consumer assumptions",
            "terms": [
              "consumer",
              "enum"
            ]
          },
          {
            "label": "version migration",
            "terms": [
              "version",
              "migrat"
            ]
          },
          {
            "label": "replay support",
            "terms": [
              "replay",
              "old"
            ]
          },
          {
            "label": "contract tests",
            "terms": [
              "test"
            ]
          }
        ],
        "pitfall": "إضافة enum case ممكن تكسر match من غير default في consumer قديمة.",
        "deliverable": "قدّم compatibility matrix producer/consumer versions وخطة rollout.",
        "conceptIds": [
          "data-contracts",
          "time-numerics"
        ]
      },
      {
        "title": "Calendar time versus elapsed duration",
        "question": "A monthly bill is due at local midnight and a request timeout lasts 5 seconds. Why do these need different time models?",
        "lesson": "Calendar rules محتاجة timezone وmonth-end policy؛ elapsed timing يفضّل monotonic clock. UTC formatting وحده مش تعريف deadline business.",
        "model": "Model billing with a named business timezone and explicit calendar/month-end/DST policy, storing instants and required context consistently. Measure elapsed timeout with an appropriate monotonic clock and deadline budget. Inject/freeze clocks in tests and cover leap dates, DST boundaries and exact expiry behavior.",
        "criteria": [
          {
            "label": "calendar timezone",
            "terms": [
              "timezone",
              "calendar"
            ]
          },
          {
            "label": "monotonic",
            "terms": [
              "monotonic"
            ]
          },
          {
            "label": "business boundaries",
            "terms": [
              "dst",
              "month"
            ]
          },
          {
            "label": "test clock",
            "terms": [
              "test",
              "clock"
            ]
          }
        ],
        "pitfall": "الشهر مش مدة ثابتة بالثواني، وwall clock adjustment ممكن يبوظ elapsed measurements.",
        "deliverable": "اكتب time policy لكل سيناريو و4 boundary tests.",
        "conceptIds": [
          "data-contracts",
          "time-numerics"
        ]
      },
      {
        "title": "Money precision and rounding",
        "question": "Calculate a discounted price and tax for multiple currencies. What must you define before choosing integer minor units or decimals?",
        "lesson": "Currency scale وrounding stage وoverflow والـintermediate precision جزء من correctness، مش formatting في آخر response.",
        "model": "Carry currency and exact amount representation, define currency scale, rounding mode/stage and intermediate precision, and reject unsupported mixed-currency operations. Check numeric bounds and test tie rounding, refunds and zero-decimal currencies. Avoid floating equality or a hard-coded two-decimal assumption as the money model.",
        "criteria": [
          {
            "label": "currency scale",
            "terms": [
              "currency",
              "scale"
            ]
          },
          {
            "label": "rounding policy",
            "terms": [
              "round"
            ]
          },
          {
            "label": "bounds precision",
            "terms": [
              "overflow",
              "precision"
            ]
          },
          {
            "label": "edge tests",
            "terms": [
              "test",
              "refund"
            ]
          }
        ],
        "pitfall": "تقريب كل line وبعدين الجمع ممكن يختلف عن تقريب الإجمالي؛ السياسة لازم تتفق مع المجال.",
        "deliverable": "قدّم rounding specification وfixtures لحالات half ties وrefunds.",
        "conceptIds": [
          "data-contracts",
          "time-numerics"
        ]
      },
      {
        "title": "JSON validity is not a contract",
        "question": "A response is valid JSON with missing currency and a very large numeric ID. How do you parse and validate without data loss?",
        "lesson": "Parsing بيختبر syntax، وبعده schema/type/semantic validation. IDs الكبيرة ممكن تحتاج string contract عشان precision في clients مختلفة.",
        "model": "Fail clearly on malformed JSON, then validate required fields, types, bounds and business relationships. Represent large identifiers safely as strings where the cross-language contract requires it and distinguish valid null from parse failure. Test missing fields, wrong types and precision boundaries; HTTP success does not prove valid domain data.",
        "criteria": [
          {
            "label": "syntax vs schema",
            "terms": [
              "schema",
              "pars"
            ]
          },
          {
            "label": "required types",
            "terms": [
              "required",
              "type"
            ]
          },
          {
            "label": "precision IDs",
            "terms": [
              "string",
              "precision"
            ]
          },
          {
            "label": "boundary tests",
            "terms": [
              "test",
              "null"
            ]
          }
        ],
        "pitfall": "JSON number limits في languages/clients مختلفة ممكن تفقد identity من غير parse error.",
        "deliverable": "اكتب response schema و5 invalid payloads وerror mapping المناسب.",
        "conceptIds": [
          "data-contracts",
          "time-numerics"
        ]
      }
    ]
  },
  {
    "title": "Engineering Communication & Judgment",
    "ar": "اشرح القرار وامتلك أثره",
    "desc": "ADRs، Reviews، Trade-offs، Incidents وResponsible AI",
    "color": "blue",
    "icon": "SE",
    "questions": [
      {
        "title": "Write an actionable ADR",
        "question": "Document a decision to keep a modular monolith instead of splitting services now. What belongs in the record?",
        "lesson": "ADR مفيدة لما تربط القرار بـcontext وبدائل وتبعات وrevisit trigger، مش تكتب التقنية المختارة فقط.",
        "model": "Record the problem, constraints, viable alternatives, decision and consequences, plus validation evidence and measurable revisit triggers. Explain data ownership and operational trade-offs, identify uncertainty and preserve the decision context. Keep it concise and update/supersede deliberately when assumptions change.",
        "criteria": [
          {
            "label": "context alternatives",
            "terms": [
              "context",
              "alternative"
            ]
          },
          {
            "label": "consequences",
            "terms": [
              "consequence",
              "trade"
            ]
          },
          {
            "label": "evidence",
            "terms": [
              "evidence",
              "validat"
            ]
          },
          {
            "label": "revisit",
            "terms": [
              "revisit",
              "assumption"
            ]
          }
        ],
        "pitfall": "ADR مش إعلان إن اختيار واحد best practice مطلقة لكل الفرق.",
        "deliverable": "اكتب ADR صفحة واحدة، مع assumption لو اتغيرت تعيد القرار.",
        "conceptIds": [
          "adr-communication",
          "engineering-judgment"
        ]
      },
      {
        "title": "Code review with clear priorities",
        "question": "A PR fixes a payment race but contains optional naming disagreements. How do you separate correctness blockers from suggestions?",
        "lesson": "Review يبقى عن invariant وsecurity وrollout وevidence أولًا؛ style preferences تتسمى بوضوح وتتقيد بالـscope.",
        "model": "Assess the concrete race, transaction/idempotency behavior, constraints, tests and rollout compatibility as blockers where necessary. Label optional style suggestions distinctly, request minimal evidence and avoid unrelated rewrites. Explain the user impact of each concern and review the final behavior, not conversational history.",
        "criteria": [
          {
            "label": "correctness blockers",
            "terms": [
              "invariant",
              "correct"
            ]
          },
          {
            "label": "evidence tests",
            "terms": [
              "test",
              "evidence"
            ]
          },
          {
            "label": "scope labels",
            "terms": [
              "optional",
              "scope"
            ]
          },
          {
            "label": "user impact",
            "terms": [
              "impact"
            ]
          }
        ],
        "pitfall": "المطالبة بإعادة كتابة architecture كلها قبل fix bounded ممكن تعطل علاج defect خطير من غير داعي.",
        "deliverable": "اكتب 2 blocking comments و2 suggestions مع السبب والأثر.",
        "conceptIds": [
          "adr-communication",
          "engineering-judgment"
        ]
      },
      {
        "title": "Incident communication without blame",
        "question": "A release causes partial invoice duplication. What do you communicate while investigating, and what goes in the follow-up?",
        "lesson": "افصل facts من hypotheses ووضح الأثر وخطوة mitigation والـuncertainty. بعد الاستقرار، حسّن النظام والـevidence بدل لوم الأشخاص.",
        "model": "Report confirmed scope, user impact, mitigation, owner and next update without exposing secrets or claiming an unverified root cause. Preserve evidence and reconcile affected data safely. Follow with a blameless causal analysis, detection gaps, regression evidence and owned preventive actions with measurable completion criteria.",
        "criteria": [
          {
            "label": "facts uncertainty",
            "terms": [
              "fact",
              "hypothes"
            ]
          },
          {
            "label": "impact mitigation",
            "terms": [
              "impact",
              "mitigat"
            ]
          },
          {
            "label": "reconcile evidence",
            "terms": [
              "reconcil",
              "evidence"
            ]
          },
          {
            "label": "owned followup",
            "terms": [
              "owner",
              "action"
            ]
          }
        ],
        "pitfall": "متعلنش data سليمة بالكامل قبل reconciliation، ومتعملش destructive cleanup تحت ضغط من غير audit.",
        "deliverable": "اكتب incident update قصيرة وpostmortem outline.",
        "conceptIds": [
          "adr-communication",
          "engineering-judgment"
        ]
      },
      {
        "title": "Evidence versus completion badges",
        "question": "A learner completes every interview question but cannot debug a failed migration or explain a trade-off. How should mastery be evaluated?",
        "lesson": "الإكمال والنسبة وrubric coverage مؤشرات نشاط، مش شهادة competence. المطلوب artifacts وشغل فعلي وشرح قرارات ومراجعة.",
        "model": "Require demonstrated outcomes: design artifacts, working tests, failure investigation, measured trade-offs and a reviewed end-to-end project. Use questions to expose gaps, record independent evidence and revisit weak areas. Self-assessed completion and keyword scores do not prove production engineering ability or replace peer review and experience.",
        "criteria": [
          {
            "label": "demonstrated artifact",
            "terms": [
              "artifact",
              "project"
            ]
          },
          {
            "label": "verification",
            "terms": [
              "test",
              "measure"
            ]
          },
          {
            "label": "tradeoffs review",
            "terms": [
              "trade",
              "review"
            ]
          },
          {
            "label": "score limits",
            "terms": [
              "score",
              "keyword"
            ]
          }
        ],
        "pitfall": "الموقع وسيلة تدريب؛ لا نسبة الإكمال ولا الإجابة النموذجية تضمن فهم كل مجال أو خبرة الإنتاج.",
        "deliverable": "قدّم mastery rubric بثلاث مستويات ودليل لكل مستوى.",
        "conceptIds": [
          "adr-communication",
          "engineering-judgment"
        ]
      },
      {
        "title": "Engineering under a risky deadline",
        "question": "A deadline is close and a new feature risks irreversible data loss. How do you present options and decide responsibly?",
        "lesson": "قرار التسليم لازم يعرض benefit وblast radius وقابلية الرجوع والأدلة والـunknowns، مش يخفي المخاطرة تحت كلمة هتلحق.",
        "model": "State the user outcome, confirmed risk and uncertainty, then compare a narrower safe slice, staged rollout, delay or reversible alternative. Define stop conditions, ownership and verification, involve the appropriate decision maker and avoid irreversible actions without adequate evidence. Document the accepted trade-off and monitoring/recovery plan.",
        "criteria": [
          {
            "label": "risk and uncertainty",
            "terms": [
              "risk",
              "uncertain"
            ]
          },
          {
            "label": "alternatives",
            "terms": [
              "slice",
              "alternative"
            ]
          },
          {
            "label": "reversible stop",
            "terms": [
              "revers",
              "stop"
            ]
          },
          {
            "label": "ownership evidence",
            "terms": [
              "owner",
              "evidence"
            ]
          }
        ],
        "pitfall": "AI-generated confidence أو passing happy path مش evidence كفاية لتغيير destructive.",
        "deliverable": "اكتب decision brief فيها 3 خيارات وcost/risk/evidence لكل خيار.",
        "conceptIds": [
          "adr-communication",
          "engineering-judgment"
        ]
      }
    ]
  }
];
