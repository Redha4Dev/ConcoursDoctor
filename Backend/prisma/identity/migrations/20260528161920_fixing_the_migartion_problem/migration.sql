/*
  Warnings:

  - Added the required column `waitingListSlots` to the `session_specializations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SessionFunction" ADD VALUE 'ANONYMAT_COMITE';

-- AlterTable
ALTER TABLE "session_specializations" ADD COLUMN     "waitingListSlots" INTEGER NOT NULL;
