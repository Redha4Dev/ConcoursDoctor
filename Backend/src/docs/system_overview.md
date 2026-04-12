# System Overview Report: Doctoral Formation Management Backend

This document outlines the architecture, API topography, and integration logic for the Backend Application serving the "Concours Doctorat" management system.

---

## 🏗️ 1. Core Purpose
The backend serves as the core orchestration layer for academic and doctoral competition management. It provides a robust engine for administrating **Doctoral Formations**, scheduling **Competition Sessions**, safely importing **Candidates** in bulk, and managing **Grading/Subjects** parameters. 

Furthermore, the application abstracts complex identity management by segregating administrative staff, pedagogical coordinators, correctors, and surveillance personnel into distinct RBAC-governed profiles.

---

## 🗺️ 2. API Map
Base URL Path: `/api/v1`

### 🛡️ Auth (`/auth`)
* `POST /login` - Authenticates user and sets JWT cookie using `express-rate-limit`.
* `POST /logout` - Clears authentication cookies dynamically. 
* `GET /me` - Fetches authenticated user profile and roles.
* `POST /change-password` - Updates authenticated user's password mapping.
* `POST /forgot-password` / `POST /reset-password` - Time-based tokenized password recovery mechanism.

### 🏛️ Users (`/users`)
*(Strictly restricted to Admin)*
* `POST /` - Provisions new organizational personnel and dispatches welcome emails.
* `GET /` / `GET /:id` - Paginates and retrieves detailed user/profile models.
* `PATCH /:id` - Mutates profile structures dynamically based on roles.
* `DELETE /:id` / `PATCH /:id/reactivate` - Soft-deletes/Reactivates user accounts safely.
* `POST /:id/resend-email` - Dispatches temporary operational passwords over SMTP.

### 🎓 Formations (`/formations`)
* `POST /` / `PATCH /:id` - Bootstraps and mutates Master doctoral formations.
* `GET /` / `GET /:id` / `GET /list` - Retrieves and aggregates formation metrics and children sessions.
* `POST /:id/staff` / `DELETE /:id/staff/:userId` - Manages role assignments linking Users internally to specific formations.

### 📅 Competition Sessions (`/sessions`)
* `POST /` / `PATCH /:id` - Configures high-level Session dates, logic, and closures.
* `GET /` / `GET /:id` - Retrieves individual session logistics.
* `GET /:id/staff` - Inherits and displays staff dynamically originating from the underlying formation.
* **Subjects Management**: `POST /:id/subjects`, `PATCH /:id/subjects/:subjectId`, `DELETE /:id/subjects/:subjectId` - Operates coefficient mappings bound to a session. 
* **Grading Params**: `GET /:id/grading-config`, `PATCH /:id/grading-config` - Configures dynamic thresholds determining test anomalies (e.g. `discrepancyThreshold`).

### 👥 Candidates (`/candidates`)
* `POST /:sessionId/import` - Consumes massive chunks of raw academic applicant data (`CSV / Excel`) and streams it flawlessly into registration pools.
* `GET /:sessionId` / `GET /:sessionId/:id` - Sorts, aggregates, and retrieves active applicants.
* `GET /:sessionId/stats` - Tallies session metrics (total vs valid vs invalid configurations).
* `GET /:sessionId/batches` - Retrieves historical logs mapping exactly when and who executed bulk uploads.
* `DELETE /:sessionId/:id` - De-registers applicants individually manually.

---

## 💾 3. Data Architecture (Prisma ORM)
The backend employs a distinct **Dual-Database** scaling strategy via PostgreSQL:

### A. Identity Database (`identityDb`) 
Holds application operational models and structural data.
* **`User`**: Base entity holding credentials, roles, and status. It is dynamically sub-typed through One-to-One relational profiles (`CoordinatorProfile`, `CorrectorProfile`, `JuryMemberProfile`, `SurveillantProfile`, `AuditorProfile`). 
* **`CompetitionSession`**: The foundational pivot entity binding Formations, Subjects, GradingConfigs, Candidates together while tracking states via `SessionStatus` variants (`DRAFT`, `OPEN`, `LOCKED`, etc.).
* **`ImportBatch`**: Operational telemetry tracking files, user dispatchers, and candidate batch errors for Excel payloads.
* **`Candidate`**: Applicant registrations uniquely bounded mathematically onto specific sessions utilizing national IDs and registration numbers. 

### B. Correction Database (`correctionDb`)
An isolated database theoretically engineered for blind grading and correction separation, ensuring identity mechanisms are entirely abstracted during deliberation pipelines. Currently implementing normalized `Correction` artifacts.

---

## 🔒 4. Middleware & Security
* **Authentication (`authMiddleware.ts`)**: Adopts a stateless tokenized structure validating JWT payloads directly against the local `identityDb`, securing active session verifications through strict typing.
* **RBAC Engine (`rbac.middleware.ts`)**: Evaluates `req.user.role` securely halting executions if system roles strictly miss authorization (e.g., `restrictTo("ADMIN", "COORDINATOR")`).
* **Input Validation (`validate.middleware.ts`)**: Maps endpoint payloads dynamically against rigid `Zod` Object Schemas enforcing exact datatypes safely before executions.
* **Global Error Handling (`errorHandler.ts`)**: Resolutely halts crash spirals, capturing mapped `AppError` constructions scaling out graceful JSON payloads while isolating stack traces based on `NODE_ENV`.
* **Logging Services**: Built on the absolute high-performance `Pino` core orchestrating async writing mapped to `morgan` request formats, efficiently handling disk IO logs.
* **Rate Limiting**: Implementation protects identity access edges utilizing internal `express-rate-limit` window aggregations.

---

## 🧰 5. External Integrations & Dependencies
* **Data Pipelines**:
  * `multer` buffers active File payloads into RAM logic streams ensuring file injection purity.
  * `csv-parser` converts byte streams into structured dictionary items gracefully.
  * `xlsx` (`SheetJS`) parses heavy Excel spreadsheets isolating structural dependencies effortlessly. 
* **Database Driver System**: Utilizing `@prisma/adapter-neon` and `@neondatabase/serverless` mapping the Prisma queries natively onto Serverless Neon PostgreSQL pools utilizing HTTP transport protocols dynamically.
* **Mailer Services**: Uses a highly decoupled infrastructure capable of dynamically switching between `Resend`, `Brevo`, and `SendGrid` instances wrapped cleanly around an abstracted `mailer.ts` util dispatching heavily templated structural HTML strings natively.
