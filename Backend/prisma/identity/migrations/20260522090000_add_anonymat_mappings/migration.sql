-- CreateTable
CREATE TABLE "anonymat_mappings" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "anonymousCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymat_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anonymat_mappings_anonymousCode_key" ON "anonymat_mappings"("anonymousCode");

-- CreateIndex
CREATE UNIQUE INDEX "anonymat_mappings_candidateId_subjectId_key" ON "anonymat_mappings"("candidateId", "subjectId");

-- AddForeignKey
ALTER TABLE "anonymat_mappings" ADD CONSTRAINT "anonymat_mappings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anonymat_mappings" ADD CONSTRAINT "anonymat_mappings_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anonymat_mappings" ADD CONSTRAINT "anonymat_mappings_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
