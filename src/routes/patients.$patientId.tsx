import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns2,
  Contrast,
  Droplets,
  FileCheck,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  Image as ImageIcon,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Sun,
  Thermometer,
  User,
  Wind,
} from "lucide-react";
import { getDoctor, getPatient, patientsOf, type Patient, type VitalPoint } from "@/lib/data";
import { Crumbs, StatusBadge } from "@/components/shell";
import { cn } from "@/lib/utils";
import xray from "@/assets/chest-xray.jpg";
import xrayPrior from "@/assets/chest-xray-prior.jpg";

export const Route = createFileRoute("/patients/$patientId")({
  loader: ({ params }) => {
    const patient = getPatient(params.patientId);
    if (!patient) throw notFound();
    return { patient, doctor: getDoctor(patient.doctorId)! };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.patient.name} (${loaderData.patient.id}) · Clinical Analytics`
          : "Patient Analytics · Meridian",
      },
      {
        name: "description",
        content: "Individual inpatient health analytics, vitals trends, ECG telemetry, and radiology (demo data).",
      },
      { property: "og:title", content: "Patient Telemetry Analytics · Meridian" },
      { property: "og:description", content: "Simulated vitals, ECG, imaging and diagnostic reports (demo data)." },
    ],
  }),
  component: PatientPage,
});

type VKey = "hr" | "sys" | "dia" | "spo2" | "temp" | "rr";
const META: Record<VKey, { label: string; unit: string; lo: number; hi: number; higherIsBad: boolean }> = {
  hr: { label: "Heart Rate", unit: "BPM", lo: 60, hi: 100, higherIsBad: true },
  sys: { label: "Systolic BP", unit: "mmHg", lo: 90, hi: 140, higherIsBad: true },
  dia: { label: "Diastolic BP", unit: "mmHg", lo: 60, hi: 90, higherIsBad: true },
  spo2: { label: "Oxygen Saturation (SpO₂)", unit: "%", lo: 94, hi: 100, higherIsBad: false },
  temp: { label: "Body Temperature", unit: "°C", lo: 36.1, hi: 37.8, higherIsBad: true },
  rr: { label: "Respiratory Rate", unit: "br/min", lo: 12, hi: 20, higherIsBad: true },
};

const inRange = (k: VKey, v: number) => v >= META[k].lo && v <= META[k].hi;
const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const ranges = [
  { k: 7, l: "7D" },
  { k: 14, l: "14D" },
  { k: 30, l: "30D" },
  { k: 90, l: "90D" },
];

function riskScore(v: VitalPoint) {
  const keys: VKey[] = ["hr", "sys", "spo2", "temp", "rr"];
  const out = keys.filter((k) => !inRange(k, v[k])).length;
  return Math.min(100, Math.round(out * 18 + (v.spo2 < 90 ? 20 : 0) + Math.max(0, v.hr - 110) / 2));
}

function PatientPage() {
  const { patient, doctor } = Route.useLoaderData();
  const [days, setDays] = useState(30);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    setDays(30);
    setFrom("");
    setTo("");
  }, [patient.id]);

  const data = useMemo(() => {
    if (from || to) {
      return patient.vitals.filter((v) => (!from || v.date >= from) && (!to || v.date <= to));
    }
    return patient.vitals.slice(-days);
  }, [patient, days, from, to]);

  const now = patient.vitals[patient.vitals.length - 1]!;
  const first = patient.vitals[0]!;

  return (
    <div key={patient.id} className="space-y-6 animate-fade-up">
      {/* Breadcrumb & Patient Quick Switcher */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Crumbs
          items={[
            { label: "Hospital Overview", to: "/" },
            { label: doctor.name, to: "/doctors/$doctorId", params: { doctorId: doctor.id } },
            { label: patient.name },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/doctors/$doctorId"
            params={{ doctorId: doctor.id }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {doctor.name}</span>
          </Link>
          <PatientSwitcher patient={patient} />
        </div>
      </div>

      {/* Demo Notice */}
      <DemoNotice />

      {/* Patient Master Clinical Header */}
      <ProfileHero patient={patient} doctor={doctor} now={now} />

      {/* Real-Time Telemetry Bar (5 Vitals) */}
      <VitalsGrid patient={patient} now={now} />

      {/* ECG Monitor and Chest X-Ray Imaging Station */}
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <EcgViewer hr={now.hr} status={patient.status} />
        </div>
        <div className="xl:col-span-2">
          <XrayViewer />
        </div>
      </div>

      {/* Longitudinal Vital Sign Trends & Analytics */}
      <section className="space-y-5 pt-4">
        <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <FlaskConical className="h-4 w-4" />
              <span>Telemetry Historical Analysis</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Longitudinal Vital Sign Trends
            </h2>
            <p className="text-xs text-muted-foreground">
              {data.length} daily simulated telemetry checkpoints &bull; {data[0]?.label} &ndash; {data[data.length - 1]?.label}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Range Presets */}
            <div className="flex rounded-xl border border-border bg-card p-1 text-xs">
              {ranges.map((r) => (
                <button
                  key={r.k}
                  onClick={() => {
                    setDays(r.k);
                    setFrom("");
                    setTo("");
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 font-semibold transition",
                    !from && !to && days === r.k
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.l}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1 text-xs shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                aria-label="Start date"
                value={from}
                min={first.date}
                max={to || now.date}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 bg-transparent text-xs font-medium outline-none"
              />
              <span className="text-muted-foreground">&rarr;</span>
              <input
                type="date"
                aria-label="End date"
                value={to}
                min={from || first.date}
                max={now.date}
                onChange={(e) => setTo(e.target.value)}
                className="h-8 bg-transparent text-xs font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="card-surface p-12 text-center text-muted-foreground">
            No telemetry records found for this custom date range.
          </div>
        ) : (
          <>
            <TrendAnalysis data={data} />

            <div className="grid gap-6 lg:grid-cols-2">
              <Trend
                title="Heart Rate History"
                icon={HeartPulse}
                data={data}
                keys={[["hr", "var(--chart-2)", "Heart Rate"]]}
                band={[60, 100]}
                unit="BPM"
              />
              <Trend
                title="Arterial Blood Pressure Trend"
                icon={Gauge}
                data={data}
                keys={[
                  ["sys", "var(--chart-3)", "Systolic"],
                  ["dia", "var(--chart-1)", "Diastolic"],
                ]}
                band={[60, 140]}
                unit="mmHg"
                line
              />
              <Trend
                title="Pulse Oximetry (SpO₂)"
                icon={Droplets}
                data={data}
                keys={[["spo2", "var(--chart-1)", "SpO₂"]]}
                band={[94, 100]}
                domain={[82, 100]}
                unit="%"
              />
              <Trend
                title="Body Temperature History"
                icon={Thermometer}
                data={data}
                keys={[["temp", "var(--chart-4)", "Temperature"]]}
                band={[36.1, 37.8]}
                domain={[35.5, 40]}
                unit="°C"
              />
            </div>
          </>
        )}
      </section>

      {/* Medical History & Diagnostic Reports */}
      <div className="grid gap-6 xl:grid-cols-5 pt-4">
        <HistoryTimeline patient={patient} />
        <Reports patient={patient} />
      </div>
    </div>
  );
}

function DemoNotice() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-900 shadow-sm">
      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
      <div>
        <span className="font-bold">Synthetic Clinical Demonstration Telemetry:</span> All vital readings, ECG lead waveforms, and diagnostic imaging on this patient chart are simulated for healthcare platform demonstration purposes.
      </div>
    </div>
  );
}

function PatientSwitcher({ patient }: { patient: Patient }) {
  const navigate = useNavigate();
  const siblings = patientsOf(patient.doctorId);
  const idx = siblings.findIndex((p) => p.id === patient.id);
  const go = (id?: string) =>
    id &&
    navigate({
      to: "/patients/$patientId",
      params: { patientId: id },
    });

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-sm">
      <button
        aria-label="Previous patient"
        onClick={() => go(siblings[(idx - 1 + siblings.length) % siblings.length]?.id)}
        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <select
        aria-label="Switch patient"
        value={patient.id}
        onChange={(e) => go(e.target.value)}
        className="h-8 rounded-lg bg-transparent px-2 text-xs font-semibold text-foreground outline-none cursor-pointer"
      >
        {siblings.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.id}) &bull; {p.status}
          </option>
        ))}
      </select>

      <button
        aria-label="Next patient"
        onClick={() => go(siblings[(idx + 1) % siblings.length]?.id)}
        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProfileHero({
  patient,
  doctor,
  now,
}: {
  patient: Patient;
  doctor: ReturnType<typeof getDoctor> & {};
  now: VitalPoint;
}) {
  const score = riskScore(now);
  const tone = score >= 50 ? "#e11d48" : score >= 20 ? "#d97706" : "#059669";
  const C = 2 * Math.PI * 34;

  const fields: [string, string | number][] = [
    ["Age & Sex", `${patient.age} yrs · ${patient.gender}`],
    ["Blood Group", patient.bloodType],
    ["Bed / Ward", patient.room],
    ["Admission Date", patient.admitted],
    ["Attending MD", doctor.name],
    ["Specialty", doctor.specialization],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Patient Master Dossier */}
      <div className="card-surface overflow-hidden shadow-sm lg:col-span-2">
        <div className="relative overflow-hidden bg-gradient-to-r from-navy via-navy-surface to-slate-900 p-6 text-white md:p-8">
          <div className="relative z-10 flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-700 font-display text-2xl font-bold text-white shadow-lg ring-4 ring-primary/20">
              {patient.name
                .split(" ")
                .map((s) => s[0])
                .join("")}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {patient.name}
                </h1>
                <StatusBadge status={patient.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-navy-muted">
                <span className="font-mono font-semibold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded">
                  {patient.id}
                </span>
                <span>&bull;</span>
                <span>
                  Primary Diagnosis: <strong className="text-white">{patient.condition}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Demographic Grid */}
        <dl className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3">
          {fields.map(([k, v]) => (
            <div key={k} className="bg-card px-5 py-3.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 truncate font-display text-xs font-bold text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Clinical Early Warning & Risk Dial */}
      <div className="card-surface flex flex-col p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">Early Warning Risk Index</h3>
            <p className="text-[11px] text-muted-foreground">Synthesized telemetry risk score (0-100)</p>
          </div>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            EWS Protocol
          </span>
        </div>

        <div className="my-auto flex items-center gap-6 py-4">
          <svg viewBox="0 0 80 80" className="h-28 w-28 -rotate-90 shrink-0">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--muted)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={tone}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - Math.max(score, 4) / 100)}
              className="transition-[stroke-dashoffset] duration-700"
            />
            <text
              x="40"
              y="46"
              textAnchor="middle"
              className="rotate-90 fill-foreground font-display text-lg font-bold"
              transform="rotate(90 40 40)"
            >
              {score}
            </text>
          </svg>

          <div className="space-y-1.5 text-xs">
            <div className="font-display text-base font-bold" style={{ color: tone }}>
              {score >= 50 ? "High Risk Alert" : score >= 20 ? "Elevated Attention" : "Low Risk &bull; Stable"}
            </div>
            <div className="text-muted-foreground">
              Acuity Status: <span className="font-bold text-foreground">{patient.status}</span>
            </div>
            <div className="text-muted-foreground">
              Allergies: <span className="font-semibold text-foreground">{patient.allergies.join(", ")}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-border pt-4">
          <div className="flex gap-1.5">
            {(["Stable", "Recovering", "Monitoring", "Critical"] as const).map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    s === patient.status
                      ? s === "Critical"
                        ? "bg-rose-600 animate-pulse"
                        : s === "Monitoring"
                        ? "bg-amber-500"
                        : s === "Recovering"
                        ? "bg-cyan-500"
                        : "bg-emerald-500"
                      : "bg-muted",
                  )}
                />
                <div
                  className={cn(
                    "mt-1 text-[10px] text-center",
                    s === patient.status ? "font-bold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalsGrid({ patient, now }: { patient: Patient; now: VitalPoint }) {
  const spark = patient.vitals.slice(-14);
  const cards: { k: VKey; icon: typeof Activity; value: string; k2?: VKey }[] = [
    { k: "hr", icon: HeartPulse, value: `${now.hr}` },
    { k: "sys", icon: Gauge, value: `${now.sys}/${now.dia}`, k2: "dia" },
    { k: "spo2", icon: Droplets, value: `${now.spo2}` },
    { k: "temp", icon: Thermometer, value: `${now.temp}` },
    { k: "rr", icon: Wind, value: `${now.rr}` },
  ];

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Current Telemetry Vitals</h2>
          <p className="text-xs text-muted-foreground">Latest simulated sample reading &bull; {now.label}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Continuous Sensor Link</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ k, icon: Icon, value, k2 }) => {
          const ok = inRange(k, now[k]) && (!k2 || inRange(k2, now[k2]));
          const m = META[k];
          const pct = Math.min(100, Math.max(0, ((now[k] - m.lo * 0.8) / (m.hi * 1.2 - m.lo * 0.8)) * 100));
          const label = k === "sys" ? "Blood Pressure" : m.label;

          return (
            <div
              key={k}
              className={cn(
                "card-surface relative overflow-hidden p-5 transition hover:shadow-md",
                !ok && "ring-1 ring-rose-500/40 bg-rose-500/5",
              )}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{label}</span>
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-xl",
                    ok ? "bg-teal-500/10 text-teal-600" : "bg-rose-500/15 text-rose-600",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {value}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{m.unit}</span>
              </div>

              {/* Progress reference bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", ok ? "bg-primary" : "bg-rose-600")}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className={cn("font-bold", ok ? "text-emerald-700" : "text-rose-700")}>
                  {ok ? "Within Range" : "Out of Normal Range"}
                </span>
                <span className="text-muted-foreground">
                  Ref: {m.lo}–{m.hi}
                </span>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="mt-3 h-9">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spark}>
                    <Line
                      type="monotone"
                      dataKey={k}
                      stroke={ok ? "var(--primary)" : "var(--destructive)"}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrendAnalysis({ data }: { data: VitalPoint[] }) {
  const half = Math.max(1, Math.floor(data.length / 2));
  const a = data.slice(0, half);
  const b = data.slice(half).length ? data.slice(half) : data;
  const keys: VKey[] = ["hr", "sys", "spo2", "temp", "rr"];

  return (
    <div className="card-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">Clinical Trend Variance</h3>
        </div>
        <span className="text-xs text-muted-foreground">Comparison of earlier vs. recent period</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {keys.map((k) => {
          const m = META[k];
          const before = avg(a.map((v) => v[k]));
          const after = avg(b.map((v) => v[k]));
          const delta = after - before;
          const pct = before ? (delta / before) * 100 : 0;
          const flat = Math.abs(pct) < 1.5;
          const worse = !flat && (m.higherIsBad ? delta > 0 : delta < 0);
          const outPct = Math.round((data.filter((v) => !inRange(k, v[k])).length / data.length) * 100);
          const Icon = flat ? ArrowRight : delta > 0 ? ArrowUpRight : ArrowDownRight;

          return (
            <div key={k} className="rounded-xl border border-border bg-muted/30 p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-lg font-bold tabular-nums text-foreground">
                  {after.toFixed(k === "temp" || k === "spo2" ? 1 : 0)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">{m.unit}</span>
                </span>
                <span
                  className={cn(
                    "flex items-center text-xs font-bold",
                    flat ? "text-muted-foreground" : worse ? "text-rose-600" : "text-emerald-700",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {pct > 0 ? "+" : ""}
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {flat ? "Stable Baseline" : worse ? "Deteriorating" : "Improving Trend"} &bull; {outPct}% variance
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-lg ring-1 ring-black/5">
      <div className="mb-1.5 font-bold text-foreground">
        {label} <span className="font-normal text-muted-foreground">&bull; Simulated Telemetry</span>
      </div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="ml-auto pl-3 font-display font-bold tabular-nums text-foreground">
            {p.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function Trend({
  title,
  icon: Icon,
  unit,
  data,
  keys,
  band,
  domain,
  line,
}: {
  title: string;
  icon: typeof Activity;
  unit: string;
  data: VitalPoint[];
  keys: [VKey, string, string][];
  band: [number, number];
  domain?: [number, number];
  line?: boolean;
}) {
  const Chart = line ? LineChart : AreaChart;
  const id = title.replace(/\W/g, "");
  const main = keys[0]![0];
  const vals = data.map((d) => d[main]);
  const stats = [
    ["Min", Math.min(...vals)],
    ["Mean", avg(vals)],
    ["Max", Math.max(...vals)],
  ] as const;

  return (
    <div className="card-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{unit} &bull; Shaded zone = Normal Clinical Range</p>
          </div>
        </div>

        <div className="flex gap-4 text-right">
          {stats.map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{l}</div>
              <div className="font-display text-sm font-bold tabular-nums text-foreground">
                {Number(v).toFixed(main === "temp" || main === "spo2" ? 1 : 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ left: -16, right: 8, top: 6, bottom: 4 }}>
            <defs>
              {keys.map(([k, c]) => (
                <linearGradient key={k} id={`g-${id}-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <ReferenceArea y1={band[0]} y2={band[1]} fill="var(--success)" fillOpacity={0.07} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={domain ?? ["auto", "auto"]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: "var(--primary)", strokeDasharray: "3 3" }} />
            <ReferenceLine y={band[1]} stroke="var(--destructive)" strokeDasharray="4 4" />
            {line && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
            {keys.map(([k, c, name]) =>
              line ? (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={name}
                  stroke={c}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ) : (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={name}
                  stroke={c}
                  strokeWidth={2.2}
                  fill={`url(#g-${id}-${k})`}
                  activeDot={{ r: 5 }}
                />
              ),
            )}
            {data.length > 14 && (
              <Brush dataKey="label" height={18} stroke="var(--primary)" travellerWidth={8} fill="var(--muted)" />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EcgViewer({ hr, status }: { hr: number; status: Patient["status"] }) {
  const [playing, setPlaying] = useState(true);
  const [windowSec, setWindowSec] = useState(6);
  const [speed, setSpeed] = useState(25);
  const [gain, setGain] = useState(1);
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const loop = (n: number) => {
      setT((x) => x + ((n - last) / 1000) * (speed / 25));
      last = n;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed]);

  const irregular = status === "Critical";
  const W = 1000;
  const H = 160;
  const mid = H / 2;

  const path = useMemo(() => {
    const beat = 60 / hr;
    const samples = 600;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const sec = t + (i / samples) * windowSec;
      const n = Math.floor(sec / beat);
      const jitter = irregular ? Math.sin(n * 12.9898) * 0.12 * beat : 0;
      const ph = ((((sec - jitter) % beat) + beat) % beat) / beat;
      const g = (c: number, w: number, a: number) => a * Math.exp(-((ph - c) ** 2) / (2 * w * w));
      const y =
        g(0.18, 0.025, 0.12) -
        g(0.3, 0.008, 0.12) +
        g(0.33, 0.01, 1) -
        g(0.36, 0.01, 0.25) +
        g(0.6, 0.045, 0.28);
      d += `${i ? "L" : "M"}${((i / samples) * W).toFixed(1)} ${(mid - y * 60 * gain).toFixed(1)}`;
    }
    return d;
  }, [t, hr, windowSec, gain, irregular, mid]);

  return (
    <div className="card-surface flex h-full flex-col overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">ECG Telemetry &bull; Lead II</h3>
          <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700">
            250 Hz Simulated
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-display text-sm font-bold text-foreground">
            <HeartPulse className={cn("h-4 w-4 text-rose-600", playing && "animate-pulse")} />
            <span className="tabular-nums">{hr}</span>
            <span className="text-xs font-normal text-muted-foreground">BPM</span>
          </div>
        </div>
      </div>

      {/* Monitor Oscilloscope Canvas */}
      <div className="ecg-grid relative flex-1 min-h-[220px]">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full min-h-[220px]">
          <path
            d={path}
            fill="none"
            stroke="#14b8a6"
            strokeWidth={2.2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>

        {/* Luminous sweep line indicator */}
        <div className="absolute top-2 right-3 rounded bg-black/60 px-2 py-1 text-[10px] font-mono text-teal-300">
          Rhythm: {irregular ? "Irregular Ectopy (Demo)" : "Normal Sinus (Demo)"}
        </div>

        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400">
          Speed: {speed} mm/s &bull; Gain: {gain}&times; &bull; Window: {windowSec}s
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border bg-card p-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            {playing ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Play
              </>
            )}
          </button>

          <button
            onClick={() => setT(0)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Seg label="Window" opts={[3, 6, 10]} value={windowSec} onChange={setWindowSec} fmt={(v) => `${v}s`} />
          <Seg label="Speed" opts={[12.5, 25, 50]} value={speed} onChange={setSpeed} fmt={(v) => `${v}`} />
          <Seg label="Gain" opts={[0.5, 1, 2]} value={gain} onChange={setGain} fmt={(v) => `${v}×`} />
        </div>
      </div>
    </div>
  );
}

function Seg<T extends number>({
  label,
  opts,
  value,
  onChange,
  fmt,
}: {
  label: string;
  opts: T[];
  value: T;
  onChange: (v: T) => void;
  fmt: (v: T) => string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded px-2 py-0.5 font-semibold text-[11px] transition",
              value === o ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {fmt(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function XrayViewer() {
  const [z, setZ] = useState(1);
  const [bright, setBright] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [compare, setCompare] = useState(false);
  const [split, setSplit] = useState(50);

  const filter = `brightness(${bright}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`;
  const imgStyle = { filter, transform: `scale(${z})` };
  const btn = "grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted transition text-muted-foreground hover:text-foreground";

  return (
    <div className="card-surface flex h-full flex-col overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">Diagnostic Imaging &bull; PA Chest</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Zoom out"
            onClick={() => setZ((v) => Math.max(1, v - 0.25))}
            className={btn}
            title="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-xs font-semibold tabular-nums">{Math.round(z * 100)}%</span>
          <button
            aria-label="Zoom in"
            onClick={() => setZ((v) => Math.min(4, v + 0.25))}
            className={btn}
            title="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Invert bone mode"
            onClick={() => setInvert((v) => !v)}
            className={cn(btn, invert && "border-primary bg-primary/10 text-primary")}
            title="Invert / Bone Mode"
          >
            <Contrast className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Split compare"
            onClick={() => setCompare((v) => !v)}
            className={cn(btn, compare && "border-primary bg-primary/10 text-primary")}
            title="Compare with Prior"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Reset viewer"
            onClick={() => {
              setZ(1);
              setBright(100);
              setContrast(100);
              setInvert(false);
              setSplit(50);
            }}
            className={btn}
            title="Reset viewer settings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Image Stage */}
      <div className="relative h-64 flex-1 overflow-hidden bg-slate-950">
        <img
          src={xray}
          alt="Current PA chest X-ray"
          width={1024}
          height={1024}
          loading="lazy"
          style={imgStyle}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-200"
        />

        {compare && (
          <>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            >
              <img
                src={xrayPrior}
                alt="Prior chest X-ray"
                width={1024}
                height={1024}
                loading="lazy"
                style={imgStyle}
                className="absolute inset-0 h-full w-full bg-slate-950 object-contain transition-transform duration-200"
              />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary shadow-lg" style={{ left: `${split}%` }} />
            <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              Prior (2025)
            </span>
            <span className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              Current Scan
            </span>
          </>
        )}

        <span className="absolute bottom-2 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-slate-400">
          DICOM Preview Mode &bull; Simulated PACS Feed
        </span>
      </div>

      {/* Adjusters */}
      <div className="space-y-2 border-t border-border bg-card p-3 text-xs">
        {compare && (
          <Slider label="Split Ratio" icon={Columns2} value={split} min={0} max={100} onChange={setSplit} suffix="%" />
        )}
        <Slider label="Brightness" icon={Sun} value={bright} min={50} max={160} onChange={setBright} suffix="%" />
        <Slider label="Contrast" icon={Contrast} value={contrast} min={50} max={200} onChange={setContrast} suffix="%" />
      </div>
    </div>
  );
}

function Slider({
  label,
  icon: Icon,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  icon: typeof Sun;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <label className="flex items-center gap-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="w-20 text-muted-foreground text-[11px] font-medium">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-teal-600 h-1.5 rounded-lg bg-muted cursor-pointer"
        aria-label={label}
      />
      <span className="w-10 text-right font-display font-semibold tabular-nums text-foreground text-[11px]">
        {value}
        {suffix}
      </span>
    </label>
  );
}

function HistoryTimeline({ patient }: { patient: Patient }) {
  const events = [
    {
      date: patient.admitted,
      title: `Hospital Admission &bull; Primary Diagnosis: ${patient.condition}`,
      note: `Admitted to Room ${patient.room}. Complete baseline telemetry and laboratory workup initialized (simulated demo).`,
    },
    ...patient.history.map((h, i) => ({
      date: i === 0 ? "First Diagnosis" : "Clinical History",
      title: h,
      note: "",
    })),
  ];

  return (
    <div className="card-surface p-6 shadow-sm xl:col-span-2">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-display text-base font-bold text-foreground">Clinical Diagnostic Timeline</h3>
        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          EHR History
        </span>
      </div>

      <ol className="relative mt-2 space-y-4 border-l border-border pl-6">
        {events.map((e, i) => (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-card",
                i === 0 ? "bg-primary" : "bg-slate-400",
              )}
            />
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{e.date}</div>
            <div className="font-semibold text-xs text-foreground mt-0.5">{e.title}</div>
            {e.note && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{e.note}</p>}
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          <span>Known Clinical Flags</span>
        </div>
        <div className="mt-1 text-muted-foreground">
          <strong>Allergies:</strong> {patient.allergies.join(", ")} &bull; <strong>Blood Type:</strong>{" "}
          {patient.bloodType}
        </div>
      </div>
    </div>
  );
}

function Reports({ patient }: { patient: Patient }) {
  const types = ["All", ...Array.from(new Set(patient.reports.map((r) => r.type)))];
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setTab("All");
    setOpen(null);
  }, [patient.id]);

  const list = patient.reports.filter((r) => tab === "All" || r.type === tab);

  return (
    <div className="card-surface p-6 shadow-sm xl:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Diagnostic Reports &amp; Records</h3>
          <p className="text-xs text-muted-foreground">Certified clinical evaluations and test impressions</p>
        </div>

        <div className="flex rounded-xl border border-border bg-muted/40 p-1 text-xs">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition text-[11px]",
                tab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {list.map((r) => {
          const isOpen = open === r.title;
          return (
            <div
              key={r.title}
              className={cn(
                "rounded-xl border border-border bg-card p-4 transition",
                isOpen ? "border-primary/50 shadow-sm" : "hover:border-primary/30 hover:bg-muted/20",
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : r.title)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500/10 text-teal-700">
                  <FileText className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground">{r.title}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {r.type} &bull; {r.date}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-xs text-muted-foreground", !isOpen && "line-clamp-1")}>{r.summary}</p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 border-t border-border/60 pt-3 text-xs space-y-2 text-muted-foreground bg-muted/20 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    <span>Clinical Impression &amp; Electronic Signature</span>
                  </div>
                  <p className="leading-relaxed">
                    Electronic evaluation signed off for {patient.name} (MRN: {patient.id}) by attending clinical staff.
                    Document stored in Meridian electronic medical records repository (synthetic demo data).
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
