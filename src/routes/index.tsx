import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  HeartPulse,
  Radio,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { doctors, patients, patientsOf, specializations } from "@/lib/data";
import { StatCard, inputCls } from "@/components/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hospital Overview · Meridian Clinical Analytics" },
      {
        name: "description",
        content: "Enterprise clinical intelligence operations center and attending physician roster.",
      },
      { property: "og:title", content: "Hospital Overview · Meridian" },
      { property: "og:description", content: "Clinical team and inpatient census (simulated demo data)." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  const [availFilter, setAvailFilter] = useState<"all" | "available" | "unavailable">("all");

  const critical = patients.filter((p) => p.status === "Critical").length;
  const monitoring = patients.filter((p) => p.status === "Monitoring").length;
  const stable = patients.filter((p) => p.status === "Stable").length;
  const recovering = patients.filter((p) => p.status === "Recovering").length;

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSpec = spec === "All" || d.specialization === spec;
      const matchesSearch =
        !q.trim() ||
        (d.name + d.specialization + d.department + d.bio)
          .toLowerCase()
          .includes(q.toLowerCase().trim());
      const matchesAvail =
        availFilter === "all" ||
        (availFilter === "available" && d.available) ||
        (availFilter === "unavailable" && !d.available);
      return matchesSpec && matchesSearch && matchesAvail;
    });
  }, [q, spec, availFilter]);

  // Department distribution metrics
  const departmentStats = useMemo(() => {
    return specializations.map((s) => {
      const doc = doctors.find((d) => d.specialization === s);
      const docPatients = doc ? patientsOf(doc.id) : [];
      const criticalInDept = docPatients.filter((p) => p.status === "Critical").length;
      return {
        specialization: s,
        doctorName: doc?.name ?? "",
        doctorId: doc?.id ?? "",
        total: docPatients.length,
        critical: criticalInDept,
        floor: doc?.department ?? "",
      };
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Executive Command Header */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-border bg-gradient-to-r from-navy via-navy-surface to-slate-900 p-6 text-white shadow-xl md:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-teal-300">
              <Radio className="h-3.5 w-3.5 animate-pulse text-teal-400" />
              <span>Clinical Operations Command Center</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Hospital Overview &amp; Attending Staff
            </h1>
            <p className="max-w-2xl text-xs text-navy-muted md:text-sm">
              Real-time inpatient census, telemetry risk stratification, and attending physician roster for St. Meridian Medical Center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-navy-border bg-navy-accent/80 px-4 py-2.5 text-xs">
              <Clock className="h-4 w-4 text-teal-400" />
              <div>
                <div className="font-semibold text-white">Day Shift 07:00–19:00</div>
                <div className="text-[10px] text-navy-muted">Telemetry Synced &bull; 100% Census Active</div>
              </div>
            </div>

            <Link
              to="/alerts"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:from-rose-500 hover:to-rose-600 ring-1 ring-rose-400/30"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{critical} Critical Alerts</span>
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attending Staff"
          value={`${doctors.length}`}
          icon={Stethoscope}
          tone="primary"
          hint={`${doctors.filter((d) => d.available).length} on clinical duty · 2 in OR/call`}
          trend="10 Specialties"
        />
        <StatCard
          label="Inpatient Census"
          value={`${patients.length}`}
          icon={Users}
          tone="info"
          hint="Across 10 clinical services"
          trend="87% Bed Occupancy"
        />
        <StatCard
          label="Critical Alerts"
          value={`${critical}`}
          icon={AlertTriangle}
          tone="destructive"
          hint="Requires immediate clinical review"
          trend={`${Math.round((critical / patients.length) * 100)}% of census`}
        />
        <StatCard
          label="Telemetry Monitoring"
          value={`${monitoring + critical}`}
          icon={Activity}
          tone="success"
          hint="Continuous vital signs streaming"
          trend="99.8% signal reliability"
        />
      </div>

      {/* Hospital Acuity & Department Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Acuity Distribution Card */}
        <div className="card-surface p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Inpatient Acuity Stratification</h3>
              <p className="text-xs text-muted-foreground">Distribution across all {patients.length} admitted patients</p>
            </div>
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              Census 100%
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="mt-2 flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${(critical / patients.length) * 100}%` }}
              title={`Critical: ${critical}`}
            />
            <div
              className="bg-amber-500 transition-all duration-500"
              style={{ width: `${(monitoring / patients.length) * 100}%` }}
              title={`Monitoring: ${monitoring}`}
            />
            <div
              className="bg-cyan-500 transition-all duration-500"
              style={{ width: `${(recovering / patients.length) * 100}%` }}
              title={`Recovering: ${recovering}`}
            />
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${(stable / patients.length) * 100}%` }}
              title={`Stable: ${stable}`}
            />
          </div>

          {/* Legend Items */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-semibold text-rose-800">Critical</span>
              </div>
              <span className="font-display font-bold text-rose-900">{critical}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-800">Monitoring</span>
              </div>
              <span className="font-display font-bold text-amber-900">{monitoring}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <span className="font-semibold text-cyan-800">Recovering</span>
              </div>
              <span className="font-display font-bold text-cyan-900">{recovering}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-800">Stable</span>
              </div>
              <span className="font-display font-bold text-emerald-900">{stable}</span>
            </div>
          </div>
        </div>

        {/* Department Census Load */}
        <div className="card-surface p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Clinical Specialty Census</h3>
              <p className="text-xs text-muted-foreground">Department capacity and critical triage flags</p>
            </div>
            <Link to="/patients" className="text-xs font-semibold text-primary hover:underline">
              View All Census →
            </Link>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {departmentStats.map((dep) => (
              <Link
                key={dep.specialization}
                to="/doctors/$doctorId"
                params={{ doctorId: dep.doctorId }}
                className="group flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-3 transition hover:border-primary/40 hover:bg-card hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-bold text-foreground group-hover:text-primary">
                      {dep.specialization}
                    </span>
                    {dep.critical > 0 && (
                      <span className="rounded-full bg-rose-500/15 px-1.5 py-0.2 text-[10px] font-bold text-rose-600">
                        {dep.critical}!
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{dep.floor}</div>
                </div>

                <div className="mt-3 flex items-baseline justify-between border-t border-border/40 pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Patients</span>
                  <span className="font-display text-sm font-bold text-foreground">{dep.total}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Attending Physicians Section */}
      <section id="doctors" className="space-y-6 pt-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <UserCheck className="h-4 w-4" />
              <span>Medical Staff Roster</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              Attending Physicians ({filteredDoctors.length} of {doctors.length})
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Select any physician to open their dedicated dashboard and assigned patient directory.
            </p>
          </div>

          {/* Availability Pills */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setAvailFilter("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition",
                availFilter === "all" ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              All Staff ({doctors.length})
            </button>
            <button
              onClick={() => setAvailFilter("available")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition",
                availFilter === "available"
                  ? "bg-emerald-500/15 text-emerald-800 font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Available ({doctors.filter((d) => d.available).length})
            </button>
            <button
              onClick={() => setAvailFilter("unavailable")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition",
                availFilter === "unavailable"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              In Surgery / On Call ({doctors.filter((d) => !d.available).length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by physician name, specialty, bio, or department…"
              className={cn(inputCls, "w-full pl-10 pr-8 text-xs")}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Specialty:</span>
            <select
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className={cn(inputCls, "h-11 min-w-[170px] text-xs font-semibold")}
              aria-label="Filter Specialization"
            >
              <option value="All">All Specialties ({specializations.length})</option>
              {specializations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 10 Professional Doctor Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredDoctors.map((d) => {
            const assigned = patientsOf(d.id);
            const critCount = assigned.filter((p) => p.status === "Critical").length;
            const monCount = assigned.filter((p) => p.status === "Monitoring").length;

            return (
              <Link
                key={d.id}
                to="/doctors/$doctorId"
                params={{ doctorId: d.id }}
                className="card-interactive group flex flex-col justify-between overflow-hidden p-5"
              >
                <div>
                  {/* Doctor Avatar & Badges */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={d.photo}
                        alt={d.name}
                        loading="lazy"
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border group-hover:ring-primary/40 transition"
                      />
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card",
                          d.available ? "bg-emerald-500" : "bg-slate-400",
                        )}
                        title={d.available ? "Available" : "In Surgery / Off-Duty"}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {d.name}
                      </h3>
                      <div className="font-semibold text-primary text-xs truncate">{d.specialization}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{d.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Pill */}
                  <div className="mt-3.5 flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        d.available
                          ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                          : "bg-muted text-muted-foreground ring-1 ring-border",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          d.available ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground",
                        )}
                      />
                      {d.available ? "Available for Consult" : "In Surgery / On Call"}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{d.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {d.bio}
                  </p>
                </div>

                {/* Patient Roster Summary Footer */}
                <div className="mt-4 border-t border-border/60 pt-3">
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/40 p-2 text-center">
                    <div>
                      <div className="font-display text-xs font-bold text-foreground">{d.experience}y</div>
                      <div className="text-[10px] text-muted-foreground">Practice</div>
                    </div>
                    <div>
                      <div className="font-display text-xs font-bold text-foreground">{assigned.length}</div>
                      <div className="text-[10px] text-muted-foreground">Patients</div>
                    </div>
                    <div>
                      <div
                        className={cn(
                          "font-display text-xs font-bold",
                          critCount > 0 ? "text-rose-600" : "text-foreground",
                        )}
                      >
                        {critCount > 0 ? `${critCount}!` : "0"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Critical</div>
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>View Physician Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="card-surface p-12 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <h3 className="mt-3 font-display text-base font-bold text-foreground">No physicians found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              No medical staff matched the search query &ldquo;{q}&rdquo; with the selected filters.
            </p>
            <button
              onClick={() => {
                setQ("");
                setSpec("All");
                setAvailFilter("all");
              }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
