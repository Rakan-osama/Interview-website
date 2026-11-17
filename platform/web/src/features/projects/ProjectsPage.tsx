import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FlaskConical, FolderKanban } from "lucide-react";
import { apiRequest } from "../../shared/api/client";

type ProjectContent = { brief: string; skills: string[]; deliverables: string[]; failureDrills: string[]; review: string; extensions: string };
type Project = { id: string; title: string; content: ProjectContent };

export default function ProjectsPage() {
  const query = useQuery({ queryKey: ["projects"], queryFn: () => apiRequest<Project[]>("/projects") });
  if (query.isPending) return <div className="page-state">جاري تحميل المشاريع…</div>;
  if (query.isError) return <div className="page-state error">تعذّر تحميل المشاريع.</div>;
  return <div className="page"><header className="section-intro"><span className="eyebrow">اختبر فهمك في شيء يعمل</span><h1>مشاريع تطبيقية تثبت الأساس</h1><p>اختر مشروعًا واحدًا، نفّذه تدريجيًا، واحتفظ بنتائج الاختبارات والقرارات كدليل.</p></header>
    <div className="mastery-strip"><span><b>01</b> افهم وحدد الـinvariants</span><span><b>02</b> طبّق واختبر السلوك</span><span><b>03</b> اكسر الحل وراجعه</span></div>
    <div className="project-list">{query.data.map((project, index) => <article className="project-card" key={project.id}>
      <div className="project-number"><FolderKanban /><span>مشروع {index + 1}</span></div><h2>{project.title}</h2><p>{project.content.brief}</p>
      <div className="skill-tags">{project.content.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      <ProjectList title="المخرجات المطلوبة" items={project.content.deliverables} icon={<CheckCircle2 />} />
      <ProjectList title="تجارب الفشل" items={project.content.failureDrills} icon={<FlaskConical />} />
      <div className="review-note"><strong>معيار المراجعة</strong><p>{project.content.review}</p></div>
      <details><summary>امتدادات بعد ثبات الأساس</summary><p>{project.content.extensions}</p></details>
    </article>)}</div>
  </div>;
}

function ProjectList({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return <section className="project-section"><h3>{icon}{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
