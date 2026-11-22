import { CheckCircle2, LoaderCircle, RotateCcw, Target, XCircle } from "lucide-react";
import type { Assessment } from "../../entities/assessment";
import type { Lesson } from "../../entities/curriculum";
import { CompleteModelAnswer } from "./CompleteModelAnswer";

const labels = { pending: "Analyzing the answer", completed: "Assessment complete", fallback: "Local assessment complete", failed: "Assessment failed" };
export function AssessmentReview({ current, lesson, startAnswer, loading }: { current?: Assessment; lesson: Lesson; startAnswer: () => void; loading: boolean }) {
  return <div className="training-body review-stage">
    {!current ? <div className="empty-state"><Target /><h2>Your answer is the first step</h2><p>Write an answer in the second tab to see claim-by-claim feedback here.</p><button className="button" onClick={startAnswer}>Write my answer</button></div> : <>
      <div className={`assessment-status ${current.status}`}>
        {current.status === "pending" || loading ? <LoaderCircle className="spin" /> : current.status === "failed" ? <XCircle /> : <CheckCircle2 />}
        <div><span>Assessment status</span><h2>{labels[current.status]}</h2>{current.status === "pending" && <p>Each rubric claim is being checked. This page updates automatically.</p>}</div>
      </div>
      {current.status === "failed" && <div className="assessment-failed"><p>The assessment did not complete. Confirm that the API and queue worker are running, then submit the answer again.</p><button className="button secondary" onClick={startAnswer}><RotateCcw size={17} /> Return to answer</button></div>}
      {current.overallScore != null && <div className="score-summary"><div className="score-block"><strong>{current.overallScore}</strong><span>/ 100</span></div><div><h3>{current.overallScore >= 70 ? "Strong answer" : "This answer needs development"}</h3><p>The score is based on the lesson claims, not the length of the answer.</p></div></div>}
      {current.criteria?.length > 0 && <section><h3>Claim-by-claim analysis</h3><div className="criteria-results">{current.criteria.map((criterion) => <article className={criterion.met ? "met" : "gap"} key={criterion.criterionId}><header><strong>{criterion.label}</strong><span>{criterion.score}%</span></header><p><b>Evidence:</b> <span dir="auto">{criterion.evidence}</span></p>{criterion.feedback && <p><b>How to improve:</b> {criterion.feedback}</p>}</article>)}</div></section>}
      <FeedbackList title="Strengths" items={current.strengths} className="strength-list" />
      <FeedbackList title="Gaps" items={current.gaps} className="gap-list" />
      <FeedbackList title="Next steps" items={current.nextSteps} className="next-list" />
    </>}
    <CompleteModelAnswer lesson={lesson} />
  </div>;
}
function FeedbackList({ title, items, className }: { title: string; items?: string[]; className: string }) {
  if (!items?.length) return null;
  return <section className={className}><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
