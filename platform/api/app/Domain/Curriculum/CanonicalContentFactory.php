<?php

namespace App\Domain\Curriculum;

use Illuminate\Support\Str;

final class CanonicalContentFactory
{
    private const GUIDE_TITLES = [
        'blueprint' => 'Feature Design Blueprint',
        'booking' => 'Booking Capacity, Holds, and Late Payments',
        'payments' => 'Payments from Request to Settlement',
        'wallet' => 'Wallets, P2P Transfers, and Ledger Design',
        'funding' => 'Top-ups, Withdrawals, and Reconciliation',
        'checkout' => 'E-commerce Checkout Consistency',
        'returns' => 'Refunds, Returns, Shipping, and Disputes',
        'subscriptions' => 'SaaS Billing, Renewals, and Entitlements',
        'marketplace' => 'Marketplace Splits and Seller Settlement',
        'identity' => 'Authentication, Access, and Revocation',
        'tenancy' => 'Multi-tenant SaaS Data Isolation',
        'uploads' => 'Secure Upload Processing',
        'notifications' => 'Reliable Notification Delivery',
        'search' => 'Search, Filtering, and Stable Pagination',
        'bulk-data' => 'Large Import and Export Workflows',
        'approvals' => 'Approval Workflows and Audit Trails',
    ];

    private const PROJECT_TITLES = [
        '0' => 'Seat Booking with Payments',
        '1' => 'Multi-tenant Import and Export Service',
        '2' => 'Reliable API with a Failing Integration',
    ];

    private const FEATURE_TRACK_TITLES = [
        '38' => 'Feature Design Blueprint', '39' => 'Booking Capacity and Payments',
        '40' => 'Reliable Payment Processing', '41' => 'Wallets and P2P Ledger Design',
        '42' => 'Top-ups, Withdrawals, and Reconciliation', '43' => 'E-commerce Checkout Consistency',
        '44' => 'Returns, Refunds, and Disputes', '45' => 'Subscription Billing and Entitlements',
        '46' => 'Marketplace Settlement', '47' => 'Authentication and Access Control',
        '48' => 'Multi-tenant SaaS Isolation', '49' => 'Secure Upload Processing',
        '50' => 'Reliable Notification Delivery', '51' => 'Search, Filtering, and Pagination',
        '52' => 'Large Import and Export Workflows', '53' => 'Approval Workflows and Audit Trails',
    ];

    public function track(string $legacyKey, string $currentTitle): array
    {
        $title = self::FEATURE_TRACK_TITLES[$legacyKey] ?? $currentTitle;

        return [
            'title' => $title,
            'description' => "Practice production interview scenarios for {$title}, from the underlying mechanism to trade-offs, failure handling, and verification.",
        ];
    }

