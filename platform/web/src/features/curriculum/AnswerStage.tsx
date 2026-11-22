import { Check, CheckCircle2, CloudAlert, LoaderCircle, Save, Target } from "lucide-react";
import type { Lesson } from "../../entities/curriculum";
import { apiErrorMessage } from "../../shared/api/client";

const minimumAnswerLength = 35;
type AnswerStageProps = {
  lesson: Lesson;
  answer: string;
  setAnswer: (answer: string) => void;
  saveStatus: "waiting" | "saving" | "saved" | "error";
  saveError: unknown;
  saveNow: () => void;
  submitting: boolean;
  submitError: unknown;
  submit: () => void;
};

export function AnswerStage(props: AnswerStageProps) {
  const { lesson, answer, setAnswer, saveStatus, saveError, saveNow, submitting, submitError, submit } = props;
  return <div className="training-body answer-stage">
    <span className="status-pill">Technical interview simulation</span>
    <section className="interview-brief">
      <span className="lesson-block-label">Production scenario</span><p>{lesson.questionBrief.context}</p>
      <span className="lesson-block-label">Interview question</span><h2>{lesson.questionBrief.task}</h2>
      <h3>Your answer must support these claims</h3>
      <ul>{lesson.questionBrief.requirements.map((requirement) => <li key={requirement.id}><Check size={18} /><div><strong>{requirement.title}</strong><p>{requirement.explanation}</p></div></li>)}</ul>
      <details className="answer-structure" open>
        <summary>How should I structure the answer?</summary>
        <p>Follow this sequence so your answer is direct, technically complete, and easy for the interviewer to evaluate.</p>
        <ol>{lesson.questionBrief.answerStructure.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}</ol>
      </details>
    </section>
    <label htmlFor={`answer-${lesson.id}`}>Your answer</label>
    <textarea id={`answer-${lesson.id}`} dir="auto" value={answer} onChange={(event) => setAnswer(event.target.value)} onBlur={saveNow} placeholder="Give a direct answer, explain the mechanism, apply it to the scenario, then cover trade-offs and verification…" />
    <div className={`answer-save-state ${saveStatus}`} role="status">
      {saveStatus === "saving" && <><LoaderCircle className="spin" /> Saving your answer…</>}
      {saveStatus === "saved" && <><CheckCircle2 /> This question’s answer is saved to your account.</>}
      {saveStatus === "waiting" && <><Save /> Your answer will save automatically after you pause.</>}
      {saveStatus === "error" && <><CloudAlert /> {apiErrorMessage(saveError, "The answer could not be saved. Check the connection and try again.")}</>}
    </div>
    <div className="answer-actions">
      <span>{answer.length} characters · minimum {minimumAnswerLength}</span>
      <button className="button" disabled={answer.trim().length < minimumAnswerLength || submitting} onClick={submit}><Target size={17} />{submitting ? "Submitting…" : "Evaluate my answer"}</button>
    </div>
    {submitError !== null && submitError !== undefined && <p className="error" role="alert">{apiErrorMessage(submitError, "The answer could not be submitted for evaluation. Try again.")}</p>}
    <p className="muted"><small>Each answer is stored independently. When you sign in again, your latest answer, assessment, and progress will still be available.</small></p>
  </div>;
}
