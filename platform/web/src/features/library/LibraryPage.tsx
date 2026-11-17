import { useQuery } from "@tanstack/react-query";
import { ArrowUpLeft, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";

type LibraryItem = { id: string; slug: string; title: string; summary?: string; description?: string; group?: string; domain?: string; type?: string; url?: string };
const sections = {
  "/concepts": { title: "مكتبة المفاهيم", subtitle: "راجع الأساسيات والمفاهيم المرتبطة بالمسارات.", endpoint: "/concepts", detail: true },
  "/guides": { title: "معمل تصميم Features", subtitle: "دراسات تصميم كاملة: flow، failure modes، APIs واختبارات.", endpoint: "/guides", detail: true },
  "/resources": { title: "الكتب والمراجع", subtitle: "مصادر منظمة لتوسيع كل مرحلة من خطة التعلم.", endpoint: "/resources", detail: false },
} as const;

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("الكل");
  const location = useLocation();
  const section = sections[location.pathname as keyof typeof sections] ?? sections["/concepts"];
  const query = useQuery({ queryKey: [section.endpoint], queryFn: () => apiRequest<LibraryItem[]>(section.endpoint) });
  const groups = useMemo(() => ["الكل", ...new Set((query.data ?? []).map((item) => item.group).filter(Boolean) as string[])], [query.data]);
  const visible = useMemo(() => (query.data ?? []).filter((item) => (group === "الكل" || item.group === group) && `${item.title} ${item.summary ?? ""} ${item.description ?? ""} ${item.group ?? ""} ${item.domain ?? ""}`.toLowerCase().includes(search.toLowerCase())), [query.data, search, group]);
  if (query.isPending) return <div className="page-state">جاري تحميل {section.title}…</div>;
  if (query.isError) return <div className="page-state error">تعذّر تحميل المكتبة.</div>;
  return <div className="page"><header className="catalog-heading"><div><span className="eyebrow">Knowledge base</span><h1>{section.title}</h1><p>{section.subtitle}</p></div><label className="catalog-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في المحتوى…" /></label></header>
    {section.endpoint === "/concepts" && <div className="filter-row" aria-label="تصفية المفاهيم حسب المجال">{groups.map((name) => <button className={group === name ? "active" : ""} key={name} onClick={() => setGroup(name)}>{name}</button>)}</div>}
    <p className="result-count">عرض {visible.length} من {query.data?.length ?? 0}</p>
    <div className="library-grid">{visible.map((item) => <article className="library-card" key={item.id}><div className="library-card-icon"><BookOpen /></div><span>{item.group ?? item.domain ?? item.type ?? "مرجع"}</span><h2 dir="auto">{item.title}</h2><p>{item.summary ?? item.description ?? "شرح مبسط، مثال عملي، خطوات، أخطاء شائعة واختبار فهم."}</p>
      {item.url ? <a className="card-link" href={item.url} target="_blank" rel="noreferrer">افتح المصدر <ArrowUpLeft size={16} /></a> : section.detail ? <Link className="card-link" to={`${location.pathname}/${item.slug}`}>اقرأ التفاصيل <ArrowUpLeft size={16} /></Link> : null}
    </article>)}</div>{!visible.length && <div className="empty-state">لا توجد نتائج مطابقة.</div>}
  </div>;
}
