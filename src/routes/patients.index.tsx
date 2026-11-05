import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, Building2, CheckCircle2, HeartPulse, Users } from "lucide-react";
import { doctors, patients, specializations } from "@/lib/data";
import { Crumbs, StatCard } from "@/components/shell";
import { PatientTable } from "@/components/patient-table";

export const Route = createFileRoute("/patients/")({
  head: () => ({
    meta: [
      { title: "Inpatient Census & Directory · Meridian Clinical Analytics" },
      {
        name: "description",
        content: "Hospital-wide patient directory with real-time acuity filters (simulated demo data).",
      },
      { property: "og:title", content: "All Inpatients · Meridian" },
      { property: "og:description", content: "Hospital-wide patient directory (demo data)." },
    ],
  }),
  component: PatientsIndexPage,
});

function PatientsIndexPage() {
  const critical = patients.filter((p) => p.status === "Critical").length;
  const monitoring = patients.filter((p) => p.status === "Monitoring").length;
  const stable = patients.filter((p) => p.status === "Stable").length;
  const recovering = patients.filter((p) => p.status === "Recovering").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <Crumbs items={[{ label: "Hospital Overview", to: "/" }, { label: "Inpatient Census" }]} />

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Hospital-Wide Census</span>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Inpatient Master Directory
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete active inpatient roster across {specializations.length} clinical divisions and {doctors.length} attending services.
          </p>
        </div>
      </div>

      {/* Census KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Monitored"
          value={`${patients.length}`}
          icon={Users}
          tone="primary"
          hint="Active electronic health records"
          trend="87% Capacity"
        />
        <StatCard
          label="Critical Triage"
          value={`${critical}`}
          icon={AlertTriangle}
          tone="destructive"
          hint="Level 1 intensive review"
          trend="Immediate attention"
        />
        <StatCard
          label="Under Monitoring"
          value={`${monitoring}`}
          icon={Activity}
          tone="info"
          hint="Intermediate telemetry link"
          trend="Continuous vitals"
        />
        <StatCard
          label="Discharge Ready"
          value={`${stable + recovering}`}
          icon={HeartPulse}
          tone="success"
          hint="Progressing on care plan"
          trend="Favorable prognosis"
        />
      </div>

      {/* Complete Patient Census Table */}
      <PatientTable
        rows={patients}
        showDoctor
        title="Comprehensive Hospital Census"
      />
    </div>
  );
}
