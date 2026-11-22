import { AlertTriangle, BookOpen, Check, ExternalLink, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Lesson } from "../../entities/curriculum";
import { TechnicalDiagram } from "../../shared/components/TechnicalDiagram";

const sections = [
  ["objective", "Objective"], ["questions", "Guided explanation"], ["mechanism", "Mechanism"],
  ["production", "Production use case"], ["code", "Code walkthrough"], ["failures", "Failure modes"],
  ["decisions", "Decisions and verification"], ["visuals", "Technical visual"],
  ["interview", "Interview challenge"], ["sources", "Sources"],
] as const;

export function LessonLearningStage({ lesson, startAnswer }: { lesson: Lesson; startAnswer: () => void }) {
  const concept = lesson.learningConcept?.content;
  const scenarios = concept?.productionScenarios ?? [];
  const failures = concept?.failureModes ?? [];
  const steps = concept?.mechanismSteps ?? [];

  return <article className="training-body lesson-learning">
    <span className="status-pill">Schema v{concept?.schemaVersion ?? 2} canonical curriculum</span>
    <h2>{lesson.title}</h2>
    <p className="learning-intro">Learn the mechanism, make a production decision from constraints, and prove the result. The interview answer is a concise application of this material, not a duplicate definition.</p>

    <nav className="lesson-toc" aria-label="On this page"><strong>On this page</strong><ol>{sections.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav>

    <ContentSection id="objective" label="1. Objective and prerequisites" title="What you should be able to explain">
      <div className="objective-block"><span className="target-icon">1</span><div><strong>Learning objective</strong><p>{lesson.objective}</p></div></div>
      <p><strong>Canonical definition:</strong> {concept?.definition ?? lesson.explanation}</p>
    </ContentSection>

    <ContentSection id="questions" label="2. Guided question-and-answer explanation" title="Build the mental model in small steps">
      <div className="guided-questions">{concept?.guidedQuestions?.map((item, index) => <article key={item.question}>
        <span>Question {index + 1}</span><h4>{item.question}</h4><p>{item.answer}</p>
      </article>) ?? <p>{lesson.explanation}</p>}</div>
    </ContentSection>

    <ContentSection id="mechanism" label="3. Mechanism and data flow" title="Trace what happens in order">
      {steps.length ? <ol className="mechanism-steps">{steps.map((step, index) => <li key={`${step.title}-${index}`}><span>{index + 1}</span><div><strong>{step.title}</strong><p>{step.description}</p></div></li>)}</ol> : <p>{concept?.mechanism ?? lesson.explanation}</p>}
    </ContentSection>

    <ContentSection id="production" label="4. Production example" title="Apply the idea under real constraints">
      <p>{lesson.interview.scenario}</p>
      {scenarios.map((scenario, index) => <article className="production-scenario" key={`${scenario.context}-${index}`}><h4>Engineering decision</h4><p>{scenario.decision}</p><strong>Constraint or boundary</strong><p>{scenario.constraints}</p></article>)}
      {!scenarios.length && concept?.useCases?.length ? <List items={concept.useCases} /> : null}
    </ContentSection>

    <ContentSection id="code" label="5. Code example and walkthrough" title="Connect the mechanism to implementation">
      {lesson.codeExamples.length ? lesson.codeExamples.map((example, index) => <article className="code-walkthrough" key={`${example.label}-${index}`}><h4>{example.label}</h4><span className="code-language">{example.language}</span><pre dir="ltr"><code>{example.code}</code></pre><p>{example.walkthrough}</p>{example.expectedResult && <p><strong>Expected result:</strong> {example.expectedResult}</p>}</article>) : <p>This topic is decision-oriented. Use the mechanism and verification checklist instead of decorative pseudocode.</p>}
    </ContentSection>

    <ContentSection id="failures" label="6. Failure-mode analysis" title="Prevent, detect, and recover">
      {failures.length ? <div className="failure-table-wrap"><table className="failure-table"><thead><tr><th>Cause</th><th>Symptom</th><th>Prevention</th><th>Recovery</th><th>Monitoring</th></tr></thead><tbody>{failures.map((failure, index) => <tr key={`${failure.cause}-${index}`}><td>{failure.cause}</td><td>{failure.symptom}</td><td>{failure.prevention}</td><td>{failure.recovery}</td><td>{failure.monitoring}</td></tr>)}</tbody></table></div> : <p>{lesson.pitfall}</p>}
      <aside className="lesson-warning"><AlertTriangle /><div><strong>Interview warning</strong><p>{lesson.pitfall}</p></div></aside>
    </ContentSection>

    <ContentSection id="decisions" label="7. Decision and verification checklist" title="Know when the design is justified">
      <div className="decision-grid"><article><h4>Use it when</h4><List items={concept?.whenToUse ?? [lesson.objective]} /></article><article><h4>Choose another approach when</h4><List items={concept?.whenNotToUse ?? [lesson.pitfall]} /></article></div>
      <h4>Verification checklist</h4><ul className="verification-list">{concept?.verificationChecklist?.map((item) => <li key={item}><Check />{item}</li>)}</ul>
    </ContentSection>

    <ContentSection id="visuals" label="8. Technical visual" title="See the flow and boundaries">
      {lesson.visuals.length ? lesson.visuals.map((visual) => <TechnicalDiagram key={visual.id} visual={visual} />) : <p>This lesson is clearer through its code and ordered mechanism, so it does not add a decorative diagram.</p>}
    </ContentSection>

    <ContentSection id="interview" label="9. Interview challenge" title="Answer one specific production question">
      <p className="question-text">{lesson.questionBrief.task}</p>
      <h4>Claims your answer must support</h4><ol className="answer-points">{lesson.questionBrief.requirements.map((item) => <li key={item.id}><Check /><div><strong>{item.title}</strong><p>{item.explanation}</p><small>Weight: {item.weight}</small></div></li>)}</ol>
    </ContentSection>

    {lesson.concepts.length > 0 && <ContentSection label="Canonical references" title="Open related concepts for deeper study"><div className="related-concepts">{lesson.concepts.map((item) => <Link to={`/concepts/${item.slug}`} key={item.slug}><span>{item.group}</span><strong>{item.title}</strong><p>{item.intro}</p></Link>)}</div></ContentSection>}
    <ContentSection id="sources" label="10. Sources and version notes" title="Verify the claims in authoritative material">
      <div className="lesson-sources">{lesson.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><BookOpen /><div><span>{source.publisher}</span><strong>{source.title}</strong><p>{[source.applicableVersion, source.sectionLocator, source.reviewedAt && `Reviewed ${source.reviewedAt}`].filter(Boolean).join(" - ")}</p></div><ExternalLink /></a>)}</div>
    </ContentSection>

    <aside className="ready-callout"><Lightbulb /><div><strong>Before you answer</strong><p>Explain the mechanism aloud, state one decision, name one failure mode, and finish with evidence that proves the result.</p></div></aside>
    <button className="button" onClick={startAnswer}>Start the interview simulation</button>
  </article>;
}

function ContentSection({ id, label, title, children }: { id?: string; label: string; title: string; children: ReactNode }) {
  return <section id={id} className="lesson-block"><span className="lesson-block-label">{label}</span><h3>{title}</h3>{children}</section>;
}

function List({ items }: { items: string[] }) {
  return <ul className="concept-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
