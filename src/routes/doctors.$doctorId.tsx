import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  BellRing,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  HeartPulse,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { getDoctor, patientsOf } from "@/lib/data";
import { Crumbs, StatCard } from "@/components/shell";
import { PatientTable } from "@/components/patient-table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctors/$doctorId")({
  loader: ({ params }) => {
    const doctor = getDoctor(params.doctorId);
    if (!doctor) throw notFound();
    return { doctor };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.doctor.name} · Physician Dashboard` : "Physician · Meridian" },
      { name: "description", content: "Dedicated physician dashboard and assigned inpatient census." },
      { property: "og:title", content: loaderData ? `${loaderData.doctor.name} Clinical Dashboard` : "Doctor Dashboard" },
      { property: "og:description", content: "Physician clinical census and telemetry (demo data)." },
    ],
  }),
  component: DoctorPage,
});

function DoctorPage() {
  const { doctor } = Route.useLoaderData();
  const rows = patientsOf(doctor.id);

  const criticalCount = rows.filter((p) => p.status === "Critical").length;
  const monitoringCount = rows.filter((p) => p.status === "Monitoring").length;
  const stableCount = rows.filter((p) => p.status === "Stable").length;
  const recoveringCount = rows.filter((p) => p.status === "Recovering").length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Crumbs
          items={[
            { label: "Hospital Overview", to: "/" },
            { label: "Doctors", to: "/" },
            { label: doctor.name },
          ]}
        />

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Hospital Overview</span>
        </Link>
      </div>

      {/* Physician Executive Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-border bg-gradient-to-br from-navy via-navy-surface to-slate-900 text-white shadow-xl">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Physician Avatar */}
            <div className="relative shrink-0">
              <img
                src={doctor.photo}
                alt={doctor.name}
                width={112}
                height={112}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-card/10 shadow-lg ring-2 ring-primary/40"
              />
              <span
                className={cn(
                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-navy",
                  doctor.available ? "bg-emerald-400" : "bg-slate-400",
                )}
                title={doctor.available ? "Available" : "In Surgery / Off-Duty"}
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {doctor.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    doctor.available
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "bg-white/10 text-navy-muted",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      doctor.available ? "bg-emerald-400 animate-pulse" : "bg-slate-400",
                    )}
                  />
                  {doctor.available ? "Available for Consult" : "In Surgery / On Call"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-teal-300">{doctor.specialization} &bull; Attending Physician</span>
                <span className="text-navy-muted">&bull;</span>
                <span className="text-navy-muted">{doctor.department}</span>
              </div>

              <p className="max-w-2xl text-xs leading-relaxed text-navy-muted pt-1">
                {doctor.bio}
              </p>
            </div>
          </div>

          {/* Quick Badges & Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-navy-border/60 pt-4 lg:border-t-0 lg:pt-0">
            <div className="flex items-center gap-2 rounded-xl bg-navy-accent/70 px-3.5 py-2 text-xs text-white ring-1 ring-white/10">
              <Award className="h-4 w-4 text-primary" />
              <div>
                <div className="font-bold">{doctor.experience} Years</div>
                <div className="text-[10px] text-navy-muted">Clinical Experience</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-navy-accent/70 px-3.5 py-2 text-xs text-white ring-1 ring-white/10">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <div>
                <div className="font-bold">{doctor.rating.toFixed(1)} / 5.0</div>
                <div className="text-[10px] text-navy-muted">Physician Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physician Roster KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Assigned Inpatients"
          value={`${rows.length}`}
          icon={Users}
          tone="primary"
          hint="Dedicated care team"
          trend="100% telemetry linked"
        />
        <StatCard
          label="Critical Attention"
          value={`${criticalCount}`}
          icon={AlertTriangle}
          tone="destructive"
          hint="Immediate review required"
          trend={criticalCount > 0 ? "Active Alarms" : "Normal"}
        />
        <StatCard
          label="Under Monitoring"
          value={`${monitoringCount}`}
          icon={Activity}
          tone="info"
          hint="Intermediate care telemetry"
          trend="Hourly checks"
        />
        <StatCard
          label="Stable / Recovering"
          value={`${stableCount + recoveringCount}`}
          icon={HeartPulse}
          tone="success"
          hint="Progressing to discharge"
          trend="Low Risk"
        />
      </div>

      {/* Doctor's Acuity Bar */}
      <div className="card-surface p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2">
          <span className="font-semibold text-foreground">Physician Census Acuity Breakdown</span>
          <span className="text-muted-foreground">{rows.length} Total Patients</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="bg-rose-500"
            style={{ width: `${(criticalCount / rows.length) * 100}%` }}
            title={`Critical: ${criticalCount}`}
          />
          <div
            className="bg-amber-500"
            style={{ width: `${(monitoringCount / rows.length) * 100}%` }}
            title={`Monitoring: ${monitoringCount}`}
          />
          <div
            className="bg-cyan-500"
            style={{ width: `${(recoveringCount / rows.length) * 100}%` }}
            title={`Recovering: ${recoveringCount}`}
          />
          <div
            className="bg-emerald-500"
            style={{ width: `${(stableCount / rows.length) * 100}%` }}
            title={`Stable: ${stableCount}`}
          />
        </div>
      </div>

      {/* Patient Table for this Doctor */}
      <PatientTable
        rows={rows}
        showDoctor={false}
        title={`${doctor.name}'s Assigned Inpatients`}
      />
    </div>
  );
}
