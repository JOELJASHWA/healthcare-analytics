// Synthetic demo data. Not real patients, not live sensor readings.
// Shapes mirror future database tables (doctors, patients, vitals) for an easy backend swap.

export type Status = "Stable" | "Monitoring" | "Critical" | "Recovering";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  photo: string;
  available: boolean;
  rating: number;
  department: string;
  bio: string;
}

export interface VitalPoint {
  date: string; // ISO date
  label: string;
  hr: number;
  sys: number;
  dia: number;
  spo2: number;
  temp: number;
  rr: number;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  bloodType: string;
  condition: string;
  status: Status;
  admitted: string;
  room: string;
  history: string[];
  allergies: string[];
  reports: { title: string; date: string; type: string; summary: string }[];
  vitals: VitalPoint[];
}

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const docSeed: [string, string, string, number, boolean][] = [
  ["Dr. Amelia Hart", "Cardiology", "women/44", 18, true],
  ["Dr. Rohan Mehta", "Neurology", "men/32", 14, true],
  ["Dr. Sofia Alvarez", "Pulmonology", "women/65", 11, false],
  ["Dr. James Okafor", "Oncology", "men/75", 22, true],
  ["Dr. Hana Kobayashi", "Pediatrics", "women/26", 9, true],
  ["Dr. Lucas Bennett", "Orthopedics", "men/46", 16, false],
  ["Dr. Priya Raman", "Endocrinology", "women/68", 12, true],
  ["Dr. Daniel Weiss", "Nephrology", "men/52", 20, true],
  ["Dr. Grace Liu", "Internal Medicine", "women/12", 7, false],
  ["Dr. Marcus Reid", "Critical Care", "men/85", 15, true],
];

const conditionsBySpec: Record<string, string[]> = {
  Cardiology: ["Atrial Fibrillation", "Congestive Heart Failure", "Hypertension", "Post-MI Recovery", "Angina Pectoris"],
  Neurology: ["Ischemic Stroke", "Epilepsy", "Migraine Disorder", "Parkinson's Disease", "Multiple Sclerosis"],
  Pulmonology: ["COPD Exacerbation", "Pneumonia", "Asthma", "Pulmonary Fibrosis", "Sleep Apnea"],
  Oncology: ["Lung Carcinoma", "Breast Cancer", "Lymphoma", "Colorectal Cancer", "Leukemia"],
  Pediatrics: ["Bronchiolitis", "Pediatric Asthma", "Dehydration", "Type 1 Diabetes", "Febrile Seizure"],
  Orthopedics: ["Hip Fracture", "ACL Reconstruction", "Spinal Stenosis", "Knee Replacement", "Osteoarthritis"],
  Endocrinology: ["Type 2 Diabetes", "Hyperthyroidism", "Diabetic Ketoacidosis", "Adrenal Insufficiency", "Hypothyroidism"],
  Nephrology: ["Chronic Kidney Disease", "Acute Kidney Injury", "Nephrotic Syndrome", "Renal Stones", "Dialysis Care"],
  "Internal Medicine": ["Sepsis", "Anemia", "Hypertension", "Gastroenteritis", "Cellulitis"],
  "Critical Care": ["ARDS", "Septic Shock", "Post-Op Monitoring", "Respiratory Failure", "Multi-Trauma"],
};

const first = ["Liam","Olivia","Noah","Emma","Ethan","Ava","Mason","Isabella","Arjun","Mia","Leo","Zara","Omar","Chloe","Kenji","Nora","Mateo","Aisha","Felix","Ivy","Samuel","Layla","Elias","Ruby","Victor","Anaya","Hugo","Clara","Ravi","Elena"];
const last = ["Thompson","Nakamura","Patel","Garcia","Kowalski","Chen","Dubois","Rossi","Johnson","Singh","Moreau","Haddad","Fischer","Silva","Kim","O'Brien","Novak","Ahmed","Larsen","Costa"];
const statuses: Status[] = ["Stable", "Monitoring", "Critical", "Recovering"];
const bloods = ["A+", "A-", "B+", "O+", "O-", "AB+", "B-"];

export const doctors: Doctor[] = docSeed.map(([name, spec, photo, exp, avail], i) => ({
  id: `d${i + 1}`,
  name,
  specialization: spec,
  experience: exp,
  photo: `https://randomuser.me/api/portraits/${photo}.jpg`,
  available: avail,
  rating: 4.5 + ((i * 7) % 5) / 10,
  department: `${spec} Wing · Floor ${(i % 5) + 2}`,
  bio: `Board-certified ${spec.toLowerCase()} specialist with ${exp} years of clinical practice, focused on evidence-based, patient-centered care.`,
}));

