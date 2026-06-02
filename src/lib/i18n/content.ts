import type { AppLanguage } from "./types";
import { getMessages, translate } from "./messages";
import {
  BABY_DEVELOPMENT,
  MILESTONES,
  NUTRITION_DATA,
  VACCINES,
  EMERGENCY_CONTACTS,
} from "@/lib/utils";

export interface LocalizedSymptom {
  id: string;
  label: string;
  icon: string;
  level: "normal" | "warn" | "danger";
}

const SYMPTOM_DEFS: { id: string; en: string; bn: string; icon: string; level: "normal" | "warn" | "danger" }[] = [
  { id: "nausea", en: "Nausea", bn: "বমি বমি ভাব", icon: "🤢", level: "normal" },
  { id: "fatigue", en: "Fatigue", bn: "ক্লান্তি", icon: "😴", level: "normal" },
  { id: "headache", en: "Headache", bn: "মাথাব্যথা", icon: "🤕", level: "warn" },
  { id: "cramping", en: "Cramping", bn: "খিঁচুনি", icon: "😣", level: "warn" },
  { id: "spotting", en: "Spotting", bn: "হালকা রক্তপাত", icon: "🩸", level: "warn" },
  { id: "swelling", en: "Swelling", bn: "ফোলা", icon: "🦵", level: "warn" },
  { id: "heavy_bleeding", en: "Heavy Bleeding", bn: "ভারী রক্তপাত", icon: "🆘", level: "danger" },
  { id: "severe_pain", en: "Severe Pain", bn: "তীব্র ব্যথা", icon: "⚡", level: "danger" },
  { id: "no_movement", en: "No Movement", bn: "নড়াচড়া নেই", icon: "⚠️", level: "danger" },
  { id: "fever", en: "Fever", bn: "জ্বর", icon: "🌡️", level: "warn" },
  { id: "backache", en: "Backache", bn: "পিঠে ব্যথা", icon: "🔴", level: "normal" },
  { id: "vision_change", en: "Vision Change", bn: "দৃষ্টি পরিবর্তন", icon: "👁️", level: "danger" },
];

export const DANGEROUS_SYMPTOM_IDS = [
  "heavy_bleeding",
  "severe_pain",
  "no_movement",
  "vision_change",
];
export const WARNING_SYMPTOM_IDS = [
  "headache",
  "cramping",
  "spotting",
  "swelling",
  "fever",
];

export function getLocalizedSymptoms(lang: AppLanguage): LocalizedSymptom[] {
  return SYMPTOM_DEFS.map((s) => ({
    id: s.id,
    label: lang === "bn" ? s.bn : s.en,
    icon: s.icon,
    level: s.level,
  }));
}

export function getSymptomLabel(id: string, lang: AppLanguage): string {
  const s = SYMPTOM_DEFS.find((x) => x.id === id);
  if (!s) return id;
  return lang === "bn" ? s.bn : s.en;
}

const CHECKLIST_EN = [
  "Take prenatal vitamins 💊",
  "Drink 8 glasses of water 💧",
  "Eat iron-rich food 🥦",
  "30-min gentle walk 🚶",
  "Rest for 30 minutes 😴",
  "Track fetal movements 👶",
];
const CHECKLIST_BN = [
  "প্রসবপূর্ব ভিটামিন নিন 💊",
  "৮ গ্লাস পানি পান করুন 💧",
  "লৌহযুক্ত খাবার খান 🥦",
  "৩০ মিনিট হালকা হাঁটা 🚶",
  "৩০ মিনিট বিশ্রাম নিন 😴",
  "ভ্রূণের নড়াচড়া লক্ষ করুন 👶",
];

export function getLocalizedChecklist(lang: AppLanguage): string[] {
  return lang === "bn" ? CHECKLIST_BN : CHECKLIST_EN;
}

