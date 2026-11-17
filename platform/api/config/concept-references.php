<?php

$php = [
    ['title' => 'PHP Language Reference', 'url' => 'https://www.php.net/manual/en/langref.php', 'note' => 'Types, functions, classes, errors and language behavior.'],
];
$laravel = [
    ['title' => 'Laravel 12 Documentation', 'url' => 'https://laravel.com/docs/12.x', 'note' => 'Official framework behavior, lifecycle and component contracts.'],
];
$database = [
    ['title' => 'PostgreSQL Concurrency Control', 'url' => 'https://www.postgresql.org/docs/current/mvcc.html', 'note' => 'Transactions, isolation, MVCC and locking behavior.'],
];
$http = [
    ['title' => 'RFC 9110 — HTTP Semantics', 'url' => 'https://www.rfc-editor.org/rfc/rfc9110.html', 'note' => 'Methods, resources, responses, safety and idempotency semantics.'],
];
$reliability = [
    ['title' => 'Google SRE Workbook — SLOs', 'url' => 'https://sre.google/workbook/slo-document/', 'note' => 'SLIs, SLOs, error budgets and measurable reliability.'],
    ['title' => 'AWS Retry with Backoff', 'url' => 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html', 'note' => 'Bounded retries, backoff, idempotency and failure control.'],
];
$security = [
    ['title' => 'OWASP Cheat Sheet Series', 'url' => 'https://cheatsheetseries.owasp.org/', 'note' => 'Authentication, authorization, cryptography, uploads and logging guidance.'],
];
$payments = [
    ['title' => 'Stripe Idempotent Requests', 'url' => 'https://docs.stripe.com/api/idempotent_requests', 'note' => 'Safe retry identity and replay behavior for payment operations.'],
    ['title' => 'Stripe Webhooks', 'url' => 'https://docs.stripe.com/webhooks', 'note' => 'Asynchronous events, signatures and delivery handling.'],
];
$algorithms = [
    ['title' => 'MIT 6.006 Introduction to Algorithms', 'url' => 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', 'note' => 'Complexity, data structures, graph search and dynamic programming.'],
];

return [
    'PHP' => $php, 'OOP' => $php, 'Design Patterns' => $php,
    'Laravel' => $laravel,
    'Backend' => [...$http, ...$security], 'Database' => $database,
    'Payments' => $payments, 'Wallet' => [...$payments, ...$database], 'Fintech' => [...$payments, ...$database],
    'Commerce' => [...$payments, ...$database], 'Billing' => $payments,
    'AI' => [['title' => 'OpenAI Evaluation Best Practices', 'url' => 'https://developers.openai.com/api/docs/guides/evaluation-best-practices', 'note' => 'Task-specific evals, human calibration and measurable quality.']],
    'Problem Solving' => $algorithms,
    'Engineering' => [...$reliability, ...$http], 'Reliability' => $reliability,
    'Security' => $security,
    'Booking' => $database,
    'Design' => [...$reliability, ...$http],
];
