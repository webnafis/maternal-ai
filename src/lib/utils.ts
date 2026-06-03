import {
  format,
  differenceInDays,
  differenceInWeeks,
  addWeeks,
  parseISO,
} from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getTrimester(week: number): "1st" | "2nd" | "3rd" {
  if (week <= 13) return "1st";
  if (week <= 26) return "2nd";
  return "3rd";
}

export function getProgress(week: number): number {
  return Math.round((week / 40) * 100);
}

export function getDaysLeft(week: number): number {
  const weeksLeft = 40 - week;
  return weeksLeft * 7;
}

export function getDueDate(week: number): string {
  const due = addWeeks(new Date(), 40 - week);
  return format(due, "MMMM d, yyyy");
}

export function getTodayDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function calculateWeekFromDueDate(
  dueDateStr: string | null | undefined
): number {
  if (!dueDateStr) return 1;
  try {
    const dueDate = parseISO(dueDateStr);
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);
    const weeksPregnant = Math.round((280 - daysUntilDue) / 7);
    return Math.max(1, Math.min(40, weeksPregnant));
  } catch {
    return 1;
  }
}

// export function calculateWeekFromDueDate(dueDateStr: string | null | undefined): number {
//   if (!dueDateStr) return 1;
//   try {
//     const dueDate = parseISO(dueDateStr);
//     const today = new Date();
//     const daysUntilDue = differenceInDays(dueDate, today);
//     const weeksPregnant = Math.round((280 - daysUntilDue) / 7);
//     return Math.max(1, Math.min(40, weeksPregnant));
//   } catch {
//     return 1;
//   }
// }

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const CHECKLIST_ITEMS = [
  "Take prenatal vitamins 💊",
  "Drink 8 glasses of water 💧",
  "Eat iron-rich food 🥦",
  "30-min gentle walk 🚶",
  "Rest for 30 minutes 😴",
  "Track fetal movements 👶",
];

export const WEEK_FOCUS: Record<string, string> = {
  "1st":
    "💊 Take folic acid daily. Avoid alcohol & smoking. Book your first prenatal appointment. Rest often — fatigue is normal. Stay hydrated with 8–10 glasses of water.",
  "2nd":
    "🌿 Regular prenatal check-ups. Consider iron-rich foods. Begin gentle prenatal yoga. Track baby movements. Discuss birth plan with your doctor.",
  "3rd":
    "🏥 Pack your hospital bag. Attend childbirth classes. Monitor fetal movements daily. Limit travel. Discuss labor signs with your midwife.",
};

export const BABY_DEVELOPMENT: Record<number, string> = {
  4: "🫐 Baby is the size of a blueberry (~5mm). Heart begins to form. The neural tube — which becomes the brain and spinal cord — is developing.",
  8: "🍓 Baby is now the size of a strawberry (~1.6cm). All major organs are forming. Tiny webbed fingers and toes are visible!",
  12: "🍋 Baby is about the size of a lime (~5.4cm). Risk of miscarriage drops significantly. You may hear the heartbeat on a Doppler!",
  16: "🥑 Baby is the size of an avocado (~11.6cm). Fetal movements begin — you may feel first flutters (quickening) soon!",
  20: "🍌 Baby is ~25cm. Halfway there! Anatomy scan recommended. Can determine gender if desired. Baby can hear your voice.",
  24: "🌽 Baby is 30cm and 600g. Lungs begin practicing breathing. Responds to your voice!",
  28: "🍆 Baby weighs ~1kg. Eyes can open and close. Sleep cycles established. 3rd trimester begins!",
  32: "🥥 Baby is ~42cm, 1.8kg. Fat deposits building for warmth. Most babies in head-down position now.",
  36: "🍈 Baby is near full term (~2.6kg). Lungs mature. May drop lower into pelvis (lightening).",
  40: "👶 Full term! Baby weighs ~3.4kg. Ready to meet the world! Labor signs: contractions, water breaking.",
};

export function getBabyData(week: number): string {
  const keys = Object.keys(BABY_DEVELOPMENT)
    .map(Number)
    .sort((a, b) => a - b);
  let chosen = keys[0];
  for (const k of keys) {
    if (k <= week) chosen = k;
  }
  return BABY_DEVELOPMENT[chosen];
}

