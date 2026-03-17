import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateFormationDto } from "./formations.types.js";

export const createFormation = async (
  dto: CreateFormationDto,
  createdBy: string,
) => {
  const existing = await identityDb.doctoralFormation.findUnique({
    where: { code: dto.code },
  });
  if (existing) throw new AppError("Formation code already exists", 409);

  return identityDb.doctoralFormation.create({
    data: { ...dto, createdBy },
  });
};

export const getFormations = async () => {
  return identityDb.doctoralFormation.findMany({
    include: {
      _count: {
        select: { sessions: true, staff: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getFormationById = async (id: string) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id },
    include: {
      sessions: {
        select: {
          id: true,
          label: true,
          status: true,
          examDate: true,
          _count: { select: { candidates: true } },
        },
      },
      _count: {
        select: { sessions: true, staff: true },
      },
    },
  });
  if (!formation) throw new AppError("Formation not found", 404);
  return formation;
};