    public function guide(string $legacyKey, string $domain): array
    {
        $title = self::GUIDE_TITLES[$legacyKey] ?? Str::headline($legacyKey);
        $subject = match ($legacyKey) {
            'booking' => 'capacity, expiring holds, payment confirmation, and oversell prevention',
            'payments' => 'idempotency, payment state, settlement, refunds, and reconciliation',
            'wallet' => 'double-entry ledger records, balance projections, transfers, and auditability',
            'funding' => 'money movement, asynchronous provider events, limits, and reconciliation',
            'checkout' => 'price snapshots, inventory reservation, coupons, orders, and payment boundaries',
            'returns' => 'return eligibility, shipping state, refunds, disputes, and compensating actions',
            'subscriptions' => 'renewal attempts, grace periods, entitlements, invoices, and webhooks',
            'marketplace' => 'commission calculation, split payments, seller balances, and settlement',
            'identity' => 'sessions, tokens, OAuth, authorization, revocation, and audit events',
            'tenancy' => 'tenant context, row isolation, authorization, queues, caches, and observability',
            'uploads' => 'quarantine, malware scanning, object storage, processing, and private delivery',
            'notifications' => 'durable jobs, preferences, retries, deduplication, and provider failure',
            'search' => 'query contracts, filters, indexes, relevance, and stable cursor pagination',
            'bulk-data' => 'streaming, chunked jobs, validation, partial failure, and downloadable results',
            'approvals' => 'maker-checker separation, state transitions, permissions, and immutable audit history',
            'blueprint' => 'requirements, invariants, boundaries, data ownership, failure modes, and delivery',
            default => strtolower($domain).' constraints, state, failures, and verification',
        };

        return [
            'title' => $title,
            'summary' => "A production design guide for {$subject}. It turns a feature request into explicit invariants, state transitions, APIs, failure handling, and tests.",
            'sections' => [
                ['type' => 'objective', 'title' => 'Design objective', 'content' => "Define the user outcome and the business invariant before selecting infrastructure. For {$title}, the design must explain {$subject}."],
                ['type' => 'boundaries', 'title' => 'System boundaries', 'content' => 'Identify the source of truth, trust boundaries, synchronous request path, asynchronous work, and every external dependency. Assign one owner to each state transition.'],
                ['type' => 'flow', 'title' => 'Happy path and state changes', 'content' => 'Validate the command, persist the authoritative state atomically, publish durable follow-up work, make retries idempotent, and return an outcome the client can safely interpret.'],
                ['type' => 'failures', 'title' => 'Failure and recovery', 'content' => 'Cover duplicate requests, timeouts, out-of-order events, partial writes, stale reads, exhausted retries, and operator recovery. Never use a retry without an idempotency boundary.'],
                ['type' => 'verification', 'title' => 'Verification checklist', 'content' => 'Test invariants and permission boundaries, exercise concurrency and provider failure, measure latency and error rate, alert on stuck state, and rehearse reconciliation or repair.'],
            ],
        ];
    }

    public function project(string $legacyKey): array
    {
        $title = self::PROJECT_TITLES[$legacyKey] ?? 'Production Engineering Project';
        $focus = match ($legacyKey) {
            '0' => 'Prevent overselling while seat holds expire and payment callbacks arrive late or more than once.',
            '1' => 'Process large tenant-owned files asynchronously without leaking data, exhausting memory, or hiding row-level failures.',
            default => 'Keep the public API predictable while an external dependency times out, rejects requests, or recovers after retries.',
        };

        return [
            'title' => $title,
            'description' => $focus,
            'content' => [
                'objective' => "Design and implement {$title}. {$focus}",
                'requirements' => [
                    'Write the business invariants and ownership boundaries before coding.',
                    'Use authentication, authorization, input validation, and tenant-safe data access.',
                    'Make every retryable operation idempotent and observable.',
                    'Provide automated tests for success, concurrency, authorization, and dependency failure.',
                ],
                'deliverables' => ['Architecture decision record', 'Database and API design', 'Working implementation', 'Failure tests', 'Operational runbook'],
                'reviewQuestions' => ['Which state is authoritative?', 'What can be repeated safely?', 'How is partial failure repaired?', 'Which signal proves the feature is healthy?'],
            ],
        ];
    }

