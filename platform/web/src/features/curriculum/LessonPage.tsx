import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Assessment } from "../../entities/assessment";
import type { Lesson, Track } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";
import { queueMutation } from "../../shared/offline/mutationQueue";
import { AnswerStage } from "./AnswerStage";
import { AssessmentReview } from "./AssessmentReview";
import { LessonLearningStage } from "./LessonLearningStage";
import { usePersistedLessonAnswer } from "./usePersistedLessonAnswer";

type TrainingTab = "learn" | "answer" | "review";
export default function LessonPage() {
  const { trackSlug = "", lessonSlug = "" } = useParams();
  return <LessonExperience key={`${trackSlug}:${lessonSlug}`} trackSlug={trackSlug} lessonSlug={lessonSlug} />;
}

function LessonExperience({ trackSlug, lessonSlug }: { trackSlug: string; lessonSlug: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TrainingTab>("learn");
  const lessonQuery = useQuery({ queryKey: ["lesson", trackSlug, lessonSlug], queryFn: () => apiRequest<Lesson>(`/tracks/${trackSlug}/lessons/${lessonSlug}`) });
  const trackQuery = useQuery({ queryKey: ["track", trackSlug], queryFn: () => apiRequest<Track>(`/tracks/${trackSlug}`) });
  const savedAnswer = usePersistedLessonAnswer(lessonQuery.data, trackSlug);
  const assessment = useMutation({
    mutationFn: async () => {
      const lesson = lessonQuery.data!;
      const path = `/lessons/${lesson.id}/attempts`;
      if (!navigator.onLine) {
        await queueMutation({ path, method: "POST", body: { answer: savedAnswer.answer } });
        return { id: crypto.randomUUID(), status: "pending" } as Assessment;
      }
      return apiRequest<Assessment>(path, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ answer: savedAnswer.answer }) });
    },
    onSuccess: () => { markLessonCompleted(queryClient, trackSlug, lessonQuery.data!.id); setTab("review"); },
  });
  const result = useQuery({
    queryKey: ["assessment", assessment.data?.id],
    queryFn: () => apiRequest<Assessment>(`/attempts/${assessment.data!.id}`),
    enabled: Boolean(assessment.data?.id && navigator.onLine),
    refetchInterval: (query) => !query.state.data || query.state.data.status === "pending" ? 1500 : false,
  });
  useEffect(() => {
    if (result.data?.status === "completed" || result.data?.status === "fallback") {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["tracks"] });
    }
  }, [queryClient, result.data?.status]);

  if (lessonQuery.isPending) return <div className="page-state">Loading the lesson…</div>;
  if (!lessonQuery.data) return <div className="page-state error">The lesson could not be found.</div>;
  const lesson = lessonQuery.data;
  const current = result.data ?? assessment.data ?? lesson.learnerState.assessment ?? undefined;

  return <div className="page training-page">
    <Link className="back-link" to={`/tracks/${trackSlug}`}>All lessons in {lesson.track.title}</Link>
    <header className="training-heading"><div><span className="eyebrow">{lesson.track.title}</span><h1>{lesson.title}</h1></div><span>{lesson.sortOrder + 1} / {trackQuery.data?.lessons.length ?? "…"}</span></header>
    <div className="training-layout">
      <LessonNavigation track={trackQuery.data} trackSlug={trackSlug} lessonSlug={lessonSlug} />
      <section className="training-panel">
        <TrainingTabs tab={tab} setTab={setTab} />
        {tab === "learn" && <LessonLearningStage lesson={lesson} startAnswer={() => setTab("answer")} />}
        {tab === "answer" && <AnswerStage lesson={lesson} answer={savedAnswer.answer} setAnswer={savedAnswer.setAnswer} saveStatus={savedAnswer.saveStatus} saveError={savedAnswer.saveError} saveNow={savedAnswer.saveNow} submitting={assessment.isPending} submitError={assessment.error} submit={() => assessment.mutate()} />}
        {tab === "review" && <AssessmentReview current={current} lesson={lesson} startAnswer={() => setTab("answer")} loading={result.isFetching} />}
      </section>
    </div>
  </div>;
}

function LessonNavigation({ track, trackSlug, lessonSlug }: { track?: Track; trackSlug: string; lessonSlug: string }) {
  return <aside className="training-parts"><strong>Lessons in this track</strong>{track?.lessons.map((item, index) => <Link className={item.slug === lessonSlug ? "active" : ""} key={item.id} to={`/tracks/${trackSlug}/lessons/${item.slug}`}><span className={item.completed ? "completed" : ""}>{item.completed ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</span><b>{item.title}</b></Link>)}</aside>;
}

function TrainingTabs({ tab, setTab }: { tab: TrainingTab; setTab: (tab: TrainingTab) => void }) {
  return <div className="training-tabs">
    <button className={tab === "learn" ? "active" : ""} onClick={() => setTab("learn")}><small>01</small> Learn</button>
    <button className={tab === "answer" ? "active" : ""} onClick={() => setTab("answer")}><small>02</small> Answer</button>
    <button className={tab === "review" ? "active" : ""} onClick={() => setTab("review")}><small>03</small> Review</button>
  </div>;
}

function markLessonCompleted(queryClient: ReturnType<typeof useQueryClient>, trackSlug: string, lessonId: string) {
  queryClient.setQueryData<Track>(["track", trackSlug], (track) => track ? { ...track, lessons: track.lessons.map((item) => item.id === lessonId ? { ...item, completed: true } : item) } : track);
  void queryClient.invalidateQueries({ queryKey: ["tracks"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}
