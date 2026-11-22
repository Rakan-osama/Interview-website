import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Lesson } from "../../entities/curriculum";

export function CompleteModelAnswer({ lesson }: { lesson: Lesson }) {
  return <details className="model-answer"><summary>Show the complete canonical interview answer</summary><div className="complete-answer">
    <header><span>Question</span><h3>{lesson.questionBrief.task}</h3></header>
    <AnswerSection number="1" title="Canonical answer" text={lesson.interview.modelAnswer} />
    {lesson.codeExamples.map((example, index) => <section key={`${example.label}-${index}`}><span className="answer-section-number">{index + 2}</span><div><h4>{example.label}</h4><pre dir="ltr"><code>{example.code}</code></pre><p>{example.walkthrough}</p></div></section>)}
    <section><CheckCircle2 /><div><h4>Why this answer is complete</h4><ul>{lesson.questionBrief.requirements.map((item) => <li key={item.id}><strong>{item.title}</strong>: {item.explanation}</li>)}</ul></div></section>
    {lesson.pitfall && <aside><AlertTriangle /><div><h4>Mistake to avoid</h4><p>{lesson.pitfall}</p></div></aside>}
  </div></details>;
}
function AnswerSection({ number, title, text }: { number: string; title: string; text: string }) {
  return <section><span className="answer-section-number">{number}</span><div><h4>{title}</h4><p>{text}</p></div></section>;
}
