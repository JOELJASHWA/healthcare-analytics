import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { doctors, patients, type Status } from "@/lib/data";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeTone?: "destructive" | "primary" | "muted";
  exact?: boolean;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapsed state on desktop
  useEffect(() => {
    try {
      const saved = localStorage.getItem("meridian_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("meridian_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const path = useRouterState({ select: (s) => s.location.pathname });

  const criticalCount = patients.filter((p) => p.status === "Critical").length;
  const totalReportsCount = patients.reduce((acc, p) => acc + p.reports.length, 0);

  const navItems: NavItem[] = [
    { to: "/", label: "Hospital Overview", icon: LayoutDashboard, exact: true },
    { to: "/patients", label: "Patients Census", icon: Users, badge: patients.length, badgeTone: "primary" },
    { to: "/alerts", label: "Critical Alerts", icon: AlertTriangle, badge: criticalCount, badgeTone: "destructive" },
    { to: "/reports", label: "Diagnostic Reports", icon: FileText, badge: totalReportsCount, badgeTone: "muted" },
  ];

  const isActive = (item: NavItem) => {
    if (item.exact) return path === "/";
    return path.startsWith(item.to);
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-navy-border bg-navy text-navy-foreground transition-all duration-300 ease-in-out",
          // Mobile visibility
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop collapsed width
          collapsed ? "lg:w-20" : "lg:w-72",
          "w-72",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-navy-border px-5">
          <Link to="/" className="flex items-center gap-3 overflow-hidden" onClick={() => setMobileOpen(false)}>
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-700 shadow-md ring-2 ring-primary/30">
              <HeartPulse className="h-6 w-6 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy bg-emerald-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold tracking-tight text-white">Meridian</span>
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">v2.4</span>
                </div>
                <div className="text-[11px] font-medium tracking-wide text-navy-muted">Clinical Intelligence</div>
              </div>
            )}
          </Link>

          {/* Mobile close */}
          <button
            className="rounded-lg p-1.5 text-navy-muted hover:bg-navy-accent hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop collapse button */}
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              className="hidden rounded-lg p-1.5 text-navy-muted transition-colors hover:bg-navy-accent hover:text-white lg:block"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed expansion trigger button on desktop */}
        {collapsed && (
          <div className="hidden border-b border-navy-border p-2.5 lg:flex lg:justify-center">
            <button
              onClick={toggleCollapsed}
              className="rounded-lg p-2 text-navy-muted transition-colors hover:bg-navy-accent hover:text-white"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-navy-muted">
              Clinical Workspace
            </div>
          )}

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-navy-accent text-white shadow-sm ring-1 ring-white/10"
                      : "text-navy-muted hover:bg-navy-accent/50 hover:text-white",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      active ? "text-primary" : "text-navy-muted group-hover:text-white",
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                            item.badgeTone === "destructive"
                              ? "bg-destructive/20 text-red-300 ring-1 ring-destructive/40"
                              : item.badgeTone === "primary"
                              ? "bg-primary/20 text-teal-300"
                              : "bg-white/10 text-navy-muted",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge !== undefined && item.badgeTone === "destructive" && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-navy animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Doctor Roster Shortcut */}
          {!collapsed && (
            <div className="mt-8 border-t border-navy-border pt-6">
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-navy-muted">Staff On Duty</span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {doctors.filter((d) => d.available).length}/{doctors.length} Online
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {doctors.slice(0, 4).map((doc) => (
                  <Link
                    key={doc.id}
                    to="/doctors/$doctorId"
                    params={{ doctorId: doc.id }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-navy-muted transition hover:bg-navy-accent/40 hover:text-white"
                  >
                    <img src={doc.photo} alt={doc.name} className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10" />
                    <span className="truncate font-medium">{doc.name}</span>
                    <span className="ml-auto text-[10px] text-navy-muted">{doc.specialization.slice(0, 4)}</span>
                  </Link>
                ))}
                <Link
                  to="/"
                  className="mt-1 px-3 text-xs font-semibold text-primary hover:underline"
                  onClick={() => setMobileOpen(false)}
                >
                  View all 10 physicians →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Status & Physician Card */}
        <div className="border-t border-navy-border p-4">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-navy-border bg-navy-surface/80 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Telemetry Stream Active
                </div>
                <p className="mt-1 text-[11px] text-navy-muted">
                  Simulated demo sensor feed &bull; Day shift 07:00–19:00
                </p>
              </div>

              {/* Physician signature */}
              <div className="flex items-center gap-3 px-1 pt-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-xs font-bold text-teal-300">
                  AH
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-white">Dr. Amelia Hart</div>
                  <div className="truncate text-[11px] text-navy-muted">Chief of Clinical Service</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-navy-accent text-xs font-bold text-teal-300 ring-1 ring-white/10">
                AH
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-navy bg-emerald-500" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Radio className="h-3.5 w-3.5 animate-pulse text-primary" />
                St. Meridian Medical Center
              </div>
              <div className="hidden text-sm font-medium text-muted-foreground sm:block">
                Clinical Analytics &bull; Inpatient Telemetry Command
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick alert indicator */}
            {criticalCount > 0 && (
              <Link
                to="/alerts"
                className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
              >
                <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                <span>{criticalCount} Critical Alerts</span>
              </Link>
            )}

            {/* Demo data badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Synthesized Demo Data</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-8 md:px-8">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-border bg-card/50 py-5 text-center text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-4 sm:flex-row md:px-8">
            <div>&copy; 2026 Meridian Clinical Analytics Platform &bull; Enterprise Healthcare Intelligence</div>
            <div className="text-[11px]">Notice: Synthetic medical telemetry for demonstration only.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function Crumbs({
  items,
}: {
  items: { label: string; to?: string; params?: Record<string, string> }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
          {it.to ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link to={it.to as any} params={it.params as any} className="font-medium hover:text-primary transition-colors">
              {it.label}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

const statusConfig: Record<
  Status,
  { bg: string; text: string; ring: string; dot: string; label: string }
> = {
  Stable: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Stable",
  },
  Monitoring: {
    bg: "bg-amber-500/10",
    text: "text-amber-800",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
    label: "Monitoring",
  },
  Critical: {
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    ring: "ring-rose-500/30",
    dot: "bg-rose-600 animate-pulse",
    label: "Critical",
  },
  Recovering: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-800",
    ring: "ring-cyan-500/20",
    dot: "bg-cyan-500",
    label: "Recovering",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status] ?? statusConfig.Stable;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        cfg.bg,
        cfg.text,
        cfg.ring,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "destructive" | "info" | "success";
  hint?: string;
  trend?: string;
}) {
  const tones = {
    primary: "bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20",
    destructive: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
    info: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
  };

  return (
    <div className="card-surface group relative overflow-hidden p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-105", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold tracking-tight text-foreground">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-600">{trend}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export const inputCls =
  "h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70";
