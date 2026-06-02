import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";

// Initialize the Serverless Neon connection
const sql = neon(process.env.DATABASE_URL!);

// ─── Schema Initialization ──────────────────────────────────────────────────
// Call this function once or create these tables directly in your Neon console dashboard.
export async function initializeSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      pregnancy_week INTEGER NOT NULL,
      due_date TEXT,
      language TEXT DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checklist_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS symptom_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      symptoms TEXT NOT NULL DEFAULT '[]',
      severity TEXT NOT NULL DEFAULT 'safe',
      ai_analysis TEXT,
      saved_by_user BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      mood_emoji TEXT,
      mood_label TEXT,
      mood_score INTEGER,
      journal TEXT,
      phq_score INTEGER,
      ai_feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS vaccination_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vaccine_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, vaccine_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Postgres handles indexes implicitly on unique/pkeys, but these optimize query lookup speeds:
  await sql`CREATE INDEX IF NOT EXISTS idx_checklist_user_date ON checklist_logs(user_id, date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_symptom_user_date ON symptom_logs(user_id, date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_entries(user_id, date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vacc_user ON vaccination_records(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);`;

  await migrateI18nColumns();
  await migrateAuthColumns();
}

/** Password auth column */
export async function migrateAuthColumns() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
  } catch (e) {
    console.warn("auth column migration:", e);
  }
}

/** Add JSON translation cache columns for multilingual AI content */
export async function migrateI18nColumns() {
  try {
    await sql`ALTER TABLE symptom_logs ADD COLUMN IF NOT EXISTS ai_analysis_i18n TEXT`;
    await sql`ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS ai_feedback_i18n TEXT`;
    await sql`ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS content_i18n TEXT`;
    await sql`ALTER TABLE symptom_logs ADD COLUMN IF NOT EXISTS source_lang TEXT DEFAULT 'en'`;
    await sql`ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS source_lang TEXT DEFAULT 'en'`;
    await sql`ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS source_lang TEXT DEFAULT 'en'`;
  } catch (e) {
    console.warn("i18n column migration:", e);
  }
}

// ─── User Operations ───────────────────────────────────────────────────────
export async function getUserByName(name: string) {
  // LOWER() replicates SQLite's NOCASE matching behavior safely in Postgres
  const rows =
    await sql`SELECT * FROM users WHERE LOWER(name) = LOWER(${name})`;
  return rows[0] as User | undefined;
}

export async function getUserById(id: string) {
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] as User | undefined;
}

export async function createUser(
  id: string,
  name: string,
  pregnancyWeek: number,
  dueDate?: string,
  language?: string,
  passwordHash?: string
) {
  const lang = language === "bn" ? "bn" : "en";
  await sql`
    INSERT INTO users (id, name, pregnancy_week, due_date, language, password_hash)
    VALUES (${id}, ${name}, ${pregnancyWeek}, ${dueDate || null}, ${lang}, ${passwordHash || null})
  `;
  return getUserById(id);
}

export async function updateUserWeek(userId: string, week: number) {
  await sql`UPDATE users SET pregnancy_week = ${week}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
}

export async function updateUserLanguage(userId: string, language: string) {
  const lang = language === "bn" ? "bn" : "en";
  await sql`UPDATE users SET language = ${lang}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
}

// ─── Checklist Operations ───────────────────────────────────────────────────
export async function getChecklistForDate(userId: string, date: string) {
  const rows =
    await sql`SELECT * FROM checklist_logs WHERE user_id = ${userId} AND date = ${date}`;
  const row = rows[0] as ChecklistLog | undefined;
  return row
    ? { ...row, items: JSON.parse(row.items as unknown as string) }
    : null;
}