const WEEK_FOCUS: Record<AppLanguage, Record<string, string>> = {
  en: {
    "1st": "💊 Take folic acid daily. Avoid alcohol & smoking. Book your first prenatal appointment. Rest often — fatigue is normal. Stay hydrated with 8–10 glasses of water.",
    "2nd": "🌿 Regular prenatal check-ups. Consider iron-rich foods. Begin gentle prenatal yoga. Track baby movements. Discuss birth plan with your doctor.",
    "3rd": "🏥 Pack your hospital bag. Attend childbirth classes. Monitor fetal movements daily. Limit travel. Discuss labor signs with your midwife.",
  },
  bn: {
    "1st": "💊 প্রতিদিন ফলিক অ্যাসিড নিন। মদ ও ধূমপান এড়িয়ে চলুন। প্রথম প্রসবপূর্ব সাক্ষাৎ বুক করুন। বিশ্রাম নিন — ক্লান্তি স্বাভাবিক। ৮–১০ গ্লাস পানি পান করুন।",
    "2nd": "🌿 নিয়মিত প্রসবপূর্ব পরীক্ষা। লৌহযুক্ত খাবার খান। হালকা প্রসবপূর্ব যোগব্যায়াম শুরু করুন। শিশুর নড়াচড়া লক্ষ করুন। ডাক্তারের সাথে প্রসব পরিকল্পনা আলোচনা করুন।",
    "3rd": "🏥 হাসপাতালের ব্যাগ প্যাক করুন। প্রসব ক্লাসে যোগ দিন। প্রতিদিন ভ্রূণের নড়াচড়া পর্যবেক্ষণ করুন। ভ্রমণ সীমিত করুন। প্রসবের লক্ষণ নিয়ে পরামর্শ নিন।",
  },
};

export function getLocalizedWeekFocus(
  lang: AppLanguage,
  trimester: string
): string {
  return WEEK_FOCUS[lang][trimester] || WEEK_FOCUS.en[trimester] || "";
}

const BABY_DEV_BN: Record<number, string> = {
  4: "🫐 শিশু ব্লুবেরির মতো (~৫মিমি)। হৃদয় গঠন শুরু। স্নায়ু নল — মস্তিষ্ক ও মেরুদণ্ড হয় — বিকশিত হচ্ছে।",
  8: "🍓 শিশু এখন স্ট্রবেরির মতো (~১.৬সেমি)। সব প্রধান অঙ্গ গঠিত হচ্ছে। ছোট আঙুল-পায়ের পর্দা দেখা যায়!",
  12: "🍋 শিশু লেবুর মতো (~৫.৪সেমি)। গর্ভপাতের ঝুঁকি কমে। ডপলারে হৃদস্পন্দন শোনা যেতে পারে!",
  16: "🥑 শিশু অ্যাভোকাডোর মতো (~১১.৬সেমি)। ভ্রূণের নড়াচড়া শুরু — প্রথম ঝাপটা অনুভব হতে পারে!",
  20: "🍌 শিশু ~২৫সেমি। অর্ধেক পথ! অ্যানাটমি স্ক্যান সুপারিশকৃত। লিঙ্গ নির্ধারণ করা যায়। আপনার কণ্ঠ শুনতে পারে।",
  24: "🌽 শিশু ৩০সেমি, ৬০০গ্রাম। ফুসফুস শ্বাস অনুশীলন শুরু। আপনার কণ্ঠের প্রতি সাড়া দেয়!",
  28: "🍆 শিশুর ওজন ~১কেজি। চোখ খুলতে ও বন্ধ করতে পারে। ৩য় ত্রৈমাসিক শুরু!",
  32: "🥥 শিশু ~৪২সেমি, ১.৮কেজি। উষ্ণতার জন্য চর্বি জমছে। বেশিরভাগ মাথা নিচে।",
  36: "🍈 শিশু প্রায় পূর্ণ মেয়াদি (~২.৬কেজি)। ফুসফুস পরিপক্ব। শ্রোণিতে নেমে আসতে পারে।",
  40: "👶 পূর্ণ মেয়াদ! শিশুর ওজন ~৩.৪কেজি। বিশ্বের সাথে দেখা করার সময়! প্রসব লক্ষণ: সংকোচন, পানি ভাঙা।",
};

export function getLocalizedBabyData(week: number, lang: AppLanguage): string {
  const source = lang === "bn" ? BABY_DEV_BN : BABY_DEVELOPMENT;
  const keys = Object.keys(source).map(Number).sort((a, b) => a - b);
  let chosen = keys[0];
  for (const k of keys) {
    if (k <= week) chosen = k;
  }
  return source[chosen];
}

