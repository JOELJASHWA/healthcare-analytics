import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  FlaskConical,
  HeartPulse,
  Image as ImageIcon,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { getDoctor, patients, type Patient } from "@/lib/data";
import { Crumbs, StatCard, inputCls } from "@/components/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Diagnostic Reports & Clinical Records · Meridian Clinical Analytics" },
      {
        name: "description",
        content: "Hospital-wide clinical diagnostic reports, imaging, laboratory, and cardiology records.",
      },
      { property: "og:title", content: "Diagnostic Reports · Meridian" },
      { property: "og:description", content: "Clinical reports repository (demo data)." },
    ],
  }),
  component: ReportsPage,
});

interface FlattenedReport {
  id: string;
  patientId: string;
  patientName: string;
  patientRoom: string;
  doctorId: string;
  doctorName: string;
  title: string;
  date: string;
  type: string;
  summary: string;
}

function ReportsPage() {
  const [q, setQ] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [activeReport, setActiveReport] = useState<FlattenedReport | null>(null);

  // Aggregate all reports from all patients
  const allReports: FlattenedReport[] = useMemo(() => {
    return patients.flatMap((p) => {
      const doc = getDoctor(p.doctorId);
      return p.reports.map((r, i) => ({
        id: `${p.id}-rep-${i}`,
        patientId: p.id,
        patientName: p.name,
        patientRoom: p.room,
        doctorId: p.doctorId,
        doctorName: doc?.name ?? "Attending Physician",
        title: r.title,
        date: r.date,
        type: r.type,
        summary: r.summary,
      }));
    });
  }, []);

  const types = ["All", "Lab", "Imaging", "Cardiac", "Record"];

  const counts = useMemo(() => {
    return {
      All: allReports.length,
      Lab: allReports.filter((r) => r.type === "Lab").length,
      Imaging: allReports.filter((r) => r.type === "Imaging").length,
      Cardiac: allReports.filter((r) => r.type === "Cardiac").length,
      Record: allReports.filter((r) => r.type === "Record").length,
    };
  }, [allReports]);

  const filteredReports = useMemo(() => {
    return allReports.filter((r) => {
      const matchesType = selectedType === "All" || r.type === selectedType;
      const matchesSearch =
        !q.trim() ||
        (r.title + r.patientName + r.patientId + r.doctorName + r.summary)
          .toLowerCase()
          .includes(q.toLowerCase().trim());
      return matchesType && matchesSearch;
    });
  }, [allReports, selectedType, q]);

  const typeIcons: Record<string, typeof FileText> = {
    Lab: FlaskConical,
    Imaging: ImageIcon,
    Cardiac: HeartPulse,
    Record: FileCheck,
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <Crumbs items={[{ label: "Hospital Overview", to: "/" }, { label: "Diagnostic Reports" }]} />

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Clinical Documentation</span>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Diagnostic Reports &amp; Records Archive
          </h1>
          <p className="text-xs text-muted-foreground">
            Central repository of certified inpatient laboratory panels, radiology examinations, and cardiology evaluations.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Records"
          value={`${allReports.length}`}
          icon={FileText}
          tone="primary"
          hint="Across all current inpatients"
          trend="Certified PACS/EHR"
        />
        <StatCard
          label="Imaging Studies"
          value={`${counts.Imaging}`}
          icon={ImageIcon}
          tone="info"
          hint="Radiology PA & CT Scans"
          trend="PA Chest X-Rays"
        />
        <StatCard
          label="Cardiology Studies"
          value={`${counts.Cardiac}`}
          icon={HeartPulse}
          tone="destructive"
          hint="12-Lead ECG & Rhythm"
          trend="Telemetry Synced"
        />
        <StatCard
          label="Laboratory Panels"
          value={`${counts.Lab}`}
          icon={FlaskConical}
          tone="success"
          hint="CBC, Metabolic, Renal"
          trend="Verified Results"
        />
      </div>

      {/* Reports Directory Card */}
      <div className="card-surface overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reports by title, patient name, MRN, or doctor…"
              className={cn(inputCls, "w-full pl-9 pr-8 text-xs")}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {types.map((t) => {
              const active = selectedType === t;
              const count = counts[t as keyof typeof counts] ?? 0;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition text-xs",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{t}</span>
                  <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] tabular-nums">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Study / Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-4 py-3">Attending Physician</th>
                <th className="px-4 py-3">Recorded Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredReports.map((r) => {
                const Icon = typeIcons[r.type] ?? FileText;
                return (
                  <tr key={r.id} className="group transition hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/20">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                            {r.title}
                          </div>
                          <div className="line-clamp-1 text-[11px] text-muted-foreground max-w-sm">
                            {r.summary}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                        {r.type}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <Link
                        to="/patients/$patientId"
                        params={{ patientId: r.patientId }}
                        className="font-medium text-xs text-foreground hover:text-primary transition"
                      >
                        <div>{r.patientName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{r.patientId} &bull; Room {r.patientRoom}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      <Link
                        to="/doctors/$doctorId"
                        params={{ doctorId: r.doctorId }}
                        className="hover:text-primary transition"
                      >
                        {r.doctorName}
                      </Link>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                      {r.date}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setActiveReport(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-sm"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">No matching reports</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                No diagnostic documents matched your search filter.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filteredReports.length}</span> reports
          </div>
          <div className="text-[11px]">Certified EHR Electronic Documents (Simulated Demo Dataset)</div>
        </div>
      </div>

      {/* Report Modal */}
      {activeReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveReport(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                  {activeReport.type} REPORT
                </span>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">
                  {activeReport.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3">
                <div>
                  <span className="font-bold text-foreground">Patient:</span> {activeReport.patientName} (
                  <span className="font-mono">{activeReport.patientId}</span>)
                </div>
                <div>
                  <span className="font-bold text-foreground">Room:</span> {activeReport.patientRoom}
                </div>
                <div>
                  <span className="font-bold text-foreground">Date:</span> {activeReport.date}
                </div>
                <div>
                  <span className="font-bold text-foreground">Physician:</span> {activeReport.doctorName}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Clinical Summary &amp; Findings</h4>
                <p className="mt-1 text-sm leading-relaxed text-foreground bg-muted/20 p-3 rounded-lg border border-border">
                  {activeReport.summary}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Electronic Verification Certified</span>
                </div>
                <div>
                  Signed by {activeReport.doctorName} &bull; St. Meridian Clinical Information System.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Link
                to="/patients/$patientId"
                params={{ patientId: activeReport.patientId }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
              >
                <span>Open Patient Telemetry Chart</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
