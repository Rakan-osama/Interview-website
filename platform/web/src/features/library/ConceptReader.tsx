import { AlertTriangle, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ConceptContent, LearningSource } from "../../entities/curriculum";

export type ConceptDetail = { title: string; group: string; content: ConceptContent; references?: LearningSource[] };

export function ConceptReader({ detail }: { detail: ConceptDetail }) {
  const { content } = detail;
  const scenarios = content.productionScenarios?.map((scenario) => `${scenario.context} Decision: ${scenario.decision} Constraint: ${scenario.constraints}`) ?? content.useCases ?? [];
  const failures = content.failureModes?.map((failure) => `Cause: ${failure.cause} Symptom: ${failure.symptom} Prevention: ${failure.prevention} Recovery: ${failure.recovery} Monitoring: ${failure.monitoring}`) ?? content.tradeOffs ?? [];

  return <article className="page concept-reader">
    <Link className="back-link" to="/concepts">Back to all concepts</Link>
    <header className="concept-hero"><span className="eyebrow">{detail.group}</span><h1>{detail.title}</h1><p className="concept-lead">{content.summary}</p>{content.reviewedAt && <small>Content reviewed {content.reviewedAt}</small>}</header>
    <ConceptSection number="01" title="Definition"><p>{content.definition}</p></ConceptSection>
    {!!content.guidedQuestions?.length && <ConceptSection number="02" title="Guided questions"><div className="guided-questions">{content.guidedQuestions.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></ConceptSection>}
    <ConceptSection number="03" title="Internal mechanism">{content.mechanismSteps?.length ? <ol className="walkthrough-list">{content.mechanismSteps.map((step) => <li key={step.title}><div><strong>{step.title}</strong><p>{step.description}</p></div></li>)}</ol> : <p>{content.mechanism}</p>}</ConceptSection>
    <ConceptSection number="04" title="When to use it"><TextList items={content.whenToUse} /></ConceptSection>
    <ConceptSection number="05" title="When not to use it"><TextList items={content.whenNotToUse} /></ConceptSection>
    <ConceptSection number="06" title="Production use cases"><TextList items={scenarios} /></ConceptSection>
    {content.codeExamples.map((example, index) => <ConceptSection key={`${example.label}-${index}`} number="07" title={example.label}><pre className="concept-code" dir="ltr"><code>{example.code}</code></pre><p>{example.walkthrough}</p>{example.expectedResult && <p><strong>Expected result:</strong> {example.expectedResult}</p>}</ConceptSection>)}
    <ConceptSection number="08" title="Trade-offs and failure modes"><div className="trap-callout"><AlertTriangle aria-hidden="true" /><TextList items={failures} /></div></ConceptSection>
    {!!detail.references?.length && <ConceptSection number="09" title="Authoritative sources"><ul className="reference-list">{detail.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer"><strong>{reference.title}</strong><ExternalLink size={16} /></a><p>{[reference.publisher, reference.applicableVersion, reference.sectionLocator, reference.reviewedAt && `reviewed ${reference.reviewedAt}`].filter(Boolean).join(" - ")}</p></li>)}</ul></ConceptSection>}
  </article>;
}

function ConceptSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="learning-section"><span className="section-number">{number}</span><h2>{title}</h2>{children}</section>;
}

function TextList({ items }: { items: string[] }) {
  return <ul className="concept-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
