/*
  Warnings:

  - The `function` column on the `session_staff` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `systemRole` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COORDINATOR', 'SURVEILLANT', 'CORRECTOR', 'JURY_MEMBER', 'AUDITOR', 'NOT_ASSIGNED');

-- AlterTable
ALTER TABLE "session_staff" DROP COLUMN "function",
ADD COLUMN     "function" "Role";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "systemRole",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'NOT_ASSIGNED';

-- DropEnum
DROP TYPE "SessionFunction";

-- DropEnum
DROP TYPE "SystemRole";

-- CreateIndex
CREATE UNIQUE INDEX "session_staff_sessionId_userId_function_key" ON "session_staff"("sessionId", "userId", "function");
