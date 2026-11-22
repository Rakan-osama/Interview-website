import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Boxes, FolderKanban, Gauge, Layers3, Library, LogOut, Menu, Route, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiRequest, ensureCsrfCookie } from "../../shared/api/client";
import { useOnlineStatus } from "../../shared/hooks/useOnlineStatus";
import { useCurrentUser } from "../auth/useCurrentUser";

const primaryLinks = [
  ["/dashboard", "Training dashboard", Gauge], ["/tracks", "Learning tracks", BookOpen],
  ["/competencies", "Competency paths", Route],
  ["/progress", "My progress", TrendingUp], ["/concepts", "Concept library", Library],
] as const;
const practiceLinks = [
  ["/guides", "Feature design lab", Layers3], ["/projects", "Applied projects", FolderKanban],
  ["/resources", "Books and references", Boxes],
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
  const links = user.data?.role === "admin" ? [...practiceLinks, ["/admin", "Content management", Layers3] as const] : practiceLinks;

  return <div className="workspace" dir="ltr">
    <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-brand"><NavLink to="/dashboard" onClick={() => setMobileOpen(false)}><span>BL</span><div><strong>Backend Lab</strong><small>Software Engineering</small></div></NavLink><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button></div>
      <SidebarNav title="Learning workspace" links={primaryLinks} close={() => setMobileOpen(false)} />
      <SidebarNav title="Apply and design" links={links} close={() => setMobileOpen(false)} />
      <div className="sidebar-account"><div className="avatar">{user.data?.name.slice(0, 1).toUpperCase()}</div><div><strong dir="auto">{user.data?.name}</strong><small>{user.data?.email}</small></div><button title="Sign out" onClick={() => logout.mutate()}><LogOut size={18} /></button></div>
    </aside>
    {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <div className="workspace-main"><header className="workspace-header"><span>Learning workspace</span><span className={`connection ${online ? "online" : ""}`}>{online ? "Online — synchronization enabled" : "Offline — changes saved locally"}</span></header><main><Outlet /></main></div>
  </div>;
}

type NavTuple = readonly [string, string, typeof Gauge];
function SidebarNav({ title, links, close }: { title: string; links: readonly NavTuple[]; close: () => void }) {
  return <nav className="sidebar-nav" aria-label={title}><span>{title}</span>{links.map(([href, label, Icon]) => <NavLink key={href} to={href} onClick={close}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>;
}
