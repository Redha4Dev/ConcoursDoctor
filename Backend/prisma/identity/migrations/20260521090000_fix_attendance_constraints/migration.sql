-- Drop the one-record-per-candidate constraint. Attendance is recorded once
-- per candidate per subject.
DROP INDEX "attendance_records_candidateId_key";

-- Ensure each candidate has at most one attendance record per subject.
CREATE UNIQUE INDEX "attendance_records_candidateId_subjectId_key" ON "attendance_records"("candidateId", "subjectId");

-- Support room/subject summary and validation lookups.
CREATE INDEX "attendance_records_sessionRoomId_subjectId_idx" ON "attendance_records"("sessionRoomId", "subjectId");

-- Enforce that attendance subjects belong to real Subject rows.
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
