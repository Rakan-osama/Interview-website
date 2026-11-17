import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, ensureCsrfCookie } from "../../shared/api/client";

type Criterion = { label: string; terms: string[]; weight: number };
type LessonEditor = {
  version: number; title: string; objective: string; explanation: string; plainExplanation: string;
  practicalExample: string; interviewQuestion: string; modelAnswer: string; code: string;
  referenceSolution: string; commonMistake: string; pitfall: string; rubric: Criterion[];
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
  const criteria = useFieldArray({ control: form.control, name: "rubric" });
  const lesson = useQuery({ queryKey: ["admin-lesson", lessonId], queryFn: () => apiRequest<LessonEditor>(`/lessons/${lessonId}`), enabled: Boolean(lessonId) });
  useEffect(() => { if (lesson.data) form.reset(lesson.data); }, [lesson.data, form]);
  const save = useMutation({
    mutationFn: async (values: LessonEditor) => {
      await ensureCsrfCookie();
      return apiRequest(`/admin/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify({
        version: values.version, title: values.title, objective: values.objective, explanation: values.explanation,
        plain_explanation: values.plainExplanation, practical_example: values.practicalExample,
        interview_question: values.interviewQuestion, model_answer: values.modelAnswer, code: values.code || null,
        reference_solution: values.referenceSolution || null, common_mistake: values.commonMistake || null,
        pitfall: values.pitfall || null, criteria: values.rubric,
      }) });
    },
    onSuccess: () => void lesson.refetch(),
  });
  if (!lessonId) return <div className="page"><section className="card form-card"><h1>Content management</h1><p>Open a lesson by its ULID to edit it with revision history.</p><label className="form-field">Lesson ULID<input value={lookup} onChange={(event) => setLookup(event.target.value)} /></label><button className="button" disabled={!lookup} onClick={() => navigate(`/admin/lessons/${lookup}`)}>Open editor</button></section></div>;
  if (lesson.isPending) return <div className="page-state">Loading editor…</div>;
  if (lesson.isError) return <div className="page-state error">The lesson could not be loaded, or you need to sign in.</div>;
  const preview = form.watch();
  return <div className="page"><h1>Content management</h1><div className="lesson-layout">
    <form className="card" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
      {fields.map(([name, label, rows]) => <label className="form-field" key={name}>{label}<textarea rows={rows} {...form.register(name as keyof LessonEditor)} /></label>)}
      <h2>Weighted rubric</h2>{criteria.fields.map((criterion, index) => <fieldset className="card" key={criterion.id}><legend>Criterion {index + 1}</legend><label className="form-field">Label<input {...form.register(`rubric.${index}.label`)} /></label><label className="form-field">Terms (comma separated)<input defaultValue={criterion.terms.join(", ")} onChange={(event) => form.setValue(`rubric.${index}.terms`, event.target.value.split(",").map((term) => term.trim()).filter(Boolean))} /></label><label className="form-field">Weight<input type="number" min="1" max="100" {...form.register(`rubric.${index}.weight`, { valueAsNumber: true })} /></label></fieldset>)}
      <button className="button" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save and publish"}</button>
      {save.isSuccess && <p role="status">Published with a restorable revision.</p>}{save.isError && <p className="error">Save failed. Refresh if another administrator changed this version.</p>}
    </form>
    <aside className="reading" aria-live="polite"><small>Learner preview</small><h1>{preview.title}</h1><h2>Objective</h2><p>{preview.objective}</p><h2>Explanation</h2><p>{preview.explanation}</p><h2>Interview question</h2><p>{preview.interviewQuestion}</p></aside>
  </div></div>;
}
