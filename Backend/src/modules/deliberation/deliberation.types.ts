// ─── DELIBERATION TYPES ───────────────────────────────────────────────────────

export type AdmissionResult = "Admis(e)" | "En liste d'attente" | "Ajourné(e)";

// ─── INPUT / REQUEST ─────────────────────────────────────────────────────────

export interface ComputeDeliberationRequest {
  sessionId: string;
}

export interface CloseDeliberationRequest {
  sessionId: string;
}

// ─── RANKED CANDIDATE ────────────────────────────────────────────────────────

export interface RankedCandidate {
  rank: number;
  candidateId: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  anonymousCodes: Record<string, string>; // subjectId → anonymousCode
  subjectGrades: SubjectGrade[];
  weightedAverage: number;
  result: AdmissionResult;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  grade: number;
  anonymousCode: string;
}

// ─── DELIBERATION RESULT ─────────────────────────────────────────────────────

export interface DeliberationResult {
  sessionId: string;
  specializationId: string;
  specializationName: string;
  availableSlots: number;
  waitingListSlots: number;
  rankedCandidates: RankedCandidate[];
  computedAt: Date;
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export interface DeliberationStats {
  specializationId: string;
  specializationName: string;
  total: number;
  admitted: number;
  waitlisted: number;
  rejected: number;
  warningCandidates: WarningCandidate[];
}

export interface WarningCandidate {
  firstName: string;
  lastName: string;
  weightedAverage: number;
  rank: number;
}

// ─── COMPUTE RESPONSE ────────────────────────────────────────────────────────

export interface ComputeDeliberationResponse {
  sessionId: string;
  results: DeliberationResult[];
  stats: DeliberationStats[];
  xlsxPath: string;
  emailSent: boolean;
}

// ─── CLOSE RESPONSE ──────────────────────────────────────────────────────────

export interface CloseDeliberationResponse {
  sessionId: string;
  pvAnonymatPath: string;
  pvNominatifPath: string;
  candidateEmailsSent: number;
}

// ─── RANKING RESPONSE ────────────────────────────────────────────────────────

export interface RankingResponse {
  sessionId: string;
  specializations: DeliberationResult[];
}

// ─── INTERNAL: raw data fetched from DBs ─────────────────────────────────────

export interface CandidateWithGrades {
  candidateId: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  specializationId: string;
  subjectGrades: {
    subjectId: string;
    subjectName: string;
    coefficient: number;
    grade: number;
    anonymousCode: string;
    qrCode: string;
  }[];
}

// ─── JURY / ANONYMAT MEMBERS ─────────────────────────────────────────────────

export interface JuryMember {
  firstName: string;
  lastName: string;
  academicGrade: string | null;
  institution: string | null;
}

export interface AnonymatMember {
  firstName: string;
  lastName: string;
  academicGrade: string | null;
  institution: string | null;
}

// ─── SESSION STAFF ROW (typed to avoid implicit any) ─────────────────────────

export interface SessionStaffRow {
  function: string;
  user: {
    firstName: string;
    lastName: string;
    academicGrade: string | null;
    institution: string | null;
  };
}
