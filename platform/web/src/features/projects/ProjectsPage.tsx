import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FolderKanban, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { apiRequest } from "../../shared/api/client";

type ProjectContent = { objective: string; requirements: string[]; deliverables: string[]; reviewQuestions: string[] };
type Project = { id: string; title: string; description: string; content: ProjectContent };
export default function ProjectsPage() {
  const query = useQuery({ queryKey: ["projects"], queryFn: () => apiRequest<Project[]>("/projects") });
  if (query.isPending) return <div className="page-state">Loading projects…</div>;
  if (query.isError) return <div className="page-state error">The projects could not be loaded.</div>;
  return <div className="page"><header className="section-intro"><span className="eyebrow">Prove understanding with a working system</span><h1>Applied production engineering projects</h1><p>Choose one project, document its invariants, implement it incrementally, and keep test results and architecture decisions as evidence.</p></header>
    <div className="mastery-strip"><span><b>01</b> Define invariants and boundaries</span><span><b>02</b> Implement and test behavior</span><span><b>03</b> Inject failure and review recovery</span></div>
    <div className="project-list">{query.data.map((project, index) => <article className="project-card" key={project.id}><div className="project-number"><FolderKanban /><span>Project {index + 1}</span></div><h2>{project.title}</h2><p>{project.content.objective || project.description}</p><ProjectList title="Engineering requirements" items={project.content.requirements} icon={<ShieldAlert />} /><ProjectList title="Required deliverables" items={project.content.deliverables} icon={<CheckCircle2 />} /><ProjectList title="Design review questions" items={project.content.reviewQuestions} icon={<CheckCircle2 />} /></article>)}</div>
  </div>;
}
function ProjectList({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return <section className="project-section"><h3>{icon}{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
