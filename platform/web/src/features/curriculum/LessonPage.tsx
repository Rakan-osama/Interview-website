import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Target } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Assessment } from "../../entities/assessment";
import type { Lesson, Track } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";
import { queueMutation } from "../../shared/offline/mutationQueue";

type TrainingTab = "learn" | "answer" | "review";

export default function LessonPage() {
  const { trackSlug, lessonSlug } = useParams();
  const [answer, setAnswer] = useState("");
  const [tab, setTab] = useState<TrainingTab>("learn");
  const lessonQuery = useQuery({ queryKey: ["lesson", trackSlug, lessonSlug], queryFn: () => apiRequest<Lesson>(`/tracks/${trackSlug}/lessons/${lessonSlug}`) });
  const trackQuery = useQuery({ queryKey: ["track", trackSlug], queryFn: () => apiRequest<Track>(`/tracks/${trackSlug}`) });
  const assessment = useMutation({
    mutationFn: async () => {
      const path = `/lessons/${lessonQuery.data!.id}/attempts`;
      if (!navigator.onLine) { await queueMutation({ path, method: "POST", body: { answer } }); return { id: crypto.randomUUID(), status: "pending" } as Assessment; }
      return apiRequest<Assessment>(path, { method: "POST", body: JSON.stringify({ answer }) });
    },
    onSuccess: () => setTab("review"),
  });
  const result = useQuery({ queryKey: ["assessment", assessment.data?.id], queryFn: () => apiRequest<Assessment>(`/attempts/${assessment.data!.id}`), enabled: Boolean(assessment.data?.id && navigator.onLine), refetchInterval: (query) => query.state.data?.status === "pending" ? 1500 : false });
  if (lessonQuery.isPending) return <div className="page-state">جاري تحميل التدريب…</div>;
  if (!lessonQuery.data) return <div className="page-state error">التدريب غير موجود.</div>;
  const lesson = lessonQuery.data;
  const current = result.data ?? assessment.data;
  return <div className="page training-page"><Link className="back-link" to={`/tracks/${trackSlug}`}>كل أجزاء {lesson.track.title}</Link>
    <header className="training-heading"><div><span className="eyebrow">{lesson.track.titleAr}</span><h1 dir="ltr">{lesson.title}</h1></div><span>{lesson.sortOrder + 1} / {trackQuery.data?.lessons.length ?? "…"}</span></header>
    <div className="training-layout"><aside className="training-parts"><strong>في المسار ده</strong>{trackQuery.data?.lessons.map((item, index) => <Link className={item.slug === lessonSlug ? "active" : ""} key={item.id} to={`/tracks/${trackSlug}/lessons/${item.slug}`}><span>{item.completed ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</span><b dir="ltr">{item.title}</b></Link>)}</aside>
      <section className="training-panel"><div className="training-tabs"><button className={tab === "learn" ? "active" : ""} onClick={() => setTab("learn")}><small>01</small> افهم الفكرة</button><button className={tab === "answer" ? "active" : ""} onClick={() => setTab("answer")}><small>02</small> جرّب تجاوب</button><button className={tab === "review" ? "active" : ""} onClick={() => setTab("review")}><small>03</small> التقييم والمراجعة</button></div>
        {tab === "learn" && <article className="training-body"><span className="status-pill">شرح المفهوم من الفكرة للتطبيق</span><h2>{lesson.title}</h2><h3>الهدف</h3><p>{lesson.objective}</p><h3>الشرح</h3><p>{lesson.explanation}</p>{lesson.plainExplanation && <><h3>ببساطة</h3><p>{lesson.plainExplanation}</p></>}{lesson.code && <pre dir="ltr"><code>{lesson.code}</code></pre>}<div className="warning-note"><strong>خد بالك</strong><p>{lesson.pitfall}</p></div><h3>وأنت بتجاوب فكّر في</h3><div className="rubric-chips">{lesson.rubric.map((item) => <span key={item.id}><Check size={14} />{item.label}</span>)}</div><button className="button" onClick={() => setTab("answer")}>جاهز؟ جرّب السؤال <ArrowLeft size={17} /></button></article>}
        {tab === "answer" && <div className="training-body answer-stage"><span className="status-pill">Mock interview · +2 years</span><h2 dir="ltr">{lesson.interviewQuestion}</h2><label htmlFor="answer">إجابتك</label><textarea id="answer" dir="auto" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="اشرح الحل، الـtrade-offs، وإزاي هتختبره…" /><div className="answer-actions"><span>{answer.length} حرف · محفوظ على الجهاز أثناء الكتابة</span><button className="button" disabled={answer.trim().length < 35 || assessment.isPending} onClick={() => assessment.mutate()}><Target size={17} />{assessment.isPending ? "جاري الإرسال…" : "قيّم إجابتي"}</button></div><p className="muted"><small>تجنب المعلومات الشخصية أو السرية. التقييم يتم من الخادم، والمزود الخارجي لا يُستخدم إلا إذا فعّله المسؤول.</small></p></div>}
        {tab === "review" && <ReviewStage current={current} modelAnswer={lesson.modelAnswer} startAnswer={() => setTab("answer")} />}
      </section>
    </div>
  </div>;
}

function ReviewStage({ current, modelAnswer, startAnswer }: { current?: Assessment; modelAnswer: string; startAnswer: () => void }) {
  return <div className="training-body review-stage">
    {!current ? <div className="empty-state"><Target /><h2>إجابتك هي أول خطوة</h2><p>اكتب إجابتك في الجزء الثاني ليظهر التقييم هنا.</p><button className="button" onClick={startAnswer}>اكتب إجابتك</button></div> : <>
      <h2>حالة التقييم: {current.status}</h2>
      {current.overallScore != null && <div className="score-block"><strong>{current.overallScore}</strong><span>/ 100</span></div>}
      {current.strengths?.length > 0 && <><h3>نقاط القوة</h3><ul>{current.strengths.map((item) => <li key={item}>{item}</li>)}</ul></>}
      {current.nextSteps?.length > 0 && <><h3>الخطوات التالية</h3><ul>{current.nextSteps.map((item) => <li key={item}>{item}</li>)}</ul></>}
    </>}
    <details className="model-answer"><summary>اعرض الإجابة النموذجية</summary><p dir="ltr">{modelAnswer}</p></details>
  </div>;
}
