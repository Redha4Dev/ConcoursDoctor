-- Split global account roles from per-session staff functions.
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'COORDINATOR', 'STAFF');
CREATE TYPE "SessionFunction" AS ENUM ('SURVEILLANT', 'CORRECTOR', 'JURY_MEMBER', 'AUDITOR');

-- Preserve global administrators/coordinators; every other former global role
-- becomes a normal staff account.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE
    WHEN "role"::text = 'ADMIN' THEN 'ADMIN'
    WHEN "role"::text = 'COORDINATOR' THEN 'COORDINATOR'
    ELSE 'STAFF'
  END
)::"Role_new";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- SessionStaff.function now stores only contextual duties.
DELETE FROM "session_staff"
WHERE "function"::text NOT IN ('SURVEILLANT', 'CORRECTOR', 'JURY_MEMBER', 'AUDITOR');

ALTER TABLE "session_staff" ALTER COLUMN "function" TYPE "SessionFunction" USING "function"::text::"SessionFunction";

DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
