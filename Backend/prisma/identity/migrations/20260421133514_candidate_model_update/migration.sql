/*
  Warnings:

  - You are about to drop the column `degreeTitle` on the `candidates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "degreeTitle",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "bachelorAverage" DOUBLE PRECISION,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "cursusType" TEXT,
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "degreeSpeciality" TEXT,
ADD COLUMN     "fieldOfStudy" TEXT,
ADD COLUMN     "firstNameAr" TEXT,
ADD COLUMN     "lastNameAr" TEXT,
ADD COLUMN     "masterAverage" DOUBLE PRECISION,
ADD COLUMN     "masterClassCategory" TEXT;
