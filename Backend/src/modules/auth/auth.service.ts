import bcrypt from "bcrypt";
import { identityDb } from "../../config/db.js";
import { signToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";
import type { LoginDTO, ChangePasswordDTO } from "./auth.types.js";

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

  await identityDb.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

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

  const isValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
  if (!isValid) throw new AppError("Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(dto.newPassword, 12);

  await identityDb.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });

  return { message: "Password updated successfully" };
};
