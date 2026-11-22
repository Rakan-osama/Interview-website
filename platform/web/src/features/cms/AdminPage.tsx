import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, ensureCsrfCookie } from "../../shared/api/client";
import type { LearningSource, LessonVisual } from "../../entities/curriculum";
import { TechnicalDiagram } from "../../shared/components/TechnicalDiagram";

type Criterion = { label: string; description: string; terms: string[]; evidenceGroups: string[][]; weight: number };
type LessonEditor = {
  version: number; title: string; objective: string; explanation: string; plainExplanation: string;
  practicalExample: string; interviewQuestion: string; modelAnswer: string; code: string;
  referenceSolution: string; commonMistake: string; pitfall: string; rubric: Criterion[];
  sources: LearningSource[]; visuals: LessonVisual[];
};
type ContentAudit = {
  counts: Record<string, number>;
  schemaV3Concepts: number;
  issues: Record<string, number>;
  reviews: Record<string, number>;
  reviewPolicy: string;
};
const fields: Array<[keyof LessonEditor, string, number]> = [
  ["title", "Lesson title", 2], ["objective", "Objective", 4], ["explanation", "Full explanation", 10],
  ["plainExplanation", "Plain-language explanation", 6], ["practicalExample", "Practical example", 6],
  ["interviewQuestion", "Interview question", 5], ["modelAnswer", "Model answer", 8], ["code", "Optional code", 8],
  ["referenceSolution", "Reference solution", 8], ["commonMistake", "Common mistake", 5], ["pitfall", "Pitfall", 5],
];

export default function AdminPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lookup, setLookup] = useState(lessonId ?? "");
  const form = useForm<LessonEditor>({ defaultValues: { rubric: [] } });
  const preview = useWatch({ control: form.control });
  const criteria = useFieldArray({ control: form.control, name: "rubric" });
  const lesson = useQuery({ queryKey: ["admin-lesson", lessonId], queryFn: () => apiRequest<LessonEditor>(`/lessons/${lessonId}`), enabled: Boolean(lessonId) });
  const audit = useQuery({ queryKey: ["content-audit"], queryFn: () => apiRequest<ContentAudit>("/admin/content-audit"), enabled: !lessonId });
  useEffect(() => { if (lesson.data) form.reset(lesson.data); }, [lesson.data, form]);
  const save = useMutation({
    mutationFn: async (values: LessonEditor) => {
      await ensureCsrfCookie();
      return apiRequest(`/admin/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify({
        version: values.version, title: values.title, objective: values.objective, explanation: values.explanation,
        plain_explanation: values.plainExplanation, practical_example: values.practicalExample,
        interview_question: values.interviewQuestion, model_answer: values.modelAnswer, code: values.code || null,
        reference_solution: values.referenceSolution || null, common_mistake: values.commonMistake || null,
        pitfall: values.pitfall || null, criteria: values.rubric.map((criterion) => ({
          label: criterion.label, description: criterion.description, terms: criterion.terms,
          evidence_groups: criterion.evidenceGroups, weight: criterion.weight,
        })),
      }) });
    },
    onSuccess: () => void lesson.refetch(),
  });
  const review = useMutation({ mutationFn: async (status: "editorial_reviewed" | "needs_update") => {
    await ensureCsrfCookie();
    return apiRequest(`/admin/content/lesson/${lessonId}/review`, { method: "PUT", body: JSON.stringify({ status, notes: status === "editorial_reviewed" ? "Technical claims and source locators reviewed in the CMS." : "Editorial correction is required." }) });
  } });
  if (!lessonId) return <div className="page admin-audit"><section className="card form-card"><h1>Content management</h1><p>Open a lesson by its ULID to edit it with revision history.</p><label className="form-field">Lesson ULID<input value={lookup} onChange={(event) => setLookup(event.target.value)} /></label><button className="button" disabled={!lookup} onClick={() => navigate(`/admin/lessons/${lookup}`)}>Open editor</button></section>
    {audit.data && <section className="card"><h2>Curriculum audit</h2><p>{audit.data.reviewPolicy}</p><div className="audit-metrics">{Object.entries(audit.data.counts).map(([label, total]) => <article key={label}><strong>{total}</strong><span>{label}</span></article>)}</div><h3>Automated issues</h3><ul>{Object.entries(audit.data.issues).map(([label, total]) => <li key={label}><strong>{total}</strong> {label}</li>)}</ul><p><strong>{audit.data.schemaV3Concepts}</strong> schema-v3 concepts are available.</p></section>}
    {audit.isError && <div className="page-state error">The audit is available only to administrators.</div>}
  </div>;
  if (lesson.isPending) return <div className="page-state">Loading editor…</div>;
  if (lesson.isError) return <div className="page-state error">The lesson could not be loaded, or you need to sign in.</div>;
  return <div className="page"><h1>Content management</h1><div className="lesson-layout">
    <form className="card" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
      {fields.map(([name, label, rows]) => <label className="form-field" key={name}>{label}<textarea rows={rows} {...form.register(name as keyof LessonEditor)} /></label>)}
      <h2>Claims and weighted rubric</h2>{criteria.fields.map((criterion, index) => <fieldset className="card" key={criterion.id}><legend>Criterion {index + 1}</legend><label className="form-field">Label<input {...form.register(`rubric.${index}.label`)} /></label><label className="form-field">Canonical claim<textarea rows={3} {...form.register(`rubric.${index}.description`)} /></label><label className="form-field">Evidence groups (semicolon between groups, comma between aliases)<input defaultValue={criterion.evidenceGroups.map((group) => group.join(", ")).join("; ")} onChange={(event) => {
        const groups = event.target.value.split(";").map((group) => group.split(",").map((alias) => alias.trim()).filter(Boolean)).filter((group) => group.length);
        form.setValue(`rubric.${index}.evidenceGroups`, groups);
        form.setValue(`rubric.${index}.terms`, groups.flat());
      }} /></label><label className="form-field">Weight<input type="number" min="1" max="100" {...form.register(`rubric.${index}.weight`, { valueAsNumber: true })} /></label></fieldset>)}
      <button className="button" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save and publish"}</button>
      {save.isSuccess && <p role="status">Published with a restorable revision.</p>}{save.isError && <p className="error">Save failed. Refresh if another administrator changed this version.</p>}
      <div className="review-actions"><button type="button" className="button secondary" onClick={() => review.mutate("editorial_reviewed")}>Mark editorially reviewed</button><button type="button" className="button secondary" onClick={() => review.mutate("needs_update")}>Mark as needing an update</button></div>
      {review.isSuccess && <p role="status">Review status updated.</p>}{review.isError && <p className="error">The review status could not be updated.</p>}
    </form>
    <aside className="reading" aria-live="polite"><small>Learner preview</small><h1>{preview.title}</h1><h2>Objective</h2><p>{preview.objective}</p><h2>Explanation</h2><p>{preview.explanation}</p><h2>Interview question</h2><p>{preview.interviewQuestion}</p>{preview.code && <><h2>Code preview</h2><pre dir="ltr"><code>{preview.code}</code></pre></>}{preview.visuals?.map((visual) => visual.id ? <TechnicalDiagram key={visual.id} visual={visual as LessonVisual} /> : null)}{preview.sources?.length ? <><h2>Selected sources</h2><ul>{preview.sources.map((source) => <li key={source.url}>{source.title}</li>)}</ul></> : null}</aside>
  </div></div>;
}