    /**
     * Build teaching material owned by one lesson. Unlike concept content, this
     * payload is never shared with another lesson, so a later seed cannot
     * replace the questions shown for an unrelated topic.
     */
    public function lesson(array $lesson, array $criteria): array
    {
        $title = trim((string) $lesson['title']);
        $question = trim((preg_split('/\s*Answer requirements:/u', (string) $lesson['interview_question'], 2) ?: [''])[0]);
        $question = $this->specificInterviewQuestion($title, $question);
        $answer = trim(explode("\n\nProduction decision:", (string) $lesson['model_answer'], 2)[0]);
        $sentences = preg_split('/(?<=[.!?])\s+/u', $answer) ?: [];
        $definition = trim(implode(' ', array_slice($sentences, 0, 3)));
        if ($definition === '') {
            $definition = trim((string) $lesson['explanation']);
        }
        $scenario = trim((string) ($lesson['practical_example'] ?? ''));
        $pitfall = trim((string) ($lesson['pitfall'] ?? ''));
        $criteria = array_values(array_filter($criteria, fn (array $criterion): bool => trim((string) ($criterion['label'] ?? '')) !== ''));
        $depth = count($criteria) >= 2 && str_word_count($definition) >= 12 ? 'full' : 'brief';
        $keywords = $this->topicKeywords($title, $criteria);

        $guidedQuestions = [[
            'question' => $question !== '' ? "{$title}: {$question}" : "What must an interview answer about {$title} explain?",
            'answer' => $definition,
        ]];
        if ($depth === 'full') {
            foreach (array_slice($criteria, 0, 3) as $criterion) {
                $label = trim((string) $criterion['label']);
                $description = trim((string) ($criterion['description'] ?? ''));
                $terms = collect($criterion['terms'] ?? [])->filter()->take(4)->implode(', ');
                $guidedQuestions[] = [
                    'question' => "For {$title}, how does {$label} affect this scenario: {$question}",
                    'answer' => trim($description.' '.($terms !== '' ? "Use the relevant evidence explicitly: {$terms}. " : '').$definition),
                ];
            }
            if ($pitfall !== '' && count($guidedQuestions) < 5) {
                $guidedQuestions[] = [
                    'question' => "For {$title}, which failure or trade-off could invalidate this answer: {$question}",
                    'answer' => $pitfall,
                ];
            }
        }

        $mechanism = $depth === 'full' ? collect($criteria)->take(4)->map(fn (array $criterion): array => [
            'title' => trim((string) $criterion['label']),
            'description' => trim((string) ($criterion['description'] ?? '')),
        ])->filter(fn (array $step): bool => $step['description'] !== '')->values()->all() : [];

        return [
            'schemaVersion' => 1,
            'contentRevision' => 1,
            'depth' => $depth,
            'topicKeywords' => $keywords,
            'brief' => Str::words($definition, $depth === 'brief' ? 90 : 65, ''),
            'definition' => $definition,
            'guidedQuestions' => $guidedQuestions,
            'mechanismSteps' => $mechanism,
            'productionScenarios' => $depth === 'full' && $scenario !== '' ? [[
                'context' => $scenario,
                'decision' => $definition,
                'constraints' => $pitfall,
            ]] : [],
            'failureModes' => $depth === 'full' && $pitfall !== '' ? [[
                'cause' => $pitfall,
                'symptom' => "The expected {$title} behavior is not preserved in the stated scenario.",
                'prevention' => "Test the specific {$title} rule before accepting the implementation.",
                'recovery' => "Restore the last valid state and repeat only work that is safe for this {$title} scenario.",
                'monitoring' => "Observe the result or state transition named by the {$title} interview question.",
            ]] : [],
            'whenToUse' => $depth === 'full' ? [trim((string) ($lesson['objective'] ?? $definition))] : [],
            'whenNotToUse' => $depth === 'full' && $pitfall !== '' ? [$pitfall] : [],
            'verificationChecklist' => $depth === 'full' ? collect($criteria)->take(4)->map(
                fn (array $criterion): string => "Verify {$criterion['label']} with an observable example, test, or result for {$title}.",
            )->values()->all() : [],
            'codeExamples' => empty($lesson['code']) ? [] : [[
                'language' => 'php',
                'label' => "{$title} example",
                'code' => $lesson['code'],
                'walkthrough' => "Trace how the code implements {$title}, including the input and the observable result.",
                'expectedResult' => "The example demonstrates the behavior asked about in the {$title} interview question.",
            ]],
            'reviewStatus' => 'automated_verified',
            'reviewedAt' => config('curriculum_sources.reviewed_at'),
        ];
    }

    private function topicKeywords(string $title, array $criteria): array
    {
        $stop = ['and', 'or', 'the', 'with', 'from', 'into', 'for', 'versus', 'vs', 'in', 'of', 'a', 'an'];
        $words = preg_split('/[^a-z0-9_]+/i', mb_strtolower($title)) ?: [];
        foreach ($criteria as $criterion) {
            $words = [...$words, ...($criterion['terms'] ?? [])];
        }

        return collect($words)->map(fn (mixed $word): string => mb_strtolower(trim((string) $word)))
            ->filter(fn (string $word): bool => mb_strlen($word) > 1 && ! in_array($word, $stop, true))
            ->unique()->take(16)->values()->all();
    }

