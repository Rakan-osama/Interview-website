import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Circle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { Track } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";

export default function TrackPage() {
  const { trackSlug } = useParams();
  const query = useQuery({ queryKey: ["track", trackSlug], queryFn: () => apiRequest<Track>(`/tracks/${trackSlug}`) });
  if (query.isPending) return <div className="page-state">Loading the track…</div>;
  if (!query.data) return <div className="page-state error">The track could not be found.</div>;
  const track = query.data;
  const completed = track.lessons.filter((lesson) => lesson.completed).length;
  return <div className="page"><Link className="back-link" to="/tracks">All learning tracks</Link>
    <header className="track-header"><div><span className="eyebrow">Interview curriculum</span><h1>{track.title}</h1><p>{track.description}</p></div><div className="track-score"><strong>{completed}/{track.lessons.length}</strong><span>lessons complete</span></div></header>
    <section className="lesson-sequence"><h2>Lessons in this track</h2><p className="muted">Follow the sequence or open any lesson for review.</p>{track.lessons.map((lesson, index) => <Link key={lesson.id} to={`/tracks/${track.slug}/lessons/${lesson.slug}`} className="lesson-row"><span className={`lesson-index ${lesson.completed ? "done" : ""}`}>{lesson.completed ? <Check size={17} /> : String(index + 1).padStart(2, "0")}</span><div><strong>{lesson.title}</strong><small>{lesson.objective || "Explanation, production scenario, interview question, and assessment"}</small></div>{lesson.completed ? <span className="status-pill">Complete</span> : <Circle size={15} />}<ArrowRight size={18} /></Link>)}</section>
  </div>;
}
