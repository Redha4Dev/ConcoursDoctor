import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateSessionDto,
  UpdateSessionDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  SetGradingConfigDto,
} from "./sessions.types.js";

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createSession = async (
  dto: CreateSessionDto,
  coordinatorId: string,
) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: dto.formationId },
  });
  if (!formation) throw new AppError("Formation not found", 404);
  if (!formation.isActive) throw new AppError("Formation is inactive", 400);

  const examDate = new Date(dto.examDate);
  const resultsDeadline = new Date(examDate);
  resultsDeadline.setDate(resultsDeadline.getDate() + 5);

  return identityDb.competitionSession.create({
    data: {
      ...dto,
      examDate,
      resultsDeadline,
      coordinatorId,
      status: "DRAFT",
    },
    include: {
      formation: { select: { name: true, code: true } },
    },
  });
};

export const getSessions = async () => {
  return identityDb.competitionSession.findMany({
    include: {
      formation: { select: { name: true, code: true } },
      coordinator: { select: { firstName: true, lastName: true, email: true } },
      _count: { select: { candidates: true, subjects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getSessionById = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: {
      formation: { select: { name: true, code: true } },
      coordinator: { select: { firstName: true, lastName: true, email: true } },
      subjects: true,
      gradingConfig: true,
      _count: { select: { candidates: true } },
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

// ─── HELPER — reused in every subject/grading operation ──────────────────────
const getSessionOrThrow = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
  });
  if (!session) throw new AppError("Session not found", 404);
  return session;
};

const assertDraft = (status: string) => {
  if (status !== "DRAFT")
    throw new AppError(
      "Session can only be modified while in DRAFT status",
      403,
    );
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateSession = async (id: string, dto: UpdateSessionDto) => {
  const session = await getSessionOrThrow(id);
  assertDraft(session.status);

  // If examDate is being updated, recompute resultsDeadline
  const extra: Record<string, unknown> = {};
  if (dto.examDate) {
    const resultsDeadline = new Date(dto.examDate);
    resultsDeadline.setDate(resultsDeadline.getDate() + 5);
    extra.resultsDeadline = resultsDeadline;
  }

  return identityDb.competitionSession.update({
    where: { id },
    data: { ...dto, ...extra },
  });
};

// ─── GET SESSION STAFF ────────────────────────────────────────────────────────
export const getSessionStaff = async (sessionId: string) => {
  const session = await getSessionOrThrow(sessionId);

  return identityDb.formationStaff.findMany({
    where: { formationId: session.formationId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
export const getSubjects = async (sessionId: string) => {
  await getSessionOrThrow(sessionId); // ensures 404 if session doesn't exist
  return identityDb.subject.findMany({ where: { sessionId } });
};

export const addSubject = async (sessionId: string, dto: CreateSubjectDto) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  return identityDb.subject.create({
    data: { ...dto, sessionId },
  });
};

export const updateSubject = async (
  sessionId: string,
  subjectId: string,
  dto: UpdateSubjectDto,
) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  // Always scope by BOTH sessionId and subjectId — prevents cross-session tampering
  const subject = await identityDb.subject.findFirst({
    where: { id: subjectId, sessionId },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  return identityDb.subject.update({ where: { id: subjectId }, data: dto });
};

export const deleteSubject = async (sessionId: string, subjectId: string) => {
  const session = await getSessionOrThrow(sessionId);
  assertDraft(session.status);

  const subject = await identityDb.subject.findFirst({
    where: { id: subjectId, sessionId },
  });
  if (!subject) throw new AppError("Subject not found", 404);

  await identityDb.subject.delete({ where: { id: subjectId } });
};

// ─── GRADING CONFIG ───────────────────────────────────────────────────────────
export const getGradingConfig = async (sessionId: string) => {
  await getSessionOrThrow(sessionId);

  const config = await identityDb.gradingConfig.findUnique({
    where: { sessionId },
  });

  // Return default shape if not configured yet — never 404
  if (!config) {
    return { discrepancyThreshold: 3, isDefault: true, sessionId };
  }

  return { ...config, isDefault: false };
};

export const setGradingConfig = async (
  sessionId: string,
  dto: SetGradingConfigDto,
  configuredBy: string,
) => {
  const session = await getSessionOrThrow(sessionId);

  // FIX: Added assertDraft to prevent setting grading config on locked/closed sessions (Issue 3)
  assertDraft(session.status);

  return identityDb.gradingConfig.upsert({
    where: { sessionId },
    update: {
      discrepancyThreshold: dto.discrepancyThreshold,
      configuredBy,
      configuredAt: new Date(),
    },
    create: {
      sessionId,
      discrepancyThreshold: dto.discrepancyThreshold,
      configuredBy,
    },
  });
};

export const openSession = async (id: string) => {
  const session = await identityDb.competitionSession.findUnique({
    where: { id },
    include: {
      subjects: true,
      gradingConfig: true,
      _count: { select: { candidates: true } },
    },
  });
  if (!session) throw new AppError("Session not found", 404);
  if (session.status !== "DRAFT")
    throw new AppError("Only DRAFT sessions can be opened", 403);

  if (session.subjects.length === 0)
    throw new AppError("Cannot open session: no subjects defined", 400);

  if (!session.gradingConfig)
    throw new AppError("Cannot open session: grading config not set", 400);

  if (session._count.candidates === 0)
    throw new AppError("Cannot open session: no candidates imported", 400);

  return identityDb.competitionSession.update({
    where: { id },
    data: { status: "OPEN" },
  });
};