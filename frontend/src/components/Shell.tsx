import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BookOpen, Compass, GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Settings, X } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useAuth, useCurrentUser } from "../auth/AuthContext";

export default function Shell() {
  const { signOut } = useAuth();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/courses", label: "My courses", icon: BookOpen },
    ...(user.role === "student" ? [{ to: "/tutor?intent=path", label: "Learning paths", icon: Compass }] : []),
    { to: "/tutor", label: "AI Tutor", icon: MessageCircle },
    ...(["admin", "instructor"].includes(user.role) ? [{ to: "/manage", label: user.role === "admin" ? "Manage platform" : "Manage courses", icon: user.role === "admin" ? Settings : BookOpen }] : []),
  ];
  return <div className="app-shell">
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <a className="brand" href="/"><span className="brand-icon"><GraduationCap size={21} /></span><span>smart<span className="brand-light">learning</span></span></a>
      <div className="workspace-label">LEARNING SPACE</div>
      <nav className="side-nav">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={label} to={to} end={end} onClick={() => setOpen(false)}><Icon size={18} /><span>{label}</span>{label === "AI Tutor" && <span className="new-dot" />}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="streak-card">
          <div className="streak-icon">✦</div><div><strong>7-day streak</strong><small>Little steps add up</small></div>
          <div className="week-dots">{["M", "T", "W", "T", "F", "S", "S"].map((day, i) => <span className={i < 4 ? "active" : ""} key={`${day}-${i}`}>{day}</span>)}</div>
        </div>
        <div className="profile-row"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div className="profile-info"><strong>{user.name}</strong><small>{user.role}</small></div><button className="icon-button" title="Sign out" onClick={() => { signOut(); navigate("/signin"); }}><LogOut size={17} /></button></div>
      </div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><span className="today-label">Keep your momentum going</span><button className="icon-button" aria-label="Settings"><Settings size={18} /></button><div className="avatar avatar-small">{user.name.slice(0, 1).toUpperCase()}</div></div></header><div className="page-content"><Outlet /></div></main>
  </div>;
}