function genVitals(r: () => number, status: Status): VitalPoint[] {
  const sev = status === "Critical" ? 1 : status === "Monitoring" ? 0.55 : status === "Recovering" ? 0.3 : 0.1;
  const end = new Date("2026-11-05");
  const out: VitalPoint[] = [];
  let hr = 70 + sev * 30, sys = 118 + sev * 30, dia = 76 + sev * 14, spo2 = 98 - sev * 7, temp = 36.7 + sev * 1.5, rr = 14 + sev * 8;
  for (let d = 89; d >= 0; d--) {
    const dt = new Date(end);
    dt.setDate(end.getDate() - d);
    hr += (r() - 0.5) * 6; hr = Math.min(140, Math.max(52, hr));
    sys += (r() - 0.5) * 6; sys = Math.min(185, Math.max(95, sys));
    dia += (r() - 0.5) * 4; dia = Math.min(115, Math.max(58, dia));
    spo2 += (r() - 0.5) * 1.4; spo2 = Math.min(100, Math.max(84, spo2));
    temp += (r() - 0.5) * 0.3; temp = Math.min(39.8, Math.max(36, temp));
    rr += (r() - 0.5) * 2; rr = Math.min(32, Math.max(11, rr));
    out.push({
      date: dt.toISOString().slice(0, 10),
      label: dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      hr: Math.round(hr), sys: Math.round(sys), dia: Math.round(dia),
      spo2: Math.round(spo2 * 10) / 10, temp: Math.round(temp * 10) / 10, rr: Math.round(rr),
    });
  }
  return out;
}

export const patients: Patient[] = doctors.flatMap((doc, di) => {
  const r = rng(1000 + di * 97);
  const conds = conditionsBySpec[doc.specialization] ?? ["General Observation"];
  const count = 6 + (di % 3);
  return Array.from({ length: count }, (_, pi) => {
    const status = statuses[Math.floor(r() * 4)]!;
    const condition = conds[pi % conds.length]!;
    const isPed = doc.specialization === "Pediatrics";
    const age = isPed ? 2 + Math.floor(r() * 14) : 24 + Math.floor(r() * 60);
    const fi = Math.floor(r() * first.length);
    const nm = `${first[fi]!} ${last[Math.floor(r() * last.length)]!}`;
    const adm = new Date("2026-11-05");
    adm.setDate(adm.getDate() - (3 + Math.floor(r() * 40)));
    const admitted = adm.toISOString().slice(0, 10);
    return {
      id: `PT-${(di + 1) * 1000 + pi + 101}`,
      doctorId: doc.id,
      name: nm,
      age,
      gender: fi % 2 === 0 ? "Male" : "Female",
      bloodType: bloods[Math.floor(r() * bloods.length)]!,
      condition,
      status,
      admitted,
      room: `${String.fromCharCode(65 + di)}-${100 + pi * 3 + Math.floor(r() * 3)}`,
      history: [
        `Diagnosed with ${condition} (${2026 - 1 - Math.floor(r() * 6)})`,
        r() > 0.5 ? "Hypertension, controlled with medication" : "No prior cardiovascular events",
        r() > 0.5 ? "Appendectomy (2015)" : "Seasonal allergic rhinitis",
        r() > 0.6 ? "Former smoker, quit 2019" : "Non-smoker",
      ],
      allergies: r() > 0.5 ? ["Penicillin"] : r() > 0.5 ? ["Latex", "Sulfa drugs"] : ["None known"],
      reports: [
        { title: "Complete Blood Count", date: admitted, type: "Lab", summary: "WBC mildly elevated; hemoglobin within range." },
        { title: "Chest X-Ray (PA view)", date: admitted, type: "Imaging", summary: "No acute cardiopulmonary findings beyond baseline." },
        { title: "12-Lead ECG", date: admitted, type: "Cardiac", summary: "Sinus rhythm; no acute ST changes." },
        { title: "Discharge Summary (prior visit)", date: "2025-06-14", type: "Record", summary: "Prior admission resolved without complication." },
      ],
      vitals: genVitals(r, status),
    } satisfies Patient;
  });
});

export const getDoctor = (id: string) => doctors.find((d) => d.id === id);
export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const patientsOf = (doctorId: string) => patients.filter((p) => p.doctorId === doctorId);
export const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));
export const statusList = statuses;
