/*
  Warnings:

  - A unique constraint covering the columns `[sessionRoomId,userId,subjectId]` on the table `room_surveillant_assignments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "room_surveillant_assignments_sessionRoomId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "room_surveillant_assignments_sessionRoomId_userId_subjectId_key" ON "room_surveillant_assignments"("sessionRoomId", "userId", "subjectId");

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
