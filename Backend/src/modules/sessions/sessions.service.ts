import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateSessionDto } from "./sessions.types.js";

export const createSession = async (
  dto: CreateSessionDto,
  coordinatorId: string,
) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: dto.formationId },
  });
  if (!formation) throw new AppError("Formation not found", 404);

  return identityDb.competitionSession.create({
    data: {
      ...dto,
      examDate: new Date(dto.examDate),
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
