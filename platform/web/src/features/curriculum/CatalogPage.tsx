import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Track } from "../../entities/curriculum";
import { apiRequest } from "../../shared/api/client";

const groups = ["all", "PHP", "Laravel", "Backend", "AI", "Engineering", "Feature Design"];
export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const { data = [], isPending, isError } = useQuery({ queryKey: ["tracks"], queryFn: () => apiRequest<Track[]>("/tracks") });
  const visible = useMemo(() => data.filter((track) => (group === "all" || trackGroup(track) === group) && `${track.title} ${track.description}`.toLowerCase().includes(search.toLowerCase())), [data, group, search]);
  if (isPending) return <div className="page-state">Loading learning tracks…</div>;
  if (isError) return <div className="page-state error">The learning tracks could not be loaded.</div>;
  return <div className="page">
    <header className="catalog-heading"><div><span className="eyebrow">{data.length} tracks · {data.reduce((total, track) => total + track.lessons.length, 0)} lessons</span><h1>Build one engineering skill at a time.</h1><p>Move from language fundamentals to production architecture, reliability, security, and design decisions.</p></div><label className="catalog-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tracks…" /></label></header>
    <div className="filter-row">{groups.map((name) => <button className={group === name ? "active" : ""} onClick={() => setGroup(name)} key={name}>{name === "all" ? "All curriculum" : name}</button>)}</div>
    <div className="track-grid">{visible.map((track) => { const completed = track.lessons.filter((lesson) => lesson.completed).length; return <article className="track-card" key={track.id}>
      <div className="track-card-top"><span className="track-icon"><BookOpen /></span><small>{trackGroup(track)}</small></div><h2>{track.title}</h2><p>{track.description}</p>
      <div className="track-meta"><span>{track.lessons.length} lessons</span><span>{completed ? `${completed}/${track.lessons.length} complete` : "Not started"}</span></div><div className="progress-bar"><span style={{ width: `${completed / Math.max(track.lessons.length, 1) * 100}%` }} /></div><Link className="card-link" to={`/tracks/${track.slug}`}>View track <ArrowRight size={17} /></Link>
    </article>; })}</div>
    {!visible.length && <div className="empty-state">No tracks match the search. Try PHP, security, or payments.</div>}
  </div>;
}
function trackGroup(track: Track): string {
  if (track.slug.startsWith("software-engineering-")) return "Engineering";
  const index = Number(track.lessons[0]?.legacyKey?.split("-")[0] ?? 0);
  if (index >= 38) return "Feature Design";
  if (index >= 26) return "Engineering";
  if (index <= 2) return "PHP";
  if (index === 3) return "Laravel";
  if (index === 9) return "AI";
  return "Backend";
}
