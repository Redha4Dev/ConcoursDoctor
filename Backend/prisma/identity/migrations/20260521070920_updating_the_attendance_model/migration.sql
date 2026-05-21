/*
  Warnings:

  - A unique constraint covering the columns `[anonymityCode]` on the table `attendance_records` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `attendance_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance_records" ADD COLUMN     "anonymityCode" TEXT,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_anonymityCode_key" ON "attendance_records"("anonymityCode");
