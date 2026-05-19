/*
  Warnings:

  - You are about to drop the column `availableSlots` on the `competition_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `coordinatorId` on the `competition_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `room_candidate_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `room_surveillant_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `auditor_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coordinator_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `corrector_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formation_staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jury_member_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surveillant_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionId,roomId,specializationId]` on the table `session_rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coordinatorId` to the `doctoral_formations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specializationId` to the `session_rooms` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'STAFF', 'PENDING');

-- CreateEnum
CREATE TYPE "SessionFunction" AS ENUM ('COORDINATOR', 'CORRECTOR', 'JURY_MEMBER', 'SURVEILLANT', 'AUDITOR');

-- DropForeignKey
ALTER TABLE "auditor_profiles" DROP CONSTRAINT "auditor_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "competition_sessions" DROP CONSTRAINT "competition_sessions_coordinatorId_fkey";

-- DropForeignKey
ALTER TABLE "coordinator_profiles" DROP CONSTRAINT "coordinator_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "corrector_profiles" DROP CONSTRAINT "corrector_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "formation_staff" DROP CONSTRAINT "formation_staff_formationId_fkey";

-- DropForeignKey
ALTER TABLE "formation_staff" DROP CONSTRAINT "formation_staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "jury_member_profiles" DROP CONSTRAINT "jury_member_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "room_candidate_assignments" DROP CONSTRAINT "room_candidate_assignments_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "room_surveillant_assignments" DROP CONSTRAINT "room_surveillant_assignments_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "session_rooms" DROP CONSTRAINT "session_rooms_roomId_fkey";

-- DropForeignKey
ALTER TABLE "surveillant_profiles" DROP CONSTRAINT "surveillant_profiles_userId_fkey";

-- DropIndex
DROP INDEX "session_rooms_sessionId_roomId_key";

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "specializationId" TEXT;

-- AlterTable
ALTER TABLE "competition_sessions" DROP COLUMN "availableSlots",
DROP COLUMN "coordinatorId";

-- AlterTable
ALTER TABLE "doctoral_formations" ADD COLUMN     "coordinatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "room_candidate_assignments" DROP COLUMN "sessionId";

-- AlterTable
ALTER TABLE "room_surveillant_assignments" DROP COLUMN "sessionId";

-- AlterTable
ALTER TABLE "session_rooms" ADD COLUMN     "specializationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "academicGrade" TEXT,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "systemRole" "SystemRole" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "auditor_profiles";

-- DropTable
DROP TABLE "coordinator_profiles";

-- DropTable
DROP TABLE "corrector_profiles";

-- DropTable
DROP TABLE "formation_staff";

-- DropTable
DROP TABLE "jury_member_profiles";

-- DropTable
DROP TABLE "surveillant_profiles";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "formation_specializations" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "formation_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_specializations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "formationSpecializationId" TEXT NOT NULL,
    "availableSlots" INTEGER NOT NULL,

    CONSTRAINT "session_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_staff" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "function" "SessionFunction" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "session_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompetitionSessionToRoomCandidateAssignment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetitionSessionToRoomCandidateAssignment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompetitionSessionToRoomSurveillantAssignment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetitionSessionToRoomSurveillantAssignment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "formation_specializations_formationId_code_key" ON "formation_specializations"("formationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "session_specializations_sessionId_formationSpecializationId_key" ON "session_specializations"("sessionId", "formationSpecializationId");

-- CreateIndex
CREATE UNIQUE INDEX "session_staff_sessionId_userId_function_key" ON "session_staff"("sessionId", "userId", "function");

-- CreateIndex
CREATE INDEX "_CompetitionSessionToRoomCandidateAssignment_B_index" ON "_CompetitionSessionToRoomCandidateAssignment"("B");

-- CreateIndex
CREATE INDEX "_CompetitionSessionToRoomSurveillantAssignment_B_index" ON "_CompetitionSessionToRoomSurveillantAssignment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "session_rooms_sessionId_roomId_specializationId_key" ON "session_rooms"("sessionId", "roomId", "specializationId");

-- AddForeignKey
ALTER TABLE "doctoral_formations" ADD CONSTRAINT "doctoral_formations_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_specializations" ADD CONSTRAINT "formation_specializations_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "doctoral_formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_specializations" ADD CONSTRAINT "session_specializations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_specializations" ADD CONSTRAINT "session_specializations_formationSpecializationId_fkey" FOREIGN KEY ("formationSpecializationId") REFERENCES "formation_specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_staff" ADD CONSTRAINT "session_staff_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_staff" ADD CONSTRAINT "session_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "session_specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "exam_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "session_specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionSessionToRoomCandidateAssignment" ADD CONSTRAINT "_CompetitionSessionToRoomCandidateAssignment_A_fkey" FOREIGN KEY ("A") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionSessionToRoomCandidateAssignment" ADD CONSTRAINT "_CompetitionSessionToRoomCandidateAssignment_B_fkey" FOREIGN KEY ("B") REFERENCES "room_candidate_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionSessionToRoomSurveillantAssignment" ADD CONSTRAINT "_CompetitionSessionToRoomSurveillantAssignment_A_fkey" FOREIGN KEY ("A") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionSessionToRoomSurveillantAssignment" ADD CONSTRAINT "_CompetitionSessionToRoomSurveillantAssignment_B_fkey" FOREIGN KEY ("B") REFERENCES "room_surveillant_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
