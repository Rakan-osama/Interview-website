import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";

type Dashboard = { completedLessons: number; totalLessons: number; averageScore: number; bookmarkedLessons: number };

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiRequest<Dashboard>("/me/dashboard"),
  });
  const values = data ?? { completedLessons: 0, totalLessons: 350, averageScore: 0, bookmarkedLessons: 0 };
  return (
    <div className="page">
      <section className="hero">
        <span className="muted">استثمارك الأهم… في نفسك</span>
        <h1>استعد لمقابلتك<br />بعقلية مهندس.</h1>
        <p>شرح عملي، تدريب منظم، تقييم واضح، وتقدم محفوظ على كل أجهزتك.</p>
        <Link className="button" to="/tracks">ابدأ التدريب <ArrowLeft size={18} /></Link>
      </section>
      <section className="grid" aria-label="ملخص التقدم">
        <Metric icon={<BookOpen />} label="دروس مكتملة" value={`${values.completedLessons} / ${values.totalLessons}`} />
        <Metric icon={<Target />} label="متوسط التقييم" value={`${values.averageScore.toFixed(1)} / 100`} />
        <Metric icon={<TrendingUp />} label="محفوظ للمراجعة" value={String(values.bookmarkedLessons)} />
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="card">{icon}<p>{label}</p><h2>{value}</h2></article>;
}
