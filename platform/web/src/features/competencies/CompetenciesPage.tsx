import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Route } from "lucide-react";
import { Link } from "react-router-dom";
import type { Competency } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";

export default function CompetenciesPage() {
  const query = useQuery({ queryKey: ["competencies"], queryFn: () => apiRequest<Competency[]>("/competencies") });
  if (query.isPending) return <div className="page-state">Loading competency paths...</div>;
  if (query.isError) return <div className="page-state error">The competency paths could not be loaded.</div>;

  return <div className="page competencies-page">
    <header className="section-intro"><span className="eyebrow">Four ordered engineering paths</span><h1>Build production backend competence.</h1><p>Each hub organizes canonical lessons into a deliberate sequence. Progress is shared with learning tracks, so a lesson completed anywhere is complete everywhere.</p></header>
    <div className="competency-grid">{query.data?.map((hub) => <article className="competency-card" key={hub.id}>
      <header><span className="competency-icon"><Route /></span><span>{hub.progress.total} lessons</span></header>
      <h2>{hub.title}</h2><p>{hub.summary}</p>
      <ul>{hub.outcomes.map((outcome) => <li key={outcome}><CheckCircle2 />{outcome}</li>)}</ul>
      <div className="progress-bar"><span style={{ width: `${hub.progress.percentage}%` }} /></div>
      <div className="competency-progress"><span>{hub.progress.completed}/{hub.progress.total} complete</span><strong>{hub.progress.percentage}%</strong></div>
      <Link className="card-link" to={`/competencies/${hub.slug}`}>Open competency <ArrowRight /></Link>
    </article>)}</div>
  </div>;
}
