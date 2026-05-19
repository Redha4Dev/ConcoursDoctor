/*
  Warnings:

  - You are about to drop the `_CompetitionSessionToRoomCandidateAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CompetitionSessionToRoomSurveillantAssignment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionId,roomId]` on the table `session_rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `room_candidate_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `room_surveillant_assignments` table without a default value. This is not possible if the table is not empty.
  - Made the column `function` on table `session_staff` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_CompetitionSessionToRoomCandidateAssignment" DROP CONSTRAINT "_CompetitionSessionToRoomCandidateAssignment_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompetitionSessionToRoomCandidateAssignment" DROP CONSTRAINT "_CompetitionSessionToRoomCandidateAssignment_B_fkey";

-- DropForeignKey
ALTER TABLE "_CompetitionSessionToRoomSurveillantAssignment" DROP CONSTRAINT "_CompetitionSessionToRoomSurveillantAssignment_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompetitionSessionToRoomSurveillantAssignment" DROP CONSTRAINT "_CompetitionSessionToRoomSurveillantAssignment_B_fkey";

-- DropIndex
DROP INDEX "session_rooms_sessionId_roomId_specializationId_key";

-- AlterTable
ALTER TABLE "room_candidate_assignments" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "room_surveillant_assignments" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session_staff" ALTER COLUMN "function" SET NOT NULL;

-- DropTable
DROP TABLE "_CompetitionSessionToRoomCandidateAssignment";

-- DropTable
DROP TABLE "_CompetitionSessionToRoomSurveillantAssignment";

-- CreateIndex
CREATE UNIQUE INDEX "session_rooms_sessionId_roomId_key" ON "session_rooms"("sessionId", "roomId");

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
