/*
  Warnings:

  - You are about to drop the column `candidateId` on the `exam_copies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[copyId,round]` on the table `correction_grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[copyId,correctorId]` on the table `correction_grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[anonymousCode]` on the table `exam_copies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `correction_grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `correction_grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `final_grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `final_grades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CopyStatus" ADD VALUE 'ASSIGNED';

-- DropIndex
DROP INDEX "correction_grades_copyId_correctorId_round_key";

-- AlterTable
ALTER TABLE "correction_grades" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "exam_copies" DROP COLUMN "candidateId";

-- AlterTable
ALTER TABLE "final_grades" ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "specializationId" TEXT,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "corrector_assignments" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "correctorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrector_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_drafts" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "correctorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "corrector_assignments_copyId_correctorId_key" ON "corrector_assignments"("copyId", "correctorId");

-- CreateIndex
CREATE UNIQUE INDEX "corrector_assignments_copyId_round_key" ON "corrector_assignments"("copyId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "grade_drafts_copyId_correctorId_key" ON "grade_drafts"("copyId", "correctorId");

-- CreateIndex
CREATE UNIQUE INDEX "correction_grades_copyId_round_key" ON "correction_grades"("copyId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "correction_grades_copyId_correctorId_key" ON "correction_grades"("copyId", "correctorId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_copies_anonymousCode_key" ON "exam_copies"("anonymousCode");

-- AddForeignKey
ALTER TABLE "corrector_assignments" ADD CONSTRAINT "corrector_assignments_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "exam_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_drafts" ADD CONSTRAINT "grade_drafts_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "exam_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
