import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";

type LibraryItem = { id: string; slug: string; title: string; summary?: string; description?: string; group?: string; domain?: string; type?: string; url?: string };
const sections = {
  "/concepts": { title: "Concept library", subtitle: "Study each engineering idea from definition and mechanism through production trade-offs.", endpoint: "/concepts", detail: true },
  "/guides": { title: "Feature design lab", subtitle: "Production design guides covering invariants, boundaries, state, failure recovery, APIs, and verification.", endpoint: "/guides", detail: true },
  "/resources": { title: "Books and references", subtitle: "Authoritative sources selected to deepen each stage of the curriculum.", endpoint: "/resources", detail: false },
} as const;

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const location = useLocation();
  const section = sections[location.pathname as keyof typeof sections] ?? sections["/concepts"];
  const query = useQuery({ queryKey: [section.endpoint], queryFn: () => apiRequest<LibraryItem[]>(section.endpoint) });
  const groups = useMemo(() => ["All", ...new Set((query.data ?? []).map((item) => item.group).filter(Boolean) as string[])], [query.data]);
  const visible = useMemo(() => (query.data ?? []).filter((item) => (group === "All" || item.group === group) && `${item.title} ${item.summary ?? ""} ${item.description ?? ""} ${item.group ?? ""} ${item.domain ?? ""}`.toLowerCase().includes(search.toLowerCase())), [query.data, search, group]);
  if (query.isPending) return <div className="page-state">Loading {section.title.toLowerCase()}…</div>;
  if (query.isError) return <div className="page-state error">The library could not be loaded.</div>;
  return <div className="page"><header className="catalog-heading"><div><span className="eyebrow">Knowledge base</span><h1>{section.title}</h1><p>{section.subtitle}</p></div><label className="catalog-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search content…" /></label></header>
    {section.endpoint === "/concepts" && <div className="filter-row" aria-label="Filter concepts by domain">{groups.map((name) => <button className={group === name ? "active" : ""} key={name} onClick={() => setGroup(name)}>{name}</button>)}</div>}
    <p className="result-count">Showing {visible.length} of {query.data?.length ?? 0}</p>
    <div className="library-grid">{visible.map((item) => <article className="library-card" key={item.id}><div className="library-card-icon"><BookOpen /></div><span>{item.group ?? item.domain ?? item.type ?? "Reference"}</span><h2>{item.title}</h2><p>{item.summary ?? item.description ?? "Definition, mechanism, use cases, trade-offs, examples, and authoritative sources."}</p>{item.url ? <a className="card-link" href={item.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={16} /></a> : section.detail ? <Link className="card-link" to={`${location.pathname}/${item.slug}`}>Read details <ArrowUpRight size={16} /></Link> : null}</article>)}</div>
    {!visible.length && <div className="empty-state">No matching results.</div>}
  </div>;
}
