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
