-- CreateEnum
CREATE TYPE "CopyStatus" AS ENUM ('PENDING', 'FIRST_DONE', 'SECOND_DONE', 'DISCREPANCY', 'THIRD_DONE', 'VALIDATED');

-- CreateEnum
CREATE TYPE "ResolutionRule" AS ENUM ('MEAN_TWO', 'MEAN_CLOSEST');

-- CreateTable
CREATE TABLE "exam_copies" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "candidateId" TEXT,
    "anonymousCode" TEXT,
    "status" "CopyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction_grades" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "correctorId" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "round" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "correction_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_grades" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "finalGrade" DOUBLE PRECISION NOT NULL,
    "appliedRule" "ResolutionRule" NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_copies_qrCode_key" ON "exam_copies"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "correction_grades_copyId_correctorId_round_key" ON "correction_grades"("copyId", "correctorId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "final_grades_copyId_key" ON "final_grades"("copyId");

-- AddForeignKey
ALTER TABLE "correction_grades" ADD CONSTRAINT "correction_grades_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "exam_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "exam_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
