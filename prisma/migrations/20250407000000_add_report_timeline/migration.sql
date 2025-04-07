-- CreateTable
CREATE TABLE "ReportTimeline" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "previousStatus" "Status",
    "newStatus" "Status" NOT NULL,
    "changedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportTimeline_reportId_idx" ON "ReportTimeline"("reportId");

-- AddForeignKey
ALTER TABLE "ReportTimeline" ADD CONSTRAINT "ReportTimeline_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTimeline" ADD CONSTRAINT "ReportTimeline_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
