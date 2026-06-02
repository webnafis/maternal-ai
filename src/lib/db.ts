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
  dueDate?: string
) {
  await sql`
    INSERT INTO users (id, name, pregnancy_week, due_date)
    VALUES (${id}, ${name}, ${pregnancyWeek}, ${dueDate || null})
  `;
  return getUserById(id);
}

export async function updateUserWeek(userId: string, week: number) {
  await sql`UPDATE users SET pregnancy_week = ${week}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
}

export async function updateUserLanguage(userId: string, language: string) {
  await sql`UPDATE users SET language = ${language}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
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
  aiAnalysis?: string
) {
  const id = uuidv4();
  const symptomsStr = JSON.stringify(symptoms);
  await sql`
    INSERT INTO symptom_logs (id, user_id, date, symptoms, severity, ai_analysis, saved_by_user)
    VALUES (${id}, ${userId}, ${date}, ${symptomsStr}, ${severity}, ${
    aiAnalysis || null
  }, TRUE)
  `;
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
  }
) {
  const id = `me_${userId}_${date}`;
  await sql`
    INSERT INTO mood_entries (id, user_id, date, mood_emoji, mood_label, mood_score, journal, phq_score, ai_feedback)
    VALUES (${id}, ${userId}, ${date}, ${data.moodEmoji || null}, ${
    data.moodLabel || null
  }, ${data.moodScore ?? null}, ${data.journal || null}, ${
    data.phqScore ?? null
  }, ${data.aiFeedback || null})
    ON CONFLICT(user_id, date) DO UPDATE SET
      mood_emoji = COALESCE(EXCLUDED.mood_emoji, mood_entries.mood_emoji),
      mood_label = COALESCE(EXCLUDED.mood_label, mood_entries.mood_label),
      mood_score = COALESCE(EXCLUDED.mood_score, mood_entries.mood_score),
      journal = COALESCE(EXCLUDED.journal, mood_entries.journal),
      phq_score = COALESCE(EXCLUDED.phq_score, mood_entries.phq_score),
      ai_feedback = COALESCE(EXCLUDED.ai_feedback, mood_entries.ai_feedback)
  `;
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
  content: string
) {
  const id = uuidv4();
  await sql`INSERT INTO chat_history (id, user_id, role, content) VALUES (${id}, ${userId}, ${role}, ${content})`;
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
  timestamp: string;
}