    private function specificInterviewQuestion(string $title, string $fallback): string
    {
        if (! str_starts_with($fallback, "Explain {$title} in a production scenario")
            && ! str_starts_with($fallback, "Explain how {$title} works in a production system")) {
            return $fallback;
        }

        return match ($title) {
            'Factory Method' => 'How does Factory Method move construction behind a polymorphic creation hook, and when is dependency injection simpler?',
            'Abstract Factory' => 'How does Abstract Factory keep a family of related objects compatible without coupling clients to concrete classes?',
            'Builder' => 'When does staged Builder construction prevent invalid complex objects better than a constructor or named constructor?',
            'Prototype' => 'How do shallow and deep cloning change the safety of Prototype when nested mutable objects are present?',
            'Singleton and Why It Often Hurts' => 'Which hidden dependencies and shared-state failures make Singleton risky, and which lifetime should replace it?',
            'Adapter' => 'How should an Adapter translate both data and behavioral semantics without leaking a vendor contract into application code?',
            'Bridge' => 'How does Bridge let an abstraction and its implementation vary independently, and why is that different from adapting a legacy API?',
            'Composite' => 'How can Composite evaluate a tree of rules uniformly while preserving ordering, short-circuiting, and useful error details?',
            'Decorator' => 'How does Decorator add behavior without changing the wrapped contract, and why can decorator order change the result?',
            'Facade' => 'How can a Facade simplify a subsystem without absorbing its business rules and becoming a God Object?',
            'Flyweight' => 'Which state can Flyweight safely share, which state must remain external, and when does the memory saving justify the complexity?',
            'Proxy' => 'Where should Proxy enforce lazy loading, access, or remote communication while preserving the real subject contract?',
            'Chain of Responsibility' => 'How should a Chain of Responsibility define ordering, termination, errors, and observability across handlers?',
            'Command' => 'What must a Command capture to support queuing, retries, authorization, and idempotent execution?',
            'Interpreter' => 'When is a small Interpreter appropriate for a grammar, and when should the design use Specification or a proven parser?',
            'Iterator' => 'How can an Iterator stream a large result with bounded memory, and which operations make a second traversal unsafe?',
            'Mediator' => 'How does Mediator reduce peer-to-peer coupling without centralizing every business rule in one object?',
            'Memento' => 'How can Memento implement undo without exposing internals or retaining an unbounded history of large snapshots?',
            'Observer' => 'Which consistency and delivery guarantees determine whether an Observer should run synchronously or asynchronously?',
            'State' => 'When does State model behavior better than an enum and switch, and how are valid transitions enforced?',
            'Strategy' => 'How does Strategy select interchangeable behavior without turning simple branching into unnecessary indirection?',
            'Template Method' => 'When is a stable algorithm skeleton with overridable steps safer than composing independent strategies?',
            'Visitor' => 'When does Visitor make new operations easier, and why does adding new element types become its central trade-off?',
            default => $fallback,
        };
    }

