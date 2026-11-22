import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Circle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { Competency } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";

export default function CompetencyDetailPage() {
  const { slug } = useParams();
  const query = useQuery({ queryKey: ["competency", slug], queryFn: () => apiRequest<Competency>(`/competencies/${slug}`) });
  if (query.isPending) return <div className="page-state">Loading competency...</div>;
  if (!query.data) return <div className="page-state error">The competency could not be found.</div>;
  const hub = query.data;

  return <div className="page competency-detail"><Link className="back-link" to="/competencies">All competencies</Link>
    <header className="competency-hero"><div><span className="eyebrow">Ordered competency path</span><h1>{hub.title}</h1><p>{hub.summary}</p></div><div className="track-score"><strong>{hub.progress.completed}/{hub.progress.total}</strong><span>lessons complete</span></div></header>
    <section className="competency-outcomes"><h2>What you will be able to do</h2><ul>{hub.outcomes.map((outcome) => <li key={outcome}><Check />{outcome}</li>)}</ul></section>
    {hub.modules.map((module, moduleIndex) => <section className="competency-module" key={module.id}>
      <header><span>{String(moduleIndex + 1).padStart(2, "0")}</span><div><h2>{module.title}</h2><p>{module.summary}</p></div><strong>{module.progress.completed}/{module.progress.total}</strong></header>
      <div>{module.lessons?.map((lesson, lessonIndex) => <Link className="lesson-row" key={lesson.id} to={`/tracks/${lesson.track.slug}/lessons/${lesson.slug}`}>
        <span className={`lesson-index ${lesson.completed ? "done" : ""}`}>{lesson.completed ? <Check /> : String(lessonIndex + 1).padStart(2, "0")}</span>
        <div><strong>{lesson.title}</strong><small>{lesson.track.title}</small></div>{lesson.completed ? <span className="status-pill">Complete</span> : <Circle />}<ArrowRight />
      </Link>)}</div>
    </section>)}
  </div>;
}
