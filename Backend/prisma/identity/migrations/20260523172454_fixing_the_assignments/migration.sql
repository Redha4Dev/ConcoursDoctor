/*
  Warnings:

  - Added the required column `subjectId` to the `room_surveillant_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "room_surveillant_assignments" ADD COLUMN     "subjectId" TEXT NOT NULL;
