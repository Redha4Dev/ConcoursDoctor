/*
  Warnings:

  - You are about to drop the column `sessionId` on the `exam_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `room_candidate_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `room_surveillant_assignments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionRoomId,userId]` on the table `room_surveillant_assignments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `exam_rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionRoomId` to the `room_candidate_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionRoomId` to the `room_surveillant_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "exam_rooms" DROP CONSTRAINT "exam_rooms_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "room_candidate_assignments" DROP CONSTRAINT "room_candidate_assignments_roomId_fkey";

-- DropForeignKey
ALTER TABLE "room_surveillant_assignments" DROP CONSTRAINT "room_surveillant_assignments_roomId_fkey";

-- DropIndex
DROP INDEX "room_surveillant_assignments_roomId_userId_key";

-- AlterTable
ALTER TABLE "exam_rooms" DROP COLUMN "sessionId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "room_candidate_assignments" DROP COLUMN "roomId",
ADD COLUMN     "sessionRoomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "room_surveillant_assignments" DROP COLUMN "roomId",
ADD COLUMN     "sessionRoomId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "session_rooms" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "usedCapacity" INTEGER NOT NULL DEFAULT 0,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,

    CONSTRAINT "session_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_rooms_sessionId_roomId_key" ON "session_rooms"("sessionId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "room_surveillant_assignments_sessionRoomId_userId_key" ON "room_surveillant_assignments"("sessionRoomId", "userId");

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "exam_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_sessionRoomId_fkey" FOREIGN KEY ("sessionRoomId") REFERENCES "session_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_sessionRoomId_fkey" FOREIGN KEY ("sessionRoomId") REFERENCES "session_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
