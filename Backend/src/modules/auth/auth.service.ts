import bcrypt from "bcrypt";
import { identityDb } from "../../config/db.js";
import { signToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";
import type { LoginDTO, ChangePasswordDTO } from "./auth.types.js";
import crypto from "crypto";
import { sendEmail } from "../../utils/mailer.js";
import { resetPasswordTemplate } from "../../utils/emailTemplates.js";
import type { ForgotPasswordDto, ResetPasswordDto } from "./auth.types.js";

export const loginUser = async (dto: LoginDTO) => {
  const user = await identityDb.user.findUnique({
    where: { email: dto.email },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // FIX: Wrapped in a non-blocking catch to prevent login failure if DB write fails (Issue 4)
  identityDb.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  }).catch(() => {});

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
};

export const getMe = async (userId: string) => {
  const user = await identityDb.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      mustChangePassword: true,
      lastLogin: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const changeUserPassword = async (
  userId: string,
  dto: ChangePasswordDTO,
) => {
  const user = await identityDb.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new AppError("User not found", 404);

  // FIX: Added check to ensure new password is not the same as the old one (Missing Best Practices)
  if (dto.newPassword === dto.oldPassword) {
    throw new AppError("New password must be different from current password", 400);
  }

  const isValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
  if (!isValid) throw new AppError("Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(dto.newPassword, 12);

  await identityDb.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });

  return { message: "Password updated successfully" };
};

export const forgotPassword = async (dto: ForgotPasswordDto) => {
  const user = await identityDb.user.findUnique({
    where: { email: dto.email },
  });

  // FIX: Merged guards into a single check before doing anything else (Issue 2)
  if (!user || !user.isActive) return;

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await identityDb.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/?token=${rawToken}`;
  const { subject, html } = resetPasswordTemplate(
    user.firstName,
    user.lastName,
    resetUrl,
  );

  try {
    // FIX: Removed console.log statements to prevent PII/existence leaks (Issue 1)
    await sendEmail({ emailto: user.email, subject, html });
  } catch (err) {
    await identityDb.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    console.error("[Email] Forgot password failed", err);
    throw new AppError("Failed to send reset email. Try again later.", 500);
  }
};

export const resetPassword = async (dto: ResetPasswordDto) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(dto.token)
    .digest("hex");

  const user = await identityDb.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, 12);

  await identityDb.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
};