export const MILESTONES = [
  { week: 8, label: "First ultrasound", desc: "Confirm pregnancy & heartbeat" },
  {
    week: 12,
    label: "First trimester ends",
    desc: "Risk of miscarriage decreases significantly",
  },
  {
    week: 16,
    label: "Fetal movement begins",
    desc: "You may feel first kicks (quickening)",
  },
  {
    week: 20,
    label: "Anatomy scan",
    desc: "Detailed ultrasound checks baby's organs",
  },
  {
    week: 24,
    label: "Viability milestone",
    desc: "Baby could survive with medical support",
  },
  {
    week: 28,
    label: "3rd trimester begins",
    desc: "Rapid brain & weight development",
  },
  { week: 36, label: "Nearly full term", desc: "Pack hospital bag!" },
  { week: 40, label: "Due date 🎉", desc: "Time to meet your little one!" },
];

export const NUTRITION_DATA: Record<
  string,
  {
    safe: string[];
    avoid: string[];
    supps: string[];
    nutrients: { name: string; pct: number; color: string }[];
  }
> = {
  "1st": {
    safe: [
      "Leafy greens 🥬",
      "Fortified cereals 🌾",
      "Beans & lentils 🫘",
      "Eggs 🥚",
      "Yogurt 🥛",
      "Citrus fruits 🍊",
    ],
    avoid: [
      "Raw fish/sushi 🍣",
      "Deli meats 🥩",
      "Unpasteurized cheese 🧀",
      "Alcohol 🚫",
      "High-mercury fish 🐟",
      "Raw eggs 🥚",
    ],
    supps: [
      "Folic Acid 400mcg",
      "Vitamin D 1000IU",
      "Iron 27mg",
      "Prenatal Multivitamin",
    ],
    nutrients: [
      { name: "Folic Acid", pct: 80, color: "#E8756A" },
      { name: "Iron", pct: 60, color: "#7BAF8E" },
      { name: "Calcium", pct: 70, color: "#C8A96E" },
      { name: "Vitamin D", pct: 55, color: "#7BA7D4" },
    ],
  },
  "2nd": {
    safe: [
      "Iron-rich red meat 🥩",
      "Salmon (cooked) 🐟",
      "Sweet potato 🍠",
      "Broccoli 🥦",
      "Nuts & seeds 🌰",
      "Whole grains 🌾",
    ],
    avoid: [
      "Raw sprouts 🌱",
      "Licorice 🍬",
      "Excess caffeine ☕",
      "Processed foods 🍔",
      "Raw shellfish 🦐",
      "Unpasteurized juice 🧃",
    ],
    supps: [
      "Iron 27mg",
      "DHA/Omega-3 200mg",
      "Calcium 1000mg",
      "Vitamin C 85mg",
    ],
    nutrients: [
      { name: "Iron", pct: 75, color: "#E8756A" },
      { name: "DHA/Omega-3", pct: 50, color: "#7BAF8E" },
      { name: "Calcium", pct: 80, color: "#C8A96E" },
      { name: "Protein", pct: 65, color: "#7BA7D4" },
    ],
  },
  "3rd": {
    safe: [
      "High-protein foods 🥩",
      "Avocado 🥑",
      "Dates 🌴",
      "Bananas 🍌",
      "Brown rice 🍚",
      "Coconut water 🥥",
    ],
    avoid: [
      "Spicy foods 🌶️",
      "Carbonated drinks 🥤",
      "Large portions 🍽️",
      "Alcohol 🚫",
      "Excess salt 🧂",
      "Grapefruit 🍊",
    ],
    supps: ["Iron 27mg", "Vitamin K", "Calcium 1200mg", "Magnesium 360mg"],
    nutrients: [
      { name: "Calcium", pct: 85, color: "#E8756A" },
      { name: "Vitamin K", pct: 60, color: "#7BAF8E" },
      { name: "Magnesium", pct: 70, color: "#C8A96E" },
      { name: "Iron", pct: 80, color: "#7BA7D4" },
    ],
  },
};

