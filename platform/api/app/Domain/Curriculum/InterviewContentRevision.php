<?php

namespace App\Domain\Curriculum;

final class InterviewContentRevision
{
    public function __construct(private readonly EnglishText $english) {}

    public function question(string $title, string $question, array $criteria): string
    {
        $task = $this->english->usable($question)
            ?? "Explain how {$title} works in a production system and justify the implementation decision.";
        $points = implode('; ', array_map(
            fn (array $criterion): string => $this->criterionTitle($criterion),
            $criteria,
        ));

        return "{$task}\n\nAnswer requirements: address {$points}. Finish with one concrete decision, one important failure mode or trade-off, and one way to verify the result.";
    }

    public function modelAnswer(
        string $answer,
        string $explanation,
        ?string $example,
        ?string $pitfall,
        array $criteria,
        string $title = 'this concept',
    ): string {
        $direct = $this->english->usable($answer, 55) ?? $this->fallbackAnswer($title, $criteria);
        $coverage = array_map(function (array $criterion): string {
            $terms = array_values(array_filter(array_map(
                fn (string $term): string => $this->english->clean($term),
                $criterion['terms'] ?? [],
            )));

            return $this->criterionTitle($criterion).($terms === [] ? '.' : ': '.implode(', ', $terms).'.');
        }, $criteria);

        return $direct."\n\nVerification and rubric coverage:\n- ".implode("\n- ", $coverage);
    }

    public function explanation(string $title, string $question, string $answer, array $criteria): string
    {
        $direct = $this->english->usable($answer, 55) ?? $this->fallbackAnswer($title, $criteria);
        $task = $this->english->usable($question) ?? "Explain {$title} in a production context.";

        return "Definition\n{$direct}\n\n"
            ."How it works\nStart at the system boundary: identify the input, the authoritative state, and the invariant that must remain true. Trace the behavior through validation, state change, failure handling, and the observable result. For this lesson, use the concrete constraints in this scenario: {$task}\n\n"
            ."When to use it\nUse {$title} only when its guarantees directly address a documented correctness, reliability, security, performance, or maintainability requirement. Record the decision and the constraint it protects so another engineer can review it later.\n\n"
            ."When not to use it\nDo not add the mechanism because it is fashionable or familiar. If a simpler design preserves the same invariant at the expected scale and risk level, prefer the simpler design because it is easier to operate, test, and recover.\n\n"
            ."Production use case\nTurn the scenario into an explicit engineering decision. State who owns the data, where the decision is enforced, what happens during a duplicate request or partial failure, and what the caller can safely assume after receiving the result.\n\n"
            ."Trade-offs and failure modes\nEvery mechanism adds cost. Discuss complexity, latency, stale state, concurrency, dependency failure, and operational recovery where they apply. A senior answer names the most likely failure, limits its blast radius, and avoids silent data corruption.\n\n"
            ."Verification\nProve the decision with focused tests and production signals. Test the success path, invalid input, authorization boundary, duplicate or concurrent execution, and dependency failure. Monitor an outcome metric plus errors or stuck state, and define how an operator can diagnose and repair the problem.";
    }

    public function objective(string $title, ?string $objective, array $criteria): string
    {
        $existing = $this->english->usable($objective);
        if ($existing) {
            return $existing;
        }

        return "Explain {$title}, apply it to a production scenario, compare its trade-offs, and verify the result with evidence.";
    }

    public function practicalExample(string $title, string $question, ?string $example): string
    {
        return $this->english->usable($example)
            ?? "You are reviewing a production change involving {$title}. Before approving it, answer this question with a concrete implementation decision: ".$this->english->clean($question);
    }

    public function pitfall(string $title, ?string $pitfall): string
    {
        return $this->english->usable($pitfall)
            ?? "Do not name {$title} as a solution without explaining the constraint it addresses, its failure mode, and how the team will verify it.";
    }

    private function fallbackAnswer(string $title, array $criteria): string
    {
        $termLists = array_map(fn (array $criterion): array => array_map(
            fn (string $term): string => $this->english->clean($term),
            $criterion['terms'] ?? [],
        ), $criteria);
        $terms = array_values(array_unique(array_filter($termLists === [] ? [] : array_merge(...$termLists))));
        $concepts = implode(', ', $terms);

        return "{$title} is a deliberate engineering decision rather than a default tool. A strong design defines the problem and boundary first, applies {$concepts}, handles the main failure path explicitly, and verifies the outcome with tests and production signals.";
    }

    private function criterionTitle(array $criterion): string
    {
        return $this->english->title((string) ($criterion['label'] ?? ''), 'required evidence');
    }
}