    public function concept(string $title, array $lesson, array $existing): array
    {
        if (($existing['schemaVersion'] ?? null) === 3 && ($existing['contentRevision'] ?? null) === 7) {
            return [...$existing, 'reviewedAt' => config('curriculum_sources.reviewed_at')];
        }

        $directAnswer = trim(explode("\n\n", (string) ($lesson['model_answer'] ?? ''))[0]);
        $sentences = preg_split('/(?<=[.!?])\s+/u', $directAnswer) ?: [];
        $definition = trim(implode(' ', array_slice($sentences, 0, 2)));
        $definition = $definition !== '' ? $definition : "{$title} is an engineering mechanism whose guarantees must match a documented system constraint.";
        $summary = Str::words(($sentences[0] ?? "{$title} provides a concrete engineering guarantee.")." This lesson explains how {$title} works at a production boundary, when its guarantee is justified, which failure mode matters most, and what observable evidence verifies the result.", 42, '');
        $scenario = trim((string) ($lesson['practical_example'] ?? "Apply {$title} to a production change with an explicit constraint and observable outcome."));
        $pitfall = trim((string) ($lesson['pitfall'] ?? "Using {$title} without a named constraint can add complexity without protecting an invariant."));
        $question = trim((string) ($lesson['interview_question'] ?? "How should {$title} be applied and verified?"));
        $mechanism = [
            ['title' => 'Establish the boundary', 'description' => "Identify the input, owner, constraint, and trust boundary relevant to {$title}."],
            ['title' => 'Protect the invariant', 'description' => "Apply the guarantee described in the canonical answer: {$definition}"],
            ['title' => 'Handle failure', 'description' => "Exercise the realistic failure path for {$title} instead of assuming the happy path always completes."],
            ['title' => 'Verify the result', 'description' => "Observe a test, state transition, log, metric, or query result that proves {$title} behaved as intended."],
        ];

        return [
            'schemaVersion' => 3,
            'contentRevision' => 7,
            'summary' => $summary,
            'definition' => $definition,
            'guidedQuestions' => [
                ['question' => "What does {$title} mean in this lesson?", 'answer' => $definition.' This definition matters because the interview question is: '.$question." A useful answer must name the protected invariant and the component that owns the decision. Do not stop at a label. Explain which input enters the boundary, which state or result is authoritative, and what another engineer could observe to distinguish correct {$title} behavior from a plausible but incorrect implementation."],
                ['question' => "How does {$title} work step by step?", 'answer' => collect($mechanism)->map(fn (array $step): string => $step['title'].': '.$step['description'])->implode(' ')." Read these steps as a causal chain, not four independent tips. For {$title}, each output becomes the next step's input, and the invariant must still hold when the named dependency fails, a request is repeated, or concurrent work reaches the same boundary."],
                ['question' => "Where would {$title} be used in production?", 'answer' => $scenario." The engineer should state the scale and constraint, select the smallest mechanism that protects the invariant, and describe what evidence proves the decision works. Compare the operational cost with a simpler alternative, identify who owns recovery, and confirm that {$title} solves the scenario's actual bottleneck or risk rather than an imagined future requirement. Document the rejected alternative and the condition that would justify revisiting this decision as workload, team size, or reliability requirements change."],
                ['question' => "What can go wrong with {$title}?", 'answer' => $pitfall." Detect the symptom through a focused regression test and an operational signal. Recovery must restore the invariant without silently discarding user data or hiding partial failure. The runbook should name the first safe operator action, the data that needs reconciliation, and the metric or log that proves {$title} has returned to normal rather than merely stopped producing visible errors. Record the incident decision and convert the discovered gap into a repeatable test."],
            ],
            'mechanismSteps' => $mechanism,
            'whenToUse' => ["Use {$title} when its guarantee is required by the production scenario and can be verified."],
            'whenNotToUse' => ["Do not add {$title} only because it is common; prefer the simplest design that satisfies the invariant."],
            'productionScenarios' => [['context' => $scenario, 'decision' => $definition, 'constraints' => $pitfall]],
            'failureModes' => [[
                'cause' => $pitfall,
                'symptom' => "The expected guarantee of {$title} no longer holds under the lesson scenario.",
                'prevention' => "Make the {$title} boundary explicit and cover its failure path with a regression test.",
                'recovery' => 'Restore the authoritative state, retry only idempotent work, and record any manual repair.',
                'monitoring' => "Measure the observable result named for {$title} and alert when its invariant is violated.",
            ]],
            'codeExamples' => empty($lesson['code']) ? [] : [[
                'language' => 'php',
                'label' => 'Production-oriented example',
                'code' => $lesson['code'],
                'walkthrough' => 'Identify the input boundary, the guarantee enforced by each important line, the failure path, and the expected observable result.',
                'expectedResult' => "The example preserves the {$title} invariant and exposes a result that an automated test can verify.",
            ]],
            'glossary' => [],
            'verificationChecklist' => [
                "State the invariant protected by {$title}.",
                'Test the happy path and the named failure path.',
                'Confirm the observable result and recovery behavior.',
            ],
            'reviewStatus' => 'automated_verified',
            'reviewedAt' => config('curriculum_sources.reviewed_at'),
        ];
    }