const MILESTONE_BN = [
  { week: 8, label: "প্রথম আল্ট্রাসাউন্ড", desc: "গর্ভাবস্থা ও হৃদস্পন্দন নিশ্চিত" },
  { week: 12, label: "প্রথম ত্রৈমাসিক শেষ", desc: "গর্ভপাতের ঝুঁকি উল্লেখযোগ্যভাবে কমে" },
  { week: 16, label: "ভ্রূণের নড়াচড়া শুরু", desc: "প্রথম লাথি (কুইকেনিং) অনুভব হতে পারে" },
  { week: 20, label: "অ্যানাটমি স্ক্যান", desc: "বিস্তারিত আল্ট্রাসাউন্ড অঙ্গ পরীক্ষা" },
  { week: 24, label: "বাঁচার মাইলফলক", desc: "চিকিৎসা সহায়তায় শিশু বাঁচতে পারে" },
  { week: 28, label: "৩য় ত্রৈমাসিক শুরু", desc: "দ্রুত মস্তিষ্ক ও ওজন বৃদ্ধি" },
  { week: 36, label: "প্রায় পূর্ণ মেয়াদ", desc: "হাসপাতালের ব্যাগ প্যাক করুন!" },
  { week: 40, label: "নির্ধারিত তারিখ 🎉", desc: "আপনার সন্তানের সাথে দেখা করার সময়!" },
];

export function getLocalizedMilestones(lang: AppLanguage) {
  if (lang === "bn") return MILESTONE_BN;
  return MILESTONES;
}

const MOODS_EN = [
  { emoji: "😊", label: "Great", score: 5 },
  { emoji: "🙂", label: "Good", score: 4 },
  { emoji: "😐", label: "Okay", score: 3 },
  { emoji: "😔", label: "Low", score: 2 },
  { emoji: "😰", label: "Anxious", score: 1 },
];
const MOODS_BN = [
  { emoji: "😊", label: "দারুণ", score: 5 },
  { emoji: "🙂", label: "ভালো", score: 4 },
  { emoji: "😐", label: "ঠিক আছে", score: 3 },
  { emoji: "😔", label: "খারাপ", score: 2 },
  { emoji: "😰", label: "উদ্বিগ্ন", score: 1 },
];

export function getLocalizedMoods(lang: AppLanguage) {
  return lang === "bn" ? MOODS_BN : MOODS_EN;
}

export function getLocalizedGreeting(lang: AppLanguage): string {
  const hour = new Date().getHours();
  const key =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return translate(getMessages(lang), `greeting.${key}`);
}

