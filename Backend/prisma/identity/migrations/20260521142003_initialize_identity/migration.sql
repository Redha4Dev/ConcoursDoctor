-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COORDINATOR', 'STAFF');

-- CreateEnum
CREATE TYPE "SessionFunction" AS ENUM ('SURVEILLANT', 'CORRECTOR', 'JURY_MEMBER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'OPEN', 'ATTENDANCE_LOCKED', 'ANONYMIZED', 'CORRECTION_OPEN', 'DELIBERATION', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('REGISTERED', 'VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('CSV', 'EXCEL', 'API', 'MANUAL');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('QR_SCAN', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "phoneNumber" TEXT,
    "institution" TEXT,
    "academicGrade" TEXT,
    "specialization" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
    "coordinatorId" TEXT NOT NULL,

    CONSTRAINT "doctoral_formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_specializations" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "formation_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_sessions" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "examDate" TIMESTAMP(3) NOT NULL,
    "resultsDeadline" TIMESTAMP(3),
    "attendanceDeadline" TIMESTAMP(3),
    "correctionDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_specializations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "formationSpecializationId" TEXT NOT NULL,
    "availableSlots" INTEGER NOT NULL,

    CONSTRAINT "session_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_staff" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "function" "SessionFunction" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "session_staff_pkey" PRIMARY KEY ("id")
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
    "specializationId" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameAr" TEXT,
    "lastNameAr" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "dateOfBirth" TEXT,
    "birthPlace" TEXT,
    "nationalId" TEXT,
    "degreeInstitution" TEXT,
    "degreeSpeciality" TEXT,
    "fieldOfStudy" TEXT,
    "cursusType" TEXT,
    "graduationYear" INTEGER,
    "masterClassCategory" TEXT,
    "masterAverage" DOUBLE PRECISION,
    "bachelorAverage" DOUBLE PRECISION,
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

-- CreateTable
CREATE TABLE "exam_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "exam_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_rooms" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,
    "usedCapacity" INTEGER NOT NULL DEFAULT 0,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,

    CONSTRAINT "session_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_candidate_assignments" (
    "id" TEXT NOT NULL,
    "sessionRoomId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "room_candidate_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_surveillant_assignments" (
    "id" TEXT NOT NULL,
    "sessionRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "room_surveillant_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "sessionRoomId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "anonymityCode" TEXT,
    "recordedBy" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "method" "AttendanceMethod" NOT NULL DEFAULT 'QR_SCAN',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctoral_formations_code_key" ON "doctoral_formations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "formation_specializations_formationId_code_key" ON "formation_specializations"("formationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "session_specializations_sessionId_formationSpecializationId_key" ON "session_specializations"("sessionId", "formationSpecializationId");

-- CreateIndex
CREATE UNIQUE INDEX "session_staff_sessionId_userId_function_key" ON "session_staff"("sessionId", "userId", "function");

-- CreateIndex
CREATE UNIQUE INDEX "grading_configs_sessionId_key" ON "grading_configs"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_sessionId_registrationNumber_key" ON "candidates"("sessionId", "registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "session_rooms_sessionId_roomId_key" ON "session_rooms"("sessionId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "room_candidate_assignments_candidateId_key" ON "room_candidate_assignments"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "room_surveillant_assignments_sessionRoomId_userId_key" ON "room_surveillant_assignments"("sessionRoomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_anonymityCode_key" ON "attendance_records"("anonymityCode");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_candidateId_subjectId_key" ON "attendance_records"("candidateId", "subjectId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctoral_formations" ADD CONSTRAINT "doctoral_formations_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_specializations" ADD CONSTRAINT "formation_specializations_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "doctoral_formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_sessions" ADD CONSTRAINT "competition_sessions_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "doctoral_formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_specializations" ADD CONSTRAINT "session_specializations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_specializations" ADD CONSTRAINT "session_specializations_formationSpecializationId_fkey" FOREIGN KEY ("formationSpecializationId") REFERENCES "formation_specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_staff" ADD CONSTRAINT "session_staff_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_staff" ADD CONSTRAINT "session_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_configs" ADD CONSTRAINT "grading_configs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "session_specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "exam_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_rooms" ADD CONSTRAINT "session_rooms_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "session_specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_sessionRoomId_fkey" FOREIGN KEY ("sessionRoomId") REFERENCES "session_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_sessionRoomId_fkey" FOREIGN KEY ("sessionRoomId") REFERENCES "session_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_sessionRoomId_fkey" FOREIGN KEY ("sessionRoomId") REFERENCES "session_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
