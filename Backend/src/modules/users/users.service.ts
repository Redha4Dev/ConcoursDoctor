import bcrypt from "bcrypt";
import crypto from "crypto";
import { identityDb } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { sendEmail } from "../../utils/mailer.js";
import { tempPasswordTemplate } from "../../utils/emailTemplates.js";
import type { CreateUserDto, UpdateUserDto } from "./users.types.js";
import type { Role } from "../../generated/identity/client.js";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const generateTempPassword = (): string =>
  crypto.randomBytes(8).toString("hex");

const buildFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`;

const buildProfileCreate = (role: Role, dto: CreateUserDto) => {
  switch (role) {
    case "COORDINATOR":
      return {
        coordinatorProfile: {
          create: {
            department:  dto.department  ?? null,
            phoneNumber: dto.phoneNumber ?? null,
          },
        },
      };
    case "SURVEILLANT":
      return {
        surveillantProfile: {
          create: {
            phoneNumber: dto.phoneNumber ?? null,
          },
        },
      };
    case "CORRECTOR":
      return {
        correctorProfile: {
          create: {
            specialization: dto.specialization ?? null,
            academicGrade:  dto.academicGrade  ?? null,
            institution:    dto.institution    ?? null,
          },
        },
      };
    case "JURY_MEMBER":
      return {
        juryMemberProfile: {
          create: {
            academicRank: dto.academicRank ?? null,
            institution:  dto.institution  ?? null,
          },
        },
      };
    case "AUDITOR":
      return {
        auditorProfile: {
          create: {
            scope: dto.scope ?? null,
          },
        },
      };
    default:
      return {};
  }
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
      firstName:          dto.firstName,
      lastName:           dto.lastName,
      email:              dto.email,
      passwordHash,
      role:               dto.role,
      createdBy,
      mustChangePassword: true,
      ...buildProfileCreate(dto.role, dto),
    },
    select: {
      id:                 true,
      firstName:          true,
      lastName:           true,
      email:              true,
      role:               true,
      isActive:           true,
      mustChangePassword: true,
      createdAt:          true,
      coordinatorProfile: true,
      surveillantProfile: true,
      correctorProfile:   true,
      juryMemberProfile:  true,
      auditorProfile:     true,
    },
  });

  // send welcome email — fire and forget, never blocks user creation
  const fullName = buildFullName(dto.firstName, dto.lastName);
  const { subject, html } = tempPasswordTemplate(
    fullName,
    dto.email,
    tempPassword,
    dto.role,
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
  role?:   string;
  page?:   number;
  limit?:  number;
}) => {
  const { search, role, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  // FIX: reject ADMIN filter early — cleaner than letting Prisma handle it
  if (role && role === "ADMIN") {
    throw new AppError("Cannot filter by ADMIN role", 400);
  }

  // FIX: build role filter correctly — Prisma v7 doesn't support
  // both `not` and `equals` on the same field simultaneously
  const roleFilter: { equals?: Role; notIn?: Role[] } = role
    ? { equals: role as Role, notIn: ["ADMIN"] }
    : { notIn: ["ADMIN"] };

  const where = {
    role: roleFilter,
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName:  { contains: search, mode: "insensitive" as const } },
            { email:     { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    identityDb.user.findMany({
      where,
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        email:     true,
        role:      true,
        isActive:  true,
        lastLogin: true,
        createdAt: true,
        correctorProfile:   { select: { specialization: true, isAvailable: true } },
        juryMemberProfile:  { select: { academicRank: true, institution: true } },
        coordinatorProfile: { select: { department: true } },
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
      hasNext:    page * limit < total,
      hasPrev:    page > 1,
    },
  };
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getUserById = async (id: string) => {
  const user = await identityDb.user.findUnique({
    where: { id },
    select: {
      id:                 true,
      firstName:          true,
      lastName:           true,
      email:              true,
      role:               true,
      isActive:           true,
      mustChangePassword: true,
      lastLogin:          true,
      createdAt:          true,
      updatedAt:          true,
      coordinatorProfile: true,
      surveillantProfile: true,
      correctorProfile:   true,
      juryMemberProfile:  true,
      auditorProfile:     true,
      formationStaff: {
        include: {
          formation: { select: { id: true, name: true, code: true } },
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

  // FIX: build profile update only if there are fields to update
  // An empty `update: {}` causes Prisma to throw
  const buildProfileUpdate = () => {
    switch (user.role) {
      case "COORDINATOR": {
        const data: Record<string, unknown> = {};
        if (dto.department  !== undefined) data.department  = dto.department;
        if (dto.phoneNumber !== undefined) data.phoneNumber = dto.phoneNumber;
        if (Object.keys(data).length === 0) return {};
        return { coordinatorProfile: { update: data } };
      }

      case "SURVEILLANT": {
        const data: Record<string, unknown> = {};
        if (dto.phoneNumber !== undefined) data.phoneNumber = dto.phoneNumber;
        if (Object.keys(data).length === 0) return {};
        return { surveillantProfile: { update: data } };
      }

      case "CORRECTOR": {
        const data: Record<string, unknown> = {};
        if (dto.specialization !== undefined) data.specialization = dto.specialization;
        if (dto.academicGrade  !== undefined) data.academicGrade  = dto.academicGrade;
        if (dto.institution    !== undefined) data.institution    = dto.institution;
        if (dto.isAvailable    !== undefined) data.isAvailable    = dto.isAvailable;
        if (Object.keys(data).length === 0) return {};
        return { correctorProfile: { update: data } };
      }

      case "JURY_MEMBER": {
        const data: Record<string, unknown> = {};
        if (dto.academicRank !== undefined) data.academicRank = dto.academicRank;
        if (dto.institution  !== undefined) data.institution  = dto.institution;
        if (Object.keys(data).length === 0) return {};
        return { juryMemberProfile: { update: data } };
      }

      case "AUDITOR": {
        const data: Record<string, unknown> = {};
        if (dto.scope !== undefined) data.scope = dto.scope;
        if (Object.keys(data).length === 0) return {};
        return { auditorProfile: { update: data } };
      }

      default:
        return {};
    }
  };

  // FIX: build base data first, only include name fields if passed
  const baseData: Record<string, unknown> = {};
  if (dto.firstName !== undefined) baseData.firstName = dto.firstName;
  if (dto.lastName  !== undefined) baseData.lastName  = dto.lastName;

  const profileUpdate = buildProfileUpdate();

  // FIX: if nothing at all was passed, throw instead of running empty update
  if (Object.keys(baseData).length === 0 && Object.keys(profileUpdate).length === 0) {
    throw new AppError("No fields provided for update", 400);
  }

  return identityDb.user.update({
    where: { id },
    data:  { ...baseData, ...profileUpdate },
    select: {
      id:                 true,
      firstName:          true,
      lastName:           true,
      email:              true,
      role:               true,
      isActive:           true,
      coordinatorProfile: true,
      surveillantProfile: true,
      correctorProfile:   true,
      juryMemberProfile:  true,
      auditorProfile:     true,
    },
  });
};

// ─── DEACTIVATE / REACTIVATE ──────────────────────────────────────────────────

export const deactivateUser = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user)            throw new AppError("User not found", 404);
  if (user.role === "ADMIN") throw new AppError("Cannot deactivate admin account", 403);
  if (!user.isActive)   throw new AppError("User is already inactive", 400);

  return identityDb.user.update({
    where: { id },
    data:  { isActive: false },
    select: { id: true, firstName: true, lastName: true, isActive: true, role: true },
  });
};

export const reactivateUser = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user)          throw new AppError("User not found", 404);
  if (user.isActive)  throw new AppError("User is already active", 400);

  return identityDb.user.update({
    where: { id },
    data:  { isActive: true },
    select: { id: true, firstName: true, lastName: true, isActive: true, role: true },
  });
};

// ─── RESEND EMAIL ─────────────────────────────────────────────────────────────

export const resendWelcomeEmail = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  // reset password first — always, even if email fails
  await identityDb.user.update({
    where: { id },
    data:  { passwordHash, mustChangePassword: true },
  });

  const fullName = buildFullName(user.firstName, user.lastName);
  const { subject, html } = tempPasswordTemplate(
    fullName,
    user.email,
    tempPassword,
    user.role,
  );

  // FIX: return emailSent status so controller can include it in response
  let emailSent = false;
  try {
    await sendEmail({ emailto: user.email, subject, html });
    emailSent = true;
  } catch (err: unknown) {
    console.error(
      `[Email] Failed to resend welcome email to ${user.email}:`,
      err instanceof Error ? err.message : err,
    );
  }

  return {
    message:   emailSent
      ? "Welcome email resent successfully"
      : "Password reset but email delivery failed — check SMTP config",
    email:     user.email,
    emailSent,
  };
};