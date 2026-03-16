-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COORDINATOR', 'SURVEILLANT', 'CORRECTOR', 'JURY_MEMBER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'OPEN', 'ATTENDANCE_LOCKED', 'ANONYMIZED', 'CORRECTION_OPEN', 'DELIBERATION', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('REGISTERED', 'VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('CSV', 'EXCEL', 'API', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "phoneNumber" TEXT,

    CONSTRAINT "coordinator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveillant_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT,

    CONSTRAINT "surveillant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrector_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT,
    "academicGrade" TEXT,
    "institution" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "corrector_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jury_member_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicRank" TEXT,
    "institution" TEXT,

    CONSTRAINT "jury_member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT,

    CONSTRAINT "auditor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "payload" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctoral_formations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "doctoral_formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_staff" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "formation_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_sessions" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "availableSlots" INTEGER NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "examRoom" TEXT,
    "attendanceDeadline" TIMESTAMP(3),
    "correctionDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "maxGrade" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "minimumGrade" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "description" TEXT,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_configs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "discrepancyThreshold" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "configuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "configuredBy" TEXT NOT NULL,

    CONSTRAINT "grading_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "nationalId" TEXT,
    "degreeTitle" TEXT,
    "degreeInstitution" TEXT,
    "graduationYear" INTEGER,
    "status" "CandidateStatus" NOT NULL DEFAULT 'REGISTERED',
    "importBatchId" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "importedBy" TEXT NOT NULL,
    "source" "ImportSource" NOT NULL,
    "fileName" TEXT,
    "totalRecords" INTEGER NOT NULL,
    "validRecords" INTEGER NOT NULL,
    "invalidRecords" INTEGER NOT NULL,
    "validationErrors" JSONB,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "coordinator_profiles_userId_key" ON "coordinator_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "surveillant_profiles_userId_key" ON "surveillant_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "corrector_profiles_userId_key" ON "corrector_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "jury_member_profiles_userId_key" ON "jury_member_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auditor_profiles_userId_key" ON "auditor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctoral_formations_code_key" ON "doctoral_formations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "formation_staff_formationId_userId_role_key" ON "formation_staff"("formationId", "userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "grading_configs_sessionId_key" ON "grading_configs"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_sessionId_registrationNumber_key" ON "candidates"("sessionId", "registrationNumber");

-- AddForeignKey
ALTER TABLE "coordinator_profiles" ADD CONSTRAINT "coordinator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveillant_profiles" ADD CONSTRAINT "surveillant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrector_profiles" ADD CONSTRAINT "corrector_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_member_profiles" ADD CONSTRAINT "jury_member_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditor_profiles" ADD CONSTRAINT "auditor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_staff" ADD CONSTRAINT "formation_staff_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "doctoral_formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_staff" ADD CONSTRAINT "formation_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_sessions" ADD CONSTRAINT "competition_sessions_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "doctoral_formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_sessions" ADD CONSTRAINT "competition_sessions_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_configs" ADD CONSTRAINT "grading_configs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
