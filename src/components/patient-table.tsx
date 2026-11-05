import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Filter,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { getDoctor, statusList, type Patient, type Status } from "@/lib/data";
import { StatusBadge, inputCls } from "@/components/shell";
import { cn } from "@/lib/utils";

export function PatientTable({
  rows,
  showDoctor = false,
  title = "Inpatient Census Directory",
}: {
  rows: Patient[];
  showDoctor?: boolean;
  title?: string;
}) {
  const [q, setQ] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const counts = useMemo(() => {
    return {
      All: rows.length,
      Critical: rows.filter((r) => r.status === "Critical").length,
      Monitoring: rows.filter((r) => r.status === "Monitoring").length,
      Stable: rows.filter((r) => r.status === "Stable").length,
      Recovering: rows.filter((r) => r.status === "Recovering").length,
    };
  }, [rows]);

  const list = useMemo(
    () =>
      rows.filter((p) => {
        const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
        const matchesQuery =
          !q.trim() ||
          (p.name + p.id + p.condition + p.room + (getDoctor(p.doctorId)?.name ?? ""))
            .toLowerCase()
            .includes(q.toLowerCase().trim());
        return matchesStatus && matchesQuery;
      }),
    [rows, q, selectedStatus],
  );

  return (
    <div className="card-surface overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {list.length} of {rows.length} inpatient charts matching clinical criteria
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name, MRN, room, or condition…"
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
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/30 px-5 py-2.5 text-xs">
        <span className="mr-2 flex items-center gap-1.5 font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filter Acuity:
        </span>
        {(["All", ...statusList] as const).map((s) => {
          const active = selectedStatus === s;
          const count = counts[s as keyof typeof counts] ?? 0;
          return (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition",
                active
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border font-semibold"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
              )}
            >
              <span>{s}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
                  s === "Critical" && count > 0
                    ? "bg-rose-500/15 text-rose-700"
                    : active
                    ? "bg-muted text-foreground"
                    : "bg-muted/80 text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Patient Profile</th>
              <th className="px-4 py-3">MRN / ID</th>
              <th className="px-4 py-3">Room / Bed</th>
              <th className="px-5 py-3">Primary Diagnosis</th>
              {showDoctor && <th className="px-4 py-3">Attending Physician</th>}
              <th className="px-4 py-3">Acuity Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {list.map((p) => {
              const doc = getDoctor(p.doctorId);
              return (
                <tr
                  key={p.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  {/* Patient Name & Initials */}
                  <td className="px-5 py-3.5">
                    <Link
                      to="/patients/$patientId"
                      params={{ patientId: p.id }}
                      className="flex items-center gap-3 font-semibold text-foreground group-hover:text-primary transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 font-display text-xs font-bold text-teal-700 ring-1 ring-teal-500/20">
                        {p.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.age} yrs &bull; {p.gender} &bull; Blood {p.bloodType}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* MRN ID */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {p.id}
                    </span>
                  </td>

                  {/* Room / Bed */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {p.room}
                    </span>
                  </td>

                  {/* Diagnosis */}
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground text-xs leading-relaxed">{p.condition}</div>
                    <div className="text-[11px] text-muted-foreground">Admitted: {p.admitted}</div>
                  </td>

                  {/* Attending Doctor */}
                  {showDoctor && (
                    <td className="px-4 py-3.5">
                      {doc ? (
                        <Link
                          to="/doctors/$doctorId"
                          params={{ doctorId: doc.id }}
                          className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-primary transition"
                        >
                          <img
                            src={doc.photo}
                            alt={doc.name}
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
                          />
                          <span className="truncate">{doc.name}</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  )}

                  {/* Status Badge */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>

                  {/* Action Link */}
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to="/patients/$patientId"
                      params={{ patientId: p.id }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground shadow-sm"
                    >
                      <span>Open Chart</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {list.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">No clinical records found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              No patients match the search term &ldquo;{q}&rdquo; under the &ldquo;{selectedStatus}&rdquo; status.
            </p>
            <button
              onClick={() => {
                setQ("");
                setSelectedStatus("All");
              }}
              className="mt-4 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-semibold text-foreground">{list.length}</span> patients
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Continuous Telemetry Monitored (Simulated)
        </div>
      </div>
    </div>
  );
}
