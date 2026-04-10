import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateFormationDto,
  UpdateFormationDto,
  AssignStaffDto,
} from "./formations.types.js";
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

// ─── LIST ─────────────────────────────────────────────────────────────────────
export const listFormations = async () => {
  return identityDb.doctoralFormation.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const updateFormation = async (id: string, dto: UpdateFormationDto) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id },
  });
  if (!formation) throw new AppError("Formation not found", 404);

  return identityDb.doctoralFormation.update({
    where: { id },
    data: dto,
  });
};

export const getFormationStaff = async (formationId: string) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: formationId },
  });
  if (!formation) throw new AppError("Formation not found", 404);

  return identityDb.formationStaff.findMany({
    where: { formationId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });
};

export const assignStaff = async (
  formationId: string,
  dto: AssignStaffDto,
  assignedBy: string,
) => {
  // 1. Formation must exist and be active
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: formationId },
  });
  if (!formation) throw new AppError("Formation not found", 404);
  if (!formation.isActive)
    throw new AppError("Cannot assign staff to an inactive formation", 400);

  // 2. User must exist and be active
  const user = await identityDb.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("Cannot assign an inactive user", 400);

  // 3. System role must match the formation role being assigned
  if (user.role !== dto.role) {
    throw new AppError(
      `Role mismatch: user is ${user.role} but you are trying to assign them as ${dto.role}`,
      400,
    );
  }

  // 4. Check for duplicate (same user, same formation, same role)
  const existing = await identityDb.formationStaff.findUnique({
    where: {
      formationId_userId_role: {
        formationId,
        userId: dto.userId,
        role: dto.role,
      },
    },
  });
  if (existing)
    throw new AppError(
      "User is already assigned to this formation with this role",
      409,
    );

  return identityDb.formationStaff.create({
    data: { formationId, userId: dto.userId, role: dto.role, assignedBy },
  });
};

// ─── REMOVE STAFF ─────────────────────────────────────────────────────────────
export const removeStaff = async (formationId: string, userId: string) => {
  // findFirst because a user could theoretically have multiple roles in a formation
  // but the route only passes userId — so we delete the first match
  // If you want role-specific removal, add role to the route params
  const record = await identityDb.formationStaff.findFirst({
    where: { formationId, userId },
  });
  if (!record) throw new AppError("Staff assignment not found", 404);

  await identityDb.formationStaff.delete({ where: { id: record.id } });
};