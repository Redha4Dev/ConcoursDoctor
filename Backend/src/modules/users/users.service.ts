// src/modules/users/users.service.ts
import bcrypt from "bcrypt";
import crypto from "crypto";
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { sendEmail } from "../../utils/mailer.js";
import { tempPasswordTemplate } from "../../utils/emailTemplates.js";
import type { CreateUserDto, UpdateUserDto } from "./users.types.js";
import type { Prisma, Role } from "../../generated/identity/client.js";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const generateTempPassword = (): string =>
  crypto.randomBytes(8).toString("hex");

const GLOBAL_ROLES: readonly Role[] = ["ADMIN", "COORDINATOR", "STAFF"];

const parseGlobalRoleFilter = (role?: string): Role | undefined => {
  if (!role) return undefined;
  if (GLOBAL_ROLES.includes(role as Role)) return role as Role;
  throw new AppError(
    `Invalid role filter. Expected one of: ${GLOBAL_ROLES.join(", ")}`,
    400,
  );
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createUser = async (dto: CreateUserDto, createdBy: string) => {
  const existing = await identityDb.user.findUnique({
    where: { email: dto.email },
  });
  if (existing) throw new AppError("Email already in use", 409);

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await identityDb.user.create({
    data: {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: "STAFF",
      createdBy,
      mustChangePassword: true,
      phoneNumber: dto.phoneNumber ?? null,
      institution: dto.institution ?? null,
      academicGrade: dto.academicGrade ?? null,
      specialization: dto.specialization ?? null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
      phoneNumber: true,
      institution: true,
      academicGrade: true,
      specialization: true,
    },
  });

  // send welcome email — fire and forget
  const { subject, html } = tempPasswordTemplate(
    `${dto.firstName} ${dto.lastName}`,
    dto.email,
    tempPassword,
    user.role,
  );

  let emailSent = false;
  try {
    await sendEmail({ emailto: dto.email, subject, html });
    emailSent = true;
  } catch (err: unknown) {
    console.error(
      `[Email] Failed to send welcome email to ${dto.email}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return { user, emailSent };
};

// ─── LIST ─────────────────────────────────────────────────────────────────────

export const getUsers = async (filters: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, role, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;
  const roleFilter = parseGlobalRoleFilter(role);

  const where: Prisma.UserWhereInput = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { institution: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    identityDb.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        institution: true,
        academicGrade: true,
        specialization: true,
        // show what sessions this user is assigned to
        sessionStaff: {
          select: {
            function: true,
            session: {
              select: {
                id: true,
                label: true,
                academicYear: true,
                formation: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    identityDb.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getUserById = async (id: string) => {
  const user = await identityDb.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      institution: true,
      academicGrade: true,
      specialization: true,
      phoneNumber: true,
      sessionStaff: {
        include: {
          session: {
            select: {
              id: true,
              label: true,
              academicYear: true,
              status: true,
              formation: { select: { name: true, code: true } },
            },
          },
        },
      },
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateUser = async (id: string, dto: UpdateUserDto) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const data: Record<string, unknown> = {};
  if (dto.firstName !== undefined) data.firstName = dto.firstName;
  if (dto.lastName !== undefined) data.lastName = dto.lastName;
  if (dto.phoneNumber !== undefined) data.phoneNumber = dto.phoneNumber;
  if (dto.institution !== undefined) data.institution = dto.institution;
  if (dto.academicGrade !== undefined) data.academicGrade = dto.academicGrade;
  if (dto.specialization !== undefined)
    data.specialization = dto.specialization;
  // If dto.role is provided, add it to data here if you allow role updates

  if (Object.keys(data).length === 0) {
    throw new AppError("No fields provided for update", 400);
  }

  return identityDb.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      institution: true,
      academicGrade: true,
      specialization: true,
      phoneNumber: true,
    },
  });
};

// ─── DELETE (smart — hard if no refs, soft if has refs) ──────────────────────

export const deleteUser = async (id: string) => {
  const user = await identityDb.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          auditLogs: true,
          sessionStaff: true,
          coordinatedFormations: true,
          importBatches: true,
          surveillantRoomAssignments: true, // This correctly matches schema
        },
      },
    },
  });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "ADMIN") {
    throw new AppError("Cannot delete admin account", 403);
  }

  const totalRefs =
    user._count.auditLogs +
    user._count.sessionStaff +
    user._count.coordinatedFormations +
    user._count.importBatches +
    user._count.surveillantRoomAssignments;

  if (totalRefs > 0) {
    // has references — soft delete
    if (!user.isActive) throw new AppError("User is already inactive", 400);
    const updated = await identityDb.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    return { ...updated, permanent: false };
  }

  // no references — hard delete
  await identityDb.user.delete({ where: { id } });
  return {
    id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permanent: true,
  };
};

// ─── REACTIVATE ───────────────────────────────────────────────────────────────

export const reactivateUser = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  if (user.isActive) throw new AppError("User is already active", 400);

  return identityDb.user.update({
    where: { id },
    data: { isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
};

// ─── RESEND WELCOME EMAIL ─────────────────────────────────────────────────────

export const resendWelcomeEmail = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await identityDb.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true },
  });

  const { subject, html } = tempPasswordTemplate(
    `${user.firstName} ${user.lastName}`,
    user.email,
    tempPassword,
    user.role,
  );

  let emailSent = false;
  try {
    await sendEmail({ emailto: user.email, subject, html });
    emailSent = true;
  } catch (err: unknown) {
    console.error(
      `[Email] Failed to resend email to ${user.email}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return {
    message: emailSent
      ? "Welcome email resent successfully"
      : "Password reset but email delivery failed — check SMTP config",
    email: user.email,
    emailSent,
  };
};