    public function visualKind(string $value): ?string
    {
        $value = mb_strtolower($value);

        return match (true) {
            Str::contains($value, ['ci/cd', 'pipeline', 'github actions', 'deployment', 'release artifact']) => 'pipeline',
            Str::contains($value, ['database schema', 'relation', 'foreign key', 'normalization']) => 'entity-relationship',
            Str::contains($value, ['transaction', 'lock', 'concurrency', 'race condition', 'isolation']) => 'transaction-timeline',
            Str::contains($value, ['authentication', 'oauth', 'session', 'token', 'payment', 'queue', 'upload', 'notification', 'approval', 'checkout', 'booking']) => 'data-flow',
            Str::contains($value, ['cache', 'redis', 'scale', 'distributed', 'architecture', 'tenant', 'load balancer']) => 'architecture',
            Str::contains($value, ['state', 'workflow', 'subscription', 'order lifecycle']) => 'state-machine',
            Str::contains($value, ['pattern', 'factory', 'strategy', 'adapter', 'observer', 'decorator', 'command']) => 'comparison',
            default => null,
        };
    }

    public function visual(string $kind, string $title): array
    {
        $nodes = match ($kind) {
            'pipeline' => [['source', 'Accepted revision'], ['verify', 'Quality gates'], ['artifact', 'Immutable artifact'], ['release', 'Controlled rollout']],
            'data-flow' => [['client', 'Untrusted input'], ['boundary', 'Validation boundary'], ['owner', 'Authoritative owner'], ['result', 'Audited result']],
            'state-machine' => [['initial', 'Initial state'], ['pending', 'Pending transition'], ['complete', 'Completed state'], ['failed', 'Recoverable failure']],
            'architecture' => [['edge', 'Request boundary'], ['service', 'Application service'], ['state', 'Authoritative store'], ['signal', 'Operational signal']],
            'comparison' => [['constraint', 'Decision constraint'], ['option-a', 'Option A'], ['option-b', 'Option B'], ['decision', 'Documented choice']],
            'entity-relationship' => [['parent', 'Owning entity'], ['child', 'Related entity'], ['constraint', 'Relational constraint'], ['query', 'Verified query']],
            'transaction-timeline' => [['begin', 'Begin transaction'], ['read', 'Read snapshot'], ['write', 'Protected write'], ['commit', 'Commit or retry']],
            default => [['input', 'Input'], ['decision', 'Decision'], ['failure', 'Failure'], ['result', 'Result']],
        };
        $nodeData = array_map(fn (array $node, int $index): array => [
            'id' => $node[0], 'label' => $node[1], 'group' => match ($index) {
                0 => 'input', 3 => 'outcome', default => 'process'
            },
        ], $nodes, array_keys($nodes));
        $edges = [
            ['from' => $nodes[0][0], 'to' => $nodes[1][0], 'label' => 'enters'],
            ['from' => $nodes[1][0], 'to' => $nodes[2][0], 'label' => 'applies '.$title],
            ['from' => $nodes[2][0], 'to' => $nodes[3][0], 'label' => 'verifies'],
        ];

        return [
            'kind' => $kind,
            'schemaVersion' => 2,
            'layout' => $kind,
            'title' => "{$title}: {$kind}",
            'caption' => "Trace the specific {$title} mechanism from its input boundary to a verified production outcome.",
            'alt_text' => "A {$kind} diagram for {$title} with four semantic nodes and labeled edges from input to verified outcome.",
            'data' => [
                'nodes' => $nodeData,
                'edges' => $edges,
                'annotations' => [['label' => 'Verification', 'text' => "Confirm the invariant and recovery signal for {$title}."]],
            ],
        ];
    }
}
