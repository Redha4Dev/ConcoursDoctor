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
            department: dto.department ?? null,
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
            academicGrade: dto.academicGrade ?? null,
            institution: dto.institution ?? null,
          },
        },
      };
    case "JURY_MEMBER":
      return {
        juryMemberProfile: {
          create: {
            academicRank: dto.academicRank ?? null,
            institution: dto.institution ?? null,
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

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

export const createUser = async (dto: CreateUserDto, createdBy: string) => {
  // check email uniqueness
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
      role: dto.role,
      createdBy,
      mustChangePassword: true,
      ...buildProfileCreate(dto.role, dto),
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
      coordinatorProfile: true,
      surveillantProfile: true,
      correctorProfile: true,
      juryMemberProfile: true,
      auditorProfile: true,
    },
  });

  // send welcome email — fire and forget
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
  } catch (err: any) {
    console.error(`[Email] Failed to send welcome email to ${dto.email}:`, err);
  }

  return { user, tempPassword, emailSent };
};

export const getUsers = async (filters: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, role, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    role: {
      not: "ADMIN" as Role,
      ...(role ? { equals: role as Role } : {}),
    },
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
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
        correctorProfile: {
          select: { specialization: true, isAvailable: true },
        },
        juryMemberProfile: {
          select: { academicRank: true, institution: true },
        },
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
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

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
      coordinatorProfile: true,
      surveillantProfile: true,
      correctorProfile: true,
      juryMemberProfile: true,
      auditorProfile: true,
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

export const updateUser = async (id: string, dto: UpdateUserDto) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const buildProfileUpdate = () => {
    switch (user.role) {
      case "COORDINATOR":
        return {
          coordinatorProfile: {
            update: {
              ...(dto.department !== undefined && {
                department: dto.department,
              }),
              ...(dto.phoneNumber !== undefined && {
                phoneNumber: dto.phoneNumber,
              }),
            },
          },
        };
      case "SURVEILLANT":
        return {
          surveillantProfile: {
            update: {
              ...(dto.phoneNumber !== undefined && {
                phoneNumber: dto.phoneNumber,
              }),
            },
          },
        };
      case "CORRECTOR":
        return {
          correctorProfile: {
            update: {
              ...(dto.specialization !== undefined && {
                specialization: dto.specialization,
              }),
              ...(dto.academicGrade !== undefined && {
                academicGrade: dto.academicGrade,
              }),
              ...(dto.institution !== undefined && {
                institution: dto.institution,
              }),
              ...(dto.isAvailable !== undefined && {
                isAvailable: dto.isAvailable,
              }),
            },
          },
        };
      case "JURY_MEMBER":
        return {
          juryMemberProfile: {
            update: {
              ...(dto.academicRank !== undefined && {
                academicRank: dto.academicRank,
              }),
              ...(dto.institution !== undefined && {
                institution: dto.institution,
              }),
            },
          },
        };
      case "AUDITOR":
        return {
          auditorProfile: {
            update: {
              ...(dto.scope !== undefined && { scope: dto.scope }),
            },
          },
        };
      default:
        return {};
    }
  };

  return identityDb.user.update({
    where: { id },
    data: {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...buildProfileUpdate(),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      coordinatorProfile: true,
      surveillantProfile: true,
      correctorProfile: true,
      juryMemberProfile: true,
      auditorProfile: true,
    },
  });
};

export const deactivateUser = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "ADMIN")
    throw new AppError("Cannot deactivate admin account", 403);
  if (!user.isActive) throw new AppError("User is already inactive", 400);

  return identityDb.user.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, firstName: true, lastName: true, isActive: true },
  });
};

export const reactivateUser = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  if (user.isActive) throw new AppError("User is already active", 400);

  return identityDb.user.update({
    where: { id },
    data: { isActive: true },
    select: { id: true, firstName: true, lastName: true, isActive: true },
  });
};

export const resendWelcomeEmail = async (id: string) => {
  const user = await identityDb.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await identityDb.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true },
  });

  const fullName = buildFullName(user.firstName, user.lastName);
  const { subject, html } = tempPasswordTemplate(
    fullName,
    user.email,
    tempPassword,
    user.role,
  );

  await sendEmail({ emailto: user.email, subject, html });

  return { message: "Welcome email resent successfully" };
};