export const VACCINES = [
  {
    id: "tt1",
    name: "Tetanus Toxoid (TT) 1st dose",
    when: "As early as possible (Week 4–8)",
    eligibleFromWeek: 4,
    description:
      "Protects both mother and newborn against tetanus infection. Maternal antibodies actively cross the placenta, providing passive immunity to the baby before birth and reducing risk of neonatal tetanus.",
  },
  {
    id: "tt2",
    name: "Tetanus Toxoid (TT) 2nd dose",
    when: "4 weeks after 1st dose",
    eligibleFromWeek: 8,
    description:
      "Completes the primary TT immunisation series. The two-dose schedule is required to achieve sufficient antibody levels for long-lasting protection for both mother and newborn.",
  },
  {
    id: "flu",
    name: "Influenza (Flu) Vaccine",
    when: "Any trimester (recommended)",
    eligibleFromWeek: 1,
    description:
      "Pregnant women face significantly higher risk of severe flu complications including pneumonia and hospitalisation. The vaccine also transfers antibodies to the baby, offering protection in the first months of life before the infant can be vaccinated.",
  },
  {
    id: "tdap",
    name: "Tdap (Whooping Cough)",
    when: "Week 27–36",
    eligibleFromWeek: 27,
    description:
      "Whooping cough is most dangerous for newborns too young to be vaccinated themselves. Maternal Tdap immunisation transfers high levels of protective antibodies to the baby, providing critical early-life defence against pertussis, diphtheria, and tetanus.",
  },
  {
    id: "hepb",
    name: "Hepatitis B",
    when: "If not previously vaccinated",
    eligibleFromWeek: 1,
    description:
      "Without vaccination, Hepatitis B can be transmitted from mother to child during delivery, carrying a high risk of chronic infection in the newborn. The vaccine is safe during pregnancy and eliminates this perinatal transmission risk.",
  },
  {
    id: "covid",
    name: "COVID-19 Booster",
    when: "Recommended — consult doctor",
    eligibleFromWeek: 1,
    description:
      "Pregnancy increases the risk of severe COVID-19 outcomes including ICU admission and preterm birth. Vaccination significantly reduces these risks and passes protective antibodies to the baby through the placenta and breast milk.",
  },
];

export function getVaccineDefaultStatus(
  vaccineId: string,
  currentWeek: number
): "due" | "upcoming" {
  const vaccine = VACCINES.find((v) => v.id === vaccineId);
  if (!vaccine) return "upcoming";
  return currentWeek >= vaccine.eligibleFromWeek ? "due" : "upcoming";
}

export const SYMPTOMS = [
  { label: "Nausea", icon: "🤢", level: "normal" },
  { label: "Fatigue", icon: "😴", level: "normal" },
  { label: "Headache", icon: "🤕", level: "warn" },
  { label: "Cramping", icon: "😣", level: "warn" },
  { label: "Spotting", icon: "🩸", level: "warn" },
  { label: "Swelling", icon: "🦵", level: "warn" },
  { label: "Heavy Bleeding", icon: "🆘", level: "danger" },
  { label: "Severe Pain", icon: "⚡", level: "danger" },
  { label: "No Movement", icon: "⚠️", level: "danger" },
  { label: "Fever", icon: "🌡️", level: "warn" },
  { label: "Backache", icon: "🔴", level: "normal" },
  { label: "Vision Change", icon: "👁️", level: "danger" },
];

export const EMERGENCY_CONTACTS = [
  {
    icon: "🏥",
    number: "999 / 119",
    desc: "National Emergency & Ambulance (Bangladesh)",
    href: "tel:999",
  },
  {
    icon: "👩‍⚕️",
    number: "16000",
    desc: "National Health Helpline",
    href: "tel:16000",
  },
  {
    icon: "🤱",
    number: "10921",
    desc: "Maternal & Child Health Support Line",
    href: "tel:10921",
  },
  {
    icon: "🚑",
    number: "01700-000000",
    desc: "Doctor's Personal Contact",
    href: "tel:01700000000",
  },
];
