// src/modules/formations/formations.service.ts
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateFormationDto,
  UpdateFormationDto,
  CreateSpecializationDto,
  UpdateSpecializationDto,
} from "./formations.types.js";

// ─── FORMATIONS ───────────────────────────────────────────────────────────────

export const createFormation = async (
  dto: CreateFormationDto,
  createdBy: string,
) => {
  const existing = await identityDb.doctoralFormation.findUnique({
    where: { code: dto.code },
  });
  if (existing) throw new AppError("Formation code already exists", 409);

  const coordinator = await identityDb.user.findUnique({
    where: { id: dto.coordinatorId },
  });
  if (!coordinator) throw new AppError("User not found", 404);
  if (!coordinator.isActive) throw new AppError("User is inactive", 400);

  // use a transaction — formation creation and role flip are atomic
  return identityDb.$transaction(async (tx) => {
    const formation = await tx.doctoralFormation.create({
      data: {
        name: dto.name,
        code: dto.code,
        department: dto.department,
        description: dto.description ?? null,
        coordinatorId: dto.coordinatorId,
        createdBy,
      },
      include: {
        coordinator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // flip user role to COORDINATOR if they were NOT_ASSIGNED
    // don't downgrade if they're already something higher
    if (coordinator.role === "NOT_ASSIGNED") {
      await tx.user.update({
        where: { id: dto.coordinatorId },
        data: { role: "COORDINATOR" },
      });
    }

    return formation;
  });
};

export const getFormations = async () => {
  return identityDb.doctoralFormation.findMany({
    include: {
      coordinator: { select: { id: true, firstName: true, lastName: true } },
      specializations: { where: { isActive: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getFormationById = async (id: string) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id },
    include: {
      coordinator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      specializations: true,
      sessions: {
        select: {
          id: true,
          label: true,
          status: true,
          academicYear: true,
          examDate: true,
          _count: { select: { candidates: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { sessions: true } },
    },
  });
  if (!formation) throw new AppError("Formation not found", 404);
  return formation;
};

export const updateFormation = async (id: string, dto: UpdateFormationDto) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id },
  });
  if (!formation) throw new AppError("Formation not found", 404);

  // if changing coordinator — validate new coordinator
  if (dto.coordinatorId) {
    const coordinator = await identityDb.user.findUnique({
      where: { id: dto.coordinatorId },
    });
    if (!coordinator) throw new AppError("Coordinator user not found", 404);
    if (!coordinator.isActive)
      throw new AppError("Coordinator is inactive", 400);
  }

  return identityDb.doctoralFormation.update({
    where: { id },
    data: dto,
    include: {
      coordinator: { select: { id: true, firstName: true, lastName: true } },
      specializations: true,
    },
  });
};

export const deleteFormation = async (id: string) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id },
    include: { _count: { select: { sessions: true } } },
  });
  if (!formation) throw new AppError("Formation not found", 404);

  if (formation._count.sessions > 0) {
    // has sessions — soft delete only
    if (!formation.isActive)
      throw new AppError("Formation is already inactive", 400);
    const updated = await identityDb.doctoralFormation.update({
      where: { id },
      data: { isActive: false },
    });
    return { ...updated, permanent: false };
  }

  // no sessions — hard delete (also deletes specializations via cascade)
  await identityDb.doctoralFormation.delete({ where: { id } });
  return { id, name: formation.name, permanent: true };
};

// ─── SPECIALIZATIONS ──────────────────────────────────────────────────────────

export const addSpecialization = async (
  formationId: string,
  dto: CreateSpecializationDto,
) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: formationId },
  });
  if (!formation) throw new AppError("Formation not found", 404);
  if (!formation.isActive) throw new AppError("Formation is inactive", 400);

  const existing = await identityDb.formationSpecialization.findUnique({
    where: { formationId_code: { formationId, code: dto.code } },
  });
  if (existing)
    throw new AppError(
      "Specialization code already exists in this formation",
      409,
    );

  return identityDb.formationSpecialization.create({
    data: { formationId, name: dto.name, code: dto.code },
  });
};

export const getSpecializations = async (formationId: string) => {
  const formation = await identityDb.doctoralFormation.findUnique({
    where: { id: formationId },
  });
  if (!formation) throw new AppError("Formation not found", 404);

  return identityDb.formationSpecialization.findMany({
    where: { formationId },
    orderBy: { name: "asc" },
  });
};

export const updateSpecialization = async (
  formationId: string,
  specializationId: string,
  dto: UpdateSpecializationDto,
) => {
  const spec = await identityDb.formationSpecialization.findFirst({
    where: { id: specializationId, formationId },
  });
  if (!spec) throw new AppError("Specialization not found", 404);

  return identityDb.formationSpecialization.update({
    where: { id: specializationId },
    data: dto,
  });
};

export const deleteSpecialization = async (
  formationId: string,
  specializationId: string,
) => {
  const spec = await identityDb.formationSpecialization.findFirst({
    where: { id: specializationId, formationId },
    include: { _count: { select: { sessionSpecializations: true } } },
  });
  if (!spec) throw new AppError("Specialization not found", 404);

  if (spec._count.sessionSpecializations > 0) {
    // used in sessions — deactivate only
    return identityDb.formationSpecialization.update({
      where: { id: specializationId },
      data: { isActive: false },
    });
  }

  await identityDb.formationSpecialization.delete({
    where: { id: specializationId },
  });
  return { id: specializationId, permanent: true };
};

export const getSpecializationById = async (
  formationId: string,
  specializationId: string,
) => {
  const spec = await identityDb.formationSpecialization.findFirst({
    where: { id: specializationId, formationId },
  });

  if (!spec) throw new AppError("Specialization not found", 404);

  return spec;
};