export async function upsertChecklist(
  userId: string,
  date: string,
  items: boolean[]
) {
  const id = `cl_${userId}_${date}`;
  const itemsStr = JSON.stringify(items);
  await sql`
    INSERT INTO checklist_logs (id, user_id, date, items, updated_at)
    VALUES (${id}, ${userId}, ${date}, ${itemsStr}, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, date) DO UPDATE SET items = EXCLUDED.items, updated_at = CURRENT_TIMESTAMP
  `;
}

// ─── Symptom Operations ─────────────────────────────────────────────────────
// In db.ts — replace getSymptomLogsForUser
export async function getSymptomLogsForUser(userId: string, limit = 30) {
  const rows = await sql`
    SELECT * FROM symptom_logs
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    ...r,
    symptoms: JSON.parse(r.symptoms as unknown as string),
  })) as unknown as SymptomLog[];
}

export async function getSymptomLogForDate(userId: string, date: string) {
  const rows =
    await sql`SELECT * FROM symptom_logs WHERE user_id = ${userId} AND date = ${date}`;
  const row = rows[0] as SymptomLog | undefined;
  return row
    ? { ...row, symptoms: JSON.parse(row.symptoms as unknown as string) }
    : null;
}

export async function saveSymptomLog(
  userId: string,
  date: string,
  symptoms: string[],
  severity: string,
  aiAnalysis?: string,
  aiAnalysisI18n?: string,
  sourceLang?: string
) {
  const id = uuidv4();
  const symptomsStr = JSON.stringify(symptoms);
  await sql`
    INSERT INTO symptom_logs (id, user_id, date, symptoms, severity, ai_analysis, ai_analysis_i18n, source_lang, saved_by_user)
    VALUES (${id}, ${userId}, ${date}, ${symptomsStr}, ${severity}, ${
    aiAnalysis || null
  }, ${aiAnalysisI18n || null}, ${sourceLang || "en"}, TRUE)
  `;
}

export async function updateSymptomLogI18n(
  logId: string,
  i18n: string,
  primary?: string
) {
  if (primary) {
    await sql`UPDATE symptom_logs SET ai_analysis_i18n = ${i18n}, ai_analysis = ${primary} WHERE id = ${logId}`;
  } else {
    await sql`UPDATE symptom_logs SET ai_analysis_i18n = ${i18n} WHERE id = ${logId}`;
  }
}

// ─── Mood Operations ─────────────────────────────────────────────────────────
export async function getMoodEntriesForUser(userId: string, limit = 30) {
  return (await sql`SELECT * FROM mood_entries WHERE user_id = ${userId} ORDER BY date DESC LIMIT ${limit}`) as unknown as MoodEntry[];
}

export async function getMoodEntryForDate(userId: string, date: string) {
  const rows =
    await sql`SELECT * FROM mood_entries WHERE user_id = ${userId} AND date = ${date}`;
  return rows[0] as MoodEntry | undefined;
}

export async function upsertMoodEntry(
  userId: string,
  date: string,
  data: {
    moodEmoji?: string;
    moodLabel?: string;
    moodScore?: number;
    journal?: string;
    phqScore?: number;
    aiFeedback?: string;
    aiFeedbackI18n?: string;
    sourceLang?: string;
  }
) {
  const id = `me_${userId}_${date}`;
  await sql`
    INSERT INTO mood_entries (id, user_id, date, mood_emoji, mood_label, mood_score, journal, phq_score, ai_feedback, ai_feedback_i18n, source_lang)
    VALUES (${id}, ${userId}, ${date}, ${data.moodEmoji || null}, ${
    data.moodLabel || null
  }, ${data.moodScore ?? null}, ${data.journal || null}, ${
    data.phqScore ?? null
  }, ${data.aiFeedback || null}, ${data.aiFeedbackI18n || null}, ${data.sourceLang || "en"})
    ON CONFLICT(user_id, date) DO UPDATE SET
      mood_emoji = COALESCE(EXCLUDED.mood_emoji, mood_entries.mood_emoji),
      mood_label = COALESCE(EXCLUDED.mood_label, mood_entries.mood_label),
      mood_score = COALESCE(EXCLUDED.mood_score, mood_entries.mood_score),
      journal = COALESCE(EXCLUDED.journal, mood_entries.journal),
      phq_score = COALESCE(EXCLUDED.phq_score, mood_entries.phq_score),
      ai_feedback = COALESCE(EXCLUDED.ai_feedback, mood_entries.ai_feedback),
      ai_feedback_i18n = COALESCE(EXCLUDED.ai_feedback_i18n, mood_entries.ai_feedback_i18n),
      source_lang = COALESCE(EXCLUDED.source_lang, mood_entries.source_lang)
  `;
}

export async function updateMoodEntryI18n(
  entryId: string,
  i18n: string,
  primary?: string
) {
  if (primary) {
    await sql`UPDATE mood_entries SET ai_feedback_i18n = ${i18n}, ai_feedback = ${primary} WHERE id = ${entryId}`;
  } else {
    await sql`UPDATE mood_entries SET ai_feedback_i18n = ${i18n} WHERE id = ${entryId}`;
  }
}

// ─── Vaccination Operations ──────────────────────────────────────────────────
export async function getVaccinationRecords(userId: string) {
  return (await sql`SELECT * FROM vaccination_records WHERE user_id = ${userId}`) as unknown as VaccinationRecord[];
}

export async function upsertVaccination(
  userId: string,
  vaccineId: string,
  status: string
) {
  const id = `vr_${userId}_${vaccineId}`;
  await sql`
    INSERT INTO vaccination_records (id, user_id, vaccine_id, status, updated_at)
    VALUES (${id}, ${userId}, ${vaccineId}, ${status}, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, vaccine_id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
  `;
}

// ─── Chat Operations ──────────────────────────────────────────────────────────
export async function getChatHistory(userId: string, limit = 50) {
  return (await sql`SELECT * FROM chat_history WHERE user_id = ${userId} ORDER BY timestamp ASC LIMIT ${limit}`) as unknown as ChatMessage[];
}

export async function saveChatMessage(
  userId: string,
  role: "user" | "assistant",
  content: string,
  contentI18n?: string,
  sourceLang?: string
) {
  const id = uuidv4();
  await sql`INSERT INTO chat_history (id, user_id, role, content, content_i18n, source_lang) VALUES (${id}, ${userId}, ${role}, ${content}, ${contentI18n || null}, ${sourceLang || (role === "assistant" ? "en" : null)})`;
}

export async function updateChatMessageI18n(
  messageId: string,
  i18n: string,
  primary?: string
) {
  if (primary) {
    await sql`UPDATE chat_history SET content_i18n = ${i18n}, content = ${primary} WHERE id = ${messageId}`;
  } else {
    await sql`UPDATE chat_history SET content_i18n = ${i18n} WHERE id = ${messageId}`;
  }
}

export async function clearChatHistory(userId: string) {
  await sql`DELETE FROM chat_history WHERE user_id = ${userId}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  pregnancy_week: number;
  due_date: string | null;
  language: string;
  password_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistLog {
  id: string;
  user_id: string;
  date: string;
  items: boolean[];
  created_at: string;
  updated_at: string;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  date: string;
  symptoms: string[];
  severity: string;
  ai_analysis: string | null;
  ai_analysis_i18n?: string | null;
  source_lang?: string | null;
  saved_by_user: boolean;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  mood_emoji: string | null;
  mood_label: string | null;
  mood_score: number | null;
  journal: string | null;
  phq_score: number | null;
  ai_feedback: string | null;
  ai_feedback_i18n?: string | null;
  source_lang?: string | null;
  created_at: string;
}

export interface VaccinationRecord {
  id: string;
  user_id: string;
  vaccine_id: string;
  status: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: string;
  content: string;
  content_i18n?: string | null;
  source_lang?: string | null;
  timestamp: string;
}
