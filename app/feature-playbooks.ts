export type FeaturePlaybook={focus:string;terms:{term:string;meaning:string}[];invariants:string[];example:{story:string;rows:{step:string;action:string;result:string}[]};diagram:{main:string[];branches:{source:number;title:string;label:string;detail:string;rejoin:boolean;target?:number}[]};code:string;notes:string[];decisions:{question:string;choice:string;tradeoff:string}[];extraProblems:{symptom:string;cause:string;fix:string;test:string}[]};
export const featurePlaybooks:Record<string,FeaturePlaybook> = {
  "blueprint": {
    "focus": "تحويل requirement إلى تصميم يمكن إثباته وتشغيله",
    "terms": [
      {
        "term": "Invariant",
        "meaning": "قاعدة business لازم تظل صحيحة تحت التزامن والفشل، مش validation رسالة فقط."
      },
      {
        "term": "Atomic boundary",
        "meaning": "مجموعة writes تنجح أو تفشل مع بعض داخل مصدر بيانات يضمن ذلك."
      },
      {
        "term": "Recovery owner",
        "meaning": "المكوّن أو الفريق المسؤول عن اكتشاف الحالة المعلقة وحسمها بدليل."
      }
    ],
    "invariants": [
      "لكل وعد للمستخدم مصدر حقيقة وguard واختبار.",
      "كل external side effect له هوية مستقرة وحالة unknown قابلة للحسم.",
      "لا pending state من غير deadline وowner وrecovery action."
    ],
    "example": {
      "story": "هنصمم حجز ورشة بآخر مكان وسعر200. المتصفح قال payment timeout؛ المطلوب ليس إعادة الخصم، بل معرفة هل الدفع حصل وهل المكان ما زال مملوكًا للعميل.",
      "rows": [
        {
          "step": "1 · Scope",
          "action": "حدد capacity-based session، hold10min ودفع خارجي.",
          "result": "استبعد recurring appointments مؤقتًا واكتب الافتراض."
        },
        {
          "step": "2 · Rule",
          "action": "active holds + confirmed <= capacity.",
          "result": "Session guard مشتركة لكل reserve/confirm/expire."
        },
        {
          "step": "3 · Failure",
          "action": "provider نفذ ثم response ضاعت.",
          "result": "operation unknown، lookup بنفس reference؛ لا charge جديدة."
        },
        {
          "step": "4 · Evidence",
          "action": "اختبار requestين + late callback + crash.",
          "result": "تحول requirement إلى constraints واختبارات وrunbook."
        }
      ]
    },
    "diagram": {
      "main": [
        "Define promise",
        "Specify invariants",
        "Choose boundaries",
        "Model failure",
        "Prove & operate"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Ambiguous scope",
          "label": "clarify",
          "detail": "لو نوع الموارد أو الوعد غير واضح، ارجع لحسم requirement قبل اختيار schema.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Unresolved outcome",
          "label": "recover",
          "detail": "عيّن owner ومصدر evidence بدل تحويل unknown إلى failure تخميني.",
          "rejoin": false
        }
      ]
    },
    "code": "// Design artifact before implementation — not executable PHP\nFeature: paid workshop booking\nInvariant: active_holds + confirmed_allocations <= capacity\nCommand: ReserveSeat(actor, session, quote, client_key)\nLocal commit: hold + operation + outbox\nExternal evidence: verified payment reference + amount + currency\nRecovery: expire held seats; reconcile unknown payments;\n          refund paid-but-unallocated cases once\nProof: concurrent DB test + crash timeline + operational alert",
    "notes": [
      "ابدأ باسم الوعد، ثم اكتب سيناريو نجاح وسيناريو فشل بنفس data model.",
      "كل سهم إلى نظام خارجي نقطة يمكن أن يضيع عندها response؛ اكتب سياسة قبل كتابة SDK call.",
      "الـdiagram خريطة قرار مختصرة؛ الـflow التفصيلية تحت تحدد guards والمعاملات."
    ],
    "decisions": [
      {
        "question": "أبدأ بـMicroservices؟",
        "choice": "ابدأ بأبسط boundary تحمي القواعد وتقدر تشغلها.",
        "tradeoff": "التوزيع يضيف network failures وreconciliation؛ لا تختاره لمجرد أسماء الأدوات."
      },
      {
        "question": "أكتب API ولا schema الأول؟",
        "choice": "ابدأ vocabulary/invariants ثم صممهما معًا.",
        "tradeoff": "API من غير domain rules تخفي inconsistent states بدل حلها."
      }
    ],
    "extraProblems": [
      {
        "symptom": "اختبارات happy path كلها خضراء لكن الإنتاج يفشل",
        "cause": "لا اختبار لحدود الاتصال والـcommit.",
        "fix": "اعمل fault matrix قبل/بعد كل boundary واكتب expected recovery.",
        "test": "احقن crash بعد provider effect وقبل local update."
      },
      {
        "symptom": "Support محتاجة تعدل status يدويًا كل يوم",
        "cause": "الحالات المعلقة بلا owner ولا evidence contract.",
        "fix": "Exception queue مع runbook وsafe commands وأثر تدقيق.",
        "test": "نفذ recovery على نفس operation مرتين؛ لا duplicate effect."
      }
    ]
  },
  "booking": {
    "focus": "Reservation ownership والـexpiry وlate payment",
    "terms": [
      {
        "term": "Hold",
        "meaning": "حق مؤقت في سعة محددة له owner وexpiry؛ ليس booking confirmed."
      },
      {
        "term": "Allocation",
        "meaning": "استهلاك مؤكد للسعة مرتبط بحجز واحد."
      },
      {
        "term": "Resource guard",
        "meaning": "نقطة serialization مشتركة لكل المسارات التي تغيّر نفس المورد."
      }
    ],
    "invariants": [
      "لا تتجاوز active holds + confirmed capacity.",
      "الحجز لا يتأكد إلا إذا ما زال يملك حق المورد تحت guard.",
      "نجاح دفع متأخر لا يسحب مكانًا من عميل آخر."
    ],
    "example": {
      "story": "Session9 فيها كرسي واحد. A تعمل hold حتى10:10 وتبدأ الدفع. الساعة10:11 الحجز ينتهي وB تمسك الكرسي. الساعة10:12 يصل تأكيد دفع A؛ نحتفظ بملكية B وننشئ refund operation مرتبطة بـA.",
      "rows": [
        {
          "step": "10:00",
          "action": "A تحجز آخر مكان حتى10:10.",
          "result": "owner=A؛ active_hold=1؛ capacity available=0."
        },
        {
          "step": "10:11",
          "action": "Expiry تتحقق تحت session guard ثم تحرر A.",
          "result": "A expired؛ لا حق دائم مبني على شاشة countdown."
        },
        {
          "step": "10:11:01",
          "action": "B تعمل reserve ناجحة.",
          "result": "owner=B؛ نجاح A المالي لا يغير هذا الحق."
        },
        {
          "step": "10:12",
          "action": "Verified payment A تصل.",
          "result": "paid_unallocated + refund_required، مع effect واحدة فقط."
        }
      ]
    },
    "diagram": {
      "main": [
        "Quote & authorize",
        "Guard resource",
        "Create hold",
        "Verify payment",
        "Confirm allocation"
      ],
      "branches": [
        {
          "source": 1,
          "title": "No capacity",
          "label": "conflict",
          "detail": "آخر مكان محجوز؛ أعد conflict واضحة ولا تبدأ وعد حجز جديد.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Expired / lost hold",
          "label": "late success",
          "detail": "لو الدفع صحيح لكن الـhold لم تعد صالحة، refund/review؛ لا steal للمالك الحالي.",
          "rejoin": false
        }
      ]
    },
    "code": "// Laravel-oriented sketch: all writers share the same resource guard\nDB::transaction(function () use ($sessionId, $bookingId, $evidence) {\n    $session = Session::lockForUpdate()->findOrFail($sessionId);\n    $booking = Booking::lockForUpdate()->findOrFail($bookingId);\n    assertVerifiedPaymentMatches($booking, $evidence);\n    if ($booking->state === 'confirmed') return; // semantic replay\n    if (!$booking->ownsLiveHold(databaseNow())) {\n        markPaidUnallocatedAndQueueRefundOnce($booking, $evidence);\n        return;\n    }\n    confirmAllocationAndWriteOutboxOnce($session, $booking);\n});\n// No provider call inside this transaction.\n// Every expiry/reserve/cancel path must use this SAME session guard.",
    "notes": [
      "الـsession row موجودة حتى لو لا توجد bookings؛ عشان كده تصلح guard مستقرة في نموذج capacity.",
      "ownsLiveHold يجب أن تتحقق من state/owner/expiry وفق نفس clock والسياسة؛ الاسم هنا contract وليست Laravel built-in.",
      "appointments overlapping تحتاج range/slot enforcement مختلفة؛ لا تنسخ capacity counter لها بلا تعديل."
    ],
    "decisions": [
      {
        "question": "Hold عند cart ولا pay؟",
        "choice": "اختر وقت reservation ومدتها وفق نوع المورد والتجربة.",
        "tradeoff": "Hold مبكرة تزيد abandonment والسعة المجمدة؛ متأخرة تزيد conflicts عند الدفع."
      },
      {
        "question": "أعمل refund لكل late success؟",
        "choice": "ده اختيار المثال؛ بديل re-reserve يتطلب guard جديدة وسياسة واضحة.",
        "tradeoff": "نجاح provider وحده لا يخلق سعة غير موجودة."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Expiry job حررت confirmed seat",
        "cause": "release لم تكن مشروطة بالحالة الحالية.",
        "fix": "Guard وtransition held->expired فقط؛ confirmed لا تتحرر من نفس الأمر.",
        "test": "Confirm وexpire متزامنان؛ نتيجة واحدة متسقة."
      },
      {
        "symptom": "Timezone نقلت ميعاد العميل ساعة",
        "cause": "اختلط local time مع instant وDST.",
        "fix": "UTC instants + IANA timezone وقاعدة intervals موثقة.",
        "test": "اختبر وقت DST وموعدين يلتقوا عند نفس الحد."
      }
    ]
  },
  "payments": {
    "focus": "Operation identity وtrusted evidence وunknown outcomes",
    "terms": [
      {
        "term": "Operation",
        "meaning": "نية تجارية محفوظة لدفع مبلغ/عملة محددين، أوسع من HTTP request."
      },
      {
        "term": "Attempt",
        "meaning": "محاولة تنفيذ مرتبطة بالعملية، لها provider reference ونتيجة مستقلة."
      },
      {
        "term": "Business effect",
        "meaning": "أثر مثل fulfillment أوwallet credit يُمنع تكراره بهوية تجارية."
      }
    ],
    "invariants": [
      "نفس key ونفس fingerprint تعيد نفس العملية.",
      "كل successful payment لها fulfillment واحدة وفق contract الطلب.",
      "Redirect وtimeout لا يثبتان نجاحًا أو فشلًا ماليًا."
    ],
    "example": {
      "story": "Order77 payable200EGP. العملية pay-77 محفوظة قبل إرسال الطلب. Provider خصم200 لكن الرد ضاع. العميل يعيد نفس key، ثم تصل evt1 وevt2 لنفس الدفع. نسجل charge واحدة وfulfillment واحدة.",
      "rows": [
        {
          "step": "1 · Persist",
          "action": "احفظ pay-77+fingerprint+outbox.",
          "result": "نستطيع استرداد العملية حتى لو request انقطعت."
        },
        {
          "step": "2 · Execute",
          "action": "المزود نفذ ثم timeout.",
          "result": "Local unknown؛ لا failure مؤكدة ولا نية خصم بديلة."
        },
        {
          "step": "3 · Retry",
          "action": "نفس reference ضمن عقد المزود ثم query.",
          "result": "لا نفرض charge جديدة لحل غياب response."
        },
        {
          "step": "4 · Confirm",
          "action": "evt1 ثم evt2 موثوقتان لنفس الدفع.",
          "result": "Inbox records قد تكون2، business fulfillment تظل1."
        }
      ]
    },
    "diagram": {
      "main": [
        "Accepted order",
        "Persist operation",
        "Submit provider",
        "Verify evidence",
        "Apply effect once"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Payload conflict",
          "label": "same key / new amount",
          "detail": "نفس key لمبلغ مختلف تترد conflict؛ لا تغيير في العملية الأصلية.",
          "rejoin": false
        },
        {
          "source": 2,
          "title": "Unknown outcome",
          "label": "timeout",
          "detail": "النتيجة تُحسم lookup/webhook/reconciliation بنفس reference.",
          "rejoin": true,
          "target": 3
        }
      ]
    },
    "code": "// Intake sketch: verification uses the ORIGINAL raw body\n$event = $gateway->verifyAndParse($request->getContent(), $signature);\n$inbox->storeDurablyOnce($provider, $account, $event->id, $event);\nreturn response()->noContent(); // ACK durable receipt, not settlement\n\n// Worker, separate transaction:\nDB::transaction(function () use ($event) {\n    $operation = lockPaymentOperation($event->businessReference);\n    validateAccountAmountCurrencyAndState($operation, $event);\n    recordInboxProcessedWithDomainState($event, $operation);\n    createBusinessEffectAndOutboxOnce($operation, 'fulfillment');\n});",
    "notes": [
      "التوقيع يُتحقق بالطريقة الرسمية للمزود؛ لا تعمل custom signature algorithm.",
      "ACK بعد durable intake لا يعني أن الشحن اكتمل؛ worker قابلة للـretry.",
      "Unique event ID تحمي intake فقط؛ unique operation+effect_kind تحمي business side effect."
    ],
    "decisions": [
      {
        "question": "أعيد charge بعد500؟",
        "choice": "استعلم وأعد نفس العملية وفق provider contract.",
        "tradeoff": "API versions وretention تختلف؛ لا تفترض idempotency أبدية."
      },
      {
        "question": "Capture فورية ولا منفصلة؟",
        "choice": "اختيار method وprovider وموعد fulfillment يحددوا flow.",
        "tradeoff": "Authorization لها قيود وصلاحية؛ ليست settled cash."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Succeeded رجعت processing من event قديمة",
        "cause": "arrival order استُخدم كـstate truth.",
        "fix": "Guard transitions واستعلام الحالة الموثوقة عند نقص evidence.",
        "test": "أرسل old processing بعد success؛ لا regression."
      },
      {
        "symptom": "Logs فيها card/token data",
        "cause": "Raw request اتسجلت للتشخيص.",
        "fix": "Redaction وreferences فقط مع safe correlation IDs.",
        "test": "راجع log fixtures وتأكد من عدم تسريب secrets."
      }
    ]
  },
  "wallet": {
    "focus": "Double-entry postings مع available balance guard",
    "terms": [
      {
        "term": "Credit-normal liability",
        "meaning": "Wallet العميل التزام في النموذج: credit يزيده وdebit يقلله."
      },
      {
        "term": "Encumbrance",
        "meaning": "Hold منفصلة تقلل المتاح دون تغيير posted حتى capture."
      },
      {
        "term": "Journal",
        "meaning": "مجموعة entries balanced per currency وimmutable بعد posting."
      }
    ],
    "invariants": [
      "كل journal متوازنة لكلcurrency وتحتوي amounts صحيحة.",
      "available=posted-active_holds ولا تصبح سالبة وفق سياسة المثال.",
      "Journal وprojection وbusiness state وoutbox في commit واحدة."
    ],
    "example": {
      "story": "A تملك100EGP، ننشئ hold60 ثم transfer30 إلىB. طلب transfer آخر30 يفشل لأن available10. Capture للـ60 تسجلjournal وتزيلhold معًا؛ المتاح يظل10. الرصيد هنا liabilities credit-normal.",
      "rows": [
        {
          "step": "Opening",
          "action": "Dr CashAsset100 / Cr WalletA100.",
          "result": "A posted100،held0،available100."
        },
        {
          "step": "Hold60",
          "action": "احجز available فقط؛ لا posted entries.",
          "result": "posted100،held60،available40."
        },
        {
          "step": "Transfer30",
          "action": "Dr WalletA30 / Cr WalletB30 تحت posting guard.",
          "result": "A posted70،held60،available10؛ transfer ثانية30 ترفض."
        },
        {
          "step": "Capture60",
          "action": "Dr WalletA60 / Cr MerchantPayable60؛ remove hold atomic.",
          "result": "A posted10،held0،available10؛ لا double debit."
        }
      ]
    },
    "diagram": {
      "main": [
        "Authorize + claim key",
        "Lock accounts",
        "Guard available",
        "Post balanced journal",
        "Commit all effects"
      ],
      "branches": [
        {
          "source": 2,
          "title": "Insufficient available",
          "label": "reject",
          "detail": "Double-entry المتوازنة لا تمنح إذن صرف أموال محجوزة.",
          "rejoin": false
        },
        {
          "source": 0,
          "title": "Existing business ref",
          "label": "return prior result",
          "detail": "ارجع journal السابقة لنفس العملية بدل إنشاء entries أخرى.",
          "rejoin": false
        }
      ]
    },
    "code": "// One-currency educational posting boundary; helpers are domain contracts\nDB::transaction(function () use ($command) {\n    $operation = claimStableTransfer($command->key, $command->fingerprint);\n    if ($operation->isPosted()) return $operation->result;\n    $accounts = lockAccountsInSortedIdOrder($command->accountIds());\n    assertActorCurrencyLimitsAndAvailableFunds($command, $accounts);\n    $journal = buildBalancedEntries($command); // Dr A liability / Cr B liability\n    assertBalancedPerCurrency($journal);\n    persistJournalAndEntries($journal); // immutable after posting\n    updateSynchronousBalanceProjection($journal);\n    markPostedAndWriteOutbox($operation, $journal);\n});",
    "notes": [
      "Claim العملية نفسها لازم تكون atomic وunique-scoped؛ المتاح يُقرأ من مصدر متسق داخل هذه boundary.",
      "لا تستعمل eventual cache في spend guard، ولا تكفي Dr=Cr لإثبات ownership أوamount صحيحة.",
      "External payouts ليست هذه transaction؛ لها payable bridge وunknown/reconciliation في الدليل التالي."
    ],
    "decisions": [
      {
        "question": "Stored balance ولا sum entries؟",
        "choice": "Ledger immutable مع projection متزامنة قابلة لإعادة البناء.",
        "tradeoff": "Projection أسرع للguard لكن يلزم ضمان اتساقها ومطابقتها."
      },
      {
        "question": "أعدل journal غلط؟",
        "choice": "اعمل linked reversal/adjustment بصلاحيات وسياسة funds.",
        "tradeoff": "حذف التاريخ يمنع audit ولا يحل الأموال التي صرفها المستفيد."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Debit balanced لكنها منwallet غير مملوكة",
        "cause": "ركزنا على المبالغ ونسينا actor/object authorization.",
        "fix": "Posting command تتحقق من account ownership والـrole والحدود.",
        "test": "بدّل sender account ID؛ لا entries تُحفظ."
      },
      {
        "symptom": "Reversal خلق balance لأنB صرفت",
        "cause": "العكس تم من غير current funds/recovery policy.",
        "fix": "رفض أوrecovery case وفق model؛ journal الأصلية تظل محفوظة.",
        "test": "B spend ثم reverse؛ لا money creation ولا حذف تاريخ."
      }
    ]
  },
  "funding": {
    "focus": "الجسر بين Wallet والـBank: Receivable وPayable",
    "terms": [
      {
        "term": "Receivable",
        "meaning": "حق متوقع عند provider قبل تحوله إلى cash وفق النموذج."
      },
      {
        "term": "Payout Payable",
        "meaning": "التزام خرج من wallet المتاحة لكن لم يسوّه البنك بعد."
      },
      {
        "term": "Reconciliation",
        "meaning": "مطابقة هويات العمليات والمبالغ والعملات والرسوم والحالات والتواريخ."
      }
    ],
    "invariants": [
      "Pending incoming غير spendable في نموذج المثال.",
      "Unknown withdrawal لا ترد الرصيد من غير confirmed evidence.",
      "كل funding/payout stage لها posting identity واحدة."
    ],
    "example": {
      "story": "A معها100 وتطلب withdrawal80. ننقل80 من WalletLiability إلى PayoutPayable فيتبقى20 متاحة. البنك ينفذ والرد يضيع؛ تظل80 غير قابلة للصرف. تقرير التسوية يحسم النتيجة، ثم نسجل Dr Payable80 / Cr Cash80.",
      "rows": [
        {
          "step": "1 · Reserve",
          "action": "تحقق من beneficiary version والحدود، واحجز80.",
          "result": "المتاح20؛ لا اتصال بالبنك تحت wallet lock."
        },
        {
          "step": "2 · Submit",
          "action": "أزل hold ورحّل80 إلى payable مع outbox.",
          "result": "Wallet20 وpayable80؛ cash لم تتحرك بعد."
        },
        {
          "step": "3 · Unknown",
          "action": "البنك نفذ لكن الاتصال انقطع.",
          "result": "لا restore ولا instruction جديدة؛ query بنفس reference."
        },
        {
          "step": "4 · Settle",
          "action": "Statement تؤكد cash movement80.",
          "result": "Dr PayoutPayable80 / Cr Cash80؛ mismatch تدخل exception queue."
        }
      ]
    },
    "diagram": {
      "main": [
        "Verify beneficiary",
        "Reserve / reclassify",
        "Submit payout",
        "Resolve evidence",
        "Reconcile cash"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Limits / approval fail",
          "label": "stop",
          "detail": "لا خروج أموال قبل policy والموافقة المطلوبة.",
          "rejoin": false
        },
        {
          "source": 2,
          "title": "Bank outcome unknown",
          "label": "query same ref",
          "detail": "لا تعكس payable بسبب timeout؛ استخدم evidence أو reconciliation.",
          "rejoin": true,
          "target": 3
        }
      ]
    },
    "code": "// Educational one-currency posting sketch; amounts are minor units\npostOnce('withdrawal:42:submit', [\n    debit('WalletLiability:A', 8000, 'EGP'),\n    credit('PayoutPayable:42', 8000, 'EGP'),\n], removeHold: 'hold-42', outbox: 'submit-payout-42');\n// Separate atomic posting after CONFIRMED settlement evidence:\npostOnce('withdrawal:42:settle', [\n    debit('PayoutPayable:42', 8000, 'EGP'),\n    credit('CashAsset:bank', 8000, 'EGP'),\n]);\n// Timeout triggers neither a restore nor a new payout.",
    "notes": [
      "postOnce هنا domain contract، لازم تحقق balance guard وbusiness uniqueness وatomic hold removal.",
      "Confirmed failure قبل settlement تعكس payable إلى wallet مرة واحدة؛ bank return بعدها عملية مستقلة.",
      "رسوم provider تحتاج entries مناسبة ومطابقة statement؛ لا تخفها في net فقط."
    ],
    "decisions": [
      {
        "question": "أتيح top-up عند confirmation؟",
        "choice": "احسم availability policy حسب المصدر مع product/risk.",
        "tradeoff": "Credit قبل settlement يخلق receivable ومخاطر؛ chargeback ممكنة بعد الصرف."
      },
      {
        "question": "أصلح mismatch بتعديل balance؟",
        "choice": "Exception بدليل وحل linked journal مع approval.",
        "tradeoff": "Auto-fix بلا سبب قد يخفي خسارة أو duplicate transfer."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Statement اتعمل import مرتين",
        "cause": "Parsing تجاهلت external transaction identity.",
        "fix": "Unique report references مع idempotent matching/posting.",
        "test": "نفس report مرتين؛ لا journal إضافية."
      },
      {
        "symptom": "Bank return مسحت تاريخ settlement",
        "cause": "خلطنا return جديدة مع failure من البداية.",
        "fix": "Return operation مرتبطة وقيود جديدة تفسر المرحلتين.",
        "test": "Settled ثم return؛ cash وliabilities تظل مفسرة."
      }
    ]
  },
  "checkout": {
    "focus": "سعر مقبول ثابت مع Stock وCoupon Reservations",
    "terms": [
      {
        "term": "Quote",
        "meaning": "اقتراح سعر محسوب من السيرفر وله expiry وversion."
      },
      {
        "term": "Reservation",
        "meaning": "حجز مورد لعملية محددة؛ لا يساوي shipment."
      },
      {
        "term": "Allocation",
        "meaning": "توزيع المبلغ أو المورد حسب سياقه؛ سمِّ النوع بوضوح."
      }
    ],
    "invariants": [
      "Charged amount/currency يساوي accepted order snapshot.",
      "Reserved وallocated stock لا تتجاوز المورد وفق النموذج.",
      "Coupon usage لا تتجاوز limits تحت concurrency."
    ],
    "example": {
      "story": "Cart فيها حذاء100 وشنطة100EGP، خصم20 وشحن30؛ payable210. الشنطة آخر قطعة والكوبون آخر استخدام. نحجز الموردين معًا؛ فشل أي claim يرجع باقي الحجوزات المحلية. تغيير catalog لاحقًا لا يغير order210.",
      "rows": [
        {
          "step": "Quote",
          "action": "200 - 20 + 30 = 210.",
          "result": "خصم10 لكل line في المثال، مع rounding policy محفوظة."
        },
        {
          "step": "Claim",
          "action": "احجز stock والكوبون تحت guards بترتيب ثابت.",
          "result": "كل الموارد المحلية تُحجز أو تتراجع عند فشل واحدة."
        },
        {
          "step": "Pay",
          "action": "مبلغ210EGP من snapshot، لا من client.",
          "result": "Unknown لا تبرر checkout جديدة تكرر الخصم."
        },
        {
          "step": "Accept",
          "action": "تأكيد موثوق مع صلاحية reservations.",
          "result": "Allocation وfulfillment مرة واحدة؛ late payment لها سياسة."
        }
      ]
    },
    "diagram": {
      "main": [
        "Quote on server",
        "Claim stock & coupon",
        "Persist accepted order",
        "Verify payment",
        "Allocate & fulfill"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Stock / coupon conflict",
          "label": "rollback local",
          "detail": "لا تترك حجوزات جزئية بالخطأ في checkout all-or-nothing.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Reservation expired",
          "label": "refund / re-reserve",
          "detail": "الدفع الناجح لا يعوض missing stock؛ طبق policy صريحة.",
          "rejoin": false
        }
      ]
    },
    "code": "DB::transaction(function () use ($checkout) {\n    $operation = claimCheckoutKey($checkout->key, $checkout->fingerprint);\n    if ($operation->hasResult()) return $operation->result;\n    $quote = loadAcceptedUnexpiredQuote($checkout->quoteId);\n    lockSkuLocationRowsInStableOrder($quote->lines);\n    reserveAllStockOrThrow($quote->lines);\n    reserveCouponUsageOrThrow($quote->coupon);\n    $order = persistImmutablePriceAndAddressSnapshot($quote);\n    writePaymentIntentAndOutbox($order);\n}); // Provider request happens later, outside the DB transaction.",
    "notes": [
      "Stock وcoupon وorder في نفس DB في المثال؛ services مستقلة تحتاج workflow وتعويضات.",
      "Snapshot تشمل السعر والعملة والضريبة والخصم والشحن والتقريب والعنوان المقبول.",
      "Confirmation لاحقة تعيد فحص reservation ownership وexpiry تحت نفس guards."
    ],
    "decisions": [
      {
        "question": "الحجز عند إضافة cart؟",
        "choice": "حدد reservation point وTTL حسب المنتج.",
        "tradeoff": "الحجز المبكر يجمد stock؛ المتأخر يزيد conflicts عند الدفع."
      },
      {
        "question": "Partial fulfillment مسموحة؟",
        "choice": "قرار وموافقة وسياسة سعر/refund قبل التنفيذ.",
        "tradeoff": "لا تشحن جزءًا وتعتبر order كاملة بسبب اختلاف المخزن."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Bundle اتباعت لكن مكوناتها خلصت",
        "cause": "الحجز على parent SKU فقط.",
        "fix": "احجز مكونات bundle تحت boundary المناسبة.",
        "test": "طلبان يتنافسان على نفس component الأخيرة."
      },
      {
        "symptom": "العنوان اتغير بعد سعر الشحن",
        "cause": "Order تقرأ current address بدل snapshot.",
        "fix": "Accepted address snapshot؛ التغيير workflow بquote جديدة.",
        "test": "تغيير profile address لا يغير order مدفوعة بصمت."
      }
    ]
  },
  "returns": {
    "focus": "ميزانية رد الأموال وحركة المرتجع منفصلتان",
    "terms": [
      {
        "term": "Refund budget",
        "meaning": "Captured ناقص succeeded وreserved refunds وفق policy."
      },
      {
        "term": "RMA",
        "meaning": "طلب إرجاع سلعة بكميات وفحص؛ ليس تحويل أموال."
      },
      {
        "term": "Restock",
        "meaning": "Stock movement بدليل مناسب وهوية تمنع الزيادة مرتين."
      }
    ],
    "invariants": [
      "Succeeded + reserved refunds <= captured amount.",
      "Returned/reserved quantity لا تتجاوز eligible quantity.",
      "Refund success لا تعني restock ولا محو payment الأصلية."
    ],
    "example": {
      "story": "Captured100، refund سابقة30، وrefund pending50. المتاح20 فقط. قد ننشئ refund20 قبل وصول المرتجع وفق policy، لكن sellable stock لا تزيد إلا بعد receipt/inspection المناسبتين.",
      "rows": [
        {
          "step": "Budget",
          "action": "100 - 30 - 50 = 20.",
          "result": "Request60 ترفض؛ pending تحجز جزءًا من الميزانية."
        },
        {
          "step": "Claim",
          "action": "احجز20 مع operation ثابتة.",
          "result": "لا support request أخرى تستعمل نفس الميزانية."
        },
        {
          "step": "Evidence",
          "action": "Provider accepted ثم pending.",
          "result": "لا وعد وصول أموال؛ unknown لا تفك reservation."
        },
        {
          "step": "Goods",
          "action": "Received ثم inspected.",
          "result": "Sellable movement مرة؛ damaged تدخل quarantine."
        }
      ]
    },
    "diagram": {
      "main": [
        "Check line policy",
        "Reserve refundable",
        "Submit refund",
        "Verify money result",
        "Inspect goods separately"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Budget exhausted",
          "label": "reject amount",
          "detail": "احسب pending مع succeeded داخل guard مشتركة.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Unknown refund",
          "label": "reconcile",
          "detail": "لا refund ثانية ولا فك budget بسبب اتصال مفقود.",
          "rejoin": false
        }
      ]
    },
    "code": "DB::transaction(function () use ($request) {\n    $refund = claimRefundOperation($request->key, $request->fingerprint);\n    if ($refund->hasResult()) return $refund->result;\n    $budget = PaymentBudget::lockForUpdate()->findOrFail($request->paymentId);\n    $amount = allocateFromOriginalOrderSnapshot($request);\n    assertRefundable($budget->captured - $budget->succeeded - $budget->reserved, $amount);\n    reserveRefundBudgetAndWriteOutbox($budget, $refund, $amount);\n});\n// Restock is a DIFFERENT guarded command after warehouse evidence.",
    "notes": [
      "Replay تتحسم قبل new reservation؛ claim والـbudget guard جزء من atomic contract.",
      "Fee/shipping/tax refunds لها قواعد واضحة؛ لا تستخدم current catalog price.",
      "Confirmation worker تثبت النتيجة مرة واحدة؛ لا provider call داخل budget lock."
    ],
    "decisions": [
      {
        "question": "Refund قبل inspection؟",
        "choice": "Policy بمخاطر وموافقة محددتين.",
        "tradeoff": "تحسين التجربة قد يزيد exposure؛ ليس دليلًا لزيادة stock."
      },
      {
        "question": "Pending تستهلك budget؟",
        "choice": "نعم في نموذج الحجز حتى confirmed failure.",
        "tradeoff": "فكها مبكرًا يسمح برد مبالغ أكبر من captured."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Coupon اتردت مرتين مع partial refunds",
        "cause": "استخدمنا current price بدل allocation الأصلية.",
        "fix": "ارجع إلى net line والضريبة والتقريب من snapshot.",
        "test": "رد كل lines جزئيًا؛ المجموع لا يتجاوز eligible paid."
      },
      {
        "symptom": "نفس item دخلت طلبي إرجاع",
        "cause": "Quantity check غير محمية.",
        "fix": "Return quantity reservation بحالة وguard.",
        "test": "طلبان لآخر quantity؛ واحدة فقط تتحجز."
      }
    ]
  },
  "subscriptions": {
    "focus": "Paid periods وEntitlements بدل وقت وصول الحدث",
    "terms": [
      {
        "term": "Invoice period",
        "meaning": "فترة مطالبة لها start/end وهوية ثابتة."
      },
      {
        "term": "Entitlement",
        "meaning": "حق tenant في feature/limit حتى وقت وبمصدر معلوم."
      },
      {
        "term": "Proration",
        "meaning": "حساب فرق plan داخل فترة، بquote وeffective date."
      }
    ],
    "invariants": [
      "Invoice واحدة لكل subscription/period/kind.",
      "Access يرتبط بالفترة والـpolicy، لا event arrival time.",
      "Cancel-at-period-end لا يلغي حقًا مدفوعًا فورًا."
    ],
    "example": {
      "story": "عميل مدفوع له حتى31يناير، وتجديد فبراير فشل مع grace3days. نجاح يناير تصل ثانية يوم2فبراير؛ لا تضف شهرًا من يوم وصولها. اقرأ الفترة المدفوعة ونسخة العقد وطبق grace policy.",
      "rows": [
        {
          "step": "Paid period",
          "action": "Invoice يناير paid حتىJan31.",
          "result": "Entitlement لهذه الفترة ومصدرها محفوظ."
        },
        {
          "step": "Renewal",
          "action": "محاولة invoice فبراير فشلت.",
          "result": "Past_due وgrace لها deadline؛ ليست unlimited access."
        },
        {
          "step": "Old event",
          "action": "نجاح يناير تكرر يومFeb2.",
          "result": "لا extension بـ+30days من النهاردة."
        },
        {
          "step": "Resolve",
          "action": "دفع فبراير ينحسم أوgrace تنتهي.",
          "result": "Period-based access أوrestriction مع audit وreconcile."
        }
      ]
    },
    "diagram": {
      "main": [
        "Accept plan quote",
        "Create period invoice",
        "Collect payment",
        "Apply period evidence",
        "Grant / restrict access"
      ],
      "branches": [
        {
          "source": 2,
          "title": "Collection failed",
          "label": "dunning",
          "detail": "Retries محدودة وgrace بdeadline معلومة.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Old period event",
          "label": "guard version",
          "detail": "Dedupe وperiod/version checks تمنع تمديدًا خاطئًا.",
          "rejoin": false
        }
      ]
    },
    "code": "DB::transaction(function () use ($event) {\n    $period = lockInvoicePeriod($event->subscriptionId, $event->periodId);\n    verifyTrustedInvoicePayment($period, $event);\n    applyInvoiceStateOnce($period, $event);\n    upsertEntitlementFromPaidPeriod(\n        tenant: $period->tenantId,\n        source: $period->id,\n        endsAt: $period->endsAt // NOT now()->addMonth()\n    );\n});",
    "notes": [
      "Period identity مهمة؛ لا تعالج كل success كأنها تجديد جديد.",
      "Hard quota مثل seats تحتاج concurrency guard مستقلة؛ boolean access لا تكفي.",
      "Proration مع external payment تحتاج contract للتغيير والتحصيل والـlate result."
    ],
    "decisions": [
      {
        "question": "Upgrade فورية أم next cycle؟",
        "choice": "Quote توضح effective date والـcharge/credit قبل القبول.",
        "tradeoff": "Immediate access تحتاج سياسة لحين حسم فرق المبلغ."
      },
      {
        "question": "أوقف العميل عند أول failure؟",
        "choice": "Grace/restriction policy معلنة.",
        "tradeoff": "Access قرار منتج؛ status provider وحدها ليست policy كاملة."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Seat limit10 لكن اتضاف member11",
        "cause": "Quota اتقرأت قبل requestين بلاguard.",
        "fix": "احمِ quota usage وmembership creation في boundary واضحة.",
        "test": "طلبان على آخرseat؛ واحدة فقط تنجح."
      },
      {
        "symptom": "Support override بقت دائمة",
        "cause": "استثناء من غير expiry ولاaudit.",
        "fix": "Reason وvalid_until ومراقبة exceptions.",
        "test": "انتهاء override يغير access وفق policy دون حذف data."
      }
    ]
  },
  "marketplace": {
    "focus": "Split ثابتة وSeller Payout مستقلة",
    "terms": [
      {
        "term": "Seller Payable",
        "meaning": "جزء مستحق للبائع؛ gross ليست كلها إيراد المنصة."
      },
      {
        "term": "Eligibility",
        "meaning": "شروط جعل allocation قابلة للصرف مثل delivery وreserves."
      },
      {
        "term": "Settlement batch",
        "meaning": "تجميع claims محلية، وليس دليل bank settlement."
      }
    ],
    "invariants": [
      "مجموع allocations يساوي gross بنفس currency وrounding policy.",
      "Allocation لا تدخل settlement batchين.",
      "Approved payout تنفذ لنفس amount وbeneficiary version."
    ],
    "example": {
      "story": "Buyer دفع100؛ seller90 وplatform fee10. بعد delivery وreserve policy نصرف90. Refund20 بعد الصرف تستخدم split الأصلية: seller18 وfee2 إن كانت policy ترد الرسوم proportionally. دي policy المثال؛ ليست قاعدة لكل marketplace.",
      "rows": [
        {
          "step": "Sale",
          "action": "100 = seller90 + platform10.",
          "result": "Commission version محفوظة للمراجعة."
        },
        {
          "step": "Eligible",
          "action": "Delivery والشروط المطلوبة اكتملت.",
          "result": "Available90؛ pending ليست paid-out."
        },
        {
          "step": "Payout",
          "action": "Claim allocation ثم approve instruction.",
          "result": "Unknown تتطلب query/reconcile، لا payout أخرى."
        },
        {
          "step": "Refund20",
          "action": "Original split: seller18 وfee2 حسب policy.",
          "result": "Linked correction/recovery؛ لا حذف لقيد البيع."
        }
      ]
    },
    "diagram": {
      "main": [
        "Snapshot split",
        "Post seller payable",
        "Release eligibility",
        "Claim approved batch",
        "Payout & reconcile"
      ],
      "branches": [
        {
          "source": 2,
          "title": "Eligibility pending",
          "label": "hold funds",
          "detail": "لا تجعل payable قابلة للصرف قبل الشروط المتفق عليها.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Payload changed",
          "label": "re-approve",
          "detail": "تغيير amount أوbeneficiary يبطل approval القديمة.",
          "rejoin": false
        }
      ]
    },
    "code": "DB::transaction(function () use ($sellerId, $cutoff) {\n    $items = lockEligibleUnclaimedAllocations($sellerId, $cutoff);\n    $batch = createSettlementSnapshot($items);\n    foreach ($items as $item) {\n        claimAllocationOnce($item->id, $batch->id); // DB unique claim\n    }\n    bindApprovalToBatchVersion($batch);\n});\n// Execution rechecks approved version + beneficiary fingerprint.\n// Provider payout runs outside DB locks with one stable operation ID.",
    "notes": [
      "ميّز settlement حساب مستحقات عن bank settlement الخارجية.",
      "Refund allocation والـfees/ضرائب ومسؤولية التاجر تتحدد حسب contract.",
      "لو البائع صرف، correction قد تنتج receivable/reserve/loss وفق سياسة مدروسة."
    ],
    "decisions": [
      {
        "question": "أصرف فور payment success؟",
        "choice": "Release eligibility معلنة وقابلة للتدقيق.",
        "tradeoff": "تأخير الصرف يقلل risk لكنه يؤثر على seller experience."
      },
      {
        "question": "أغير commission على orders قديمة؟",
        "choice": "Rule version جديدة للمبيعات الجديدة.",
        "tradeoff": "التاريخ والـstatements يظلان قابلين للتفسير."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Net report مختلفة عن expected payout",
        "cause": "Fees أوreturn أوcutoff غير مفسرة.",
        "fix": "طابق gross/net/fee/date على مستوى العمليات.",
        "test": "Fee وتاريخcutoff مختلفان ينتجان exception مفهومة."
      },
      {
        "symptom": "Seller فتحت statement لبائع آخر",
        "cause": "Report endpoint بلا object scope.",
        "fix": "Seller/tenant policy قبل query/download.",
        "test": "بدّل seller ID؛ لا data ولاcounts تتسرب."
      }
    ]
  },
  "identity": {
    "focus": "Identity evidence ثم Object Authorization",
    "terms": [
      {
        "term": "Authentication",
        "meaning": "إثبات هوية المستخدم، وليست إذنًا لكل action."
      },
      {
        "term": "Session fixation",
        "meaning": "استمرار identifier يسيطر عليه مهاجم بعد login؛ rotation جزء من الحماية."
      },
      {
        "term": "Step-up",
        "meaning": "طلب evidence أقوى أوأحدث قبل action حساسة."
      }
    ],
    "invariants": [
      "كل protected action تتحقق من actor/object/tenant/state على السيرفر.",
      "Reset challenge محدودة بالpurpose والوقت والاستخدام الواحد.",
      "Credentials وsession secrets لا تدخل logs أوanalytics."
    ],
    "example": {
      "story": "سارة عضو Viewer في شركةA. Login نجحت لكن طلب refund لـorder فيB لازم يرفض. حتى order فيA قد تحتاج Finance role وstep-up. نجاح كلمة السر يحدد الهوية؛ policy تحدد سلطة التصرف.",
      "rows": [
        {
          "step": "Login",
          "action": "تحقق framework من password وMFA عند الطلب.",
          "result": "Rotate session ID وحدد expiry/cookie policy."
        },
        {
          "step": "Read own tenant",
          "action": "MembershipA وorderA وread policy صحيحة.",
          "result": "Data المسموح بها فقط تظهر."
        },
        {
          "step": "Cross tenant",
          "action": "سارة ترسل orderB ID صحيحًا.",
          "result": "الـlookup/policy ترفض، حتى مع session صالحة."
        },
        {
          "step": "Sensitive action",
          "action": "Refund تتطلب role وfresh authentication.",
          "result": "Viewer ترفض؛ المخوّل يكمل بشروط الـdomain."
        }
      ]
    },
    "diagram": {
      "main": [
        "Receive credentials",
        "Verify & throttle",
        "Rotate / issue session",
        "Authorize object",
        "Read / mutate safely"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Invalid credentials",
          "label": "deny safely",
          "detail": "لا session ولا كشف غير لازم لوجود الحساب.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Policy denied",
          "label": "no access",
          "detail": "الهوية الصحيحة لا تمنح ملكية أوrole غير موجودة.",
          "rejoin": false
        }
      ]
    },
    "code": "// Route layer uses the framework's appropriate auth / CSRF middleware.\n$user = $request->user();\n$tenant = resolveTenantWithVerifiedMembership($user, $request);\n$order = Order::where('tenant_id', $tenant->id)->findOrFail($orderId);\nGate::authorize('requestRefund', $order);\nrequireFreshAuthenticationIfPolicyRequires($user);\nreturn $refundService->requestFor($user, $order, $validatedInput);\n// Login rotates session IDs; recovery consumes one-time challenges.\n// Session / token choice follows client and threat boundaries.",
    "notes": [
      "Policy لا تغني عن refund budget/state guards؛ كل boundary لها مسؤولية.",
      "استخدم framework flows للـhash/session/CSRF؛ لا تكتب custom crypto.",
      "Mobile bearer وfirst-party cookie يحتاجان threat models مختلفة؛ JWT وحدها ليست القرار."
    ],
    "decisions": [
      {
        "question": "Role check في middleware كفاية؟",
        "choice": "Object policy قرب استعمال resource لازمة.",
        "tradeoff": "Role عامة لا تجيب هل order تخص هذه الشركة وهل حالتها تسمح."
      },
      {
        "question": "أخفي وجود الحساب دائمًا؟",
        "choice": "حدد uniform errors وسياسة rate/risk على التدفقات الحساسة.",
        "tradeoff": "UX والتشخيص يحتاجان توازنًا دون كشف يسهل enumeration."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Token سليمة لكن user اتوقفت",
        "cause": "تحققنا من التوقيع فقط دون status/revocation policy.",
        "fix": "حدد checks الحالية وexpiry وscope في نقطة الثقة.",
        "test": "Suspended user لا تنفذ action محظورة."
      },
      {
        "symptom": "Job قديمة نفذت بعد سحب role",
        "cause": "Actor/tenant authorization غائبة وقت التنفيذ.",
        "fix": "Policy صريحة current-vs-snapshot مع recheck للحساس.",
        "test": "Revoke membership قبل worker؛ effect تتوقف وفق contract."
      }
    ]
  },
  "tenancy": {
    "focus": "Isolation يعبر Query وCache وJob وFile",
    "terms": [
      {
        "term": "Tenant context",
        "meaning": "سياق شركة تحقق السيرفر من membership فيه، لا header موثوقة بذاتها."
      },
      {
        "term": "Namespace",
        "meaning": "تضمين tenant boundary في cache/object/search identities."
      },
      {
        "term": "Provisioning",
        "meaning": "تهيئة tenant بخطوات لها states واستعادة قبل ready."
      }
    ],
    "invariants": [
      "A لا تقرأ ولا تعدل resources لـB في أي channel.",
      "Child-parent relation لا تعبر tenant boundary.",
      "Worker تنظف context حتى بعد exception."
    ],
    "example": {
      "story": "نفس user عضو فيA وB، لكن job تصديرA لازم تخرج contactsA فقط. Worker خلصتA وبدأتB في نفس process؛ لو context singleton لم تنظف، تقريرB قد يحتويA رغم صحة request الأولى.",
      "rows": [
        {
          "step": "RequestA",
          "action": "Resolve tenantA والتحقق من membership.",
          "result": "Scope موثوق؛ لا نقل raw tenant header كصلاحية."
        },
        {
          "step": "Persist job",
          "action": "Operation تحمل tenantA وactor وquery fingerprint.",
          "result": "Export artifact key داخل namespaceA."
        },
        {
          "step": "WorkerB later",
          "action": "تهيئة tenantB من job الموثوقة ثم cleanup فيfinally.",
          "result": "لا استخدام context باقية منjobA."
        },
        {
          "step": "Download",
          "action": "Policy وقت منح الملف حسب current authority.",
          "result": "URL/report لا تتاح لمستخدمB بلا حق فيA."
        }
      ]
    },
    "diagram": {
      "main": [
        "Resolve workspace",
        "Verify membership",
        "Scope every boundary",
        "Run contextual job",
        "Clear context / audit"
      ],
      "branches": [
        {
          "source": 1,
          "title": "No membership",
          "label": "deny",
          "detail": "Client workspace selector لا يمنح الوصول.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Context mismatch",
          "label": "abort job",
          "detail": "ارفض العمل بلا tenant موثوقة، ولا تعتمد state متبقية.",
          "rejoin": false
        }
      ]
    },
    "code": "function handleTenantJob($job) {\n    $context = loadTrustedJobContext($job->operationId);\n    try {\n        TenantContext::set($context->tenantId);\n        authorizeJobAccordingToPolicy($context);\n        $rows = Contact::where('tenant_id', $context->tenantId);\n        exportIntoPrivateTenantNamespace($context, $rows);\n    } finally {\n        TenantContext::clear(); // including exceptions / retries\n    }\n}\n// TenantContext is an illustrative domain abstraction, not a Laravel built-in.",
    "notes": [
      "Global scope مساعدة؛ raw queries وreports وcache تحتاج review منفصلة.",
      "لو DB تدعم RLS، افهم connection roles/context والاختبارات؛ لا تفترض أنها تطبق تلقائيًا.",
      "Per-tenant restore وoffboarding workflows تؤثر على اختيار shared/separate storage."
    ],
    "decisions": [
      {
        "question": "Shared DB ولا DB لكلtenant؟",
        "choice": "اختيار بمتطلبات isolation/restore/scale والتكلفة.",
        "tradeoff": "Separate DB تزيد عبء migrations والتشغيل؛ shared تزيد مسؤولية leakage guards."
      },
      {
        "question": "TenantID من header؟",
        "choice": "تحدد المطلوب فقط، ثم membership verification.",
        "tradeoff": "السياق غير الموثوق قد يصبغ كل query بصلاحية مزيفة."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Invite منحت role أعلى من inviter",
        "cause": "Role grants بدون scope وpolicy.",
        "fix": "Enforce delegated grant limits وexpiry ودور محدد بالدعوة.",
        "test": "Viewer تحاول إرسالAdmin invite؛ رفض."
      },
      {
        "symptom": "Delete tenant ترك ملفاتsearch",
        "cause": "Offboarding لم تشمل projections.",
        "fix": "Lifecycle مع tombstones/cleanup وretention وexception tracking.",
        "test": "إغلاق tenant يمنع access ويتابع حذف الموارد وفق policy."
      }
    ]
  },
  "uploads": {
    "focus": "ملف خاص من Upload Intent إلى Authorized Download",
    "terms": [
      {
        "term": "Quarantine",
        "meaning": "حالة تحفظ الملف خاصًا قبل اعتماد الفحص."
      },
      {
        "term": "Object version",
        "meaning": "هوية نسخة المحتوى التي يعمل عليها processor."
      },
      {
        "term": "Derivative",
        "meaning": "مخرج مثل thumbnail مرتبط بالنسخة والـpipeline."
      }
    ],
    "invariants": [
      "Uploaded لا تساوي ready.",
      "Output قديمة لا تعتمد فوق نسخة أحدث.",
      "Authorization تشمل الأصل وكل المشتقات."
    ],
    "example": {
      "story": "فاتورة PDF خاصة ترفع إلى storage. Scanner تتعطل؛ الملف يظل private processing. بعد retry ناجحة يعتمد نفس object version، لكن مستخدم tenant أخرى لا يقدر ينزله لمجرد معرفة ID.",
      "rows": [
        {
          "step": "Intent",
          "action": "PDF بحد10MB وrandom key تخص tenantA.",
          "result": "Upload capability محدودة بالسياسة."
        },
        {
          "step": "Arrival",
          "action": "تحقق من object metadata والنسخة.",
          "result": "Quarantined؛ client callback لا تثبت السلامة."
        },
        {
          "step": "Process",
          "action": "Scanner وdecoder بميزانية CPU/memory/time.",
          "result": "Retry على نفس النسخة؛ لا نشر لمخرجات قديمة."
        },
        {
          "step": "Download",
          "action": "اعتمد ready ثم نفذ object policy.",
          "result": "Signed access قصيرة العمر؛ لا public bucket افتراضية."
        }
      ]
    },
    "diagram": {
      "main": [
        "Authorize intent",
        "Verify object",
        "Inspect / transform",
        "Approve version",
        "Authorize download"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Metadata mismatch",
          "label": "reject",
          "detail": "المفتاح والحجم والنوع يجب أن يوافقوا السياسة، وMIME وحدها لا تكفي.",
          "rejoin": false
        },
        {
          "source": 2,
          "title": "Scan unavailable / rejected",
          "label": "keep private",
          "detail": "الفشل التشغيلي يعاد بأمان؛ المحتوى المرفوض لا يصبح ready.",
          "rejoin": false
        }
      ]
    },
    "code": "$intent = createAuthorizedUploadIntent($actor, $tenant, $policy);\n$object = verifyUploadedObject($intent); // storage is outside the DB\n$result = inspectWithResourceLimits($object, $pipelineVersion);\nDB::transaction(function () use ($object, $result) {\n    $file = lockFileMetadata($object->fileId);\n    assertCurrentObjectAndPipelineVersion($file, $object, $result);\n    publishReadyMetadataOrReject($file, $result);\n});\n// Every download still authorizes file / tenant / actor.",
    "notes": [
      "الكود sketch؛ اختيار scanner وparser يتبع نوع الملف والمخاطر.",
      "Signed URL تمنح capability حتى expiry وفق عقد المزود؛ لا تعتبر revoke الجلسة إلغاء فوريًا لها.",
      "Object storage وDB ليست commit واحدة؛ يلزم orphan/stuck operation recovery."
    ],
    "decisions": [
      {
        "question": "Direct أم عبر app server؟",
        "choice": "الحجم والتكامل يحددان الطريق مع intent وحماية في الحالتين.",
        "tradeoff": "Direct يقلل bandwidth لكنه يحتاج completion verification."
      },
      {
        "question": "SVG مسموحة؟",
        "choice": "حدد active content policy وسياق serving آمن.",
        "tradeoff": "الامتداد image لا يساوي bitmap آمنة للتنفيذ أو العرض."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Processor قديمة اعتمدت ملفًا جديدًا بالخطأ",
        "cause": "نفس key استُخدمت بلا version guard.",
        "fix": "Opaque/versioned keys وCAS على metadata.",
        "test": "V2 ترفع ثم V1 تنتهي؛ لا تعتمد V1."
      },
      {
        "symptom": "الحذف ترك thumbnail عامة",
        "cause": "Privacy طُبقت على الأصل فقط.",
        "fix": "كل derivatives تشترك في ACL وretention lifecycle.",
        "test": "راجع وصول الأصل والمشتقات بعد deletion request."
      }
    ]
  },
  "notifications": {
    "focus": "من Business Event إلى Intent وتسليم قابل للمراقبة",
    "terms": [
      {
        "term": "Intent",
        "meaning": "نية رسالة واحدة لكل event/recipient/channel/purpose."
      },
      {
        "term": "Accepted",
        "meaning": "المزود قبل طلب الإرسال؛ ليست delivered."
      },
      {
        "term": "Suppression",
        "meaning": "قرار يمنع channel/category لسبب موثق."
      }
    ],
    "invariants": [
      "لا رسالة تؤكد domain change اتعمله rollback.",
      "Intent identity ثابتة في retries.",
      "Delivery evidence لا تعيد الحالة للخلف."
    ],
    "example": {
      "story": "Order77 تتأكد وتحفظ outbox. Worker ترسل receipt؛ المزود ينفذ ثم الرد يضيع. نسجل unknown ونطبق عقد المزود للاستعلام أو التكرار، بدل إنشاء email جديدة لمجرد timeout.",
      "rows": [
        {
          "step": "Commit",
          "action": "Confirmed order مع outbox event.",
          "result": "لا email قبل commit؛ العمل قابل للاستعادة."
        },
        {
          "step": "Decide",
          "action": "Receipt category وlocale وpreferences.",
          "result": "Intent فريدة للغرض والمستلم والقناة."
        },
        {
          "step": "Submit",
          "action": "Provider accepted ثم connection reset.",
          "result": "Unknown؛ لا وعد exactly-once بلا contract."
        },
        {
          "step": "Evidence",
          "action": "Verified delivered أوbounce callback.",
          "result": "State محددة؛ missing callback لا تعني resend تلقائية."
        }
      ]
    },
    "diagram": {
      "main": [
        "Commit event",
        "Claim intent",
        "Apply preferences",
        "Submit channel",
        "Record evidence"
      ],
      "branches": [
        {
          "source": 2,
          "title": "Suppressed",
          "label": "stop channel",
          "detail": "Marketing وsecurity لهما policy مختلفة؛ لا boolean واحدة لكل الرسائل.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Outcome unknown",
          "label": "query / review",
          "detail": "Local uniqueness لا تتحكم في provider؛ وثّق حدود التكرار.",
          "rejoin": true,
          "target": 4
        }
      ]
    },
    "code": "DB::transaction(function () use ($order) {\n    confirmOrder($order);\n    writeOutboxOnce('order-confirmed:'.$order->id);\n});\n// Outside the domain transaction:\n$intent = claimDeliveryIntent($event, $recipient, $channel, $purpose);\napplyCategoryPreferencesAndSuppression($intent);\n$result = $provider->submit($intent->stableReference, renderSafely($intent));\nrecordAcceptedOrUnknown($intent, $result);\n// Delivered / bounced require later trusted evidence.",
    "notes": [
      "AfterCommit لا تساوي durable outbox لكل crash window؛ اشرح الفجوة التي تحميها.",
      "Provider بدون dedupe/query قد تسمح بتكرار خارجي عند timeout؛ لا تعد بضمان غير موجود.",
      "OTP TTL تظل نافذة حتى في queued retries، ولا تسجل أسرارها."
    ],
    "decisions": [
      {
        "question": "أعيد كل failure؟",
        "choice": "صنّف transient/permanent وحدد backoff وretry budget.",
        "tradeoff": "Hard bounce لا يعالجها إرسال متكرر؛ suppression تمنع spam."
      },
      {
        "question": "Fallback SMS فوري؟",
        "choice": "حدد سياسة التكلفة والازدواج والـTTL.",
        "tradeoff": "غياب email receipt لا يثبت عدم وصول الرسالة."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Campaign عميل عطلت receipts الباقي",
        "cause": "لا fairness ولا rate budgets لكل category/tenant.",
        "fix": "Bounded parallelism وجدولة مناسبة مع queue-age metrics.",
        "test": "Campaign كبيرة مع receipts؛ راقب latency لكل فئة."
      },
      {
        "symptom": "Retry خرجت بلغة أوtemplate مختلفة بلا تفسير",
        "cause": "قرأنا metadata متغيرة بلا version contract.",
        "fix": "Store locale/template version وقرار re-render موثق.",
        "test": "غيّر template أثناء retry؛ تعرف أي نسخة أُرسلت ولماذا."
      }
    ]
  },
  "search": {
    "focus": "Query Contract وCursor ثم Eventual Search Projection",
    "terms": [
      {
        "term": "Tie-breaker",
        "meaning": "جزء unique من sort يمنع غموض ترتيب القيم المتساوية."
      },
      {
        "term": "Cursor",
        "meaning": "موضع في query محددة؛ ليست permission ولا snapshot تلقائيًا."
      },
      {
        "term": "Tombstone",
        "meaning": "دليل حذف له version يمنع old update من إعادة document."
      }
    ],
    "invariants": [
      "Visibility وtenant constraints تفرض قبل pagination/count.",
      "الترتيب له unique tie-breaker.",
      "Old index event لا تكتب فوق version أحدث."
    ],
    "example": {
      "story": "عندنا contacts بنفس created_at. Page1 تنتهي عند tuple(time,id=80). Page2 تطلب ما بعد tuple، مع نفس filters وsort وtenant. تغيير record بين الصفحات قد يغيّر النتائج؛ لو عايز export ثابتة تحتاج snapshot policy.",
      "rows": [
        {
          "step": "Contract",
          "action": "Allowlist للfilters/sort وحد page_size.",
          "result": "لا raw column name من client."
        },
        {
          "step": "Sort",
          "action": "created_at DESC ثم id DESC.",
          "result": "ترتيب deterministic للقيم المتساوية."
        },
        {
          "step": "Page",
          "action": "Seek على كامل tuple مع tenant predicate.",
          "result": "Cursor مرتبطة بالquery؛ لا offset عميقة بلا قياس."
        },
        {
          "step": "Action",
          "action": "Customer تختار منتجًا من index قديمة.",
          "result": "Checkout تقرأ price/stock من source of truth قبل القبول."
        }
      ]
    },
    "diagram": {
      "main": [
        "Validate query",
        "Enforce visibility",
        "Fetch ordered page",
        "Validate sensitive action",
        "Sync versioned index"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Invalid query / cursor",
          "label": "reject",
          "detail": "Filter/sort allowlist وquery fingerprint؛ cursor ليست access grant.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Source changed",
          "label": "conflict / refresh",
          "detail": "لا تعتمد price أوstock القديمة من search لاتخاذ قرار بيع.",
          "rejoin": false
        }
      ]
    },
    "code": "$query = Contact::where('tenant_id', $trustedTenantId);\napplyAllowedFilters($query, $validatedFilters);\n$query->orderByDesc('created_at')->orderByDesc('id');\nif ($cursor) {\n    assertCursorMatchesQuery($cursor, $queryFingerprint);\n    $query->where(function ($q) use ($cursor) {\n        $q->where('created_at', '<', $cursor->time)\n          ->orWhere(fn ($s) => $s->where('created_at', $cursor->time)\n                                ->where('id', '<', $cursor->id));\n    });\n}\nreturn boundedPage($query, $pageSize); // not a snapshot by itself",
    "notes": [
      "SQL sketch تفترض non-null sort columns وترتيبًا ثابتًا؛ تعامل مع nullable/mutable fields صراحة.",
      "Index مركبة تتحدد من query plan والworkload، لا من الكود وحده.",
      "Rebuild وdelete ordering والtenant filters لازمة حتى مع search provider جاهزة."
    ],
    "decisions": [
      {
        "question": "SQL أم search engine؟",
        "choice": "ابدأ relevance/latency requirements وقِس SQL أولًا.",
        "tradeoff": "Search engine تضيف ranking وقدرات مع sync/rebuild cost."
      },
      {
        "question": "Exact totals ضرورية؟",
        "choice": "قرار UX مقابل query cost وconsistency.",
        "tradeoff": "لا تنفذ count مكلفة بلا حاجة أوتسرب hidden records."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Search leaked private count",
        "cause": "Visibility filter حصلت بعد جلب النتائج.",
        "fix": "القيود داخل query نفسها قبل counts/pages.",
        "test": "مستخدم محدود لا يرى عدد records المحظورة."
      },
      {
        "symptom": "Deep page عطلت الخدمة",
        "cause": "Page size وoffset بلا bounds.",
        "fix": "Limits وseek/PIT حسب الحاجة، ثم query plan وload test.",
        "test": "اختبر أقصى query مسموحة بtraffic واقعية."
      }
    ]
  },
  "bulk-data": {
    "focus": "Streaming وCheckpoints متسقة مع Committed Effects",
    "terms": [
      {
        "term": "Checkpoint",
        "meaning": "موضع استكمال مرتبط بما تم commit فعليًا."
      },
      {
        "term": "Staging",
        "meaning": "داتا مؤقتة للفحص أوpublish قبل visibility النهائية."
      },
      {
        "term": "Provenance",
        "meaning": "رابط يفسر مصدر row والتغيير لتتبع أوundo مدروس."
      }
    ],
    "invariants": [
      "Retry chunk لا تكرر business row/effect.",
      "Progress مبنية على committed results.",
      "Cancel لا تعني undo تلقائيًا لما تم commit."
    ],
    "example": {
      "story": "CSV فيها100ألف contact. Chunk500 صف؛ بعد commit أول500 worker وقعت قبل ACK. Retry لنفس chunk تستخدم row identities وcheckpoint المتسقة، فلا تضيف أول500 ثانية. Cancel بعد1000 تظهر partial completion بصدق.",
      "rows": [
        {
          "step": "Accept",
          "action": "Operation لها tenant/schema/mode/key.",
          "result": "HTTP قصيرة وترجع status URL."
        },
        {
          "step": "Validate",
          "action": "Stream headers والrows إلى staging/results.",
          "result": "Memory محدودة وerrors برقم المصدر."
        },
        {
          "step": "Commit chunk",
          "action": "Domain writes وrow results/checkpoint متسقة.",
          "result": "Crash/replay لا تضيف effects ثانية."
        },
        {
          "step": "Complete / cancel",
          "action": "Counts من committed results وartifact private.",
          "result": "Cancel توقف الآتي؛ undo عملية وسياسة مستقلة."
        }
      ]
    },
    "diagram": {
      "main": [
        "Create operation",
        "Stream & validate",
        "Commit bounded chunk",
        "Persist checkpoint",
        "Publish result"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Schema / row invalid",
          "label": "report policy",
          "detail": "احسم all-or-nothing أوpartial، ولا تبدأ writes غير مفهومة.",
          "rejoin": false
        },
        {
          "source": 2,
          "title": "Worker crash",
          "label": "resume safely",
          "detail": "Row identity وcheckpoint atomicity تحددان كيف تعاد نفس chunk بلا تكرار.",
          "rejoin": false
        }
      ]
    },
    "code": "foreach (streamValidatedChunks($source, 500) as $chunk) {\n    DB::transaction(function () use ($operation, $chunk) {\n        lockChunkCheckpoint($operation->id, $chunk->identity);\n        foreach ($chunk->rows as $row) {\n            if (rowAlreadyCommitted($operation, $row->sourceIdentity)) continue;\n            applyAuthorizedDomainUpsert($operation, $row);\n            recordCommittedRowResult($operation, $row);\n        }\n        advanceCheckpointFromCommittedRows($operation, $chunk);\n    });\n    stopAtBoundaryIfCancellationRequested($operation);\n}",
    "notes": [
      "Helpers هنا design contracts؛ business unique keys وsource-row identity مختلفتان وقد تحتاجهما معًا.",
      "لو processing parallel أوformat معقد، صمم chunk identity/resume offsets بدل الاعتماد على loop counter فقط.",
      "All-or-nothing visibility تحتاج staging/publish strategy؛ لا transaction عملاقة مفتوحة على كل الملف."
    ],
    "decisions": [
      {
        "question": "Partial أم atomic visibility؟",
        "choice": "وثق سياسة الأخطاء أولًا، ثم اختر staging/publish أوpartial results.",
        "tradeoff": "كل اختيار له تكلفة في UX وrecovery والتعامل مع العلاقات."
      },
      {
        "question": "Export snapshot أم live؟",
        "choice": "حدد consistency contract ومصدر watermark/snapshot.",
        "tradeoff": "Pagination وحدها لا تثبت dataset أمام concurrent changes."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Progress100% لكن آخرrows لم تحفظ",
        "cause": "Checkpoint تقدمت قبل commit.",
        "fix": "Progress من committed effects ونتائج قابلة للمطابقة.",
        "test": "Crash في آخرchunk لا تعطي completed كاذبة."
      },
      {
        "symptom": "تقرير اتنزّل بعد سحب صلاحية user",
        "cause": "Access grant طويل بلا policy عند التنزيل.",
        "fix": "Private artifact وexpiry وإعادة authorization حسب contract.",
        "test": "Revoke قبل download؛ يتبع قرار السياسة ولا يتسرب الملف."
      }
    ]
  },
  "approvals": {
    "focus": "Approval على نسخة محددة وتنفيذ واحد قابل للاستعادة",
    "terms": [
      {
        "term": "Maker–checker",
        "meaning": "فصل طلب الإجراء عن اعتماده حسب سياسة المخاطر."
      },
      {
        "term": "Fingerprint",
        "meaning": "هوية محتوى parameters المقبولة، لا مجرد request ID."
      },
      {
        "term": "Execution intent",
        "meaning": "نية تنفيذ واحدة مستقلة عن عدد موافقات reviewers."
      }
    ],
    "invariants": [
      "Approved version/fingerprint تطابق ما سينفذ.",
      "Policy separation/quorum تُفرض server-side.",
      "لكل approved action execution identity واحدة."
    ],
    "example": {
      "story": "Maker يطلب refund500 على order77 version3. Checker تعتمدv3، ثم يحاول شخص تعديل المبلغ5000. Execute ترفض لأن fingerprint/version لم تعتمدا؛ التعديل يحتاج submission/review جديدة.",
      "rows": [
        {
          "step": "Submit",
          "action": "Freeze action وamount وbeneficiary وpolicy version.",
          "result": "Reviewer ترى النسخة المحددة."
        },
        {
          "step": "Decide",
          "action": "Eligible checker تعتمدv3 مع reason.",
          "result": "Maker لا تعتمد نفسها إذا السياسة تمنع."
        },
        {
          "step": "Mutate",
          "action": "Amount تغير500 إلى5000.",
          "result": "v4 غير approved؛ approvalv3 لا تنطبق."
        },
        {
          "step": "Execute",
          "action": "Current/approved version check قبل claim effect.",
          "result": "مخالفة ترفض؛ replay لنفس التنفيذ تعيد نتيجته."
        }
      ]
    },
    "diagram": {
      "main": [
        "Submit frozen version",
        "Review eligible policy",
        "Approve exact version",
        "Claim one execution",
        "Confirm / audit result"
      ],
      "branches": [
        {
          "source": 1,
          "title": "Reviewer ineligible",
          "label": "deny decision",
          "detail": "الدور والمبلغ وmaker-checker/quorum شروط داخل السيرفر.",
          "rejoin": false
        },
        {
          "source": 3,
          "title": "Version mismatch",
          "label": "new review",
          "detail": "لا تنفذ parameters لم تعتمد؛ لا تعتمد current form فقط.",
          "rejoin": false
        }
      ]
    },
    "code": "DB::transaction(function () use ($requestId) {\n    $request = ApprovalRequest::lockForUpdate()->findOrFail($requestId);\n    assertApprovedVersionAndFingerprintMatch($request);\n    assertCurrentExecutionAuthorityAndDomainGuards($request);\n    $execution = claimExecutionOnce($request->id, $request->approvedVersion);\n    if ($execution->hasResult()) return $execution->result;\n    writeExecutionIntentAndOutbox($request, $execution);\n});\n// Provider work outside locks; unknown outcome resolves the SAME execution.\n// A successful action is corrected by a new linked operation, not history edits.",
    "notes": [
      "الفصل بين decision وexecution يمنع أن تتحول كل موافقة إلى أثر مالي مستقل.",
      "Binding يشمل beneficiary/version والcurrency والسبب/المستندات اللازمة حسب policy.",
      "Audit ليس بديلًا عن ledger أوreconciliation؛ لكل واحد دليل مختلف."
    ],
    "decisions": [
      {
        "question": "Dynamic policy أم snapshot؟",
        "choice": "حدد ما يُثبت وقت submission وما يعاد فحصه وقت التنفيذ.",
        "tradeoff": "مطلوب تفسير أي policy change أوrevocation أثناء انتظار المراجعة."
      },
      {
        "question": "أعيد request بعد timeout؟",
        "choice": "نفس execution identity مع query/reconcile.",
        "tradeoff": "Approved لا تعني failed أوsucceeded؛ external evidence منفصلة."
      }
    ],
    "extraProblems": [
      {
        "symptom": "Expiry حصلت أثناء review",
        "cause": "حساب الوقت خارج transition guard.",
        "fix": "Deadline/state guard داخل القرار الذري.",
        "test": "Approve معexpire؛ لا تنفيذ لنسخة منتهية."
      },
      {
        "symptom": "Support زر Force Success أخفى mismatch",
        "cause": "Status edit سمحت بتجاوز evidence.",
        "fix": "Safe resolution commands بدليل وapproval عند الحاجة.",
        "test": "لا يمكن إعلان success دون external/local proof المطلوب."
      }
    ]
  }
};