const NUTRITION_BN: typeof NUTRITION_DATA = {
  "1st": {
    safe: [
      "পাতা জাতীয় সবজি 🥬",
      "ফোর্টিফাইড সিরিয়াল 🌾",
      "শিম ও মসুর ডাল 🫘",
      "ডিম 🥚",
      "দই 🥛",
      "সাইট্রাস ফল 🍊",
    ],
    avoid: [
      "কাঁচা মাছ/সুশি 🍣",
      "প্রসেসড মাংস 🥩",
      "অপastesurized পনির 🧀",
      "মদ 🚫",
      "উচ্চ পারদযুক্ত মাছ 🐟",
      "কাঁচা ডিম 🥚",
    ],
    supps: [
      "ফলিক অ্যাসিড ৪০০mcg",
      "ভিটামিন ডি ১০০০IU",
      "লৌহ ২৭mg",
      "প্রসবপূর্ব মাল্টিভিটামিন",
    ],
    nutrients: [
      { name: "ফলিক অ্যাসিড", pct: 80, color: "#E8756A" },
      { name: "লৌহ", pct: 60, color: "#7BAF8E" },
      { name: "ক্যালসিয়াম", pct: 70, color: "#C8A96E" },
      { name: "ভিটামিন ডি", pct: 55, color: "#7BA7D4" },
    ],
  },
  "2nd": {
    safe: [
      "লৌহযুক্ত লাল মাংস 🥩",
      "সালমন (রান্না করা) 🐟",
      "মিষ্টি আলু 🍠",
      "ব্রোকলি 🥦",
      "বাদাম ও বীজ 🌰",
      "সম্পূর্ণ শস্য 🌾",
    ],
    avoid: [
      "কাঁচা অঙ্কুর 🌱",
      "জ্যাথারাইজ 🍬",
      "অতিরিক্ত ক্যাফিন ☕",
      "প্রসেসড খাবার 🍔",
      "কাঁচা শেলফিশ 🦐",
      "অপastesurized জুস 🧃",
    ],
    supps: [
      "লৌহ ২৭mg",
      "DHA/ওমেগা-৩ ২০০mg",
      "ক্যালসিয়াম ১০০০mg",
      "ভিটামিন সি ৮৫mg",
    ],
    nutrients: [
      { name: "লৌহ", pct: 75, color: "#E8756A" },
      { name: "DHA/ওমেগা-৩", pct: 50, color: "#7BAF8E" },
      { name: "ক্যালসিয়াম", pct: 80, color: "#C8A96E" },
      { name: "প্রোটিন", pct: 65, color: "#7BA7D4" },
    ],
  },
  "3rd": {
    safe: [
      "উচ্চ প্রোটিন খাবার 🥩",
      "অ্যাভোকাডো 🥑",
      "খেজুর 🌴",
      "কলা 🍌",
      "বাদামী চাল 🍚",
      "নারকেল পানি 🥥",
    ],
    avoid: [
      "ঝাল খাবার 🌶️",
      "কার্বোনেটেড পানীয় 🥤",
      "বড় পরিমাণ 🍽️",
      "মদ 🚫",
      "অতিরিক্ত লবণ 🧂",
      "গ্রেপফ্রুট 🍊",
    ],
    supps: [
      "লৌহ ২৭mg",
      "ভিটামিন কে",
      "ক্যালসিয়াম ১২০০mg",
      "ম্যাগনেসিয়াম ৩৬০mg",
    ],
    nutrients: [
      { name: "ক্যালসিয়াম", pct: 85, color: "#E8756A" },
      { name: "ভিটামিন কে", pct: 60, color: "#7BAF8E" },
      { name: "ম্যাগনেসিয়াম", pct: 70, color: "#C8A96E" },
      { name: "লৌহ", pct: 80, color: "#7BA7D4" },
    ],
  },
};

export function getLocalizedNutrition(lang: AppLanguage, trimester: string) {
  if (lang === "bn" && NUTRITION_BN[trimester]) return NUTRITION_BN[trimester];
  return NUTRITION_DATA[trimester];
}

export function getTrimesterDisplay(
  lang: AppLanguage,
  trimester: "1st" | "2nd" | "3rd"
): string {
  if (lang === "en") return trimester;
  const map: Record<string, string> = { "1st": "১ম", "2nd": "২য়", "3rd": "৩য়" };
  return map[trimester] || trimester;
}

export function getVaccineStatusLabel(
  lang: AppLanguage,
  status: "done" | "due" | "upcoming"
): string {
  const labels = {
    en: { done: "Completed", due: "Due Now", upcoming: "Upcoming" },
    bn: { done: "সম্পন্ন", due: "এখন বাকি", upcoming: "আসন্ন" },
  };
  return labels[lang][status];
}

