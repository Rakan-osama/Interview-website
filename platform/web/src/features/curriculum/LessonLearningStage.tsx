import { AlertTriangle, BookOpen, Check, ExternalLink, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Lesson } from "../../entities/curriculum";
import { TechnicalDiagram } from "../../shared/components/TechnicalDiagram";

type SectionLink = { id: string; label: string };

export function LessonLearningStage({ lesson, startAnswer }: { lesson: Lesson; startAnswer: () => void }) {
  const content = lesson.learningContent;
  const sections: SectionLink[] = [
    { id: "objective", label: "Topic brief" },
    ...(content.guidedQuestions.length ? [{ id: "questions", label: "Guided questions" }] : []),
    ...(content.mechanismSteps.length ? [{ id: "mechanism", label: "Mechanism" }] : []),
    ...(content.productionScenarios.length ? [{ id: "production", label: "Production use case" }] : []),
    ...(content.codeExamples.length ? [{ id: "code", label: "Code walkthrough" }] : []),
    ...(content.failureModes.length ? [{ id: "failures", label: "Failure modes" }] : []),
    ...(content.whenToUse.length || content.whenNotToUse.length || content.verificationChecklist.length ? [{ id: "decisions", label: "Decisions and verification" }] : []),
    ...(lesson.visuals.length ? [{ id: "visuals", label: "Technical visual" }] : []),
    { id: "interview", label: "Interview challenge" },
    { id: "sources", label: "Sources" },
  ];

  return <article className="training-body lesson-learning">
    <span className="status-pill">{content.depth === "brief" ? "Focused topic brief" : "Full interview lesson"}</span>
    <h2>{lesson.title}</h2>
    <p className="learning-intro">{content.brief}</p>
    <nav className="lesson-toc" aria-label="On this page"><strong>On this page</strong><ol>{sections.map(({ id, label }) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav>

    <ContentSection id="objective" label="Topic definition" title={`Understand ${lesson.title}`}>
      <div className="objective-block"><span className="target-icon">1</span><div><strong>Learning objective</strong><p>{lesson.objective}</p></div></div>
      <p><strong>Definition:</strong> {content.definition}</p>
    </ContentSection>

    {!!content.guidedQuestions.length && <ContentSection id="questions" label="Guided question-and-answer explanation" title="Build the topic-specific mental model">
      <div className="guided-questions">{content.guidedQuestions.map((item, index) => <article key={`${item.question}-${index}`}><span>Question {index + 1}</span><h4>{item.question}</h4><p>{item.answer}</p></article>)}</div>
    </ContentSection>}

    {!!content.mechanismSteps.length && <ContentSection id="mechanism" label="Mechanism and data flow" title="Trace the relevant behavior">
      <ol className="mechanism-steps">{content.mechanismSteps.map((step, index) => <li key={`${step.title}-${index}`}><span>{index + 1}</span><div><strong>{step.title}</strong><p>{step.description}</p></div></li>)}</ol>
    </ContentSection>}

    {!!content.productionScenarios.length && <ContentSection id="production" label="Production example" title="Apply this topic under real constraints">
      {content.productionScenarios.map((scenario, index) => <article className="production-scenario" key={`${scenario.context}-${index}`}><p>{scenario.context}</p><h4>Engineering decision</h4><p>{scenario.decision}</p>{scenario.constraints && <><strong>Constraint or boundary</strong><p>{scenario.constraints}</p></>}</article>)}
    </ContentSection>}

    {!!content.codeExamples.length && <ContentSection id="code" label="Code example and walkthrough" title="Connect the topic to implementation">
      {content.codeExamples.map((example, index) => <article className="code-walkthrough" key={`${example.label}-${index}`}><h4>{example.label}</h4><span className="code-language">{example.language}</span><pre dir="ltr"><code>{example.code}</code></pre><p>{example.walkthrough}</p>{example.expectedResult && <p><strong>Expected result:</strong> {example.expectedResult}</p>}</article>)}
    </ContentSection>}

    {!!content.failureModes.length && <ContentSection id="failures" label="Failure-mode analysis" title={`What can go wrong with ${lesson.title}`}>
      <div className="failure-table-wrap"><table className="failure-table"><thead><tr><th>Cause</th><th>Symptom</th><th>Prevention</th><th>Recovery</th><th>Monitoring</th></tr></thead><tbody>{content.failureModes.map((failure, index) => <tr key={`${failure.cause}-${index}`}><td>{failure.cause}</td><td>{failure.symptom}</td><td>{failure.prevention}</td><td>{failure.recovery}</td><td>{failure.monitoring}</td></tr>)}</tbody></table></div>
      <aside className="lesson-warning"><AlertTriangle /><div><strong>Interview warning</strong><p>{lesson.pitfall}</p></div></aside>
    </ContentSection>}

    {(!!content.whenToUse.length || !!content.whenNotToUse.length || !!content.verificationChecklist.length) && <ContentSection id="decisions" label="Decision and verification checklist" title="Know when the answer is justified">
      {(!!content.whenToUse.length || !!content.whenNotToUse.length) && <div className="decision-grid">{!!content.whenToUse.length && <article><h4>Use it when</h4><List items={content.whenToUse} /></article>}{!!content.whenNotToUse.length && <article><h4>Choose another approach when</h4><List items={content.whenNotToUse} /></article>}</div>}
      {!!content.verificationChecklist.length && <><h4>Verification checklist</h4><ul className="verification-list">{content.verificationChecklist.map((item) => <li key={item}><Check />{item}</li>)}</ul></>}
    </ContentSection>}

    {!!lesson.visuals.length && <ContentSection id="visuals" label="Technical visual" title={`See the ${lesson.title} flow and boundaries`}>{lesson.visuals.map((visual) => <TechnicalDiagram key={visual.id} visual={visual} />)}</ContentSection>}

    <ContentSection id="interview" label="Interview challenge" title={`Answer one specific ${lesson.title} question`}>
      <p className="question-text">{lesson.questionBrief.task}</p>
      <h4>Claims your answer must support</h4><ol className="answer-points">{lesson.questionBrief.requirements.map((item) => <li key={item.id}><Check /><div><strong>{item.title}</strong><p>{item.explanation}</p><small>Weight: {item.weight}</small></div></li>)}</ol>
    </ContentSection>

    {lesson.concepts.length > 0 && <ContentSection label="Related library references" title="Optional concepts for deeper study"><div className="related-concepts">{lesson.concepts.map((item) => <Link to={`/concepts/${item.slug}`} key={item.slug}><span>{item.group}</span><strong>{item.title}</strong><p>{item.intro}</p></Link>)}</div></ContentSection>}
    <ContentSection id="sources" label="Sources and version notes" title="Verify this lesson in authoritative material"><div className="lesson-sources">{content.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><BookOpen /><div><span>{source.publisher}</span><strong>{source.title}</strong><p>{[source.applicableVersion, source.sectionLocator, source.reviewedAt && `Reviewed ${source.reviewedAt}`].filter(Boolean).join(" - ")}</p></div><ExternalLink /></a>)}</div></ContentSection>

    <aside className="ready-callout"><Lightbulb /><div><strong>Before you answer</strong><p>Answer the exact question for {lesson.title}; do not substitute a generic architecture checklist.</p></div></aside>
    <button className="button" onClick={startAnswer}>Start the interview simulation</button>
  </article>;
}

function ContentSection({ id, label, title, children }: { id?: string; label: string; title: string; children: ReactNode }) {
  return <section id={id} className="lesson-block"><span className="lesson-block-label">{label}</span><h3>{title}</h3>{children}</section>;
}

function List({ items }: { items: string[] }) {
  return <ul className="concept-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
