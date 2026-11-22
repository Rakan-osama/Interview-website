import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Target, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";

type Dashboard = { completedLessons: number; totalLessons: number; averageScore: number; bookmarkedLessons: number };
export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => apiRequest<Dashboard>("/me/dashboard") });
  const values = data ?? { completedLessons: 0, totalLessons: 0, averageScore: 0, bookmarkedLessons: 0 };
  return <div className="page">
    <section className="hero"><span className="muted">Your most important investment is your engineering judgment</span><h1>Prepare for interviews<br />like a software engineer.</h1><p>Learn the mechanism, practice a specific production scenario, receive claim-based feedback, and keep your progress across devices.</p><Link className="button" to="/tracks">Start training <ArrowRight size={18} /></Link></section>
    <section className="grid" aria-label="Progress summary"><Metric icon={<BookOpen />} label="Completed lessons" value={`${values.completedLessons} / ${values.totalLessons}`} /><Metric icon={<Target />} label="Average score" value={`${values.averageScore.toFixed(1)} / 100`} /><Metric icon={<TrendingUp />} label="Saved for review" value={String(values.bookmarkedLessons)} /></section>
  </div>;
}
function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <article className="card">{icon}<p>{label}</p><h2>{value}</h2></article>;
}
