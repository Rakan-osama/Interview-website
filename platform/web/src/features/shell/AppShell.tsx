import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Boxes, FolderKanban, Gauge, Layers3, Library, LogOut, Menu, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiRequest, ensureCsrfCookie } from "../../shared/api/client";
import { useOnlineStatus } from "../../shared/hooks/useOnlineStatus";
import { useCurrentUser } from "../auth/useCurrentUser";

const primaryLinks = [
  ["/dashboard", "لوحة التدريب", Gauge], ["/tracks", "مسارات التعلّم", BookOpen],
  ["/progress", "تقدّمي", TrendingUp], ["/concepts", "مكتبة المفاهيم", Library],
] as const;
const practiceLinks = [
  ["/guides", "معمل تصميم Features", Layers3], ["/projects", "المشاريع التطبيقية", FolderKanban],
  ["/resources", "الكتب والمراجع", Boxes],
] as const;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const online = useOnlineStatus();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useMutation({
    mutationFn: async () => { await ensureCsrfCookie(); return apiRequest("/auth/logout", { method: "POST" }); },
    onSuccess: () => { queryClient.clear(); navigate("/login", { replace: true }); },
  });
  const links = user.data?.role === "admin" ? [...practiceLinks, ["/admin", "إدارة المحتوى", Layers3] as const] : practiceLinks;
  return <div className="workspace" dir="rtl">
    <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة"><Menu /></button>
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-brand"><NavLink to="/dashboard" onClick={() => setMobileOpen(false)}><span>BL</span><div><strong>Backend Lab</strong><small>Software Engineering</small></div></NavLink><button onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة"><X /></button></div>
      <SidebarNav title="مساحة التعلّم" links={primaryLinks} close={() => setMobileOpen(false)} />
      <SidebarNav title="تطبيق وتصميم" links={links} close={() => setMobileOpen(false)} />
      <div className="sidebar-account"><div className="avatar">{user.data?.name.slice(0, 1).toUpperCase()}</div><div><strong>{user.data?.name}</strong><small>{user.data?.email}</small></div><button title="تسجيل الخروج" onClick={() => logout.mutate()}><LogOut size={18} /></button></div>
    </aside>
    {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" />}
    <div className="workspace-main"><header className="workspace-header"><span>مساحة التعلّم</span><span className={`connection ${online ? "online" : ""}`}>{online ? "متصل — المزامنة مفعلة" : "غير متصل — الحفظ محلي"}</span></header><main><Outlet /></main></div>
  </div>;
}

type NavTuple = readonly [string, string, typeof Gauge];
function SidebarNav({ title, links, close }: { title: string; links: readonly NavTuple[]; close: () => void }) {
  return <nav className="sidebar-nav" aria-label={title}><span>{title}</span>{links.map(([href, label, Icon]) => <NavLink key={href} to={href} onClick={close}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>;
}
