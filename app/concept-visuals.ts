export const conceptVisuals:Record<string,string[]> = {
  "php-types": [
    "Runtime value can change",
    "Declarations define boundaries",
    "Caller controls strict coercion",
    "Validate external input"
  ],
  "arrays-values": [
    "PHP array is ordered map",
    "Copy-on-write value behavior",
    "References alias variable storage",
    "Strict comparison checks type"
  ],
  "closures": [
    "Capture lexical context",
    "use captures by value",
    "use (&x) captures reference",
    "Arrow captures automatically"
  ],
  "generators": [
    "Yield values lazily",
    "Consumer advances iteration",
    "Lower materialization memory",
    "Source may still buffer data"
  ],
  "enums": [
    "Finite named cases",
    "Backed scalar representation",
    "Validate input with tryFrom",
    "Guard allowed state changes"
  ],
  "errors": [
    "Specific integration failure",
    "Map to domain error",
    "Safe HTTP boundary response",
    "Sanitized logs + correlation"
  ],
  "immutability": [
    "Value object has invariants",
    "Construct a valid value",
    "Return a new changed value",
    "No hidden shared mutation"
  ],
  "unicode": [
    "Bytes differ from characters",
    "Code points differ from graphemes",
    "Choose UTF-aware operations",
    "Normalize only by contract"
  ],
  "composer": [
    "Dependency constraints",
    "Lock exact resolutions",
    "PSR-4 class mapping",
    "Review updates and provenance"
  ],
  "abstraction": [
    "Expose relevant behavior",
    "Hide unnecessary detail",
    "Choose consumer vocabulary",
    "Preserve semantic guarantees"
  ],
  "interfaces": [
    "Consumer-facing contract",
    "Multiple implementations",
    "Inject dependency explicitly",
    "Verify behavior beyond types"
  ],
  "abstract-class": [
    "Shared base implementation",
    "Abstract extension points",
    "Single class inheritance",
    "Avoid forced bad hierarchy"
  ],
  "encapsulation": [
    "Protect valid object state",
    "Expose intentional commands",
    "Enforce local invariants",
    "Do not leak mutable internals"
  ],
  "solid": [
    "Reasons for change",
    "Substitution and small contracts",
    "Depend on abstractions",
    "Choose principles by problem"
  ],
  "polymorphism": [
    "One consumer contract",
    "Different valid behaviors",
    "Substitute without surprises",
    "Composition can avoid hierarchy"
  ],
  "lifecycle": [
    "Entry + bootstrap",
    "Providers and middleware",
    "Route + controller logic",
    "Response + termination work"
  ],
  "container": [
    "Declare constructor dependency",
    "Register binding / lifetime",
    "Resolve object graph",
    "Reset scoped mutable state"
  ],
  "validation": [
    "Validate shape and format",
    "Authorize requested action",
    "Apply domain rules",
    "Enforce DB constraints too"
  ],
  "relationships": [
    "Model relation cardinality",
    "Load required relations",
    "Avoid N+1 query loops",
    "Preserve ownership boundaries"
  ],
  "scopes-casts": [
    "Reusable query predicate",
    "Local / global scope limits",
    "Cast storage representation",
    "Domain rules remain explicit"
  ],
  "auth-policy": [
    "Prove identity",
    "Resolve object and tenant",
    "Authorize action and state",
    "Audit sensitive effects"
  ],
  "queues": [
    "Persist work intent",
    "Worker executes later",
    "Retry under stable identity",
    "Observe failures and backlog"
  ],
  "events": [
    "A fact already happened",
    "Listeners have own concerns",
    "Commit before publishing effects",
    "Handle repeated delivery"
  ],
  "cache": [
    "Derive from source of truth",
    "Choose key + TTL",
    "Invalidate on change",
    "Never trust stale spend balance"
  ],
  "sessions": [
    "Opaque client identifier",
    "Server-side session state",
    "Rotate on privilege change",
    "Expire / revoke safely"
  ],
  "storage": [
    "Authorize upload intent",
    "Private stored object",
    "Process versioned content",
    "Authorize every download"
  ],
  "localization": [
    "Choose explicit locale",
    "Translate messages and formats",
    "Keep stored meaning stable",
    "Do not infer timezone blindly"
  ],
  "artisan": [
    "Intentional command contract",
    "Safe repeated execution",
    "Scheduler overlap policy",
    "Log result and run identity"
  ],
  "deploy": [
    "Build exact source version",
    "Expand compatible schema",
    "Roll out observable change",
    "Plan code + data recovery"
  ],
  "http": [
    "Method and status semantics",
    "Headers and representation",
    "Intermediaries and caching",
    "Timeout is uncertain outcome"
  ],
  "rest-api": [
    "Name resources and commands",
    "Validate + authorize inputs",
    "Stable response/error contract",
    "Paginate and evolve safely"
  ],
  "sql-indexes": [
    "Match predicate and sort",
    "Read execution plan",
    "Balance read and write cost",
    "Measure real workload"
  ],
  "transactions": [
    "Atomic local writes",
    "Isolation controls visibility",
    "Locks / constraints guard races",
    "External systems stay outside"
  ],
  "race": [
    "Two actors read same state",
    "Both choose a conflicting write",
    "Shared guard serializes decision",
    "Replay still needs identity"
  ],
  "idempotency": [
    "Stable operation identity",
    "Bind payload fingerprint",
    "Claim and persist once",
    "Return existing operation result"
  ],
  "outbox": [
    "Commit domain + event together",
    "Worker delivers persisted intent",
    "Consumer handles duplicates",
    "Recover after every crash window"
  ],
  "security": [
    "Identify assets and threats",
    "Enforce trust boundaries",
    "Limit privileges and input",
    "Test abuse and observe safely"
  ],
  "testing": [
    "State the observable contract",
    "Choose realistic boundary",
    "Exercise failure and concurrency",
    "Assert outcomes not internals"
  ],
  "observability": [
    "Logs explain a request",
    "Metrics show distributions",
    "Traces connect boundaries",
    "Alerts map to recovery actions"
  ],
  "architecture": [
    "Domain responsibility",
    "Data ownership boundary",
    "Consistency needs",
    "Trade-off and operating cost"
  ],
  "ai": [
    "Give bounded task context",
    "Inspect proposed changes",
    "Verify evidence and behavior",
    "Protect secrets and ownership"
  ],
  "big-o": [
    "Choose input size n",
    "Count dominant growth",
    "Separate time and space",
    "Validate constants by measurement"
  ],
  "hash-maps": [
    "Compute key hash",
    "Locate bucket / entry",
    "Handle collisions correctly",
    "Expected lookup is not worst-case"
  ],
  "two-pointers": [
    "Define ordered scan invariant",
    "Move one or both indexes",
    "Avoid redundant comparisons",
    "Prove termination and coverage"
  ],
  "sliding-window": [
    "Maintain contiguous range",
    "Add next element",
    "Shrink while rule breaks",
    "Track answer from valid window"
  ],
  "stack-queue": [
    "Stack uses LIFO",
    "Queue uses FIFO",
    "Choose ordering by problem",
    "Implementation affects operation cost"
  ],
  "binary-search": [
    "Sorted or monotonic domain",
    "Maintain answer interval",
    "Eliminate a safe half",
    "Handle boundaries and termination"
  ],
  "graphs": [
    "Vertices + edges",
    "Traversal frontier",
    "Visited / cycle policy",
    "Representation controls complexity"
  ],
  "dynamic-programming": [
    "Define subproblem state",
    "Write recurrence",
    "Reuse overlapping results",
    "Order computation + base cases"
  ],
  "strategy-adapter": [
    "Strategy selects behavior",
    "Adapter translates boundary",
    "Consumer depends on contract",
    "Do not wrap without need"
  ],
  "observer-decorator": [
    "Observer reacts to a fact",
    "Decorator wraps behavior",
    "Choose explicit execution order",
    "Beware hidden side effects"
  ],
  "process-lifetimes": [
    "Request lifetime",
    "Long-running worker lifetime",
    "Mutable state can survive",
    "Scope and reset dependencies"
  ],
  "requirements": [
    "Actor goal and scope",
    "Functional behavior",
    "Quality attributes and limits",
    "Measurable acceptance criteria"
  ],
  "specification": [
    "Preconditions",
    "Postconditions",
    "Invariants",
    "Failure and recovery contract"
  ],
  "correctness": [
    "State a claim precisely",
    "Define assumptions",
    "Prove preserved invariant",
    "Test counterexamples and limits"
  ],
  "math-reasoning": [
    "Units and dimensional checks",
    "Sets and inclusion",
    "Probability assumptions",
    "Estimate magnitude before tools"
  ],
  "os-processes": [
    "Process address space",
    "Threads share process memory",
    "Scheduler interleaves work",
    "Synchronization protects shared state"
  ],
  "memory-io": [
    "Allocation and object lifetime",
    "CPU work versus I/O wait",
    "Buffering and backpressure",
    "Measure memory high-water mark"
  ],
  "async-synchronization": [
    "Concurrency interleaves work",
    "Parallelism runs simultaneously",
    "Locks / atomics guard state",
    "Async does not imply race safety"
  ],
  "network-transport": [
    "Name resolves to address",
    "Connection and TLS boundary",
    "Request can lose its response",
    "Retry needs business identity"
  ],
  "dns-routing": [
    "DNS answer can be cached",
    "Proxy routes a request",
    "Load balancer selects target",
    "Timeout budgets span hops"
  ],
  "relational-model": [
    "Entities and relations",
    "Keys define identity",
    "Constraints preserve relationships",
    "Normalization models dependencies"
  ],
  "storage-indexes": [
    "Pages hold stored records",
    "Index narrows access path",
    "Covering / order can help reads",
    "Writes maintain every index"
  ],
  "mvcc-recovery": [
    "Versions control visibility",
    "Isolation defines anomalies",
    "Write-ahead recovery evidence",
    "Locks / conflicts still matter"
  ],
  "coupling-cohesion": [
    "Keep related rules together",
    "Expose narrow boundaries",
    "Avoid needless dependencies",
    "Measure change impact"
  ],
  "domain-modeling": [
    "Use a shared vocabulary",
    "Identify invariants",
    "Choose aggregate boundaries",
    "Separate model from persistence"
  ],
  "message-semantics": [
    "Delivery may repeat",
    "Processing can fail midway",
    "Dedupe transport and effect",
    "Ordering needs explicit scope"
  ],
  "consistency-models": [
    "Choose required observation",
    "Strong local guard where needed",
    "Lagging projections elsewhere",
    "Explain stale and conflict behavior"
  ],
  "sagas": [
    "Local commit per step",
    "Persist workflow progress",
    "External failures remain possible",
    "Compensate with business operations"
  ],
  "slo-error-budgets": [
    "User-visible SLI",
    "Target over a time window",
    "Allowed failure budget",
    "Alert on actionable burn"
  ],
  "capacity-planning": [
    "Estimate arrival rate",
    "Measure service time",
    "Bound queues and utilization",
    "Load test realistic bottlenecks"
  ],
  "resilience": [
    "Set deadlines",
    "Bound retries with jitter",
    "Isolate overload and failure",
    "Recover and reconcile safely"
  ],
  "test-design": [
    "Risk and invariant first",
    "Unit / integration boundaries",
    "Failure injection and properties",
    "Readable behavioral evidence"
  ],
  "ci-release": [
    "Reproducible build",
    "Checks before publication",
    "Compatible schema evolution",
    "Observe rollout and recover"
  ],
  "crypto-basics": [
    "Hash for one-way verification",
    "Encrypt with managed keys",
    "Authenticate integrity and origin",
    "Do not invent algorithms"
  ],
  "privacy-retention": [
    "Collect necessary data",
    "Limit access and purpose",
    "Retain for explicit reasons",
    "Delete across derived copies"
  ],
  "data-contracts": [
    "Meaning beyond JSON shape",
    "Version compatibility",
    "Precision / units / null policy",
    "Validate at producer and consumer"
  ],
  "time-numerics": [
    "Instant differs from timezone",
    "Wall clock differs from duration",
    "Money has currency and scale",
    "Define rounding and expiry rules"
  ],
  "adr-communication": [
    "Context and constraint",
    "Decision and alternatives",
    "Consequences and evidence",
    "Revisit when assumptions change"
  ],
  "engineering-judgment": [
    "Clarify uncertainty",
    "Choose proportionate design",
    "Verify high-risk assumptions",
    "Own production consequences"
  ],
  "booking-holds": [
    "Shared resource guard",
    "Temporary owner + expiry",
    "Confirm only valid ownership",
    "Late pay must not steal capacity"
  ],
  "booking-overlap": [
    "Half-open time ranges",
    "UTC instant + local timezone",
    "Enforce overlap at stable guard",
    "Reschedule as protected swap"
  ],
  "payment-lifecycle": [
    "Intent / operation / attempt",
    "Authorization and capture differ",
    "Settlement is another stage",
    "Refund / dispute stay separate"
  ],
  "webhook-inbox": [
    "Verify original raw body",
    "Persist durable event identity",
    "Apply business effect once",
    "Resolve missing / old evidence"
  ],
  "ledger-double-entry": [
    "Account normal side matters",
    "Balanced entries per currency",
    "Atomic immutable posting",
    "Correction is a new journal"
  ],
  "wallet-balances": [
    "Posted ledger balance",
    "Separate active holds",
    "Available = posted minus holds",
    "Capture removes hold + posts once"
  ],
  "ledger-posting": [
    "Authorize accounts and amounts",
    "Lock / version current balance",
    "Guard available funds",
    "Commit journal + projection + outbox"
  ],
  "wallet-transfer": [
    "Stable transfer identity",
    "Lock accounts in fixed order",
    "Debit A liability / credit B",
    "Reversal has its own funds policy"
  ],
  "payout-reconciliation": [
    "Wallet to payout payable",
    "Provider submission outside locks",
    "Unknown stays unavailable",
    "Match settlement and bank returns"
  ],
  "topup-chargeback": [
    "Funding operation",
    "Explicit availability policy",
    "Credit and settlement evidence",
    "Chargeback after spend is a case"
  ],
  "pricing-snapshot": [
    "Server quote + expiry",
    "Accepted line allocations",
    "Immutable order price version",
    "Refund uses original breakdown"
  ],
  "inventory-reservation": [
    "On-hand versus reserved",
    "Guard SKU / location capacity",
    "Hold owns quantity until expiry",
    "Allocate / release exactly once"
  ],
  "coupon-contention": [
    "Eligibility rule",
    "Global and customer limits",
    "Atomic usage reservation",
    "Consume / release by state"
  ],
  "refund-allocation": [
    "Captured amount",
    "Successful plus reserved refunds",
    "Guard remaining refundable",
    "Allocate original line price"
  ],
  "fulfillment-returns": [
    "Line quantities",
    "Shipment and delivery evidence",
    "RMA receipt and inspection",
    "Restock differs from refund"
  ],
  "subscription-entitlement": [
    "Contract and plan version",
    "Invoice for one period",
    "Verified paid-period evidence",
    "Access follows entitlement policy"
  ],
  "marketplace-settlement": [
    "Snapshot gross / fee / net",
    "Pending seller payable",
    "Eligibility and batch claim",
    "Payout is a separate workflow"
  ],
  "admin-approvals": [
    "Freeze requested parameters",
    "Eligible maker / checker",
    "Bind approval to version",
    "One authorized execution effect"
  ],
  "workflow-state-contract": [
    "Current state + event",
    "Actor + business guard",
    "Atomic next state + effects",
    "Duplicate / invalid transition policy"
  ],
  "currency-fx-fees": [
    "Money amount + currency",
    "Explicit quote and fee expiry",
    "Round under documented rules",
    "Balance ledger per currency"
  ],
  "feature-template": [
    "Define promise and actors",
    "State and enforce invariants",
    "Design failure and recovery",
    "Prove with tests and operations"
  ],
  "business-idempotency": [
    "Client request key",
    "Provider operation reference",
    "Transport event identity",
    "Semantic business effect uniqueness"
  ]
};
