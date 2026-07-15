-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "task_status_histories" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_status_histories_taskId_createdAt_idx" ON "task_status_histories"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_status_histories_toStatus_createdAt_idx" ON "task_status_histories"("toStatus", "createdAt");

-- CreateIndex
CREATE INDEX "task_status_histories_changedById_createdAt_idx" ON "task_status_histories"("changedById", "createdAt");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_completedAt_idx" ON "tasks"("completedAt");

-- AddForeignKey
ALTER TABLE "task_status_histories" ADD CONSTRAINT "task_status_histories_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
