-- CreateTable
CREATE TABLE "exam_rooms" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_candidate_assignments" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "room_candidate_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_surveillant_assignments" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "room_surveillant_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_candidate_assignments_candidateId_key" ON "room_candidate_assignments"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "room_surveillant_assignments_roomId_userId_key" ON "room_surveillant_assignments"("roomId", "userId");

-- AddForeignKey
ALTER TABLE "exam_rooms" ADD CONSTRAINT "exam_rooms_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "competition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "exam_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_candidate_assignments" ADD CONSTRAINT "room_candidate_assignments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "exam_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_surveillant_assignments" ADD CONSTRAINT "room_surveillant_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
