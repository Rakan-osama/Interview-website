import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";
import { StructuredContent } from "../../shared/components/StructuredContent";
import { ConceptReader, type ConceptDetail } from "./ConceptReader";

type Detail = { title: string; group?: string; content?: unknown; references?: ConceptDetail["references"]; summary?: string; domain?: string; sections?: Array<{ id: string; type: string; title?: string; content: unknown }> };
export default function LibraryDetailPage() {
  const { slug } = useParams();
  const root = useLocation().pathname.startsWith("/guides") ? "guides" : "concepts";
  const query = useQuery({ queryKey: [root, slug], queryFn: () => apiRequest<Detail>(`/${root}/${slug}`) });
  if (query.isPending) return <div className="page-state">Loading content…</div>;
  if (!query.data) return <div className="page-state error">The requested content could not be found.</div>;
  const detail = query.data;
  if (root === "concepts") return <ConceptReader detail={detail as ConceptDetail} />;
  return <article className="page library-reader"><Link className="back-link" to={`/${root}`}>Back to the library</Link><header><span className="eyebrow">{detail.domain ?? "Feature design guide"}</span><h1>{detail.title}</h1>{detail.summary && <p>{detail.summary}</p>}</header>{detail.content != null && <section className="reader-section"><StructuredContent value={detail.content} /></section>}{detail.sections?.map((section, index) => <section className="reader-section" key={section.id}><span className="section-number">{String(index + 1).padStart(2, "0")}</span><h2>{section.title ?? section.type}</h2><StructuredContent value={section.content} /></section>)}</article>;
}
