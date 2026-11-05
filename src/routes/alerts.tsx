import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  Building2,
  Clock,
  HeartPulse,
  Radio,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";
import { getDoctor, patients } from "@/lib/data";
import { Crumbs, StatCard } from "@/components/shell";
import { PatientTable } from "@/components/patient-table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Critical Clinical Alerts · Meridian Clinical Analytics" },
      {
        name: "description",
        content: "High-acuity triage command center for critical patients (simulated demo dataset).",
      },
      { property: "og:title", content: "Critical Alerts · Meridian" },
      { property: "og:description", content: "Critical patients in the clinical dataset." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const criticalPatients = patients.filter((p) => p.status === "Critical");
  const affectedDepartments = Array.from(
    new Set(criticalPatients.map((p) => getDoctor(p.doctorId)?.specialization).filter(Boolean)),
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <Crumbs items={[{ label: "Hospital Overview", to: "/" }, { label: "Critical Alerts" }]} />

      {/* Emergency Command Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950 via-slate-900 to-navy p-6 text-white shadow-xl md:p-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span>Immediate Clinical Action Protocol</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
              Critical Inpatient Triage ({criticalPatients.length} Active Alarms)
            </h1>
            <p className="max-w-2xl text-xs text-slate-300 md:text-sm">
              Patients currently identified with severe clinical deterioration, vital telemetry instability, or acute intervention requirements (synthesized demo data).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2.5 text-xs text-white ring-1 ring-white/10">
              <Clock className="h-4 w-4 text-rose-400" />
              <div>
                <div className="font-semibold text-white">Rapid Response Available</div>
                <div className="text-[10px] text-slate-400">ICU Team Dispatched</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-600/15 blur-3xl" />
      </div>

      {/* Triage Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Critical Inpatients"
          value={`${criticalPatients.length}`}
          icon={AlertTriangle}
          tone="destructive"
          hint="Priority Level 1"
          trend="Immediate review"
        />
        <StatCard
          label="Services Affected"
          value={`${affectedDepartments.length}`}
          icon={Building2}
          tone="info"
          hint="Clinical departments"
          trend="Cardiology, ICU, Pulm"
        />
        <StatCard
          label="Total Monitored"
          value={`${patients.length}`}
          icon={Users}
          tone="primary"
          hint="Hospital-wide census"
          trend={`${Math.round((criticalPatients.length / patients.length) * 100)}% critical`}
        />
        <StatCard
          label="Telemetry Alarms"
          value={`${criticalPatients.length * 2}`}
          icon={Activity}
          tone="destructive"
          hint="Simulated sensor thresholds"
          trend="Telemetry Active"
        />
      </div>

      {/* Immediate Attention Patient Highlights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground">
            Critical Roster Quick Review
          </h2>
          <span className="text-xs text-muted-foreground">Select any card for immediate telemetry chart</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {criticalPatients.map((p) => {
            const doc = getDoctor(p.doctorId);
            const latest = p.vitals[p.vitals.length - 1]!;
            return (
              <Link
                key={p.id}
                to="/patients/$patientId"
                params={{ patientId: p.id }}
                className="card-interactive group flex flex-col justify-between p-4 border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-500/15 px-2 py-0.5 rounded">
                        {p.id}
                      </span>
                      <h3 className="mt-1 font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        Bed: <strong>{p.room}</strong> &bull; {p.age}y {p.gender}
                      </div>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                  </div>

                  <div className="mt-3 text-xs font-semibold text-rose-900 line-clamp-1">
                    {p.condition}
                  </div>

                  {/* Abnormal vitals preview */}
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-card/80 p-2 text-center text-[11px] border border-border">
                    <div>
                      <div className="text-muted-foreground">Heart Rate</div>
                      <div className="font-display font-bold text-rose-600">{latest.hr} BPM</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">SpO₂</div>
                      <div className="font-display font-bold text-rose-600">{latest.spo2}%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-border/60 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{doc?.name}</span>
                  <span className="font-semibold text-rose-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Chart <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Detailed Census Table */}
      <PatientTable
        rows={criticalPatients}
        showDoctor
        title="High-Acuity Patient Roster"
      />
    </div>
  );
}
