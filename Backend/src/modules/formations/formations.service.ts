import { identityDb } from "../../config/db.js";
import type { Role } from "../../generated/identity/client.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateFormationDto,
  UpdateFormationDto,
  AssignStaffDto,
} from "./formations.types.js";

import { formationAssignmentTemplate } from "../../utils/emailTemplates.js";
import { sendEmail } from "../../utils/mailer.js";




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
          academicYear: true,
          _count: { select: { candidates: true } },
        },
      },
      staff: {
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
      },
      _count: {
        select: { sessions: true, staff: true },
      },
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

const fullName = user.firstName+ " " +user.lastName;

const { subject, html } = formationAssignmentTemplate(
  fullName,
  formation.name,
  user.role,
);

  try {
    await sendEmail({ emailto: user.email, subject, html });
  } catch (err: unknown) {
    console.error(
      `[Email] Failed to resend welcome email to ${user.email}:`,
      err instanceof Error ? err.message : err,
    );
  }


  return identityDb.formationStaff.create({
    data: { formationId, userId: dto.userId, role: dto.role, assignedBy },
  });
};

export const removeStaff = async (
  formationId: string,
  userId: string,
  role: Role,
) => {
  // FIX: Require `role` and scope the delete using the unique compound constraint (Issue 1)
  const record = await identityDb.formationStaff.findUnique({
    where: {
      formationId_userId_role: { formationId, userId, role },
    },
  })

  if (!record) throw new AppError("Staff assignment not found", 404);

  await identityDb.formationStaff.delete({ where: { id: record.id } });

  // FIX: Return the record ID so the controller can log the correct entityId in the audit trail (Issue 2)
  return { id: record.id };
};