export function getLocalizedVaccines(lang: AppLanguage) {
  if (lang === "en") return VACCINES;
  const names: Record<string, { name: string; when: string; description: string }> = {
    tt1: {
      name: "টিটানাস টক্সয়েড (TT) ১ম ডোজ",
      when: "যত তাড়াতাড়ি সম্ভব (৪–৮ সপ্তাহ)",
      description:
        "মা ও নবজাতককে টিটানাস থেকে রক্ষা করে। মাতৃ অ্যান্টিবডি প্লাসেন্টা দিয়ে শিশুর কাছে যায়।",
    },
    tt2: {
      name: "টিটানাস টক্সয়েড (TT) ২য় ডোজ",
      when: "১ম ডোজের ৪ সপ্তাহ পর",
      description: "প্রাথমিক TT সিরিজ সম্পূর্ণ করে। দীর্ঘস্থায়ী সুরক্ষার জন্য দুই ডোজ প্রয়োজন।",
    },
    flu: {
      name: "ইনফ্লুয়েঞ্জা (ফ্লু) ভ্যাকসিন",
      when: "যেকোনো ত্রৈমাসিক (সুপারিশকৃত)",
      description:
        "গর্ভবতী মহিলাদের ফ্লুর গুরুতর জটিলতার ঝুঁকি বেশি। ভ্যাকসিন শিশুকে অ্যান্টিবডি দেয়।",
    },
    tdap: {
      name: "টিড্যাপ (হুপিং কাশি)",
      when: "২৭–৩৬ সপ্তাহ",
      description:
        "নবজাতকের জন্য হুপিং কাশি বিপজ্জনক। মাতৃ টিড্যাপ শিশুকে সুরক্ষা দেয়।",
    },
    hepb: {
      name: "হেপাটাইটিস বি",
      when: "আগে টিকা না থাকলে",
      description:
        "টিকা ছাড়া প্রসবের সময় মা থেকে শিশুতে সংক্রমণ হতে পারে। গর্ভাবস্থায় নিরাপদ।",
    },
    covid: {
      name: "কোভিড-১৯ বুস্টার",
      when: "সুপারিশকৃত — ডাক্তারের পরামর্শ নিন",
      description:
        "গর্ভাবস্থায় গুরুতর কোভিড-১৯ এর ঝুঁকি বাড়ে। টিকা ঝুঁকি কমায় এবং শিশুকে অ্যান্টিবডি দেয়।",
    },
  };
  return VACCINES.map((v) => ({
    ...v,
    ...(names[v.id] || {}),
  }));
}

export function getLocalizedEmergencyContacts(lang: AppLanguage) {
  if (lang === "en") return EMERGENCY_CONTACTS;
  return EMERGENCY_CONTACTS.map((c) => ({
    ...c,
    desc:
      c.number === "999 / 119"
        ? "জাতীয় জরুরি ও অ্যাম্বুলেন্স (বাংলাদেশ)"
        : c.number === "16000"
        ? "জাতীয় স্বাস্থ্য হেল্পলাইন"
        : c.number === "10921"
        ? "মাতৃ ও শিশু স্বাস্থ্য সহায়তা লাইন"
        : "ডাক্তারের ব্যক্তিগত যোগাযোগ",
  }));
}

export { VACCINES };

const EN_SYMPTOM_LABEL_TO_ID: Record<string, string> = {};
for (const s of SYMPTOM_DEFS) {
  EN_SYMPTOM_LABEL_TO_ID[s.en] = s.id;
  EN_SYMPTOM_LABEL_TO_ID[s.en.toLowerCase()] = s.id;
}

/** Map stored symptom ids or legacy English labels to display labels */
export function localizeSymptomTokens(
  tokens: string[],
  lang: AppLanguage
): string[] {
  return tokens.map((token) => {
    if (SYMPTOM_DEFS.some((s) => s.id === token)) {
      return getSymptomLabel(token, lang);
    }
    const id =
      EN_SYMPTOM_LABEL_TO_ID[token] ?? EN_SYMPTOM_LABEL_TO_ID[token.toLowerCase()];
    if (id) return getSymptomLabel(id, lang);
    return token;
  });
}

const EN_MOOD_TO_SCORE: Record<string, number> = {
  Great: 5,
  Good: 4,
  Okay: 3,
  Low: 2,
  Anxious: 1,
  দারুণ: 5,
  ভালো: 4,
};

export function getLocalizedMoodLabel(
  label: string | null | undefined,
  score: number | null | undefined,
  lang: AppLanguage
): string {
  const moods = getLocalizedMoods(lang);
  if (score != null) {
    const byScore = moods.find((m) => m.score === score);
    if (byScore) return byScore.label;
  }
  if (label && EN_MOOD_TO_SCORE[label] != null) {
    const s = EN_MOOD_TO_SCORE[label];
    return moods.find((m) => m.score === s)?.label ?? label;
  }
  return label ?? "";
}

export function getSeverityLabel(
  lang: AppLanguage,
  severity: string
): string {
  const map: Record<string, Record<AppLanguage, string>> = {
    safe: { en: "Safe", bn: "নিরাপদ" },
    warn: { en: "Monitor", bn: "সতর্ক" },
    danger: { en: "Urgent", bn: "জরুরি" },
  };
  return map[severity]?.[lang] ?? severity;
}
