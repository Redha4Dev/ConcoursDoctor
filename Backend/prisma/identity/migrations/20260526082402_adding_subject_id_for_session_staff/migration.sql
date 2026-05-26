/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,userId,function,subjectId]` on the table `session_staff` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "session_staff_sessionId_userId_function_key";

-- AlterTable
ALTER TABLE "session_staff" ADD COLUMN     "subjectId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "session_staff_sessionId_userId_function_subjectId_key" ON "session_staff"("sessionId", "userId", "function", "subjectId");

-- AddForeignKey
ALTER TABLE "session_staff" ADD CONSTRAINT "session_staff_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
